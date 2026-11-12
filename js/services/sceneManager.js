/* SceneManager: scenes, current scene, teacher-controlled navigation (placeholder) */
class SceneManager{
 constructor(scenes){this.scenes=scenes;this.currentId=scenes[0].id}
 get(id){return this.scenes.find(s=>s.id==id)}
 current(){return this.get(this.currentId)}
 goTo(id){if(typeof can==='function'&&!can('story'))return false;if(!this.get(id))return false;this.currentId=id;return true}
}
const sceneManager=new SceneManager(MOCK_STORIES.scenes);
