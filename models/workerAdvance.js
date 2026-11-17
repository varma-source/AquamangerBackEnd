import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    workerId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: String,
        trim: true,
    },

    amount: {
        type: String,
        trim: true,

    },

    purpose: {
        type: String,
        trim: true,
    },

    paidBy: {
        type: String,
        enum: ["cash", "banktransfer", "upi", "cheque"],
        default: "cash",
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

const Worker = mongoose.model("worker_advance", workerSchema);

export default Worker;