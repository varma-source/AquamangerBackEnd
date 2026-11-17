import mongoose from "mongoose";

const medicineUsageSchema = new mongoose.Schema({


    staffId: {
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
    // status: {
    //     type: String,
    //     enum: ["active", "inactive"],
    //     default: "active",
    // },
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending",
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

const MedicineUsage = mongoose.model("staff_request_advances", medicineUsageSchema);

export default MedicineUsage;