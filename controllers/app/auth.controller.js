dotenv.config();

import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import otpModel from "../../models/otp.js"
import Policies from "../../models/policies.js";
import Aboutus from "../../models/aboutus.js";
import Faqs from "../../models/faq.js"

import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { DateTime } from "luxon";
import axios from "axios";
import mongoose from "mongoose";

import UserFarms from "../../models/userFarms.js";
import Staff from "../../models/appStaff.js";
import StaffExpensesModel from "../../models/staff_expenses.js";
import RequestAdvance from "../../models/staff_request_advance.js";

dotenv.config();

//REGISTER
export const userRegistrastion = async(req, res) => {
    try {
        console.log("📥 Register User Request:", req.body);
        console.log("📷 Uploaded User Image:", req.file);

        const {
            name,
            email,
            phone,
            address,
            password,
            confirmPassword,
            farmName,
            farmLocation,
            currency,
            location
        } = req.body;

        // REQUIRED FIELDS
        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, phone, password and confirmPassword"
            });
        }

        // CHECK PASSWORD
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmPassword do not match"
            });
        }

        // NORMALIZE EMAIL AND PHONE
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.trim();

        // CHECK EXISTING EMAIL
        const existingEmail = await User.findOne({
            email: normalizedEmail
        });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // CHECK EXISTING PHONE
        const existingPhone = await User.findOne({
            phone: normalizedPhone
        });

        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // IMAGE
        const image = req.file ?
            `uploads/userImg/${req.file.filename}` :
            "";

        console.log("📷 Image Path:", image);

        // PARSE LOCATION
        let locationData = {
            type: "Polygon",
            coordinates: []
        };

        if (location) {
            try {
                locationData = typeof location === "string" ?
                    JSON.parse(location) :
                    location;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location JSON format"
                });
            }

            if (
                locationData.type !== "Polygon" ||
                !Array.isArray(locationData.coordinates) ||
                locationData.coordinates.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "A valid Polygon with coordinates is required"
                });
            }
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // DATE AND TIME
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        // CREATE USER
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            address: address || "",
            image,
            password: hashedPassword,

            // Save coordinates in User as requested
            location: locationData,

            logCreatedDate: logDate,
            logModifiedDate: logDate,
            role: "owner",
            status: "active"
        });

        const savedUser = await user.save();

        // SAVE FARM DETAILS IN USERFARMS
        let savedFarm = null;

        if (farmName) {
            const userFarm = new UserFarms({
                userId: savedUser._id,
                date: istDateTime.toFormat("yyyy-MM-dd"),
                farmName: farmName.trim(),
                farmLocation: farmLocation || "",
                currency: currency || "INR",
                location: locationData,
                status: "active"
            });

            savedFarm = await userFarm.save();
        }

        // REMOVE PASSWORD FROM RESPONSE
        const responseUser = savedUser.toObject();
        delete responseUser.password;

        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: responseUser,
            farm: savedFarm
        });

    } catch (error) {
        console.log("❌ Register User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};

// export const loginUser = async(req, res) => {
//     try {

//         console.log("📥 User Login Request:", req.body);

//         const {
//             email,
//             password
//         } = req.body;

//         // =====================================================
//         // REQUIRED FIELDS
//         // =====================================================

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide email and password"
//             });
//         }

//         // =====================================================
//         // FIND USER
//         // =====================================================

//         const user = await User.findOne({
//             email: email.trim().toLowerCase()
//         });

//         if (!user) {

//             // =====================================================
//             // FIND STAFF / MANAGER
//             // =====================================================

//             const staff = await Staff.findOne({
//                 email: email.trim().toLowerCase()
//             });

//             if (!staff) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid email or password"
//                 });
//             }

//             // =====================================================
//             // CHECK STAFF STATUS
//             // =====================================================

//             if (staff.status !== "active") {
//                 return res.status(403).json({
//                     success: false,
//                     message: "Your account is inactive"
//                 });
//             }

//             // =====================================================
//             // CHECK STAFF PASSWORD
//             // =====================================================

//             const isPasswordValid = await bcrypt.compare(
//                 password,
//                 staff.password
//             );

//             if (!isPasswordValid) {
//                 return res.status(401).json({
//                     success: false,
//                     message: "Invalid email or password"
//                 });
//             }

//             // =====================================================
//             // GENERATE STAFF TOKEN
//             // =====================================================

//             const token = jwt.sign({
//                     userId: staff.userId,
//                     staffId: staff._id,
//                     phone: staff.phone,
//                     role: staff.role,
//                     farmId: staff.farmId,
//                     tankId: staff.tankId
//                 },
//                 process.env.ADMIN_SECRET_KEY, {
//                     expiresIn: process.env.ADMIN_EXPIRY_DATE
//                 }
//             );

//             // =====================================================
//             // STAFF / MANAGER SUCCESS RESPONSE
//             // =====================================================

//             return res.status(200).json({
//                 success: true,
//                 message: "Login successful",
//                 token: token,
//                 user: {
//                     _id: staff._id,
//                     name: staff.name,
//                     email: staff.email,
//                     phone: staff.phone,
//                     role: staff.role,
//                     userId: staff.userId,
//                     staffId: staff._id,
//                     farmId: staff.farmId,
//                     tankId: staff.tankId
//                 }
//             });

//         } else {

//             // =====================================================
//             // CHECK USER STATUS
//             // =====================================================

//             if (user.status !== "active") {
//                 return res.status(403).json({
//                     success: false,
//                     message: "Your account is inactive"
//                 });
//             }

//             // =====================================================
//             // CHECK PASSWORD
//             // =====================================================

//             const isPasswordMatch = await bcrypt.compare(
//                 password,
//                 user.password
//             );

//             if (!isPasswordMatch) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid email or password"
//                 });
//             }

//             // =====================================================
//             // GENERATE TOKEN
//             // =====================================================

//             const token = jwt.sign({
//                     userId: user._id,
//                     phone: user.phone
//                 },
//                 process.env.ADMIN_SECRET_KEY, {
//                     expiresIn: process.env.ADMIN_EXPIRY_DATE
//                 }
//             );

//             // =====================================================
//             // USER RESPONSE
//             // =====================================================

//             const userData = user.toObject();

//             delete userData.password;

//             // =====================================================
//             // SUCCESS RESPONSE
//             // =====================================================

//             return res.status(200).json({
//                 success: true,
//                 message: "Login successful",
//                 token: token,
//                 user: userData
//             });
//         }

//     } catch (error) {

//         console.log("❌ User Login Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }

// };
export const loginUser = async(req, res) => {
    try {

        console.log("📥 User Login Request:", req.body);

        const {
            email,
            password,
            fcmToken
        } = req.body;

        // =====================================================
        // REQUIRED FIELDS
        // =====================================================

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // =====================================================
        // FIND USER
        // =====================================================

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {

            // =====================================================
            // FIND STAFF / MANAGER
            // =====================================================

            const staff = await Staff.findOne({
                email: email.trim().toLowerCase()
            });

            if (!staff) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // =====================================================
            // CHECK STAFF STATUS
            // =====================================================

            if (staff.status !== "active") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is inactive, Please contact to admin"
                });
            }

            // =====================================================
            // CHECK STAFF PASSWORD
            // =====================================================

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

            // =====================================================
            // UPDATE STAFF FCM TOKEN
            // =====================================================

            if (fcmToken) {
                staff.fcmToken = fcmToken;
                await staff.save();
            }

            // =====================================================
            // GENERATE STAFF TOKEN
            // =====================================================

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

            // =====================================================
            // STAFF / MANAGER SUCCESS RESPONSE
            // =====================================================

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                user: {
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

        } else {

            // =====================================================
            // CHECK USER STATUS
            // =====================================================

            if (user.status !== "active") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is inactive"
                });
            }

            // =====================================================
            // CHECK PASSWORD
            // =====================================================

            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // =====================================================
            // UPDATE USER FCM TOKEN
            // =====================================================

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            // =====================================================
            // GENERATE TOKEN
            // =====================================================

            const token = jwt.sign({
                    userId: user._id,
                    phone: user.phone
                },
                process.env.ADMIN_SECRET_KEY, {
                    expiresIn: process.env.ADMIN_EXPIRY_DATE
                }
            );

            // =====================================================
            // USER RESPONSE
            // =====================================================

            const userData = user.toObject();

            delete userData.password;

            // =====================================================
            // SUCCESS RESPONSE
            // =====================================================

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                user: userData
            });
        }

    } catch (error) {

        console.log("❌ User Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get user profile
// export const getuserProfile = async function(req, res) {
//     try {
//         console.log(req.userId);

//         const userProfile = await User.findOne({
//             _id: new mongoose.Types.ObjectId(req.userId)
//         });

//         if (!userProfile) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         // // Get policies
//         const policies = await Policies.findOne({});
//         const aboutUs = await Aboutus.findOne({});
//         const faqs = await Faqs.find({
//             status: "active"
//         }).sort({ priority: 1 });

//         res.status(200).json({
//             success: true,
//             data: userProfile,
//             data: {
//                 ...userProfile.toObject(),
//                 policy: {
//                     // termsAndCondition: policies ? .termsAndCondition || "",
//                     // privacyPolicy: policies ? .privacyPolicy || "",
//                     // refundPolicy: policies ? .refundPolicy || ""
//                     termsAndCondition: policies.termsAndCondition,
//                     privacyPolicy: policies.privacyPolicy,
//                     aboutus: policies.aboutus,

//                 },
//                 aboutUs: {
//                     email: aboutUs.email,
//                     phone: aboutUs.phone,

//                 },
//                 faqs: faqs
//             }
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// };


export const getuserProfile = async function(req, res) {
    try {
        console.log(req.userId);
        console.log("Staff ID:", req.staffId);

        // Check co-owner using staffId
        if (req.staffId) {
            const staffData = await Staff.findById(req.staffId);

            if (staffData && staffData.role === "coowner") {

                // Get policies, About Us and FAQs
                const policies = await Policies.findOne({});
                const aboutUs = await Aboutus.findOne({});
                const faqs = await Faqs.find({
                    status: "active"
                }).sort({ priority: 1 });

                return res.status(200).json({
                    success: true,
                    data: {
                        ...staffData.toObject(),
                        policy: {
                            termsAndCondition: policies.termsAndCondition,
                            privacyPolicy: policies.privacyPolicy,
                            aboutus: policies.aboutus,

                        },
                        aboutUs: {
                            email: aboutUs.email,
                            phone: aboutUs.phone,
                        },
                        faqs: faqs
                    }
                });
            }
        }

        // Existing owner profile flow
        const userProfile = await User.findOne({
            _id: new mongoose.Types.ObjectId(req.userId)
        });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get policies
        const policies = await Policies.findOne({});
        const aboutUs = await Aboutus.findOne({});
        const faqs = await Faqs.find({
            status: "active"
        }).sort({ priority: 1 });

        res.status(200).json({
            success: true,
            data: {
                ...userProfile.toObject(),
                policy: {
                    termsAndCondition: policies.termsAndCondition,
                    privacyPolicy: policies.privacyPolicy,
                    aboutus: policies.aboutus,

                },
                aboutUs: {

                    email: aboutUs.email,
                    phone: aboutUs.phone,

                },
                faqs: faqs
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

export const updateUserProfile = async(req, res) => {
    try {


        console.log("📥 Update User Profile Request:", req.body);
        console.log("📷 Uploaded Image:", req.file);

        const userId = req.userId;

        const {
            name,
            phone,
            address
        } = req.body;

        // =====================================================
        // CHECK USER ID
        // =====================================================

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found"
            });
        }

        // =====================================================
        // FIND USER
        // =====================================================

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                user: {}
            });
        }

        // =====================================================
        // CHECK PHONE DUPLICATE
        // =====================================================

        if (phone && phone.trim() !== user.phone) {

            const existingPhone = await User.findOne({
                phone: phone.trim(),
                _id: {
                    $ne: userId
                }
            });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already registered"
                });
            }
        }

        // =====================================================
        // UPDATE NAME
        // =====================================================

        if (name !== undefined) {
            user.name = name.trim();
        }

        // =====================================================
        // UPDATE PHONE
        // =====================================================

        if (phone !== undefined) {
            user.phone = phone.trim();
        }

        // =====================================================
        // UPDATE ADDRESS
        // =====================================================

        if (address !== undefined) {
            user.address = address;
        }

        // =====================================================
        // UPDATE IMAGE
        // =====================================================

        if (req.file) {
            user.image = "uploads/userImg/" + req.file.filename;
        }

        // =====================================================
        // MODIFIED DATE
        // =====================================================

        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        user.logModifiedDate = istDateTime.toISO({
            includeOffset: true
        });

        // =====================================================
        // SAVE
        // =====================================================

        const updatedUser = await user.save();

        // =====================================================
        // REMOVE PASSWORD
        // =====================================================

        const responseUser = updatedUser.toObject();

        delete responseUser.password;

        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: responseUser
        });

    } catch (error) {

        console.error("❌ Update User Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }


};


// export const generateOtp = async function(req, res) {
//     try {


//         const { email } = req.body;

//         // =====================================================
//         // CHECK EMAIL
//         // =====================================================

//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide email"
//             });
//         }

//         const userEmail = email.trim().toLowerCase();

//         // =====================================================
//         // FIND USER
//         // =====================================================

//         const user = await User.findOne({
//             email: userEmail
//         });

//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User is not registered with this email"
//             });
//         }

//         // =====================================================
//         // GENERATE DYNAMIC 4 DIGIT OTP
//         // =====================================================

//         const otp = Math.floor(
//             1000 + Math.random() * 9000
//         ).toString();

//         console.log("Generated OTP:", otp);

//         // =====================================================
//         // SAVE OTP
//         // =====================================================

//         const otpObj = new otpModel({
//             otp: otp,
//             emailId: userEmail,
//             userId: user._id,
//             createdAt: DateTime.now()
//                 .setZone("Asia/Kolkata")
//                 .toISO()
//         });

//         await otpObj.save();

//         // =====================================================
//         // EMAIL TRANSPORTER
//         // =====================================================

//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });

//         // =====================================================
//         // EMAIL
//         // =====================================================

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: userEmail,
//             subject: "Forgot Password OTP",
//             text: "Hello " +
//                 (user.name || "User") +
//                 ",\n\n" +
//                 "Your OTP for password reset is: " +
//                 otp +
//                 "\n\n" +
//                 "This OTP is valid for password reset.\n\n" +
//                 "Thank you."
//         };

//         // =====================================================
//         // SEND EMAIL
//         // =====================================================

//         await transporter.sendMail(mailOptions);

//         console.log("OTP email sent successfully to:", userEmail);

//         // =====================================================
//         // SUCCESS
//         // =====================================================

//         return res.status(200).json({
//             success: true,
//             message: "OTP has been sent successfully to your email",
//             userInfo: user._id,
//             userEmail: user.email

//         });

//     } catch (error) {

//         console.log("❌ Generate OTP Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }


// };


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

        const user = await User.findOne({
            email: userEmail
        });

        if (!user) {

            // =====================================================
            // FIND STAFF / MANAGER
            // =====================================================

            const staff = await Staff.findOne({
                email: userEmail
            });

            if (!staff) {
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
                userId: staff._id,
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
                    (staff.name || "User") +
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
                userInfo: staff._id,
                userEmail: staff.email
            });

        } else {

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
        }

    } catch (error) {

        console.log("❌ Generate OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};

// export const verifyOtp = async(req, res) => {
//     try {


//         console.log("📥 Verify OTP Request:", req.body);

//         const {
//             email,
//             otp
//         } = req.body;

//         // =====================================================
//         // REQUIRED FIELDS
//         // =====================================================

//         if (!email || !otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide email and OTP"
//             });
//         }

//         const userEmail = email.trim().toLowerCase();
//         const enteredOtp = otp.toString().trim();

//         // =====================================================
//         // FIND USER BY EMAIL
//         // =====================================================

//         const user = await User.findOne({
//             email: userEmail
//         });

//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User is not registered with this email"
//             });
//         }

//         // =====================================================
//         // FIND LATEST OTP
//         // =====================================================

//         const otpData = await otpModel.findOne({
//             emailId: userEmail,
//             userId: user._id
//         }).sort({
//             createdAt: -1
//         });

//         if (!otpData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP not found or expired"
//             });
//         }

//         // =====================================================
//         // COMPARE OTP
//         // =====================================================

//         if (otpData.otp !== enteredOtp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid OTP"
//             });
//         }

//         // =====================================================
//         // DELETE OTP AFTER SUCCESSFUL VERIFICATION
//         // =====================================================

//         await otpModel.findByIdAndDelete(otpData._id);

//         console.log("✅ OTP verified and deleted:", otpData._id);

//         // =====================================================
//         // SUCCESS
//         // =====================================================

//         return res.status(200).json({
//             success: true,
//             message: "OTP verified successfully",
//             userId: user._id
//         });

//     } catch (error) {

//         console.log("❌ Verify OTP Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message
//         });
//     }


// };

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

        const user = await User.findOne({
            email: userEmail
        });

        if (!user) {

            // =====================================================
            // FIND STAFF BY EMAIL
            // =====================================================

            const staff = await Staff.findOne({
                email: userEmail
            });

            if (!staff) {
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
                userId: staff._id
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
                userId: staff._id
            });

        } else {

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
        }

    } catch (error) {

        console.log("❌ Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};
// export const changePassword = async function(req, res) {
//     try {
//         console.log("📥 Change Password Request:", req.body);


//         const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//         const logDate = istDateTime.toISO({
//             includeOffset: true
//         });

//         const {
//             email,
//             newPassword,
//             confirmPassword
//         } = req.body;

//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide email"
//             });
//         }

//         if (!newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide new password"
//             });
//         }

//         if (!confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide confirm password"
//             });
//         }

//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New password does not match"
//             });
//         }

//         const userEmail = email.trim().toLowerCase();

//         const user = await User.findOne({
//             email: userEmail
//         });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const bcryptedPassword = await bcrypt.hash(
//             confirmPassword,
//             10
//         );

//         user.password = bcryptedPassword;
//         user.logModifiedDate = logDate;

//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: "Password updated successfully"
//         });

//     } catch (err) {
//         console.log("❌ Change Password Error:", err);

//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             error: err.message
//         });
//     }


// };

//



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

        const user = await User.findOne({
            email: userEmail
        });

        if (!user) {

            // =====================================================
            // FIND STAFF / MANAGER
            // =====================================================

            const staff = await Staff.findOne({
                email: userEmail
            });

            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const bcryptedPassword = await bcrypt.hash(
                confirmPassword,
                10
            );

            staff.password = bcryptedPassword;
            staff.logModifiedDate = logDate;

            await staff.save();

            return res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });

        } else {

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
        }

    } catch (err) {
        console.log("❌ Change Password Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    }

};


export const saveFarmArray = async(req, res) => {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({
            includeOffset: true
        });
        const userId = req.userId;
        const { farmArray } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId"
            });
        }

        if (!Array.isArray(farmArray) || farmArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: "farmArray must be a non-empty array"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Save all farms in the User model
        user.farmArray = [
            ...(user.farmArray || []),
            ...farmArray
        ];

        await user.save();

        // Insert the same farms into user_farms
        const farmsToInsert = farmArray.map((farm) => ({
            userId: new mongoose.Types.ObjectId(userId),
            date: logDate.slice(0, 10),
            farmName: farm.farmName,
            farmLocation: farm.farmLocation,
            currency: farm.currency,
            location: farm.location
        }));

        const savedFarms = await UserFarms.insertMany(farmsToInsert);

        return res.status(200).json({
            success: true,
            message: "Farms saved successfully",
            data: {
                farmArray: user.farmArray,
                userFarms: savedFarms
            }
        });
    } catch (error) {
        console.log("Save Farm Array Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save farms",
            error: error.message
        });
    }

};



