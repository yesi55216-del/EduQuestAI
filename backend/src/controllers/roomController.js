
const roomService = require("../services/roomService");

const roomController = {
    async createRoom(req, res) {
        try {
            const {
                name,
                nick,
                max,
                min,
                level,
                subject,
                chapter,
                chapterTitle,
                mode,
                objectives
            } = req.body;

            // Validate required fields
            if (!name || !nick) {
                return res.status(400).json({
                    error: "Room name and Dungeon Master name are required."
                });
            }

            if (
                !Number.isInteger(max) ||
                max < 2 ||
                max > 24
            ) {
                return res.status(400).json({
                    error: "Maximum players must be between 2 and 24."
                });
            }

            // Create room using authenticated user ID
            const room = await roomService.createRoom(
                req.user.id,
                {
                    name,
                    nick,
                    max,
                    min: min || 1,
                    level,
                    subject,
                    chapter,
                    chapterTitle,
                    mode,
                    objectives
                }
            );

            return res.status(201).json({
                status: "success",
                message: "Adventure room created successfully.",
                room
            });

        } catch (error) {
            console.error("Room creation error:", error);

            return res.status(500).json({
                error: "Could not create adventure room."
            });
        }
    },

    async joinRoom(req, res) {
        try {
            const { code, nick } = req.body;

            if (!code || !nick) {
                return res.status(400).json({
                    error: "Room code and nickname are required."
                });
            }

            const room = await roomService.joinRoom(
                req.user.id,
                code,
                nick
            );

            return res.status(200).json({
                status: "success",
                message: "Joined adventure room successfully.",
                room
            });

        } catch (error) {
            console.error("Room joining error:", error);

            const errors = {
                ROOM_NOT_FOUND: [
                    404,
                    "Room not found. Please check the code."
                ],
                ROOM_NOT_AVAILABLE: [
                    409,
                    "This room is no longer available."
                ],
                ROOM_FULL: [
                    409,
                    "This room is full."
                ]
            };

            const [status, message] = errors[error.message] || [
                500,
                "Could not join adventure room."
            ];

            return res.status(status).json({
                error: message
            });
        }
    },
    async getRoom(req, res) {
    try {
        const { code } = req.params;

        const room = await roomService.getRoomForUser(
            req.user.id,
            code
        );

        return res.status(200).json({
            status: "success",
            room
        });

    } catch (error) {
        console.error("Room retrieval error:", error);

        const errors = {
            ROOM_NOT_FOUND: [404, "Room not found."],
            ROOM_ACCESS_DENIED: [403, "You are not a member of this room."]
        };

        const [status, message] = errors[error.message] || [
            500,
            "Could not retrieve room."
        ];

        return res.status(status).json({ error: message });
    }
},

    async updatePlayerRole(req, res) {
        try {
            const { code } = req.params;
            const { role } = req.body;

            const allowedRoles = [
                "swordsman",
                "mage",
                "archer",
                "support"
            ];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    error: "Invalid player role."
                });
            }

            const member = await roomService.updatePlayerRole(
                req.user.id,
                code,
                role
            );

            return res.status(200).json({
                status: "success",
                message: "Player role updated.",
                member
            });

        } catch (error) {
            console.error("Role update error:", error);

            const errors = {
                ROOM_NOT_FOUND: [404, "Room not found."],
                ROOM_MEMBER_NOT_FOUND: [
                    403,
                    "You are not a player in this room."
                ]
            };

            const [status, message] = errors[error.message] || [
                500,
                "Could not update player role."
            ];

            return res.status(status).json({ error: message });
        }
    },

    async updatePlayerReady(req, res) {
    try {
        const { code } = req.params;
        const { isReady } = req.body;

        if (typeof isReady !== "boolean") {
            return res.status(400).json({
                error: "Ready status must be true or false."
            });
        }

        const member = await roomService.updatePlayerReady(
            req.user.id,
            code,
            isReady
        );

        return res.status(200).json({
            status: "success",
            message: "Ready status updated.",
            member
        });

    } catch (error) {
        console.error("Ready status update error:", error);

        const errors = {
            ROOM_NOT_FOUND: [404, "Room not found."],
            ROOM_MEMBER_NOT_FOUND: [
                403,
                "You are not a player in this room."
            ]
        };

        const [status, message] = errors[error.message] || [
            500,
            "Could not update ready status."
        ];

        return res.status(status).json({ error: message });
    }
},

async startRoom(req, res) {
    try {
        const { code } = req.params;

        const room = await roomService.startRoom(
            req.user.id,
            code
        );

        return res.status(200).json({
            status: "success",
            message: "Adventure started.",
            room
        });

    } catch (error) {
        console.error("Room start error:", error);

        const errors = {
            ROOM_NOT_FOUND: [404, "Room not found."],
            HOST_ONLY: [403, "Only the Dungeon Master can start the adventure."]
        };

        const [status, message] = errors[error.message] || [
            500,
            "Could not start adventure."
        ];

        return res.status(status).json({ error: message });
    }
},


    async castVote(req, res) {
        try {
            const { code } = req.params;
            const { chapterId, optionId } = req.body;

            if (!chapterId || !optionId) {
                return res.status(400).json({
                    error: "Chapter ID and option ID are required."
                });
            }

            await roomService.castVote(
                req.user.id,
                code,
                chapterId,
                optionId
            );

            return res.status(200).json({
                status: "success",
                message: "Vote submitted."
            });

        } catch (error) {
            console.error("Vote submission error:", error);

            const errors = {
                ROOM_NOT_FOUND: [404, "Room not found."],
                ROOM_ACCESS_DENIED: [403, "You are not a member of this room."],
                ROOM_NOT_ACTIVE: [409, "The adventure is not active."],
                PLAYERS_ONLY: [403, "Only players can vote."],
                INVALID_VOTE: [400, "Invalid vote."]
            };

            const [status, message] = errors[error.message] || [
                500,
                "Could not submit vote."
            ];

            return res.status(status).json({ error: message });
        }
    },

    async getVotes(req, res) {
        try {
            const { code, chapterId } = req.params;

            const result = await roomService.getVotes(
                req.user.id,
                code,
                chapterId
            );

            return res.status(200).json({
                status: "success",
                ...result
            });

        } catch (error) {
            console.error("Vote retrieval error:", error);

            const errors = {
                ROOM_NOT_FOUND: [404, "Room not found."],
                ROOM_ACCESS_DENIED: [403, "You are not a member of this room."],
                INVALID_VOTE: [400, "Invalid chapter ID."]
            };

            const [status, message] = errors[error.message] || [
                500,
                "Could not retrieve votes."
            ];

            return res.status(status).json({ error: message });
        }
    },


};

module.exports = roomController;
