import request from "supertest";
import app from "../src/app.js";
import Transaction from "../src/models/transaction.js";
import Contribution from "../src/models/contribution.js";
import BudgetItem from "../src/models/budgetItem.js";
import Debt from "../src/models/debt.js";
import Goal from "../src/models/goal.js";
import Account from "../src/models/account.js";
import Asset from "../src/models/asset.js";
import { authAs, makeAdmin, makeUser, mockSave, oid } from "./helpers";

let auth;
beforeEach(() => {
  auth = authAs(makeAdmin());
});
const get = (path) => request(app).get(path).set("Authorization", auth);
const post = (path, body) => request(app).post(path).set("Authorization", auth).send(body);
const patch = (path, body) => request(app).patch(path).set("Authorization", auth).send(body);
const del = (path) => request(app).delete(path).set("Authorization", auth);

describe("access control", () => {
  test("every finance route is admin-only", async () => {
    expect((await request(app).get("/finance")).status).toBe(401);
    const userAuth = authAs(makeUser());
    expect((await request(app).get("/finance").set("Authorization", userAuth)).status).toBe(403);
    expect((await request(app).post("/finance/transactions").set("Authorization", userAuth).send({})).status).toBe(403);
  });
});

describe("GET /finance (state)", () => {
  test("returns every collection with string ids", async () => {
    jest.spyOn(Transaction, "find").mockResolvedValue([new Transaction({ kind: "income", amount: 10 })]);
    jest.spyOn(Contribution, "find").mockResolvedValue([new Contribution({ bucket: "b", amount: 5 })]);
    jest.spyOn(BudgetItem, "find").mockResolvedValue([new BudgetItem({ name: "Rent" })]);
    jest.spyOn(Debt, "find").mockResolvedValue([new Debt({ name: "Loan", payments: [{ amount: 1, date: "2026-01-01" }] })]);
    jest.spyOn(Goal, "find").mockResolvedValue([new Goal({ name: "Car" })]);
    jest.spyOn(Account, "find").mockResolvedValue([new Account({ name: "BK" })]);
    jest.spyOn(Asset, "find").mockResolvedValue([new Asset({ name: "Plot", type: "land" })]);

    const res = await get("/finance");

    expect(res.status).toBe(200);
    for (const key of ["tx", "contribs", "budgetItems", "debts", "goals", "accounts", "assets"]) {
      expect(res.body[key]).toHaveLength(1);
      expect(res.body[key][0].id).toBe(res.body[key][0]._id);
    }
    expect(res.body.debts[0].payments[0].id).toBe(res.body.debts[0].payments[0]._id);
  });

  test("500 when any collection fails", async () => {
    jest.spyOn(Transaction, "find").mockRejectedValue(new Error("db"));
    for (const M of [Contribution, BudgetItem, Debt, Goal, Account, Asset]) jest.spyOn(M, "find").mockResolvedValue([]);
    expect((await get("/finance")).status).toBe(500);
  });
});

/**
 * Shared create / update / delete behaviour for the simple resources.
 * Each entry: model, base path, a create body (unknown keys must be dropped)
 * and an update body that should be reflected on the document afterwards.
 */
const crud = [
  {
    name: "transactions", Model: Transaction, path: "/finance/transactions",
    create: { kind: "expense", amount: 500, category: "food", desc: "lunch", date: "2026-08-01", account: "Cash" },
    update: { kind: "income", amount: 700, category: "salary", desc: "pay", date: "2026-08-02", account: "MTN" },
  },
  {
    name: "budget-items", Model: BudgetItem, path: "/finance/budget-items",
    create: { name: "Rent", amount: 100, spent: 0, priority: "high", order: 1, month: "2026-08" },
    update: { name: "Housing", amount: 120, spent: 50, priority: "low", order: 3, month: "2026-09" },
  },
  {
    name: "goals", Model: Goal, path: "/finance/goals",
    create: { name: "Car", short: "C", target: 1000, color: "#000", startMonth: "2026-01", targetSchedule: [{ month: "2026-06", target: 2000 }] },
    update: { target: 3000, overrideFor: "ejoheza" },
  },
  {
    name: "accounts", Model: Account, path: "/finance/accounts",
    create: { name: "BK", type: "savings", color: "#fff", openingBalance: 10, order: 2 },
    update: { archived: true, openingBalance: 99 },
  },
  {
    name: "assets", Model: Asset, path: "/finance/assets",
    create: { name: "Plot", type: "land", value: 5000, cost: 4000, size: 300, upi: "1/02", wallet: "BK", unknownField: "ignored" },
    update: { sold: true, soldAmount: 6000, soldWallet: "Cash", value: 0 },
  },
];

