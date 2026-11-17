import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({

    partyId: {
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
    purchaseDate: {
        type: String,
        trim: true,
    },

    medicineName: {
        type: String,
        trim: true,

    },
    brand: {
        type: String,
        trim: true,

    },
    quantityPurchased: {
        type: String,
        trim: true,
    },
    pricePerUnits: {
        type: String,
        trim: true,
    },
    totalAmount: {
        type: String,
        trim: true,
    },
    invoiceReference: {
        type: String,
        trim: true,
    },

    paidBy: {
        type: String,
        enum: ["cash", "banktransfer", "upi", "cheque"],
        default: "cash",
    },
    medicineType: {
        type: String,
        enum: ["litres", "units", "kgs", ],
        default: "kgs",
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

const Medicine = mongoose.model("medicines", medicineSchema);

export default Medicine;