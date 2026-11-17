import express from "express";

const medicineRoutes = express.Router();

// controller
import * as medicineController from "../../controllers/app/medicine.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
medicineRoutes.post(
    "/add",
    verifyAdminToken,
    medicineController.addMedicine
);

// get ALL 
medicineRoutes.post(
    "/getall",
    verifyAdminToken,
    medicineController.getAllMedicine
);

// get single 
medicineRoutes.post(
    "/getsingle",
    verifyAdminToken,
    medicineController.getMedicineById
);

// edit 
medicineRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    medicineController.updateMedicine
);

// delete 
medicineRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    medicineController.deleteMedicine
);

// get ALL 
medicineRoutes.post(
    "/getall-medicine-partys",
    verifyAdminToken,
    medicineController.getAllMedicineParties
);
export default medicineRoutes;