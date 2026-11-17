import MedicineUsage from "../../models/staff_medicine_usage.js";
import Medicine from "../../models/medicines.js";
import Tank from "../../models/tanks.js";
import UserFarms from "../../models/userFarms.js";

import mongoose from "mongoose";
import { DateTime } from "luxon";

// ============================================================
// ADD MEDICINE USAGE
// ============================================================
export const addMedicineUsage = async function(req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const staffId = req.staffId;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required",
            });
        }

        // CHECK TANK
        const tank = await Tank.findOne({
            _id: req.body.tankId,
        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found",
            });
        }

        // CHECK MEDICINE
        const medicine = await Medicine.findOne({
            _id: req.body.medicineId,
        });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }

        // CHECK FARM
        const farm = await UserFarms.findOne({
            _id: req.body.farmId,
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        const medicineUsageObj = new MedicineUsage({
            medicineId: req.body.medicineId,
            tankId: req.body.tankId,
            staffId: new mongoose.Types.ObjectId(staffId),
            date: req.body.date,
            quanTityUsed: req.body.quanTityUsed,
            notes: req.body.notes,
            status: req.body.status,
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveMedicineUsage = await medicineUsageObj.save();

        if (saveMedicineUsage) {
            return res.status(200).json({
                success: true,
                message: "Added successfully",
                data: saveMedicineUsage,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// ============================================================
// UPDATE MEDICINE USAGE
// ============================================================
export const updateMedicineUsage = async function(req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const staffId = req.staffId;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required",
            });
        }

        const medicineUsageObj = await MedicineUsage.findOne({
            _id: req.params.id,
            staffId: new mongoose.Types.ObjectId(staffId),
        });

        if (!medicineUsageObj) {
            return res.status(404).json({
                success: false,
                message: "Medicine usage not found",
            });
        }

        // CHECK TANK
        const tank = await Tank.findOne({
            _id: req.body.tankId,
        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found",
            });
        }

        // CHECK MEDICINE
        const medicine = await Medicine.findOne({
            _id: req.body.medicineId,
        });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }

        // CHECK FARM
        const farm = await UserFarms.findOne({
            _id: req.body.farmId,
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }

        medicineUsageObj.medicineId = req.body.medicineId;
        medicineUsageObj.tankId = req.body.tankId;
        medicineUsageObj.farmId = req.body.farmId;
        medicineUsageObj.staffId = new mongoose.Types.ObjectId(staffId);
        medicineUsageObj.date = req.body.date;
        medicineUsageObj.quanTityUsed = req.body.quanTityUsed;
        medicineUsageObj.notes = req.body.notes;
        medicineUsageObj.status = req.body.status;
        medicineUsageObj.logModifiedDate = logDate;

        const updateMedicineUsage = await medicineUsageObj.save();

        if (updateMedicineUsage) {
            return res.status(200).json({
                success: true,
                message: "Updated successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// ============================================================
// GET ALL MEDICINE USAGE
// ============================================================
export const getAllMedicineUsage = async function(req, res) {
    try {
        const staffId = req.staffId;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required",
                data: [],
            });
        }

        const medicineUsages = await MedicineUsage.aggregate([{
                $match: {
                    staffId: new mongoose.Types.ObjectId(staffId),
                }
            },
            {
                $lookup: {
                    from: "medicines",
                    localField: "medicineId",
                    foreignField: "_id",
                    as: "medicineDetails"
                }
            },
            {
                $lookup: {
                    from: "tanks",
                    localField: "tankId",
                    foreignField: "_id",
                    as: "tankDetails"
                }
            },
            {
                $lookup: {
                    from: "user_farms",
                    localField: "farmId",
                    foreignField: "_id",
                    as: "user_farmsDetails"
                }
            },
            {
                $addFields: {
                    medicineName: {
                        $arrayElemAt: ["$medicineDetails.medicineName", 0]
                    },
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$user_farmsDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    medicineDetails: 0,
                    tankDetails: 0,
                    user_farmsDetails: 0

                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Fetched successfully",
            count: medicineUsages.length,
            data: medicineUsages,
        });

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
            data: [],
        });
    }
};

// ============================================================
// GET MEDICINE USAGE BY ID
// ============================================================
export const getMedicineUsageById = async function(req, res) {
    try {
        const staffId = req.staffId;
        const { medicineUsageId } = req.body;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required",
                data: {},
            });
        }

        if (!medicineUsageId || !mongoose.Types.ObjectId.isValid(medicineUsageId)) {
            return res.status(400).json({
                success: false,
                message: "Valid medicineUsageId is required",
                data: {},
            });
        }

        const medicineUsageObj = await MedicineUsage.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(medicineUsageId),
                    staffId: new mongoose.Types.ObjectId(staffId),
                }
            },
            {
                $lookup: {
                    from: "medicines",
                    localField: "medicineId",
                    foreignField: "_id",
                    as: "medicineDetails"
                }
            },
            {
                $lookup: {
                    from: "tanks",
                    localField: "tankId",
                    foreignField: "_id",
                    as: "tankDetails"
                }
            },
            {
                $addFields: {
                    medicineName: {
                        $arrayElemAt: ["$medicineDetails.medicineName", 0]
                    },
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    }
                }
            },
            {
                $project: {
                    medicineDetails: 0,
                    tankDetails: 0
                }
            }
        ]);

        if (medicineUsageObj.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: medicineUsageObj[0],
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Medicine usage not found",
                data: {},
            });
        }

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// ============================================================
// DELETE MEDICINE USAGE
// ============================================================
export const deleteMedicineUsage = async function(req, res) {
    try {
        const staffId = req.staffId;
        const { id } = req.params;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required",
            });
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid medicine usage ID is required",
            });
        }

        const deleteMedicineUsage = await MedicineUsage.findOneAndDelete({
            _id: id,
            staffId: new mongoose.Types.ObjectId(staffId),
        });

        if (deleteMedicineUsage) {
            return res.status(200).json({
                success: true,
                message: "Deleted successfully",
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Medicine usage not found",
            });
        }

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};