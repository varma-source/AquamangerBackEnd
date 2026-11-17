import express from "express";

const partyRoutes = express.Router();

// controller
import * as partyController from "../../controllers/app/parties.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
partyRoutes.post(
    "/add",
    verifyAdminToken,
    partyController.addParty
);

// get ALL 
partyRoutes.post(
    "/getall",
    verifyAdminToken,
    partyController.getAllParty
);

// get single 
partyRoutes.post(
    "/getsingle",
    verifyAdminToken,
    partyController.getPartyById
);

// edit 
partyRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    partyController.updateParty
);

// delete 
partyRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    partyController.deleteParty
);

export default partyRoutes;