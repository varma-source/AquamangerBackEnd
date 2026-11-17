import express from "express";

const biomassEstimateRoutes = express.Router();

// controller
import * as bioEstimateController from "../../controllers/app/bioEstimate.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
biomassEstimateRoutes.post(
    "/add",
    verifyAdminToken,
    bioEstimateController.addBiomassEstimate
);

// get ALL 
biomassEstimateRoutes.post(
    "/getall",
    verifyAdminToken,
    bioEstimateController.getAllBiomassEstimates
);

// get single 
biomassEstimateRoutes.post(
    "/getsingle",
    verifyAdminToken,
    bioEstimateController.getBiomassEstimateById
);

// edit 
biomassEstimateRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    bioEstimateController.updateBiomassEstimate
);

// delete 
biomassEstimateRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    bioEstimateController.deleteBiomassEstimate
);

export default biomassEstimateRoutes;