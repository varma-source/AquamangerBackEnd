import { DateTime } from "luxon";
import Tank from "../../models/tanks.js";
import Party from "../../models/parties.js";
import Purchase from "../../models/purchase.js";
import mongoose from "mongoose"
import UserFarms from "../../models/userFarms.js"
import PurchaseParty from "../../models/purchaseParties.js"

// export const addPurchase = async function(req, res) {
//     try {

//         console.log(req.body)

//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//         const logDate = istDateTime.toISO({ includeOffset: true });

//         // CHECK TANK
//         // ==========================================
//         const tank = await Tank.findOne({
//             _id: req.body.tankId,

//         });

//         if (!tank) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Tank not found",
//             });
//         }

//         // CHECK PARTY
//         // ==========================================
//         const party = await Party.findOne({
//             _id: req.body.partyId,

//         });

//         // if (!party) {
//         //     return res.status(404).json({
//         //         success: false,
//         //         message: "Party not found",
//         //     });
//         // }
//         const farm = await UserFarms.findOne({
//             _id: req.body.farmId,

//         });

//         if (!farm) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Farm not found",
//             });
//         }


//         const purchaseObj = new Purchase({
//             tankId: req.body.tankId,
//             userId: req.userId,
//             partyId: req.body.partyId,
//             date: req.body.date,
//             feedName: req.body.feedName,
//             brand: req.body.brand,
//             quantityPurchased: req.body.quantityPurchased,
//             pricePerKg: req.body.pricePerKg,
//             supplierName: req.body.supplierName,
//             invoiceReference: req.body.invoiceReference,
//             paymentMethod: req.body.paymentMethod,
//             status: req.body.status,
//             totalAmount: req.body.totalAmount,
//             farmId: req.body.farmId,
//             logCreatedDate: logDate,
//             logModifiedDate: logDate,
//         });

//         const savePurchase = await purchaseObj.save();

//         if (savePurchase) {
//             res.status(200).json({
//                 success: true,
//                 message: "Added successfully",
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: "Please try again",
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


export const addPurchase = async function(req, res) {
    try {

        console.log(req.body);

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

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

        // CHECK PARTY
        const party = await Party.findOne({
            _id: req.body.partyId,
        });

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

        // SAVE PURCHASE
        const purchaseObj = new Purchase({
            tankId: req.body.tankId,
            userId: req.userId,
            partyId: req.body.partyId,
            date: req.body.date,
            feedName: req.body.feedName,
            brand: req.body.brand,
            quantityPurchased: req.body.quantityPurchased,
            pricePerKg: req.body.pricePerKg,
            supplierName: req.body.supplierName,
            invoiceReference: req.body.invoiceReference,
            paymentMethod: req.body.paymentMethod,
            status: req.body.status,
            totalAmount: req.body.totalAmount,
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const savePurchase = await purchaseObj.save();

        if (savePurchase) {

            // SAVE PURCHASE PARTY RECORD ONLY IF partyId IS PROVIDED
            if (req.body.partyId) {
                const purchasePartyObj = new PurchaseParty({
                    date: req.body.date,
                    userId: req.userId,
                    purchaseId: savePurchase._id,
                    partyId: req.body.partyId,
                    quantityPurchased: String(req.body.quantityPurchased || 0),
                    totalAmount: String(req.body.totalAmount || 0),
                    status: "active",
                    logCreatedDate: logDate,
                    logModifiedDate: logDate,
                });

                await purchasePartyObj.save();
            }

            return res.status(200).json({
                success: true,
                message: "Added successfully",
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
export const getAllPurchase = async function(req, res) {
    try {

        console.log("📥 Get All Purchase Request:", req.body);

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

        const purchases = await Purchase.aggregate([

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

        if (purchases) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: purchases.length,
                data: purchases,
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


export const updatePurchase = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

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
        const party = await Party.findOne({
            _id: req.body.partyId,

        });

        if (!party) {
            return res.status(404).json({
                success: false,
                message: "Party not found",
            });
        }


        const purchaseObj = await Purchase.findById(req.params.id);

        if (!purchaseObj) {
            return res.status(400).json({
                success: false,
                message: "Purchase not found",
            });
        }

        purchaseObj.tankId = req.body.tankId;
        purchaseObj.userId = req.userId;
        purchaseObj.partyId = req.body.partyId;
        purchaseObj.date = req.body.date;
        purchaseObj.feedName = req.body.feedName;
        purchaseObj.brand = req.body.brand;
        purchaseObj.quantityPurchased = req.body.quantityPurchased;
        purchaseObj.pricePerKg = req.body.pricePerKg;
        purchaseObj.supplierName = req.body.supplierName;
        purchaseObj.invoiceReference = req.body.invoiceReference;
        purchaseObj.paymentMethod = req.body.paymentMethod;
        purchaseObj.status = req.body.status;
        purchaseObj.totalAmount = req.body.totalAmount;
        purchaseObj.logModifiedDate = logDate;

        const savePurchase = await purchaseObj.save();

        if (savePurchase) {
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


export const getPurchaseById = async function(req, res) {
    try {


        const purchaseObj = await Purchase.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.purchaseId)
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
            }
        ]);

        if (purchaseObj.length > 0) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: purchaseObj[0],
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Purchase not found",
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



export const deletePurchase = async function(req, res) {
    try {


        const purchaseObj = await Purchase.findById(req.params.id);

        if (!purchaseObj) {
            return res.status(400).json({
                success: false,
                message: "Purchase not found",
            });
        }

        const deletePurchase = await Purchase.findByIdAndDelete(req.params.id);

        if (deletePurchase) {
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


export const getAllPurchaseParty = async function(req, res) {
    try {
        console.log(req.userId);

        const purchasePartyData = await PurchaseParty.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                    // status: "active"
                }
            },
            {
                $lookup: {
                    from: "purchases",
                    localField: "purchaseId",
                    foreignField: "_id",
                    as: "purchaseData"
                }
            },
            {
                $unwind: {
                    path: "$purchaseData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    feedName: "$purchaseData.feedName",
                    partyName: "$partyData.name"
                }
            },
            {
                $project: {
                    purchaseData: 0,
                    partyData: 0
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
            message: "Purchase party records fetched successfully",
            data: purchasePartyData
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};