import jwt from "jsonwebtoken";
import axios from "axios";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";

import Admin from "../../models/admin.js";
import otpModel from "../../models/otp.js";
import staffModel from "../../models/staff.js";



dotenv.config();

// ============================================================
// REGISTER
// ============================================================
export const adminRegistration = async function(req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        const user = await Admin.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ],
        });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "This user is already registered",
            });
        }

        const bcryptedpassword = bcrypt.hashSync(req.body.password, 10);

        const adminEmpObj = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: bcryptedpassword,
            phone: req.body.phone,
            address: req.body.address,
            status: "active",
            rolesAndPermission: [{ Dashview: true }],
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const userData = await adminEmpObj.save();

        if (userData) {
            return res.status(200).json({
                success: true,
                message: "The user is registered successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "The user is not registered",
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

// ============================================================
// LOGIN
// ============================================================
export const authLogin = async function(req, res) {
    const user = await Admin.findOne({
        $or: [
            { email: req.body.email },
            { phone: req.body.email }
        ],
    });

    if (user !== null) {
        const password = req.body.password;
        const pass = bcrypt.compareSync(password, user.password);

        if (pass == true && user.status === "active") {
            let token = jwt.sign({
                    userId: user._id,
                    password: user.password,
                    phone: user.phone,
                    email: user.email,
                },
                process.env.ADMIN_SECRET_KEY, {
                    expiresIn: process.env.ADMIN_EXPIRY_DATE
                }
            );

            const userData = {
                _id: user._id,
                department: "Admin",
                email: user.email,
                name: user.name,
                phone: user.phone,
            };

            let rolesAndPermission =
                user.rolesAndPermission.length !== 0 ?
                user.rolesAndPermission[0] : {};

            return res.status(200).json({
                success: true,
                message: "You have successfully loged in",
                token: token,
                user: userData,
                rolesAndPermission: [{ accessAll: true }],
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "User inactive or incorrect password",
            });
        }
    } else {
        const staff = await staffModel.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.email }
            ],
        });

        if (staff !== null) {
            const password = req.body.password;
            const pass = bcrypt.compareSync(password, staff.password);

            if (pass == true) {
                let token = jwt.sign({
                        userId: staff._id,
                        password: staff.password,
                        phone: staff.phone,
                        email: staff.email,
                    },
                    process.env.ADMIN_SECRET_KEY, {
                        expiresIn: process.env.ADMIN_EXPIRY_DATE
                    }
                );

                const staffData = {
                    _id: staff._id,
                    department: "Staff",
                    email: staff.email,
                    name: staff.name,
                    phone: staff.phone,
                };

                return res.status(200).json({
                    success: true,
                    message: "You have successfully loged in",
                    token: token,
                    user: staffData,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "User inactive or incorrect password",
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide a correct email address or phone number",
            });
        }
    }
};

