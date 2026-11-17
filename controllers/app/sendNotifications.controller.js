import Stock from "../../models/stocks.js";
import Notification from "../../models/notification.js";
import Tank from "../../models/tanks.js";
import User from "../../models/user.js";
import { DateTime } from "luxon";

import {
    getAccessToken,
    sendMessage
} from "../../utils/fcmFunction.js";

//notification to sens rhe tank reached and day of culture
export const checkCultivationNotifications = async() => {
    const runStartedAt = Date.now();

    console.log("[STOCK CRON] Controller started");

    try {
        const stocks = await Stock.find({
            status: "active"
        }).lean();

        console.log(
            "[STOCK CRON] Active stock count:",
            stocks.length
        );

        if (stocks.length === 0) {
            console.log("[STOCK CRON] No active stocks found");
            return;
        }

        for (const stock of stocks) {
            try {
                console.log("\n[STOCK CRON] ------------------------------");
                console.log("[STOCK CRON] Stock ID:", String(stock._id));
                console.log("[STOCK CRON] Stock date:", stock.date);
                console.log("[STOCK CRON] Stock time:", stock.time);

                // Validate required fields.
                if (!stock._id ||
                    !stock.userId ||
                    !stock.tankId ||
                    !stock.date ||
                    !stock.time
                ) {
                    console.log(
                        "[STOCK CRON] SKIPPED: Required stock field is missing"
                    );
                    continue;
                }

                // Parse the stock date and time in IST.
                const stockDateTime = DateTime.fromFormat(
                    stock.date + " " + stock.time,
                    "yyyy-MM-dd hh:mm a", {
                        zone: "Asia/Kolkata",
                    }
                );

                if (!stockDateTime.isValid) {
                    console.error(
                        "[STOCK CRON] INVALID DATE/TIME:",
                        stock.date,
                        stock.time,
                        stockDateTime.invalidExplanation
                    );
                    continue;
                }

                const now = DateTime.now().setZone("Asia/Kolkata");

                const elapsedMilliseconds =
                    now.toMillis() - stockDateTime.toMillis();

                const eligibleAt = stockDateTime.plus({
                    minutes: 1,
                });

                console.log(
                    "[STOCK CRON] Stock created time:",
                    stockDateTime.toFormat("yyyy-MM-dd hh:mm:ss a")
                );

                console.log(
                    "[STOCK CRON] Eligible at:",
                    eligibleAt.toFormat("yyyy-MM-dd hh:mm:ss a")
                );

                console.log(
                    "[STOCK CRON] Current IST:",
                    now.toFormat("yyyy-MM-dd hh:mm:ss.SSS a")
                );

                console.log(
                    "[STOCK CRON] Elapsed milliseconds:",
                    elapsedMilliseconds
                );

                // Wait until at least one minute has elapsed.
                if (elapsedMilliseconds < 60000) {
                    console.log(
                        "[STOCK CRON] SKIPPED: One minute has not elapsed"
                    );
                    continue;
                }

                // Check whether this stock already has a notification.
                const existingNotification = await Notification.findOne({
                        stockId: stock._id,
                        title: "Stock Added Successfully",
                    })
                    .select("_id")
                    .lean();

                if (existingNotification) {
                    console.log(
                        "[STOCK CRON] SKIPPED: Notification already exists:",
                        String(existingNotification._id)
                    );
                    continue;
                }

                // Get tank details.
                const tank = await Tank.findById(stock.tankId)
                    .select("name tankName")
                    .lean();

                const tankName =
                    (tank && (tank.tankName || tank.name)) ||
                    "Your tank";

                const title = "Stock Added Successfully";

                const description =
                    "New stock added to " + tankName + ".";

                const notificationTime =
                    DateTime.now().setZone("Asia/Kolkata");

                const logDate = notificationTime.toISO({
                    includeOffset: true,
                });

                // Insert notification.
                // The unique MongoDB index prevents concurrent duplicates.
                let notification;

                try {
                    notification = await Notification.create({
                        stockId: stock._id,
                        date: notificationTime.toISODate(),
                        time: notificationTime.toFormat("hh:mm a"),
                        title,
                        description,
                        sendTo: "User",
                        users: [stock.userId],
                        isdeleted: "No",
                        seen: false,
                        logCreatedDate: logDate,
                        logModifiedDate: logDate,
                    });
                } catch (insertError) {
                    // Another cron execution may have inserted it first.
                    if (insertError.code === 11000) {
                        console.log(
                            "[STOCK CRON] SKIPPED: Duplicate notification prevented for stock:",
                            String(stock._id)
                        );
                        continue;
                    }

                    throw insertError;
                }

                console.log(
                    "[STOCK CRON] NOTIFICATION CREATED:",
                    String(notification._id)
                );

                console.log(
                    "[STOCK CRON] Linked stock ID:",
                    String(notification.stockId)
                );

                // Send FCM only after a new notification is created.
                const user = await User.findOne({
                        _id: stock.userId,
                        status: "active",
                        fcmToken: {
                            $exists: true,
                            $nin: ["", null],
                        },
                    })
                    .select("_id fcmToken")
                    .lean();

                if (!user || !user.fcmToken) {
                    console.log(
                        "[STOCK CRON] No FCM token for user:",
                        String(stock.userId)
                    );
                    continue;
                }

                try {
                    console.log(
                        "[STOCK CRON] Requesting FCM access token"
                    );

                    const accessToken = await getAccessToken();

                    await sendMessage(accessToken, {
                        message: {
                            token: user.fcmToken,
                            notification: {
                                title,
                                body: description,
                            },
                            data: {
                                type: "stock_added",
                                stockId: String(stock._id),
                            },
                        },
                    });

                    console.log(
                        "[STOCK CRON] FCM PUSH SENT:",
                        String(stock._id)
                    );
                } catch (fcmError) {
                    console.error(
                        "[STOCK CRON] FCM FAILED:",
                        fcmError.stack || fcmError.message
                    );
                }
            } catch (stockError) {
                console.error(
                    "[STOCK CRON] STOCK PROCESSING FAILED:",
                    String(stock._id),
                    stockError.stack || stockError.message
                );
            }
        }
    } catch (error) {
        console.error(
            "[STOCK CRON] CONTROLLER FAILED:",
            error.stack || error.message
        );
    } finally {
        console.log(
            "[STOCK CRON] Controller finished in",
            Date.now() - runStartedAt,
            "ms"
        );
    }
};

