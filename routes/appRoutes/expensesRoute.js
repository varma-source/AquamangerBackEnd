import express from "express";

const expensesRoutes = express.Router();

// controller
import * as expenseController from "../../controllers/app/expenses.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";
import { upload_expenseImg } from "../../middleware/uploadImage.js";

// routes

// add labour expense
expensesRoutes.post(
    "/add/labour",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addLabourExpense
);

// add salary expense
expensesRoutes.post(
    "/add/salary",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addSalaryExpense
);

// add tiffins expense
expensesRoutes.post(
    "/add/tiffins",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addTiffinsExpense
);

// add petrol expense
expensesRoutes.post(
    "/add/petrol",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addPetrolExpense
);

// add diesel expense
expensesRoutes.post(
    "/add/diesel",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addDieselExpense
);

// add electrical expense
expensesRoutes.post(
    "/add/electrical",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addElectricalExpense
);

// add plumbing expense
expensesRoutes.post(
    "/add/plumbing",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addPlumbingExpense
);

// add transport expense
expensesRoutes.post(
    "/add/transport",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addTransportExpense
);

// add utilities expense
expensesRoutes.post(
    "/add/utilities",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addUtilitiesExpense
);

// add other expense
expensesRoutes.post(
    "/add/other",
    verifyAdminToken,
    upload_expenseImg.single("receiptImage"),
    expenseController.addOtherExpense
);

// get all expenses
expensesRoutes.post(
    "/getall",
    verifyAdminToken,
    expenseController.getAllExpenses
);


// get all expenses
expensesRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    expenseController.deleteExpense
);

expensesRoutes.post(
    "/getall-expenses-parties",
    verifyAdminToken,
    expenseController.getAllExpensesParties
);
export default expensesRoutes;