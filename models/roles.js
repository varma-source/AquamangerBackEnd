import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        required: true,
    },
    rolesAndPermission: {
        type: Array,
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

const role = mongoose.model('roles', roleSchema);
export default role;