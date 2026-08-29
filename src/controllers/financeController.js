import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import Contribution from "../models/contribution.js";
import BudgetItem from "../models/budgetItem.js";
import Debt from "../models/debt.js";
import Goal from "../models/goal.js";
import Account from "../models/account.js";
import Asset from "../models/asset.js";

const withId = (doc) => {
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
};

// Debts carry nested payments — surface an `id` on each payment too.
const debtWithId = (doc) => {
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  obj.payments = (obj.payments || []).map((p) => ({ ...p, id: p._id ? p._id.toString() : undefined }));
  return obj;
};

export const getState = async (req, res) => {
  try {
    const [tx, contribs, budgetItems, debts, goals, accounts, assets] = await Promise.all([
      Transaction.find(),
      Contribution.find(),
      BudgetItem.find(),
      Debt.find(),
      Goal.find(),
      Account.find(),
      Asset.find(),
    ]);
    return res.status(200).json({
      tx: tx.map(withId),
      contribs: contribs.map(withId),
      budgetItems: budgetItems.map(withId),
      debts: debts.map(debtWithId),
      goals: goals.map(withId),
      accounts: accounts.map(withId),
      assets: assets.map(withId),
    });
  } catch (error) {
    return res.status(500).json({ error: `Error fetching finance state, ${error}` });
  }
};

export const addTx = async (req, res) => {
  try {
    const { kind, amount, category, desc, date, account } = req.body;
    const tx = new Transaction({ kind, amount, category, desc, date, account });
    const saved = await tx.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating transaction, ${error}` });
  }
};

export const updateTx = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const tx = await Transaction.findById(id);
    if (!tx) {
      return res.status(404).json({ error: "Transaction doesn't exist!" });
    }
    const { kind, amount, category, desc, date, account } = req.body;
    if (kind !== undefined) tx.kind = kind;
    if (amount !== undefined) tx.amount = amount;
    if (category !== undefined) tx.category = category;
    if (desc !== undefined) tx.desc = desc;
    if (date !== undefined) tx.date = date;
    if (account !== undefined) tx.account = account;
    const updated = await tx.save();
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating transaction, ${error}` });
  }
};

export const removeTx = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Transaction.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Transaction not found!" });
    }
    await Transaction.deleteOne({ _id: id });
    return res.status(204).json({ message: "Transaction deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting transaction, ${error}` });
  }
};

export const addContribution = async (req, res) => {
  try {
    const { month, bucket, amount, date, account, wallet, kind } = req.body;
    const contrib = new Contribution({
      month, bucket, amount, date,
      account: account || "",
      wallet: wallet || "",
      kind: kind === "withdrawal" ? "withdrawal" : "deposit",
    });
    const saved = await contrib.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating contribution, ${error}` });
  }
};

export const updateContribution = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const contrib = await Contribution.findById(id);
    if (!contrib) {
      return res.status(404).json({ error: "Contribution doesn't exist!" });
    }
    const { month, bucket, amount, date, account, wallet, kind } = req.body;
    if (month !== undefined) contrib.month = month;
    if (bucket !== undefined) contrib.bucket = bucket;
    if (amount !== undefined) contrib.amount = amount;
    if (date !== undefined) contrib.date = date;
    if (account !== undefined) contrib.account = account;
    if (wallet !== undefined) contrib.wallet = wallet;
    if (kind !== undefined) contrib.kind = kind === "withdrawal" ? "withdrawal" : "deposit";
    const updated = await contrib.save();
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating contribution, ${error}` });
  }
};

export const removeContribution = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Contribution.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Contribution not found!" });
    }
    await Contribution.deleteOne({ _id: id });
    return res.status(204).json({ message: "Contribution deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting contribution, ${error}` });
  }
};

export const listBudgetItems = async (req, res) => {
  try {
    const budgetItems = await BudgetItem.find();
    return res.status(200).json(budgetItems.map(withId));
  } catch (error) {
    return res.status(500).json({ error: `Error fetching budget items, ${error}` });
  }
};