//--------------- LOW MEDICINE STOCK --------------------------//
import Medicine from "../../models/medicines.js";
import MedicineUsage from "../../models/medicineUsage.js";


export const checkLowMedicineStockNotifications = async() => {
    const runStartedAt = Date.now();

    console.log("[MEDICINE CRON] Controller started");

    try {
        // Fetch all active medicine purchase records.
        const medicines = await Medicine.find({
            status: "active",
        }).lean();

        console.log(
            "[MEDICINE CRON] Active medicines:",
            medicines.length
        );

        for (const medicine of medicines) {
            try {
                if (!medicine._id ||
                    !medicine.userId ||
                    !medicine.tankId ||
                    !medicine.farmId
                ) {
                    console.log(
                        "[MEDICINE CRON] Skipped: Required fields missing:",
                        String(medicine._id || "")
                    );
                    continue;
                }

                // Purchased quantity is stored as a string in your example.
                const purchasedQuantity = Number(
                    medicine.quantityPurchased
                );

                if (!Number.isFinite(purchasedQuantity) ||
                    purchasedQuantity < 0
                ) {
                    console.log(
                        "[MEDICINE CRON] Invalid purchased quantity:",
                        String(medicine._id)
                    );
                    continue;
                }

                // Fetch usage records for this specific medicine purchase,
                // tank, farm and user.
                const usageRecords = await MedicineUsage.find({
                        medicineId: medicine._id,
                        tankId: medicine.tankId,
                        farmId: medicine.farmId,
                        userId: medicine.userId,
                        status: "active",
                    })
                    .sort({
                        createdAt: 1,
                        _id: 1,
                    })
                    .lean();

                // Calculate the running balance after each usage event.
                let totalQuantityUsed = 0;

                const tank = await Tank.findById(medicine.tankId)
                    .select("name tankName")
                    .lean();

                const tankName =
                    (tank && (tank.tankName || tank.name)) ||
                    "your tank";

                const medicineName =
                    medicine.medicineName || "Medicine";

                const unit = medicine.medicineType || "units";

                for (const usage of usageRecords) {
                    const usedQuantity = Number(
                        usage.quanTityUsed
                    );

                    if (!Number.isFinite(usedQuantity) ||
                        usedQuantity < 0
                    ) {
                        console.log(
                            "[MEDICINE CRON] Invalid usage quantity:",
                            String(usage._id)
                        );
                        continue;
                    }

                    totalQuantityUsed += usedQuantity;

                    const remainingQuantity =
                        purchasedQuantity - totalQuantityUsed;

                    console.log(
                        "[MEDICINE CRON] Medicine:",
                        medicineName,
                        "| Usage ID:",
                        String(usage._id),
                        "| Purchased:",
                        purchasedQuantity,
                        "| Total used:",
                        totalQuantityUsed,
                        "| Remaining:",
                        remainingQuantity
                    );

                    // Create notifications only when the balance is below 50.
                    if (remainingQuantity >= 50) {
                        continue;
                    }

                    // Check whether this particular usage event was notified.
                    const existingNotification =
                        await Notification.findOne({
                            medicineUsageId: usage._id,
                            title: "Low Medicine Stock",
                        })
                        .select("_id")
                        .lean();

                    if (existingNotification) {
                        console.log(
                            "[MEDICINE CRON] Notification already exists for usage:",
                            String(usage._id)
                        );
                        continue;
                    }

                    const title = "Low Medicine Stock";

                    const description =
                        "Low medicine stock for " +
                        medicineName +
                        " in tank " +
                        tankName +
                        ". Only " +
                        remainingQuantity +
                        " " +
                        unit +
                        " remaining. Please restock soon.";

                    const now = DateTime.now().setZone(
                        "Asia/Kolkata"
                    );

                    const logDate = now.toISO({
                        includeOffset: true,
                    });

                    // The unique index prevents duplicate notifications
                    // if two cron executions process the same usage event.
                    try {
                        const notification =
                            await Notification.create({
                                medicineId: medicine._id,
                                medicineUsageId: usage._id,
                                tankId: medicine.tankId,
                                date: now.toISODate(),
                                time: now.toFormat("hh:mm a"),
                                title,
                                description,
                                sendTo: "User",
                                users: [medicine.userId],
                                isdeleted: "No",
                                seen: false,
                                logCreatedDate: logDate,
                                logModifiedDate: logDate,
                            });

                        console.log(
                            "[MEDICINE CRON] Notification created:",
                            String(notification._id),
                            "| Usage:",
                            String(usage._id),
                            "| Remaining:",
                            remainingQuantity
                        );
                    } catch (insertError) {
                        if (insertError.code === 11000) {
                            console.log(
                                "[MEDICINE CRON] Duplicate notification prevented:",
                                String(usage._id)
                            );
                            continue;
                        }

                        throw insertError;
                    }
                }
            } catch (medicineError) {
                console.error(
                    "[MEDICINE CRON] Medicine processing failed:",
                    String(medicine._id),
                    medicineError.stack || medicineError.message
                );
            }
        }
    } catch (error) {
        console.error(
            "[MEDICINE CRON] Controller failed:",
            error.stack || error.message
        );
    } finally {
        console.log(
            "[MEDICINE CRON] Controller finished in",
            Date.now() - runStartedAt,
            "ms"
        );
    }
};

