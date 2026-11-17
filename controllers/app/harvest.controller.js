import mongoose from "mongoose";
import { DateTime } from "luxon";
import Harvest from "../../models/harvest.js";
import Tank from "../../models/tanks.js";
import UserFarms from "../../models/userFarms.js"

// =====================================================
// ADD HARVEST
// =====================================================

export const addHarvest = async(req, res) => {
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

        // ==========================================
        const farm = await UserFarms.findOne({
            _id: req.body.farmId,

        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found",
            });
        }
        const harvestObj = new Harvest({
            userId: req.userId,
            tankId: req.body.tankId,
            date: req.body.date,
            harvestType: req.body.harvestType,
            quantityHarvested: req.body.quantityHarvested,
            averageSizeAtHarvest: req.body.averageSizeAtHarvest,
            totalAmount: req.body.totalAmount,
            marketName: req.body.marketName,
            notes: req.body.notes,
            status: req.body.status || "active",
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate
        });

        const saveHarvest = await harvestObj.save();

        return res.status(200).json({
            success: true,
            message: "Harvest added successfully",
            harvest: saveHarvest
        });

    } catch (error) {
        console.log("Add Harvest Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};

// =====================================================
// GET ALL HARVESTS
// =====================================================
export const getAllHarvests = async(req, res) => {
    try {

        const { tankId, farmId } = req.body || {};

        const matchCondition = {
            userId: new mongoose.Types.ObjectId(req.userId)
        };

        // Filter by tankId
        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        // Filter by farmId
        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }
        const harvests = await Harvest.aggregate([



            // {
            //     $match: {
            //         userId: new mongoose.Types.ObjectId(req.userId)
            //     }
            // },
            {
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
                $addFields: {
                    tankName: {
                        $ifNull: [{
                                $arrayElemAt: [
                                    "$tankDetails.name",
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
            message: "Harvests fetched successfully",
            count: harvests.length,
            harvests
        });

    } catch (error) {
        console.log("Get All Harvests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};


// =====================================================
// GET HARVEST BY ID
// =====================================================

export const getHarvestById = async(req, res) => {
    try {
        const { harvestId } = req.body;


        if (!harvestId) {
            return res.status(400).json({
                success: false,
                message: "Please provide harvestId"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(harvestId)) {
            return res.status(200).json({
                success: true,
                harvest: {}
            });
        }

        const harvests = await Harvest.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(harvestId),
                    status: "active"
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
                        $ifNull: [{
                                $arrayElemAt: [
                                    "$tankDetails.name",
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
                    tankDetails: 0
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            harvest: harvests.length > 0 ? harvests[0] : {}
        });

    } catch (error) {
        console.error("Get Harvest By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};


// =====================================================
// UPDATE HARVEST
// =====================================================

export const updateHarvest = async(req, res) => {
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

        const updateHarvest = await Harvest.findByIdAndUpdate(
            req.params.id, {
                $set: {
                    tankId: req.body.tankId,
                    date: req.body.date,
                    harvestType: req.body.harvestType,
                    quantityHarvested: req.body.quantityHarvested,
                    averageSizeAtHarvest: req.body.averageSizeAtHarvest,
                    totalAmount: req.body.totalAmount,
                    marketName: req.body.marketName,
                    notes: req.body.notes,
                    status: req.body.status,
                    logModifiedDate: logDate
                }
            }, {
                new: true,
                runValidators: true
            }
        );

        if (!updateHarvest) {
            return res.status(200).json({
                success: true,
                message: "Harvest not found",
                harvest: {}
            });
        }

        return res.status(200).json({
            success: true,
            message: "Harvest updated successfully",
            harvest: updateHarvest
        });

    } catch (error) {
        console.log("Update Harvest Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


// =====================================================
// DELETE HARVEST (SOFT DELETE)
// =====================================================

export const deleteHarvest = async function(req, res) {
    try {
        const harvestObj = await Harvest.findById(req.params.id);

        if (!harvestObj) {
            return res.status(400).json({
                success: false,
                message: "Harvest not found",
            });
        }

        const deleteHarvest = await Harvest.findByIdAndDelete(
            req.params.id
        );

        if (deleteHarvest) {
            return res.status(200).json({
                success: true,
                message: "Deleted successfully",
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


// =====================================================
// GET HARVESTS BY TANK ID
// =====================================================

export const getHarvestsByTankId = async(req, res) => {
    try {
        const { tankId } = req.body;


        if (!tankId) {
            return res.status(400).json({
                success: false,
                message: "Please provide tankId"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        const harvests = await Harvest.find({
            tankId,

        })

        return res.status(200).json({
            success: true,
            message: "Harvests fetched successfully",
            count: harvests.length,
            harvests
        });

    } catch (error) {
        console.error("Get Harvests By Tank ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};