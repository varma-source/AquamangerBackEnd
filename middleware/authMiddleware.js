import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyAdminToken = async function(req, res, next) {
    try {
        let expired = null;
        const bearerHeader = req.headers["authorization"];
        let bearerToken = "";

        if (bearerHeader) {
            bearerToken = bearerHeader.split(" ")[1];
        }

        if (bearerToken) {
            jwt.verify(
                bearerToken,
                process.env.ADMIN_SECRET_KEY,
                function(err, decoded) {
                    if (err) {
                        try {
                            expired = err;

                            return res.status(401).json({
                                status: false,
                                message: "Your session has expired. Please login.",
                                expired,
                            });
                        } catch (err) {
                            return res.status(401).json({
                                status: false,
                                message: "Your session has expired. Please login.",
                                err,
                            });
                        }
                    }

                    if (decoded) {
                        req.userId = decoded.userId;
                        req.staffId = decoded.staffId;
                        req.loginTime = decoded.iat;

                        return next();
                    }
                }
            );
        } else {
            return res.status(400).json({
                status: false,
                message: "Bearer token not defined",
            });
        }
    } catch (err) {
        console.log(err);

        if (
            err.name === "JsonWebTokenError" ||
            err.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                status: false,
                message: "Session Expired Error",
                Error: err,
            });
        } else {
            return res.status(401).json({
                status: false,
                message: "Internal Server Error",
                error: err,
            });
        }
    }
};