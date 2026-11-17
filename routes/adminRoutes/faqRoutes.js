import express from "express";

const faqRoutes = express.Router();

// controller
import * as faqcontroller from "../../controllers/admin/faq.controller.js";

// middleware
import { verifyAdminToken } from "../../middleware/authMiddleware.js";

// routes

// add faq
faqRoutes.post("/addfaq", verifyAdminToken, faqcontroller.addfaq);

// getALL FAQS
faqRoutes.post("/getallfaqs", verifyAdminToken, faqcontroller.getAllfaqs);

// edit faq
faqRoutes.put("/editfaq/:id", verifyAdminToken, faqcontroller.editfaq);

// delete faq
faqRoutes.delete("/deletefaq/:id", verifyAdminToken, faqcontroller.deletefaq);

export default faqRoutes;