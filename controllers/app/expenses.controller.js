import mongoose from "mongoose";
import Expense from "../../models/expenses.js";
import UserFarms from "../../models/userFarms.js";
import ExpensesParties from "../../models/expensesParties.js";
import { DateTime } from "luxon";
import StaffExpense from "../../models/staff_expenses.js"

// // ============================================================
// // COMMON FUNCTION TO SAVE EXPENSE
// // ============================================================
// const saveExpense = async(req, res, category, nestedKey, fields = {}) => {
//     try {
//         console.log("📥 Add Expense Request:", req.body);
//         console.log("📷 Uploaded File:", req.file);

//         const userId = req.userId;

//         if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid userId is required"
//             });
//         }

//         const {
//             tankId,
//             date,
//             partyId,
//             farmId
//         } = req.body || {};

//         console.log("🏡 Farm ID:", farmId);
//         console.log("🐟 Tank ID:", tankId);

//         // Validate tankId
//         if (tankId && !mongoose.Types.ObjectId.isValid(tankId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid tankId"
//             });
//         }

//         // Validate partyId
//         if (partyId && !mongoose.Types.ObjectId.isValid(partyId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid partyId"
//             });
//         }

//         // Validate farmId
//         if (farmId && !mongoose.Types.ObjectId.isValid(farmId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid farmId"
//             });
//         }

//         // Check farm ownership
//         if (farmId) {
//             const farm = await UserFarms.findOne({
//                 _id: farmId,
//                 userId: userId
//             });

//             if (!farm) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Farm not found"
//                 });
//             }
//         }

//         // Receipt image
//         const receiptImage = req.file ?
//             req.file.path.replace(/\\/g, "/") :
//             "";

//         // Prepare expense data
//         const expenseData = {
//             createdBy: userId,
//             ...(farmId && {
//                 farmId: new mongoose.Types.ObjectId(farmId)
//             }),
//             ...(tankId && {
//                 tankId: new mongoose.Types.ObjectId(tankId)
//             }),
//             ...(date && {
//                 date
//             }),
//             category,
//             [nestedKey]: {
//                 ...fields,
//                 ...(partyId && {
//                     partyId
//                 }),
//                 receiptImage
//             }
//         };

//         console.log("💾 Expense Data:", expenseData);

//         const expense = await Expense.create(expenseData);

//         return res.status(201).json({
//             success: true,
//             message: "Expense added successfully",
//             data: expense
//         });

//     } catch (error) {
//         console.log("❌ Add Expense Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to add expense",
//             error: error.message
//         });
//     }
// };


// // ============================================================
// // 1. ADD LABOUR EXPENSE
// // ============================================================
// export const addLabourExpense = async(req, res) => {
//     const {
//         noofpersonsWorked,
//         chargesPerPerson,
//         Extras,
//         TotalLabourCost,
//         Notes,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Labour", "labour", {
//         noofpersonsWorked: Number(noofpersonsWorked || 0),
//         chargesPerPerson: Number(chargesPerPerson || 0),
//         Extras: Number(Extras || 0),
//         TotalLabourCost: Number(TotalLabourCost || 0),
//         Notes: Notes || "",
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 2. ADD SALARY EXPENSE
// // ============================================================
// export const addSalaryExpense = async(req, res) => {
//     const {
//         persons,
//         TotalSalaries,
//         notes,
//         partyId
//     } = req.body || {};

//     let parsedPersons = [];

//     try {
//         parsedPersons = typeof persons === "string" ?
//             JSON.parse(persons || "[]") :
//             persons || [];
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid persons format"
//         });
//     }

//     return saveExpense(req, res, "Salary", "Salary", {
//         persons: parsedPersons,
//         TotalSalaries: Number(TotalSalaries || 0),
//         notes: notes || "",
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 3. ADD TIFFINS EXPENSE
// // ============================================================
// export const addTiffinsExpense = async(req, res) => {
//     const {
//         description,
//         amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Tiffins", "TiffinsMeals", {
//         description: description || "",
//         amount: Number(amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 4. ADD PETROL EXPENSE
// // ============================================================
// export const addPetrolExpense = async(req, res) => {
//     const {
//         description,
//         amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Petrol", "Petrol", {
//         description: description || "",
//         amount: Number(amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 5. ADD DIESEL EXPENSE
// // ============================================================
// export const addDieselExpense = async(req, res) => {
//     const {
//         description,
//         amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Diesel", "Diesel", {
//         description: description || "",
//         amount: Number(amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 6. ADD ELECTRICAL EXPENSE
// // ============================================================
// export const addElectricalExpense = async(req, res) => {
//     const {
//         itemName,
//         unit,
//         Quantity,
//         pricePerUnit,
//         Total,
//         Notes,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Electrical", "Electrical", {
//         itemName: itemName || "",
//         unit: unit || "Pieces",
//         Quantity: Number(Quantity || 0),
//         pricePerUnit: Number(pricePerUnit || 0),
//         Total: Number(Total || 0),
//         Notes: Notes || "",
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 7. ADD PLUMBING EXPENSE
// // ============================================================
// export const addPlumbingExpense = async(req, res) => {
//     const {
//         itemName,
//         quantity,
//         pricePerQuantity,
//         total,
//         notes,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Plumbing", "Plumbing", {
//         itemName: itemName || "",
//         quantity: Number(quantity || 0),
//         pricePerQuantity: Number(pricePerQuantity || 0),
//         total: Number(total || 0),
//         notes: notes || "",
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 8. ADD TRANSPORT EXPENSE
// // ============================================================
// export const addTransportExpense = async(req, res) => {
//     const {
//         description,
//         Amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Transport", "Transport", {
//         description: description || "",
//         Amount: Number(Amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 9. ADD UTILITIES EXPENSE
// // ============================================================
// export const addUtilitiesExpense = async(req, res) => {
//     const {
//         description,
//         Amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Utilities", "Utilities", {
//         description: description || "",
//         Amount: Number(Amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// // ============================================================
// // 10. ADD OTHER EXPENSE
// // ============================================================
// export const addOtherExpense = async(req, res) => {
//     const {
//         description,
//         Amount,
//         partyId
//     } = req.body || {};

