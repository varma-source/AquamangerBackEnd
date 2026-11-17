import mongoose from "mongoose";

const faq = new mongoose.Schema({
    question: {
        type: String,
    },

    answer: {
        type: String,
    },

    priority: {
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

export default mongoose.model("faqs", faq);