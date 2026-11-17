import PartyPayment from "../../models/party_payments.js";
import { DateTime } from "luxon";
import Party from "../../models/parties.js";
import mongoose from "mongoose";

// export const addPartyPayment = async(req, res) => {
//     try {
//         console.log("Add Party Payment Request:", req.body);


//         const userId = req.userId;
//         // ==========================================
//         const party = await Party.findOne({
//             _id: req.body.partyId,

//         });

//         if (!party) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Party not found",
//             });
//         }
//         const {
//             partyId,
//             date,
//             amount,
//             notes,
//             paymentMethod
//         } = req.body;

//         const logDate = DateTime.now()
//             .setZone("Asia/Kolkata")
//             .toFormat("yyyy-LL-dd HH:mm:ss");

//         const paymentObj = new PartyPayment({
//             userId: userId,
//             partyId: partyId,
//             date: date || "",
//             amount: amount || "0",
//             notes: notes || "",
//             paymentMethod: paymentMethod || "cheque",
//             paymentType: req.body.paymentType,
//             logCreatedDate: logDate,
//             logModifiedDate: logDate
//         });

//         const savedPayment = await paymentObj.save();

//         return res.status(201).json({
//             success: true,
//             message: "Party payment added successfully",
//             data: savedPayment
//         });

//     } catch (error) {
//         console.log("Add Party Payment Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to add party payment",
//             error: error.message
//         });
//     }


// };



export const addPartyPayment = async(req, res) => {
    try {
        console.log("========== ADD PARTY PAYMENT ==========");
        console.log("Request Method:", req.method);
        console.log("Request URL:", req.originalUrl);
        console.log("Content Type:", req.headers["content-type"]);
        console.log("Request Body:", req.body);
        console.log("User ID:", req.userId);

        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing. Please send JSON data."
            });
        }

        const userId = req.userId;

        const {
            partyId,
            date,
            amount,
            notes,
            paymentMethod,
            paymentType
        } = req.body;

        // Validate partyId
        if (!partyId || !mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({
                success: false,
                message: "Valid partyId is required"
            });
        }

        // Check Party
        const party = await Party.findOne({
            _id: partyId
        });

        if (!party) {
            return res.status(404).json({
                success: false,
                message: "Party not found"
            });
        }

        const logDate = DateTime.now()
            .setZone("Asia/Kolkata")
            .toFormat("yyyy-LL-dd HH:mm:ss");

        const paymentObj = new PartyPayment({
            userId: userId,
            partyId: partyId,
            date: date,
            amount: amount,
            notes: notes,
            paymentMethod: paymentMethod,
            paymentType: paymentType,
            logCreatedDate: logDate,
            logModifiedDate: logDate
        });

        const savedPayment = await paymentObj.save();

        return res.status(201).json({
            success: true,
            message: "Party payment added successfully",
            data: savedPayment
        });

    } catch (error) {
        console.log("Add Party Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add party payment",
            error: error.message
        });
    }
};
export const getAllPartyPayments = async(req, res) => {
    try {
        console.log("Get All Party Payments Request:", req.body);


        const userId = req.userId;

        const payments = await PartyPayment.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
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
            message: "Party payments retrieved successfully",
            data: payments
        });

    } catch (error) {
        console.log("Get All Party Payments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve party payments",
            data: []
        });
    }


};



export const updatePartyPayment = async(req, res) => {
    try {
        console.log("Update Party Payment Request:", req.body);


        const userId = req.userId;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid payment ID is required"
            });
        }
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

        const {
            partyId,
            date,
            amount,
            notes,
            paymentMethod,
            paymentType
        } = req.body;

        const logDate = DateTime.now()
            .setZone("Asia/Kolkata")
            .toFormat("yyyy-LL-dd HH:mm:ss");

        const updateData = {
            ...(partyId !== undefined && { partyId }),
            ...(date !== undefined && { date }),
            ...(amount !== undefined && { amount }),
            ...(notes !== undefined && { notes }),
            ...(paymentMethod !== undefined && { paymentMethod }),
            ...(paymentType !== undefined && { paymentType }),
            logModifiedDate: logDate
        };

        const payment = await PartyPayment.findOneAndUpdate({
            _id: id,
            userId: userId
        }, { $set: updateData }, { new: true, runValidators: true });

        if (!payment) {
            return res.status(200).json({
                success: true,
                message: "Party payment not found",
                data: {}
            });
        }

        return res.status(200).json({
            success: true,
            message: "Party payment updated successfully",
            data: payment
        });

    } catch (error) {
        console.log("Update Party Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update party payment",
            error: error.message
        });
    }


};


export const deletePartyPayment = async(req, res) => {
    try {
        console.log("Delete Party Payment Request:", req.params);


        const userId = req.userId;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid payment ID is required"
            });
        }

        const payment = await PartyPayment.findOneAndDelete({
            _id: id,
            userId: userId
        });

        if (!payment) {
            return res.status(200).json({
                success: true,
                message: "Party payment not found",
                data: {}
            });
        }

        return res.status(200).json({
            success: true,
            message: "Party payment deleted successfully",
            data: payment
        });

    } catch (error) {
        console.log("Delete Party Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete party payment",
            error: error.message
        });
    }


};



export const getPartyPaymentsByPartyId = async(req, res) => {
    try {
        console.log("Get Party Payments By PartyId Request:", req.body);


        const userId = req.userId;
        const { partyId } = req.body;

        if (!partyId || !mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({
                success: false,
                message: "Valid partyId is required",
                data: []
            });
        }

        const payments = await PartyPayment.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    partyId: new mongoose.Types.ObjectId(partyId)
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
                    partyName: {
                        $ifNull: [
                            { $arrayElemAt: ["$partyDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
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
            message: "Party payments retrieved successfully",
            data: payments
        });

    } catch (error) {
        console.log("Get Party Payments By PartyId Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve party payments",
            data: []
        });
    }


};