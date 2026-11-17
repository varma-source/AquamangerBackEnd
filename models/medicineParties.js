import mongoose from "mongoose";

const party = new mongoose.Schema({
    date: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    amount: {
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

export default mongoose.model("medicine_parties", party);;