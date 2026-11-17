import express from "express";

const adminRoutes = express.Router();

// Controller
import * as adminController from "../../controllers/admin/admin.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

import { upload_profileImg } from "../../middleware/uploadImage.js";

// Routes

adminRoutes.post(
    "/add",
    adminController.adminRegistration
);

adminRoutes.post(
    "/authLogin",
    adminController.authLogin
);

adminRoutes.post(
    "/getprofile",
    verifyAdminToken,
    adminController.getAdminProfile
);

adminRoutes.put(
    "/changeAdminPassword",
    verifyAdminToken,
    adminController.changePassword
);

adminRoutes.put(
    "/updateAdminProfile",
    verifyAdminToken,
    adminController.updateProfile
);

adminRoutes.put(
    "/editprofilepic",
    verifyAdminToken,
    upload_profileImg.single("image"),
    adminController.updateadminProfileImg
);

adminRoutes.post(
    "/generateForgotPasswordOTP",
    adminController.generateOtp
);

adminRoutes.post(
    "/compareForgotPasswordOTP",
    adminController.compareOtp
);

adminRoutes.post(
    "/resetPassword",
    adminController.resetPassword
);

export default adminRoutes;