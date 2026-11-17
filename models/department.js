import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        required: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
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
}, );

const department = mongoose.model('departments', departmentSchema);
export default department;