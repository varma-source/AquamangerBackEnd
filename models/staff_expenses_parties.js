import mongoose from "mongoose";

const expensesPartiesSchema = new mongoose.Schema({
    date: {
        type: String
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense"
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party"
    },
    category: {
        type: String
    },
    amount: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    logCreatedDate: {
        type: String
    },
    logModifiedDate: {
        type: String
    }
});

export default mongoose.model("staff_expenses_parties", expensesPartiesSchema);