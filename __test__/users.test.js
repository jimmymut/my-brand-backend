import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import User from "../src/models/user.js";
import Token from "../src/models/token.js";
import BlackList from "../src/models/blackList.js";
import { oAuth2Client } from "../src/config";
import { emailService } from "../src/utils/EmailService.js";
import encode from "../src/utils/encodeToken.js";
import { authAs, makeAdmin, makeUser, mockSave, oid, query } from "./helpers";

jest.mock("../src/utils/EmailService.js", () => ({ emailService: jest.fn() }));
jest.mock("../src/middlewares/rateLimiter.js", () => ({
  limitThreeRequestsInOneHour: (req, res, next) => next(),
}));

const FRONTEND = "http://frontend.test";
const makeToken = (overrides = {}) =>
  new Token({
    userId: oid(),
    type: "jwt",
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  });

describe("GET /users (admin list of non-admin users)", () => {
  test("401 without a token", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
  });

  test("403 for a non-admin", async () => {
    const auth = authAs(makeUser());
    const res = await request(app).get("/users").set("Authorization", auth);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Admins only are allowed" });
  });

  test("200 with the users", async () => {
    const auth = authAs(makeAdmin());
    const find = jest.spyOn(User, "find").mockResolvedValue([makeUser()]);
    const res = await request(app).get("/users").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(find).toHaveBeenCalledWith({ title: "user" });
  });

  test("500 on a database error", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(User, "find").mockRejectedValue(new Error("db"));
    const res = await request(app).get("/users").set("Authorization", auth);
    expect(res.status).toBe(500);
  });
});

describe("GET /users/users (count)", () => {
  test("200 with the count", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(User, "countDocuments").mockResolvedValue(7);
    const res = await request(app).get("/users/users").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ numNotAdmin: 7 });
  });

  test("500 on a database error", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(User, "countDocuments").mockRejectedValue(new Error("db"));
    const res = await request(app).get("/users/users").set("Authorization", auth);
    expect(res.status).toBe(500);
  });
});

describe("GET /users/dashboard and /users/profile", () => {
  test("dashboard confirms the user", async () => {
    const auth = authAs(makeUser());
    const res = await request(app).get("/users/dashboard").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toBe("Is a user");
  });

  test("profile strips sensitive fields", async () => {
    const user = makeUser({ password: "hash", currentToken: "tkn" });
    const auth = authAs(user);
    const res = await request(app).get("/users/profile").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
    expect(res.body.password).toBeUndefined();
    expect(res.body.currentToken).toBeUndefined();
    expect(res.body.deleteAt).toBeUndefined();
  });
});

describe("POST /users (sign up)", () => {
  const body = {
    firstName: "Dan",
    lastName: "David",
    email: "dan@example.com",
    password: "jimmy1",
    comfirmPassword: "jimmy1",
  };

  test("400 when validation fails", async () => {
    const { firstName, ...noName } = body;
    let res = await request(app).post("/users").send(noName);
    expect(res.status).toBe(400);
    res = await request(app).post("/users").send({ ...body, comfirmPassword: "nope1" });
    expect(res.status).toBe(400);
  });

  test("400 when the email is already registered", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(makeUser());
    const res = await request(app).post("/users").send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already/);
  });

  test("200 creates the user, a verify link token, an OTP and emails them", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const saveUser = mockSave(User);
    const saveToken = mockSave(Token);
    const deleteMany = jest.spyOn(Token, "deleteMany").mockResolvedValue({});

    const res = await request(app).post("/users").send(body);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(body.email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.currentToken).toBeUndefined();
    expect(jwt.verify(res.body.token, "test-jwt-secret")._id).toBe(res.body.user._id);
    expect(saveUser).toHaveBeenCalledTimes(1);
    expect(saveUser.mock.instances[0].password).not.toBe(body.password);
    // one "jwt" link token + one "otp" token
    expect(saveToken).toHaveBeenCalledTimes(2);
    expect(saveToken.mock.instances.map((t) => t.type).sort()).toEqual(["jwt", "otp"]);
    expect(deleteMany).toHaveBeenCalledWith({ userId: expect.anything(), type: "otp" });
    expect(emailService).toHaveBeenCalledTimes(1);
    const [to, subject, html] = emailService.mock.calls[0];
    expect(to).toBe(body.email);
    expect(subject).toBe("Verify Email");
    expect(html).toContain("http://api.test/users/verify-email?tkn=");
  });

  test("500 when saving fails", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("db"));
    const res = await request(app).post("/users").send(body);
    expect(res.status).toBe(500);
    expect(emailService).not.toHaveBeenCalled();
  });
});

