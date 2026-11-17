import Worker from "../../models/workers.js";
import { DateTime } from "luxon";
import mongoose from "mongoose";

// ADD WORKER
export const addWorker = async(req, res) => {
    try {
        const {
            name,
            phone,
            joiningDate,
            monthlySalary,
            aadhaarNumber,
            advanceAlreadyGiven,
            status,
        } = req.body;


        // ---------------------------------------
        // CHECK REQUIRED NAME
        // ---------------------------------------
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Worker name is required",
            });
        }

        // ---------------------------------------
        // CHECK DUPLICATE NAME
        // ---------------------------------------
        const duplicateName = await Worker.findOne({
            name: {
                $regex: ` ^ $ { name.trim() }
        $ `,
                $options: "i",
            },
        });

        if (duplicateName) {
            return res.status(400).json({
                success: false,
                message: "Worker with this name already exists",
            });
        }


        // ---------------------------------------
        // IST DATE
        // ---------------------------------------
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true,
        });

        // ---------------------------------------
        // CREATE WORKER
        // ---------------------------------------
        const worker = await Worker.create({
            name: name.trim(),
            phone: phone ? phone.trim() : undefined,
            joiningDate,
            monthlySalary,
            aadhaarNumber: aadhaarNumber ? aadhaarNumber.trim() : undefined,
            advanceAlreadyGiven,
            userId: req.userId,
            status: status || "active",
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        return res.status(201).json({
            success: true,
            message: "Worker added successfully",
            data: worker,
        });
    } catch (error) {
        console.error("Add worker error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }


};

// GET ALL WORKERS
export const getAllWorkers = async(req, res) => {
    try {
        const userId = req.userId;

        const workers = await Worker.find({ userId })
            .sort({ logCreatedDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Workers fetched successfully",
            data: workers,
        });

    } catch (error) {
        console.log("Get all workers error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


// GET WORKER BY ID
export const getWorkerById = async(req, res) => {
    try {
        const { id } = req.body;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        const worker = await Worker.findById(id);

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Worker fetched successfully",
            data: worker,
        });
    } catch (error) {
        console.error("Get worker by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }


};

// EDIT WORKER
export const editWorker = async(req, res) => {
    try {
        const { id } = req.params;


        const {
            name,
            phone,
            joiningDate,
            monthlySalary,
            aadhaarNumber,
            advanceAlreadyGiven,
            status,
        } = req.body;

        // ---------------------------------------
        // CHECK WORKER ID
        // ---------------------------------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        // ---------------------------------------
        // CHECK WORKER EXISTS
        // ---------------------------------------
        const worker = await Worker.findById(id);

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // ---------------------------------------
        // CHECK DUPLICATE NAME
        // ---------------------------------------
        if (name && name.trim()) {
            const duplicateName = await Worker.findOne({
                _id: { $ne: id },
                name: {
                    $regex: ` ^ $ { name.trim() }
$ `,
                    $options: "i",
                },
            });

            if (duplicateName) {
                return res.status(400).json({
                    success: false,
                    message: "Worker with this name already exists",
                });
            }
        }



        // ---------------------------------------
        // UPDATE WORKER
        // ---------------------------------------

        if (name !== undefined) {
            worker.name = name.trim();
        }

        if (phone !== undefined) {
            worker.phone = phone.trim();
        }

        if (joiningDate !== undefined) {
            worker.joiningDate = joiningDate;
        }

        if (monthlySalary !== undefined) {
            worker.monthlySalary = monthlySalary;
        }

        if (aadhaarNumber !== undefined) {
            worker.aadhaarNumber = aadhaarNumber.trim();
        }

        if (advanceAlreadyGiven !== undefined) {
            worker.advanceAlreadyGiven = advanceAlreadyGiven;
        }

        if (status !== undefined) {
            worker.status = status;
        }

        // ---------------------------------------
        // IST MODIFIED DATE
        // ---------------------------------------
        worker.logModifiedDate = DateTime.now()
            .setZone("Asia/Kolkata")
            .toISO({
                includeOffset: true,
            });

        // ---------------------------------------
        // SAVE
        // ---------------------------------------
        await worker.save();

        return res.status(200).json({
            success: true,
            message: "Worker updated successfully",
            data: worker,
        });
    } catch (error) {
        console.error("Edit worker error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }


};

// DELETE WORKER
export const deleteWorker = async(req, res) => {
    try {
        const { id } = req.params;


        const worker = await Worker.findById(id);

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        await Worker.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Worker deleted successfully",
        });
    } catch (error) {
        console.log("Delete worker error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }


};