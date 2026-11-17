import mongoose from "mongoose";

const party = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    name: {
        type: String,
    },

    phone: {
        type: String,
    },

    notes: {
        type: String,
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

export default mongoose.model("parties", party);;