describe.each(crud)("$name", ({ Model, path, create, update }) => {
  const { unknownField, ...known } = create;

  test("POST creates the record", async () => {
    const save = mockSave(Model);
    const res = await post(path, create);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(known);
    expect(res.body.unknownField).toBeUndefined();
    expect(res.body.id).toBe(res.body._id);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test("POST 500 when saving fails", async () => {
    jest.spyOn(Model.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await post(path, create)).status).toBe(500);
  });

  test("PATCH 400 / 404 / 200 / 500", async () => {
    expect((await patch(`${path}/bad`, update)).status).toBe(400);

    jest.spyOn(Model, "findById").mockResolvedValueOnce(null);
    expect((await patch(`${path}/${oid()}`, update)).status).toBe(404);

    const doc = new Model(known);
    jest.spyOn(Model, "findById").mockResolvedValue(doc);
    mockSave(Model);
    const ok = await patch(`${path}/${doc._id}`, update);
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject(update);
    expect(ok.body.id).toBe(String(doc._id));

    jest.spyOn(Model.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await patch(`${path}/${doc._id}`, update)).status).toBe(500);
  });

  test("DELETE 400 / 404 / 204 / 500", async () => {
    expect((await del(`${path}/bad`)).status).toBe(400);

    jest.spyOn(Model, "findById").mockResolvedValueOnce(null);
    expect((await del(`${path}/${oid()}`)).status).toBe(404);

    const id = oid();
    jest.spyOn(Model, "findById").mockResolvedValue({ _id: id });
    const remove = jest.spyOn(Model, "deleteOne").mockResolvedValueOnce({});
    jest.spyOn(Contribution, "deleteMany").mockResolvedValue({});
    expect((await del(`${path}/${id}`)).status).toBe(204);
    expect(remove).toHaveBeenCalledWith({ _id: id });

    jest.spyOn(Model, "deleteOne").mockRejectedValueOnce(new Error("db"));
    expect((await del(`${path}/${id}`)).status).toBe(500);
  });
});

describe("contributions", () => {
  test("POST normalises kind and defaults account/wallet", async () => {
    mockSave(Contribution);
    let res = await post("/finance/contributions", { month: "2026-08", bucket: "ejoheza", amount: 30000, date: "2026-08-05" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ kind: "deposit", account: "", wallet: "" });
    res = await post("/finance/contributions", { month: "2026-08", bucket: "ejoheza", amount: 1, kind: "withdrawal", wallet: "MTN" });
    expect(res.body).toMatchObject({ kind: "withdrawal", wallet: "MTN" });
  });

  test("POST 500 when saving fails", async () => {
    jest.spyOn(Contribution.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await post("/finance/contributions", {})).status).toBe(500);
  });

  test("PATCH 400 / 404 / 200 (kind normalised) / 500", async () => {
    expect((await patch("/finance/contributions/bad", {})).status).toBe(400);
    jest.spyOn(Contribution, "findById").mockResolvedValueOnce(null);
    expect((await patch(`/finance/contributions/${oid()}`, {})).status).toBe(404);

    const doc = new Contribution({ month: "2026-01", bucket: "b", amount: 1 });
    jest.spyOn(Contribution, "findById").mockResolvedValue(doc);
    mockSave(Contribution);
    const ok = await patch(`/finance/contributions/${doc._id}`, { month: "2026-02", bucket: "c", amount: 2, date: "d", account: "A", wallet: "W", kind: "nonsense" });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ month: "2026-02", bucket: "c", amount: 2, date: "d", account: "A", wallet: "W", kind: "deposit" });
    const withdrawn = await patch(`/finance/contributions/${doc._id}`, { kind: "withdrawal" });
    expect(withdrawn.body.kind).toBe("withdrawal");

    jest.spyOn(Contribution.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await patch(`/finance/contributions/${doc._id}`, { kind: "withdrawal" })).status).toBe(500);
  });

  test("DELETE 400 / 404 / 204 / 500", async () => {
    expect((await del("/finance/contributions/bad")).status).toBe(400);
    jest.spyOn(Contribution, "findById").mockResolvedValueOnce(null);
    expect((await del(`/finance/contributions/${oid()}`)).status).toBe(404);
    const id = oid();
    jest.spyOn(Contribution, "findById").mockResolvedValue({ _id: id });
    jest.spyOn(Contribution, "deleteOne").mockResolvedValueOnce({});
    expect((await del(`/finance/contributions/${id}`)).status).toBe(204);
    jest.spyOn(Contribution, "deleteOne").mockRejectedValueOnce(new Error("db"));
    expect((await del(`/finance/contributions/${id}`)).status).toBe(500);
  });
});

