
const express = require("express");
const router = express.Router();

const adventureController = require("../controllers/adventureController");
const sessionMiddleware = require("../middleware/sessionMiddleware");

router.post(
    "/publish",
    sessionMiddleware,
    adventureController.publishAdventure
);

router.get(
    "/:subject",
    sessionMiddleware,
    adventureController.getPublishedAdventure
);

module.exports = router;