// ADD FARM DETAILS
export const addUserFarm = async(req, res) => {
    try {
        console.log("📥 Add Farm Request:", req.body);

        const userId = req.userId
        const {
            farmName,
            farmLocation,
            currency,
            location
        } = req.body;

        // REQUIRED FIELDS
        if (!userId || !farmName || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide  farmName and location"
            });
        }

        // VALIDATE USER ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId"
            });
        }

        // CHECK USER EXISTS
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // PARSE LOCATION
        let locationData;

        try {
            locationData = typeof location === "string" ?
                JSON.parse(location) :
                location;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid location JSON format"
            });
        }

        // VALIDATE POLYGON
        if (!locationData ||
            locationData.type !== "Polygon" ||
            !Array.isArray(locationData.coordinates) ||
            locationData.coordinates.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid Polygon with coordinates is required"
            });
        }

        const ring = locationData.coordinates[0];

        if (!Array.isArray(ring) ||
            ring.length < 4 ||
            !ring.every(point =>
                Array.isArray(point) &&
                point.length === 2 &&
                point.every(Number.isFinite)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Polygon must contain valid [longitude, latitude] coordinate pairs"
            });
        }

        const firstPoint = ring[0];
        const lastPoint = ring[ring.length - 1];

        if (
            firstPoint[0] !== lastPoint[0] ||
            firstPoint[1] !== lastPoint[1]
        ) {
            return res.status(400).json({
                success: false,
                message: "Polygon coordinates must form a closed ring"
            });
        }

        // DATE AND TIME
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        // CREATE FARM
        const userFarm = new UserFarms({
            userId: req.userId,
            date: istDateTime.toFormat("yyyy-MM-dd"),
            farmName: farmName.trim(),
            farmLocation: farmLocation || "",
            currency: currency || "INR",
            location: locationData,
            status: "active"
        });

        const savedFarm = await userFarm.save();

        return res.status(201).json({
            success: true,
            message: "Farm added successfully",
            data: savedFarm
        });

    } catch (error) {
        console.log("❌ Add Farm Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};



export const getAllUserFarms = async(req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const farms = await UserFarms.find({
            userId: new mongoose.Types.ObjectId(userId)
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: farms.length ?
                "Farms retrieved successfully" : "No farms found",
            totalFarms: farms.length,
            data: farms
        });

    } catch (error) {
        console.error("Get All User Farms Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

};

//get staff profile

// export const getstaffProfile = async function(req, res) {
//     try {
//         console.log(req.staffId);

//         const userProfile = await Staff.aggregate([{
//                 $match: {
//                     _id: new mongoose.Types.ObjectId(req.staffId)
//                 }
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
//                 $addFields: {
//                     tankName: {
//                         $map: {
//                             input: "$tankDetails",
//                             as: "tank",
//                             in: "$$tank.name"
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     tankDetails: 0,
//                     farmId: 0
//                 }
//             }
//         ]);

//         if (!userProfile.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: userProfile[0]
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// };

export const getstaffProfile = async function(req, res) {
    try {
        console.log(req.staffId);

        const userProfile = await Staff.aggregate([{
                $match: {
                    _id: new mongoose.Types.ObjectId(req.staffId)
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
                                                            $ifNull: ["$$assignedTankIds", []]
                                                        }
                                                    },
                                                    0
                                                ]
                                            },
                                            {
                                                $in: ["$_id", "$$assignedTankIds"]
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
                    farmId: 0
                }
            }
        ]);

        if (!userProfile.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: userProfile[0]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


//STAFF EXPENSES
export const getAllStaffExpenses = async(req, res) => {
    try {
        const { tankId, farmId } = req.body;

        if (!tankId || !farmId) {
            return res.status(400).json({
                success: false,
                message: "tankId and farmId are required"
            });
        }

        const staffExpenses = await StaffExpensesModel.aggregate([{
                $match: {
                    tankId: new mongoose.Types.ObjectId(tankId),
                    farmId: new mongoose.Types.ObjectId(farmId)
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
                $unwind: {
                    path: "$staffDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    staffName: "$staffDetails.name"
                }
            },
            {
                $project: {
                    staffDetails: 0
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Staff expenses fetched successfully",
            count: staffExpenses.length,
            data: staffExpenses
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff expenses",
            error: error.message
        });
    }
};


//update staff expense
export const updateStaffExpenseStatus = async(req, res) => {
    try {
        console.log(req.body)
        const { staffExpenseId, status } = req.body;

        if (!staffExpenseId || !status) {
            return res.status(400).json({
                success: false,
                message: "staffExpenseId and status are required"
            });
        }

        const allowedStatuses = ["pending", "approved", "rejected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const staffExpense = await StaffExpensesModel.findOneAndUpdate({
            _id: staffExpenseId
        }, {
            $set: {
                status: status,
                updatedAt: new Date()
            }
        }, {
            new: true,
            runValidators: true
        });

        if (!staffExpense) {
            return res.status(404).json({
                success: false,
                message: "Staff expense not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Staff expense status updated successfully",
            data: staffExpense
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update staff expense status",
            error: error.message
        });
    }
};



export const updateStaffStatus = async function(req, res) {
    try {
        const { staffId, status } = req.body;

        if (!staffId || !status) {
            return res.status(400).json({
                success: false,
                message: "staffId and status are required"
            });
        }

        const staffData = await Staff.findOneAndUpdate({
            _id: staffId
        }, {
            $set: {
                status: status,
                logModifiedDate: DateTime.now()
                    .setZone("Asia/Kolkata")
                    .toISO({ includeOffset: true })
            }
        }, {
            new: true
        });

        if (!staffData) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Staff status updated successfully",
            data: staffData
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

//get all request advances

// export const getAllRequestAdvances = async function(req, res) {
//     try {

//         const requestAdvances = await RequestAdvance.aggregate([{
//                 $lookup: {
//                     from: "app_staffs",
//                     localField: "staffId",
//                     foreignField: "_id",
//                     as: "staffDetails"
//                 }
//             },
//             {
//                 $addFields: {
//                     staffName: {
//                         $ifNull: [
//                             { $arrayElemAt: ["$staffDetails.name", 0] },
//                             ""
//                         ]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     staffDetails: 0
//                 }
//             },
//             {
//                 $sort: {
//                     logCreatedDate: -1,
//                 },
//             },
//         ]);

//         return res.status(200).json({
//             success: true,
//             message: "Fetched successfully",
//             count: requestAdvances.length,
//             data: requestAdvances,
//         });
//     } catch (err) {
//         console.log(err);

//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             data: [],
//         });
//     }
// };

export const getAllRequestAdvances = async function(req, res) {
    try {

        const requestAdvances = await RequestAdvance.aggregate([{
                $lookup: {
                    from: "app_staffs",
                    let: {
                        staffId: "$staffId"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$staffId"] },
                                    {
                                        $eq: [
                                            "$userId",
                                            new mongoose.Types.ObjectId(req.userId)
                                        ]
                                    }
                                ]
                            }
                        }
                    }],
                    as: "staffDetails"
                }
            },
            {
                $match: {
                    staffDetails: { $ne: [] }
                }
            },
            {
                $addFields: {
                    staffName: {
                        $ifNull: [
                            { $arrayElemAt: ["$staffDetails.name", 0] },
                            ""
                        ]
                    }
                }
            },
            {
                $project: {
                    staffDetails: 0
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
            count: requestAdvances.length,
            data: requestAdvances,
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            data: [],
        });
    }
};





export const updateStaffRequestAdvanceStatus = async function(req, res) {
    try {
        const { _id, status } = req.body;

        if (!_id || !status) {
            return res.status(400).json({
                success: false,
                message: "_id and status are required"
            });
        }

        const requestAdvanceData = await RequestAdvance.findOneAndUpdate({
            _id: _id
        }, {
            $set: {
                status: status,
                logModifiedDate: DateTime.now()
                    .setZone("Asia/Kolkata")
                    .toISO({ includeOffset: true })
            }
        }, {
            new: true
        });

        if (!requestAdvanceData) {
            return res.status(404).json({
                success: false,
                message: "Staff request advance not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Staff request advance status updated successfully",
            data: requestAdvanceData
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};




export const getcoownerProfile = async function(req, res) {
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

        // // Get policies
        const policies = await Policies.findOne({});
        const aboutUs = await Aboutus.findOne({});
        const faqs = await Faqs.find({
            status: "active"
        }).sort({ priority: 1 });

        res.status(200).json({
            success: true,
            data: userProfile,
            data: {
                ...userProfile.toObject(),
                policy: {
                    // termsAndCondition: policies ? .termsAndCondition || "",
                    // privacyPolicy: policies ? .privacyPolicy || "",
                    // refundPolicy: policies ? .refundPolicy || ""
                    termsAndCondition: policies.termsAndCondition,
                    privacyPolicy: policies.privacyPolicy,
                    aboutus: policies.aboutus,

                },
                aboutUs: {
                    email: aboutUs.email,
                    phone: aboutUs.phone,

                },
                faqs: faqs
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