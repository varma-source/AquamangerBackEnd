import { DateTime } from "luxon";
import Tank from "../../models/tanks.js";
import Staff from "../../models/appStaff.js"
import mongoose from "mongoose";
import BiomassEstimate from "../../models/biomassEstimate.js"
import LogFeeding from "../../models/logFeeding.js"
import Purchase from "../../models/purchase.js"
import Medicine from "../../models/medicines.js";
import MedicineUsage from "../../models/medicineUsage.js";
import Harvest from "../../models/harvest.js";
import Expense from "../../models/expenses.js"


//get all tanks
export const tankOverview = async(req, res) => {
    try {
        console.log("📥 Get All Tanks Request:", req.body);

        const userId = req.userId;
        // const { tankId } = req.body;
        const { tankId, farmId } = req.body;


        const matchCondition = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }
        if (tankId) {
            matchCondition._id = new mongoose.Types.ObjectId(tankId);
        }

        const tanks = await Tank.aggregate([{
                $match: matchCondition
            },
            // {
            //     $lookup: {
            //         from: "app_staffs",
            //         localField: "staffId",
            //         foreignField: "_id",
            //         as: "staffDetails"
            //     }
            // },
            // {
            //     $addFields: {
            //         staffName: {
            //             $ifNull: [{
            //                     $arrayElemAt: [
            //                         "$staffDetails.name",
            //                         0
            //                     ]
            //                 },
            //                 ""
            //             ]
            //         }
            //     }
            // },

            {
                $lookup: {
                    from: "app_staffs",
                    localField: "staffId",
                    foreignField: "_id",
                    as: "staffDetails"
                }
            },
            {
                $addFields: {
                    staffName: {
                        $map: {
                            input: "$staffDetails",
                            as: "staff",
                            in: "$$staff.name"
                        }
                    }
                }
            },


            {
                $lookup: {
                    from: "stocks",
                    localField: "_id",
                    foreignField: "tankId",
                    as: "stocks"
                }
            },
            {
                $project: {
                    staffDetails: 0
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
            message: "Tanks retrieved successfully",
            overview: tanks
        });

    } catch (error) {
        console.log("❌ Get All Tanks Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            tanks: []
        });
    }


};


