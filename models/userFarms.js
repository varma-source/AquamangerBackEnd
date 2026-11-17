import mongoose from "mongoose";

const userFarmsSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: String,
            trim: true,
            required: true
        },

        farmName: {
            type: String,
            trim: true,
            required: true
        },

        farmLocation: {
            type: String,
            trim: true,
            default: ""
        },

        currency: {
            type: String,
            trim: true,
            default: "INR"
        },

        location: {
            type: {
                type: String,
                enum: ["Polygon"],
                required: true
            },
            coordinates: {
                type: [
                    [
                        [Number]
                    ]
                ],
                required: true
            }
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    }, {
        timestamps: true
    }

);

userFarmsSchema.index({ location: "2dsphere" });

const UserFarms = mongoose.model("user_farms", userFarmsSchema);

export default UserFarms;