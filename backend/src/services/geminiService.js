
const GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
];
const geminiService = {

    
async generateJSON(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Gemini API key is missing from backend/.env");
    }

    let lastError = null;

    for (const model of GEMINI_MODELS) {
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.8,
                            maxOutputTokens: 8192
                        }
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    const message = result.error?.message ||
                        "Unknown Gemini API error";

                    console.error(
                        `Gemini ${model} error (${response.status}):`,
                        message
                    );

                    lastError = new Error(message);

                    if (![429, 500, 502, 503, 504].includes(response.status)) {
                        throw lastError;
                    }

                    if (attempt < 2) {
                        await new Promise(resolve =>
                            setTimeout(resolve, 1500 * attempt)
                        );
                    }

                    continue;
                }

                const text = result.candidates?.[0]?.content?.parts
                    ?.map(part => part.text || "")
                    .join("");

                if (!text) {
                    throw new Error("Gemini returned an empty response.");
                }

                try {
                    console.log(`Gemini generation successful using ${model}`);
                    return JSON.parse(text);
                } catch {
                    throw new Error("Gemini returned invalid JSON.");
                }

            } catch (error) {
                if (error.message === "Gemini returned invalid JSON." ||
                    error.message === "Gemini returned an empty response.") {
                    throw error;
                }

                lastError = error;

                if (attempt < 2) {
                    await new Promise(resolve =>
                        setTimeout(resolve, 1500 * attempt)
                    );
                }
            }
        }

        console.log(`Trying fallback model after ${model} failed...`);
    }

    console.error("All Gemini models failed:", lastError?.message);

    throw new Error("Gemini could not generate content. Please try again later.");
},


    async generateStory(cfg = {}) {
        const subject = cfg.subject || "Mathematics";

        const prompt = `
You are an educational adventure game designer.

Create an original educational adventure for the subject: ${subject}.

Return ONLY a valid JSON object with these fields:

{
  "id": "unique-subject-id",
  "subject": "${subject}",
  "title": "Adventure title",
  "tagline": "Short description",
  "status": "AI Generated",
  "world": "Description of the adventure world",
  "objectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "npcs": [
    {"name": "Character name", "emoji": "emoji"}
  ],
  "chapters": [
    {
      "id": "c1",
      "n": 1,
      "title": "Chapter title",
      "bg": "kingdom",
      "music": "lobby",
      "ambient": null,
      "status": "AI Generated",
      "mission": "Chapter mission",
      "lines": [
        {"s": "Narrator", "t": "Dialogue text"}
      ],
      "questions": [
        {
          "id": "q1",
          "type": "mc",
          "text": "Question text",
          "mode": "individual",
          "difficulty": "Medium",
          "explain": "Question explanation",
          "status": "AI Generated",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "hint": "Helpful hint",
          "explanation": "Detailed explanation",
          "objective": "Learning objective",
          "reference": "",
          "expected": [],
          "rubric": "",
          "context": ""
        }
      ],
      "decision": {
        "prompt": "A story decision",
        "options": [
          {"id": "a", "text": "First choice"},
          {"id": "b", "text": "Second choice"}
        ]
      },
      "completion": "Chapter completion message"
    }
  ],
  "endings": [
    {
      "min": 0.75,
      "bg": "peaceful",
      "title": "Good ending",
      "text": "Ending description"
    }
  ]
}

IMPORTANT:
- Generate EXACTLY 4 chapters.
- Each chapter must contain at least 2 educational questions.
- Questions must have correct answer keys.
- MC questions must have exactly 4 options.
- The correct field is the zero-based index of the correct option.
- Open questions must have expected keywords and a rubric.
- Use question types: mc, open, or scenario.
- Scenario questions must include context.
- Make the story engaging and educational.
- Keep content factually accurate for the subject.
- Every chapter must have dialogue, a mission, questions,
  a decision, and completion text.
- Do not use markdown or code fences.
`;

        const adventure = await this.generateJSON(prompt);

        if (!Array.isArray(adventure.chapters) ||
            adventure.chapters.length !== 4) {
            throw new Error("Gemini did not generate exactly 4 chapters.");
        }

        adventure.chapters = adventure.chapters.map((chapter, index) => ({
            id: `c${index + 1}`,
            n: index + 1,
            bg: "kingdom",
            music: "lobby",
            ambient: null,
            lines: [],
            mission: "",
            questions: [],
            decision: null,
            completion: "",
            ...chapter,
            status: "AI Generated",
            questions: (chapter.questions || []).map((q, qi) =>
                this.normalizeQuestion(q, `c${index + 1}q${qi + 1}`)
            )
        }));

        adventure.status = "AI Generated";

        return adventure;
    },

    async generateQuestions(req = {}) {
        const subject = req.subject || "Mathematics";
        const count = Math.min(Math.max(Number(req.count) || 2, 1), 5);
        const difficulty = req.difficulty || "Medium";

        const prompt = `
You are an expert educational question writer.

Generate exactly ${count} original educational questions
for the subject: ${subject}.

Difficulty: ${difficulty}.

Return ONLY a JSON array with this structure:

[
  {
    "type": "mc",
    "text": "Question text",
    "mode": "individual",
    "difficulty": "${difficulty}",
    "explain": "Short explanation",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "hint": "Helpful hint",
    "explanation": "Detailed explanation",
    "objective": "Learning objective",
    "reference": "",
    "expected": [],
    "rubric": "",
    "context": ""
  }
]

Rules:
- Use mc, open, or scenario question types.
- MC questions require exactly 4 options.
- correct must be the zero-based index of the correct option.
- Open questions require expected keywords and a rubric.
- Scenario questions require context.
- Questions must be accurate and unambiguous.
- Do not repeat questions.
- Return exactly ${count} questions.
- Do not use markdown or code fences.
`;

        const questions = await this.generateJSON(prompt);

        if (!Array.isArray(questions) || questions.length !== count) {
            throw new Error("Gemini generated an incorrect number of questions.");
        }

        return questions.map((q, index) =>
            this.normalizeQuestion(q, `ai${Date.now().toString(36)}${index}`)
        );
    },

    normalizeQuestion(q, id) {
        return {
            id,
            type: q.type || "mc",
            text: q.text || "",
            mode: q.mode || "individual",
            difficulty: q.difficulty || "Medium",
            explain: q.explain || q.explanation || "",
            status: "AI Generated",
            options: Array.isArray(q.options) ? q.options : [],
            correct: Number.isInteger(q.correct) ? q.correct : 0,
            hint: q.hint || "",
            explanation: q.explanation || "",
            objective: q.objective || "",
            reference: q.reference || "",
            expected: Array.isArray(q.expected) ? q.expected : [],
            rubric: q.rubric || "",
            context: q.context || ""
        };
    }
};

module.exports = geminiService;
