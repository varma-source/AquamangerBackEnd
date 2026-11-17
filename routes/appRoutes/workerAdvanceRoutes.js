import express from "express";

const workerAdvanceRoutes = express.Router();

// controller

import * as workerAdvancecontroller from "../../controllers/app/workerAdvancecontroller.js";

// middleware

import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes
// add 
workerAdvanceRoutes.post("/add", verifyAdminToken, workerAdvancecontroller.addWorkerAdvance);

// get ALL 
workerAdvanceRoutes.post("/getall", verifyAdminToken, workerAdvancecontroller.getAllWorkerAdvances);

// edit 
workerAdvanceRoutes.put("/edit/:id", verifyAdminToken, workerAdvancecontroller.editWorkerAdvance);

// delete 
workerAdvanceRoutes.delete("/delete/:id", verifyAdminToken, workerAdvancecontroller.deleteWorkerAdvance);


workerAdvanceRoutes.post("/getbyid", verifyAdminToken, workerAdvancecontroller.getWorkerAdvanceById);


workerAdvanceRoutes.post("/getworkeradvancesby-workerid", verifyAdminToken, workerAdvancecontroller.getAllWorkerAdvancesByWorkerId);



export default workerAdvanceRoutes;