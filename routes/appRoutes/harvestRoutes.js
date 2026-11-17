import express from "express";

const harvestRoutes = express.Router();

// controller
import * as harvestController from "../../controllers/app/harvest.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
harvestRoutes.post(
    "/add",
    verifyAdminToken,
    harvestController.addHarvest
);

// get ALL 
harvestRoutes.post(
    "/getall",
    verifyAdminToken,
    harvestController.getAllHarvests
);

// get single 
harvestRoutes.post(
    "/getsingle",
    verifyAdminToken,
    harvestController.getHarvestById
);

// edit 
harvestRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    harvestController.updateHarvest
);

// delete 
harvestRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    harvestController.deleteHarvest
);

export default harvestRoutes;