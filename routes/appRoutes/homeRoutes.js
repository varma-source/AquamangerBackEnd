import express from "express";

const homeRoutes = express.Router();

// controller
import * as harvestController from "../../controllers/app/home.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes
// overview 
homeRoutes.post(
    "/tank-overview",
    verifyAdminToken,
    harvestController.tankOverview
);

//feeding and fcr
homeRoutes.post(
    "/get-feeding-fcr",
    verifyAdminToken,
    harvestController.getFeedingAndBiomassSummary
);

//feed stock
homeRoutes.post(
    "/get-feedingstock",
    verifyAdminToken,
    harvestController.getFeedStockSummary
);


//usage summary
homeRoutes.post(
    "/get-medicine-usage",
    verifyAdminToken,
    harvestController.getMedicineUsageSummary
);

//harvest summary
homeRoutes.post(
    "/get-harvest-summary",
    verifyAdminToken,
    harvestController.getHarvestSummary
);

//pl view
homeRoutes.post(
    "/pl-view",
    verifyAdminToken,
    harvestController.PLVIEW
);

homeRoutes.post(
    "/pl-report",
    verifyAdminToken,
    harvestController.PLREPORT
);

homeRoutes.post(
    "/getbalancesheet",
    verifyAdminToken,
    harvestController.getBalancesheet
);

homeRoutes.post(
    "/getfeed-stock",
    verifyAdminToken,
    harvestController.getFeedStockReport
);

homeRoutes.post(
    "/medicine-report",
    verifyAdminToken,
    harvestController.GetmedicineReport
);
export default homeRoutes;