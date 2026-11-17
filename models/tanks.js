import mongoose from "mongoose";

const tank = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    name: {
        type: String,
    },
    tankType: {
        type: String,
        enum: ["fish", "prawn"],
        default: "fish",
    },

    pondSize: {
        type: String,
    },

    address: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true,
            default: 'Polygon'
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
    // staffId: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },

    staffId: [{
        type: mongoose.Schema.Types.ObjectId,
    }],

    status: {
        type: String,
        enum: ["active", "inactive", "harvest"],
        default: "active",
    },

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

export default mongoose.model("tanks", tank);