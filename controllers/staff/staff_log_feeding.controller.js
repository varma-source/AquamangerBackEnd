import Logfeeding from "../../models/staff_logFeeding.js";
import Purchase from "../../models/purchase.js";
import Tank from "../../models/tanks.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import UserFarms from "../../models/userFarms.js"


export const addLogfeeding = async function(req, res) {
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
        const purchase = await Purchase.findOne({
            _id: req.body.purchaseId,

        });

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found",
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
        const logfeedingObj = new Logfeeding({
            tankId: req.body.tankId,
            purchaseId: req.body.purchaseId,
            date: req.body.date,
            kg: req.body.kg,
            remarks: req.body.remarks,
            status: req.body.status,
            userId: req.userId,
            speciesId: req.body.speciesId,
            farmId: req.body.farmId,
            staffId: req.staffId,
             feedingType:req.body.feedingType,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveLogfeeding = await logfeedingObj.save();

        if (saveLogfeeding) {
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

//get all
// export const getAllLogfeeding = async function(req, res) {
//     try {

//         console.log("📥 Get All Logfeeding Request:", req.body);

//         const { tankId, farmId, speciesId } = req.body || {};

//         console.log("✅ tankId:", tankId);
//         console.log("✅ farmId:", farmId);
//         console.log("✅ speciesId:", speciesId);

//         const matchCondition = {
//             staffId: new mongoose.Types.ObjectId(req.staffId)
//         };

//         // Filter by tankId
//         if (tankId) {
//             matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
//         }

//         // Filter by farmId
//         if (farmId) {
//             matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
//         }

//         // Filter by speciesId
//         if (speciesId) {
//             matchCondition.speciesId = new mongoose.Types.ObjectId(speciesId);
//         }

//         console.log("🔍 Match Condition:", matchCondition);

//         const logfeedings = await Logfeeding.aggregate([{
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
//                     from: "purchases",
//                     localField: "purchaseId",
//                     foreignField: "_id",
//                     as: "purchasesDetails"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "species",
//                     localField: "speciesId",
//                     foreignField: "_id",
//                     as: "speciesDetails"
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
//                     feedName: {
//                         $arrayElemAt: ["$purchasesDetails.feedName", 0]
//                     },
//                     quantityPurchased: {
//                         $arrayElemAt: ["$purchasesDetails.quantityPurchased", 0]
//                     },
//                     pricePerKg: {
//                         $arrayElemAt: ["$purchasesDetails.pricePerKg", 0]
//                     },
//                     speciesName: {
//                         $arrayElemAt: ["$speciesDetails.speciesName", 0]
//                     },
//                     farmName: {
//                         $arrayElemAt: ["$userFarmDetails.farmName", 0]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     tankDetails: 0,
//                     purchasesDetails: 0,
//                     speciesDetails: 0,
//                     userFarmDetails: 0
//                 }
//             },
//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }
//         ]);

//         console.log("📊 Total Logfeeding Records:", logfeedings.length);

//         return res.status(200).json({
//             success: true,
//             message: logfeedings.length > 0 ?
//                 "Fetched successfully" : "No data found",
//             count: logfeedings.length,
//             data: logfeedings
//         });

//     } catch (err) {
//         console.log("❌ Get All Logfeeding Error:", err);

//         return res.status(400).json({
//             success: false,
//             message: "Something went wrong"
//         });
//     }
// };


export const getAllLogfeeding = async function(req, res) {
    try {

        console.log("📥 Get All Logfeeding Request:", req.body);

        const { tankId, farmId, speciesId } = req.body || {};

        console.log("✅ tankId:", tankId);
        console.log("✅ farmId:", farmId);
        console.log("✅ speciesId:", speciesId);

        const matchCondition = {
            staffId: new mongoose.Types.ObjectId(req.staffId)
        };

        // Filter by tankId
        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        // Filter by farmId
        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        // Filter by speciesId
        if (speciesId) {
            matchCondition.speciesId = new mongoose.Types.ObjectId(speciesId);
        }

        console.log("🔍 Match Condition:", matchCondition);

        // COMMON LOOKUP PIPELINE
        const lookupPipeline = [{
                $lookup: {
                    from: "tanks",
                    localField: "tankId",
                    foreignField: "_id",
                    as: "tankDetails"
                }
            },
            {
                $lookup: {
                    from: "purchases",
                    localField: "purchaseId",
                    foreignField: "_id",
                    as: "purchasesDetails"
                }
            },
            {
                $lookup: {
                    from: "species",
                    localField: "speciesId",
                    foreignField: "_id",
                    as: "speciesDetails"
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
                    feedName: {
                        $arrayElemAt: ["$purchasesDetails.feedName", 0]
                    },
                    quantityPurchased: {
                        $arrayElemAt: ["$purchasesDetails.quantityPurchased", 0]
                    },
                    pricePerKg: {
                        $arrayElemAt: ["$purchasesDetails.pricePerKg", 0]
                    },
                    speciesName: {
                        $arrayElemAt: ["$speciesDetails.speciesName", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$userFarmDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    purchasesDetails: 0,
                    speciesDetails: 0,
                    userFarmDetails: 0
                }
            }
        ];

        // GET STAFF LOGFEEDING
        let logfeedings = await Logfeeding.aggregate([{
                $match: matchCondition
            },
            ...lookupPipeline
        ]);

        // GET ADMIN LOGFEEDING WHEN USERID IS AVAILABLE
        if (req.userId) {

            const adminMatchCondition = {
                userId: new mongoose.Types.ObjectId(req.userId)
            };

            // Filter by tankId
            if (tankId) {
                adminMatchCondition.tankId = new mongoose.Types.ObjectId(tankId);
            }

            // Filter by farmId
            if (farmId) {
                adminMatchCondition.farmId = new mongoose.Types.ObjectId(farmId);
            }

            // Filter by speciesId
            if (speciesId) {
                adminMatchCondition.speciesId = new mongoose.Types.ObjectId(speciesId);
            }

            console.log("🔍 Admin Match Condition:", adminMatchCondition);

            const adminLogfeedings = await mongoose.connection
                .collection("logfeedings")
                .aggregate([{
                        $match: adminMatchCondition
                    },
                    ...lookupPipeline
                ])
                .toArray();

            // COMBINE STAFF AND ADMIN DATA
            logfeedings = [...logfeedings, ...adminLogfeedings];
        }

        // SORT BOTH COLLECTION DATA
        logfeedings.sort((a, b) =>
            new Date(b.logCreatedDate) - new Date(a.logCreatedDate)
        );

        console.log("📊 Total Logfeeding Records:", logfeedings.length);

        return res.status(200).json({
            success: true,
            message: logfeedings.length > 0 ?
                "Fetched successfully" : "No data found",
            count: logfeedings.length,
            data: logfeedings
        });

    } catch (err) {
        console.log("❌ Get All Logfeeding Error:", err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

//
export const getstafflogfeedings = async function(req, res) {
    try {



        const matchCondition = {
            staffId: new mongoose.Types.ObjectId(req.staffId)
        };



        console.log("🔍 Match Condition:", matchCondition);

        const logfeedings = await Logfeeding.aggregate([{
                $match: matchCondition
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
                    from: "purchases",
                    localField: "purchaseId",
                    foreignField: "_id",
                    as: "purchasesDetails"
                }
            },
            {
                $lookup: {
                    from: "species",
                    localField: "speciesId",
                    foreignField: "_id",
                    as: "speciesDetails"
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
                    feedName: {
                        $arrayElemAt: ["$purchasesDetails.feedName", 0]
                    },
                    quantityPurchased: {
                        $arrayElemAt: ["$purchasesDetails.quantityPurchased", 0]
                    },
                    pricePerKg: {
                        $arrayElemAt: ["$purchasesDetails.pricePerKg", 0]
                    },
                    speciesName: {
                        $arrayElemAt: ["$speciesDetails.speciesName", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$userFarmDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    purchasesDetails: 0,
                    speciesDetails: 0,
                    userFarmDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        console.log("📊 Total Logfeeding Records:", logfeedings.length);

        return res.status(200).json({
            success: true,
            message: logfeedings.length > 0 ?
                "Fetched successfully" : "No data found",
            count: logfeedings.length,
            data: logfeedings
        });

    } catch (err) {
        console.log("❌ Get All Logfeeding Error:", err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};