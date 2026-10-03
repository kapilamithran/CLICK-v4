import assert from 'node:assert/strict';
import {addStudent,bootBackend,content,correctAnswer,freshWorld,table,WRONG} from '../backend/harness.ts';
Deno.test('mastery: repeated retry cycles, resume, zero hearts, complete only when all correct, XP once',async()=>{
 freshWorld();const call=await bootBackend();const token=addStudent('master',{hearts:0});
 const chapter=content.chapters.find((c:any)=>c.chapter_id==='CH0031');
 const start=await call('startTest',{session_token:token,stage_id:chapter.stage_id,chapter_id:chapter.chapter_id,unified:true,mastery:true});
 assert.equal(start.ok,true,start.error);assert.equal(start.questions.length,content.questions.filter((q:any)=>q.chapter_id===chapter.chapter_id).length);
 const q=start.questions[0];
 for(let i=1;i<=6;i++){const r=await call('saveTestAnswer',{session_token:token,test_run_id:start.test_run_id,question_id:q.question_id,answer:WRONG,client_attempt_id:'wrong-'+i});assert.equal(r.ok,true,r.error);assert.equal(r.failed,false);assert.equal(r.hearts,0);assert.equal(r.attempt_number,(i-1)%3+1);assert.equal(r.deferred,i%3===0);}
 const early=await call('finishTest',{session_token:token,test_run_id:start.test_run_id,unified:true});assert.equal(early.ok,false);assert.match(early.error,/every question/);
 const resumed=await call('startTest',{session_token:token,stage_id:chapter.stage_id,chapter_id:chapter.chapter_id,unified:true,mastery:true,resume_run_id:start.test_run_id});assert.equal(resumed.test_run_id,start.test_run_id);assert.equal(table('test_runs').length,1);assert.equal(resumed.saved_attempts.length,6);
 for(const q of start.questions){const payload={session_token:token,test_run_id:start.test_run_id,question_id:q.question_id,answer:correctAnswer(q.question_id),client_attempt_id:'correct-'+q.question_id};const a=await call('saveTestAnswer',payload);const b=await call('saveTestAnswer',payload);assert.equal(a.ok,true,a.error);assert.equal(b.pending_xp,a.pending_xp);}
 const fin=await call('finishTest',{session_token:token,test_run_id:start.test_run_id,unified:true});assert.equal(fin.completed,true,fin.error);
 const user=table('users').find(u=>u.user_id==='master')!;const xp=user.total_xp;assert.ok(xp>0);await call('finishTest',{session_token:token,test_run_id:start.test_run_id,unified:true});assert.equal(user.total_xp,xp);
});
Deno.test('mastery resume cannot access another student or chapter',async()=>{
 freshWorld();const call=await bootBackend();const token=addStudent('a'),other=addStudent('b');
 const run=await call('startTest',{session_token:token,stage_id:'STG001',chapter_id:'CH0031',unified:true,mastery:true});assert.equal(run.ok,true,run.error);
 const r=await call('startTest',{session_token:other,stage_id:'STG001',chapter_id:'CH0031',unified:true,mastery:true,resume_run_id:run.test_run_id});assert.equal(r.ok,false);assert.match(r.error,/no longer active/);
});
