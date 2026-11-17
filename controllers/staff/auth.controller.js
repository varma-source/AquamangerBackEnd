// importing models
import Staff from "../../models/appStaff.js";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import otpModel from "../../models/otp.js"
import Medicine from "../../models/medicines.js"
import Species from "../../models/species.js"
import Purchase from "../../models/purchase.js"
import nodemailer from "nodemailer";
import dotenv from "dotenv";


//login
export const staffLogin = async(req, res) => {
    try {
        const { email, password } = req.body;

        // VALIDATE REQUIRED FIELDS
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // FIND STAFF BY EMAIL
        const staff = await Staff.findOne({
            email: email.trim().toLowerCase()
        });

        if (!staff) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // CHECK PASSWORD USING BCRYPT
        const isPasswordValid = await bcrypt.compare(
            password,
            staff.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // GENERATE JWT TOKEN
        const token = jwt.sign({
                userId: staff.userId,
                staffId: staff._id,
                phone: staff.phone,
                role: staff.role,
                farmId: staff.farmId,
                tankId: staff.tankId
            },
            process.env.ADMIN_SECRET_KEY, {
                expiresIn: process.env.ADMIN_EXPIRY_DATE
            }
        );

        // LOGIN SUCCESS
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            data: {
                _id: staff._id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                userId: staff.userId,
                staffId: staff._id,
                farmId: staff.farmId,
                tankId: staff.tankId
            }
        });

    } catch (error) {
        console.log("Staff Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to login",
            error: error.message
        });
    }
};