// ============================================================
// GET ADMIN PROFILE
// ============================================================
export const getAdminProfile = async function(req, res) {
    try {
        let profile = null;

        const adminProfile = await Admin.findOne({
            _id: req.userId
        });

        if (adminProfile) {
            profile = {
                _id: adminProfile._id,
                name: adminProfile.name,
                email: adminProfile.email,
                phone: adminProfile.phone,
                address: adminProfile.address,
                status: adminProfile.status,
                image: adminProfile.image,
            };
        } else {
            const staffProfile = await staffModel.findOne({
                _id: req.userId
            });

            if (staffProfile) {
                profile = {
                    _id: staffProfile._id,
                    name: staffProfile.name,
                    email: staffProfile.email,
                    phone: staffProfile.phone,
                    address: staffProfile.address,
                    status: staffProfile.status,
                    image: staffProfile.image,
                };
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Profile data not found",
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Your data was successfully retrieved",
            profile: profile,
        });
    } catch (error) {
        console.log(error);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
export const changePassword = async function(req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        const {
            password,
            newPassword,
            confirmPassword
        } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Please enter current password"
            });
        }

        const userId = req.userId;

        let userPass;
        let userCollection;
        let updateResult;

        userPass = await Admin.findOne({ _id: userId }, { password: 1 });

        if (userPass) {
            userCollection = Admin;
        } else {
            userPass = await staffModel.findOne({ _id: userId }, { password: 1 });

            if (userPass) {
                userCollection = staffModel;
            } else {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
        }

        const currentPassVal = bcrypt.compareSync(
            password,
            userPass.password
        );

        if (currentPassVal) {
            if (newPassword === confirmPassword) {
                const bcryptedpassword =
                    bcrypt.hashSync(confirmPassword, 10);

                if (userCollection === Admin) {
                    updateResult = await Admin.updateOne({ _id: userId }, {
                        $set: {
                            password: bcryptedpassword,
                            logModifiedDate: logDate,
                        },
                    }, {
                        new: true,
                    });
                } else {
                    updateResult = await staffModel.findOneAndUpdate({ _id: userId }, {
                        $set: {
                            password: bcryptedpassword,
                            logModifiedDate: logDate,
                        },
                    }, {
                        new: true,
                    });
                }

                if (
                    (userCollection === Admin &&
                        updateResult.modifiedCount > 0) ||
                    (userCollection === staffModel &&
                        updateResult)
                ) {
                    return res.status(200).json({
                        success: true,
                        message: "Password updated successfully"
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: "Password update failed"
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "New password does not match"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Old Password"
            });
        }
    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// ============================================================
// UPDATE PROFILE
// ============================================================
export const updateProfile = async function(req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        const updatedAdmin = await Admin.updateOne({ _id: req.userId }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                status: req.body.status,
                logModifiedDate: logDate,
            },
        }, {
            new: true,
        });

        if (updatedAdmin) {
            const updatedStaff = await staffModel.updateOne({ _id: req.userId }, {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    address: req.body.address,
                    status: req.body.status,
                    logModifiedDate: logDate,
                },
            }, {
                new: true,
            });

            if (updatedStaff) {
                res.status(200).json({
                    success: true,
                    message: "Profile updated successfully"
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Failed to update staff profile"
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: "Failed to update admin profile"
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

// ============================================================
// UPDATE ADMIN PROFILE IMAGE
// ============================================================
export const updateadminProfileImg = async function(req, res) {
    try {
        console.log("Request File:", req.file);
        console.log("User ID:", req.userId);

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        let updatedProfilePic;

        const staff = await staffModel.findOne({
            _id: req.userId
        });

        const admin = await Admin.findOne({
            _id: req.userId
        });

        if (staff) {
            updatedProfilePic = await staffModel.findOneAndUpdate({ _id: req.userId }, {
                $set: {
                    image: req.file ? req.file.path : "",
                    logModifiedDate: logDate,
                },
            }, {
                new: true
            });
        } else if (admin) {
            updatedProfilePic = await Admin.findOneAndUpdate({ _id: req.userId }, {
                $set: {
                    image: req.file ? req.file.path : "",
                    logModifiedDate: logDate,
                },
            }, {
                new: true
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        console.log(
            "Updated Profile Pic:",
            updatedProfilePic
        );

        if (updatedProfilePic) {
            return res.status(200).json({
                success: true,
                message: "Profile picture has been updated",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Failed to update profile picture",
            });
        }
    } catch (err) {
        console.error("Error:", err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// ============================================================
// GENERATE FORGOT PASSWORD OTP
// ============================================================
export const generateOtp = async function(req, res) {
    try {
        // Find user in Admin or Staff
        let user = await Admin.findOne({
            email: req.body.email
        });

        let isStaff = false;

        if (!user) {
            user = await staffModel.findOne({
                email: req.body.email
            });

            if (user) {
                isStaff = true;
            }
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered with this email",
            });
        }

        // Generate 6-digit OTP
        let otp = "";
        const num = "1234567890";

        for (let i = 0; i < 6; i++) {
            otp += num[Math.floor(Math.random() * 10)];
        }

        // Save OTP in database
        const otpObj = new otpModel({
            otp: otp,
            emailId: req.body.email,
            userId: user._id,
            createdAt: DateTime.now()
                .setZone("Asia/Kolkata")
                .toISO(),
        });

        await otpObj.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: "Forgot Password OTP",
            text: `Hello ${user.name || "User"},\n\nYour OTP for password reset is: ${otp}\n\nThank you.`,
        };

        // Promisify sendMail to use async/await
        const sendMail = (options) =>
            new Promise((resolve, reject) => {
                transporter.sendMail(options, (err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });

        try {
            const info = await sendMail(mailOptions);

            console.log("Email sent:", info.response);

            return res.status(200).json({
                success: true,
                message: `OTP has been sent successfully to ${req.body.email}`,
                userInfo: user._id,
                userType: isStaff ? "staff" : "admin",
            });
        } catch (emailError) {
            console.log("Email error:", emailError);

            return res.status(500).json({
                success: false,
                message: "Error sending OTP email",
            });
        }
    } catch (error) {
        console.log("Server error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============================================================
// COMPARE OTP
// ============================================================
export const compareOtp = async function(req, res) {
    try {
        const otpResult = await otpModel
            .findOne({
                userId: req.body._id
            })
            .sort({
                createdAt: -1
            });

        if (!otpResult) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this user"
            });
        }

        if (req.body.emailOtp === otpResult.otp) {
            return res.status(200).json({
                success: true,
                message: "Otp has been verified successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            });
        }
    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// ============================================================
// RESET PASSWORD
// ============================================================
export const resetPassword = async function(req, res) {
    try {
        const {
            userId,
            newpassword,
            confirmpassword
        } = req.body;

        // Validate passwords
        if (!newpassword ||
            !confirmpassword ||
            newpassword !== confirmpassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match or are invalid"
            });
        }

        // Check if OTP entry exists for the user
        const otpEntry = await otpModel.findOne({
            userId
        });

        if (!otpEntry) {
            return res.status(400).json({
                success: false,
                message: "Invalid user data or OTP not found",
            });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(
            confirmpassword,
            10
        );

        // Update password in Admin collection
        const logDate = DateTime.now()
            .setZone("Asia/Kolkata")
            .toISO({
                includeOffset: true
            });

        await Admin.updateOne({ _id: userId }, {
            $set: {
                password: hashedPassword,
                logModifiedDate: logDate
            }
        });

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: otpEntry.emailId,
            subject: "Password Reset Successful",
            html: `
                <p style="color: black; font-size: 15px">
                    Hi ${otpEntry.emailId},<br>
                    You have successfully reset your password.<br>
                    Please login with your new password.
                </p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login with your new password.",
        });
    } catch (error) {
        console.log("Reset Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};