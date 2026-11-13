
const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const sessionMiddleware = require("../middleware/sessionMiddleware");

// Generate a complete four-chapter adventure
router.post(
    "/story",
    sessionMiddleware,
    aiController.generateStory
);

// Generate educational questions
router.post(
    "/questions",
    sessionMiddleware,
    aiController.generateQuestions
);

module.exports = router;
