import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import User from "../src/models/user.js";
import BlackList from "../src/models/blackList.js";
import encode from "../src/utils/encodeToken.js";
import { authAs, makeUser, mockSave } from "./helpers";

describe("GET /", () => {
  test("health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Welcome to api" });
  });
});

describe("unknown routes", () => {
  test("404 with the requested url", async () => {
    const res = await request(app).post("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("/does-not-exist is not found!");
  });

  test("swagger docs are served", async () => {
    const res = await request(app).get("/api/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger");
  });
});

describe("POST /auth/login", () => {
  const credentials = { email: "jimmy@example.com", password: "secret1" };

  test("400 when the body fails validation", async () => {
    const res = await request(app).post("/auth/login").send({ email: "jimmy@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("password");
  });

  test("401 when the user does not exist", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const res = await request(app).post("/auth/login").send(credentials);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "User not found" });
  });

  test("401 when the password is wrong", async () => {
    const user = makeUser({ password: await bcrypt.hash("other", 4) });
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    const res = await request(app).post("/auth/login").send(credentials);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Incorrect password or email" });
  });

  test("200 with a token, and the previous session token is blacklisted", async () => {
    const user = makeUser({ password: await bcrypt.hash(credentials.password, 4) });
    user.currentToken = encode({ _id: user._id });
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    const saveUser = mockSave(User);
    const saveBlackList = mockSave(BlackList);

    const res = await request(app).post("/auth/login").send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.LoggedIn).toBe("Success");
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe(credentials.email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.currentToken).toBeUndefined();
    expect(saveUser).toHaveBeenCalledTimes(1);
    expect(saveBlackList).toHaveBeenCalledTimes(1);
    expect(user.currentToken).toBe(res.body.token);
  });

  test("401 'Server Error!' when the lookup throws", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("boom"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).post("/auth/login").send(credentials);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Server Error!" });
  });
});

describe("POST /logout (jwt strategy)", () => {
  test("401 without a token", async () => {
    const res = await request(app).post("/logout");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No auth token");
  });

  test("401 with a malformed token", async () => {
    const res = await request(app).post("/logout").set("Authorization", "Bearer not-a-jwt");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("jwt malformed");
  });

  test("401 with a token signed by another secret", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ _id: "x" }, "wrong-secret");
    const res = await request(app).post("/logout").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("invalid signature");
  });

  test("401 when the token was blacklisted", async () => {
    const user = makeUser();
    const auth = authAs(user);
    BlackList.findOne.mockResolvedValue({ token: "x" });
    const res = await request(app).post("/logout").set("Authorization", auth);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Please login!" });
  });

  test("401 when the user no longer exists", async () => {
    const user = makeUser();
    const auth = authAs(user);
    User.findById.mockResolvedValue(null);
    const res = await request(app).post("/logout").set("Authorization", auth);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "User not found" });
  });

  test("500 when the strategy throws", async () => {
    const user = makeUser();
    const auth = authAs(user);
    BlackList.findOne.mockRejectedValue(new Error("db down"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).post("/logout").set("Authorization", auth);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Server Error!" });
  });

  test("200 clears the session token and blacklists the jwt", async () => {
    const user = makeUser({ currentToken: "abc" });
    const auth = authAs(user);
    const saveUser = mockSave(User);
    const saveBlackList = mockSave(BlackList);

    const res = await request(app).post("/logout").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "logged Out!" });
    expect(user.currentToken).toBeNull();
    expect(saveUser).toHaveBeenCalledTimes(1);
    expect(saveBlackList).toHaveBeenCalledTimes(1);
    expect(saveBlackList.mock.instances[0].token).toBe(auth.replace("Bearer ", ""));
  });

  test("500 when persisting the logout fails", async () => {
    const user = makeUser();
    const auth = authAs(user);
    mockSave(BlackList);
    jest.spyOn(User.prototype, "save").mockImplementation(() => {
      throw new Error("write failed");
    });
    const res = await request(app).post("/logout").set("Authorization", auth);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/logout Failed/);
  });
});
