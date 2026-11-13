
const authenticateUser = require("./authMiddleware");
const adminSupabase = require("../config/adminSupabase");
const activityService = require("../services/activityService");

const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000;

async function checkSession(req, res, next) {
    try {
        const userId = req.user.id;

        const { data, error } = await adminSupabase
            .from("anonymous_activity")
            .select("last_seen_at")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        // First visit: create an activity record
        if (!data) {
            await activityService.updateActivity(userId);
            return next();
        }

        const lastSeen = new Date(data.last_seen_at).getTime();
        const inactiveTime = Date.now() - lastSeen;

        // Session expired after 24 hours of inactivity
        if (inactiveTime >= INACTIVITY_LIMIT) {
            return res.status(401).json({
                error: "SESSION_EXPIRED",
                message: "Your anonymous session expired after 24 hours of inactivity."
            });
        }

        // Refresh activity timestamp
        await activityService.updateActivity(userId);

        next();

    } catch (error) {
        console.error("Session validation error:", error);

        return res.status(500).json({
            error: "Could not validate your session."
        });
    }
}

// Run authentication before checking inactivity
module.exports = [authenticateUser, checkSession];
