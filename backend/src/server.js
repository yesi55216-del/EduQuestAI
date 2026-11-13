
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const healthRoutes = require("./routes/healthRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const roomRoutes = require("./routes/roomRoutes");
const supabase = require("./config/supabase");
const aiRoutes = require("./routes/aiRoutes");
const adventureRoutes = require("./routes/adventureRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/adventures", adventureRoutes);

// Supabase connection test
app.get("/api/supabase-test", async (req, res) => {
    try {
        const response = await fetch(
            `${process.env.SUPABASE_URL}/auth/v1/health`,
            {
                headers: {
                    apikey: process.env.SUPABASE_ANON_KEY
                }
            }
        );

        if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
        `Supabase responded with status ${response.status}: ${errorDetails}`
    );
}

        res.json({
            status: "success",
            message: "Successfully connected to Supabase!"
        });

    } catch (error) {
        console.error("Supabase connection error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not connect to Supabase."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`EduQuestAI backend running at http://localhost:${PORT}`);
});
