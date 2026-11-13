
const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const sessionMiddleware = require("../middleware/sessionMiddleware");

// Create a new adventure room
router.post(
    "/",
    sessionMiddleware,
    roomController.createRoom
);

// Join an existing adventure room
router.post(
    "/join",
    sessionMiddleware,
    roomController.joinRoom
);

// Restore an existing room
router.get(
    "/:code",
    sessionMiddleware,
    roomController.getRoom
);

// Update a player's selected role
router.patch(
    "/:code/role",
    sessionMiddleware,
    roomController.updatePlayerRole
);

// Update a player's ready status
router.patch(
    "/:code/ready",
    sessionMiddleware,
    roomController.updatePlayerReady
);

// Start adventure (Dungeon Master only)
router.post(
    "/:code/start",
    sessionMiddleware,
    roomController.startRoom
);

// Submit or update a player's vote
router.post(
    "/:code/vote",
    sessionMiddleware,
    roomController.castVote
);

// Retrieve shared votes for a chapter
router.get(
    "/:code/votes/:chapterId",
    sessionMiddleware,
    roomController.getVotes
);

module.exports = router;
