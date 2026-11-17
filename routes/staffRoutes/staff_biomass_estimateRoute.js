import express from "express";
const staff_biomass_feeding_Routes = express.Router();

// Controller
import * as staff_biomass_feeding_Controller from "../../controllers/staff/staff_biomass_estimate.controller.js";

// Middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// Add Medicine Usage
staff_biomass_feeding_Routes.post(
    "/add",
    verifyAdminToken,
    staff_biomass_feeding_Controller.addBiomassEstimate
);



// Get All Medicine Usage
staff_biomass_feeding_Routes.post(
    "/get-all",
    verifyAdminToken,
    staff_biomass_feeding_Controller.getAllBiomassEstimates
);


export default staff_biomass_feeding_Routes;