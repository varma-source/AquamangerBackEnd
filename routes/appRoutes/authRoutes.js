import express from "express";
const appRoutes = express.Router();

// Controller
import * as auth_Controller from "../../controllers/app/auth.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";
import { upload_userImg } from "../../middleware/uploadImage.js";


appRoutes.post(
    "/register",
    upload_userImg.single("image"),
    auth_Controller.userRegistrastion
);

appRoutes.post(
    "/login",
    auth_Controller.loginUser
);

appRoutes.post(
    "/getprofile", verifyAdminToken,
    auth_Controller.getuserProfile
);

appRoutes.put(
    "/update-profile", verifyAdminToken,
    upload_userImg.single("image"),
    auth_Controller.updateUserProfile
);

appRoutes.post(
    "/generate-otp",
    auth_Controller.generateOtp
);

appRoutes.post(
    "/verify-otp",
    auth_Controller.verifyOtp
);

appRoutes.post(
    "/change-password",
    auth_Controller.changePassword
);

appRoutes.post(
    "/farm-array", verifyAdminToken,
    auth_Controller.saveFarmArray
);

appRoutes.post(
    "/addform", verifyAdminToken,
    auth_Controller.addUserFarm
);

appRoutes.post(
    "/getallfarms", verifyAdminToken,
    auth_Controller.getAllUserFarms
);

appRoutes.post(
    "/get-staff-profile", verifyAdminToken,
    auth_Controller.getstaffProfile
);

appRoutes.post(
    "/get-staff-expenses", verifyAdminToken,
    auth_Controller.getAllStaffExpenses
);

appRoutes.put(
    "/update-staff-expenses-status", verifyAdminToken,
    auth_Controller.updateStaffExpenseStatus
);

appRoutes.put(
    "/update-staff-status", verifyAdminToken,
    auth_Controller.updateStaffStatus
);

appRoutes.post(
    "/staff-request-advances", verifyAdminToken,
    auth_Controller.getAllRequestAdvances
);

appRoutes.put(
    "/update-staff-request-advance", verifyAdminToken,
    auth_Controller.updateStaffRequestAdvanceStatus
);

export default appRoutes;