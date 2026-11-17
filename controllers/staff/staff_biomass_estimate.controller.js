import BiomassEstimates from "../../models/staff_biomasEstimate.js";
import Tank from "../../models/tanks.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import UserFarms from "../../models/userFarms.js";
import StaffBiomassEstimates from "../../models/staff_biomasEstimate.js";
import AdminBiomassEstimates from "../../models/biomassEstimate.js"


export const addBiomassEstimate = async function(req, res) {
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
        const farm = await UserFarms.findOne({
            _id: req.body.farmId,

        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }


        const biomassObj = new BiomassEstimates({
            tankId: req.body.tankId,
            staffId: req.staffId,
            date: req.body.date,
            estimaTedBiomassKg: req.body.estimaTedBiomassKg,
            averageBodyWeight: req.body.averageBodyWeight,
            survival: req.body.survival,
            reamrks: req.body.reamrks,
            status: req.body.status,
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveBiomass = await biomassObj.save();

        if (saveBiomass) {
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

// export const getAllBiomassEstimates = async function(req, res) {
//     try {
//         const { tankId, farmId } = req.body || {};

//         const matchCondition = {
//             staffId: new mongoose.Types.ObjectId(req.staffId)
//         };

//         // Filter by tankId
//         if (tankId) {
//             if (!mongoose.Types.ObjectId.isValid(tankId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid tankId is required"
//                 });
//             }

//             matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
//         }

//         // Filter by farmId
//         if (farmId) {
//             if (!mongoose.Types.ObjectId.isValid(farmId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid farmId is required"
//                 });
//             }

//             matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
//         }

//         const biomassEstimates = await BiomassEstimates.aggregate([{
//                 $match: matchCondition
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
//                 $lookup: {
//                     from: "user_farms",
//                     localField: "farmId",
//                     foreignField: "_id",
//                     as: "userFarmDetails"
//                 }
//             },
//             {
//                 $addFields: {
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     },
//                     farmName: {
//                         $arrayElemAt: ["$userFarmDetails.farmName", 0]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     tankDetails: 0,
//                     userFarmDetails: 0
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
//             count: biomassEstimates.length,
//             data: biomassEstimates
//         });

//     } catch (err) {
//         console.log(err);

//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             data: []
//         });
//     }
// };


export const getAllBiomassEstimates = async function(req, res) {
    try {
        const { tankId, farmId } = req.body || {};

        // Admin biomass match condition
        const adminMatchCondition = {
            userId: new mongoose.Types.ObjectId(req.userId)
        };

        // Staff biomass match condition
        const staffMatchCondition = {
            staffId: new mongoose.Types.ObjectId(req.staffId)
        };

        // Filter by tankId
        if (tankId) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid tankId is required"
                });
            }

            const tankObjectId = new mongoose.Types.ObjectId(tankId);

            adminMatchCondition.tankId = tankObjectId;
            staffMatchCondition.tankId = tankObjectId;
        }

        // Filter by farmId
        if (farmId) {
            if (!mongoose.Types.ObjectId.isValid(farmId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid farmId is required"
                });
            }

            const farmObjectId = new mongoose.Types.ObjectId(farmId);

            adminMatchCondition.farmId = farmObjectId;
            staffMatchCondition.farmId = farmObjectId;
        }

        // 1. Get admin biomass estimates
        const adminBiomassEstimates = await AdminBiomassEstimates.aggregate([{
                $match: adminMatchCondition
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
                    as: "userFarmDetails"
                }
            },
            {
                $addFields: {
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$userFarmDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    userFarmDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // 2. Get staff biomass estimates
        const staffBiomassEstimates = await StaffBiomassEstimates.aggregate([{
                $match: staffMatchCondition
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
                    as: "userFarmDetails"
                }
            },
            {
                $addFields: {
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$userFarmDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    userFarmDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // 3. Combine admin and staff biomass estimates
        const biomassEstimates = [
            ...adminBiomassEstimates,
            ...staffBiomassEstimates
        ];

        // 4. Sort combined records by latest date
        biomassEstimates.sort((a, b) => {
            return new Date(b.logCreatedDate) - new Date(a.logCreatedDate);
        });

        return res.status(200).json({
            success: true,
            message: "Fetched successfully",
            count: biomassEstimates.length,
            data: biomassEstimates
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            data: []
        });
    }
};