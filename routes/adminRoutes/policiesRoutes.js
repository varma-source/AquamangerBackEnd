import express from "express";

const policiesRoutes = express.Router();

// controller
import * as policiescontroller from "../../controllers/admin/policies.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

policiesRoutes.post(
    "/get",
    policiescontroller.getPolicies
);

policiesRoutes.put(
    "/updatetermsAndCondition",
    verifyAdminToken,
    policiescontroller.updatetermsConditions
);

policiesRoutes.put(
    "/updateprivacyPolicy",
    verifyAdminToken,
    policiescontroller.updatePrivacypolicy
);

policiesRoutes.put(
    "/updaterefundPolicy",
    verifyAdminToken,
    policiescontroller.updaterefundPolicy
);

export default policiesRoutes;