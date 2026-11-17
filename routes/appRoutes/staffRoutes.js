import express from "express";

const staffRoutes = express.Router();

// controller
import * as staffcontroller from "../../controllers/app/staff.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add staff
staffRoutes.post(
    "/addstaff",
    verifyAdminToken,
    staffcontroller.createStaff
);

// get ALL staff
staffRoutes.post(
    "/getallstaff",
    verifyAdminToken,
    staffcontroller.getallstaffs
);

// get single staff
staffRoutes.post(
    "/getsinglestaff",
    verifyAdminToken,
    staffcontroller.getSingleStaff
);

// edit staff
staffRoutes.put(
    "/editstaff/:id",
    verifyAdminToken,
    staffcontroller.updateStaff
);

// delete staff
staffRoutes.delete(
    "/deletestaff/:id",
    verifyAdminToken,
    staffcontroller.deletestaff
);


staffRoutes.post(
    "/getall-role-staff",
    verifyAdminToken,
    staffcontroller.getRoleStaff
);
export default staffRoutes;