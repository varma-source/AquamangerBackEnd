import express from "express";

const notificationRoutes = express.Router();

// controller
import * as notificationController from "../../controllers/admin/sendAdminNotificationController.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Routes

notificationRoutes.post(
    "/add",
    verifyAdminToken,
    notificationController.addNotification
);

notificationRoutes.post(
    "/getAllnotification",
    verifyAdminToken,
    notificationController.getAllNotifications
);



notificationRoutes.delete(
    "/delete",
    verifyAdminToken,
    notificationController.deleteNotification
);


export default notificationRoutes;