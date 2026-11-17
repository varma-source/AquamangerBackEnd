import RequestAdvance from "../../models/staff_request_advance.js";
import mongoose from "mongoose";
import { DateTime } from "luxon";

// ==========================================
// ADD REQUEST ADVANCE
// ==========================================
export const addRequestAdvance = async function(req, res) {
    try {
        console.log(req.body)
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");

        const logDate = istDateTime.toISO({
            includeOffset: true,
        });

        const requestAdvanceObj = new RequestAdvance({
            staffId: req.staffId,
            date: req.body.date,
            amount: req.body.amount,
            purpose: req.body.purpose,
            status: req.body.status,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveRequestAdvance = await requestAdvanceObj.save();

        if (saveRequestAdvance) {
            return res.status(200).json({
                success: true,
                message: "Added successfully",
                data: saveRequestAdvance,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Please try again",
            });
        }
    } catch (err) {
        console.log(err);

        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// ==========================================
// GET ALL REQUEST ADVANCES
// ==========================================
export const getAllRequestAdvances = async function(req, res) {
    try {
        const matchCondition = {
            staffId: new mongoose.Types.ObjectId(req.staffId),
        };

        const requestAdvances = await RequestAdvance.aggregate([{
                $match: matchCondition,
            },
            {
                $sort: {
                    logCreatedDate: -1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Fetched successfully",
            count: requestAdvances.length,
            data: requestAdvances,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            data: [],
        });
    }
};