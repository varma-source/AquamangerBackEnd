import policieModel from "../../models/policies.js";
import { DateTime } from "luxon";

// Get Policies
export const getPolicies = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const policy = await policieModel.findOne({});

        if (policy === null) {
            const policyObj = new policieModel({
                privacyPolicy: "",
                termsAndCondition: "",
                refundPolicy: "",
                logCreatedDate: logDate,
                logModifiedDate: logDate,
            });

            const savepolicy = await policyObj.save();

            if (savepolicy) {
                return res.status(200).json({
                    success: true,
                    message: "Policies data have been retrieved successfully",
                    policy: savepolicy || {},
                });
            }
        } else {
            return res.status(200).json({
                success: true,
                message: "Policies data has been retrieved successfully",
                policy: policy || {},
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

// Update Privacy Policy
export const updatePrivacypolicy = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const upSet = await policieModel.updateOne(
            {},
            {
                $set: {
                    privacyPolicy: req.body.privacyPolicy,
                    logModifiedDate: logDate,
                },
            },
            { new: true }
        );

        if (upSet) {
            return res.status(200).json({
                success: true,
                message: "Privacy policy has been updated successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Privacy policy could not be updated",
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

// Update Terms & Conditions
export const updatetermsConditions = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const upSet = await policieModel.updateOne(
            {},
            {
                $set: {
                    termsAndCondition: req.body.termsAndCondition,
                    logModifiedDate: logDate,
                },
            },
            { new: true }
        );

        if (upSet) {
            return res.status(200).json({
                success: true,
                message: "Terms And Conditions has been updated successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Terms And Conditions could not be updated",
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

// Update Refund Policy
export const updaterefundPolicy = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const upSet = await policieModel.updateOne(
            {},
            {
                $set: {
                    refundPolicy: req.body.refundPolicy,
                    logModifiedDate: logDate,
                },
            },
            { new: true }
        );

        if (upSet) {
            return res.status(200).json({
                success: true,
                message: "Updated successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Please try again!",
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