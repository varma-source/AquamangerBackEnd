import express from "express";

const appRoute = express.Router();

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Routes
import appRoutes from "./authRoutes.js";
import tanksRoutes from "./tanksRoutes.js";
import staffRoutes from "./staffRoutes.js";
import workerRoutes from "./workersRoutes.js";
import workerAdvanceRoutes from "./workerAdvanceRoutes.js";
import stocksRoutes from "./stocksRoutes.js";
import partyRoutes from "./partRoutes.js";
import purchaseRoutes from "./purchaseRoutes.js";
import logFeedingRoutes from "./logfeedingRoutes.js";
import bioEstimateRoutes from "./bioEstimateRoutes.js";
import medicineRoutes from "./medicineRoutes.js";
import medicineUsageRoutes from "./medicineUsageRoutes.js";
import harvestRoutes from "./harvestRoutes.js";
import homeRoutes from "./homeRoutes.js";
import expensesRoutes from "./expensesRoute.js";
import partyPaymentRoutes from "./partyPaymentRoute.js";
import notificationRoutes from "./userNotificationRoutes.js";





// APIs
appRoute.use("/auth", appRoutes);
appRoute.use("/tanks", tanksRoutes);
appRoute.use("/staff", staffRoutes);
appRoute.use("/worker", workerRoutes);
appRoute.use("/worker-advance", workerAdvanceRoutes);
appRoute.use("/stock", stocksRoutes);
appRoute.use("/party", partyRoutes);
appRoute.use("/purchase", purchaseRoutes);
appRoute.use("/logfeeding", logFeedingRoutes);
appRoute.use("/bioEstimate", bioEstimateRoutes);
appRoute.use("/medicine", medicineRoutes);
appRoute.use("/medicineUsage", medicineUsageRoutes);
appRoute.use("/harvest", harvestRoutes);
appRoute.use("/home", homeRoutes);
appRoute.use("/expense", expensesRoutes);
appRoute.use("/party-payment", partyPaymentRoutes);
appRoute.use("/notification", notificationRoutes);























export default appRoute;