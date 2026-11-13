
const adminSupabase = require("../config/adminSupabase");

const adventureService = {
    async publish(subject, adventure) {
        const { data, error } = await adminSupabase
            .from("published_adventures")
            .upsert(
                {
                    subject,
                    adventure,
                    published_at: new Date().toISOString()
                },
                {
                    onConflict: "subject"
                }
            )
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    async getPublished(subject) {
        const { data, error } = await adminSupabase
            .from("published_adventures")
            .select("adventure")
            .eq("subject", subject)
            .maybeSingle();

        if (error) throw error;

        return data ? data.adventure : null;
    }
};

module.exports = adventureService;
