import mongoose from "mongoose";

const staff = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    // tankId: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    tankId: [{
        type: mongoose.Schema.Types.ObjectId,

    }],
    // farmId: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    name: {
        type: String,
        trim: true,
    },

    email: {
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

    joiningDate: {
        type: String,
        trim: true,
    },

    monthlySalary: {
        type: String,
        trim: true,
    },

    adharNumber: {
        type: String,
        trim: true,
    },

    advanceSalary: {
        type: String,
        trim: true,
    },
    advanceAlreadyGiven: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ["staff", "manager", "coowner"],
        default: "staff",
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "app_staffs",
        default: null
    },
    fcmToken: {
        type: String,
        trim: true
    },
    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
});

const Staff = mongoose.model("app_staffs", staff);

export default Staff;