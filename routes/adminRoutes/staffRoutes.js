import express from 'express';
import * as staffController from '../../controllers/admin/staffController.js';
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

import { upload_superadminstaffImg } from '../../middleware/uploadImage.js';



const router = express.Router();



// ============================================================
// ADD STAFF
// ============================================================
router.post(
    '/addstaff',
    verifyAdminToken,
    upload_superadminstaffImg.single("image"),
    staffController.addStaff
);



// ============================================================
// GET ALL STAFF
// ============================================================
router.post(
    '/getall-staff',
    verifyAdminToken,
    staffController.getAllStaff
);



// ============================================================
// GET STAFF BY ID
// ============================================================
router.post(
    '/getstaffbyid',
    verifyAdminToken,
    staffController.getStaffById
);



// ============================================================
// UPDATE STAFF
// ============================================================
router.put(
    '/updatestaff/:id',
    verifyAdminToken,
    upload_superadminstaffImg.single("image"),
    staffController.editStaff
);



// ============================================================
// DELETE STAFF
// ============================================================
router.delete(
    '/deletestaff/:id',
    verifyAdminToken,
    staffController.deleteStaff
);

router.post(
    '/getall-active-staff',
    verifyAdminToken,
    staffController.getAllActiveStaff
);

router.put(
    '/changepassword/:id',
    verifyAdminToken,
    staffController.changeStaffPassword
);

router.post(
    '/login',
    staffController.staffLogin
);

router.post(
    '/getprofile', verifyAdminToken,
    staffController.getStaffProfile
);

router.post(
    '/getrolesandpermissions', verifyAdminToken,
    staffController.getrolesandpermissions
);


router.post(
    '/get-logs', verifyAdminToken,
    staffController.getStaffLogs
);

export default router;