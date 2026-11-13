
const adminSupabase = require("../config/adminSupabase");

const activityService = {
    async updateActivity(userId) {
        const { error } = await adminSupabase
            .from("anonymous_activity")
            .upsert(
                {
                    user_id: userId,
                    last_seen_at: new Date().toISOString()
                },
                {
                    onConflict: "user_id"
                }
            );

        if (error) {
            console.error("Activity update failed:", error);
            throw error;
        }
    }
};

module.exports = activityService;
