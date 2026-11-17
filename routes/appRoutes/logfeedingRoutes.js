import express from "express";

const logFeedingRoutes = express.Router();

// controller
import * as logFeedingController from "../../controllers/app/logFeeding.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
logFeedingRoutes.post(
    "/add",
    verifyAdminToken,
    logFeedingController.addLogfeeding
);

// get ALL 
logFeedingRoutes.post(
    "/getall",
    verifyAdminToken,
    logFeedingController.getAllLogfeeding
);

// get single 
logFeedingRoutes.post(
    "/getsingle",
    verifyAdminToken,
    logFeedingController.getLogfeedingById
);

// edit 
logFeedingRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    logFeedingController.updateLogfeeding
);

// delete 
logFeedingRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    logFeedingController.deleteLogfeeding
);

export default logFeedingRoutes;