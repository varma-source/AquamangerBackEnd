import express from "express";

const staffexpenseRoutes = express.Router();

// controller
import * as expenseController from "../../controllers/staff/staff_expenses.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";
import { upload_staffexpenseImg } from "../../middleware/uploadImage.js";

// ============================================================
// STAFF EXPENSE ROUTES
// ============================================================

// Add labour expense
staffexpenseRoutes.post(
    "/add/labour",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addLabourExpense
);

// Add salary expense
staffexpenseRoutes.post(
    "/add/salary",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addSalaryExpense
);

// Add tiffins expense
staffexpenseRoutes.post(
    "/add/tiffins",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addTiffinsExpense
);

// Add petrol expense
staffexpenseRoutes.post(
    "/add/petrol",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addPetrolExpense
);

// Add diesel expense
staffexpenseRoutes.post(
    "/add/diesel",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addDieselExpense
);

// Add electrical expense
staffexpenseRoutes.post(
    "/add/electrical",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addElectricalExpense
);

// Add plumbing expense
staffexpenseRoutes.post(
    "/add/plumbing",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addPlumbingExpense
);

// Add transport expense
staffexpenseRoutes.post(
    "/add/transport",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addTransportExpense
);

// Add utilities expense
staffexpenseRoutes.post(
    "/add/utilities",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addUtilitiesExpense
);

// Add other expense
staffexpenseRoutes.post(
    "/add/other",
    verifyAdminToken,
    upload_staffexpenseImg.single("receiptImage"),
    expenseController.addOtherExpense
);

// Get all staff expenses
staffexpenseRoutes.post(
    "/getall",
    verifyAdminToken,
    expenseController.getAllExpenses
);

// Delete staff expense
staffexpenseRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    expenseController.deleteExpense
);


staffexpenseRoutes.post(
    "/getall-expenses-parties",
    verifyAdminToken,
    expenseController.getAllExpensesParties
);

export default staffexpenseRoutes;