import mongoose from "mongoose";

const harvest = new mongoose.Schema({

    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    date: {
        type: String,
        trim: true
    },
    harvestType: {
        type: String,
        enum: ["partial", "final"],
        default: "partial",
    },
    quantityHarvested: {
        type: String,
        trim: true

    },

    averageSizeAtHarvest: {
        type: String,
        trim: true

    },
    totalAmount: {
        type: String,
        trim: true

    },
    marketName: {
        type: String,
        trim: true

    },
    notes: {
        type: String,
        trim: true

    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

export default mongoose.model("harvests", harvest);