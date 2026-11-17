import mongoose from "mongoose";
import { DateTime } from "luxon";

import WorkerAdvance from "../../models/workerAdvance.js";
import Staff from "../../models/appStaff.js";
import Worker from "../../models/workers.js";

export const addWorkerAdvance = async(req, res) => {
    try {
        const {

            workerId,
            date,
            amount,
            purpose,
            paidBy,
            status,
        } = req.body;



        // ==========================================
        // CHECK WORKER
        // ==========================================
        const worker = await Worker.findOne({
            _id: workerId,

        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // ==========================================
        // GET IST DATE
        // ==========================================
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true,
        });

        // ==========================================
        // CREATE ADVANCE
        // ==========================================
        const advance = await WorkerAdvance.create({

            workerId: workerId,
            date: date,
            amount: amount,
            purpose: purpose,
            paidBy: paidBy || "cash",
            status: status || "active",
            userId: req.userId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.status(201).json({
            success: true,
            message: "Worker advance added successfully",
            data: advance,
        });

    } catch (error) {
        console.log("Add worker advance error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const editWorkerAdvance = async(req, res) => {
    try {
        const { id } = req.params;

        const {

            workerId,
            date,
            amount,
            purpose,
            paidBy,
            status,
        } = req.body;

        // ==========================================
        // CHECK ADVANCE
        // ==========================================
        const advance = await WorkerAdvance.findOne({
            _id: id,
        });

        if (!advance) {
            return res.status(404).json({
                success: false,
                message: "Worker advance not found",
            });
        }



        // ==========================================
        // CHECK WORKER
        // ==========================================
        const worker = await Worker.findOne({
            _id: workerId,

        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // ==========================================
        // GET IST DATE
        // ==========================================
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true,
        });

        // ==========================================
        // UPDATE ADVANCE
        // ==========================================

        advance.workerId = workerId;
        advance.date = date;
        advance.amount = amount;
        advance.purpose = purpose;
        advance.paidBy = paidBy;
        advance.status = status;
        advance.logModifiedDate = logDate;

        // ==========================================
        // SAVE
        // ==========================================
        await advance.save();

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.status(200).json({
            success: true,
            message: "Worker advance updated successfully",
            data: advance,
        });

    } catch (error) {
        console.log("Edit worker advance error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};



export const deleteWorkerAdvance = async(req, res) => {
    try {
        const { id } = req.params;

        // ==========================================
        // CHECK ADVANCE
        // ==========================================
        const advance = await WorkerAdvance.findOne({
            _id: id,
        });

        if (!advance) {
            return res.status(404).json({
                success: false,
                message: "Worker advance not found",
            });
        }

        // ==========================================
        // DELETE ADVANCE
        // ==========================================
        await WorkerAdvance.findOneAndDelete({
            _id: id,
        });

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.status(200).json({
            success: true,
            message: "Worker advance deleted successfully",
        });

    } catch (error) {
        console.log("Delete worker advance error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};



export const getAllWorkerAdvances = async(req, res) => {
    try {
        const advances = await WorkerAdvance.find()
            .sort({ logCreatedDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Worker advances fetched successfully",
            count: advances.length,
            data: advances,
        });

    } catch (error) {
        console.log("Get all worker advances error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const getWorkerAdvanceById = async(req, res) => {
    try {
        const { id } = req.body;

        // ==========================================
        // GET ADVANCE BY ID
        // ==========================================
        const advance = await WorkerAdvance.findOne({
            _id: id,
        });

        if (!advance) {
            return res.status(404).json({
                success: false,
                message: "Worker advance not found",
            });
        }

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.status(200).json({
            success: true,
            message: "Worker advance fetched successfully",
            data: advance,
        });

    } catch (error) {
        console.log("Get worker advance by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};



export const getAllWorkerAdvancesByWorkerId = async(req, res) => {
    try {
        const { workerId } = req.body;


        // ---------------------------------------
        // CHECK WORKER ID
        // ---------------------------------------
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "Worker ID is required",
            });
        }

        // ---------------------------------------
        // CHECK VALID WORKER ID
        // ---------------------------------------
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        // ---------------------------------------
        // GET WORKER ADVANCES
        // ---------------------------------------
        const advances = await WorkerAdvance.find({
            workerId: workerId,
        }).sort({
            logCreatedDate: -1,
        });

        return res.status(200).json({
            success: true,
            message: "Worker advances fetched successfully",
            count: advances.length,
            data: advances,
        });

    } catch (error) {
        console.log("Get worker advances error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }


};