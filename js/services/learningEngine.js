/* LearningEngine: challenges + explanations tied to teacher objectives */
class LearningEngine{
 constructor(ai){this.ai=ai}
 suggestChallenges(objectives){return this.ai.suggestChallenges(objectives)}
 explain(topic,level){return this.ai.explain(topic,level)}
}
const learningEngine=new LearningEngine(aiProvider);
