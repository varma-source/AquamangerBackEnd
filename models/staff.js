import mongoose from "mongoose";

const staff = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    departmentName: {
        type: String,
        trim: true,
    },

    roleId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    roleName: {

        type: String,
        trim: true,
    },

    phone: {
        type: String,
        trim: true,
    },

    image: {
        type: String,
        trim: true,
    },

    password: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
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

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

const Staff = mongoose.model("staffs", staff);

export default Staff;