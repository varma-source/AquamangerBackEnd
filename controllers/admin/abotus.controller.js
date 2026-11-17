import abotusModel from "../../models/aboutus.js";
import { DateTime } from "luxon";

// Get About Us
export const getAboutUs = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const aboutUs = await abotusModel.findOne({});

        if (aboutUs === null) {
            const aboutUsObj = new abotusModel({
                email: "",
                phone: "",
                logCreatedDate: logDate,
                logModifiedDate: logDate,
            });

            const saveAboutUs = await aboutUsObj.save();

            if (saveAboutUs) {
                return res.status(200).json({
                    success: true,
                    message: "About Us data has been retrieved successfully",
                    aboutUs: saveAboutUs || {},
                });
            }
        } else {
            return res.status(200).json({
                success: true,
                message: "About Us data has been retrieved successfully",
                aboutUs: aboutUs || {},
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


// Update About Us
export const updateAboutUs = async function (req, res) {
    try {
        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });
        const time = istDateTime.toFormat("hh:mm a");

        const upSet = await abotusModel.updateOne(
            {},
            {
                $set: {
                    email: req.body.email,
                    phone: req.body.phone,
                    logModifiedDate: logDate,
                },
            },
            { new: true }
        );

        if (upSet) {
            return res.status(200).json({
                success: true,
                message: "About Us has been updated successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "About Us could not be updated",
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