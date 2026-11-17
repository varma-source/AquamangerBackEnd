import express from "express";

const mainRoute = express.Router();

import adminMainRoutes from "./adminRoutes/adminMainRoutes.js";
import appMainRoutes from "./appRoutes/appMainRoute.js";
import staffMainRoutes from "./staffRoutes/staffMainRoute.js";



mainRoute.use("/admin", adminMainRoutes);
mainRoute.use("/app", appMainRoutes);
mainRoute.use("/staff", staffMainRoutes);



export default mainRoute;