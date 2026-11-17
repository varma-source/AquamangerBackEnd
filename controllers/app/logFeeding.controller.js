import Logfeeding from "../../models/logFeeding.js";
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

export const updateLogfeeding = async function(req, res) {
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

        const logfeedingObj = await Logfeeding.findById(req.params.id);

        if (!logfeedingObj) {
            return res.status(400).json({
                success: false,
                message: "Log feeding not found",
            });
        }

        logfeedingObj.tankId = req.body.tankId;
        logfeedingObj.purchaseId = req.body.purchaseId;
        logfeedingObj.speciesId = req.body.speciesId;
        logfeedingObj.date = req.body.date;
        logfeedingObj.kg = req.body.kg;
        logfeedingObj.remarks = req.body.remarks;
        logfeedingObj.status = req.body.status;
        logfeedingObj.feedingType = req.body.feedingType;
        logfeedingObj.logModifiedDate = logDate;

        

        const updateLogfeeding = await logfeedingObj.save();

        if (updateLogfeeding) {
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


export const getAllLogfeeding = async function(req, res) {
    try {
        console.log("📥 Get All Logfeeding Request:", req.body);

        const { tankId, farmId, speciesId } = req.body || {};

        const userId = new mongoose.Types.ObjectId(req.userId);

        const matchCondition = {
            userId: userId
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        if (speciesId) {
            matchCondition.speciesId = new mongoose.Types.ObjectId(speciesId);
        }

        console.log("🔍 Match Condition:", matchCondition);

        // Admin logfeeding records
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
                $addFields: {
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    feedName: {
                        $arrayElemAt: ["$purchasesDetails.feedName", 0]
                    },
                    staffName: ""
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    purchasesDetails: 0
                }
            }
        ]);

        // Staff logfeeding records
        const staffLogfeedings = await mongoose.connection
            .collection("staff_log_feedings")
            .aggregate([{
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
                    $match: {
                        "staffDetails.userId": userId
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
                        from: "purchases",
                        localField: "purchaseId",
                        foreignField: "_id",
                        as: "purchasesDetails"
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
                        staffName: {
                            $ifNull: [{
                                    $arrayElemAt: [
                                        "$staffDetails.name",
                                        0
                                    ]
                                },
                                ""
                            ]
                        }
                    }
                },
                {
                    $project: {
                        staffDetails: 0,
                        tankDetails: 0,
                        purchasesDetails: 0
                    }
                }
            ])
            .toArray();

        // Combine admin and staff records
        const allLogfeedings = [
            ...logfeedings,
            ...staffLogfeedings
        ].sort(
            (a, b) =>
            new Date(b.logCreatedDate) -
            new Date(a.logCreatedDate)
        );

        console.log("📊 Total Logfeeding Records:", allLogfeedings.length);

        return res.status(200).json({
            success: true,
            message: allLogfeedings.length > 0 ?
                "Fetched successfully" : "No data found",
            count: allLogfeedings.length,
            data: allLogfeedings
        });

    } catch (err) {
        console.log("❌ Get All Logfeeding Error:", err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const getLogfeedingById = async function(req, res) {
    try {


        const logfeedingObj = await Logfeeding.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.logfeedingId)
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
                    from: "purchases",
                    localField: "purchaseId",
                    foreignField: "_id",
                    as: "purchasesDetails"
                }
            },

            {
                $addFields: {
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    feedName: {
                        $arrayElemAt: ["$purchasesDetails.feedName", 0]
                    }
                }
            },

            {
                $project: {
                    tankDetails: 0,
                    purchasesDetails: 0
                }
            }

        ]);

        if (logfeedingObj.length > 0) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: logfeedingObj[0],
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Log feeding not found",
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

export const deleteLogfeeding = async function(req, res) {
    try {


        const logfeedingObj = await Logfeeding.findById(req.params.id);

        if (!logfeedingObj) {
            return res.status(400).json({
                success: false,
                message: "Log feeding not found",
            });
        }

        const deleteLogfeeding = await Logfeeding.findByIdAndDelete(
            req.params.id
        );

        if (deleteLogfeeding) {
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