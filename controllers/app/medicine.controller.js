import Medicine from "../../models/medicines.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import Tank from "../../models/tanks.js";
import Party from "../../models/parties.js";
import UserFarms from "../../models/userFarms.js";
import MedicineParty from "../../models/medicineParties.js";

// export const addMedicine = async function(req, res) {
//     try {


//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//         const logDate = istDateTime.toISO({
//             includeOffset: true
//         });

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

//         const medicineObj = new Medicine({
//             partyId: req.body.partyId,
//             tankId: req.body.tankId,
//             userId: req.userId,
//             purchaseDate: req.body.purchaseDate,
//             medicineName: req.body.medicineName,
//             brand: req.body.brand,
//             quantityPurchased: req.body.quantityPurchased,
//             pricePerUnits: req.body.pricePerUnits,
//             totalAmount: req.body.totalAmount,
//             invoiceReference: req.body.invoiceReference,
//             paidBy: req.body.paidBy,
//             medicineType: req.body.medicineType,
//             status: req.body.status,
//             farmId: req.body.farmId,
//             logCreatedDate: logDate,
//             logModifiedDate: logDate,
//         });

//         const saveMedicine = await medicineObj.save();

//         if (saveMedicine) {
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



export const addMedicine = async function(req, res) {
    try {

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

        // SAVE MEDICINE
        const medicineObj = new Medicine({
            partyId: req.body.partyId,
            tankId: req.body.tankId,
            userId: req.userId,
            purchaseDate: req.body.purchaseDate,
            medicineName: req.body.medicineName,
            brand: req.body.brand,
            quantityPurchased: req.body.quantityPurchased,
            pricePerUnits: req.body.pricePerUnits,
            totalAmount: req.body.totalAmount,
            invoiceReference: req.body.invoiceReference,
            paidBy: req.body.paidBy,
            medicineType: req.body.medicineType,
            status: req.body.status,
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveMedicine = await medicineObj.save();

        if (saveMedicine) {

            // SAVE MEDICINE PARTY RECORD
            if (req.body.partyId) {
                const medicinePartyObj = new MedicineParty({
                    date: req.body.purchaseDate,
                    userId: req.userId,
                    medicineId: saveMedicine._id,
                    partyId: req.body.partyId,
                    amount: String(req.body.totalAmount || 0),
                    status: "active",
                    logCreatedDate: logDate,
                    logModifiedDate: logDate,
                });

                await medicinePartyObj.save();
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

export const updateMedicine = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const medicineObj = await Medicine.findById(req.params.id);

        if (!medicineObj) {
            return res.status(400).json({
                success: false,
                message: "Medicine not found",
            });
        }

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
        medicineObj.partyId = req.body.partyId;
        medicineObj.tankId = req.body.tankId;
        medicineObj.userId = req.userId;
        medicineObj.purchaseDate = req.body.purchaseDate;
        medicineObj.medicineName = req.body.medicineName;
        medicineObj.brand = req.body.brand;
        medicineObj.quantityPurchased = req.body.quantityPurchased;
        medicineObj.pricePerUnits = req.body.pricePerUnits;
        medicineObj.totalAmount = req.body.totalAmount;
        medicineObj.invoiceReference = req.body.invoiceReference;
        medicineObj.paidBy = req.body.paidBy;
        medicineObj.status = req.body.status;
        medicineObj.medicineType = req.body.medicineType;

        medicineObj.logModifiedDate = logDate;


        const updateMedicine = await medicineObj.save();

        if (updateMedicine) {
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

export const getAllMedicine = async function(req, res) {
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


        const medicines = await Medicine.aggregate([

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

        if (medicines) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: medicines.length,
                data: medicines,
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

export const getMedicineById = async function(req, res) {
    try {


        const medicineObj = await Medicine.aggregate([

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.medicineId)
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

        if (medicineObj.length > 0) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: medicineObj[0],
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Medicine not found",
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

export const deleteMedicine = async function(req, res) {
    try {


        const medicineObj = await Medicine.findById(req.params.id);

        if (!medicineObj) {
            return res.status(400).json({
                success: false,
                message: "Medicine not found",
            });
        }

        const deleteMedicine = await Medicine.findByIdAndDelete(
            req.params.id
        );

        if (deleteMedicine) {
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




export const getAllMedicineParties = async function(req, res) {
    try {
        const medicineParties = await MedicineParty.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId)
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
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            {
                $addFields: {
                    medicineName: {
                        $ifNull: [{
                                $arrayElemAt: [
                                    "$medicineDetails.medicineName",
                                    0
                                ]
                            },
                            ""
                        ]
                    },
                    partyName: {
                        $ifNull: [{
                                $arrayElemAt: [
                                    "$partyDetails.name",
                                    0
                                ]
                            },
                            ""
                        ]
                    },
                    partyPhone: {
                        $ifNull: [{
                                $arrayElemAt: [
                                    "$partyDetails.phone",
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
                    medicineDetails: 0,
                    partyDetails: 0
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
            count: medicineParties.length,
            data: medicineParties
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};