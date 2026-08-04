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
  listBudgetItems,
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  listDebts,
  addDebt,
  updateDebt,
  removeDebt,
  addDebtPayment,
} from "../../controllers/financeController";

const financeRouter = express.Router();

financeRouter.use(authorized, isAdmin);

financeRouter.get("/", getState);

financeRouter.post("/transactions", addTx);
financeRouter.patch("/transactions/:id", updateTx);
financeRouter.delete("/transactions/:id", removeTx);

financeRouter.post("/contributions", addContribution);
financeRouter.patch("/contributions/:id", updateContribution);

financeRouter.get("/budget-items", listBudgetItems);
financeRouter.post("/budget-items", addBudgetItem);
financeRouter.patch("/budget-items/:id", updateBudgetItem);
financeRouter.delete("/budget-items/:id", removeBudgetItem);

financeRouter.get("/debts", listDebts);
financeRouter.post("/debts", addDebt);
financeRouter.patch("/debts/:id", updateDebt);
financeRouter.delete("/debts/:id", removeDebt);
financeRouter.post("/debts/:id/payments", addDebtPayment);

export default financeRouter;
