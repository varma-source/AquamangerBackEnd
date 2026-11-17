import mongoose from "mongoose";

const specie = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    speciesName: {
        type: String,
    },

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

export default mongoose.model("species", specie);