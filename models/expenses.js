import mongoose from "mongoose";

const { Schema, model } = mongoose;

const expenseSchema = new Schema({
        tankId: {
            type: Schema.Types.ObjectId,
        },

        createdBy: {
            type: Schema.Types.ObjectId,

        },
        farmId: {
            type: Schema.Types.ObjectId,

        },

        date: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Labour",
                "Salary",
                "Tiffins",
                "Petrol",
                "Diesel",
                "Electrical",
                "Plumbing",
                "Transport",
                "Utilities",
                "Other",
            ],
        },

        labour: {
            noofpersonsWorked: {
                type: String,
                trim: true,
            },
            chargesPerPerson: {
                type: String,
                trim: true,
            },
            Extras: {
                type: String,
                trim: true,
            },
            TotalLabourCost: {
                type: String,
                trim: true,
            },
            Notes: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            receiptImage: {
                type: String,
                default: "",
            },
        },

        Salary: {
            persons: [{
                staffId: {
                    type: Schema.Types.ObjectId,
                    ref: "Staff",
                },
                joiningDate: {
                    type: String,
                    trim: true,
                },
                salaryAmount: {
                    type: String,
                    trim: true,
                },
            }, ],
            TotalSalaries: {
                type: String,
                trim: true,
            },
            notes: {
                type: String,
                trim: true,
                default: "",
                maxlength: 1000,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        TiffinsMeals: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Petrol: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Diesel: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Electrical: {
            itemName: {
                type: String,
                trim: true,
            },
            unit: {
                type: String,
                enum: ["Kgs", "Meters", "Pieces"],
                trim: true,
            },
            Quantity: {
                type: Number,
                min: 0,
            },
            pricePerUnit: {
                type: Number,
                min: 0,
            },
            Total: {
                type: Number,
                min: 0,
            },
            Notes: {
                type: String,
                trim: true,
                maxlength: 1000,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Plumbing: {
            itemName: {
                type: String,
                trim: true,
            },
            quantity: {
                type: Number,
                min: 0,
            },
            pricePerQuantity: {
                type: Number,
                min: 0,
            },
            total: {
                type: Number,
                min: 0,
            },
            notes: {
                type: String,
                trim: true,
                default: "",
                maxlength: 1000,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Transport: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            Amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Utilities: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            Amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },

        Other: {
            description: {
                type: String,
                trim: true,
            },
            partyId: {
                type: Schema.Types.ObjectId,
                ref: "Party",
            },
            Amount: {
                type: Number,
                min: 0,
            },
            receiptImage: {
                type: String,
                trim: true,
                default: "",
            },
        },
    }, {
        timestamps: true,
    }


);

const Expense = model("Expense", expenseSchema);

export default Expense;