
/* EduQuestAI Anonymous Authentication */

const authService = {
    client: null,

    async checkBackendSession(session) {
        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/session/check`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            const error = new Error(
                result.message || "Session validation failed."
            );

            error.code = result.error;
            throw error;
        }

        return result;
    },

    async createAnonymousSession() {
        const { data, error } =
            await this.client.auth.signInAnonymously();

        if (error) throw error;

        await this.checkBackendSession(data.session);

        console.log("New anonymous identity created.");

        return data.session;
    },

    async initialize() {
        // Check whether Supabase's browser library loaded
        if (!window.supabase) {
            throw new Error("Supabase library failed to load.");
        }

        const config = window.EDUQUEST_CONFIG;

        if (!config.supabaseUrl ||
            !config.supabasePublishableKey ||
            !config.backendUrl) {
            throw new Error("Missing authentication configuration.");
        }

        // Create Supabase client
        this.client = window.supabase.createClient(
            config.supabaseUrl,
            config.supabasePublishableKey
        );

        // Restore existing session
        const { data, error } =
            await this.client.auth.getSession();

        if (error) throw error;

        // No existing session: create a new one
        if (!data.session) {
            return await this.createAnonymousSession();
        }

        // Existing session: check the backend
        try {
            await this.checkBackendSession(data.session);

            console.log("Existing anonymous session restored.");

            return data.session;

        } catch (error) {

            // Only replace the identity if the 24-hour
            // inactivity limit was reached
            if (error.code !== "SESSION_EXPIRED") {
                throw error;
            }

            console.log("Anonymous session expired. Creating a new identity.");

            // Remove the expired local session
            const { error: signOutError } =
                await this.client.auth.signOut({ scope: "local" });

            if (signOutError) throw signOutError;

            // Create a completely new anonymous identity
            return await this.createAnonymousSession();
        }
    }
};

// Automatically initialize authentication when website loads
authService.ready = authService.initialize().catch(error => {
    console.error("Authentication initialization failed:", error);
    return null;
});