describe("POST /users/auth/google", () => {
  const payload = {
    sub: "google-sub",
    email: "g@example.com",
    picture: "http://pic",
    given_name: "Goo",
    family_name: "Gle",
  };
  const mockGoogle = () => {
    jest.spyOn(oAuth2Client, "getToken").mockResolvedValue({ tokens: { id_token: "id" } });
    jest.spyOn(oAuth2Client, "verifyIdToken").mockResolvedValue({ payload });
  };

  test("400 without a code", async () => {
    const res = await request(app).post("/users/auth/google").send({});
    expect(res.status).toBe(400);
  });

  test("200 links google to an existing account and blacklists its old token", async () => {
    mockGoogle();
    const user = makeUser({ email: payload.email, currentToken: encode({ _id: "x" }) });
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    mockSave(User);
    const saveBlackList = mockSave(BlackList);

    const res = await request(app).post("/users/auth/google").send({ code: "abc" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login success");
    expect(user.googleId).toBe(payload.sub);
    expect(user.proPic).toBe(payload.picture);
    expect(user.verifiedAt).toBeInstanceOf(Date);
    expect(user.deleteAt).toBeNull();
    expect(user.currentToken).toBe(res.body.token);
    expect(saveBlackList).toHaveBeenCalledTimes(1);
    expect(oAuth2Client.verifyIdToken).toHaveBeenCalledWith({ idToken: "id", audience: "google-client-id" });
  });

  test("200 registers a brand new google user", async () => {
    mockGoogle();
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const save = mockSave(User);
    const res = await request(app).post("/users/auth/google").send({ code: "abc" });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe("Goo");
    expect(res.body.user.googleId).toBe("google-sub");
    expect(res.body.user.currentToken).toBeUndefined();
    expect(jwt.verify(res.body.token, "test-jwt-secret")._id).toBe(res.body.user._id);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test("500 when google rejects the code", async () => {
    jest.spyOn(oAuth2Client, "getToken").mockRejectedValue(new Error("invalid_grant"));
    const res = await request(app).post("/users/auth/google").send({ code: "abc" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "invalid_grant" });
  });
});

describe("PATCH /users/change-password", () => {
  let user;
  let auth;
  beforeEach(async () => {
    user = makeUser({ password: await bcrypt.hash("oldpass", 4), currentToken: encode({ _id: "x" }) });
    auth = authAs(user);
  });

  test("401 without a token", async () => {
    const res = await request(app).patch("/users/change-password").send({ old: "oldpass", newPwd: "newpass" });
    expect(res.status).toBe(401);
  });

  test("400 when validation fails", async () => {
    const res = await request(app).patch("/users/change-password").set("Authorization", auth).send({ old: "oldpass" });
    expect(res.status).toBe(400);
  });

  test("401 when the old password is wrong", async () => {
    const res = await request(app)
      .patch("/users/change-password")
      .set("Authorization", auth)
      .send({ old: "wrongpass", newPwd: "newpass" });
    expect(res.status).toBe(401);
  });

  test("403 when the new password equals the current one", async () => {
    const res = await request(app)
      .patch("/users/change-password")
      .set("Authorization", auth)
      .send({ old: "oldpass", newPwd: "oldpass" });
    expect(res.status).toBe(403);
  });

  test("200 updates the hash, blacklists the session and emails the user", async () => {
    const updateOne = jest.spyOn(User, "updateOne").mockResolvedValue({});
    const saveBlackList = mockSave(BlackList);
    const res = await request(app)
      .patch("/users/change-password")
      .set("Authorization", auth)
      .send({ old: "oldpass", newPwd: "newpass" });
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledTimes(1);
    const [filter, update] = updateOne.mock.calls[0];
    expect(String(filter._id)).toBe(String(user._id));
    expect(update.$set.currentToken).toBeNull();
    expect(await bcrypt.compare("newpass", update.$set.password)).toBe(true);
    expect(saveBlackList).toHaveBeenCalledTimes(1);
    expect(emailService).toHaveBeenCalledWith(user.email, "Password changed", expect.any(String));
  });

  test("500 when the update fails", async () => {
    jest.spyOn(User, "updateOne").mockRejectedValue(new Error("db"));
    const res = await request(app)
      .patch("/users/change-password")
      .set("Authorization", auth)
      .send({ old: "oldpass", newPwd: "newpass" });
    expect(res.status).toBe(500);
  });
});

describe("GET /users/verify-email", () => {
  const location = (res) => decodeURIComponent(res.headers.location);
  const verifyLink = (tokenDoc) => `/users/verify-email?tkn=${encode({ _id: tokenDoc._id }, "30m", true)}`;

  test("redirects with an error when there is no token", async () => {
    const res = await request(app).get("/users/verify-email");
    expect(res.status).toBe(302);
    expect(location(res)).toBe(`${FRONTEND}?verify_error=No auth token`);
  });

  test("redirects with 'Link expired!' when the token was blacklisted", async () => {
    jest.spyOn(BlackList, "findOne").mockResolvedValue({});
    const res = await request(app).get(verifyLink(makeToken()));
    expect(location(res)).toBe(`${FRONTEND}?verify_error=Link expired!`);
  });

  test("redirects when the verification token no longer exists", async () => {
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockResolvedValue(null);
    const res = await request(app).get(verifyLink(makeToken()));
    expect(location(res)).toBe(`${FRONTEND}?verify_error=Verification link not found or has expired`);
  });

  test("redirects with 'Server Error!' when the strategy throws", async () => {
    jest.spyOn(BlackList, "findOne").mockRejectedValue(new Error("db"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).get(verifyLink(makeToken()));
    expect(location(res)).toBe(`${FRONTEND}?verify_error=Server Error!`);
  });

  test("redirects when the account was deleted", async () => {
    const token = makeToken();
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockResolvedValue(token);
    jest.spyOn(User, "findById").mockResolvedValue(null);
    const res = await request(app).get(verifyLink(token));
    expect(location(res)).toMatch(/verify_error=Account not found/);
  });

  test("redirects when the email is already verified", async () => {
    const token = makeToken();
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockResolvedValue(token);
    jest.spyOn(User, "findById").mockResolvedValue(makeUser({ verifiedAt: new Date() }));
    const res = await request(app).get(verifyLink(token));
    expect(location(res)).toBe(`${FRONTEND}?verify_error=Email already verified!`);
  });

  test("verifies the user, deletes the token and blacklists the link", async () => {
    const token = makeToken();
    const user = makeUser();
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockResolvedValue(token);
    jest.spyOn(User, "findById").mockResolvedValue(user);
    mockSave(User);
    const saveBlackList = mockSave(BlackList);
    const deleteOne = jest.spyOn(Token, "deleteOne").mockResolvedValue({});

    const res = await request(app).get(verifyLink(token));

    expect(location(res)).toBe(`${FRONTEND}?verify_success=Email verified successfully!`);
    expect(user.verifiedAt).toBeInstanceOf(Date);
    expect(user.deleteAt).toBeNull();
    expect(deleteOne).toHaveBeenCalledWith({ _id: token._id });
    expect(saveBlackList).toHaveBeenCalledTimes(1);
  });

  test("redirects with the error message when saving fails", async () => {
    const token = makeToken();
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockResolvedValue(token);
    jest.spyOn(User, "findById").mockResolvedValue(makeUser());
    jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("write failed"));
    const res = await request(app).get(verifyLink(token));
    expect(location(res)).toBe(`${FRONTEND}?verify_error=write failed`);
  });
});

describe("GET /users/resend-verification", () => {
  test("400 when already verified", async () => {
    const auth = authAs(makeUser({ verifiedAt: new Date() }));
    const res = await request(app).get("/users/resend-verification").set("Authorization", auth);
    expect(res.status).toBe(400);
  });

  test("200 issues a new link token and OTP and sends the email", async () => {
    const user = makeUser();
    const auth = authAs(user);
    const deleteMany = jest.spyOn(Token, "deleteMany").mockResolvedValue({});
    const saveToken = mockSave(Token);
    const res = await request(app).get("/users/resend-verification").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(deleteMany).toHaveBeenCalledWith({ userId: user._id, type: "jwt" });
    expect(deleteMany).toHaveBeenCalledWith({ userId: user._id, type: "otp" });
    expect(saveToken).toHaveBeenCalledTimes(2);
    expect(emailService).toHaveBeenCalledWith(user.email, "Verify Email", expect.stringContaining("verify-email?tkn="));
  });

  test("500 when a query fails", async () => {
    const auth = authAs(makeUser());
    jest.spyOn(Token, "deleteMany").mockRejectedValue(new Error("db"));
    const res = await request(app).get("/users/resend-verification").set("Authorization", auth);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "db" });
  });
});

describe("POST /users/verify-otp", () => {
  test("400 when the code is malformed", async () => {
    const auth = authAs(makeUser());
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "12" });
    expect(res.status).toBe(400);
  });

  test("200 when already verified", async () => {
    const auth = authAs(makeUser({ verifiedAt: new Date(), password: "h" }));
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email already verified");
    expect(res.body.user.password).toBeUndefined();
  });

  test("400 when there is no pending code", async () => {
    const auth = authAs(makeUser());
    jest.spyOn(Token, "findOne").mockResolvedValue(null);
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/);
  });

  test("400 when the code is wrong", async () => {
    const auth = authAs(makeUser());
    jest.spyOn(Token, "findOne").mockResolvedValue({ token: await bcrypt.hash("654321", 4) });
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Incorrect/);
  });

  test("200 verifies the user and clears OTP tokens", async () => {
    const user = makeUser();
    const auth = authAs(user);
    jest.spyOn(Token, "findOne").mockResolvedValue({ token: await bcrypt.hash("123456", 4) });
    mockSave(User);
    const deleteMany = jest.spyOn(Token, "deleteMany").mockResolvedValue({});
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully");
    expect(user.verifiedAt).toBeInstanceOf(Date);
    expect(deleteMany).toHaveBeenCalledWith({ userId: user._id, type: "otp" });
  });

  test("500 when the lookup fails", async () => {
    const auth = authAs(makeUser());
    jest.spyOn(Token, "findOne").mockRejectedValue(new Error("db"));
    const res = await request(app).post("/users/verify-otp").set("Authorization", auth).send({ otp: "123456" });
    expect(res.status).toBe(500);
  });
});

