import { DateTime } from "luxon";
import Staff from "../../models/appStaff.js";
import Tank from "../../models/tanks.js"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../../models/user.js"


//26-10-2026
// export const createStaff = async(req, res) => {
//     try {
//         console.log(req.body);

//         const {
//             name,
//             email,
//             phone,
//             image,
//             joiningDate,
//             monthlySalary,
//             adharNumber,
//             advanceSalary,
//             role,
//             status,
//             advanceAlreadyGiven,
//             tankId,
//             password,
//         } = req.body;

//         // CHECK DUPLICATE EMAIL OR PHONE
//         const existingStaff = await Staff.findOne({
//             userId: req.userId,
//             $or: [
//                 { email: email },
//                 { phone: phone }
//             ]
//         });

//         if (existingStaff) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Staff with this email or phone number already exists"
//             });
//         }

//         // =====================================================
//         // CHECK TANK IDS
//         // =====================================================

//         let tankIds = [];

//         if (
//             role === "manager" &&
//             tankId === null
//         ) {
//             // MANAGER: ASSIGN ALL TANKS UNDER THE LOGGED-IN USER
//             const tanks = await Tank.find({
//                 userId: req.userId
//             });

//             tankIds = tanks.map(tank => tank._id);

//         } else if (tankId && Array.isArray(tankId) && tankId.length > 0) {

//             const tanks = await Tank.find({
//                 _id: { $in: tankId },
//                 userId: req.userId
//             });

//             if (tanks.length !== tankId.length) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "One or more tanks not found"
//                 });
//             }

//             tankIds = tanks.map(tank => tank._id);

//         } else if (tankId && !Array.isArray(tankId)) {

//             // SUPPORT A SINGLE TANK ID AS WELL
//             const tank = await Tank.findOne({
//                 _id: tankId,
//                 //userId: req.userId
//             });

//             if (!tank) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Tank not found"
//                 });
//             }

//             tankIds = [tank._id];
//         }

//         // =====================================================
//         // HASH PASSWORD USING BCRYPT
//         // =====================================================

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");

//         const logDate = istDateTime.toISO({
//             includeOffset: true
//         });

//         // =====================================================
//         // CREATE STAFF
//         // =====================================================

//         const staff = new Staff({
//             name,
//             email,
//             phone,
//             image,
//             joiningDate,
//             monthlySalary,
//             adharNumber,
//             advanceSalary,
//             role,
//             status,
//             advanceAlreadyGiven,
//             userId: req.userId,
//             tankId: tankIds,
//             password: hashedPassword,
//             logCreatedDate: logDate,
//             logModifiedDate: logDate,
//         });

//         const savedStaff = await staff.save();

//         return res.status(201).json({
//             success: true,
//             message: "Staff created successfully",
//             data: savedStaff,
//         });

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to create staff",
//             error: error.message,
//         });
//     }
// };


export const createStaff = async(req, res) => {
    try {
        console.log(req.body);
        console.log(req.staffId);
        console.log(req.userId)
        const {
            name,
            email,
            phone,
            image,
            joiningDate,
            monthlySalary,
            adharNumber,
            advanceSalary,
            role,
            status,
            advanceAlreadyGiven,
            tankId,
            password,
        } = req.body;

        // CHECK DUPLICATE EMAIL IN USERS COLLECTION
        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email already exists in admins "
            });
        }

        // CHECK DUPLICATE EMAIL OR PHONE
        const existingStaff = await Staff.findOne({
            userId: req.userId,
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: "Staff with this email or phone number already exists"
            });
        }

        // =====================================================
        // SET MANAGER ID
        // =====================================================

        let managerId = null;

        if (req.staffId) {
            const manager = await Staff.findOne({
                _id: req.staffId,
                userId: req.userId,
                role: "manager"
            });

            if (!manager) {
                return res.status(403).json({
                    success: false,
                    message: "Logged-in manager not found"
                });
            }

            managerId = manager._id;
        }

        // =====================================================
        // CHECK TANK IDS
        // =====================================================

        let tankIds = [];

        if (
            role === "manager" &&
            tankId === null
        ) {
            // MANAGER: ASSIGN ALL TANKS UNDER THE LOGGED-IN USER
            const tanks = await Tank.find({
                userId: req.userId
            });

            tankIds = tanks.map(tank => tank._id);

        } else if (tankId && Array.isArray(tankId) && tankId.length > 0) {

            const tanks = await Tank.find({
                _id: { $in: tankId },
                userId: req.userId
            });

            if (tanks.length !== tankId.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more tanks not found"
                });
            }

            tankIds = tanks.map(tank => tank._id);

        } else if (tankId && !Array.isArray(tankId)) {

            // SUPPORT A SINGLE TANK ID AS WELL
            const tank = await Tank.findOne({
                _id: tankId,
                //userId: req.userId
            });

            if (!tank) {
                return res.status(404).json({
                    success: false,
                    message: "Tank not found"
                });
            }

            tankIds = [tank._id];
        }

        // =====================================================
        // HASH PASSWORD USING BCRYPT
        // =====================================================

        const hashedPassword = await bcrypt.hash(password, 10);

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        // =====================================================
        // CREATE STAFF
        // =====================================================

        const staff = new Staff({
            name,
            email,
            phone,
            image,
            joiningDate,
            monthlySalary,
            adharNumber,
            advanceSalary,
            role,
            status,
            advanceAlreadyGiven,
            userId: req.userId,
            managerId: managerId,
            tankId: tankIds,
            password: hashedPassword,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const savedStaff = await staff.save();

        return res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: savedStaff,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create staff",
            error: error.message,
        });
    }
};


