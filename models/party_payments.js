import mongoose, { mongo } from "mongoose";

const party = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: String,
        trim: true
    },

    amount: {
        type: String,
        trim: true
    },

    notes: {
        type: String,
        trim: true
    },
    paymentType: {
        type: String,
        trim: true,
        enum: ["advance", "payment", ],
        default: "payment",

    },
    paymentMethod: {
        type: String,
        trim: true,
        enum: ["cash", "banktransfer", "upi", "cheque"],
        default: "cheque",

    },
    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

export default mongoose.model("parties_payments", party);;