export const addBudgetItem = async (req, res) => {
  try {
    const { name, amount, spent, priority, order, month } = req.body;
    const item = new BudgetItem({ name, amount, spent, priority, order, month });
    const saved = await item.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating budget item, ${error}` });
  }
};

// Clone the given plan items into a month (spent reset to 0). The caller passes
// explicit item ids (so legacy month-less items are handled exactly as the UI
// groups them). Copies are appended after any items already in the target month.
export const copyBudgetMonth = async (req, res) => {
  try {
    const { itemIds, toMonth } = req.body;
    if (!toMonth || !Array.isArray(itemIds) || !itemIds.length) {
      return res.status(400).json({ message: "itemIds and toMonth are required" });
    }
    const valid = itemIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const source = await BudgetItem.find({ _id: { $in: valid } });
    if (!source.length) {
      return res.status(200).json([]);
    }
    const existing = await BudgetItem.find({ month: toMonth });
    let order = existing.reduce((m, x) => Math.max(m, x.order || 0), -1) + 1;
    // skip any source item whose name already exists in the target month
    const norm = (s) => String(s || "").trim().toLowerCase();
    const taken = new Set(existing.map((x) => norm(x.name)));
    // keep the order the caller listed the ids in
    const byId = new Map(source.map((it) => [it._id.toString(), it]));
    const ordered = valid.map((id) => byId.get(id)).filter(Boolean);
    const toCopy = [];
    for (const it of ordered) {
      const key = norm(it.name);
      if (taken.has(key)) continue; // already planned this month
      taken.add(key); // also dedupe within this batch
      toCopy.push({ name: it.name, amount: it.amount, spent: 0, priority: it.priority, month: toMonth, order: order++ });
    }
    if (!toCopy.length) {
      return res.status(200).json([]);
    }
    const copies = await BudgetItem.insertMany(toCopy);
    return res.status(201).json(copies.map(withId));
  } catch (error) {
    return res.status(500).json({ error: `Error copying budget, ${error}` });
  }
};

// Bulk reorder — set each item's `order` to its index in the given id list.
export const reorderBudgetItems = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "An array of ids is required" });
    }
    await Promise.all(
      ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id, index) => BudgetItem.updateOne({ _id: id }, { $set: { order: index } }))
    );
    return res.status(200).json({ message: "Reordered" });
  } catch (error) {
    return res.status(500).json({ error: `Error reordering budget items, ${error}` });
  }
};

export const updateBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const item = await BudgetItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Budget item doesn't exist!" });
    }
    const { name, amount, spent, priority, order, month } = req.body;
    if (name !== undefined) item.name = name;
    if (amount !== undefined) item.amount = amount;
    if (spent !== undefined) item.spent = spent;
    if (priority !== undefined) item.priority = priority;
    if (order !== undefined) item.order = order;
    if (month !== undefined) item.month = month;
    const updated = await item.save();
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating budget item, ${error}` });
  }
};

export const removeBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await BudgetItem.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Budget item not found!" });
    }
    await BudgetItem.deleteOne({ _id: id });
    return res.status(204).json({ message: "Budget item deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting budget item, ${error}` });
  }
};

/* ------------------------------------------------------------------ DEBTS */
export const listDebts = async (req, res) => {
  try {
    const debts = await Debt.find();
    return res.status(200).json(debts.map(debtWithId));
  } catch (error) {
    return res.status(500).json({ error: `Error fetching debts, ${error}` });
  }
};

export const addDebt = async (req, res) => {
  try {
    const { direction, name, amount, date, due, desc, account, payments } = req.body;
    const debt = new Debt({
      direction: direction === "lent" ? "lent" : "borrowed",
      name, amount, date, due, desc, account: account || "",
      payments: Array.isArray(payments) ? payments.map((p) => ({ amount: p.amount, date: p.date, account: p.account || "" })) : [],
    });
    const saved = await debt.save();
    return res.status(201).json(debtWithId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating debt, ${error}` });
  }
};

export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const debt = await Debt.findById(id);
    if (!debt) {
      return res.status(404).json({ error: "Debt doesn't exist!" });
    }
    const { direction, name, amount, date, due, desc, account, payments } = req.body;
    if (direction !== undefined) debt.direction = direction === "lent" ? "lent" : "borrowed";
    if (name !== undefined) debt.name = name;
    if (amount !== undefined) debt.amount = amount;
    if (date !== undefined) debt.date = date;
    if (due !== undefined) debt.due = due;
    if (desc !== undefined) debt.desc = desc;
    if (account !== undefined) debt.account = account;
    // payments are preserved unless explicitly replaced
    if (Array.isArray(payments)) debt.payments = payments.map((p) => ({ amount: p.amount, date: p.date, account: p.account || "" }));
    const updated = await debt.save();
    return res.status(200).json(debtWithId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating debt, ${error}` });
  }
};

