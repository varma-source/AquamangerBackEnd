import express from "express";

const staffRoute = express.Router();

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Routes
import authRoutes from "./staffAuthRoute.js";
import staffexpenseRoutes from "./staff_expensesRoute.js";
import staffmedicineUsageRoutes from "./staff_medicine_usage_Route.js";
import stafflogFeedingRoutes from "./staff_log_feedingRoute.js";
import staffbiomassEstimateRoutes from "./staff_biomass_estimateRoute.js";
import staffRequestadvanceRoutes from "./staff_request_advanceRoute.js";








// APIs
staffRoute.use("/auth", authRoutes);
staffRoute.use("/expense", staffexpenseRoutes);
staffRoute.use("/medicine-usage", staffmedicineUsageRoutes);
staffRoute.use("/logfeeding", stafflogFeedingRoutes);
staffRoute.use("/biomass-estimate", staffbiomassEstimateRoutes);
staffRoute.use("/request-advance", staffRequestadvanceRoutes);






export default staffRoute;