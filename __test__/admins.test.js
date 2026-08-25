import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.js";
import { authAs, makeAdmin, makeUser } from "./helpers";

describe("/admins", () => {
  test("401 without a token, 403 for a non-admin", async () => {
    let res = await request(app).get("/admins/dashboard");
    expect(res.status).toBe(401);
    res = await request(app).get("/admins/dashboard").set("Authorization", authAs(makeUser()));
    expect(res.status).toBe(403);
  });

  test("GET /admins/dashboard confirms the admin", async () => {
    const res = await request(app).get("/admins/dashboard").set("Authorization", authAs(makeAdmin()));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Is an admin" });
  });

  test("GET /admins lists admins", async () => {
    const auth = authAs(makeAdmin());
    const find = jest.spyOn(User, "find").mockResolvedValue([makeAdmin()]);
    const res = await request(app).get("/admins").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(find).toHaveBeenCalledWith({ title: "admin" });
  });

  test("GET /admins/admins counts admins", async () => {
    const auth = authAs(makeAdmin());
    const count = jest.spyOn(User, "countDocuments").mockResolvedValue(2);
    const res = await request(app).get("/admins/admins").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ Admins: 2 });
    expect(count).toHaveBeenCalledWith({ title: "admin" });
  });

  test("GET /admins/users lists every app user", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(User, "find").mockResolvedValue([makeAdmin(), makeUser()]);
    const res = await request(app).get("/admins/users").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test("GET /admins/users/users counts every app user", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(User, "estimatedDocumentCount").mockResolvedValue(42);
    const res = await request(app).get("/admins/users/users").set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ allUsers: 42 });
  });

  test("every endpoint answers 500 on a database error", async () => {
    const auth = authAs(makeAdmin());
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(User, "find").mockRejectedValue(new Error("db"));
    jest.spyOn(User, "countDocuments").mockRejectedValue(new Error("db"));
    jest.spyOn(User, "estimatedDocumentCount").mockRejectedValue(new Error("db"));
    for (const path of ["/admins", "/admins/admins", "/admins/users", "/admins/users/users"]) {
      const res = await request(app).get(path).set("Authorization", auth);
      expect(res.status).toBe(500);
    }
  });
});
