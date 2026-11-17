import mongoose from "mongoose";
import Expense from "../../models/staff_expenses.js";
import UserFarms from "../../models/userFarms.js";

// ============================================================
// COMMON FUNCTION TO SAVE EXPENSE
// ============================================================
const saveExpense = async(req, res, category, nestedKey, fields = {}) => {
    try {
        console.log("📥 Add Expense Request:", req.body);
        console.log("📷 Uploaded File:", req.file);

        const userId = req.userId;
        const staffId = req.staffId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required"
            });
        }

        const {
            tankId,
            date,
            partyId,
            farmId
        } = req.body || {};

        console.log("🏡 Farm ID:", farmId);
        console.log("🐟 Tank ID:", tankId);

        // Validate tankId
        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        // Validate partyId
        if (partyId && !mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partyId"
            });
        }

        // Validate farmId
        if (farmId && !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid farmId"
            });
        }

        // Check farm ownership
        if (farmId) {
            const farm = await UserFarms.findOne({
                _id: farmId,
                userId: userId
            });

            if (!farm) {
                return res.status(404).json({
                    success: false,
                    message: "Farm not found"
                });
            }
        }

        // Receipt image
        const receiptImage = req.file ?
            req.file.path.replace(/\\/g, "/") :
            "";

        // Prepare expense data
        const expenseData = {
            createdBy: new mongoose.Types.ObjectId(staffId),
            staffId: new mongoose.Types.ObjectId(staffId),

            ...(farmId && {
                farmId: new mongoose.Types.ObjectId(farmId)
            }),

            ...(tankId && {
                tankId: new mongoose.Types.ObjectId(tankId)
            }),

            ...(date && {
                date
            }),

            category,

            [nestedKey]: {
                ...fields,

                ...(partyId && {
                    partyId
                }),

                receiptImage
            }
        };

        console.log("💾 Expense Data:", expenseData);

        const expense = await Expense.create(expenseData);

        return res.status(201).json({
            success: true,
            message: "Expense added successfully",
            data: expense
        });

    } catch (error) {
        console.log("❌ Add Expense Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add expense",
            error: error.message
        });
    }
};

// // ============================================================
// // 1. ADD LABOUR EXPENSE
// // ============================================================

export const addLabourExpense = async(req, res) => {
    const {
        noofpersonsWorked,
        chargesPerPerson,
        Extras,
        TotalLabourCost,
        Notes
    } = req.body || {};

    return saveExpense(req, res, "Labour", "labour", {
        noofpersonsWorked: Number(noofpersonsWorked || 0),
        chargesPerPerson: Number(chargesPerPerson || 0),
        Extras: Number(Extras || 0),
        TotalLabourCost: Number(TotalLabourCost || 0),
        Notes: Notes || ""
    });
};