export const getstaffProfile = async function(req, res) {
    try {
        console.log(req.staffId);

        const userProfile = await Staff.findOne({
            _id: new mongoose.Types.ObjectId(req.staffId)
        });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }



        res.status(200).json({
            success: true,
            data: userProfile,
            data: {
                ...userProfile.toObject(),

            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const generateOtp = async function(req, res) {
    try {


        const { email } = req.body;

        // =====================================================
        // CHECK EMAIL
        // =====================================================

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email"
            });
        }

        const userEmail = email.trim().toLowerCase();

        // =====================================================
        // FIND USER
        // =====================================================

        const user = await Staff.findOne({
            email: userEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered with this email"
            });
        }

        // =====================================================
        // GENERATE DYNAMIC 4 DIGIT OTP
        // =====================================================

        const otp = Math.floor(
            1000 + Math.random() * 9000
        ).toString();

        console.log("Generated OTP:", otp);

        // =====================================================
        // SAVE OTP
        // =====================================================

        const otpObj = new otpModel({
            otp: otp,
            emailId: userEmail,
            userId: user._id,
            createdAt: DateTime.now()
                .setZone("Asia/Kolkata")
                .toISO()
        });

        await otpObj.save();

        // =====================================================
        // EMAIL TRANSPORTER
        // =====================================================

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // =====================================================
        // EMAIL
        // =====================================================

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Forgot Password OTP",
            text: "Hello " +
                (user.name || "User") +
                ",\n\n" +
                "Your OTP for password reset is: " +
                otp +
                "\n\n" +
                "This OTP is valid for password reset.\n\n" +
                "Thank you."
        };

        // =====================================================
        // SEND EMAIL
        // =====================================================

        await transporter.sendMail(mailOptions);

        console.log("OTP email sent successfully to:", userEmail);

        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({
            success: true,
            message: "OTP has been sent successfully to your email",
            userInfo: user._id,
            userEmail: user.email

        });

    } catch (error) {

        console.log("❌ Generate OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


export const verifyOtp = async(req, res) => {
    try {


        console.log("📥 Verify OTP Request:", req.body);

        const {
            email,
            otp
        } = req.body;

        // =====================================================
        // REQUIRED FIELDS
        // =====================================================

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and OTP"
            });
        }

        const userEmail = email.trim().toLowerCase();
        const enteredOtp = otp.toString().trim();

        // =====================================================
        // FIND USER BY EMAIL
        // =====================================================

        const user = await Staff.findOne({
            email: userEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered with this email"
            });
        }

        // =====================================================
        // FIND LATEST OTP
        // =====================================================

        const otpData = await otpModel.findOne({
            emailId: userEmail,
            userId: user._id
        }).sort({
            createdAt: -1
        });

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        // =====================================================
        // COMPARE OTP
        // =====================================================

        if (otpData.otp !== enteredOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // =====================================================
        // DELETE OTP AFTER SUCCESSFUL VERIFICATION
        // =====================================================

        await otpModel.findByIdAndDelete(otpData._id);

        console.log("✅ OTP verified and deleted:", otpData._id);

        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            userId: user._id
        });

    } catch (error) {

        console.log("❌ Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};
export const changePassword = async function(req, res) {
    try {
        console.log("📥 Change Password Request:", req.body);


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const {
            email,
            newPassword,
            confirmPassword
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email"
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide new password"
            });
        }

        if (!confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide confirm password"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password does not match"
            });
        }

        const userEmail = email.trim().toLowerCase();

        const user = await Staff.findOne({
            email: userEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const bcryptedPassword = await bcrypt.hash(
            confirmPassword,
            10
        );

        user.password = bcryptedPassword;
        user.logModifiedDate = logDate;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        console.log("❌ Change Password Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    }


};


//get home screen
// export const getStaffHomescreen = async(req, res) => {
//     try {
//         console.log("📥 Get Staff Homescreen Request:", req.staffId);

//         const staffId = req.staffId;

//         const staffs = await Staff.aggregate([{
//                 $match: {
//                     _id: new mongoose.Types.ObjectId(staffId)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "tanks",
//                     let: {
//                         assignedTankIds: "$tankId",
//                         staffUserId: "$userId"
//                     },
//                     pipeline: [{
//                             $match: {
//                                 $expr: {
//                                     $and: [{
//                                             $eq: ["$userId", "$$staffUserId"]
//                                         },
//                                         {
//                                             $cond: [{
//                                                     $gt: [{
//                                                             $size: {
//                                                                 $ifNull: ["$$assignedTankIds", []]
//                                                             }
//                                                         },
//                                                         0
//                                                     ]
//                                                 },
//                                                 {
//                                                     $in: ["$_id", "$$assignedTankIds"]
//                                                 },
//                                                 true
//                                             ]
//                                         }
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "user_farms",
//                                 localField: "farmId",
//                                 foreignField: "_id",
//                                 as: "farmDetails"
//                             }
//                         },
//                         {
//                             $unwind: {
//                                 path: "$farmDetails",
//                                 preserveNullAndEmptyArrays: true
//                             }
//                         },
//                         {
//                             $project: {
//                                 _id: 1,
//                                 tankId: "$_id",
//                                 farmId: 1,
//                                 tankName: "$name",
//                                 farmName: "$farmDetails.farmName",
//                                 tankType: 1,
//                                 pondSize: 1,
//                             }
//                         }
//                     ],
//                     as: "assignedTanks"
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     assignedTanks: 1
//                 }
//             }
//         ]);

//         if (!staffs.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Staff not found",
//                 data: []
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Data retrieved successfully",
//             data: staffs[0].assignedTanks
//         });

//     } catch (error) {
//         console.log("❌ Get Staff Homescreen Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             data: []
//         });
//     }
// };
//26-10-2026
export const getStaffHomescreen = async(req, res) => {
    try {
        console.log("📥 Get Staff Homescreen Request:", req.staffId);

        const staffId = req.staffId;

        const staffs = await Staff.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(staffId)
                }
            },
            {
                $lookup: {
                    from: "tanks",
                    let: {
                        assignedTankIds: "$tankId",
                        staffUserId: "$userId"
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$userId", "$$staffUserId"]
                                        },
                                        {
                                            $in: ["$_id", "$$assignedTankIds"]
                                        }
                                    ]
                                }
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
                            $project: {
                                _id: 1,
                                tankId: "$_id",
                                farmId: 1,
                                tankName: "$name",
                                farmName: "$farmDetails.farmName",
                                tankType: 1,
                                pondSize: 1
                            }
                        }
                    ],
                    as: "assignedTanks"
                }
            },
            {
                $project: {
                    _id: 0,
                    assignedTanks: 1
                }
            }
        ]);

        if (!staffs.length) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully",
            data: staffs[0].assignedTanks
        });

    } catch (error) {
        console.log("❌ Get Staff Homescreen Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: []
        });
    }
};

//get mediciens for staff

