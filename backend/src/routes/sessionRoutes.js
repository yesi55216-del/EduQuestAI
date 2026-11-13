
const express = require("express");
const router = express.Router();

const sessionMiddleware = require("../middleware/sessionMiddleware");

// Check whether the user's anonymous session is still valid
router.get("/check", sessionMiddleware, (req, res) => {
    res.json({
        status: "success",
        message: "Anonymous session is valid.",
        userId: req.user.id
    });
});

module.exports = router;
