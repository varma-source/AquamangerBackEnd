import express from "express";

const adminMainRoutes = express.Router();

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

import adminRoutes from "./authRoutes.js";
import aboutusRoutes from "./aboutus.routes.js";
import faqRoutes from "./faqRoutes.js";
import policiesRoutes from "./policiesRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import rolesRoutes from "./rolesRoutes.js";
import staffRoutes from "./staffRoutes.js";
import adminDocRoutes from "./adminDocsRoutes.js";






adminMainRoutes.use("/auth", adminRoutes);
adminMainRoutes.use("/aboutus", aboutusRoutes)
adminMainRoutes.use("/faq", faqRoutes);
adminMainRoutes.use("/policy", policiesRoutes);
adminMainRoutes.use("/notification", notificationRoutes);
adminMainRoutes.use("/department", departmentRoutes);
adminMainRoutes.use("/role", rolesRoutes);
adminMainRoutes.use("/staff", staffRoutes);
adminMainRoutes.use("/docs", adminDocRoutes);



















export default adminMainRoutes;