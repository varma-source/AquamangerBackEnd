import notificationModel from "../../models/notification.js";
import userModel from "../../models/user.js";
import AppStaff from "../../models/appStaff.js";
import mongoose from "mongoose";
import * as notificationUtil from "../../utils/notificationUtills.js";

// ============================================================
// ADD NOTIFICATION
// ============================================================

export const addNotification = async function(req, res) {
    try {
        console.log("Add Notification Request:", req.body);

        const {
            sendTo,
            users,
            title,
            description
        } = req.body;

        // Validate required fields
        if (!sendTo || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide sendTo, title and description"
            });
        }

        // Only User and Staff are allowed
        if (!["User", "Staff"].includes(sendTo)) {
            return res.status(400).json({
                success: false,
                message: "sendTo must be User or Staff"
            });
        }

        // Parse users input
        let userList = [];

        if (users === "All") {
            userList = "All";
        } else if (typeof users === "string") {
            try {
                const parsedUsers = JSON.parse(users);
                userList = Array.isArray(parsedUsers) ?
                    parsedUsers : [parsedUsers];
            } catch (error) {
                userList = [users];
            }
        } else if (Array.isArray(users)) {
            userList = users;
        } else if (users) {
            userList = [users];
        }

        // Validate selected recipients
        if (userList !== "All") {
            if (userList.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select at least one recipient or pass users as All"
                });
            }

            const invalidIds = userList.filter(
                id => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidIds.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid recipient ID provided"
                });
            }

            userList = [
                ...new Set(userList.map(id => id.toString()))
            ];
        }

        // Select model based on sendTo
        const recipientModel =
            sendTo === "User" ? userModel : AppStaff;

        // Validate recipients exist
        if (userList !== "All") {
            const existingRecipients = await recipientModel.find({
                _id: {
                    $in: userList.map(
                        id => new mongoose.Types.ObjectId(id)
                    )
                }
            }, {
                _id: 1
            }).lean();

            const existingIds = new Set(
                existingRecipients.map(item => item._id.toString())
            );

            const missingRecipients = userList.filter(
                id => !existingIds.has(id)
            );

            if (missingRecipients.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "One or more selected recipients were not found"
                });
            }
        }

        // Send notification
        await notificationUtil.createNotification({
            sendTo,
            userList,
            subject: title,
            description,
            adminId: req.userId
        });

        return res.status(200).json({
            success: true,
            message: "Notification sent successfully"
        });

    } catch (err) {
        console.log("Add Notification Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


// ============================================================
// GET ALL NOTIFICATIONS
// ============================================================

export const getAllNotifications = async function(req, res) {
    try {
        const condition = {
            adminId: new mongoose.Types.ObjectId(req.userId)
        };

        const searchQuery = req.query.searchQuery || "";

        if (searchQuery) {
            const regex = new RegExp(
                searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            condition.$or = [
                { title: regex },
                { sendTo: regex },
                { description: regex }
            ];
        }

        const notifications = await notificationModel
            .find(condition)
            .sort({
                logCreatedDate: -1
            });

        return res.status(200).json({
            success: true,
            message: "Successful",
            notifications
        });

    } catch (err) {
        console.log("Get All Notifications Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


// ============================================================
// DELETE NOTIFICATIONS
// ============================================================

export const deleteNotification = async function(req, res) {
    try {
        console.log("Delete Notification Request:", req.body);

        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide notification ids"
            });
        }

        const invalidIds = ids.filter(
            id => !mongoose.Types.ObjectId.isValid(id)
        );

        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID provided"
            });
        }

        const deleted = await notificationModel.deleteMany({
            _id: {
                $in: ids.map(id => new mongoose.Types.ObjectId(id))
            }
        });

        if (deleted.deletedCount > 0) {
            return res.status(200).json({
                success: true,
                message: "Notifications deleted successfully",
                deletedCount: deleted.deletedCount
            });
        }

        return res.status(404).json({
            success: false,
            message: "No notifications found to delete"
        });

    } catch (err) {
        console.log("Delete Notification Error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};