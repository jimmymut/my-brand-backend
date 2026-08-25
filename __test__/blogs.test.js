import request from "supertest";
import app from "../src/app.js";
import { Blog, Comment, Like } from "../src/models/blogModel.js";
import { cloudinary } from "../src/config";
import { authAs, failing, makeAdmin, makeUser, mockSave, oid, query } from "./helpers";

const makeBlog = (overrides = {}) =>
  new Blog({ title: "A blog", description: "desc", file: { public_id: "", url: "" }, ...overrides });
const png = () => Buffer.from("89504e470d0a1a0a", "hex");

describe("GET /blogs and /blogs/blogs", () => {
  test("lists blogs with populated comments", async () => {
    jest.spyOn(Blog, "find").mockReturnValue(query([makeBlog(), makeBlog()]));
    const res = await request(app).get("/blogs");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test("500 when listing fails", async () => {
    jest.spyOn(Blog, "find").mockReturnValue(failing());
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).get("/blogs");
    expect(res.status).toBe(500);
  });

  test("counts blogs", async () => {
    jest.spyOn(Blog, "countDocuments").mockResolvedValue(3);
    const res = await request(app).get("/blogs/blogs");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ Blogs: 3 });
  });

  test("500 when counting fails", async () => {
    jest.spyOn(Blog, "countDocuments").mockRejectedValue(new Error("db"));
    const res = await request(app).get("/blogs/blogs");
    expect(res.status).toBe(500);
  });
});