export const removeDebt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Debt.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Debt not found!" });
    }
    await Debt.deleteOne({ _id: id });
    return res.status(204).json({ message: "Debt deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting debt, ${error}` });
  }
};

/* ------------------------------------------------------------------ GOALS */
export const addGoal = async (req, res) => {
  try {
    const { name, short, sub, target, color, account, startMonth, order, targetSchedule, overrideFor, type, endMonth, deadline } = req.body;
    const goal = new Goal({ name, short, sub, target, color, account, startMonth, order, targetSchedule, overrideFor, type, endMonth, deadline });
    const saved = await goal.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating goal, ${error}` });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ error: "Goal doesn't exist!" });
    }
    const fields = ["name", "short", "sub", "target", "color", "account", "startMonth", "order", "targetSchedule", "overrideFor", "type", "endMonth", "deadline"];
    fields.forEach((f) => { if (req.body[f] !== undefined) goal[f] = req.body[f]; });
    const updated = await goal.save();
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating goal, ${error}` });
  }
};

export const removeGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Goal.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Goal not found!" });
    }
    await Goal.deleteOne({ _id: id });
    // also drop this goal's contributions so they don't dangle
    await Contribution.deleteMany({ bucket: id });
    return res.status(204).json({ message: "Goal deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting goal, ${error}` });
  }
};

/* --------------------------------------------------------------- ACCOUNTS */
export const addAccount = async (req, res) => {
  try {
    const { name, type, color, openingBalance, order } = req.body;
    const account = new Account({ name, type, color, openingBalance, order });
    const saved = await account.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating account, ${error}` });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ error: "Account doesn't exist!" });
    }
    const prevName = account.name;
    const fields = ["name", "type", "color", "openingBalance", "order", "archived"];
    fields.forEach((f) => { if (req.body[f] !== undefined) account[f] = req.body[f]; });
    const updated = await account.save();
    // records reference accounts by name — cascade a rename so balances stay intact
    if (req.body.name !== undefined && req.body.name !== prevName && prevName) {
      await Promise.all([
        Transaction.updateMany({ account: prevName }, { $set: { account: req.body.name } }),
        Contribution.updateMany({ account: prevName }, { $set: { account: req.body.name } }),
        Contribution.updateMany({ wallet: prevName }, { $set: { wallet: req.body.name } }),
        Goal.updateMany({ account: prevName }, { $set: { account: req.body.name } }),
      ]);
    }
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating account, ${error}` });
  }
};

export const removeAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Account.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Account not found!" });
    }
    await Account.deleteOne({ _id: id });
    // records keep their (now unmanaged) account name — they show under it as-is
    return res.status(204).json({ message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting account, ${error}` });
  }
};

/* ---------------------------------------------------------------- ASSETS */
const ASSET_FIELDS = [
  "name", "type", "value", "cost", "acquiredDate", "location", "size", "sizeUnit",
  "upi", "plate", "year", "notes", "color", "order", "archived", "wallet",
  "sold", "soldWallet", "soldAmount", "soldDate",
];

export const addAsset = async (req, res) => {
  try {
    const payload = {};
    ASSET_FIELDS.forEach((f) => { if (req.body[f] !== undefined) payload[f] = req.body[f]; });
    const asset = new Asset(payload);
    const saved = await asset.save();
    return res.status(201).json(withId(saved));
  } catch (error) {
    return res.status(500).json({ error: `Error creating asset, ${error}` });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ error: "Asset doesn't exist!" });
    }
    ASSET_FIELDS.forEach((f) => { if (req.body[f] !== undefined) asset[f] = req.body[f]; });
    const updated = await asset.save();
    return res.status(200).json(withId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error updating asset, ${error}` });
  }
};

export const removeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const exist = await Asset.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Asset not found!" });
    }
    await Asset.deleteOne({ _id: id });
    return res.status(204).json({ message: "Asset deleted" });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting asset, ${error}` });
  }
};

export const addDebtPayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const debt = await Debt.findById(id);
    if (!debt) {
      return res.status(404).json({ error: "Debt not found!" });
    }
    const { amount, date, account } = req.body;
    debt.payments.push({ amount, date, account: account || "" });
    const updated = await debt.save();
    return res.status(200).json(debtWithId(updated));
  } catch (error) {
    return res.status(500).json({ error: `Error recording payment, ${error}` });
  }
};