describe("budget items: list, copy, reorder", () => {
  test("GET /finance/budget-items 200 / 500", async () => {
    jest.spyOn(BudgetItem, "find").mockResolvedValueOnce([new BudgetItem({ name: "Rent" })]);
    const ok = await get("/finance/budget-items");
    expect(ok.status).toBe(200);
    expect(ok.body[0]).toMatchObject({ name: "Rent" });
    jest.spyOn(BudgetItem, "find").mockRejectedValueOnce(new Error("db"));
    expect((await get("/finance/budget-items")).status).toBe(500);
  });

  describe("POST /finance/budget-items/copy", () => {
    test("400 without itemIds / toMonth", async () => {
      expect((await post("/finance/budget-items/copy", { toMonth: "2026-09" })).status).toBe(400);
      expect((await post("/finance/budget-items/copy", { itemIds: [oid()] })).status).toBe(400);
      expect((await post("/finance/budget-items/copy", { itemIds: [], toMonth: "2026-09" })).status).toBe(400);
    });

    test("200 [] when no source item matches", async () => {
      jest.spyOn(BudgetItem, "find").mockResolvedValue([]);
      const res = await post("/finance/budget-items/copy", { itemIds: [oid(), "bad"], toMonth: "2026-09" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(BudgetItem.find).toHaveBeenCalledTimes(1);
    });

    test("201 copies in the requested order, continuing `order`, skipping duplicates", async () => {
      const rent = new BudgetItem({ name: "Rent", amount: 100, spent: 40, priority: "high", month: "2026-08" });
      const food = new BudgetItem({ name: "Food", amount: 50, priority: "medium", month: "2026-08" });
      const foodAgain = new BudgetItem({ name: " food ", amount: 1, month: "2026-08" });
      const existing = new BudgetItem({ name: "rent", amount: 100, month: "2026-09", order: 4 });
      jest.spyOn(BudgetItem, "find").mockResolvedValueOnce([rent, food, foodAgain]).mockResolvedValueOnce([existing]);
      const insertMany = jest.spyOn(BudgetItem, "insertMany").mockImplementation(async (docs) => docs.map((d) => new BudgetItem(d)));

      const res = await post("/finance/budget-items/copy", {
        itemIds: [String(foodAgain._id), String(food._id), String(rent._id)],
        toMonth: "2026-09",
      });

      expect(res.status).toBe(201);
      // "Rent" already exists in the target month; "Food" dedupes against " food "
      expect(insertMany).toHaveBeenCalledWith([
        { name: " food ", amount: 1, spent: 0, priority: "low", month: "2026-09", order: 5 },
      ]);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ name: " food ", month: "2026-09", spent: 0, order: 5 });
    });

    test("200 [] when everything is already planned in the target month", async () => {
      const rent = new BudgetItem({ name: "Rent", month: "2026-08" });
      jest.spyOn(BudgetItem, "find").mockResolvedValueOnce([rent]).mockResolvedValueOnce([new BudgetItem({ name: "RENT", month: "2026-09" })]);
      const insertMany = jest.spyOn(BudgetItem, "insertMany");
      const res = await post("/finance/budget-items/copy", { itemIds: [String(rent._id)], toMonth: "2026-09" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(insertMany).not.toHaveBeenCalled();
    });

    test("500 on a database error", async () => {
      jest.spyOn(BudgetItem, "find").mockRejectedValue(new Error("db"));
      expect((await post("/finance/budget-items/copy", { itemIds: [oid()], toMonth: "2026-09" })).status).toBe(500);
    });
  });

  describe("PATCH /finance/budget-items/reorder", () => {
    test("400 when ids is not an array", async () => {
      expect((await patch("/finance/budget-items/reorder", { ids: "x" })).status).toBe(400);
    });

    test("200 sets order by index, ignoring malformed ids", async () => {
      const [a, b] = [oid(), oid()];
      const updateOne = jest.spyOn(BudgetItem, "updateOne").mockResolvedValue({});
      const res = await patch("/finance/budget-items/reorder", { ids: [a, "bad", b] });
      expect(res.status).toBe(200);
      expect(updateOne).toHaveBeenCalledTimes(2);
      expect(updateOne).toHaveBeenCalledWith({ _id: a }, { $set: { order: 0 } });
      expect(updateOne).toHaveBeenCalledWith({ _id: b }, { $set: { order: 1 } });
    });

    test("500 on a database error", async () => {
      jest.spyOn(BudgetItem, "updateOne").mockRejectedValue(new Error("db"));
      expect((await patch("/finance/budget-items/reorder", { ids: [oid()] })).status).toBe(500);
    });
  });
});

describe("debts", () => {
  test("GET /finance/debts 200 / 500", async () => {
    jest.spyOn(Debt, "find").mockResolvedValueOnce([new Debt({ name: "Loan", payments: [{ amount: 5 }] })]);
    const ok = await get("/finance/debts");
    expect(ok.status).toBe(200);
    expect(ok.body[0].payments[0].id).toBeDefined();
    jest.spyOn(Debt, "find").mockRejectedValueOnce(new Error("db"));
    expect((await get("/finance/debts")).status).toBe(500);
  });

  test("POST normalises direction, account and payments", async () => {
    mockSave(Debt);
    let res = await post("/finance/debts", { name: "Loan", amount: 100, direction: "lent", payments: [{ amount: 10, date: "2026-01-01" }] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ direction: "lent", account: "", payments: [{ amount: 10, date: "2026-01-01", account: "" }] });
    res = await post("/finance/debts", { name: "Loan", direction: "whatever", payments: "not-an-array", account: "BK" });
    expect(res.body).toMatchObject({ direction: "borrowed", account: "BK", payments: [] });

    jest.spyOn(Debt.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await post("/finance/debts", {})).status).toBe(500);
  });

  test("PATCH 400 / 404 / 200 / 500", async () => {
    expect((await patch("/finance/debts/bad", {})).status).toBe(400);
    jest.spyOn(Debt, "findById").mockResolvedValueOnce(null);
    expect((await patch(`/finance/debts/${oid()}`, {})).status).toBe(404);

    const debt = new Debt({ name: "Loan", amount: 100, payments: [{ amount: 1 }] });
    jest.spyOn(Debt, "findById").mockResolvedValue(debt);
    mockSave(Debt);
    let ok = await patch(`/finance/debts/${debt._id}`, { name: "Loan 2", amount: 200, date: "d", due: "e", desc: "x", account: "BK", direction: "lent" });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ name: "Loan 2", amount: 200, date: "d", due: "e", desc: "x", account: "BK", direction: "lent" });
    expect(ok.body.payments).toHaveLength(1); // untouched when not provided
    ok = await patch(`/finance/debts/${debt._id}`, { direction: "other", payments: [{ amount: 7, date: "2026-02-02" }, { amount: 8 }] });
    expect(ok.body.direction).toBe("borrowed");
    expect(ok.body.payments).toHaveLength(2);
    expect(ok.body.payments[0]).toMatchObject({ amount: 7, date: "2026-02-02", account: "" });

    jest.spyOn(Debt.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await patch(`/finance/debts/${debt._id}`, { name: "x" })).status).toBe(500);
  });

  test("DELETE 400 / 404 / 204 / 500", async () => {
    expect((await del("/finance/debts/bad")).status).toBe(400);
    jest.spyOn(Debt, "findById").mockResolvedValueOnce(null);
    expect((await del(`/finance/debts/${oid()}`)).status).toBe(404);
    const id = oid();
    jest.spyOn(Debt, "findById").mockResolvedValue({ _id: id });
    jest.spyOn(Debt, "deleteOne").mockResolvedValueOnce({});
    expect((await del(`/finance/debts/${id}`)).status).toBe(204);
    jest.spyOn(Debt, "deleteOne").mockRejectedValueOnce(new Error("db"));
    expect((await del(`/finance/debts/${id}`)).status).toBe(500);
  });

  test("POST /finance/debts/:id/payments 400 / 404 / 200 / 500", async () => {
    expect((await post("/finance/debts/bad/payments", { amount: 1 })).status).toBe(400);
    jest.spyOn(Debt, "findById").mockResolvedValueOnce(null);
    expect((await post(`/finance/debts/${oid()}/payments`, { amount: 1 })).status).toBe(404);

    const debt = new Debt({ name: "Loan", amount: 100 });
    jest.spyOn(Debt, "findById").mockResolvedValue(debt);
    mockSave(Debt);
    const ok = await post(`/finance/debts/${debt._id}/payments`, { amount: 25, date: "2026-03-03" });
    expect(ok.status).toBe(200);
    expect(ok.body.payments).toHaveLength(1);
    expect(ok.body.payments[0]).toMatchObject({ amount: 25, date: "2026-03-03", account: "" });
    expect(ok.body.payments[0].id).toBe(ok.body.payments[0]._id);

    jest.spyOn(Debt.prototype, "save").mockRejectedValue(new Error("db"));
    expect((await post(`/finance/debts/${debt._id}/payments`, { amount: 1 })).status).toBe(500);
  });
});

