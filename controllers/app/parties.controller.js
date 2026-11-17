import { DateTime } from "luxon";
import Party from "../../models/parties.js";


export const addParty = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        const partyObj = new Party({
            name: req.body.name,
            phone: req.body.phone,
            notes: req.body.notes,
            status: req.body.status,
            userId: req.userId,
            logCreatedDate: logDate,
            logModifiedDate: logDate,
        });

        const saveParty = await partyObj.save();

        if (saveParty) {
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



export const updateParty = async function(req, res) {
    try {


        const istDateTime = DateTime.now().setZone("Asia/Kolkata");
        const logDate = istDateTime.toISO({ includeOffset: true });

        const partyObj = await Party.findById(req.params.id);

        if (!partyObj) {
            return res.status(400).json({
                success: false,
                message: "Party not found",
            });
        }

        partyObj.name = req.body.name;
        partyObj.phone = req.body.phone;
        partyObj.notes = req.body.notes;
        partyObj.status = req.body.status;
        partyObj.logModifiedDate = logDate;

        const saveParty = await partyObj.save();

        if (saveParty) {
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


export const getAllParty = async function(req, res) {
    try {

        const parties = await Party.find({
                userId: req.userId
            })
            .sort({ logCreatedDate: -1 });

        if (parties) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                count: parties.length,
                data: parties,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "No data found",
                data: [],
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


export const getPartyById = async function(req, res) {
    try {


        const partyObj = await Party.findById(req.params.id);

        if (partyObj) {
            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                data: partyObj,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Party not found",
                data: {},
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


export const deleteParty = async function(req, res) {
    try {


        const partyObj = await Party.findById(req.params.id);

        if (!partyObj) {
            return res.status(400).json({
                success: false,
                message: "Party not found",
            });
        }

        const deleteParty = await Party.findByIdAndDelete(req.params.id);

        if (deleteParty) {
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
            success: false,
            message: "Something went wrong",
        });
    }


};