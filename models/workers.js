import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },

    phone: {
        type: String,
        trim: true,
    },

    joiningDate: {
        type: String,
        trim: true,
    },

    monthlySalary: {
        type: String,
        trim: true,
    },

    aadhaarNumber: {
        type: String,
        trim: true,
    },

    advanceAlreadyGiven: {
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

const Worker = mongoose.model("workers", workerSchema);

export default Worker;