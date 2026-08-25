import request from "supertest";
import app from "../src/app.js";
import Skill from "../src/models/skills.js";
import { cloudinary } from "../src/config";
import { authAs, makeAdmin, makeUser, mockSave, oid } from "./helpers";

const makeSkill = (overrides = {}) => new Skill({ name: "Node.js", desc: "runtime", level: 80, ...overrides });
const png = () => Buffer.from("89504e470d0a1a0a", "hex");

describe("/skills", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("GET /skills is public; 200 / 500", async () => {
    jest.spyOn(Skill, "find").mockResolvedValueOnce([makeSkill()]);
    const ok = await request(app).get("/skills");
    expect(ok.status).toBe(200);
    expect(ok.body.skills[0].name).toBe("Node.js");

    jest.spyOn(Skill, "find").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get("/skills")).status).toBe(500);
  });

  test("mutations require an admin", async () => {
    expect((await request(app).post("/skills").send({ name: "JS" })).status).toBe(401);
    const userAuth = authAs(makeUser());
    expect((await request(app).post("/skills").set("Authorization", userAuth).send({ name: "JS" })).status).toBe(403);
    expect((await request(app).patch(`/skills/${oid()}`).set("Authorization", userAuth).send({ name: "JS" })).status).toBe(403);
    expect((await request(app).delete(`/skills/${oid()}`).set("Authorization", userAuth)).status).toBe(403);
  });

  describe("POST /skills", () => {
    test("400 on invalid input", async () => {
      expect((await request(app).post("/skills").set("Authorization", auth).send({ name: "J" })).status).toBe(400);
      expect((await request(app).post("/skills").set("Authorization", auth).send({ name: "JS", level: 101 })).status).toBe(400);
    });

    test("409 when the skill exists", async () => {
      jest.spyOn(Skill, "findOne").mockResolvedValue(makeSkill());
      const res = await request(app).post("/skills").set("Authorization", auth).send({ name: "Node.js" });
      expect(res.status).toBe(409);
    });

    test("201 creates a skill with an icon url and defaults", async () => {
      jest.spyOn(Skill, "findOne").mockResolvedValue(null);
      mockSave(Skill);
      const res = await request(app).post("/skills").set("Authorization", auth).send({ name: "React", icon: "http://icon" });
      expect(res.status).toBe(201);
      expect(res.body.newSkill).toMatchObject({ name: "React", icon: "http://icon", summary: "", level: 0 });
    });

    test("201 uploads an attached icon", async () => {
      jest.spyOn(Skill, "findOne").mockResolvedValue(null);
      mockSave(Skill);
      const upload = jest.spyOn(cloudinary.uploader, "upload").mockResolvedValue({ secure_url: "https://cdn/icon.png" });
      const res = await request(app)
        .post("/skills")
        .set("Authorization", auth)
        .field("name", "Vue")
        .field("level", "55")
        .attach("icon", png(), { filename: "i.png", contentType: "image/png" });
      expect(res.status).toBe(201);
      expect(res.body.newSkill).toMatchObject({ name: "Vue", level: 55, icon: "https://cdn/icon.png" });
      expect(upload).toHaveBeenCalledWith(expect.any(String), { folder: "skill_icons" });
    });

    test("500 on a database error", async () => {
      jest.spyOn(Skill, "findOne").mockRejectedValue(new Error("db"));
      expect((await request(app).post("/skills").set("Authorization", auth).send({ name: "React" })).status).toBe(500);
    });
  });

  describe("PATCH /skills/:id", () => {
    test("400 when the body is empty", async () => {
      expect((await request(app).patch(`/skills/${oid()}`).set("Authorization", auth).send({})).status).toBe(400);
    });

    test("404 when missing", async () => {
      jest.spyOn(Skill, "findOne").mockResolvedValue(null);
      expect((await request(app).patch(`/skills/${oid()}`).set("Authorization", auth).send({ name: "Go" })).status).toBe(404);
    });

    test("200 updates the provided fields (including clearing the icon)", async () => {
      const skill = makeSkill({ icon: "old", summary: "s" });
      jest.spyOn(Skill, "findOne").mockResolvedValue(skill);
      mockSave(Skill);
      const res = await request(app)
        .patch(`/skills/${skill._id}`)
        .set("Authorization", auth)
        .send({ name: "Deno", summary: "", desc: "d", level: 10, icon: "" });
      expect(res.status).toBe(200);
      expect(res.body.updatedSkill).toMatchObject({ name: "Deno", summary: "", desc: "d", level: 10, icon: "" });
    });

    test("200 uploads a new icon", async () => {
      const skill = makeSkill();
      jest.spyOn(Skill, "findOne").mockResolvedValue(skill);
      mockSave(Skill);
      jest.spyOn(cloudinary.uploader, "upload").mockResolvedValue({ secure_url: "https://cdn/new.png" });
      const res = await request(app)
        .patch(`/skills/${skill._id}`)
        .set("Authorization", auth)
        .field("level", "90")
        .attach("icon", png(), { filename: "i.png", contentType: "image/png" });
      expect(res.status).toBe(200);
      expect(res.body.updatedSkill).toMatchObject({ level: 90, icon: "https://cdn/new.png" });
    });

    test("500 when saving fails", async () => {
      jest.spyOn(Skill, "findOne").mockResolvedValue(makeSkill());
      jest.spyOn(Skill.prototype, "save").mockRejectedValue(new Error("db"));
      expect((await request(app).patch(`/skills/${oid()}`).set("Authorization", auth).send({ name: "Go" })).status).toBe(500);
    });
  });

  describe("DELETE /skills/:id", () => {
    test("404 / 204 / 500", async () => {
      jest.spyOn(Skill, "findById").mockResolvedValueOnce(null);
      expect((await request(app).delete(`/skills/${oid()}`).set("Authorization", auth)).status).toBe(404);

      const skill = makeSkill();
      jest.spyOn(Skill, "findById").mockResolvedValue(skill);
      const del = jest.spyOn(Skill, "deleteOne").mockResolvedValueOnce({});
      expect((await request(app).delete(`/skills/${skill._id}`).set("Authorization", auth)).status).toBe(204);
      expect(del).toHaveBeenCalledWith({ _id: String(skill._id) });

      jest.spyOn(Skill, "deleteOne").mockRejectedValueOnce(new Error("db"));
      expect((await request(app).delete(`/skills/${skill._id}`).set("Authorization", auth)).status).toBe(500);
    });
  });
});
