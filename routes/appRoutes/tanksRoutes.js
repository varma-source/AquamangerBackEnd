import express from "express";

const tankRoutes = express.Router();

// controller

import * as tankcontroller from "../../controllers/app/tanks.controller.js";

// middleware

import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add tank

tankRoutes.post("/addtank", verifyAdminToken, tankcontroller.addTank);

// get ALL tanks

tankRoutes.post("/getalltanks", verifyAdminToken, tankcontroller.getAllTanks);

// edit tank

tankRoutes.put("/edittank/:id", verifyAdminToken, tankcontroller.updateTank);

// delete tank

tankRoutes.delete("/deletetank/:id", verifyAdminToken, tankcontroller.deleteTank);

tankRoutes.post("/gettankbyid", verifyAdminToken, tankcontroller.getTankById);

tankRoutes.post("/getall-user-tanks", verifyAdminToken, tankcontroller.getalluserTanks);


export default tankRoutes;