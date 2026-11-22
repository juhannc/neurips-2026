const test=require('node:test');
const assert=require('node:assert/strict');
const {minutes,isTimed,plan}=require('../calendar-layout.js');
const e=(id,start,end)=>({id,start,end,title:id});
test('Sydney local clock parsing ignores unknown time',()=>{
 assert.equal(minutes('18:00'),1080);
 assert.equal(minutes('08:15'),495);
 assert.equal(minutes('TBC'),null);
 assert.equal(minutes('25:00'),null);
 assert.ok(!isTimed(e('invalid','20:00','19:00')));
});
test('direct overlaps receive separate columns, touching events can reuse a column',()=>{
 const result=plan([e('late','19:00','21:00'),e('early','18:00','20:00'),e('after','21:00','22:00')]);
 assert.equal(result.maxColumns,2);
 const a=result.entries.find(v=>v.event.id==='early');
 const b=result.entries.find(v=>v.event.id==='late');
 const c=result.entries.find(v=>v.event.id==='after');
 assert.notEqual(a.column,b.column);
 assert.equal(c.column,b.column);
});
test('simultaneous sessions are visible in independent lanes',()=>{
 const data=plan([e('Research Exchange','18:00','22:00'),e('Intel Rooftop','18:00','21:00'),e('Poster Session 2','17:00','20:00')]);
 assert.equal(data.maxColumns,3);
 assert.equal(new Set(data.entries.map(v=>v.column)).size,3);
});
test('new non-overlapping cluster does not inherit previous lane count',()=>{
 const data=plan([e('a','09:00','11:00'),e('b','09:00','10:00'),e('c','12:00','13:00')]);
 assert.equal(data.entries.find(v=>v.event.id==='c').columns,1);
});
test('unassigned workshop slots stay outside the timed calendar',()=>{
 const data=plan([e('TAE',null,null),e('WRL','12:50','14:20')]);
 assert.equal(data.untimed.length,1);
 assert.equal(data.entries.length,1);
});
