/* StoryEngine: the teacher owns story direction; AI only suggests within teacher rules. */
class StoryEngine{
 constructor(ai,scenes){this.ai=ai;this.scenes=scenes;this.rules={objectives:'',mode:'teacher',chapter:'',boundaries:['Stay on the teacher\u2019s learning objectives','Keep content age-appropriate','Teacher approves every story change']}}
 configure(room){this.rules={...this.rules,objectives:room.objectives||'',mode:room.mode||'teacher',chapter:room.chapter||''}}
 suggestVariations(){return this.ai.generateVariation(this.scenes.current())}
 dialogue(){return this.ai.generateDialogue({scene:this.scenes.current(),rules:this.rules})}
 summarize(progress){return this.ai.summarize(progress)}
 approve(v){/* TODO: teacher approval gate before anything reaches players */return false}
}
const storyEngine=new StoryEngine(aiProvider,sceneManager);