//-------------- LOW FEED STOCK -------------------//


import Purchase from "../../models/purchase.js";
import LogFeeding from "../../models/logFeeding.js";


export const checkLowFeedStockNotifications = async() => {
    try {
        const purchases = await Purchase.find({
            status: "active"
        }).lean();

        for (const purchase of purchases) {
            const purchasedQuantity = Number(purchase.quantityPurchased) || 0;

            const logFeedings = await LogFeeding.find({
                purchaseId: purchase._id,
                status: "active"
            }).sort({
                logCreatedDate: 1,
                _id: 1
            }).lean();

            let totalUsed = 0;

            const tank = await Tank.findById(purchase.tankId)
                .select("name tankName")
                .lean();

            // const tankName = tank ? .name || tank ? .tankName || "Unknown Tank";
            const tankName =
                (tank && (tank.tankName || tank.name)) ||
                "your tank";

            for (const feeding of logFeedings) {
                totalUsed += Number(feeding.kg) || 0;

                const remainingQuantity = purchasedQuantity - totalUsed;

                // Notify only when the remaining quantity is below 50 kg.
                if (remainingQuantity >= 50) {
                    continue;
                }

                // Prevent duplicate notifications for the same logfeeding entry.
                const existingNotification = await Notification.findOne({
                    logFeedingId: feeding._id,
                    title: "Low Feed Stock"
                }).lean();

                if (existingNotification) {
                    continue;
                }

                const now = DateTime.now().setZone("Asia/Kolkata");

                const notificationData = {
                    date: now.toFormat("yyyy-MM-dd"),
                    time: now.toFormat("hh:mm a"),
                    title: "Low Feed Stock",
                    description: `Low feed stock for ${purchase.feedName} in tank ${tankName}. Only ${remainingQuantity} kg remaining. Please restock soon.`,
                    sendTo: "User",
                    users: [purchase.userId],
                    isdeleted: "No",
                    seen: false,
                    purchaseId: purchase._id,
                    logFeedingId: feeding._id,
                    tankId: purchase.tankId,
                    logCreatedDate: now.toISO(),
                    logModifiedDate: now.toISO()
                };

                try {
                    await Notification.create(notificationData);

                    console.log(
                        `[LOW FEED STOCK] ${purchase.feedName}: ${remainingQuantity} kg remaining`
                    );
                } catch (error) {
                    // Another cron run may have created this notification first.
                    if (error.code !== 11000) {
                        console.error(
                            "Low feed stock notification error:",
                            error
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Check low feed stock notifications error:", error);
    }
};


//-----------------    EXPENSES SUBMITED ------------------------//
import StaffExpense from "../../models/staff_expenses.js";
import Staff from "../../models/appStaff.js";

export const checkStaffExpenseNotifications = async() => {
    try {
        const expenses = await StaffExpense.find({
            status: "pending"
        }).lean();

        for (const expense of expenses) {
            // Get the staff member who submitted the expense.
            const staff = await Staff.findOne({
                _id: expense.staffId,
                status: "active"
            }).lean();

            if (!staff || !staff.userId) {
                console.log("Staff or staff userId not found:", expense.staffId);
                continue;
            }

            // Get the tank name.
            const tank = await Tank.findById(expense.tankId)
                .select("name tankName")
                .lean();

            const tankName =
                (tank && (tank.tankName || tank.name)) ||
                "your tank";
            const staffName = staff.name || "Staff";

            // Prevent duplicate notifications for the same expense.
            const existingNotification = await Notification.findOne({
                staffExpenseId: expense._id,
                title: "New Staff Expense Submitted"
            }).lean();

            if (existingNotification) {
                continue;
            }

            const now = DateTime.now().setZone("Asia/Kolkata");

            const notificationData = {
                date: now.toFormat("yyyy-MM-dd"),
                time: now.toFormat("hh:mm a"),
                title: "New Staff Expense Submitted",
                description: `New expense submitted by ${staffName} for ${tankName}.`,
                sendTo: "User",
                users: [staff.userId],
                staffExpenseId: expense._id,
                staffId: staff._id,
                tankId: expense.tankId,
                isdeleted: "No",
                seen: false,
                logCreatedDate: now.toISO(),
                logModifiedDate: now.toISO()
            };

            try {
                await Notification.create(notificationData);

                console.log(
                    `Staff expense notification created for ${staffName}, tank ${tankName}`
                );
            } catch (error) {
                // Ignore duplicate-key errors caused by concurrent cron runs.
                if (error.code !== 11000) {
                    console.error("Staff expense notification error:", error);
                }
            }
        }
    } catch (error) {
        console.error("Check staff expense notifications error:", error);
    }

};


//------------------------- HARVEST -------------------------------//
import Harvest from "../../models/harvest.js";


export const checkHarvestNotifications = async() => {
    try {
        const harvests = await Harvest.find({
                harvestType: "final",
                status: "active"
            })
            .sort({ logCreatedDate: -1 })
            .lean();

        for (const harvest of harvests) {
            // Find the tank name.
            const tank = await Tank.findById(harvest.tankId)
                .select("name tankName")
                .lean();

            const tankName =
                (tank && (tank.tankName || tank.name)) ||
                "your tank";

            // Prevent duplicate notifications for the same harvest.
            const existingNotification = await Notification.findOne({
                harvestId: harvest._id,
                title: "Harvest Completed"
            }).lean();

            if (existingNotification) {
                continue;
            }

            const now = DateTime.now().setZone("Asia/Kolkata");

            const notificationData = {
                date: now.toFormat("yyyy-MM-dd"),
                time: now.toFormat("hh:mm a"),
                title: "Harvest Completed",
                description: `Harvest completed for ${tankName}.`,
                sendTo: "User",
                users: [harvest.userId],
                harvestId: harvest._id,
                tankId: harvest.tankId,
                isdeleted: "No",
                seen: false,
                logCreatedDate: now.toISO(),
                logModifiedDate: now.toISO()
            };

            try {
                await Notification.create(notificationData);

                console.log(
                    `Harvest notification created for ${tankName}`
                );
            } catch (error) {
                if (error.code !== 11000) {
                    console.error(
                        "Harvest notification creation error:",
                        error
                    );
                }
            }
        }
    } catch (error) {
        console.error("Check harvest notifications error:", error);
    }
};


//--------------- REQUEST ADVANCE ---------------//
import StaffRequestAdvance from "../../models/staff_request_advance.js";



export const checkStaffAdvanceNotifications = async() => {
    try {
        const advances = await StaffRequestAdvance.find({
                status: "active"
            })
            .lean();

        for (const advance of advances) {
            // Find the staff member.
            const staff = await Staff.findById(advance.staffId).lean();

            if (!staff || !staff.userId) {
                console.log("Staff or userId not found:", advance.staffId);
                continue;
            }

            // Prevent duplicate notifications for the same advance request.
            const existingNotification = await Notification.findOne({
                staffRequestAdvanceId: advance._id,
                title: "Staff Advance Requested"
            }).lean();

            if (existingNotification) {
                continue;
            }

            const now = DateTime.now().setZone("Asia/Kolkata");
            const staffName = staff.name || "Staff";

            const notificationData = {
                date: now.toFormat("yyyy-MM-dd"),
                time: now.toFormat("hh:mm a"),
                title: "Staff Advance Requested",
                description: `Request Advance ₹${advance.amount} from ${staffName}.`,
                sendTo: "User",
                users: [staff.userId],
                staffRequestAdvanceId: advance._id,
                staffId: staff._id,
                isdeleted: "No",
                seen: false,
                logCreatedDate: now.toISO(),
                logModifiedDate: now.toISO()
            };

            try {
                await Notification.create(notificationData);

                console.log(
                    `Advance notification created for ${staffName}`
                );
            } catch (error) {
                if (error.code !== 11000) {
                    console.error(
                        "Staff advance notification error:",
                        error
                    );
                }
            }
        }
    } catch (error) {
        console.error(
            "Check staff advance notifications error:",
            error
        );
    }
};