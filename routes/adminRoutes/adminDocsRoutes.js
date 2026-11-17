import express from "express";

const adminDocRoutes = express.Router();

// controller
import * as aboutuscontroller from "../../controllers/admin/adminDocs.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

adminDocRoutes.post(
    "/getusers", verifyAdminToken,
    aboutuscontroller.getAllUsersAndStaff
);




export default adminDocRoutes;