import mongoose from "mongoose";

const medicineUsageSchema = new mongoose.Schema({

    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: String,
        trim: true,
    },
    quanTityUsed: {
        type: String,
        trim: true,
    },


    notes: {
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

const MedicineUsage = mongoose.model("staff_medicine_usages", medicineUsageSchema);

export default MedicineUsage;