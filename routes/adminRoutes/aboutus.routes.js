import express from "express";

const aboutusRoutes = express.Router();

// controller
import * as aboutuscontroller from "../../controllers/admin/abotus.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

aboutusRoutes.post(
    "/get",
    aboutuscontroller.getAboutUs
);

aboutusRoutes.put(
    "/update",
    verifyAdminToken,
    aboutuscontroller.updateAboutUs
);



export default aboutusRoutes;