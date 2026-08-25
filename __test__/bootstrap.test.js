/**
 * The server entrypoint and the seed script both run side effects on import,
 * so each scenario reloads them in a fresh module registry with mongoose
 * and `app.listen` mocked. Nothing here opens a real connection.
 */
const flush = () => new Promise((resolve) => setImmediate(resolve));
const waitFor = async (predicate, tries = 500) => {
  for (let i = 0; i < tries; i += 1) {
    if (predicate()) return;
    await flush();
  }
  throw new Error("condition not met");
};
const lastCall = (spy) => spy.mock.calls[spy.mock.calls.length - 1];

// A freshly required mongoose after jest.resetModules() does not carry the
// settings from jest.setup.js, so re-apply them: an un-mocked query must fail
// fast instead of buffering for 10s past the end of the test.
const freshMongoose = () => {
  const mongoose = require("mongoose");
  mongoose.set("bufferCommands", false);
  mongoose.set("strictQuery", true);
  return mongoose;
};

describe("src/index.js", () => {
  const boot = async ({ env, connectError } = {}) => {
    jest.resetModules();
    process.env.NODE_ENV = env;
    process.env.PORT = "4001";
    process.env.TEST_PORT = "4002";
    process.env.DEV_DB = "mongodb://dev";
    process.env.TEST_DB = "mongodb://test";
    process.env.REMOTE_DB = "mongodb://remote";
    const mongoose = freshMongoose();
    const connect = jest.spyOn(mongoose, "connect");
    if (connectError) connect.mockRejectedValue(connectError);
    else connect.mockResolvedValue(mongoose);
    const app = require("../src/app.js").default;
    const listen = jest.spyOn(app, "listen").mockImplementation((port, cb) => {
      if (cb) cb();
      return { close() {} };
    });
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    require("../src/index.js");
    await waitFor(() => listen.mock.calls.length > 0 || log.mock.calls.length > 0);
    return { connect, listen, log };
  };

  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  test("development connects to DEV_DB and listens on PORT", async () => {
    const { connect, listen } = await boot({ env: "development" });
    expect(connect).toHaveBeenCalledWith("mongodb://dev", expect.any(Object));
    expect(listen).toHaveBeenCalledWith("4001", expect.any(Function));
  });

  test("testing connects to TEST_DB and listens on TEST_PORT", async () => {
    const { connect, listen } = await boot({ env: "testing" });
    expect(connect).toHaveBeenCalledWith("mongodb://test", expect.any(Object));
    expect(listen).toHaveBeenCalledWith("4002", expect.any(Function));
  });

  test("anything else connects to REMOTE_DB", async () => {
    const { connect, listen } = await boot({ env: "production" });
    expect(connect).toHaveBeenCalledWith("mongodb://remote", expect.any(Object));
    expect(listen).toHaveBeenCalledWith("4001", expect.any(Function));
  });

  test("a failed connection is logged and the server does not start", async () => {
    const error = new Error("refused");
    const { listen, log } = await boot({ env: "development", connectError: error });
    expect(listen).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(error);
  });
});

describe("src/scripts/seedSavings.js", () => {
  // Months from 2025-01 through last month: mirrors the script's own rule.
  const expectedMonths = () => {
    const now = new Date();
    let y = now.getFullYear();
    let m = now.getMonth(); // 0-based, so this already equals "last month" in 1-based terms
    if (m < 1) { m = 12; y -= 1; }
    const out = [];
    let cy = 2025;
    let cm = 1;
    while (cy < y || (cy === y && cm <= m)) {
      out.push(`${cy}-${String(cm).padStart(2, "0")}`);
      cm += 1;
      if (cm > 12) { cm = 1; cy += 1; }
    }
    return out;
  };

  // `exitCalls`: how many process.exit calls mark the end of the run. The
  // mocked exit does not stop the script, so a run that exits early keeps
  // going and must still be awaited to completion.
  const runSeed = async ({ env = "testing", argv = [], findOne, connectError, uri = "mongodb://seed", exitCalls = 1 } = {}) => {
    jest.resetModules();
    process.env.NODE_ENV = env;
    process.env.TEST_DB = uri;
    process.env.DEV_DB = uri;
    process.env.REMOTE_DB = uri;
    process.argv = ["node", "seedSavings.js", ...argv];
    const mongoose = freshMongoose();
    const connect = jest.spyOn(mongoose, "connect");
    if (connectError) connect.mockRejectedValue(connectError);
    else connect.mockResolvedValue(mongoose);
    jest.spyOn(mongoose, "disconnect").mockResolvedValue();
    const Contribution = require("../src/models/contribution.js").default;
    jest.spyOn(Contribution, "findOne").mockImplementation(findOne || (async () => null));
    const create = jest.spyOn(Contribution, "create").mockResolvedValue({});
    const exit = jest.spyOn(process, "exit").mockImplementation(() => {});
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    require("../src/scripts/seedSavings.js");
    await waitFor(() => exit.mock.calls.length >= exitCalls);
    return { connect, create, exit, log, error, Contribution };
  };

  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  test("backfills every plan bucket for every month when nothing exists", async () => {
    const { connect, create, exit, log } = await runSeed();
    const months = expectedMonths();
    expect(connect).toHaveBeenCalledWith("mongodb://seed", expect.any(Object));
    expect(create).toHaveBeenCalledTimes(months.length * 4);
    expect(create).toHaveBeenCalledWith({
      bucket: "ejoheza", month: "2025-01", amount: 30000, date: "2025-01-05", account: "Ejo Heza", kind: "deposit",
    });
    expect(exit).toHaveBeenCalledWith(0);
    expect(lastCall(log)[0]).toMatch(new RegExp(`Created ${months.length * 4} deposit`));
  });

  test("leaves a bucket alone once it has any deposit (default mode)", async () => {
    const findOne = async (q) => (q.bucket === "child1" && q.month === undefined ? {} : null);
    const { create, log } = await runSeed({ findOne });
    expect(create).toHaveBeenCalledTimes(expectedMonths().length * 3);
    expect(create.mock.calls.every(([doc]) => doc.bucket !== "child1")).toBe(true);
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/Skipping child1/));
  });

  test("--force fills only the missing months", async () => {
    const findOne = async (q) => (q.month === "2025-01" ? {} : null);
    const { create, log } = await runSeed({ argv: ["--force"], findOne });
    expect(create).toHaveBeenCalledTimes((expectedMonths().length - 1) * 4);
    expect(lastCall(log)[0]).toMatch(/4 existing month\(s\)/);
  });

  test("picks the database from NODE_ENV", async () => {
    let r = await runSeed({ env: "production", uri: "mongodb://prod" });
    expect(r.connect).toHaveBeenCalledWith("mongodb://prod", expect.any(Object));
    r = await runSeed({ env: "development", uri: "mongodb://devdb" });
    expect(r.connect).toHaveBeenCalledWith("mongodb://devdb", expect.any(Object));
  });

  test("exits with 1 when no database uri is configured", async () => {
    // exit(1) is a no-op under test, so the script carries on to its normal exit(0)
    const { exit, error } = await runSeed({ env: "development", uri: "", exitCalls: 2 });
    expect(exit.mock.calls[0]).toEqual([1]);
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/No database URI/));
  });

  test("reports a failure and exits with 1 when the connection fails", async () => {
    const { exit, error, create } = await runSeed({ connectError: new Error("refused") });
    expect(create).not.toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
    expect(error).toHaveBeenCalledWith("Seed failed:", expect.any(Error));
  });
});
