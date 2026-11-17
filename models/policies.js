import mongoose from "mongoose";


const category = new mongoose.Schema({
    termsAndCondition: {
        type: String,
        trim: true,
    },

    privacyPolicy: {
        type: String,
        trim: true,
    },

    aboutus: {
        type: String,
        trim: true,
    },

    logCreatedDate: {
        type: String,
        trim: true,
    },

    logModifiedDate: {
        type: String,
        trim: true,
    },
});

export default mongoose.model("policies", category);