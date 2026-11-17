import mongoose from "mongoose";

const otp = new mongoose.Schema(
    {
        otp: {
            type: String,
        },

        emailId: {
            type: String,
            default: "",
        },

        phone: {
            type: String,
            default: "",
        },

        countryCode: {
            type: String,
            default: "",
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        rideId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        expireAt: {
            type: Date,
            default: Date.now,
            index: {
                expireAfterSeconds: 600,
            },
        },

        logCreatedDate: {
            type: String,
        },

        logModifiedDate: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Otp = mongoose.model("otps", otp);

export default Otp;