import request from "supertest";
import app from "../src/app.js";
import Work from "../src/models/work.js";
import { authAs, makeAdmin, makeUser, mockSave, oid } from "./helpers";

const makeWork = (overrides = {}) => new Work({ title: "Portfolio", body: "b", desc: "d", ...overrides });

describe("/works", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("GET /works is public; 200 / 500", async () => {
    jest.spyOn(Work, "find").mockResolvedValueOnce([makeWork()]);
    const ok = await request(app).get("/works");
    expect(ok.status).toBe(200);
    expect(ok.body.works[0].title).toBe("Portfolio");

    jest.spyOn(Work, "find").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get("/works")).status).toBe(500);
  });

  test("mutations require an admin", async () => {
    expect((await request(app).post("/works").send({ title: "New" })).status).toBe(401);
    const userAuth = authAs(makeUser());
    expect((await request(app).post("/works").set("Authorization", userAuth).send({ title: "New" })).status).toBe(403);
    expect((await request(app).patch(`/works/${oid()}`).set("Authorization", userAuth).send({ title: "New" })).status).toBe(403);
    expect((await request(app).delete(`/works/${oid()}`).set("Authorization", userAuth)).status).toBe(403);
  });

  describe("POST /works", () => {
    test("400 on invalid input", async () => {
      expect((await request(app).post("/works").set("Authorization", auth).send({ title: "ab" })).status).toBe(400);
      expect((await request(app).post("/works").set("Authorization", auth).send({ title: "abc", extra: 1 })).status).toBe(400);
    });

    test("409 when the title exists", async () => {
      jest.spyOn(Work, "findOne").mockResolvedValue(makeWork());
      expect((await request(app).post("/works").set("Authorization", auth).send({ title: "Portfolio" })).status).toBe(409);
    });

    test("201 creates the work", async () => {
      jest.spyOn(Work, "findOne").mockResolvedValue(null);
      const save = mockSave(Work);
      const body = { title: "Shop", body: "text", desc: "d", start: "2024-01", end: "2024-06", link: "http://x" };
      const res = await request(app).post("/works").set("Authorization", auth).send(body);
      expect(res.status).toBe(201);
      expect(res.body.newWork).toMatchObject(body);
      expect(save).toHaveBeenCalledTimes(1);
    });

    test("500 when saving fails", async () => {
      jest.spyOn(Work, "findOne").mockResolvedValue(null);
      jest.spyOn(Work.prototype, "save").mockRejectedValue(new Error("db"));
      expect((await request(app).post("/works").set("Authorization", auth).send({ title: "Shop" })).status).toBe(500);
    });
  });

  describe("PATCH /works/:id", () => {
    test("400 when the body is empty", async () => {
      expect((await request(app).patch(`/works/${oid()}`).set("Authorization", auth).send({})).status).toBe(400);
    });

    test("404 when missing", async () => {
      jest.spyOn(Work, "findOne").mockResolvedValue(null);
      expect((await request(app).patch(`/works/${oid()}`).set("Authorization", auth).send({ title: "New" })).status).toBe(404);
    });

    test("200 updates every provided field", async () => {
      const work = makeWork();
      jest.spyOn(Work, "findOne").mockResolvedValue(work);
      mockSave(Work);
      const body = { title: "Renamed", body: "", desc: "nd", start: "2025-01", end: "", link: "http://y" };
      const res = await request(app).patch(`/works/${work._id}`).set("Authorization", auth).send(body);
      expect(res.status).toBe(200);
      expect(res.body.updatedWork).toMatchObject(body);
    });

    test("500 when saving fails", async () => {
      jest.spyOn(Work, "findOne").mockResolvedValue(makeWork());
      jest.spyOn(Work.prototype, "save").mockRejectedValue(new Error("db"));
      expect((await request(app).patch(`/works/${oid()}`).set("Authorization", auth).send({ title: "New" })).status).toBe(500);
    });
  });

  describe("DELETE /works/:id", () => {
    test("404 / 204 / 500", async () => {
      jest.spyOn(Work, "findById").mockResolvedValueOnce(null);
      expect((await request(app).delete(`/works/${oid()}`).set("Authorization", auth)).status).toBe(404);

      const work = makeWork();
      jest.spyOn(Work, "findById").mockResolvedValue(work);
      const del = jest.spyOn(Work, "deleteOne").mockResolvedValueOnce({});
      expect((await request(app).delete(`/works/${work._id}`).set("Authorization", auth)).status).toBe(204);
      expect(del).toHaveBeenCalledWith({ _id: String(work._id) });

      jest.spyOn(Work, "deleteOne").mockRejectedValueOnce(new Error("db"));
      expect((await request(app).delete(`/works/${work._id}`).set("Authorization", auth)).status).toBe(500);
    });
  });
});
