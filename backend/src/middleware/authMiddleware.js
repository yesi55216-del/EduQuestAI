
const supabase = require("../config/supabase");

async function authenticateUser(req, res, next) {
    try {
        // Read the token from the request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication token required."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify the token with Supabase Auth
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                error: "Invalid or expired authentication token."
            });
        }

        // Attach the verified user to the request
        req.user = data.user;
        req.accessToken = token;

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            error: "Authentication failed."
        });
    }
}

module.exports = authenticateUser;
