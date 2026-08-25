import request from "supertest";
import app from "../src/app.js";
import Message from "../src/models/messagesModel.js";
import { emailService } from "../src/utils/EmailService.js";
import { authAs, makeAdmin, makeUser, mockSave, oid } from "./helpers";

jest.mock("../src/utils/EmailService.js", () => ({ emailService: jest.fn() }));

const makeMessage = (overrides = {}) =>
  new Message({ name: "Olivier", email: "o@example.com", phone: "+250777000000", message: "Hello there", ...overrides });

describe("/messages", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("admin-only endpoints reject anonymous and non-admin callers", async () => {
    expect((await request(app).get("/messages")).status).toBe(401);
    const userAuth = authAs(makeUser());
    expect((await request(app).get("/messages").set("Authorization", userAuth)).status).toBe(403);
    expect((await request(app).get(`/messages/${oid()}`).set("Authorization", userAuth)).status).toBe(403);
    expect((await request(app).delete(`/messages/${oid()}`).set("Authorization", userAuth)).status).toBe(403);
  });

  test("GET /messages lists messages, 500 on error", async () => {
    jest.spyOn(Message, "find").mockResolvedValueOnce([makeMessage()]);
    const ok = await request(app).get("/messages").set("Authorization", auth);
    expect(ok.status).toBe(200);
    expect(ok.body).toHaveLength(1);

    jest.spyOn(Message, "find").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get("/messages").set("Authorization", auth)).status).toBe(500);
  });

  test("GET /messages/messages counts messages, 500 on error", async () => {
    jest.spyOn(Message, "find").mockResolvedValueOnce([makeMessage(), makeMessage()]);
    const ok = await request(app).get("/messages/messages").set("Authorization", auth);
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({ messages: 2 });

    jest.spyOn(Message, "find").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get("/messages/messages").set("Authorization", auth)).status).toBe(500);
  });

  describe("POST /messages (contact form, public)", () => {
    const body = { contName: "Olivier Tuyisenge", contEmail: "Tuyi@Example.com", phone: "+250777000000", message: "Plain text" };

    test("400 on invalid input", async () => {
      const { contName, ...noName } = body;
      expect((await request(app).post("/messages").send(noName)).status).toBe(400);
      expect((await request(app).post("/messages").send({ ...body, phone: "0777" })).status).toBe(400);
    });

    test("200 stores the message and emails the owner", async () => {
      const save = mockSave(Message);
      const res = await request(app).post("/messages").send(body);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: body.contName, phone: body.phone, message: body.message, read: false });
      expect(save).toHaveBeenCalledTimes(1);
      expect(emailService).toHaveBeenCalledWith(
        "owner@example.com",
        `${body.contName} sent you a message`,
        expect.stringContaining(body.message)
      );
    });

    test("500 when saving fails", async () => {
      jest.spyOn(Message.prototype, "save").mockRejectedValue(new Error("db"));
      const res = await request(app).post("/messages").send(body);
      expect(res.status).toBe(500);
      expect(emailService).not.toHaveBeenCalled();
    });
  });

  test("GET /messages/:id 400 / 404 / 200 / 500", async () => {
    expect((await request(app).get("/messages/bad").set("Authorization", auth)).status).toBe(400);

    jest.spyOn(Message, "findById").mockResolvedValueOnce(null);
    expect((await request(app).get(`/messages/${oid()}`).set("Authorization", auth)).status).toBe(404);

    const msg = makeMessage();
    jest.spyOn(Message, "findById").mockResolvedValueOnce(msg);
    const ok = await request(app).get(`/messages/${msg._id}`).set("Authorization", auth);
    expect(ok.status).toBe(200);
    expect(ok.body.message.name).toBe("Olivier");

    jest.spyOn(Message, "findById").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get(`/messages/${oid()}`).set("Authorization", auth)).status).toBe(500);
  });

  test("DELETE /messages/:id 400 / 404 / 204 / 500", async () => {
    expect((await request(app).delete("/messages/bad").set("Authorization", auth)).status).toBe(400);

    jest.spyOn(Message, "findById").mockResolvedValueOnce(null);
    expect((await request(app).delete(`/messages/${oid()}`).set("Authorization", auth)).status).toBe(404);

    const msg = makeMessage();
    jest.spyOn(Message, "findById").mockResolvedValue(msg);
    const del = jest.spyOn(Message, "findOneAndDelete").mockResolvedValueOnce(msg);
    expect((await request(app).delete(`/messages/${msg._id}`).set("Authorization", auth)).status).toBe(204);
    expect(del).toHaveBeenCalledWith({ _id: String(msg._id) });

    jest.spyOn(Message, "findOneAndDelete").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).delete(`/messages/${msg._id}`).set("Authorization", auth)).status).toBe(500);
  });

  test("PATCH /messages/:id/read toggles the read flag", async () => {
    expect((await request(app).patch("/messages/bad/read").set("Authorization", auth)).status).toBe(400);

    jest.spyOn(Message, "findById").mockResolvedValueOnce(null);
    expect((await request(app).patch(`/messages/${oid()}/read`).set("Authorization", auth)).status).toBe(404);

    const msg = makeMessage();
    jest.spyOn(Message, "findById").mockResolvedValue(msg);
    mockSave(Message);
    let res = await request(app).patch(`/messages/${msg._id}/read`).set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body.message.read).toBe(true);
    res = await request(app).patch(`/messages/${msg._id}/read`).set("Authorization", auth);
    expect(res.body.message.read).toBe(false);

    jest.spyOn(Message.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await request(app).patch(`/messages/${msg._id}/read`).set("Authorization", auth)).status).toBe(500);
  });
});
