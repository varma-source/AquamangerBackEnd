import express from "express";
const staff_log_feeding_Routes = express.Router();

// Controller
import * as staff_log_feeding_Controller from "../../controllers/staff/staff_log_feeding.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Add Medicine Usage
staff_log_feeding_Routes.post(
    "/add",
    verifyAdminToken,
    staff_log_feeding_Controller.addLogfeeding
);



// Get All Medicine Usage
staff_log_feeding_Routes.post(
    "/get-all",
    verifyAdminToken,
    staff_log_feeding_Controller.getAllLogfeeding
);


// Get All Medicine Usage
staff_log_feeding_Routes.post(
    "/get-staff-logfeedings",
    verifyAdminToken,
    staff_log_feeding_Controller.getstafflogfeedings
);


export default staff_log_feeding_Routes;