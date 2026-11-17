import { DateTime } from "luxon";
import Tank from "../../models/tanks.js";
import Harvest from "../../models/harvest.js"
import Purchases from "../../models/purchase.js"
import mongoose from "mongoose";
import UserFarms from "../../models/userFarms.js";
import Staff from "../../models/appStaff.js"


//add tanks
// export const addTank = async(req, res) => {
//     try {
//         console.log("📥 Add Tank Request:", req.body);


//         const userId = req.userId;

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized user"
//             });
//         }



//         const {
//             name,
//             tankType,
//             pondSize,
//             address,
//             location,
//             staffId,
//             farmId
//         } = req.body;

//         if (!name) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide tank name"
//             });
//         }

//         let parsedLocation = location;

//         if (typeof location === "string") {
//             try {
//                 parsedLocation = JSON.parse(location);
//             } catch (error) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid location format"
//                 });
//             }
//         }

//         if (!parsedLocation ||
//             !parsedLocation.type ||
//             parsedLocation.type !== "Polygon" ||
//             !parsedLocation.coordinates
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide a valid Polygon location"
//             });
//         }

//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");

//         const logDate = istDateTime.toISO({
//             includeOffset: true
//         });

//         if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
//             return res.status(400).json({ success: false, message: "Valid farmId is required" });
//         }
//         const farm = await UserFarms.findOne({ _id: farmId, userId: userId });
//         if (!farm) { return res.status(404).json({ success: false, message: "Farm not found" }); }


//         const existingTank = await Tank.findOne({
//             userId: userId,
//             name: {
//                 $regex: new RegExp(
//                     "^" + name.trim() + "$",
//                     "i"
//                 )
//             }
//         });

//         if (existingTank) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Tank with this name already exists"
//             });
//         }

//         // Convert staffId into an array of ObjectIds
//         let parsedStaffIds = [];

//         if (staffId) {
//             parsedStaffIds = Array.isArray(staffId) ?
//                 staffId : [staffId];

//             const invalidStaffIds = parsedStaffIds.some(
//                 id => !mongoose.Types.ObjectId.isValid(id)
//             );

//             if (invalidStaffIds) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid staffId provided"
//                 });
//             }

//             parsedStaffIds = parsedStaffIds.map(
//                 id => new mongoose.Types.ObjectId(id)
//             );
//         }
//         const tank = new Tank({
//             userId: userId,
//             name: name.trim(),
//             tankType: tankType,
//             pondSize: pondSize,
//             address: address,
//             location: parsedLocation,
//             status: "active",
//             // staffId: staffId,
//             staffId: parsedStaffIds,
//             farmId: farmId,
//             logCreatedDate: logDate,
//             logModifiedDate: logDate
//         });

//         const savedTank = await tank.save();

//         return res.status(201).json({
//             success: true,
//             message: "Tank added successfully",
//             tank: savedTank
//         });

//     } catch (error) {
//         console.log("❌ Add Tank Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }


// };


