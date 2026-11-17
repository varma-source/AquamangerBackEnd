import express from "express";

const medicineUsageRoutes = express.Router();

// controller
import * as medicineUsageController from "../../controllers/app/medicineUsage.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
medicineUsageRoutes.post(
    "/add",
    verifyAdminToken,
    medicineUsageController.addMedicineUsage
);

// get ALL 
medicineUsageRoutes.post(
    "/getall",
    verifyAdminToken,
    medicineUsageController.getAllMedicineUsage
);

// get single 
medicineUsageRoutes.post(
    "/getsingle",
    verifyAdminToken,
    medicineUsageController.getMedicineUsageById
);

// edit 
medicineUsageRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    medicineUsageController.updateMedicineUsage
);

// delete 
medicineUsageRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    medicineUsageController.deleteMedicineUsage
);

export default medicineUsageRoutes;