//     return saveExpense(req, res, "Other", "Other", {
//         description: description || "",
//         Amount: Number(Amount || 0),
//         ...(partyId && {
//             partyId
//         })
//     });
// };


// ============================================================
// COMMON FUNCTION TO SAVE EXPENSE
// ============================================================
const saveExpense = async(req, res, category, nestedKey, fields = {}) => {
    try {
        console.log("Add Expense Request:", req.body);
        console.log("Uploaded File:", req.file);

        const userId = req.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        const {
            tankId,
            date,
            partyId,
            farmId
        } = req.body || {};

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
            createdBy: userId,
            ...(farmId && {
                farmId: new mongoose.Types.ObjectId(farmId)
            }),
            ...(tankId && {
                tankId: new mongoose.Types.ObjectId(tankId)
            }),
            ...(date && { date }),
            category,
            [nestedKey]: {
                ...fields,
                ...(partyId && {
                    partyId: new mongoose.Types.ObjectId(partyId)
                }),
                receiptImage
            }
        };

        console.log("Expense Data:", expenseData);

        // Save expense
        const expense = await Expense.create(expenseData);

        // Save expense-party record only when partyId is provided
        if (partyId) {
            const istDateTime = DateTime.now().setZone("Asia/Kolkata");
            const logDate = istDateTime.toISO({
                includeOffset: true
            });

            let amount = 0;

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
        console.log("Add Expense Error:", error);

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
        noofpersonsWorked: String(noofpersonsWorked || 0),
        chargesPerPerson: String(chargesPerPerson || 0),
        Extras: String(Extras || 0),
        TotalLabourCost: String(TotalLabourCost || 0),
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
        return res.status(400).json({
            success: false,
            message: "Invalid persons format"
        });
    }

    return saveExpense(req, res, "Salary", "Salary", {
        persons: parsedPersons,
        TotalSalaries: String(TotalSalaries || 0),
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
// Get all expenses
// export const getAllExpenses = async(req, res) => {
//     try {
//         console.log("📥 Get All Expenses Request:", req.body);

//         const userId = req.userId;

//         if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid userId is required"
//             });
//         }

//         const { tankId, farmId } = req.body || {};

//         const matchCondition = {
//             createdBy: new mongoose.Types.ObjectId(userId)
//         };

//         // Filter by tankId
//         if (tankId) {
//             if (!mongoose.Types.ObjectId.isValid(tankId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid tankId is required"
//                 });
//             }

//             matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
//         }

//         // Filter by farmId
//         if (farmId) {
//             if (!mongoose.Types.ObjectId.isValid(farmId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Valid farmId is required"
//                 });
//             }

//             matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
//         }

//         console.log("🔍 Expense Match Condition:", matchCondition);

//         const expenses = await Expense.find(matchCondition).sort({
//             createdAt: -1
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Expenses retrieved successfully",
//             count: expenses.length,
//             expenses: expenses
//         });

//     } catch (error) {
//         console.log("❌ Get All Expenses Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             expenses: []
//         });
//     }
// };


export const getAllExpenses = async(req, res) => {
    try {
        console.log("📥 Get All Expenses Request:", req.body);

        const userId = req.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        const { tankId, farmId } = req.body || {};

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Common filters
        const matchCondition = {};

        if (tankId) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid tankId is required"
                });
            }

            matchCondition.tankId = new mongoose.Types.ObjectId(tankId);
        }

        if (farmId) {
            if (!mongoose.Types.ObjectId.isValid(farmId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid farmId is required"
                });
            }

            matchCondition.farmId = new mongoose.Types.ObjectId(farmId);
        }

        // ==========================================
        // 1. GET OWNER EXPENSES
        // ==========================================

        const expenses = await Expense.find({
            createdBy: userObjectId,
            ...matchCondition
        });

        // ==========================================
        // 2. GET STAFF BELONGING TO THIS USER
        // ==========================================

        const staffDetails = await mongoose.connection
            .collection("app_staffs")
            .find({
                userId: userObjectId
            })
            .project({ _id: 1 })
            .toArray();

        const staffIds = staffDetails.map(staff => staff._id);

        // ==========================================
        // 3. GET STAFF EXPENSES
        // ==========================================

        let staffExpenses = [];

        if (staffIds.length > 0) {
            staffExpenses = await StaffExpense.find({
                staffId: { $in: staffIds },
                ...matchCondition
            });
        }

        // ==========================================
        // 4. COMBINE BOTH
        // ==========================================

        const allExpenses = [
            ...expenses,
            ...staffExpenses
        ];

        // Sort latest first
        allExpenses.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return res.status(200).json({
            success: true,
            message: "Expenses retrieved successfully",
            count: allExpenses.length,
            expenses: allExpenses
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

// Delete expense
export const deleteExpense = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;


        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
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
            createdBy: userId
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
        const userId = req.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required"
            });
        }

        const result = await ExpensesParties.aggregate([{
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),

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
                    from: "expenses",
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