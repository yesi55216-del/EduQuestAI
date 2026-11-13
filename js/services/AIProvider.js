
/* AIProvider: interface for the future AI backend. */
class AIProvider {
    async generateDialogue(ctx) { throw new Error("not implemented"); }
    async createNPCConversation(ctx) { throw new Error("not implemented"); }
    async explain(topic, level) { throw new Error("not implemented"); }
    async generateVariation(scene) { throw new Error("not implemented"); }
    async suggestChallenges(objectives) { throw new Error("not implemented"); }
    async summarize(progress) { throw new Error("not implemented"); }
    async recommendBackground(scene, available) { throw new Error("not implemented"); }
}

class MockAIProvider extends AIProvider {
    _w(v) {
        return new Promise(r => setTimeout(() => r(v), 300));
    }

    generateDialogue(c) {
        return this._w({
            speaker: "Guide",
            text: "The gate hums. Work together to find the answer."
        });
    }

    createNPCConversation(c) {
        return this._w([
            { speaker: "Archivist", text: "Welcome, travelers." },
            { speaker: "Mage", text: "We seek the answer to the riddle." }
        ]);
    }

    explain(t, l) {
        return this._w("Simple explanation of " + t + " for " + l + " (mock).");
    }

    generateVariation(s) {
        return this._w([
            { id: "v1", text: "A storm rolls in, forcing the party to decide quickly." },
            { id: "v2", text: "A friendly owl offers a hint in exchange for a correct answer." }
        ]);
    }

    suggestChallenges(o) {
        return this._w([
            { id: "q1", text: "Team puzzle: solve 3 multiplication riddles" },
            { id: "q2", text: "Quick quiz: 5 questions, any role may answer" }
        ]);
    }

    summarize(p) {
        return this._w("The party reached the Archive Gate and is working through the first riddle (mock summary).");
    }

    recommendBackground(s, a) {
        return this._w(a[0] && a[0].id);
    }
}

/* Extended mock AI: other features remain available as fallback. */
const _cl = o => JSON.parse(JSON.stringify(o));

