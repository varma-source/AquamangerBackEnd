import express from "express";
const staff_request_advance_Routes = express.Router();

// Controller
import * as staff_request_advance_Controller from "../../controllers/staff/staff_request_advance.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Add Request Advance
staff_request_advance_Routes.post(
    "/add",
    verifyAdminToken,
    staff_request_advance_Controller.addRequestAdvance
);

// Get All Request Advances
staff_request_advance_Routes.post(
    "/get-all",
    verifyAdminToken,
    staff_request_advance_Controller.getAllRequestAdvances
);

export default staff_request_advance_Routes;