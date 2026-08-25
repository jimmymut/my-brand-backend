import mongoose from "mongoose";
import User from "../../src/models/user.js";
import BlackList from "../../src/models/blackList.js";
import encode from "../../src/utils/encodeToken.js";

/** A fresh ObjectId string. */
export const oid = () => new mongoose.Types.ObjectId().toString();

/**
 * A fake Mongoose Query: chainable (`populate`, `select`, ...) and thenable,
 * so it satisfies both `await Model.find()` and `Model.find().populate().then()`.
 * The promise is created lazily so a rejecting query never triggers an
 * "unhandled rejection" before the controller attaches its handlers.
 */
export const query = (result, { reject = false } = {}) => {
  const run = () => (reject ? Promise.reject(result) : Promise.resolve(result));
  const q = {};
  for (const m of ["populate", "select", "sort", "limit", "skip", "lean"]) {
    q[m] = () => q;
  }
  q.exec = run;
  q.then = (onOk, onErr) => run().then(onOk, onErr);
  q.catch = (onErr) => run().catch(onErr);
  return q;
};

/** A query that rejects with an Error. */
export const failing = (message = "Database error") =>
  query(new Error(message), { reject: true });

/** Build an in-memory (unsaved) User document. */
export const makeUser = (overrides = {}) =>
  new User({
    firstName: "Jimmy",
    lastName: "Mutabazi",
    email: "jimmy@example.com",
    title: "user",
    ...overrides,
  });

export const makeAdmin = (overrides = {}) =>
  makeUser({ email: "admin@example.com", title: "admin", ...overrides });

/**
 * Make the "jwt" passport strategy authenticate as `user` and return the
 * Authorization header value to send. Re-call after every mock reset.
 */
export const authAs = (user) => {
  jest.spyOn(BlackList, "findOne").mockResolvedValue(null);
  jest
    .spyOn(User, "findById")
    .mockImplementation(async (id) =>
      String(id) === String(user._id) ? user : null
    );
  return `Bearer ${encode({ _id: user._id })}`;
};

/** Mock `Model.prototype.save` so `doc.save()` resolves with the document itself. */
export const mockSave = (Model) =>
  jest.spyOn(Model.prototype, "save").mockImplementation(function save() {
    return Promise.resolve(this);
  });
