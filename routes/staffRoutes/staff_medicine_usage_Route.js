import express from "express";
const medicineUsageRoutes = express.Router();

// Controller
import * as medicineUsage_Controller from "../../controllers/staff/staff_medicine_usage.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Add Medicine Usage
medicineUsageRoutes.post(
    "/add",
    verifyAdminToken,
    medicineUsage_Controller.addMedicineUsage
);

// Update Medicine Usage
medicineUsageRoutes.post(
    "/update/:id",
    verifyAdminToken,
    medicineUsage_Controller.updateMedicineUsage
);

// Get All Medicine Usage
medicineUsageRoutes.post(
    "/get-all",
    verifyAdminToken,
    medicineUsage_Controller.getAllMedicineUsage
);

// Get Medicine Usage By ID
medicineUsageRoutes.post(
    "/get-by-id",
    verifyAdminToken,
    medicineUsage_Controller.getMedicineUsageById
);

// Delete Medicine Usage
medicineUsageRoutes.post(
    "/delete/:id",
    verifyAdminToken,
    medicineUsage_Controller.deleteMedicineUsage
);

export default medicineUsageRoutes;