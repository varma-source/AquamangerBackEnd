import express from 'express';
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import path from "path";
import fs from "fs";
import util from "util";
import dotenv from "dotenv";
import cron from "node-cron";
import dns from "dns";
import { DateTime } from "luxon";

import mainRoute from "./routes/mainRoutes.js";

// ============================================================
// PATH SETUP FOR ES MODULE
// ============================================================

import { fileURLToPath } from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// APP SETUP
// ============================================================

dotenv.config();

// Use public DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

const server = http.createServer(app);

// app.use(express.json());

// app.use(cors());


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.originalUrl.includes("partyPayment")) {
        console.log("========== REQUEST DEBUG ==========");
        console.log("URL:", req.originalUrl);
        console.log("METHOD:", req.method);
        console.log("CONTENT TYPE:", req.headers["content-type"]);
        console.log("BODY:", req.body);
        console.log("===================================");
    }
    next();
});

// ============================================================
// UPLOADS
// ============================================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ============================================================
// MAIN ADMIN API
// ============================================================


app.use("/v1/Aqua", mainRoute);

// ============================================================
// HOME ROUTE
// ============================================================

app.get("/", (req, res) => {
    res
        .status(200)
        .send(
            `<center><h1> Welcome to Aqua</h1></center>`
        );
});

// app.get("/privacy-policy.html", (req, res) => {
//     res.sendFile(
//         path.join(__dirname, "../privacy-policy.html")
//     );
// });
app.get("/privacy-policy.html", (req, res) => {
    res.sendFile(path.join(__dirname, "privacy-policy.html"));
});
// ============================================================
// MONGODB CONNECTION
// ============================================================

mongoose.set("strictQuery", true);

console.log(
    "MongoDB URL loaded:", !!process.env.MONGODB_CONNECTION_ATLAS
);

mongoose
    .connect(process.env.MONGODB_CONNECTION_ATLAS)
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.error("DB Connection failed:", err.message);
    });

// ============================================================
// LOGGING
// ============================================================

const logDir = path.join(__dirname, "logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFile = fs.createWriteStream(
    path.join(
        logDir,
        `app-${new Date().toISOString().split("T")[0]}.log`
    ), {
        flags: "a"
    }
);

["log", "error", "warn"].forEach((method) => {

    const old = console[method];

    console[method] = (...args) => {

        const msg =
            `[${new Date().toISOString()}] ` +
            `[${method.toUpperCase()}] ` +
            `${util.format(...args)}\n`;

        logFile.write(msg);

        old.apply(console, args);
    };
});

// socketServer.initSocket(server);

import {
    checkCultivationNotifications,
    checkLowMedicineStockNotifications,
    checkLowFeedStockNotifications,
    checkStaffExpenseNotifications,
    checkHarvestNotifications,
    checkStaffAdvanceNotifications
} from "./controllers/app/sendNotifications.controller.js";


// Run stock and medicine notifications every minute.
cron.schedule(
    "* * * * *",
    async() => {
        const now = DateTime.now().setZone("Asia/Kolkata");

        console.log(
            "[NOTIFICATION CRON] Started:",
            now.toFormat("yyyy-MM-dd hh:mm:ss a")
        );

        try {
            // Existing stock notification logic
            await checkCultivationNotifications();

            // Low medicine stock notification logic
            await checkLowMedicineStockNotifications();


            // Low log feed notification logic
            await checkLowFeedStockNotifications();

            //low staff expense
            await checkStaffExpenseNotifications();

            //Harvest completed
            await checkHarvestNotifications();

            //staff advance
            await checkStaffAdvanceNotifications();

            console.log(
                "[NOTIFICATION CRON] Completed successfully"
            );
        } catch (error) {
            console.error(
                "[NOTIFICATION CRON] Failed:",
                error.stack || error.message
            );
        }
    }, {
        timezone: "Asia/Kolkata",
    }
);

app.listen(
    process.env.PORT,
    () => console.log(
        `Server running on port ${process.env.PORT}`
    )
);