import request from "supertest";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import app from "../src/app.js";
import User from "../src/models/user.js";
import BlackList from "../src/models/blackList.js";
import blackList from "../src/utils/blacklist.js";
import encode from "../src/utils/encodeToken.js";
import { emailService } from "../src/utils/EmailService.js";
import { isAdmin, isNotAdmin } from "../src/middlewares/isAdmin.js";
import { mockSave } from "./helpers";

// EmailService imports nodemailer as a namespace, so spying on the CJS export
// would not reach it (and would let the test open a real SMTP connection).
jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));

describe("encodeToken", () => {
  test("signs with the session secret and the configured expiry by default", () => {
    const decoded = jwt.verify(encode({ _id: "abc" }), "test-jwt-secret");
    expect(decoded._id).toBe("abc");
    expect(decoded.exp - decoded.iat).toBe(2 * 60 * 60);
  });

  test("accepts a custom expiry and the verification secret", () => {
    const token = encode({ _id: "abc" }, "5m", true);
    expect(() => jwt.verify(token, "test-jwt-secret")).toThrow();
    const decoded = jwt.verify(token, "test-verify-secret");
    expect(decoded.exp - decoded.iat).toBe(5 * 60);
  });
});

describe("blackList()", () => {
  test("stores a token that has not expired yet, using its own exp", async () => {
    const save = mockSave(BlackList);
    const token = encode({ _id: "x" }, "1h");
    await blackList(token);
    expect(save).toHaveBeenCalledTimes(1);
    const doc = save.mock.instances[0];
    expect(doc.token).toBe(token);
    expect(doc.expAt.getTime()).toBe(jwt.decode(token).exp * 1000);
  });

  test("uses an explicit expiry when given", async () => {
    const save = mockSave(BlackList);
    const exp = Math.floor(Date.now() / 1000) + 60;
    await blackList("opaque-token", exp);
    expect(save.mock.instances[0].expAt.getTime()).toBe(exp * 1000);
  });

  test("skips tokens that already expired", async () => {
    const save = mockSave(BlackList);
    await blackList("opaque-token", Math.floor(Date.now() / 1000) - 60);
    expect(save).not.toHaveBeenCalled();
  });

  test("swallows errors (undecodable token, failed save)", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(blackList("not-a-jwt")).resolves.toBeUndefined();
    jest.spyOn(BlackList.prototype, "save").mockRejectedValue(new Error("db"));
    await expect(blackList(encode({ _id: "x" }))).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(2);
  });
});

describe("emailService()", () => {
  test("sends through a gmail transport and logs the message id", async () => {
    const sendMail = jest.fn((opts, cb) => cb(null, { messageId: "<id>" }));
    nodemailer.createTransport.mockReturnValue({ sendMail });
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    await emailService("to@example.com", "Subject", "<p>hi</p>");

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.gmail.com", port: 587, auth: { user: "sender@example.com", pass: "sender-password" } })
    );
    expect(sendMail).toHaveBeenCalledWith(
      { from: '"JimFolio" sender@example.com', to: "to@example.com", subject: "Subject", html: "<p>hi</p>" },
      expect.any(Function)
    );
    expect(log).toHaveBeenCalledWith("Email sent: %s", "<id>");
  });

  test("logs instead of throwing when sending fails", async () => {
    nodemailer.createTransport.mockReturnValue({ sendMail: (opts, cb) => cb(new Error("smtp down")) });
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    await expect(emailService("to@example.com", "S", "h")).resolves.toBeUndefined();
    expect(log.mock.calls[0][0]).toMatch(/could not be sent to to@example.com/);
  });
});

describe("isAdmin / isNotAdmin middlewares", () => {
  const res = () => {
    const r = {};
    r.status = jest.fn(() => r);
    r.json = jest.fn(() => r);
    return r;
  };

  test("isAdmin passes admins and blocks users", async () => {
    const next = jest.fn();
    await isAdmin({ user: { title: "admin" } }, res(), next);
    expect(next).toHaveBeenCalled();
    const r = res();
    await isAdmin({ user: { title: "user" } }, r, jest.fn());
    expect(r.status).toHaveBeenCalledWith(403);
  });

  test("isNotAdmin passes users and blocks admins", async () => {
    const next = jest.fn();
    await isNotAdmin({ user: { title: "user" } }, res(), next);
    expect(next).toHaveBeenCalled();
    const r = res();
    await isNotAdmin({ user: { title: "admin" } }, r, jest.fn());
    expect(r.status).toHaveBeenCalledWith(403);
  });

  test("both answer 500 when there is no user on the request", async () => {
    const r1 = res();
    await isAdmin({}, r1, jest.fn());
    expect(r1.status).toHaveBeenCalledWith(500);
    const r2 = res();
    await isNotAdmin({}, r2, jest.fn());
    expect(r2.status).toHaveBeenCalledWith(500);
  });
});

describe("rate limiter (real, not mocked here)", () => {
  test("allows three requests per hour and then answers 429", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const body = { email: "who@example.com" };
    for (let i = 0; i < 3; i += 1) {
      expect((await request(app).post("/users/request-otp").send(body)).status).toBe(200);
    }
    const blocked = await request(app).post("/users/request-otp").send(body);
    expect(blocked.status).toBe(429);
    expect(blocked.text).toMatch(/Too many requests/);
  });
});