export const addTank = async(req, res) => {
    try {
        console.log("📥 Add Tank Request:", req.body);

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        const {
            name,
            tankType,
            pondSize,
            address,
            location,
            staffId,
            farmId
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide tank name"
            });
        }

        let parsedLocation = location;

        if (typeof location === "string") {
            try {
                parsedLocation = JSON.parse(location);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location format"
                });
            }
        }

        if (!parsedLocation ||
            !parsedLocation.type ||
            parsedLocation.type !== "Polygon" ||
            !parsedLocation.coordinates
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid Polygon location"
            });
        }

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required"
            });
        }

        const farm = await UserFarms.findOne({
            _id: farmId,
            userId: userId
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: "Farm not found"
            });
        }

        const existingTank = await Tank.findOne({
            userId: userId,
            name: {
                $regex: new RegExp(
                    "^" + name.trim() + "$",
                    "i"
                )
            }
        });

        if (existingTank) {
            return res.status(400).json({
                success: false,
                message: "Tank with this name already exists"
            });
        }

        // Convert staffId into an array of ObjectIds
        let parsedStaffIds = [];

        if (staffId) {
            parsedStaffIds = Array.isArray(staffId) ?
                staffId : [staffId];

            const invalidStaffIds = parsedStaffIds.some(
                id => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidStaffIds) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid staffId provided"
                });
            }

            parsedStaffIds = parsedStaffIds.map(
                id => new mongoose.Types.ObjectId(id)
            );
        }

        const tank = new Tank({
            userId: userId,
            name: name.trim(),
            tankType: tankType,
            pondSize: pondSize,
            address: address,
            location: parsedLocation,
            status: "active",
            staffId: parsedStaffIds,
            farmId: farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate
        });

        const savedTank = await tank.save();

        // ==========================================
        // UPDATE TANK ID IN APP STAFF COLLECTION
        // ==========================================

        if (parsedStaffIds.length > 0) {

            await Staff.updateMany({
                _id: {
                    $in: parsedStaffIds
                },
                userId: new mongoose.Types.ObjectId(userId)
            }, {
                $addToSet: {
                    tankId: savedTank._id
                },
                $set: {
                    logModifiedDate: logDate
                }
            });

            console.log(
                "✅ Tank ID assigned to staff:",
                parsedStaffIds
            );
        }

        return res.status(201).json({
            success: true,
            message: "Tank added successfully",
            tank: savedTank
        });

    } catch (error) {
        console.log("❌ Add Tank Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


// GET ALL TANKS
export const getAllTanks = async(req, res) => {
    try {
        console.log("📥 Get All Tanks Request:", req.body);

        const userId = new mongoose.Types.ObjectId(req.userId);
        const { farmId } = req.body;

        // ================= VALIDATE FARM ID =================

        if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Valid farmId is required",
                tanks: []
            });
        }

        const farmObjectId = new mongoose.Types.ObjectId(farmId);

        // ================= GET TANKS WITH STAFF NAMES =================

        const tanks = await Tank.aggregate([{
                $match: {
                    userId: userId,
                    farmId: farmObjectId
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            },
            {
                $lookup: {
                    from: "app_staffs",
                    let: {
                        staffIds: { $ifNull: ["$staffId", []] }
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$staffIds"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                staffName: "$name"
                            }
                        }
                    ],
                    as: "staffDetails"
                }
            },
            {
                $addFields: {
                    staffName: {
                        $map: {
                            input: "$staffDetails",
                            as: "staff",
                            in: "$$staff.staffName"
                        }
                    }
                }
            },
            {
                $project: {
                    staffDetails: 0
                }
            }
        ]);

        const tanksWithSummary = await Promise.all(
            tanks.map(async(tank) => {
                const tankId = tank._id;

                // ================= HARVEST SUMMARY =================

                const harvestSummary = await Harvest.aggregate([{
                        $match: {
                            tankId: tankId,
                            userId: userId,
                            farmId: farmObjectId
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

                const harvestData = harvestSummary.length > 0 ?
                    harvestSummary[0] : {
                        totalRecords: 0,
                        totalQuantityHarvested: 0,
                        totalAmount: 0
                    };

                // ================= PURCHASE SUMMARY =================

                const purchaseSummary = await Purchases.aggregate([{
                        $match: {
                            tankId: tankId,
                            userId: userId,
                            farmId: farmObjectId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalPurchaseRecords: { $sum: 1 },
                            totalQuantityPurchased: {
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
                    },
                    {
                        $project: {
                            _id: 0,
                            totalPurchaseRecords: 1,
                            totalQuantityPurchased: 1,
                            totalPurchaseAmount: 1
                        }
                    }
                ]);

                const purchaseData = purchaseSummary.length > 0 ?
                    purchaseSummary[0] : {
                        totalPurchaseRecords: 0,
                        totalQuantityPurchased: 0,
                        totalPurchaseAmount: 0
                    };

                return {
                    ...tank,
                    harvestSummary: harvestData,
                    purchaseSummary: purchaseData
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "Tanks retrieved successfully",
            farmId: farmId,
            count: tanksWithSummary.length,
            tanks: tanksWithSummary
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



// UPDATE TANK
export const updateTank = async(req, res) => {
    try {
        console.log("📥 Update Tank Request:", req.body);
        console.log("📌 Tank ID:", req.params.id);

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        const tankId = req.params.id;

        if (!tankId) {
            return res.status(400).json({
                success: false,
                message: "Please provide tank id"
            });
        }

        const {
            name,
            tankType,
            pondSize,
            address,
            location,
            status,
            staffId,
        } = req.body;

        const tank = await Tank.findOne({
            _id: tankId,
            userId: userId
        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found",
                tank: {}
            });
        }

        // ====================================================
        // NAME
        // ====================================================
        if (name !== undefined) {

            const duplicateTank = await Tank.findOne({
                userId: userId,
                name: {
                    $regex: new RegExp(
                        "^" + name.trim() + "$",
                        "i"
                    )
                },
                _id: {
                    $ne: tankId
                }
            });

            if (duplicateTank) {
                return res.status(400).json({
                    success: false,
                    message: "Tank with this name already exists"
                });
            }

            tank.name = name.trim();
        }

        // ====================================================
        // TANK TYPE
        // ====================================================
        if (tankType !== undefined) {

            if (!["fish", "prawn"].includes(tankType)) {
                return res.status(400).json({
                    success: false,
                    message: "tankType must be fish or prawn"
                });
            }

            tank.tankType = tankType;
        }

        // ====================================================
        // POND SIZE
        // ====================================================
        if (pondSize !== undefined) {
            tank.pondSize = pondSize;
        }

        // ====================================================
        // ADDRESS
        // ====================================================
        if (address !== undefined) {
            tank.address = address;
        }
        // ====================================================
        // STAFF ID
        // ====================================================
        // if (staffId !== undefined) {
        //     tank.staffId = staffId;
        // }

        // ====================================================
        // STAFF ID - ARRAY OF OBJECTIDS
        // ====================================================
        if (staffId !== undefined) {

            let parsedStaffIds = Array.isArray(staffId) ?
                staffId : [staffId];

            // Allow an empty array to remove all staff assignments
            if (parsedStaffIds.length === 1 && parsedStaffIds[0] === "") {
                parsedStaffIds = [];
            }

            const invalidStaffIds = parsedStaffIds.some(
                id => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidStaffIds) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid staffId provided"
                });
            }

            tank.staffId = parsedStaffIds.map(
                id => new mongoose.Types.ObjectId(id)
            );
        }

        // ====================================================
        // LOCATION
        // ====================================================
        if (location !== undefined) {

            let parsedLocation = location;

            if (typeof location === "string") {
                try {
                    parsedLocation = JSON.parse(location);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid location format"
                    });
                }
            }

            if (!parsedLocation ||
                parsedLocation.type !== "Polygon" ||
                !parsedLocation.coordinates
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid Polygon location"
                });
            }

            tank.location = parsedLocation;
        }

        // ====================================================
        // STATUS
        // ====================================================
        if (status !== undefined) {

            if (!["active", "inactive", "harvest"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be active or inactive"
                });
            }

            tank.status = status;
        }

        // ====================================================
        // MODIFIED DATE
        // ====================================================
        const istDateTime = DateTime.now().setZone(
            "Asia/Kolkata"
        );

        tank.logModifiedDate = istDateTime.toISO({
            includeOffset: true
        });

        const updatedTank = await tank.save();

        return res.status(200).json({
            success: true,
            message: "Tank updated successfully",
            tank: updatedTank
        });

    } catch (error) {
        console.log("❌ Update Tank Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


// DELETE TANK
export const deleteTank = async(req, res) => {
    try {
        console.log("📥 Delete Tank Request");
        console.log("📌 Tank ID:", req.params.id);

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        const tankId = req.params.id;

        if (!tankId) {
            return res.status(400).json({
                success: false,
                message: "Please provide tank id"
            });
        }

        const tank = await Tank.findOne({
            _id: tankId,
            userId: userId
        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Tank not found"
            });
        }

        await Tank.deleteOne({
            _id: tankId,
            userId: userId
        });

        return res.status(200).json({
            success: true,
            message: "Tank deleted successfully"
        });

    } catch (error) {
        console.log("❌ Delete Tank Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};


//get tank by id
export const getTankById = async(req, res) => {
    try {
        console.log("📥 Get All Tanks Request:", req.body);


        const userId = new mongoose.Types.ObjectId(req.userId);
        const { tankId } = req.body;

        const tankCondition = {
            userId: userId
        };

        if (tankId) {
            tankCondition._id = new mongoose.Types.ObjectId(tankId);
        }

        const tanks = await Tank.find(tankCondition).sort({

        });

        const tanksWithSummary = await Promise.all(
            tanks.map(async(tank) => {
                const tankId = tank._id;

                // ================= HARVEST SUMMARY =================

                const harvestSummary = await Harvest.aggregate([{
                        $match: {
                            tankId: new mongoose.Types.ObjectId(tankId),
                            userId: userId
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

                const harvestData = harvestSummary.length > 0 ?
                    harvestSummary[0] : {
                        totalRecords: 0,
                        totalQuantityHarvested: 0,
                        totalAmount: 0
                    };

                // ================= PURCHASE SUMMARY =================

                const purchaseSummary = await Purchases.aggregate([{
                        $match: {
                            tankId: new mongoose.Types.ObjectId(tankId),
                            userId: userId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalPurchaseRecords: { $sum: 1 },
                            totalQuantityPurchased: {
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
                    },
                    {
                        $project: {
                            _id: 0,
                            totalPurchaseRecords: 1,
                            totalQuantityPurchased: 1,
                            totalPurchaseAmount: 1
                        }
                    }
                ]);

                const purchaseData = purchaseSummary.length > 0 ?
                    purchaseSummary[0] : {
                        totalPurchaseRecords: 0,
                        totalQuantityPurchased: 0,
                        totalPurchaseAmount: 0
                    };

                return {
                    ...tank.toObject(),
                    harvestSummary: harvestData,
                    purchaseSummary: purchaseData
                };
            })
        );

        // Return a single object when tankId is provided
        if (tankId) {
            return res.status(200).json({
                success: true,
                message: tanksWithSummary.length > 0 ?
                    "Tank retrieved successfully" : "Tank not found",
                tank: tanksWithSummary.length > 0 ?
                    tanksWithSummary[0] : {}
            });
        }

        // Return all tanks when tankId is not provided
        return res.status(200).json({
            success: true,
            message: "Tanks retrieved successfully",
            tanks: tanksWithSummary
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

//get all user tanks
export const getalluserTanks = async function(req, res) {
    try {
        const tanks = await Tank.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId)
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
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
                        $map: {
                            input: "$staffDetails",
                            as: "staff",
                            in: "$$staff.name"
                        }
                    }
                }
            },
            {
                $project: {
                    staffDetails: 0
                }
            }
        ]);

        if (tanks) {
            return res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: tanks.length,
                data: tanks,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "No data found",
                data: [],
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