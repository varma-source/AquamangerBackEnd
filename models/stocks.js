import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({


    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: String,
        trim: true,
    },
    time: {
        type: String,
        trim: true,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    speciesName: {
        type: String,
        trim: true,

    },
    cropName: {
        type: String,
        trim: true,

    },
    quantityStocked: {
        type: String,
        trim: true,
    },
    averageWeightAtStocking: {
        type: String,
        trim: true,
    },
    stockingCostPerUnit: {
        type: String,
        trim: true,
    },

    supplier: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    totalAmount: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },

    logCreatedDate: {
        type: String,
        trim: true,

    },

    logModifiedDate: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

const Stock = mongoose.model("stocks", stockSchema);

export default Stock;