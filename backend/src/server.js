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

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/health", healthRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`EduQuestAI backend running at http://localhost:${PORT}`);
});