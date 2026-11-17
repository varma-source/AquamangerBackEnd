import express from "express";

const workerRoutes = express.Router();

// controller

import * as workersController from "../../controllers/app/workers.controller.js";

// middleware

import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add 

workerRoutes.post("/add", verifyAdminToken, workersController.addWorker);

// get ALL 

workerRoutes.post("/getall", verifyAdminToken, workersController.getAllWorkers);

// edit 
workerRoutes.put("/edit/:id", verifyAdminToken, workersController.editWorker);

// delete 
workerRoutes.delete("/delete/:id", verifyAdminToken, workersController.deleteWorker);

//get by id
workerRoutes.post("/getbyid", verifyAdminToken, workersController.getWorkerById);




export default workerRoutes;