import express from "express";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";
import {
  getState,
  addTx,
  updateTx,
  removeTx,
  addContribution,
  updateContribution,
  removeContribution,
  listBudgetItems,
  addBudgetItem,
  copyBudgetMonth,
  reorderBudgetItems,
  updateBudgetItem,
  removeBudgetItem,
  listDebts,
  addDebt,
  updateDebt,
  removeDebt,
  addDebtPayment,
  addGoal,
  updateGoal,
  removeGoal,
  addAccount,
  updateAccount,
  removeAccount,
  addAsset,
  updateAsset,
  removeAsset,
  addTransfer,
  updateTransfer,
  removeTransfer,
} from "../../controllers/financeController";

const financeRouter = express.Router();

financeRouter.use(authorized, isAdmin);

financeRouter.get("/", getState);

financeRouter.post("/transactions", addTx);
financeRouter.patch("/transactions/:id", updateTx);
financeRouter.delete("/transactions/:id", removeTx);

financeRouter.post("/contributions", addContribution);
financeRouter.patch("/contributions/:id", updateContribution);
financeRouter.delete("/contributions/:id", removeContribution);

financeRouter.get("/budget-items", listBudgetItems);
financeRouter.post("/budget-items", addBudgetItem);
financeRouter.post("/budget-items/copy", copyBudgetMonth); // before :id routes
financeRouter.patch("/budget-items/reorder", reorderBudgetItems); // before :id so "reorder" isn't matched as an id
financeRouter.patch("/budget-items/:id", updateBudgetItem);
financeRouter.delete("/budget-items/:id", removeBudgetItem);

financeRouter.get("/debts", listDebts);
financeRouter.post("/debts", addDebt);
financeRouter.patch("/debts/:id", updateDebt);
financeRouter.delete("/debts/:id", removeDebt);
financeRouter.post("/debts/:id/payments", addDebtPayment);

financeRouter.post("/goals", addGoal);
financeRouter.patch("/goals/:id", updateGoal);
financeRouter.delete("/goals/:id", removeGoal);

financeRouter.post("/accounts", addAccount);
financeRouter.patch("/accounts/:id", updateAccount);
financeRouter.delete("/accounts/:id", removeAccount);

financeRouter.post("/assets", addAsset);
financeRouter.patch("/assets/:id", updateAsset);
financeRouter.delete("/assets/:id", removeAsset);

financeRouter.post("/transfers", addTransfer);
financeRouter.patch("/transfers/:id", updateTransfer);
financeRouter.delete("/transfers/:id", removeTransfer);

export default financeRouter;
