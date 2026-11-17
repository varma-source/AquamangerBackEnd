import BiomassEstimates from "../../models/biomassEstimate.js";
import Tank from "../../models/tanks.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import UserFarms from "../../models/userFarms.js"

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
            userId: req.userId,
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

export const updateBiomassEstimate = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const biomassObj = await BiomassEstimates.findById(req.params.id);

        if (!biomassObj) {
            return res.status(400).json({
                success: false,
                message: "Biomass estimate not found",
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


        biomassObj.tankId = req.body.tankId;
        biomassObj.userId = req.userId;
        biomassObj.date = req.body.date;
        biomassObj.estimaTedBiomassKg = req.body.estimaTedBiomassKg;
        biomassObj.averageBodyWeight = req.body.averageBodyWeight;
        biomassObj.survival = req.body.survival;
        biomassObj.reamrks = req.body.reamrks;
        biomassObj.status = req.body.status;
        biomassObj.logModifiedDate = logDate;

        const updateBiomass = await biomassObj.save();

        if (updateBiomass) {
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

// export const getAllBiomassEstimates = async function(req, res) {
//     try {


//         const biomassEstimates = await BiomassEstimates.aggregate([{
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(req.userId)
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
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     }
//                 }
//             },

//             {
//                 $project: {
//                     tankDetails: 0
//                 }
//             },

//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }

//         ]);

//         if (biomassEstimates) {
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched successfully",
//                 count: biomassEstimates.length,
//                 data: biomassEstimates,
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



// export const getAllBiomassEstimates = async function(req, res) {
//     try {

//         const { tankId, farmId } = req.body || {};

//         // Validate both tankId and farmId
//         if (!tankId || !farmId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Both tankId and farmId are required",
//                 data: []
//             });
//         }

//         if (!mongoose.Types.ObjectId.isValid(tankId) ||
//             !mongoose.Types.ObjectId.isValid(farmId)
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid tankId and farmId are required",
//                 data: []
//             });
//         }

//         const biomassEstimates = await BiomassEstimates.aggregate([{
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(req.userId),
//                     tankId: new mongoose.Types.ObjectId(tankId),
//                     farmId: new mongoose.Types.ObjectId(farmId)
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
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     }
//                 }
//             },

//             {
//                 $project: {
//                     tankDetails: 0
//                 }
//             },

//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }

//         ]);

//         if (biomassEstimates) {
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched successfully",
//                 count: biomassEstimates.length,
//                 data: biomassEstimates,
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



export const getAllBiomassEstimates = async function(req, res) {
    try {

        const { tankId, farmId } = req.body || {};

        // Validate both tankId and farmId
        if (!tankId || !farmId) {
            return res.status(400).json({
                success: false,
                message: "Both tankId and farmId are required",
                data: []
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(farmId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid tankId and farmId are required",
                data: []
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const tankObjectId = new mongoose.Types.ObjectId(tankId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);

        // 1. Get owner biomass estimates
        const ownerBiomassEstimates = await BiomassEstimates.aggregate([{
                $match: {
                    userId: userObjectId,
                    tankId: tankObjectId,
                    farmId: farmObjectId
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
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // 2. Get staff biomass estimates
        // Check whether staffId belongs to the logged-in user
        const staffBiomassEstimates = await mongoose.connection
            .collection("staff_biomass_estimates")
            .aggregate([{
                    $match: {
                        tankId: tankObjectId,
                        farmId: farmObjectId
                    }
                },
                {
                    $lookup: {
                        from: "app_staffs",
                        let: {
                            staffId: "$staffId"
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$staffId"]
                                        },
                                        {
                                            $eq: ["$userId", userObjectId]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: "staffDetails"
                    }
                },
                {
                    $match: {
                        "staffDetails.0": {
                            $exists: true
                        }
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
                        tankName: {
                            $arrayElemAt: ["$tankDetails.name", 0]
                        }
                    }
                },
                {
                    $project: {
                        tankDetails: 0,
                        staffDetails: 0
                    }
                },
                {
                    $sort: {
                        logCreatedDate: -1
                    }
                }
            ]).toArray();

        // 3. Combine owner and staff biomass estimates
        const biomassEstimates = [
            ...ownerBiomassEstimates,
            ...staffBiomassEstimates
        ];

        // 4. Sort combined records by latest date
        biomassEstimates.sort((a, b) => {
            return new Date(b.logCreatedDate) - new Date(a.logCreatedDate);
        });

        if (biomassEstimates) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: biomassEstimates.length,
                data: biomassEstimates,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "No data found",
                data: [],
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


export const getBiomassEstimateById = async function(req, res) {
    try {


        const biomassObj = await BiomassEstimates.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.biomassEstimateId)
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
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    }
                }
            },

            {
                $project: {
                    tankDetails: 0
                }
            }

        ]);

        if (biomassObj.length > 0) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: biomassObj[0],
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Biomass estimate not found",
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

export const deleteBiomassEstimate = async function(req, res) {
    try {


        const biomassObj = await BiomassEstimates.findById(req.params.id);

        if (!biomassObj) {
            return res.status(400).json({
                success: false,
                message: "Biomass estimate not found",
            });
        }

        const deleteBiomass = await BiomassEstimates.findByIdAndDelete(
            req.params.id
        );

        if (deleteBiomass) {
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