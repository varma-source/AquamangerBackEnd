import express from "express";

const PartyPaymentRoutes = express.Router();

// controller
import * as partyPaymentController from "../../controllers/app/partyPayment.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
PartyPaymentRoutes.post(
    "/add",
    verifyAdminToken,
    partyPaymentController.addPartyPayment
);

// get ALL 
PartyPaymentRoutes.post(
    "/getall",
    verifyAdminToken,
    partyPaymentController.getAllPartyPayments
);



// edit 
PartyPaymentRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    partyPaymentController.updatePartyPayment
);

// delete 
PartyPaymentRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    partyPaymentController.deletePartyPayment
);


// get ALL 
PartyPaymentRoutes.post(
    "/get-party-paymentsby-partyId",
    verifyAdminToken,
    partyPaymentController.getPartyPaymentsByPartyId
);

export default PartyPaymentRoutes;