import express from "express";

const purchaseRoutes = express.Router();

// controller
import * as purchaseController from "../../controllers/app/purchase.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
purchaseRoutes.post(
    "/add",
    verifyAdminToken,
    purchaseController.addPurchase
);

// get ALL 
purchaseRoutes.post(
    "/getall",
    verifyAdminToken,
    purchaseController.getAllPurchase
);

// get single 
purchaseRoutes.post(
    "/getsingle",
    verifyAdminToken,
    purchaseController.getPurchaseById
);

// edit 
purchaseRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    purchaseController.updatePurchase
);

// delete 
purchaseRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    purchaseController.deletePurchase
);


purchaseRoutes.post(
    "/get-purchase-parties",
    verifyAdminToken,
    purchaseController.getAllPurchaseParty
);

export default purchaseRoutes;