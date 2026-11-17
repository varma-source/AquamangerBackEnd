// importing models
import User from "../../models/user.js";
import Notification from "../../models/notification.js";
import mongoose from "mongoose";
// Get all notifications by userId
export const getAllNotificationbyUserId = async function(req, res) {
    try {
        console.log("req.userId:", req.userId);

        if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid or missing userId"
            });
        }

        const userId = new mongoose.Types.ObjectId(req.userId);

        // Get notifications for this user.
        const notifResult = await Notification.find({
            users: userId,
            isdeleted: "No"
        }, {
            users: 0
        }).sort({
            logCreatedDate: -1
        }).lean();

        // Mark these user's notifications as seen.
        await Notification.updateMany({
            users: userId,
            // isdeleted: "No",
            seen: false
        }, {
            $set: {
                seen: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            notifResult
        });

    } catch (err) {
        console.log("Get notifications error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: err.message
        });
    }

};
// delete notification
export const deleteNotification = async function(req, res) {
    try {
        const userId = req.userId;

        const notifyResult = await Notification.findOne({
            _id: req.body._id,
        });

        if (!notifyResult) {
            return res.status(400).json({
                success: false,
                message: "Notification not found"
            });
        }

        let array = notifyResult.users;

        const index = array.findIndex(
            (user) => user.toString() === userId.toString()
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "User not found in the notification",
            });
        }

        // Splice array only when the user is found
        array.splice(index, 1);

        const notificationResult = await Notification.findOneAndUpdate({ _id: req.body._id }, { users: array }, { new: true });

        if (!notificationResult) {
            return res.status(400).json({
                success: false,
                message: "Bad request"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Something went wrong"
        });
    }
};