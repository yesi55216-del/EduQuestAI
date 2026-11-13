
const adventureService = require("../services/adventureService");

const adventureController = {
    async publishAdventure(req, res) {
        try {
            const { subject, adventure } = req.body;

            if (!subject || !adventure || adventure.status !== "Published") {
                return res.status(400).json({
                    error: "A valid published adventure is required."
                });
            }

            const data = await adventureService.publish(
                subject.trim(),
                adventure
            );

            res.json({
                status: "success",
                message: "Adventure published successfully.",
                adventure: data.adventure
            });

        } catch (error) {
            console.error("Adventure publishing error:", error);
            res.status(500).json({
                error: "Could not publish adventure."
            });
        }
    },

    async getPublishedAdventure(req, res) {
        try {
            const subject = req.params.subject;

            const adventure = await adventureService.getPublished(
                subject
            );

            if (!adventure) {
                return res.status(404).json({
                    error: "No published adventure found for this subject."
                });
            }

            res.json({ adventure });

        } catch (error) {
            console.error("Adventure retrieval error:", error);
            res.status(500).json({
                error: "Could not retrieve adventure."
            });
        }
    }
};

module.exports = adventureController;