describe("goals: deleting cascades to contributions", () => {
  test("DELETE removes the goal's contributions by bucket", async () => {
    const id = oid();
    jest.spyOn(Goal, "findById").mockResolvedValue({ _id: id });
    jest.spyOn(Goal, "deleteOne").mockResolvedValue({});
    const deleteMany = jest.spyOn(Contribution, "deleteMany").mockResolvedValue({});
    expect((await del(`/finance/goals/${id}`)).status).toBe(204);
    expect(deleteMany).toHaveBeenCalledWith({ bucket: id });
  });
});

describe("accounts: renaming cascades to records", () => {
  const cascadeSpies = () => ({
    tx: jest.spyOn(Transaction, "updateMany").mockResolvedValue({}),
    contrib: jest.spyOn(Contribution, "updateMany").mockResolvedValue({}),
    goal: jest.spyOn(Goal, "updateMany").mockResolvedValue({}),
  });

  test("a rename rewrites account/wallet references", async () => {
    const account = new Account({ name: "BK" });
    jest.spyOn(Account, "findById").mockResolvedValue(account);
    mockSave(Account);
    const spies = cascadeSpies();
    const res = await patch(`/finance/accounts/${account._id}`, { name: "Bank of Kigali" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Bank of Kigali");
    expect(spies.tx).toHaveBeenCalledWith({ account: "BK" }, { $set: { account: "Bank of Kigali" } });
    expect(spies.contrib).toHaveBeenCalledWith({ account: "BK" }, { $set: { account: "Bank of Kigali" } });
    expect(spies.contrib).toHaveBeenCalledWith({ wallet: "BK" }, { $set: { wallet: "Bank of Kigali" } });
    expect(spies.goal).toHaveBeenCalledWith({ account: "BK" }, { $set: { account: "Bank of Kigali" } });
  });

  test("no cascade when the name is unchanged or was empty", async () => {
    const spies = cascadeSpies();
    mockSave(Account);
    jest.spyOn(Account, "findById").mockResolvedValueOnce(new Account({ name: "BK" }));
    expect((await patch(`/finance/accounts/${oid()}`, { name: "BK", color: "#123" })).status).toBe(200);
    jest.spyOn(Account, "findById").mockResolvedValueOnce(new Account({ name: "" }));
    expect((await patch(`/finance/accounts/${oid()}`, { name: "New" })).status).toBe(200);
    expect(spies.tx).not.toHaveBeenCalled();
    expect(spies.contrib).not.toHaveBeenCalled();
    expect(spies.goal).not.toHaveBeenCalled();
  });

  test("500 when the cascade fails", async () => {
    jest.spyOn(Account, "findById").mockResolvedValue(new Account({ name: "BK" }));
    mockSave(Account);
    jest.spyOn(Transaction, "updateMany").mockRejectedValue(new Error("db"));
    jest.spyOn(Contribution, "updateMany").mockResolvedValue({});
    jest.spyOn(Goal, "updateMany").mockResolvedValue({});
    expect((await patch(`/finance/accounts/${oid()}`, { name: "Other" })).status).toBe(500);
  });
});
