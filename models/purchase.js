import mongoose from "mongoose";

const purchase = new mongoose.Schema({

    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: String,
        trim: true
    },

    feedName: {
        type: String,
        trim: true

    },

    brand: {
        type: String,
        trim: true

    },
    quantityPurchased: {
        type: String,
        trim: true
    },
    pricePerKg: {
        type: String,
        trim: true
    },
    supplierName: {
        type: String,
        trim: true
    },
    invoiceReference: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        trim: true,
        enum: ["cash", "banktransfer", "upi", "credit"],
        default: "credit",

    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    totalAmount: {
        type: String,
        trim: true
    },
    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

export default mongoose.model("purchases", purchase);;