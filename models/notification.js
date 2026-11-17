// export default Notification;
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    date: {
        type: String,
        trim: true,
    },

    time: {
        type: String,
        trim: true,
    },

    title: {
        type: String,
    },

    description: {
        type: String,
    },

    sendTo: {
        type: String,
        trim: true,
        enum: ["All", "User", "Staff"],
    },

    users: {
        type: Array,
        default: [],
    },

    isdeleted: {
        type: String,
        enum: ["No", "Yes"],
        default: "No",
    },

    seen: {
        type: Boolean,
        default: false,
    },

    adminId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    // Stock notification reference
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
    },

    // Medicine purchase reference
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
    },

    // Individual medicine usage event
    medicineUsageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicineUsage",
    },

    // Related tank
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tank",
    },
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase"
    },

    logFeedingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LogFeeding"
    },

    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tank"
    },
    staffExpenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StaffExpense"
    },

    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },

    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tank"
    },
    harvestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Harvest"
    },
    staffRequestAdvanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StaffRequestAdvance"
    },
    logCreatedDate: {
        type: String,
        trim: true,
    },

    logModifiedDate: {
        type: String,
        trim: true,
    },
});

// One stock-added notification per stock.
notificationSchema.index({
    stockId: 1,
    title: 1,
}, {
    unique: true,
    partialFilterExpression: {
        stockId: { $type: "objectId" },
        title: "Stock Added Successfully",
    },
    name: "unique_stock_added_notification",
});

// One low-medicine-stock notification per usage event.
notificationSchema.index({
    medicineUsageId: 1,
    title: 1,
}, {
    unique: true,
    partialFilterExpression: {
        medicineUsageId: { $type: "objectId" },
        title: "Low Medicine Stock",
    },
    name: "unique_low_stock_per_usage",
});

notificationSchema.index({ logFeedingId: 1, title: 1 }, {
    unique: true,
    partialFilterExpression: {
        logFeedingId: { $type: "objectId" },
        title: "Low Feed Stock"
    },
    name: "unique_low_feed_stock_per_logfeeding"
});

notificationSchema.index({ staffExpenseId: 1, title: 1 }, {
    unique: true,
    partialFilterExpression: {
        staffExpenseId: { $type: "objectId" },
        title: "New Staff Expense Submitted"
    },
    name: "unique_staff_expense_notification"
});

notificationSchema.index({ harvestId: 1, title: 1 }, {
    unique: true,
    partialFilterExpression: {
        harvestId: { $type: "objectId" },
        title: "Harvest Completed"
    },
    name: "unique_harvest_completed_notification"
});

notificationSchema.index({ staffRequestAdvanceId: 1, title: 1 }, {
    unique: true,
    partialFilterExpression: {
        staffRequestAdvanceId: { $type: "objectId" },
        title: "Staff Advance Requested"
    },
    name: "unique_staff_advance_notification"
});

const Notification = mongoose.model(
    "notifications",
    notificationSchema
);

export default Notification;