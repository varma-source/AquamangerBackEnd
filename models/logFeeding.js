import mongoose from "mongoose";

const logfeeding = new mongoose.Schema({

    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    speciesId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    date: {
        type: String,
        trim: true
    },

    kg: {
        type: String,
        trim: true

    },

    remarks: {
        type: String,
        trim: true

    },
    feedingType: {
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

export default mongoose.model("logfeedings", logfeeding);