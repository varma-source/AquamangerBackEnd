import mongoose from "mongoose";

const faq = new mongoose.Schema({
    email: {
        type: String,
        trim: true

    },

    phone: {
        type: String,
        trim: true
    },

    logCreatedDate: {
        type: String,
        trim: true
    },

    logModifiedDate: {
        type: String,
        trim: true

    },
});

export default mongoose.model("aboutus", faq);