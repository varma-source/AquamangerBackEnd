import Notification from "../models/notification.js";
import User from "../models/user.js";
import AppStaff from "../models/appStaff.js";

import { DateTime } from "luxon";
import * as fcmFunction from "./fcmFunction.js";

export const createNotification = async function(params) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true
        });

        const time = istDateTime.toFormat("hh:mm a");

        let userIds = [];
        let fcmTokens = [];

        // =========================================================
        // USER
        // =========================================================

        if (params.sendTo === "User") {
            const userQuery = {
                status: "active",
                fcmToken: {
                    $exists: true,
                    $nin: [""]
                }
            };

            if (params.userList !== "All") {
                userQuery._id = {
                    $in: params.userList
                };
            }

            const userData = await User.find(userQuery, {
                _id: 1,
                fcmToken: 1
            });

            userData.forEach((item) => {
                userIds.push(item._id.toString());

                if (item.fcmToken) {
                    fcmTokens.push(item.fcmToken);
                }
            });
        }

        // =========================================================
        // STAFF
        // =========================================================
        else if (params.sendTo === "Staff") {
            const staffQuery = {
                status: "active",
                fcmToken: {
                    $exists: true,
                    $nin: [""]
                }
            };

            if (params.userList !== "All") {
                staffQuery._id = {
                    $in: params.userList
                };
            }

            const staffData = await AppStaff.find(staffQuery, {
                _id: 1,
                fcmToken: 1
            });

            staffData.forEach((item) => {
                userIds.push(item._id.toString());

                if (item.fcmToken) {
                    fcmTokens.push(item.fcmToken);
                }
            });
        } else {
            console.log(`Invalid notification target: ${params.sendTo}`);
            return;
        }

        console.log(`${params.sendTo} IDs:`, userIds);
        console.log(`${params.sendTo} FCM Tokens:`, fcmTokens);

        // =========================================================
        // SEND FCM NOTIFICATIONS
        // =========================================================

        for (const token of fcmTokens) {
            try {
                const accessToken = await fcmFunction.getAccessToken();

                const message = {
                    message: {
                        token: token,
                        notification: {
                            title: params.subject,
                            body: params.description
                        }
                    }
                };

                await fcmFunction.sendMessage(accessToken, message);

                console.log(`${params.sendTo} notification sent successfully`);
            } catch (error) {
                console.log(`${params.sendTo} FCM Error:`, error.message);
            }
        }

        // =========================================================
        // SAVE NOTIFICATION
        // =========================================================

        await Notification.create({
            sendTo: params.sendTo,
            users: userIds,
            isRead: false,
            adminId: params.adminId,
            title: params.subject,
            description: params.description,
            zoneId: params.zoneId || undefined,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
            date: logDate.slice(0, 10),
            time: time
        });

    } catch (error) {
        console.log("Create Notification Error:", error);
        throw error;
    }
};