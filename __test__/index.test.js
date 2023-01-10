import app from "../src/index";
import request from "supertest";
import User from "../src/models/user";
import { Blog, Like, Comment } from "../src/models/blogModel";
import Message from "../src/models/messagesModel";

import mongoose from "mongoose";

let server;

beforeAll((done) => {
  server = app.listen(2500, () => console.log("Server is running at 2500"));
  done();
});
beforeEach(async () => {
  await User.deleteMany();
  await Blog.deleteMany();
  await Message.deleteMany();
  await Like.deleteMany();
  await Comment.deleteMany();
});
afterAll((done) => {
  mongoose.connection.close();
  server.close(() => console.log("sever closed"));
  done();
});

const image =
  "data:image/png;base64,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";

//testing endpoints on admin routes (create, read and delete admin account)
describe("admin routes", () => {
  test("create admin account and delete it", async () => {
    const result = await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    expect(result.statusCode).toBe(200);

    const accountExistErr = await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const adminId = result.body._id;
    expect(accountExistErr.statusCode).toBe(400);

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;

    const deleteResError = await request(app)
      .delete(`/admins/fdfgfxs`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResError.status).toBe(400);

    const deleteResErrorNotFound = await request(app)
      .delete(`/admins/63ac6153042cf31311085132`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResErrorNotFound.status).toBe(404);

    const deleteRes = await request(app)
      .delete(`/admins/${adminId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });

  test("get all admins, and their number", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/admins")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);

    const responseNumAllAppUsers = await request(app)
      .get("/admins/users/users")
      .set("Authorization", `Bearer ${token}`);
    expect(responseNumAllAppUsers.statusCode).toBe(200);

    const responseGetllAppUsers = await request(app)
      .get("/admins/users")
      .set("Authorization", `Bearer ${token}`);
    expect(responseGetllAppUsers.statusCode).toBe(200);

    const responseGetNumAdminUsers = await request(app)
      .get("/admins/admins")
      .set("Authorization", `Bearer ${token}`);
    expect(responseGetNumAdminUsers.statusCode).toBe(200);

    const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
    jest.spyOn(User, "find").mockImplementation(mockfn);
    const errorResponse = await request(app)
      .get("/admins")
      .set("Authorization", `Bearer ${token}`);
    expect(errorResponse.statusCode).toBe(500);

    const errorResponseNumber = await request(app)
      .get("/admins/users/users")
      .set("Authorization", `Bearer ${token}`);
    expect(errorResponseNumber.statusCode).toBe(500);

    const errorResponseAppUsers = await request(app)
      .get("/admins/users")
      .set("Authorization", `Bearer ${token}`);
    expect(errorResponseAppUsers.statusCode).toBe(500);

    const errorResponseAdminsNum = await request(app)
      .get("/admins/admins")
      .set("Authorization", `Bearer ${token}`);
    expect(errorResponseAdminsNum.statusCode).toBe(500);
  });
});

test("test server error on delete acc", async () => {
  const account = await request(app).post("/admins").send({
    firstName: "Sebwato",
    lastName: "Musajya",
    email: "biryogo@gmail.com",
    password: "jimmy",
    comfirmPassword: "jimmy",
  });
  const accId = account.body._id;
  const loginResponse = await request(app)
    .post("/login")
    .send({ email: "biryogo@gmail.com", password: "jimmy" });
  const token = loginResponse.body.token;

  jest
    .spyOn(User, "deleteOne")
    .mockImplementation(
      jest.fn().mockRejectedValue(new Error("Database error"))
    );
  const errorResponse = await request(app)
    .delete(`/admins/${accId}`)
    .set("Authorization", `Bearer ${token}`);
  expect(errorResponse.statusCode).toBe(500);
});

//testing endpoints on  blogs/article routes (create, read, update, delete blog,
//read comments, add a comment, like or unlike, likes of a blog)
describe("Operations blogs in general", () => {
  describe("CRUD operations on blogs endpoints", () => {
    test("get all blogs and their number", async () => {
      const result = await request(app).get("/blogs");
      expect(result.statusCode).toBe(200);

      const resultNum = await request(app).get("/blogs/blogs");
      expect(resultNum.statusCode).toBe(200);

      jest
        .spyOn(Blog, "find")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Database error!"))
        );
      const resultNumError = await request(app).get("/blogs/blogs");
      expect(resultNumError.statusCode).toBe(500);
    });

    test("creating a new blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      expect(response.statusCode).toBe(200);

      const validationResponse = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      expect(validationResponse.statusCode).toBe(400);

      const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
      jest.spyOn(Blog.prototype, "save").mockImplementationOnce(mockfn);
      const errorResponseSave = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      expect(errorResponseSave.statusCode).toBe(500);
      jest.spyOn(Blog.prototype, "save").mockClear();
    }, 40000);

    test("Deleting a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      const deleteReqNonMongId = await request(app)
        .delete(`/blogs/ttrjytrrcdcertj`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteReqNonMongId.status).toBe(400);

      const deleteRequestNotfound = await request(app)
        .delete(`/blogs/63adb1d95f79e5864d261834`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRequestNotfound.status).toBe(404);

      const deleteRequest = await request(app)
        .delete(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRequest.status).toBe(204);
    });

    test("Deleting a blog which has likes", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      await request(app).post("/users").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "kanyizo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponseUser = await request(app)
        .post("/login")
        .send({ email: "kanyizo@gmail.com", password: "jimmy" });
      const userToken = loginResponseUser.body.token;

      await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${userToken}`);

      const deleteRequest = await request(app)
        .delete(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRequest.status).toBe(204);
    });

    test("server error in deleting a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;

      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      jest
        .spyOn(Blog, "findById")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      jest
        .spyOn(Blog, "deleteOne")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      jest
        .spyOn(Like, "find")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      jest
        .spyOn(Comment, "find")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      jest
        .spyOn(Comment, "deleteMany")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      jest
        .spyOn(Like, "deleteMany")
        .mockImplementation(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );

      const deleteRequestError = await request(app)
        .delete(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRequestError.status).toBe(500);

      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    test("Update a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const CreateResponse = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });

      const blogId = CreateResponse.body._id;

      const responseErrId = await request(app)
        .patch(`/blogs/rdrshgdfes`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "updating a blog" });
      expect(responseErrId.statusCode).toBe(400);

      const responsenotFound = await request(app)
        .patch(`/blogs/63ac5fe55065aaae433a9758`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "updating a blog" });
      expect(responsenotFound.statusCode).toBe(404);

      const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
      jest.spyOn(Blog.prototype, "save").mockImplementationOnce(mockfn);
      const ServerResponseErr = await request(app)
        .patch(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "updating a blog" });
      expect(ServerResponseErr.statusCode).toBe(500);
      jest.spyOn(Blog.prototype, "save").mockClear();

      const response = await request(app)
        .patch(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done  work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      expect(response.statusCode).toBe(200);

      const validresponse = await request(app)
        .patch(`/blogs/${blogId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "updating a blog" });
      expect(validresponse.statusCode).toBe(400);
    });

    test("Getting a single blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const result = await request(app).get(`/blogs/${blogId}`);
      expect(result.statusCode).toBe(200);

      const ErrorResult = await request(app).get(`/blogs/fdsddyter`);
      expect(ErrorResult.statusCode).toBe(400);

      const notFoundErrorResult = await request(app).get(
        `/blogs/63ae8166e9f02b6989aa15ad`
      );
      expect(notFoundErrorResult.statusCode).toBe(404);

      jest
        .spyOn(Blog, "findOne")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Server error"))
        );
      const ServerErrorResult = await request(app).get(`/blogs/${blogId}`);
      expect(ServerErrorResult.statusCode).toBe(500);
      jest.spyOn(Blog, "findOne").mockClear();
    });
  });

  describe("operations on comments endpoints", () => {
    test("get all blog comments", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      const resultCmtError = await request(app).get(
        `/blogs/ddttguyrrdxyh/comments`
      );
      expect(resultCmtError.statusCode).toBe(400);

      const resultCmtErrorOne = await request(app).get(
        `/blogs/63ac6153042cf31311085132/comments`
      );
      expect(resultCmtErrorOne.statusCode).toBe(404);

      const result = await request(app).get(`/blogs/${blogId}/comments`);
      expect(result.statusCode).toBe(200);

      jest
        .spyOn(Blog, "findById")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Database error!"))
        );
      const resultServerError = await request(app).get(
        `/blogs/${blogId}/comments`
      );
      expect(resultServerError.statusCode).toBe(500);
    });

    test("get a single blog comment", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      const resultAddComment = await request(app)
        .post(`/blogs/${blogId}/comments`)
        .send({
          name: "Jimmy Mutabazi",
          comment: "some comment to post on the article",
        });
      const commentId = resultAddComment.body._id;

      const resultCmtError = await request(app).get(
        `/blogs/ddttguyrrdxyh/comments/${commentId}`
      );
      expect(resultCmtError.statusCode).toBe(400);

      const resultCmtErrorCommentId = await request(app).get(
        `/blogs/${blogId}/comments/ddttguyrrdxyh`
      );
      expect(resultCmtErrorCommentId.statusCode).toBe(400);

      const resultCmtErrorCommentNot = await request(app).get(
        `/blogs/${blogId}/comments/63ac6153042cf31311085132`
      );
      expect(resultCmtErrorCommentNot.statusCode).toBe(404);

      const resultCmtErrorOne = await request(app).get(
        `/blogs/63ac6153042cf31311085132/comments/${commentId}`
      );
      expect(resultCmtErrorOne.statusCode).toBe(404);

      const result = await request(app).get(
        `/blogs/${blogId}/comments/${commentId}`
      );
      expect(result.statusCode).toBe(200);

      jest
        .spyOn(Blog, "findById")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Database error!"))
        );

      jest
        .spyOn(Comment, "findById")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Database error!"))
        );
      const resultServerError = await request(app).get(
        `/blogs/${blogId}/comments/${commentId}`
      );
      expect(resultServerError.statusCode).toBe(500);
    });

    test("Commenting on a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;

      const resultError1 = await request(app)
        .post(`/blogs/dsdfdxxddsshfdd/comments`)
        .send({
          name: "Jimmy Mutabazi",
          comment: "some comment to post on the article",
        });
      expect(resultError1.statusCode).toBe(400);

      const resultErr2 = await request(app)
        .post(`/blogs/63ac5fe55065aaae433a9758/comments`)
        .send({
          name: "Jimmy Mutabazi",
          comment: "some comment to post on the article",
        });
      expect(resultErr2.statusCode).toBe(404);

      const ValidationResult = await request(app)
        .post(`/blogs/${blogId}/comments`)
        .send({
          comment: "some comment to post on the article",
        });
      expect(ValidationResult.statusCode).toBe(400);

      const result = await request(app).post(`/blogs/${blogId}/comments`).send({
        name: "Jimmy Mutabazi",
        comment: "some comment to post on the article",
      });
      expect(result.statusCode).toBe(200);

      const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
      jest.spyOn(Comment.prototype, "save").mockImplementationOnce(mockfn);
      const errorResponseDel = await request(app)
        .post(`/blogs/${blogId}/comments`)
        .send({
          name: "Jimmy Mutabazi",
          comment: "some comment to post on the article",
        });
      expect(errorResponseDel.statusCode).toBe(500);
      jest.spyOn(Comment.prototype, "save").mockClear();

      const mockfnTwo = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));
      jest.spyOn(Blog, "findByIdAndUpdate").mockImplementationOnce(mockfnTwo);
      const errorResponseCommt = await request(app)
        .post(`/blogs/${blogId}/comments`)
        .send({
          name: "Jimmy Mutabazi",
          comment: "some comment to post on the article",
        });
      expect(errorResponseCommt.statusCode).toBe(500);
      jest.spyOn(Blog, "findByIdAndUpdate").mockClear();
    });

    test("deleting a comment on a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const result = await request(app).post(`/blogs/${blogId}/comments`).send({
        name: "Jimmy Mutabazi",
        comment: "some comment to post on the article",
      });

      const commentId = result.body._id;

      const firstErrdeleteResult = await request(app)
        .delete(`/blogs/dgfdfdffcxsdxs/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(firstErrdeleteResult.statusCode).toBe(400);

      const secondErrdeleteResult = await request(app)
        .delete(`/blogs/${blogId}/comments/gdfdfdfrsdz`)
        .set("Authorization", `Bearer ${token}`);
      expect(secondErrdeleteResult.statusCode).toBe(400);

      const thirdErrdeleteResult = await request(app)
        .delete(`/blogs/63ac6153042cf31311085132/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(thirdErrdeleteResult.statusCode).toBe(404);

      const deleteResult = await request(app)
        .delete(`/blogs/${blogId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteResult.statusCode).toBe(200);

      jest
        .spyOn(Blog, "findById")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Internal error!"))
        );

      const mockfn = jest
        .fn()
        .mockRejectedValue(new Error("Database error on finding a blog"));
      jest.spyOn(Comment, "findById").mockImplementationOnce(mockfn);

      const mockfnSeven = jest
        .fn()
        .mockRejectedValue(new Error("Database error on delete comment"));
      jest.spyOn(Comment, "deleteOne").mockImplementationOnce(mockfnSeven);

      const mockfnOne = jest
        .fn()
        .mockRejectedValue(new Error("Database error on upadating blog"));
      jest.spyOn(Blog, "findByIdAndUpdate").mockImplementationOnce(mockfnOne);
      const errorResponseDelOne = await request(app)
        .delete(`/blogs/${blogId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(errorResponseDelOne.statusCode).toBe(500);
    });

    test("getting the number of comments on a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const result = await request(app).post(`/blogs/${blogId}/comments`).send({
        name: "Jimmy Mutabazi",
        comment: "some comment to post on the article",
      });

      const readResultrrorOne = await request(app).get(
        `/blogs/gftjvlkjf/comments/comments`
      );
      expect(readResultrrorOne.statusCode).toBe(400);

      const readResultErrorTwo = await request(app).get(
        `/blogs/63ac6153042cf31311085132/comments/comments`
      );
      expect(readResultErrorTwo.statusCode).toBe(404);

      const readResult = await request(app).get(
        `/blogs/${blogId}/comments/comments`
      );
      expect(readResult.statusCode).toBe(200);
    }, 40000);

    test("Server error on getting the number of comments on a blog", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const result = await request(app).post(`/blogs/${blogId}/comments`).send({
        name: "Jimmy Mutabazi",
        comment: "some comment to post on the article",
      });

      const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
      jest.spyOn(Comment, "find").mockImplementationOnce(mockfn);
      const errorResponse = await request(app).get(
        `/blogs/${blogId}/comments/comments`
      );
      expect(errorResponse.statusCode).toBe(500);
      jest.spyOn(Comment, "find").mockClear();
    }, 40000);
  });

  describe("operations on likes endpoints", () => {
    test("get the number of blog likes", async () => {
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: image,
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const result = await request(app).get(`/blogs/${blogId}/likes`);
      expect(result.statusCode).toBe(200);

      const nonMongooseIdResult = await request(app).get(
        `/blogs/fdfeddefdfd/likes`
      );
      expect(nonMongooseIdResult.statusCode).toBe(400);

      const notFoundResult = await request(app).get(
        `/blogs/63ae8166e9f02b6989aa15ad/likes`
      );
      expect(notFoundResult.statusCode).toBe(404);
    }, 40000);

    test("like or unlike a blog", async () => {
      await request(app).post("/users").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "biryogo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "biryogo@gmail.com", password: "jimmy" });
      const token = loginResponse.body.token;
      await request(app).post("/admins").send({
        firstName: "Sebwato",
        lastName: "Musajya",
        email: "masabo@gmail.com",
        password: "jimmy",
        comfirmPassword: "jimmy",
      });
      const adminLoginResponse = await request(app)
        .post("/login")
        .send({ email: "masabo@gmail.com", password: "jimmy" });
      const adminToken = adminLoginResponse.body.token;
      const response = await request(app)
        .post("/blogs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "updating a blog",
          description:
            "Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done Jimmy work done",
          file: image,
        });
      const blogId = response.body._id;
      const resultAdmin = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(resultAdmin.statusCode).toBe(401);

      const result = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.statusCode).toBe(200);
      jest
        .spyOn(Blog, "updateOne")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      const ServerErrorBlogUpResultOne = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(ServerErrorBlogUpResultOne.statusCode).toBe(500);
      jest.spyOn(Blog, "updateOne").mockClear();

      jest
        .spyOn(Like, "findOneAndDelete")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      const ServerErrorDelLikeResult = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(ServerErrorDelLikeResult.statusCode).toBe(500);
      jest.spyOn(Like, "findOneAndDelete").mockClear();

      const badIdErrorResult = await request(app)
        .put(`/blogs/jdfdfdgrereisujk/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(badIdErrorResult.statusCode).toBe(400);

      const blogNotFoundErrResult = await request(app)
        .put(`/blogs/63ae8166e9f02b6989aa15ad/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(blogNotFoundErrResult.statusCode).toBe(404);

      const dislikeResult = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(dislikeResult.statusCode).toBe(200);

      jest
        .spyOn(Blog, "updateOne")
        .mockImplementationOnce(
          jest.fn().mockRejectedValue(new Error("Internal error"))
        );
      const ServerErrorBlogUpResult = await request(app)
        .put(`/blogs/${blogId}/likes`)
        .set("Authorization", `Bearer ${token}`);
      expect(ServerErrorBlogUpResult.statusCode).toBe(500);
      jest.spyOn(Blog, "updateOne").mockClear();
    });
  });
});

//testing endpoints on users (create, and read)
describe("User endpoints", () => {
  test("Get all users", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const result = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(result.statusCode).toBe(200);

    const resultUsersNumber = await request(app)
      .get("/users/users")
      .set("Authorization", `Bearer ${token}`);
    expect(resultUsersNumber.statusCode).toBe(200);

    jest
      .spyOn(User, "find")
      .mockImplementationOnce(
        jest.fn().mockRejectedValue(new Error("Internal server error"))
      );
    const resultUsersNumberIntErr = await request(app)
      .get("/users/users")
      .set("Authorization", `Bearer ${token}`);
    expect(resultUsersNumberIntErr.statusCode).toBe(500);
  });

  test("Get all users and you are not admin", async () => {
    await request(app).post("/users").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const result = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(result.statusCode).toBe(401);
  });

  test("server error in get all users", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
    jest.spyOn(User, "find").mockImplementationOnce(mockfn);
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(500);
    jest.spyOn(User, "find").mockClear();
  });

  test("create a user account", async () => {
    const result = await request(app).post("/users").send({
      firstName: "dan",
      lastName: "david",
      email: "daviddan@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    expect(result.statusCode).toBe(200);

    const notPassValidation = await request(app).post("/users").send({
      lastName: "david",
      email: "daviddan@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    expect(notPassValidation.statusCode).toBe(400);
  });

  test("Should return an error if email is already registered", async () => {
    await request(app).post("/users").send({
      firstName: "dan",
      lastName: "david",
      email: "daviddan@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const result = await request(app).post("/users").send({
      firstName: "dan",
      lastName: "david",
      email: "daviddan@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    expect(result.statusCode).toBe(400);
    expect(result.body.message).toBe("This email is already regisered");
  });
});

//testing endpoints on messages/contactMe (send,read,single,delete)
describe("Message endpoints", () => {
  test("Get all messages, and number of messages", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const result = await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${token}`);
    expect(result.statusCode).toBe(200);

    const numberResult = await request(app)
      .get("/messages/messages")
      .set("Authorization", `Bearer ${token}`);
    expect(numberResult.statusCode).toBe(200);

    jest
      .spyOn(Message, "find")
      .mockImplementation(
        jest.fn().mockRejectedValue(new Error("Database error"))
      );
    const serverErrorOne = await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${token}`);
    expect(serverErrorOne.statusCode).toBe(500);

    const serverErrorTwo = await request(app)
      .get("/messages/messages")
      .set("Authorization", `Bearer ${token}`);
    expect(serverErrorTwo.statusCode).toBe(500);
  });

  test("Send a message, get a single message and delete it", async () => {
    const validResult = await request(app).post("/messages").send({
      contEmail: "tuyisenge@tuy.com",
      phone: "+250777000000",
      message: "Plain text to send in the message",
    });
    expect(validResult.statusCode).toBe(400);

    const result = await request(app).post("/messages").send({
      contName: "Olivier Tuyisenge",
      contEmail: "tuyisenge@tuy.com",
      phone: "+250777000000",
      message: "Plain text to send in the message",
    });
    const messageId = result.body._id;
    expect(result.statusCode).toBe(200);

    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const singleResult = await request(app)
      .get(`/messages/${messageId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(singleResult.statusCode).toBe(200);

    const singleErrorResult = await request(app)
      .get(`/messages/ggfgfgfd`)
      .set("Authorization", `Bearer ${token}`);
    expect(singleErrorResult.statusCode).toBe(400);

    const singleErrorNotExist = await request(app)
      .get(`/messages/63ac6153042cf31311085132`)
      .set("Authorization", `Bearer ${token}`);
    expect(singleErrorNotExist.statusCode).toBe(404);

    const delErrorResult = await request(app)
      .delete(`/messages/jgfdwdsd`)
      .set("Authorization", `Bearer ${token}`);
    expect(delErrorResult.statusCode).toBe(400);

    const delErrorResultBad = await request(app)
      .delete(`/messages/63ac6153042cf31311085132`)
      .set("Authorization", `Bearer ${token}`);
    expect(delErrorResultBad.statusCode).toBe(404);

    const delResult = await request(app)
      .delete(`/messages/${messageId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delResult.statusCode).toBe(204);
    jest
      .spyOn(Message, "findOne")
      .mockImplementation(
        jest.fn().mockRejectedValue(new Error("Database error"))
      );
    jest
      .spyOn(Message, "findById")
      .mockImplementation(
        jest.fn().mockRejectedValue(new Error("Database error"))
      );
    jest
      .spyOn(Message, "findOneAndDelete")
      .mockImplementationOnce(
        jest.fn().mockRejectedValue(new Error("Database error"))
      );
    const delResultServerErr = await request(app)
      .delete(`/messages/${messageId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delResultServerErr.statusCode).toBe(500);

    const singleResultservErrror = await request(app)
      .get(`/messages/${messageId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(singleResultservErrror.statusCode).toBe(500);
  });

  test("server error in get all messages", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
    jest.spyOn(Message, "find").mockImplementationOnce(mockfn);
    const response = await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(500);
    jest.spyOn(Message, "find").mockClear();
  });

  test("server error in sending a message", async () => {
    const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
    jest.spyOn(Message.prototype, "save").mockImplementationOnce(mockfn);
    const response = await request(app).post("/messages").send({
      contName: "Olivier Tuyisenge",
      contEmail: "tuyisenge@tuy.com",
      phone: "+250777000000",
      message: "Plain text to send in the message",
    });
    expect(response.status).toBe(500);
    jest.spyOn(Message.prototype, "save").mockClear();
  });
});

describe("Common endpoints", () => {
  test("Success login", async () => {
    await request(app).post("/admins").send({
      firstName: "Sebwato",
      lastName: "Musajya",
      email: "biryogo@gmail.com",
      password: "jimmy",
      comfirmPassword: "jimmy",
    });
    const passportLoginErrorResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "gffcsjhtf" });
    expect(passportLoginErrorResponse.statusCode).toBe(401);

    const ValidatloginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com" });
    expect(ValidatloginResponse.statusCode).toBe(400);

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "biryogo@gmail.com", password: "jimmy" });
    const token = loginResponse.body.token;
    expect(loginResponse.statusCode).toBe(200);

    const logoutResult = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(logoutResult.statusCode).toBe(200);
  });

  test("Page not found", async () => {
    const result = await request(app).post("/log");
    expect(result.statusCode).toBe(404);
  });
});

test("passport-local test", async () => {
  const loginResponse = await request(app)
    .post("/login")
    .send({ email: "biryogo@gmail.com", password: "jimmy" });
  expect(loginResponse.statusCode).toBe(401);
});

test("If error on creating a user account", async () => {
  const mockfn = jest.fn().mockRejectedValue(new Error("Database error"));
  jest.spyOn(User.prototype, "save").mockImplementationOnce(mockfn);
  const resultServerErr = await request(app).post("/users").send({
    firstName: "dan",
    lastName: "david",
    email: "daviddan@gmail.com",
    password: "jimmy",
    comfirmPassword: "jimmy",
  });

  expect(resultServerErr.statusCode).toBe(500);
  jest.spyOn(User.prototype, "save").mockClear();
});

test("testing server error on admin sighnup", async () => {
  jest
    .spyOn(User.prototype, "save")
    .mockImplementationOnce(
      jest.fn().mockRejectedValue(new Error("Server error!"))
    );
  const serverErr = await request(app).post("/admins").send({
    firstName: "Sebwato",
    lastName: "Musajya",
    email: "biryogo@gmail.com",
    password: "jimmy",
    comfirmPassword: "jimmy",
  });
  expect(serverErr.statusCode).toBe(500);
  jest.spyOn(User.prototype, "save").mockClear();
});

test("test server error on getting all blogs", async () => {
  jest
    .spyOn(Blog, "find")
    .mockImplementationOnce(
      jest.fn().mockRejectedValue(new Error("Server error!"))
    );
  const ErrorResult = await request(app).get("/blogs");
  expect(ErrorResult.statusCode).toBe(500);
});
