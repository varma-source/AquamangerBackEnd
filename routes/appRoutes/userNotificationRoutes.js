import express from "express";

const notificationRoutes = express.Router();

// Controller
import * as notificationController from "../../controllers/app/notification.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";


//getallnotificationsbyuserid
notificationRoutes.post(
    "/getallnotificationsbyuserid",
    verifyAdminToken,
    notificationController.getAllNotificationbyUserId
);

// Delete notifications
notificationRoutes.delete(
    "/deletenotification",
    verifyAdminToken,
    notificationController.deleteNotification
);




export default notificationRoutes;