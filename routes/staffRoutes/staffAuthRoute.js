import express from "express";
const authRoutes = express.Router();

// Controller
import * as auth_Controller from "../../controllers/staff/auth.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";




authRoutes.post(
    "/login",
    auth_Controller.staffLogin
);

authRoutes.post(
    "/get-profile", verifyAdminToken,
    auth_Controller.getstaffProfile
);

authRoutes.post(
    "/generate-otp",
    auth_Controller.generateOtp
);

authRoutes.post(
    "/verify-otp",
    auth_Controller.verifyOtp
);

authRoutes.post(
    "/change-pass",
    auth_Controller.changePassword
);

authRoutes.post(
    "/home-screen", verifyAdminToken,
    auth_Controller.getStaffHomescreen
);

authRoutes.post(
    "/get-medicines", verifyAdminToken,
    auth_Controller.Getmedicinesforstaff
);



authRoutes.post(
    "/get-species", verifyAdminToken,
    auth_Controller.getAllSpecies
);

authRoutes.post(
    "/get-purchases", verifyAdminToken,
    auth_Controller.getAllPurchases
);

authRoutes.post(
    "/get-managerstaff", verifyAdminToken,
    auth_Controller.getAllManagerStaff
);


export default authRoutes;