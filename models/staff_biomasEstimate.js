import mongoose from "mongoose";

const biomassEstimates = new mongoose.Schema({

    staffId: {
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
    date: {
        type: String,
        trim: true,
    },

    estimaTedBiomassKg: {
        type: String,
        trim: true,

    },
    averageBodyWeight: {
        type: String,
        trim: true,

    },
    survival: {
        type: String,
        trim: true,
    },
    reamrks: {
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

const BiomassEstimates = mongoose.model("staff_biomass_Estimates", biomassEstimates);

export default BiomassEstimates;