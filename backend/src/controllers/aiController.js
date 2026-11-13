
const geminiService = require("../services/geminiService");

const aiController = {

    async generateStory(req, res) {
        try {
            const { subject } = req.body;

            if (!subject || typeof subject !== "string") {
                return res.status(400).json({
                    error: "A valid subject is required."
                });
            }

            const adventure = await geminiService.generateStory({
                subject: subject.trim()
            });

            return res.json(adventure);

        } catch (error) {
            console.error("Story generation failed:", error);

            return res.status(500).json({
                error: error.message || "Could not generate adventure."
            });
        }
    },

    async generateQuestions(req, res) {
        try {
            const { subject, count, difficulty } = req.body;

            if (!subject || typeof subject !== "string") {
                return res.status(400).json({
                    error: "A valid subject is required."
                });
            }

            const questions = await geminiService.generateQuestions({
                subject: subject.trim(),
                count,
                difficulty
            });

            return res.json(questions);

        } catch (error) {
            console.error("Question generation failed:", error);

            return res.status(500).json({
                error: error.message || "Could not generate questions."
            });
        }
    }
};

module.exports = aiController;