// //Feeding and Fcr
export const getFeedingAndBiomassSummary = async(req, res) => {
    try {
        console.log("Get Feeding And Biomass Summary:", req.body);


        const { tankId, purchaseId, speciesId, farmId } = req.body;
        const userId = req.userId;

        // =========================================
        // REQUIRED FIELDS
        // =========================================

        if (!tankId || !purchaseId || !speciesId || !farmId) {
            return res.status(400).json({
                success: false,
                message: "tankId, farmId, speciesId and purchaseId are required"
            });
        }

        // =========================================
        // VALIDATE IDS
        // =========================================

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(purchaseId) ||
            !mongoose.Types.ObjectId.isValid(speciesId) ||
            !mongoose.Types.ObjectId.isValid(farmId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId, farmId, purchaseId, speciesId or userId"
            });
        }

        const today = DateTime.now()
            .setZone("Asia/Kolkata")
            .toFormat("yyyy-MM-dd");

        const tankObjectId = new mongoose.Types.ObjectId(tankId);
        const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);
        const speciesIdObjectId = new mongoose.Types.ObjectId(speciesId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // =========================================
        // FEEDING SUMMARY
        // =========================================

        const feedingResult = await LogFeeding.aggregate([{
                $match: {
                    tankId: tankObjectId,
                    farmId: farmObjectId,
                    purchaseId: purchaseObjectId,
                    userId: userObjectId,
                    speciesId: speciesIdObjectId
                }
            },
            {
                $group: {
                    _id: null,

                    todaysFeed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$date", today] },
                                {
                                    $convert: {
                                        input: "$kg",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0
                                    }
                                },
                                0
                            ]
                        }
                    },

                    cumulativeFeed: {
                        $sum: {
                            $convert: {
                                input: "$kg",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    todaysFeed: 1,
                    cumulativeFeed: 1
                }
            }
        ]);

        const feedingSummary = feedingResult.length ?
            feedingResult[0] : {
                todaysFeed: 0,
                cumulativeFeed: 0
            };

        // =========================================
        // BIOMASS SUMMARY
        // =========================================

        const biomassRecords = await BiomassEstimate.find({
                tankId: tankObjectId,
                farmId: farmObjectId,
                userId: userObjectId
            })
            .sort({
                logCreatedDate: -1,
                _id: -1
            })
            .select("estimaTedBiomassKg logCreatedDate")
            .lean();

        // Latest biomass record
        const latestRecord = biomassRecords.length ?
            biomassRecords[0] :
            null;

        // Oldest biomass record
        const firstRecord = biomassRecords.length ?
            biomassRecords[biomassRecords.length - 1] :
            null;

        const latestBiomass = Number(
            latestRecord && latestRecord.estimaTedBiomassKg
        ) || 0;

        const firstBiomass = Number(
            firstRecord && firstRecord.estimaTedBiomassKg
        ) || 0;

        const latestLogCreatedDate = (
            latestRecord && latestRecord.logCreatedDate
        ) || null;

        const biomassDifference = latestBiomass - firstBiomass;

        const estimatedFcr = biomassDifference > 0 ?
            Number(
                (
                    feedingSummary.cumulativeFeed /
                    biomassDifference
                ).toFixed(4)
            ) :
            0;

        // =========================================
        // RESPONSE
        // =========================================

        return res.status(200).json({
            success: true,
            data: {
                todaysFeed: feedingSummary.todaysFeed,
                cumulativeFeed: feedingSummary.cumulativeFeed,
                firstBiomass,
                latestBiomass,
                latestLogCreatedDate,
                estimatedFcr
            }
        });

    } catch (error) {
        console.log(
            "Get Feeding And Biomass Summary Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


//Feed stock
export const getFeedStockSummary = async(req, res) => {
    try {
        console.log("Get Feed Stock Summary:", req.body);


        const { tankId, purchaseId, farmId } = req.body;
        const userId = req.userId;

        if (!tankId || !purchaseId || !farmId) {
            return res.status(400).json({
                success: false,
                message: "tankId, purchaseId and farmId are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(purchaseId) ||
            !mongoose.Types.ObjectId.isValid(farmId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId, purchaseId, farmId or userId"
            });
        }

        const tankObjectId = new mongoose.Types.ObjectId(tankId);
        const purchaseObjectId = new mongoose.Types.ObjectId(purchaseId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // =========================================
        // PURCHASE SUMMARY
        // =========================================

        const purchaseResult = await Purchase.aggregate([{
                $match: {
                    tankId: tankObjectId,
                    farmId: farmObjectId,
                    userId: userObjectId,

                }
            },
            {
                $group: {
                    _id: null,

                    totalPurchased: {
                        $sum: {
                            $convert: {
                                input: "$quantityPurchased",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },

                    totalPurchaseAmount: {
                        $sum: {
                            $convert: {
                                input: "$totalAmount",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            }
        ]);

        const purchaseSummary = purchaseResult.length ?
            purchaseResult[0] : {
                totalPurchased: 0,
                totalPurchaseAmount: 0
            };

        const totalPurchased = purchaseSummary.totalPurchased;
        const totalPurchaseAmount = purchaseSummary.totalPurchaseAmount;

        // =========================================
        // AVERAGE COST PER KG
        // =========================================

        const averageCostPerKg = totalPurchased > 0 ?
            totalPurchaseAmount / totalPurchased :
            0;

        // =========================================
        // CONSUMED FEED SUMMARY
        // =========================================

        const feedingResult = await LogFeeding.aggregate([{
                $match: {
                    tankId: tankObjectId,
                    purchaseId: purchaseObjectId,
                    farmId: farmObjectId,
                    userId: userObjectId
                }
            },
            {
                $group: {
                    _id: null,

                    totalConsumed: {
                        $sum: {
                            $convert: {
                                input: "$kg",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            }
        ]);

        const totalConsumed = feedingResult.length ?
            feedingResult[0].totalConsumed :
            0;

        // =========================================
        // CLOSING STOCK
        // =========================================

        const closingStock = totalPurchased - totalConsumed;

        const consumedFeedValue = totalConsumed * averageCostPerKg;

        const closingStockValue =
            totalPurchaseAmount - consumedFeedValue;

        // =========================================
        // RESPONSE
        // =========================================

        return res.status(200).json({
            success: true,
            data: {
                totalPurchased: Number(totalPurchased.toFixed(2)),
                totalPurchaseAmount: Number(totalPurchaseAmount.toFixed(2)),
                averageCostPerKg: Number(averageCostPerKg.toFixed(2)),
                totalConsumed: Number(totalConsumed.toFixed(2)),
                consumedFeedValue: Number(consumedFeedValue.toFixed(2)),
                closingStock: Number(closingStock.toFixed(2)),
                closingStockValue: Number(closingStockValue.toFixed(2))
            }
        });

    } catch (error) {
        console.log("Get Feed Stock Summary Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


//medicine
export const getMedicineUsageSummary = async(req, res) => {
    try {
        console.log("📥 Get Medicine Usage Summary:", req.body);


        const { medicineId, tankId, medicineType, farmId } = req.body;
        const userId = req.userId;

        if (!medicineId || !tankId || !medicineType || !farmId) {
            return res.status(400).json({
                success: false,
                message: "medicineId, tankId, farmId and medicineType are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(medicineId) ||
            !mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(farmId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid medicineId, tankId, farmId or userId"
            });
        }

        const medicineMatch = {
            _id: new mongoose.Types.ObjectId(medicineId),
            tankId: new mongoose.Types.ObjectId(tankId),
            farmId: new mongoose.Types.ObjectId(farmId),
            userId: new mongoose.Types.ObjectId(userId),
            medicineType
        };

        const medicines = await Medicine.find(medicineMatch).lean();

        if (!medicines.length) {
            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        const totalQuantityPurchased = medicines.reduce(
            (sum, item) =>
            sum + Number(item.quantityPurchased || 0),
            0
        );

        const totalPricePerUnits = medicines.reduce(
            (sum, item) =>
            sum + Number(item.pricePerUnits || 0),
            0
        );

        const totalPurchaseAmount = medicines.reduce(
            (sum, item) =>
            sum + Number(item.totalAmount || 0),
            0
        );

        const usageMatch = {
            medicineId: {
                $in: medicines.map(item => item._id)
            },
            tankId: new mongoose.Types.ObjectId(tankId),
            farmId: new mongoose.Types.ObjectId(farmId),
            userId: new mongoose.Types.ObjectId(userId)
        };

        const usageResult = await MedicineUsage.aggregate([
            { $match: usageMatch },
            {
                $group: {
                    _id: null,
                    totalQuantityUsed: {
                        $sum: {
                            $convert: {
                                input: "$quanTityUsed",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            }
        ]);

        const totalQuantityUsed =
            usageResult[0] &&
            usageResult[0].totalQuantityUsed ?
            usageResult[0].totalQuantityUsed :
            0;

        // Cost per unit = total purchase amount / sum of pricePerUnits
        const costPerUnit =
            totalPricePerUnits > 0 ?
            totalPurchaseAmount / totalPricePerUnits :
            0;

        // Total cost of medicine used
        const usedMedicineCost =
            costPerUnit * totalQuantityUsed;

        // Remaining quantity based on purchased quantity
        const remainingQuantity =
            totalQuantityPurchased - totalQuantityUsed;

        // Remaining purchase value
        const remainingMedicineValue =
            totalPurchaseAmount - usedMedicineCost;

        return res.status(200).json({
            success: true,
            data: {
                medicineId,
                tankId,
                farmId,
                medicineType,
                totalRecords: medicines.length,
                totalQuantityPurchased,
                totalPricePerUnits,
                totalPurchaseAmount,
                costPerUnit: Number(costPerUnit.toFixed(2)),
                totalQuantityUsed,
                usedMedicineCost: Number(
                    usedMedicineCost.toFixed(2)
                ),
                remainingQuantity,
                remainingMedicineValue: Number(
                    remainingMedicineValue.toFixed(2)
                )
            }
        });

    } catch (error) {
        console.error(
            "Get Medicine Usage Summary Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


//Harvest
export const getHarvestSummary = async(req, res) => {
    try {
        console.log("📥 Get Harvest Summary:", req.body);


        const { farmId, tankId } = req.body;

        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        if (!tankId || !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Valid tankId is required"
            });
        }

        const farmObjectId = new mongoose.Types.ObjectId(farmId);
        const tankObjectId = new mongoose.Types.ObjectId(tankId);

        const harvestSummary = await Harvest.aggregate([{
                $match: {
                    farmId: farmObjectId,
                    tankId: tankObjectId
                        // status: "active"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    totalQuantityHarvested: {
                        $sum: {
                            $convert: {
                                input: "$quantityHarvested",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },
                    totalAmount: {
                        $sum: {
                            $convert: {
                                input: "$totalAmount",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRecords: 1,
                    totalQuantityHarvested: 1,
                    totalAmount: 1
                }
            }
        ]);

        const data = harvestSummary.length > 0 ?
            harvestSummary[0] : {
                totalRecords: 0,
                totalQuantityHarvested: 0,
                totalAmount: 0
            };

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.log("Get Harvest Summary Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


//PL VIEW
export const PLVIEW = async(req, res) => {
    try {
        console.log("📥 PLVIEW Request:", req.body);


        const userId = req.userId;
        const { farmId, tankId } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);

        const matchCondition = {
            userId: userObjectId,
            farmId: farmObjectId
        };

        if (tankId) {
            matchCondition._id = new mongoose.Types.ObjectId(tankId);
        }

        // ==================== TANK OVERVIEW ====================

        const tanks = await Tank.aggregate([{
                $match: matchCondition
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
                $addFields: {
                    staffName: {
                        $ifNull: [
                            { $arrayElemAt: ["$staffDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "_id",
                    foreignField: "tankId",
                    as: "stocks"
                }
            },
            {
                $project: {
                    staffDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // Use tank IDs belonging to the authenticated user and selected farm.
        const tankIds = tanks.map(tank => tank._id);

        const relatedMatch = {
            userId: userObjectId,
            farmId: farmObjectId,
            tankId: { $in: tankIds }
        };

        // ==================== PURCHASES ====================

        const purchases = await Purchase.aggregate([{
                $match: relatedMatch
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    },
                    tankName: {
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // ==================== MEDICINES ====================

        const medicines = await Medicine.aggregate([{
                $match: relatedMatch
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    },
                    tankName: {
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // ==================== HARVESTS ====================

        const harvests = await Harvest.aggregate([{
                $match: relatedMatch
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
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
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

        // ==================== EXPENSES ====================

        const expenses = await Expense.aggregate([{
                $match: {
                    createdBy: userObjectId,
                    farmId: farmObjectId,
                    tankId: { $in: tankIds }
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
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
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

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully",
            overview: tanks,
            purchases: purchases,
            medicines: medicines,
            harvests: harvests,
            expenses: expenses
        });

    } catch (error) {
        console.log("❌ PLVIEW Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            overview: [],
            purchases: [],
            medicines: [],
            harvests: [],
            expenses: []
        });
    }


};

//PL REPORT
export const PLREPORT = async(req, res) => {
    try {
        console.log("📥 PLREPORT Request:", req.body);


        const userId = req.userId;
        const { farmId, tankId, fromDate, toDate } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fromDate. Use YYYY-MM-DD format"
            });
        }

        if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid toDate. Use YYYY-MM-DD format"
            });
        }

        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "fromDate cannot be greater than toDate"
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);

        const getDateFilter = (fieldName) => {
            const dateCondition = {};

            if (fromDate) {
                dateCondition.$gte = fromDate;
            }

            if (toDate) {
                dateCondition.$lte = toDate;
            }

            return Object.keys(dateCondition).length ? {
                [fieldName]: dateCondition
            } : {};
        };

        // ==================== TANK OVERVIEW ====================

        const matchCondition = {
            userId: userObjectId,
            farmId: farmObjectId
        };

        if (tankId) {
            matchCondition._id = new mongoose.Types.ObjectId(tankId);
        }

        const tanks = await Tank.aggregate([{
                $match: matchCondition
            },
            // {
            //     $lookup: {
            //         from: "app_staffs",
            //         localField: "staffId",
            //         foreignField: "_id",
            //         as: "staffDetails"
            //     }
            // },
            // {
            //     $addFields: {
            //         staffName: {
            //             $ifNull: [
            //                 { $arrayElemAt: ["$staffDetails.name", 0] },
            //                 ""
            //             ]
            //         }
            //     }
            // },


            {
                $lookup: {
                    from: "app_staffs",
                    let: { staffIds: "$staffId" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: { $ifNull: ["$$staffIds", []] },
                                            as: "id",
                                            in: { $toObjectId: "$$id" }
                                        }
                                    }
                                ]
                            }
                        }
                    }],
                    as: "staffDetails"
                }
            },
            {
                $addFields: {
                    staffName: {
                        $map: {
                            input: "$staffDetails",
                            as: "staff",
                            in: "$$staff.name"
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "stocks",
                    localField: "_id",
                    foreignField: "tankId",
                    as: "stocks"
                }
            },
            {
                $project: {
                    staffDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // Tank IDs belonging to this user and selected farm
        const tankIds = tanks.map(tank => tank._id);

        const relatedMatch = {
            userId: userObjectId,
            farmId: farmObjectId,
            tankId: { $in: tankIds }
        };

        // ==================== PURCHASES ====================

        const purchases = await Purchase.aggregate([{
                $match: {
                    ...relatedMatch,
                    ...getDateFilter("date")
                }
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    },
                    tankName: {
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // ==================== MEDICINES ====================

        const medicines = await Medicine.aggregate([{
                $match: {
                    ...relatedMatch,
                    ...getDateFilter("purchaseDate")
                }
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    },
                    tankName: {
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        // ==================== HARVESTS ====================

        const harvests = await Harvest.aggregate([{
                $match: {
                    ...relatedMatch,
                    ...getDateFilter("date")
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
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
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

        // ==================== EXPENSES ====================

        const expenses = await Expense.aggregate([{
                $match: {
                    createdBy: userObjectId,
                    farmId: farmObjectId,
                    tankId: { $in: tankIds },
                    ...getDateFilter("date")
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
                        $ifNull: [
                            { $arrayElemAt: ["$tankDetails.name", 0] },
                            ""
                        ]
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

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully",
            overview: tanks,
            purchases: purchases,
            medicines: medicines,
            harvests: harvests,
            expenses: expenses
        });

    } catch (error) {
        console.log("❌ PLREPORT Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            overview: [],
            purchases: [],
            medicines: [],
            harvests: [],
            expenses: []
        });
    }


};


//Balance sheet
export const getBalancesheet = async(req, res) => {
    try {
        console.log("📥 Get Balance Sheet Request:", req.body);


        const userId = req.userId;
        const { farmId, tankId, fromDate, toDate } = req.body;

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        // Validate farmId
        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        // Validate tankId if provided
        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        // Validate date range
        if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fromDate. Use YYYY-MM-DD format"
            });
        }

        if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid toDate. Use YYYY-MM-DD format"
            });
        }

        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "fromDate cannot be greater than toDate"
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const farmObjectId = new mongoose.Types.ObjectId(farmId);

        // Tank filter
        const matchCondition = {
            userId: userObjectId,
            farmId: farmObjectId
        };

        if (tankId) {
            matchCondition._id = new mongoose.Types.ObjectId(tankId);
        }

        // Build stock date conditions
        const stockDateConditions = [];

        if (fromDate) {
            stockDateConditions.push({
                $gte: ["$date", fromDate]
            });
        }

        if (toDate) {
            stockDateConditions.push({
                $lte: ["$date", toDate]
            });
        }

        // Build medicine date conditions
        const medicineDateConditions = [];

        if (fromDate) {
            medicineDateConditions.push({
                $gte: ["$purchaseDate", fromDate]
            });
        }

        if (toDate) {
            medicineDateConditions.push({
                $lte: ["$purchaseDate", toDate]
            });
        }

        const tanks = await Tank.aggregate([{
                $match: matchCondition
            },

            // // Staff details
            // {
            //     $lookup: {
            //         from: "app_staffs",
            //         localField: "staffId",
            //         foreignField: "_id",
            //         as: "staffDetails"
            //     }
            // },
            // {
            //     $addFields: {
            //         staffName: {
            //             $ifNull: [
            //                 { $arrayElemAt: ["$staffDetails.name", 0] },
            //                 ""
            //             ]
            //         }
            //     }
            // },
            {
                $lookup: {
                    from: "app_staffs",
                    let: { staffIds: "$staffId" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    {
                                        $map: {
                                            input: { $ifNull: ["$$staffIds", []] },
                                            as: "id",
                                            in: { $toObjectId: "$$id" }
                                        }
                                    }
                                ]
                            }
                        }
                    }],
                    as: "staffDetails"
                }
            },
            {
                $addFields: {
                    staffName: {
                        $map: {
                            input: "$staffDetails",
                            as: "staff",
                            in: "$$staff.name"
                        }
                    }
                }
            },

            // Stock summary filtered by farmId, tankId and date
            {
                $lookup: {
                    from: "stocks",
                    let: {
                        currentTankId: "$_id",
                        currentFarmId: "$farmId"
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$tankId", "$$currentTankId"]
                                        },
                                        {
                                            $eq: ["$farmId", "$$currentFarmId"]
                                        },
                                        ...stockDateConditions
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,

                                quantityStocked: {
                                    $sum: {
                                        $convert: {
                                            input: "$quantityStocked",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0
                                        }
                                    }
                                },

                                totalAmount: {
                                    $sum: {
                                        $multiply: [{
                                                $convert: {
                                                    input: "$quantityStocked",
                                                    to: "double",
                                                    onError: 0,
                                                    onNull: 0
                                                }
                                            },
                                            {
                                                $convert: {
                                                    input: "$stockingCostPerUnit",
                                                    to: "double",
                                                    onError: 0,
                                                    onNull: 0
                                                }
                                            }
                                        ]
                                    }
                                },

                                totalRecords: {
                                    $sum: 1
                                }
                            }
                        }
                    ],
                    as: "stockSummary"
                }
            },

            // Medicine summary filtered by farmId, tankId and purchaseDate
            {
                $lookup: {
                    from: "medicines",
                    let: {
                        currentTankId: "$_id",
                        currentFarmId: "$farmId"
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$tankId", "$$currentTankId"]
                                        },
                                        {
                                            $eq: ["$farmId", "$$currentFarmId"]
                                        },
                                        ...medicineDateConditions
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,

                                quantityPurchased: {
                                    $sum: {
                                        $convert: {
                                            input: "$quantityPurchased",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0
                                        }
                                    }
                                },

                                totalAmount: {
                                    $sum: {
                                        $convert: {
                                            input: "$totalAmount",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0
                                        }
                                    }
                                },

                                totalRecords: {
                                    $sum: 1
                                }
                            }
                        }
                    ],
                    as: "medicineSummary"
                }
            },

            // Add date range and default summary values
            {
                $addFields: {
                    fromDate: {
                        $literal: fromDate || ""
                    },

                    toDate: {
                        $literal: toDate || ""
                    },

                    stockSummary: {
                        $ifNull: [
                            { $arrayElemAt: ["$stockSummary", 0] },
                            {
                                quantityStocked: 0,
                                totalAmount: 0,
                                totalRecords: 0
                            }
                        ]
                    },

                    medicineSummary: {
                        $ifNull: [
                            { $arrayElemAt: ["$medicineSummary", 0] },
                            {
                                quantityPurchased: 0,
                                totalAmount: 0,
                                totalRecords: 0
                            }
                        ]
                    }
                }
            },

            // Remove unnecessary staff details array
            {
                $project: {
                    staffDetails: 0
                }
            },

            // Latest tanks first
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Balance sheet retrieved successfully",
            overview: tanks
        });

    } catch (error) {
        console.log("❌ Get Balance Sheet Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


//GET FEED REPORT
export const getFeedStockReport = async function(req, res) {
    try {
        console.log("📥 Get Feed Stock Report Request:", req.body);


        const userId = req.userId;
        const { farmId, tankId, fromDate, toDate } = req.body;

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        // Validate farmId
        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        // Validate tankId if provided
        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        // Validate dates
        if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fromDate. Use YYYY-MM-DD format"
            });
        }

        if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid toDate. Use YYYY-MM-DD format"
            });
        }

        // Validate date range
        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "fromDate cannot be greater than toDate"
            });
        }

        // Build match conditions
        const matchCondition = {
            userId: new mongoose.Types.ObjectId(userId),
            farmId: new mongoose.Types.ObjectId(farmId)
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (fromDate || toDate) {
            matchCondition.date = {};

            if (fromDate) {
                matchCondition.date.$gte = fromDate;
            }

            if (toDate) {
                matchCondition.date.$lte = toDate;
            }
        }

        const purchases = await Purchase.aggregate([{
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $arrayElemAt: ["$partyDetails.name", 0]
                    },
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    }
                }
            },
            {
                $facet: {
                    records: [{
                            $sort: {
                                logCreatedDate: -1
                            }
                        },
                        {
                            $project: {
                                partyDetails: 0,
                                tankDetails: 0
                            }
                        }
                    ],
                    summary: [{
                        $group: {
                            _id: null,
                            quantityPurchased: {
                                $sum: {
                                    $convert: {
                                        input: "$quantityPurchased",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            },
                            totalAmount: {
                                $sum: {
                                    $convert: {
                                        input: "$totalAmount",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            },
                            totalRecords: {
                                $sum: 1
                            }
                        }
                    }]
                }
            },
            {
                $project: {
                    records: 1,
                    summary: {
                        $ifNull: [
                            { $arrayElemAt: ["$summary", 0] },
                            {
                                quantityPurchased: 0,
                                totalAmount: 0,
                                totalRecords: 0
                            }
                        ]
                    }
                }
            }
        ]);

        const result = purchases[0] || {
            records: [],
            summary: {
                quantityPurchased: 0,
                totalAmount: 0,
                totalRecords: 0
            }
        };

        return res.status(200).json({
            success: true,
            message: "Purchases fetched successfully",
            farmId: farmId,
            fromDate: fromDate || "",
            toDate: toDate || "",
            tankId: tankId || "",
            count: result.records.length,
            summary: result.summary,
            data: result.records
        });

    } catch (err) {
        console.log("❌ Get Feed Stock Report Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    }


};


//GET MEDICINE REPORT
export const GetmedicineReport = async function(req, res) {
    try {
        console.log("📥 Get Medicine Report Request:", req.body);


        const { farmId, tankId, fromDate, toDate } = req.body;

        // Validate farmId
        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required",
                data: []
            });
        }

        // Validate tankId if provided
        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId",
                data: []
            });
        }

        // Validate dates
        if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid fromDate. Use YYYY-MM-DD format",
                data: []
            });
        }

        if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid toDate. Use YYYY-MM-DD format",
                data: []
            });
        }

        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "fromDate cannot be greater than toDate",
                data: []
            });
        }

        // Build match conditions
        const matchCondition = {
            farmId: new mongoose.Types.ObjectId(farmId)
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (fromDate || toDate) {
            matchCondition.purchaseDate = {};

            if (fromDate) {
                matchCondition.purchaseDate.$gte = fromDate;
            }

            if (toDate) {
                matchCondition.purchaseDate.$lte = toDate;
            }
        }

        const medicines = await Medicine.aggregate([{
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
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
                    partyName: {
                        $arrayElemAt: ["$partyDetails.name", 0]
                    },
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0
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
            count: medicines.length,
            farmId: farmId,
            fromDate: fromDate || "",
            toDate: toDate || "",
            data: medicines
        });

    } catch (err) {
        console.log("Get Medicine Report Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            data: []
        });
    }


};