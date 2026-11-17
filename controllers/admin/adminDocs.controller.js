//importing models
import User from "../../models/user.js";
import AppStaff from "../../models/appStaff.js";
import { DateTime } from "luxon";
import mongoose from "mongoose";




export const getAllUsersAndStaff = async function(req, res) {
    try {
        const [userData, staffData] = await Promise.all([
            User.find({ status: "active" }, {
                password: 0,
                fcmToken: 0,
                __v: 0
            }).lean(),

            AppStaff.find({ status: "active" }, {
                password: 0,
                fcmToken: 0,
                __v: 0
            }).lean()
        ]);

        // Combine users and staff
        const allUsers = [
            ...userData.map(item => ({
                ...item,
                userType: "User"
            })),

            ...staffData.map(item => ({
                ...item,
                userType: "Staff"
            }))
        ];

        return res.status(200).json({
            success: true,
            message: allUsers.length > 0 ?
                "Users and staff retrieved successfully" : "No users or staff found",
            totalUsers: allUsers.length,
            users: allUsers
        });

    } catch (err) {
        console.log("Get All Users And Staff Error:", err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};