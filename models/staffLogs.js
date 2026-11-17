import mongoose from 'mongoose';

const superAdminSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    date: {
        type: String,
        trim: true
    },
    time: {
        type: String,
        trim: true
    },

    logCreatedDate: {
        type: String,
    },

    logModifiedDate: {
        type: String,
    },
}, );

export default mongoose.model('StaffLogs', superAdminSchema);