// export const updateStaff = async(req, res) => {
//     try {
//         console.log(req.body);

//         const staffId = req.params.id;

//         const {
//             name,
//             email,
//             phone,
//             image,
//             joiningDate,
//             monthlySalary,
//             adharNumber,
//             advanceSalary,
//             role,
//             status,
//             advanceAlreadyGiven,
//             tankId,
//         } = req.body;

//         // FIND STAFF
//         const staff = await Staff.findById(staffId);

//         if (!staff) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Staff not found",
//             });
//         }

//         // CHECK TANK IDS
//         if (tankId !== undefined) {
//             let tankIds = [];

//             if (Array.isArray(tankId) && tankId.length > 0) {
//                 const tanks = await Tank.find({
//                     _id: { $in: tankId },
//                     //  userId: req.userId,
//                 });

//                 if (tanks.length !== tankId.length) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "One or more tanks not found",
//                     });
//                 }

//                 tankIds = tanks.map(tank => tank._id);

//             } else if (!Array.isArray(tankId)) {
//                 const tank = await Tank.findOne({
//                     _id: tankId,
//                     userId: req.userId,
//                 });

//                 if (!tank) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "Tank not found",
//                     });
//                 }

//                 tankIds = [tank._id];
//             }

//             staff.tankId = tankIds;
//         }

//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//         const logDate = istDateTime.toISO({ includeOffset: true });

//         if (name !== undefined) staff.name = name;
//         if (email !== undefined) staff.email = email;
//         if (phone !== undefined) staff.phone = phone;
//         if (image !== undefined) staff.image = image;
//         if (joiningDate !== undefined) staff.joiningDate = joiningDate;
//         if (monthlySalary !== undefined) staff.monthlySalary = monthlySalary;
//         if (adharNumber !== undefined) staff.adharNumber = adharNumber;
//         if (advanceSalary !== undefined) staff.advanceSalary = advanceSalary;
//         if (role !== undefined) staff.role = role;
//         if (status !== undefined) staff.status = status;
//         if (advanceAlreadyGiven !== undefined) staff.advanceAlreadyGiven = advanceAlreadyGiven;

//         staff.logModifiedDate = logDate;

//         const updatedStaff = await staff.save();

//         return res.status(200).json({
//             success: true,
//             message: "Staff updated successfully",
//             data: updatedStaff,
//         });

//     } catch (error) {
//         console.log(err)
//         return res.status(500).json({
//             success: false,
//             message: "Failed to update staff",
//             error: error.message,
//         });
//     }
// };

