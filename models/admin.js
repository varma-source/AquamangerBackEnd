import mongoose from "mongoose";

const admin = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        index: true,
        unique: true,
    },

    password: {
        type: String,
        trim: true,
        required: true,
    },

    phone: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },

    address: {
        type: String,
        trim: true,
    },

    image: {
        type: String,
        trim: true,
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },

    rolesAndPermission: {
        type: Array,
    },

    wallet: {
        type: Number,
    },

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

const Admin = mongoose.model("admins", admin);

export default Admin;