describe("POST /blogs", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("401 anonymous, 403 non-admin", async () => {
    let res = await request(app).post("/blogs").send({ title: "Hello" });
    expect(res.status).toBe(401);
    res = await request(app).post("/blogs").set("Authorization", authAs(makeUser())).send({ title: "Hello" });
    expect(res.status).toBe(403);
  });

  test("400 when the title is missing", async () => {
    const res = await request(app).post("/blogs").set("Authorization", auth).send({ description: "x" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("title");
  });

  test("200 saves a blog with an external image url", async () => {
    const save = mockSave(Blog);
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", auth)
      .send({ title: "Hello", description: "d", body: ["p1", "p2"], tag: "Tech", file: "http://img/1.png" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Hello");
    expect(res.body.body).toEqual(["p1", "p2"]);
    expect(res.body.file).toEqual({ public_id: "", url: "http://img/1.png" });
    expect(save).toHaveBeenCalledTimes(1);
  });

  test("200 uploads an attached image to cloudinary (multipart body is parsed)", async () => {
    mockSave(Blog);
    const upload = jest
      .spyOn(cloudinary.uploader, "upload")
      .mockResolvedValue({ public_id: "images/abc", secure_url: "https://cdn/abc.png" });
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", auth)
      .field("title", "Uploaded")
      .field("body", JSON.stringify(["para"]))
      .attach("file", png(), { filename: "img.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    expect(res.body.file).toEqual({ public_id: "images/abc", url: "https://cdn/abc.png" });
    expect(res.body.body).toEqual(["para"]);
    expect(upload).toHaveBeenCalledWith(expect.any(String), { folder: "images" });
  });

  test("400 when a multipart body field is not a JSON array", async () => {
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", auth)
      .field("title", "Uploaded")
      .field("body", "not json");
    expect(res.status).toBe(400);
  });

  test("500 when the attachment is not an image (multer filter)", async () => {
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", auth)
      .field("title", "Uploaded")
      .attach("file", Buffer.from("hello"), { filename: "a.txt", contentType: "text/plain" });
    expect(res.status).toBe(500);
  });

  test("500 when cloudinary fails", async () => {
    jest.spyOn(cloudinary.uploader, "upload").mockRejectedValue(new Error("cloudinary down"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app)
      .post("/blogs")
      .set("Authorization", auth)
      .field("title", "Uploaded")
      .attach("file", png(), { filename: "img.png", contentType: "image/png" });
    expect(res.status).toBe(500);
  });

  test("500 when saving fails", async () => {
    jest.spyOn(Blog.prototype, "save").mockRejectedValue(new Error("db"));
    jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).post("/blogs").set("Authorization", auth).send({ title: "Hello" });
    expect(res.status).toBe(500);
  });
});

describe("GET /blogs/:id", () => {
  test("400 / 404 / 200 / 500", async () => {
    expect((await request(app).get("/blogs/bad")).status).toBe(400);

    jest.spyOn(Blog, "findOne").mockReturnValueOnce(query(null));
    expect((await request(app).get(`/blogs/${oid()}`)).status).toBe(404);

    const blog = makeBlog();
    jest.spyOn(Blog, "findOne").mockReturnValueOnce(query(blog));
    const ok = await request(app).get(`/blogs/${blog._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body._id).toBe(String(blog._id));

    jest.spyOn(Blog, "findOne").mockReturnValueOnce(failing());
    expect((await request(app).get(`/blogs/${oid()}`)).status).toBe(500);
  });
});

describe("PATCH /blogs/:id", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("400 when the body is empty or the id is malformed", async () => {
    let res = await request(app).patch(`/blogs/${oid()}`).set("Authorization", auth).send({});
    expect(res.status).toBe(400);
    res = await request(app).patch("/blogs/bad").set("Authorization", auth).send({ title: "New" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid id");
  });

  test("404 when the blog does not exist", async () => {
    jest.spyOn(Blog, "findOne").mockResolvedValue(null);
    const res = await request(app).patch(`/blogs/${oid()}`).set("Authorization", auth).send({ title: "New" });
    expect(res.status).toBe(404);
  });

  test("200 updates every provided field", async () => {
    const blog = makeBlog({ file: { public_id: "old", url: "old" } });
    jest.spyOn(Blog, "findOne").mockResolvedValue(blog);
    mockSave(Blog);
    const res = await request(app)
      .patch(`/blogs/${blog._id}`)
      .set("Authorization", auth)
      .send({ title: "New", description: "nd", excerpt: "ex", tag: "T", body: ["b"], date: "2026-01-01", file: "http://new" });
    expect(res.status).toBe(200);
    expect(res.body.post).toMatchObject({
      title: "New", description: "nd", excerpt: "ex", tag: "T", body: ["b"], date: "2026-01-01",
      file: { public_id: "", url: "http://new" },
    });
  });

  test("200 uploads a new image", async () => {
    const blog = makeBlog();
    jest.spyOn(Blog, "findOne").mockResolvedValue(blog);
    mockSave(Blog);
    jest.spyOn(cloudinary.uploader, "upload").mockResolvedValue({ public_id: "p", secure_url: "https://cdn/p" });
    const res = await request(app)
      .patch(`/blogs/${blog._id}`)
      .set("Authorization", auth)
      .field("title", "With image")
      .attach("file", png(), { filename: "img.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    expect(res.body.post.file).toEqual({ public_id: "p", url: "https://cdn/p" });
  });

  test("500 when saving fails", async () => {
    jest.spyOn(Blog, "findOne").mockResolvedValue(makeBlog());
    jest.spyOn(Blog.prototype, "save").mockRejectedValue(new Error("db"));
    const res = await request(app).patch(`/blogs/${oid()}`).set("Authorization", auth).send({ title: "New" });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /blogs/:id", () => {
  let auth;
  beforeEach(() => {
    auth = authAs(makeAdmin());
  });

  test("400 / 404", async () => {
    expect((await request(app).delete("/blogs/bad").set("Authorization", auth)).status).toBe(400);
    jest.spyOn(Blog, "findById").mockResolvedValue(null);
    expect((await request(app).delete(`/blogs/${oid()}`).set("Authorization", auth)).status).toBe(404);
  });

  test("204 deletes the blog with its likes and comments", async () => {
    const id = oid();
    jest.spyOn(Blog, "findById").mockResolvedValue(makeBlog());
    const delBlog = jest.spyOn(Blog, "deleteOne").mockResolvedValue({});
    const delLikes = jest.spyOn(Like, "deleteMany").mockResolvedValue({});
    const delComments = jest.spyOn(Comment, "deleteMany").mockResolvedValue({});
    const res = await request(app).delete(`/blogs/${id}`).set("Authorization", auth);
    expect(res.status).toBe(204);
    expect(delBlog).toHaveBeenCalledWith({ _id: id });
    expect(delLikes).toHaveBeenCalledWith({ blogId: id });
    expect(delComments).toHaveBeenCalledWith({ blogId: id });
  });

  test("500 on a database error", async () => {
    jest.spyOn(Blog, "findById").mockRejectedValue(new Error("db"));
    expect((await request(app).delete(`/blogs/${oid()}`).set("Authorization", auth)).status).toBe(500);
  });
});

describe("comments", () => {
  let auth;
  let blog;
  beforeEach(() => {
    auth = authAs(makeUser());
    blog = makeBlog();
  });

  test("GET /blogs/:id/comments 400 / 200 / 500", async () => {
    expect((await request(app).get("/blogs/bad/comments")).status).toBe(400);

    jest.spyOn(Comment, "find").mockReturnValueOnce(query([{ comment: "hi" }]));
    const ok = await request(app).get(`/blogs/${blog._id}/comments`);
    expect(ok.status).toBe(200);
    expect(ok.body.comments).toEqual([{ comment: "hi" }]);

    jest.spyOn(Comment, "find").mockReturnValueOnce(failing());
    expect((await request(app).get(`/blogs/${blog._id}/comments`)).status).toBe(500);
  });

  test("GET /blogs/:id/comments/comments 400 / 404 / 200 / 500", async () => {
    expect((await request(app).get("/blogs/bad/comments/comments")).status).toBe(400);

    jest.spyOn(Blog, "findById").mockResolvedValueOnce(null);
    expect((await request(app).get(`/blogs/${blog._id}/comments/comments`)).status).toBe(404);

    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Comment, "countDocuments").mockResolvedValueOnce(4);
    const ok = await request(app).get(`/blogs/${blog._id}/comments/comments`);
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({ comments: 4 });

    jest.spyOn(Comment, "countDocuments").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get(`/blogs/${blog._id}/comments/comments`)).status).toBe(500);

    jest.spyOn(Blog, "findById").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get(`/blogs/${blog._id}/comments/comments`)).status).toBe(500);
  });

  test("GET /blogs/:id/comments/:commentId", async () => {
    const commentId = oid();
    expect((await request(app).get(`/blogs/bad/comments/${commentId}`)).status).toBe(400);
    expect((await request(app).get(`/blogs/${blog._id}/comments/bad`)).status).toBe(400);

    jest.spyOn(Blog, "findById").mockResolvedValueOnce(null);
    expect((await request(app).get(`/blogs/${blog._id}/comments/${commentId}`)).status).toBe(404);

    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Comment, "findById").mockReturnValueOnce(query(null));
    expect((await request(app).get(`/blogs/${blog._id}/comments/${commentId}`)).status).toBe(404);

    jest.spyOn(Comment, "findById").mockReturnValueOnce(query({ _id: commentId, comment: "hey" }));
    const ok = await request(app).get(`/blogs/${blog._id}/comments/${commentId}`);
    expect(ok.status).toBe(200);
    expect(ok.body.comment).toBe("hey");

    jest.spyOn(Comment, "findById").mockReturnValueOnce(failing());
    expect((await request(app).get(`/blogs/${blog._id}/comments/${commentId}`)).status).toBe(500);
  });

  describe("POST /blogs/:id/comments", () => {
    const body = { comment: "a thoughtful comment" };

    test("401 anonymous, 400 validation, 400 bad id", async () => {
      expect((await request(app).post(`/blogs/${blog._id}/comments`).send(body)).status).toBe(401);
      expect((await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send({ comment: "a" })).status).toBe(400);
      expect((await request(app).post("/blogs/bad/comments").set("Authorization", auth).send(body)).status).toBe(400);
    });

    test("404 when the blog does not exist", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValue(null);
      const res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(404);
    });

    test("200 saves the comment and links it to the blog", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      const save = jest.spyOn(Comment.prototype, "save").mockImplementation(function save() {
        return Promise.resolve({ _id: this._id, comment: this.comment, populate: () => {} });
      });
      const push = jest.spyOn(Blog, "findByIdAndUpdate").mockResolvedValue({});
      const res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(200);
      expect(res.body.comment).toBe(body.comment);
      expect(save).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith(String(blog._id), { $push: { comments: save.mock.instances[0]._id } });
    });

    test("500 when saving the comment fails", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment.prototype, "save").mockRejectedValue(new Error("db"));
      const res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Failed to save a comment/);
    });

    test("500 when linking to the blog fails", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment.prototype, "save").mockResolvedValue({ populate: () => {} });
      jest.spyOn(Blog, "findByIdAndUpdate").mockRejectedValue(new Error("db"));
      const res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/blog update/);
    });

    test("500 when looking up the blog or populating the author fails", async () => {
      jest.spyOn(Blog, "findById").mockRejectedValueOnce(new Error("db"));
      let res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error occured/);

      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment.prototype, "save").mockResolvedValue({ populate: () => Promise.reject(new Error("populate")) });
      jest.spyOn(Blog, "findByIdAndUpdate").mockResolvedValue({});
      res = await request(app).post(`/blogs/${blog._id}/comments`).set("Authorization", auth).send(body);
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /blogs/:id/comments/:commentId", () => {
    let adminAuth;
    beforeEach(() => {
      adminAuth = authAs(makeAdmin());
    });

    test("401 / 403 / 400 / 400", async () => {
      const cid = oid();
      expect((await request(app).delete(`/blogs/${blog._id}/comments/${cid}`)).status).toBe(401);
      expect((await request(app).delete(`/blogs/${blog._id}/comments/${cid}`).set("Authorization", authAs(makeUser()))).status).toBe(403);
      adminAuth = authAs(makeAdmin());
      expect((await request(app).delete(`/blogs/bad/comments/${cid}`).set("Authorization", adminAuth)).status).toBe(400);
      expect((await request(app).delete(`/blogs/${blog._id}/comments/bad`).set("Authorization", adminAuth)).status).toBe(400);
    });

    test("404 for a missing blog or comment", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValueOnce(null);
      expect((await request(app).delete(`/blogs/${blog._id}/comments/${oid()}`).set("Authorization", adminAuth)).status).toBe(404);
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment, "findById").mockResolvedValue(null);
      expect((await request(app).delete(`/blogs/${blog._id}/comments/${oid()}`).set("Authorization", adminAuth)).status).toBe(404);
    });

    test("200 deletes the comment and pulls it from the blog", async () => {
      const comment = new Comment({ comment: "x" });
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment, "findById").mockResolvedValue(comment);
      const del = jest.spyOn(Comment, "deleteOne").mockResolvedValue({});
      const pull = jest.spyOn(Blog, "findByIdAndUpdate").mockResolvedValue({});
      const res = await request(app).delete(`/blogs/${blog._id}/comments/${comment._id}`).set("Authorization", adminAuth);
      expect(res.status).toBe(200);
      expect(del).toHaveBeenCalledWith({ _id: comment._id });
      expect(pull).toHaveBeenCalledWith(String(blog._id), { $pull: { comments: comment._id } });
    });

    test("500 on a database error", async () => {
      jest.spyOn(Blog, "findById").mockResolvedValue(blog);
      jest.spyOn(Comment, "findById").mockRejectedValue(new Error("db"));
      const res = await request(app).delete(`/blogs/${blog._id}/comments/${oid()}`).set("Authorization", adminAuth);
      expect(res.status).toBe(500);
    });
  });
});

describe("likes", () => {
  let user;
  let auth;
  let blog;
  beforeEach(() => {
    user = makeUser();
    auth = authAs(user);
    blog = makeBlog();
  });

  test("GET /blogs/:id/likes 400 / 404 / 200 / 500", async () => {
    expect((await request(app).get("/blogs/bad/likes")).status).toBe(400);

    jest.spyOn(Blog, "findById").mockResolvedValueOnce(null);
    expect((await request(app).get(`/blogs/${blog._id}/likes`)).status).toBe(404);

    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Like, "countDocuments").mockResolvedValueOnce(9);
    const ok = await request(app).get(`/blogs/${blog._id}/likes`);
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({ likes: 9 });

    jest.spyOn(Like, "countDocuments").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get(`/blogs/${blog._id}/likes`)).status).toBe(500);

    jest.spyOn(Blog, "findById").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).get(`/blogs/${blog._id}/likes`)).status).toBe(500);
  });

  test("PUT /blogs/:id/likes 500 when the blog lookup, like lookup or like save fails", async () => {
    jest.spyOn(Blog, "findById").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);

    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Like, "findOne").mockRejectedValueOnce(new Error("db"));
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);

    jest.spyOn(Like, "findOne").mockResolvedValue(null);
    jest.spyOn(Like.prototype, "save").mockRejectedValue(new Error("db"));
    const updateOne = jest.spyOn(Blog, "updateOne");
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);
    expect(updateOne).not.toHaveBeenCalled();
  });

  test("PUT /blogs/:id/likes 401 anonymous, 403 admin, 400 bad id, 404 missing", async () => {
    expect((await request(app).put(`/blogs/${blog._id}/likes`)).status).toBe(401);
    const adminRes = await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", authAs(makeAdmin()));
    expect(adminRes.status).toBe(403);
    expect(adminRes.body.message).toMatch(/Admins are not allowed/);
    auth = authAs(user);
    expect((await request(app).put("/blogs/bad/likes").set("Authorization", auth)).status).toBe(400);
    jest.spyOn(Blog, "findById").mockResolvedValue(null);
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(404);
  });

  test("likes a blog that was not liked yet", async () => {
    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Like, "findOne").mockResolvedValue(null);
    const save = mockSave(Like);
    const push = jest.spyOn(Blog, "updateOne").mockResolvedValue({});
    const res = await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("like");
    expect(String(res.body.like.userId)).toBe(String(user._id));
    expect(push).toHaveBeenCalledWith({ _id: String(blog._id) }, { $push: { likes: save.mock.instances[0]._id } }, { new: true });
  });

  test("unlikes a blog that was already liked", async () => {
    const liked = new Like({ blogId: blog._id, userId: user._id });
    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Like, "findOne").mockResolvedValue(liked);
    const pull = jest.spyOn(Blog, "updateOne").mockResolvedValue({});
    const del = jest.spyOn(Like, "findOneAndDelete").mockResolvedValue({});
    const res = await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("unlike");
    expect(pull).toHaveBeenCalledWith({ _id: String(blog._id) }, { $pull: { likes: liked._id } }, { new: true });
    expect(del).toHaveBeenCalledWith({ _id: liked._id });
  });

  test("500 when updating the blog fails (like and unlike)", async () => {
    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Blog, "updateOne").mockRejectedValue(new Error("db"));
    mockSave(Like);

    jest.spyOn(Like, "findOne").mockResolvedValueOnce(null);
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);

    jest.spyOn(Like, "findOne").mockResolvedValueOnce(new Like({ blogId: blog._id, userId: user._id }));
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);
  });

  test("500 when removing the like record fails", async () => {
    jest.spyOn(Blog, "findById").mockResolvedValue(blog);
    jest.spyOn(Like, "findOne").mockResolvedValue(new Like({ blogId: blog._id, userId: user._id }));
    jest.spyOn(Blog, "updateOne").mockResolvedValue({});
    jest.spyOn(Like, "findOneAndDelete").mockRejectedValue(new Error("db"));
    expect((await request(app).put(`/blogs/${blog._id}/likes`).set("Authorization", auth)).status).toBe(500);
  });
});
