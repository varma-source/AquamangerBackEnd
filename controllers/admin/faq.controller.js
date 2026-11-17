    // import models
    import faqModel from "../../models/faq.js";
    import { DateTime } from "luxon";

    // addfaq
    export const addfaq = async function (req, res) {
        try {
            const istDateTime = DateTime.now().setZone("Asia/Kolkata");
            const logDate = istDateTime.toISO({ includeOffset: true });

            const faqObj = new faqModel({
                question: req.body.question,
                answer: req.body.answer,
                status: req.body.status,
                priority: req.body.priority,
                logCreatedDate: logDate,
                logModifiedDate: logDate,
            });

            const saveFaq = await faqObj.save();

            if (saveFaq) {
                res.status(200).json({
                    success: true,
                    message: "Added successfully",
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Please try again",
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };

    // getAll faqs
    export const getAllfaqs = async function (req, res) {
        try {
            let condition = {};
            let regex = new RegExp(req.query.searchQuery, "i");

            if (req.query.searchQuery !== "") {
                condition = {
                    $or: [
                        { question: regex },
                        { answer: regex },
                        { status: regex },
                    ],
                };
            }

            // condition.type = req.body.type;
            console.log(condition);

            const faqs = await faqModel
                .find(condition)
                .sort({ priority: 1 });

            if (faqs) {
                res.status(200).json({
                    success: true,
                    message: "Faq's has been retrived successfully ",
                    faqs: faqs,
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };

    // edit faq
    export const editfaq = async function (req, res) {
        try {
            const istDateTime = DateTime.now().setZone("Asia/Kolkata");
            const logDate = istDateTime.toISO({ includeOffset: true });

            const faq = await faqModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $set: {
                        question: req.body.question,
                        answer: req.body.answer,
                        status: req.body.status,
                        priority: req.body.priority,
                        logModifiedDate: logDate,
                    },
                },
                { new: true }
            );

            if (faq) {
                res.status(200).json({
                    success: true,
                    message: "Updated successfully",
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Please try again",
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };

    // delete faq
    export const deletefaq = async function (req, res) {
        try {
            const faq = await faqModel.findOneAndDelete({
                _id: req.params.id,
            });

            if (faq) {
                res.status(200).json({
                    success: true,
                    message: "Deleted successfully",
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Please try again",
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                success: "false",
                message: "Something went wrong",
            });
        }
    };