Object.assign(MockAIProvider.prototype, {
    async generateStory(cfg) {
        await this._w();
        const a = MOCK_ADVENTURES[cfg.subject] || MOCK_ADVENTURES.Mathematics;
        const r = _cl(a);

        r.chapters = r.chapters.slice(0, 4);
        r.chapters.forEach(c => {
            c.status = "AI Generated";
            c.questions.forEach(q => q.status = "AI Generated");
        });

        r.status = "AI Generated";
        return r;
    },

    async generateChapter(adv, n) {
        await this._w();
        return _cl(adv.chapters[n - 1]);
    },

    async generateQuestions(req) {
        await this._w();

        const a = MOCK_ADVENTURES[req.subject] || MOCK_ADVENTURES.Mathematics;
        const pool = a.chapters.flatMap(c => c.questions);
        const n = req.count || 3;

        return Array.from({ length: n }, (_, i) => {
            const b = _cl(pool[(i + (req.offset || 0)) % pool.length]);
            b.id = "ai" + Date.now().toString(36) + i;
            b.status = "AI Generated";

            if (req.difficulty) b.difficulty = req.difficulty;

            return b;
        });
    },

    async evaluateAnswer(q, answer) {
        await this._w();

        if (q.type !== "open") {
            const ok = +answer == q.correct;
            return {
                correct: ok,
                score: ok ? 1 : 0,
                feedback: ok ? "Correct!" : "Not quite."
            };
        }

        const t = String(answer).toLowerCase();
        const hit = (q.expected || []).filter(k => t.includes(k));
        const frac = (q.expected || []).length
            ? hit.length / q.expected.length
            : 0;

        const score = t.length < 8 ? 0 : frac >= 0.4 ? 1 : frac > 0 ? 0.5 : 0;

        return {
            correct: score >= 1,
            score,
            matched: hit,
            feedback: score >= 1
                ? "Strong answer: you covered the key ideas."
                : score > 0
                    ? "Partly there. Try to include: " +
                      (q.expected || []).filter(k => !hit.includes(k)).slice(0, 3).join(", ") + "."
                    : "Needs more. Review the explanation and try to use the key concepts."
        };
    },

    async generateFeedback(q, res) {
        await this._w();
        return (res.correct ? "Well done. " : "") + q.explanation;
    },

    async summarizeProgress(p) {
        await this._w();

        return "Chapter " + p.chapter + " of 4: the party has answered " +
            p.answered + " question(s) with " + p.pct +
            "% accuracy. " +
            (p.pct >= 70
                ? "They are ready to move on."
                : "A short review would help before continuing.");
    },

    async assistantReply(msg, ctx) {
        await this._w();

        const t = msg.toLowerCase();
        const ch = +((t.match(/chapter\s(\d)/) || [])[1] || ctx.chapter || 1);

        if (/more difficult|harder|increase difficulty/.test(t)) {
            return {
                text: "I can raise the difficulty of the questions in Chapter " + ch + ". Review the proposal below before applying.",
                action: { type: "difficulty", ch, level: "Hard" }
            };
        }

        if (/(generate|create|add|make).*(question|quiz)/.test(t)) {
            const match = t.match(/(\d+|one|two|three|four|five)\s+(open|multiple|question)/);
            const n = +(match || [])[1] ||
                ({ one: 1, two: 2, three: 3, four: 4, five: 5 }[
                    (t.match(/\b(one|two|three|four|five)\b/) || [])[1]
                ] || 2);

            const qs = await this.generateQuestions({
                subject: ctx.subject,
                count: Math.min(n, 5),
                offset: ch * 2
            });

            return {
                text: "I drafted " + qs.length + " question(s) for Chapter " + ch + ". They are drafts: nothing reaches students until you approve them.",
                action: { type: "questions", ch, questions: qs }
            };
        }

        if (/npc|character/.test(t)) {
            return {
                text: "Suggested NPC: a wise guide who explains the key concept using story metaphors. I can add them to Chapter " + ch + " dialogue if you approve.",
                action: { type: "npc", ch }
            };
        }

        if (/background|scene/.test(t)) {
            const b = await this.recommendBackground({ description: t }, BACKGROUNDS);

            return {
                text: "I recommend the “" + (backgroundManager.get(b) || {}).label + "” background for this scene.",
                action: { type: "bg", ch, bg: b }
            };
        }

        if (/hint|explain/.test(t)) {
            return {
                text: "Hint idea: ask students which operation undoes the one in the puzzle. For an explanation, I can restate the concept in 2 sentences at their level."
            };
        }

        if (/chapter|add|fifth|extra chapter/.test(t) && /(5|fifth|additional|extra)/.test(t)) {
            return {
                text: "EduQuest adventures always have exactly four chapters, so I cannot add a fifth. I can enrich any of the four instead."
            };
        }

        return {
            text: "I can: generate questions (“Generate three questions for Chapter 2”), raise difficulty (“Make Chapter 3 harder”), suggest an NPC, or recommend a background. Everything I produce is a draft for you to approve."
        };
    },

    async recommendBackground(scene, available) {
        await this._w();
        return backgroundManager.recommend(scene).id;
    }
});

/* Real Gemini API provider: communicates with your protected backend. */
class APIAIProvider extends MockAIProvider {

    constructor(cfg) {
        super();
        this.cfg = cfg || window.EDUQUEST_CONFIG || {};
    }

    async _post(path, body) {
        const base = this.cfg.backendUrl;

        if (!base) {
            throw new Error("Backend URL is not configured.");
        }

        const session = await authService.ready;

        if (!session) {
            throw new Error("Authentication required. Please sign in again.");
        }

        const response = await fetch(
            base.replace(/\/$/, "") + "/api/ai" + path,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + session.access_token
                },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "AI request failed: " + response.status
            );
        }

        return result;
    }

    generateStory(cfg) {
        return this._post("/story", cfg);
    }

    generateQuestions(req) {
        return this._post("/questions", req);
    }
}

/* Use real Gemini for stories and questions.
   Other AI features temporarily use the mock implementations. */
let _ai = new APIAIProvider();

const getAI = () => _ai;

const setAIProvider = p => {
    _ai = p;
    learningEngine.ai = p;
    storyEngine.ai = p;
};

const aiProvider = _ai;
