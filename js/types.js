/**
 * Shared type definitions (JSDoc). Mirrors future src/types/*.ts
 * @typedef {{name:string, role:(string|null), ready:boolean, host?:boolean, dm?:boolean, mock?:number}} Participant
 * @typedef {{id:string, code:string, name:string, max:number, min:number, subject:string, level:string,
 *   chapter:string, chapterTitle:string, mode:('teacher'|'ai'), objectives:string, players:Participant[]}} Room
 * @typedef {{id:string, location:string, backgroundId:string, description:string, characters:string[],
 *   dialogue:{speaker:string,text:string}[], choices:{id:string,text:string,next:string}[]}} Scene
 * @typedef {{id:string, title:string, subject:string, scenes:string[]}} Chapter
 * @typedef {{objectives:string, mode:string, chapter:string, boundaries:string[]}} StoryRules
 */
const ROLE_PERMISSIONS={
  dm:['start','settings','invite','kick','capacity','dashboard','story','teacherPanel'],
  player:['ready','chooseRole','invite']
};
const can=a=>ROLE_PERMISSIONS[me&&me.dm?'dm':'player'].includes(a);