// ============================================================
// 2. ADD SALARY EXPENSE
// ============================================================
export const addSalaryExpense = async(req, res) => {
    console.log(req.body)
    const {
        persons,
        TotalSalaries,
        notes,
        partyId
    } = req.body || {};

    let parsedPersons = [];

    try {
        parsedPersons = typeof persons === "string" ?
            JSON.parse(persons || "[]") :
            persons || [];
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Invalid persons format"
        });
    }

    return saveExpense(req, res, "Salary", "Salary", {
        persons: parsedPersons,
        TotalSalaries: Number(TotalSalaries || 0),
        notes: notes || "",

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 3. ADD TIFFINS EXPENSE
// ============================================================
export const addTiffinsExpense = async(req, res) => {
    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Tiffins", "TiffinsMeals", {
        description: description || "",
        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 4. ADD PETROL EXPENSE
// ============================================================
export const addPetrolExpense = async(req, res) => {
    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Petrol", "Petrol", {
        description: description || "",
        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 5. ADD DIESEL EXPENSE
// ============================================================
export const addDieselExpense = async(req, res) => {
    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Diesel", "Diesel", {
        description: description || "",
        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 6. ADD ELECTRICAL EXPENSE
// ============================================================
export const addElectricalExpense = async(req, res) => {
    const {
        itemName,
        unit,
        Quantity,
        pricePerUnit,
        Total,
        Notes,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Electrical", "Electrical", {
        itemName: itemName || "",
        unit: unit || "Pieces",
        Quantity: Number(Quantity || 0),
        pricePerUnit: Number(pricePerUnit || 0),
        Total: Number(Total || 0),
        Notes: Notes || "",

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 7. ADD PLUMBING EXPENSE
// ============================================================
export const addPlumbingExpense = async(req, res) => {
    const {
        itemName,
        quantity,
        pricePerQuantity,
        total,
        notes,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Plumbing", "Plumbing", {
        itemName: itemName || "",
        quantity: Number(quantity || 0),
        pricePerQuantity: Number(pricePerQuantity || 0),
        total: Number(total || 0),
        notes: notes || "",

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 8. ADD TRANSPORT EXPENSE
// ============================================================
export const addTransportExpense = async(req, res) => {
    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Transport", "Transport", {
        description: description || "",
        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 9. ADD UTILITIES EXPENSE
// ============================================================
export const addUtilitiesExpense = async(req, res) => {
    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Utilities", "Utilities", {
        description: description || "",
        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

// ============================================================
// 10. ADD OTHER EXPENSE
// ============================================================
export const addOtherExpense = async(req, res) => {
    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Other", "Other", {
        description: description || "",
        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })
    });
};

/*
import mongoose from "mongoose";
import { DateTime } from "luxon";

import Expense from "../../models/staff_expenses.js";
import ExpensesParties from "../../models/staff_expenses_parties.js";
import UserFarms from "../../models/userFarms.js";

// ============================================================
// COMMON FUNCTION TO SAVE EXPENSE
// ============================================================

const saveExpense = async(req, res, category, nestedKey, fields = {}) => {
    try {
        console.log("📥 Add Expense Request:", req.body);
        console.log("📷 Uploaded File:", req.file);

        const userId = req.userId;
        const staffId = req.staffId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required"
            });
        }

        const {
            tankId,
            date,
            partyId,
            farmId
        } = req.body || {};

        console.log("🏡 Farm ID:", farmId);
        console.log("🐟 Tank ID:", tankId);

        // VALIDATE TANK ID
        // ==========================================

        if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tankId"
            });
        }

        // VALIDATE PARTY ID
        // ==========================================

        if (partyId && !mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partyId"
            });
        }

        // VALIDATE FARM ID
        // ==========================================

        if (farmId && !mongoose.Types.ObjectId.isValid(farmId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid farmId"
            });
        }

        // CHECK FARM OWNERSHIP
        // ==========================================

        if (farmId) {
            const farm = await UserFarms.findOne({
                _id: farmId,
                userId: userId
            });

            if (!farm) {
                return res.status(404).json({
                    success: false,
                    message: "Farm not found"
                });
            }
        }

        // RECEIPT IMAGE
        // ==========================================

        const receiptImage = req.file ?
            req.file.path.replace(/\\/g, "/") :
            "";

        // PREPARE EXPENSE DATA
        // ==========================================

        const expenseData = {
            userId: new mongoose.Types.ObjectId(userId),

            createdBy: new mongoose.Types.ObjectId(staffId),

            staffId: new mongoose.Types.ObjectId(staffId),

            ...(farmId && {
                farmId: new mongoose.Types.ObjectId(farmId)
            }),

            ...(tankId && {
                tankId: new mongoose.Types.ObjectId(tankId)
            }),

            ...(date && {
                date
            }),

            category,

            [nestedKey]: {
                ...fields,

                ...(partyId && {
                    partyId: new mongoose.Types.ObjectId(partyId)
                }),

                receiptImage
            }
        };

        console.log("💾 Expense Data:", expenseData);

        // SAVE EXPENSE
        // ==========================================

        const expense = await Expense.create(expenseData);

        // SAVE EXPENSE PARTY RECORD
        // ==========================================

        if (partyId) {

            const istDateTime = DateTime.now().setZone("Asia/Kolkata");

            const logDate = istDateTime.toISO({
                includeOffset: true
            });

            let amount = 0;

            // GET CATEGORY-WISE AMOUNT
            switch (category) {

                case "Labour":
                    amount = fields.TotalLabourCost || 0;
                    break;

                case "Salary":
                    amount = fields.TotalSalaries || 0;
                    break;

                case "Tiffins":
                case "Petrol":
                case "Diesel":
                    amount = fields.amount || 0;
                    break;

                case "Electrical":
                    amount = fields.Total || 0;
                    break;

                case "Plumbing":
                    amount = fields.total || 0;
                    break;

                case "Transport":
                case "Utilities":
                case "Other":
                    amount = fields.Amount || 0;
                    break;

                default:
                    amount = 0;
            }

            const expensePartyObj = new ExpensesParties({
                date: date || "",

                staffId: new mongoose.Types.ObjectId(staffId),

                userId: new mongoose.Types.ObjectId(userId),

                expenseId: expense._id,

                partyId: new mongoose.Types.ObjectId(partyId),

                category: category,

                amount: String(amount),

                status: "active",

                logCreatedDate: logDate,

                logModifiedDate: logDate
            });

            await expensePartyObj.save();
        }

        return res.status(201).json({
            success: true,
            message: "Expense added successfully",
            data: expense
        });

    } catch (error) {
        console.log("❌ Add Expense Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add expense",
            error: error.message
        });
    }
};


// ============================================================
// 1. ADD LABOUR EXPENSE
// ============================================================

export const addLabourExpense = async(req, res) => {

    const {
        noofpersonsWorked,
        chargesPerPerson,
        Extras,
        TotalLabourCost,
        Notes,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Labour", "labour", {

        noofpersonsWorked: Number(noofpersonsWorked || 0),

        chargesPerPerson: Number(chargesPerPerson || 0),

        Extras: Number(Extras || 0),

        TotalLabourCost: Number(TotalLabourCost || 0),

        Notes: Notes || "",

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 2. ADD SALARY EXPENSE
// ============================================================

export const addSalaryExpense = async(req, res) => {

    console.log(req.body);

    const {
        persons,
        TotalSalaries,
        notes,
        partyId
    } = req.body || {};

    let parsedPersons = [];

    try {

        parsedPersons = typeof persons === "string" ?
            JSON.parse(persons || "[]") :
            persons || [];

    } catch (error) {

        console.log(error);

        return res.status(400).json({
            success: false,
            message: "Invalid persons format"
        });
    }

    return saveExpense(req, res, "Salary", "Salary", {

        persons: parsedPersons,

        TotalSalaries: Number(TotalSalaries || 0),

        notes: notes || "",

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 3. ADD TIFFINS EXPENSE
// ============================================================

export const addTiffinsExpense = async(req, res) => {

    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Tiffins", "TiffinsMeals", {

        description: description || "",

        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 4. ADD PETROL EXPENSE
// ============================================================

export const addPetrolExpense = async(req, res) => {

    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Petrol", "Petrol", {

        description: description || "",

        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 5. ADD DIESEL EXPENSE
// ============================================================

export const addDieselExpense = async(req, res) => {

    const {
        description,
        amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Diesel", "Diesel", {

        description: description || "",

        amount: Number(amount || 0),

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 6. ADD ELECTRICAL EXPENSE
// ============================================================

export const addElectricalExpense = async(req, res) => {

    const {
        itemName,
        unit,
        Quantity,
        pricePerUnit,
        Total,
        Notes,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Electrical", "Electrical", {

        itemName: itemName || "",

        unit: unit || "Pieces",

        Quantity: Number(Quantity || 0),

        pricePerUnit: Number(pricePerUnit || 0),

        Total: Number(Total || 0),

        Notes: Notes || "",

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 7. ADD PLUMBING EXPENSE
// ============================================================

export const addPlumbingExpense = async(req, res) => {

    const {
        itemName,
        quantity,
        pricePerQuantity,
        total,
        notes,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Plumbing", "Plumbing", {

        itemName: itemName || "",

        quantity: Number(quantity || 0),

        pricePerQuantity: Number(pricePerQuantity || 0),

        total: Number(total || 0),

        notes: notes || "",

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 8. ADD TRANSPORT EXPENSE
// ============================================================

export const addTransportExpense = async(req, res) => {

    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Transport", "Transport", {

        description: description || "",

        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 9. ADD UTILITIES EXPENSE
// ============================================================

export const addUtilitiesExpense = async(req, res) => {

    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Utilities", "Utilities", {

        description: description || "",

        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })

    });
};


// ============================================================
// 10. ADD OTHER EXPENSE
// ============================================================

export const addOtherExpense = async(req, res) => {

    const {
        description,
        Amount,
        partyId
    } = req.body || {};

    return saveExpense(req, res, "Other", "Other", {

        description: description || "",

        Amount: Number(Amount || 0),

        ...(partyId && {
            partyId
        })

    });
};

*/

// ============================================================
// GET ALL EXPENSES
// ============================================================
export const getAllExpenses = async(req, res) => {
    try {
        console.log("📥 Get All Expenses Request:", req.body);

        const staffId = req.staffId;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required"
            });
        }

        const { tankId, farmId } = req.body || {};

        const matchCondition = {
            staffId: new mongoose.Types.ObjectId(staffId)
        };

        // Filter by tankId
        if (tankId) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid tankId is required"
                });
            }

            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        // Filter by farmId
        if (farmId) {
            if (!mongoose.Types.ObjectId.isValid(farmId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid farmId is required"
                });
            }

            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        console.log("🔍 Expense Match Condition:", matchCondition);

        const expenses = await Expense.aggregate([{
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "tanks",
                    localField: "tankId",
                    foreignField: "_id",
                    as: "tankDetails"
                }
            },
            {
                $unwind: {
                    path: "$tankDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    tankName: "$tankDetails.name"
                }
            },
            {
                $project: {
                    tankDetails: 0
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Expenses retrieved successfully",
            count: expenses.length,
            expenses: expenses
        });

    } catch (error) {
        console.log("❌ Get All Expenses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            expenses: []
        });
    }
};
// ============================================================
// DELETE EXPENSE
// ============================================================
export const deleteExpense = async(req, res) => {
    try {
        const { id } = req.params;

        const userId = req.userId;
        const staffId = req.staffId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid staffId is required"
            });
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid expense ID is required"
            });
        }

        const expense = await Expense.findOneAndDelete({
            _id: id,
            createdBy: new mongoose.Types.ObjectId(userId),
            staffId: new mongoose.Types.ObjectId(staffId)
        });

        if (!expense) {
            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
            data: expense
        });

    } catch (error) {
        console.log("Delete Expense Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete expense",
            error: error.message
        });
    }
};


export const getAllExpensesParties = async(req, res) => {
    try {
        const staffId = req.staffId;

        if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        const result = await ExpensesParties.aggregate([{
                $match: {
                    staffId: new mongoose.Types.ObjectId(staffId),
                }
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            {
                $unwind: {
                    path: "$partyDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "staff_expenses",
                    localField: "expenseId",
                    foreignField: "_id",
                    as: "expenseDetails"
                }
            },
            {
                $unwind: {
                    path: "$expenseDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    partyName: "$partyDetails.name",
                    expense: "$expenseDetails"
                }
            },
            {
                $project: {
                    partyDetails: 0,
                    expenseDetails: 0,
                    __v: 0
                }
            },
            {
                $sort: {
                    logCreatedDate: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Expenses parties fetched successfully",
            data: result
        });

    } catch (error) {
        console.log("Get Expenses Parties Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch expenses parties",
            error: error.message
        });
    }
};