import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = "aqua-manager-c2083";

const SCOPES = [
    "https://www.googleapis.com/auth/firebase.messaging"
];

// Get Firebase access token
export const getAccessToken = async() => {
    try {
        const auth = new GoogleAuth({
            keyFile: path.join(__dirname, "../fcmApikey.json"),
            scopes: SCOPES
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        return accessToken.token;
    } catch (error) {
        throw new Error(
            `Failed to get access token: ${error.message}`
        );
    }
};

// Send FCM message
export const sendMessage = async(accessToken, message) => {
    try {
        const FCM_URL =
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        };

        const response = await axios.post(
            FCM_URL,
            message, { headers }
        );

        console.log("Message sent successfully:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Error sending message:",
            error.response ? error.response.data : error.message
        );

        throw error;
    }
};