describe("POST /users/request-otp", () => {
  test("400 without a valid email", async () => {
    const res = await request(app).post("/users/request-otp").send({ email: "nope" });
    expect(res.status).toBe(400);
  });

  test("200 without a token for an unknown email (no enumeration)", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const deleteMany = jest.spyOn(Token, "deleteMany");
    const res = await request(app).post("/users/request-otp").send({ email: "who@example.com" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "OTP has been sent to the email" });
    expect(deleteMany).not.toHaveBeenCalled();
    expect(emailService).not.toHaveBeenCalled();
  });

  test("200 stores a hashed OTP and returns a short-lived token", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    jest.spyOn(Token, "deleteMany").mockResolvedValue({});
    const saveToken = mockSave(Token);
    const res = await request(app).post("/users/request-otp").send({ email: user.email });
    expect(res.status).toBe(200);
    const tokenDoc = saveToken.mock.instances[0];
    expect(tokenDoc.type).toBe("otp");
    const html = emailService.mock.calls[0][2];
    const otp = html.match(/<b>(\d{6})<\/b>/)[1];
    expect(await bcrypt.compare(otp, tokenDoc.token)).toBe(true);
    const decoded = jwt.verify(res.body.token, "test-verify-secret");
    expect(decoded._id).toBe(String(tokenDoc._id));
    expect(decoded.exp - decoded.iat).toBe(5 * 60);
  });

  test("500 when saving the token fails", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(makeUser());
    jest.spyOn(Token, "deleteMany").mockResolvedValue({});
    jest.spyOn(Token.prototype, "save").mockRejectedValue(new Error("db"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app).post("/users/request-otp").send({ email: "a@example.com" });
    expect(res.status).toBe(500);
  });
});