export const Getmedicinesforstaff = async function(req, res) {
    try {
        console.log("📥 Get Medicine Report Request:", req.body);

        const { farmId, tankId } = req.body;

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

        // Build match conditions
        const matchCondition = {
            farmId: new mongoose.Types.ObjectId(farmId)
        };

        if (tankId) {
            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
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
                $lookup: {
                    from: "user_farms",
                    localField: "farmId",
                    foreignField: "_id",
                    as: "user_farmsDetails"
                }
            },
            {
                $addFields: {
                    partyName: {
                        $arrayElemAt: ["$partyDetails.name", 0]
                    },
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$user_farmsDetails.farmName", 0]
                    }
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    tankDetails: 0,
                    user_farmsDetails: 0
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
            tankId: tankId || null,
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


//get species
// export const getAllSpecies = async(req, res) => {
//     try {
//         console.log("📥 Get All Species Request:", req.body);

//         const { tankId, farmId } = req.body || {};

//         const matchCondition = {};

//         if (tankId) {
//             if (!mongoose.Types.ObjectId.isValid(tankId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid tankId is required"
//                 });
//             }

//             matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
//         }

//         if (farmId) {
//             if (!mongoose.Types.ObjectId.isValid(farmId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid farmId is required"
//                 });
//             }

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
//                 $lookup: {
//                     from: "user_farms",
//                     localField: "farmId",
//                     foreignField: "_id",
//                     as: "farmDetails"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "userDetails"
//                 }
//             },
//             {
//                 $addFields: {
//                     tankName: {
//                         $arrayElemAt: ["$tankDetails.name", 0]
//                     },
//                     farmName: {
//                         $arrayElemAt: ["$farmDetails.farmName", 0]
//                     },
//                     userName: {
//                         $arrayElemAt: ["$userDetails.name", 0]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     tankDetails: 0,
//                     farmDetails: 0,
//                     userDetails: 0,
//                     __v: 0
//                 }
//             },
//             {
//                 $sort: {
//                     logCreatedDate: -1
//                 }
//             }
//         ]);

//         return res.status(200).json({
//             success: true,
//             message: "Species retrieved successfully",
//             count: species.length,
//             species
//         });

//     } catch (error) {
//         console.log("❌ Get All Species Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             species: []
//         });
//     }
// };
//12-11-2026
export const getAllSpecies = async(req, res) => {
    try {
        console.log("📥 Get All Species Request:", req.body);

        const { tankId, farmId } = req.body || {};

        const matchCondition = {};

        if (tankId) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid tankId is required"
                });
            }

            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (farmId) {
            if (!mongoose.Types.ObjectId.isValid(farmId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid farmId is required"
                });
            }

            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        const species = await Species.aggregate([{
                $match: matchCondition
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
                    from: "user_farms",
                    localField: "farmId",
                    foreignField: "_id",
                    as: "farmDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$farmDetails.farmName", 0]
                    },
                    userName: {
                        $arrayElemAt: ["$userDetails.name", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    farmDetails: 0,
                    userDetails: 0,
                    __v: 0
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
            message: "Species retrieved successfully",
            count: species.length,
            species
        });

    } catch (error) {
        console.log("❌ Get All Species Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            species: []
        });
    }
};

//get all purchases
export const getAllPurchases = async(req, res) => {
    try {
        console.log("📥 Get All Purchases Request:", req.body);

        const { tankId, farmId } = req.body || {};

        const matchCondition = {};

        // Filter by tankId
        if (tankId) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid tankId is required"
                });
            }

            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        // Filter by farmId
        if (farmId) {
            if (!mongoose.Types.ObjectId.isValid(farmId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid farmId is required"
                });
            }

            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        const purchases = await Purchase.aggregate([{
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
                    from: "user_farms",
                    localField: "farmId",
                    foreignField: "_id",
                    as: "farmDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
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
                    tankName: {
                        $arrayElemAt: ["$tankDetails.name", 0]
                    },
                    farmName: {
                        $arrayElemAt: ["$farmDetails.farmName", 0]
                    },
                    userName: {
                        $arrayElemAt: ["$userDetails.name", 0]
                    },
                    partyName: {
                        $arrayElemAt: ["$partyDetails.partyName", 0]
                    }
                }
            },
            {
                $project: {
                    tankDetails: 0,
                    farmDetails: 0,
                    userDetails: 0,
                    partyDetails: 0,
                    __v: 0
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
            message: "Purchases retrieved successfully",
            count: purchases.length,
            purchases
        });

    } catch (error) {
        console.log("❌ Get All Purchases Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            purchases: []
        });
    }
};

//GET ALL MANAER STAFF
export const getAllManagerStaff = async(req, res) => {
    try {
        const staffId = req.staffId;

        if (!staffId) {
            return res.status(401).json({
                success: false,
                message: "Manager ID not found in token"
            });
        }

        const staffMembers = await Staff.aggregate([{
                $match: {
                    managerId: new mongoose.Types.ObjectId(staffId),
                    role: "staff"
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
                        $map: {
                            input: "$tankDetails",
                            as: "tank",
                            in: "$$tank.name"
                        }
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
            message: "Staff members fetched successfully",
            count: staffMembers.length,
            data: staffMembers
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff members",
            error: error.message
        });
    }
};