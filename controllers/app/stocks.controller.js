// import models
import Stock from "../../models/stocks.js";
import Tank from "../../models/tanks.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import Species from "../../models/species.js"
import UserFarms from "../../models/userFarms.js"

export const addStock = async function(req, res) {
    try {

        console.log(req.body)

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const tank = await Tank.findOne({ _id: req.body.tankId }, );

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "tank not found",
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

        const stockObj = new Stock({
            tankId: req.body.tankId,
            userId: req.userId,
            date: req.body.date,
            time: time,
            speciesName: req.body.speciesName,
            cropName: req.body.cropName,
            quantityStocked: req.body.quantityStocked,
            averageWeightAtStocking: req.body.averageWeightAtStocking,
            stockingCostPerUnit: req.body.stockingCostPerUnit,
            supplier: req.body.supplier,
            notes: req.body.notes,
            status: req.body.status,
            totalAmount: req.body.totalAmount,
            farmId: req.body.farmId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveStock = await stockObj.save();


        if (saveStock) {
            const speciesObj = new Species({
                userId: req.userId,
                speciesName: req.body.speciesName,
                tankId: req.body.tankId,
                farmId: req.body.farmId,
                logCreatedDate: logDate,

                logModifiedDate: logDate,
            });
            await speciesObj.save();
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

//edit stock
export const updateStock = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });


        const stockObj = await Stock.findById(req.params.id);

        if (!stockObj) {
            return res.status(400).json({
                success: false,
                message: "Stock not found",
            });
        }

        const tank = await Tank.findOne({ _id: req.body.tankId }, );

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "tank not found",
            });
        }


        stockObj.tankId = req.body.tankId;
        stockObj.userId = req.body.userId;
        stockObj.date = req.body.date;
        stockObj.speciesName = req.body.speciesName;
        stockObj.cropName = req.body.cropName;
        stockObj.quantityStocked = req.body.quantityStocked;
        stockObj.averageWeightAtStocking = req.body.averageWeightAtStocking;
        stockObj.stockingCostPerUnit = req.body.stockingCostPerUnit;
        stockObj.supplier = req.body.supplier;
        stockObj.notes = req.body.notes;
        stockObj.status = req.body.status;
        stockObj.totalAmount = req.body.totalAmount;

        stockObj.logModifiedDate = logDate;


        const saveStock = await stockObj.save();

        if (saveStock) {
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


// export const getAllStock = async function(req, res) {
//     try {

//         const stocks = await Stock.find()
//             .sort({ logCreatedDate: -1 });

//         if (stocks) {
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched successfully",
//                 count: stocks.length,
//                 data: stocks,
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

export const getAllStock = async function(req, res) {
    try {
        console.log(req.body);

        const { tankId, farmId } = req.body || {};

        const matchCondition = {
            userId: new mongoose.Types.ObjectId(req.userId)
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        const stocks = await Stock.aggregate([{
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
                $unwind: {
                    path: "$tankDetails",
                    preserveNullAndEmptyArrays: true
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
                $unwind: {
                    path: "$farmDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    tankName: "$tankDetails.name",
                    farmName: "$farmDetails.farmName"
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    farmDetails: 0
                }
            },
            // {
            //     $sort: {
            //         logCreatedDate: -1
            //     }
            // }
        ]);

        if (stocks) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: stocks.length,
                data: stocks,
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



export const getStockById = async function(req, res) {
    try {


        const stock = await Stock.findById(req.body.id);

        if (stock) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: stock,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Stock not found",
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


export const deleteStock = async function(req, res) {
    try {


        const stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(400).json({
                success: false,
                message: "Stock not found",
            });
        }

        const deleteStock = await Stock.findByIdAndDelete(req.params.id);

        if (deleteStock) {
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


export const getAllStocksByTankId = async function(req, res) {
    try {


        const stocks = await Stock.find({
            tankId: req.body.tankId
        }).sort({
            logCreatedDate: -1
        });

        if (stocks) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: stocks.length,
                data: stocks,
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





// export const getAllSpecies = async function(req, res) {
//     try {
//         console.log(req.body)
//         const { tankId, farmId } = req.body;

//         const matchCondition = { userId: new mongoose.Types.ObjectId(req.userId) };

//         if (tankId) {
//             matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
//         }

//         if (farmId) {
//             matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
//         }

//         const species = await Species.aggregate([{
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
//                 $unwind: {
//                     path: "$tankDetails",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "user_farms",
//                     localField: "farmId",
//                     foreignField: "_id",
//                     as: "farmDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$farmDetails",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $addFields: {
//                     tankName: "$tankDetails.name",
//                     farmName: "$farmDetails.farmName"
//                 }
//             },
//             {
//                 $project: {
//                     tankDetails: 0,
//                     farmDetails: 0
//                 }
//             },
//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }
//         ]);

//         if (species) {
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched successfully",
//                 count: species.length,
//                 data: species,
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


export const getAllSpecies = async function(req, res) {
    try {
        console.log(req.body);

        const { tankId, farmId } = req.body || {};

        const matchCondition = {
            userId: new mongoose.Types.ObjectId(req.userId)
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (farmId) {
            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        const species = await Species.aggregate([{
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
                $unwind: {
                    path: "$tankDetails",
                    preserveNullAndEmptyArrays: true
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
                $unwind: {
                    path: "$farmDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    tankName: "$tankDetails.name",
                    farmName: "$farmDetails.farmName"
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    farmDetails: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            },
            {
                $setWindowFields: {
                    sortBy: {
                        logCreatedDate: -1
                    },
                    output: {
                        rowNumber: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            {
                $addFields: {
                    isCurrent: {
                        $eq: ["$rowNumber", 1]
                    }
                }
            },
            {
                $project: {
                    rowNumber: 0
                }
            }
        ]);

        if (species) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: species.length,
                data: species
            });
        } else {
            res.status(400).json({
                success: false,
                message: "No data found",
                data: []
            });
        }

    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};