describe("GET /users/:id", () => {
  test("400 for a malformed id", async () => {
    const res = await request(app).get("/users/not-an-id");
    expect(res.status).toBe(400);
  });

  test("404 when not found", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const res = await request(app).get(`/users/${oid()}`);
    expect(res.status).toBe(404);
  });

  test("200 with the user", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    const res = await request(app).get(`/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  test("500 on a database error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("db"));
    const res = await request(app).get(`/users/${oid()}`);
    expect(res.status).toBe(500);
  });
});

describe("PATCH /users/reset-password (otp-jwt strategy)", () => {
  const otpToken = (tokenId) => `Bearer ${encode({ _id: tokenId }, "5m", true)}`;
  const body = { otp: "123456", password: "brandnew" };

  test("401 without a token", async () => {
    const res = await request(app).patch("/users/reset-password").send(body);
    expect(res.status).toBe(401);
  });

  test("401 when the otp token is blacklisted", async () => {
    jest.spyOn(BlackList, "findOne").mockResolvedValue({});
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(oid())).send(body);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Otp expired" });
  });

  test("401 when the otp record is gone", async () => {
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockReturnValue(query(null));
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(oid())).send(body);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Otp not found or expired" });
  });

  test("500 when the strategy throws", async () => {
    jest.spyOn(BlackList, "findOne").mockRejectedValue(new Error("db"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(oid())).send(body);
    expect(res.status).toBe(500);
  });

  const setupOtp = async (user, otp = "123456") => {
    const tokenDoc = { _id: oid(), token: await bcrypt.hash(otp, 4), userId: user };
    jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
    jest.spyOn(Token, "findById").mockReturnValue(query(tokenDoc));
    return tokenDoc;
  };

  test("400 when validation fails", async () => {
    const tokenDoc = await setupOtp(makeUser());
    const res = await request(app)
      .patch("/users/reset-password")
      .set("Authorization", otpToken(tokenDoc._id))
      .send({ otp: "12", password: "brandnew" });
    expect(res.status).toBe(400);
  });

  test("400 when the otp is wrong", async () => {
    const tokenDoc = await setupOtp(makeUser(), "999999");
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(tokenDoc._id)).send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Invalid OTP" });
  });

  test("404 when the account is gone", async () => {
    const tokenDoc = await setupOtp(null);
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(tokenDoc._id)).send(body);
    expect(res.status).toBe(404);
  });

  test("200 sets the new password, blacklists tokens, deletes the otp and emails", async () => {
    const user = makeUser({ currentToken: encode({ _id: "x" }) });
    const tokenDoc = await setupOtp(user);
    mockSave(User);
    const saveBlackList = mockSave(BlackList);
    const deleteOne = jest.spyOn(Token, "deleteOne").mockResolvedValue({});

    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(tokenDoc._id)).send(body);

    expect(res.status).toBe(200);
    expect(await bcrypt.compare(body.password, user.password)).toBe(true);
    // the user's session token + the otp token itself
    expect(saveBlackList).toHaveBeenCalledTimes(2);
    expect(deleteOne).toHaveBeenCalledWith({ _id: tokenDoc._id });
    expect(emailService).toHaveBeenCalledWith(user.email, "Password changed", expect.any(String));
  });

  test("500 when saving fails", async () => {
    const tokenDoc = await setupOtp(makeUser());
    jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("db"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app).patch("/users/reset-password").set("Authorization", otpToken(tokenDoc._id)).send(body);
    expect(res.status).toBe(500);
  });
});

describe("PATCH /users/:id (change role)", () => {
  let admin;
  let auth;
  beforeEach(() => {
    admin = makeAdmin();
    auth = authAs(admin);
  });
  // Serve the admin to the jwt strategy, and `target` to the controller.
  const withTarget = (target) =>
    User.findById.mockImplementation(async (id) => {
      if (String(id) === String(admin._id)) return admin;
      if (target instanceof Error) throw target;
      return target;
    });

  test("401 / 403 for anonymous and non-admin callers", async () => {
    let res = await request(app).patch(`/users/${oid()}`).send({ title: "admin" });
    expect(res.status).toBe(401);
    res = await request(app).patch(`/users/${oid()}`).set("Authorization", authAs(makeUser())).send({ title: "admin" });
    expect(res.status).toBe(403);
  });

  test("400 for an invalid title", async () => {
    const res = await request(app).patch(`/users/${oid()}`).set("Authorization", auth).send({ title: "boss" });
    expect(res.status).toBe(400);
  });

  test("400 for a malformed id", async () => {
    const res = await request(app).patch("/users/bad-id").set("Authorization", auth).send({ title: "user" });
    expect(res.status).toBe(400);
  });

  test("403 when changing your own role", async () => {
    const res = await request(app).patch(`/users/${admin._id}`).set("Authorization", auth).send({ title: "user" });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You can not change your own role!");
  });

  test("404 when the target does not exist", async () => {
    withTarget(null);
    const res = await request(app).patch(`/users/${oid()}`).set("Authorization", auth).send({ title: "admin" });
    expect(res.status).toBe(404);
  });

  test("403 when demoting the last admin", async () => {
    const target = makeAdmin({ email: "other@example.com" });
    withTarget(target);
    jest.spyOn(User, "countDocuments").mockResolvedValue(1);
    const res = await request(app).patch(`/users/${target._id}`).set("Authorization", auth).send({ title: "user" });
    expect(res.status).toBe(403);
    expect(target.title).toBe("admin");
  });

  test("200 demotes an admin when another admin remains", async () => {
    const target = makeAdmin({ email: "other@example.com" });
    withTarget(target);
    jest.spyOn(User, "countDocuments").mockResolvedValue(2);
    const save = mockSave(User);
    const res = await request(app).patch(`/users/${target._id}`).set("Authorization", auth).send({ title: "user" });
    expect(res.status).toBe(200);
    expect(target.title).toBe("user");
    expect(save).toHaveBeenCalledTimes(1);
  });

  test("200 promotes a user", async () => {
    const target = makeUser();
    withTarget(target);
    const count = jest.spyOn(User, "countDocuments");
    mockSave(User);
    const res = await request(app).patch(`/users/${target._id}`).set("Authorization", auth).send({ title: "admin" });
    expect(res.status).toBe(200);
    expect(target.title).toBe("admin");
    expect(count).not.toHaveBeenCalled();
  });

  test("500 on a database error", async () => {
    withTarget(new Error("db"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app).patch(`/users/${oid()}`).set("Authorization", auth).send({ title: "admin" });
    expect(res.status).toBe(500);
  });
});
