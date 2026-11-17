import MedicineUsage from "../../models/medicineUsage.js";
import Medicine from "../../models/medicines.js";
import Tank from "../../models/tanks.js";
import UserFarms from "../../models/userFarms.js"

import mongoose from "mongoose";
import { DateTime } from "luxon";

export const addMedicineUsage = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        // CHECK TANK
        // ==========================================
        const tank = await Tank.findOne({
            _id: req.body.tankId,

        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found",
            });
        }

        // CHECK PARTY
        // ==========================================
        const medicine = await Medicine.findOne({
            _id: req.body.medicineId,

        });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }
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
            userId: req.userId,
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
            res.status(200).json({
                success: true,
                message: "Added successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }

    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }


};

export const updateMedicineUsage = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const medicineUsageObj = await MedicineUsage.findById(req.params.id);

        if (!medicineUsageObj) {
            return res.status(400).json({
                success: false,
                message: "Medicine usage not found",
            });
        }

        // CHECK TANK
        // ==========================================
        const tank = await Tank.findOne({
            _id: req.body.tankId,

        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found",
            });
        }

        // CHECK PARTY
        // ==========================================
        const medicine = await Medicine.findOne({
            _id: req.body.medicineId,

        });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }

        medicineUsageObj.medicineId = req.body.medicineId;
        medicineUsageObj.tankId = req.body.tankId;
        medicineUsageObj.userId = req.userId;
        medicineUsageObj.date = req.body.date;
        medicineUsageObj.quanTityUsed = req.body.quanTityUsed;
        medicineUsageObj.notes = req.body.notes;
        medicineUsageObj.status = req.body.status;
        medicineUsageObj.logModifiedDate = logDate;

        const updateMedicineUsage = await medicineUsageObj.save();

        if (updateMedicineUsage) {
            res.status(200).json({
                success: true,
                message: "Updated successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }

    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }


};

// export const getAllMedicineUsage = async function(req, res) {
//     try {


//         const medicineUsages = await MedicineUsage.aggregate([

//             {
//                 $lookup: {
//                     from: "medicines",
//                     localField: "medicineId",
//                     foreignField: "_id",
//                     as: "medicineDetails"
//                 }
//             },

//             {
//                 $lookup: {
//                     from: "tanks",
//                     localField: "tankId",
//                     foreignField: "_id",
//                     as: "tankDetails"
//                 }
//             },

//             {
//                 $addFields: {
//                     medicineName: {
//                         $arrayElemAt: ["$medicineDetails.medicineName", 0]
//                     },
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     }
//                 }
//             },

//             {
//                 $project: {
//                     medicineDetails: 0,
//                     tankDetails: 0
//                 }
//             },

//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }

//         ]);

//         if (medicineUsages) {
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched successfully",
//                 count: medicineUsages.length,
//                 data: medicineUsages,
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: "No data found",
//                 data: [],
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         res.status(400).json({
//             success: false,
//             message: "Something went wrong",
//         });
//     }


// };


// export const getAllMedicineUsage = async function(req, res) {
//     try {
//         const medicineUsages = await MedicineUsage.aggregate([{
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(req.userId)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "medicines",
//                     localField: "medicineId",
//                     foreignField: "_id",
//                     as: "medicineDetails"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "tanks",
//                     localField: "tankId",
//                     foreignField: "_id",
//                     as: "tankDetails"
//                 }
//             },
//             {
//                 $addFields: {
//                     medicineName: {
//                         $arrayElemAt: ["$medicineDetails.medicineName", 0]
//                     },
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     medicineDetails: 0,
//                     tankDetails: 0
//                 }
//             },
//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }
//         ]);

//         return res.status(200).json({
//             success: true,
//             message: "Fetched successfully",
//             count: medicineUsages.length,
//             data: medicineUsages
//         });

//     } catch (err) {
//         console.log(err);

//         return res.status(400).json({
//             success: false,
//             message: "Something went wrong"
//         });
//     }
// };

export const getAllMedicineUsage = async function(req, res) {
    try {
        const { tankId, farmId } = req.body;

        const userId = new mongoose.Types.ObjectId(req.userId);

        const tankObjectId = tankId ?
            new mongoose.Types.ObjectId(tankId) :
            null;

        const farmObjectId = farmId ?
            new mongoose.Types.ObjectId(farmId) :
            null;

        const filterCondition = {};

        if (tankObjectId) {
            filterCondition.tankId = tankObjectId;
        }

        if (farmObjectId) {
            filterCondition.farmId = farmObjectId;
        }

        // Admin medicine usage records
        const medicineUsages = await MedicineUsage.aggregate([{
                $match: {
                    userId: userId,
                    ...filterCondition
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
                    },
                    staffName: ""
                }
            },
            {
                $project: {
                    medicineDetails: 0,
                    tankDetails: 0
                }
            }
        ]);

        // Staff medicine usage records
        const staffMedicineUsages = await mongoose.connection
            .collection("staff_medicine_usages")
            .aggregate([{
                    $match: filterCondition
                },
                {
                    $lookup: {
                        from: "app_staffs",
                        localField: "staffId",
                        foreignField: "_id",
                        as: "staffDetails"
                    }
                },
                {
                    $match: {
                        "staffDetails.userId": userId
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
                        as: "farmDetails"
                    }
                },
                {
                    $addFields: {
                        medicineName: {
                            $arrayElemAt: [
                                "$medicineDetails.medicineName",
                                0
                            ]
                        },
                        tankName: {
                            $arrayElemAt: [
                                "$tankDetails.name",
                                0
                            ]
                        },
                        staffName: {
                            $ifNull: [{
                                    $arrayElemAt: [
                                        "$staffDetails.name",
                                        0
                                    ]
                                },
                                ""
                            ]
                        },
                        farmName: {
                            $arrayElemAt: [
                                "$farmDetails.farmName",
                                0
                            ]
                        },
                    }
                },
                {
                    $project: {
                        staffDetails: 0,
                        medicineDetails: 0,
                        tankDetails: 0,
                        farmDetails: 0
                    }
                }
            ])
            .toArray();

        // Combine both collections
        const allMedicineUsages = [
            ...medicineUsages,
            ...staffMedicineUsages
        ].sort(
            (a, b) =>
            new Date(b.logCreatedDate) -
            new Date(a.logCreatedDate)
        );

        return res.status(200).json({
            success: true,
            message: "Fetched successfully",
            count: allMedicineUsages.length,
            data: allMedicineUsages
        });

    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


export const getMedicineUsageById = async function(req, res) {
    try {


        const medicineUsageObj = await MedicineUsage.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.medicineUsageId)
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
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: medicineUsageObj[0],
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Medicine usage not found",
                data: {},
            });
        }

    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }


};

export const deleteMedicineUsage = async function(req, res) {
    try {


        const medicineUsageObj = await MedicineUsage.findById(req.params.id);

        if (!medicineUsageObj) {
            return res.status(400).json({
                success: false,
                message: "Medicine usage not found",
            });
        }

        const deleteMedicineUsage = await MedicineUsage.findByIdAndDelete(
            req.params.id
        );

        if (deleteMedicineUsage) {
            res.status(200).json({
                success: true,
                message: "Deleted successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }

    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }


};