//26-10-2026
export const updateStaff = async(req, res) => {
    try {
        console.log(req.body);

        const staffId = req.params.id;

        const {
            name,
            email,
            phone,
            image,
            joiningDate,
            monthlySalary,
            adharNumber,
            advanceSalary,
            role,
            status,
            advanceAlreadyGiven,
            tankId,
        } = req.body;

        // FIND STAFF
        const staff = await Staff.findById(staffId);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        // CHECK TANK IDS
        if (tankId !== undefined) {
            let tankIds = [];

            if (
                role === "manager" &&
                tankId === null
            ) {
                // MANAGER: FETCH ALL TANKS UNDER THE LOGGED-IN USER
                const tanks = await Tank.find({
                    userId: req.userId
                });

                tankIds = tanks.map(tank => tank._id);

            } else if (Array.isArray(tankId) && tankId.length > 0) {
                const tanks = await Tank.find({
                    _id: { $in: tankId },
                    //  userId: req.userId,
                });

                if (tanks.length !== tankId.length) {
                    return res.status(404).json({
                        success: false,
                        message: "One or more tanks not found",
                    });
                }

                tankIds = tanks.map(tank => tank._id);

            } else if (!Array.isArray(tankId) && tankId !== null) {
                const tank = await Tank.findOne({
                    _id: tankId,
                    userId: req.userId,
                });

                if (!tank) {
                    return res.status(404).json({
                        success: false,
                        message: "Tank not found",
                    });
                }

                tankIds = [tank._id];
            }

            staff.tankId = tankIds;
        }

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        if (name !== undefined) staff.name = name;
        if (email !== undefined) staff.email = email;
        if (phone !== undefined) staff.phone = phone;
        if (image !== undefined) staff.image = image;
        if (joiningDate !== undefined) staff.joiningDate = joiningDate;
        if (monthlySalary !== undefined) staff.monthlySalary = monthlySalary;
        if (adharNumber !== undefined) staff.adharNumber = adharNumber;
        if (advanceSalary !== undefined) staff.advanceSalary = advanceSalary;
        if (role !== undefined) staff.role = role;
        if (status !== undefined) staff.status = status;
        if (advanceAlreadyGiven !== undefined) staff.advanceAlreadyGiven = advanceAlreadyGiven;

        staff.logModifiedDate = logDate;

        const updatedStaff = await staff.save();

        return res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: updatedStaff,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update staff",
            error: error.message,
        });
    }
};

export const getallstaffs = async(req, res) => {
    try {
        console.log("📥 Get All Tanks Request");

        const userId = req.userId;

        const staffs = await Staff.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
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
                                        $cond: [{
                                                $gt: [{
                                                        $size: {
                                                            $ifNull: [
                                                                "$$assignedTankIds", []
                                                            ]
                                                        }
                                                    },
                                                    0
                                                ]
                                            },
                                            {
                                                $in: [
                                                    "$_id",
                                                    "$$assignedTankIds"
                                                ]
                                            },
                                            true
                                        ]
                                    }
                                ]
                            }
                        }
                    }],
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
                    tankDetails: 0,
                    farmId: 0,
                    password: 0
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
            staffs: staffs
        });

    } catch (error) {
        console.log("❌ Get All staffs Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            staffs: []
        });
    }
};
export const deletestaff = async(req, res) => {
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

        const staffId = req.params.id;

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: "Please provide staff id"
            });
        }

        const tank = await Staff.findOne({
            _id: staffId,
            userId: userId
        });

        if (!tank) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        await Staff.deleteOne({
            _id: staffId,
            userId: userId
        });

        return res.status(200).json({
            success: true,
            message: "Staff deleted successfully"
        });

    } catch (error) {
        console.log("❌ Delete Staff Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};



export const getSingleStaff = async(req, res) => {
    try {
        const staff = await Staff.findOne({
            _id: req.body.id
        });

        return res.status(200).json({
            success: true,
            staff: staff || {}
        });

    } catch (error) {
        console.log(error);

        return res.status(400).json({
            error: error.message
        });
    }
};


//get all staffs only 
export const getRoleStaff = async(req, res) => {
    try {
        console.log("📥 Get All Tanks Request");

        const userId = req.userId;

        const staffs = await Staff.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    role: "staff"
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
                                        $cond: [{
                                                $gt: [{
                                                        $size: {
                                                            $ifNull: [
                                                                "$$assignedTankIds", []
                                                            ]
                                                        }
                                                    },
                                                    0
                                                ]
                                            },
                                            {
                                                $in: [
                                                    "$_id",
                                                    "$$assignedTankIds"
                                                ]
                                            },
                                            true
                                        ]
                                    }
                                ]
                            }
                        }
                    }],
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
                    tankDetails: 0,
                    farmId: 0,
                    password: 0
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
            staffs: staffs
        });

    } catch (error) {
        console.log("❌ Get All staffs Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            staffs: []
        });
    }
};