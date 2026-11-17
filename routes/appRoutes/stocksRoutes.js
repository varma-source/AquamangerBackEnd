import express from "express";

const stocksRoutes = express.Router();

// controller
import * as stocksController from "../../controllers/app/stocks.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 
stocksRoutes.post(
    "/add",
    verifyAdminToken,
    stocksController.addStock
);

// get ALL 
stocksRoutes.post(
    "/getall",
    verifyAdminToken,
    stocksController.getAllStock
);

// get single 
stocksRoutes.post(
    "/getsingle",
    verifyAdminToken,
    stocksController.getStockById
);

// edit 
stocksRoutes.put(
    "/edit/:id",
    verifyAdminToken,
    stocksController.updateStock
);

// delete 
stocksRoutes.delete(
    "/delete/:id",
    verifyAdminToken,
    stocksController.deleteStock
);

// get single 
stocksRoutes.post(
    "/getallstocks-by-tankId",
    verifyAdminToken,
    stocksController.getAllStocksByTankId
);

stocksRoutes.post(
    "/getallspecies",
    verifyAdminToken,
    stocksController.getAllSpecies
);
export default stocksRoutes;