'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const guide = JSON.parse(fs.readFileSync('guide.json', 'utf8'));
const source = fs.readFileSync('app.js', 'utf8');
const section = source.slice(source.indexOf('const ICS_TZ ='), source.indexOf('function eventCard(e){'));
assert(section.includes('function icsEvent(e)'));
const context={Date, TextEncoder, URL, cleanURL:()=>null, download:()=>{}};
vm.runInNewContext(section + '\nthis.buildCalendar=calendarText;this.buildSingle=icsEvent;',context);
const ics=context.buildCalendar(guide.events);
const pickupSlots=[
 ['pickup-main','2026-12-09','15:00'],
 ['pickup-wrl','2026-12-11','10:50'],
 ['pickup-tae-1','2026-12-12','09:00'],
 ['pickup-tae-2','2026-12-12','12:15']
];
for(const [id,day,time] of pickupSlots){
 const event=guide.events.find(e=>e.id===id);
 assert(event, 'Missing pickup event: '+id);
 assert.equal(event.day,day);
 assert.equal(event.start,time);
 assert.equal(event.url,guide.posterPickup.floorPlanUrl);
 assert(ics.includes('UID:'+id+'-2026@neurips-2026.chrstnsn.de'));
}
assert(guide.posterPickup.floorPlanUrl.includes('level-two.pdf'));

assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,guide.events.length);
assert(ics.includes('TZID:Australia/Sydney'));
assert(ics.includes('20261208T180000'));
assert(ics.includes('20261208T220000'));
assert(ics.includes('20261211T125000'));
assert(ics.includes('20261209T170000'));
assert(ics.includes('SUMMARY:Optiver — Intelligence at Play (time to confirm)'));
assert(ics.includes('TRANSP:TRANSPARENT'));
assert(ics.includes('STATUS:TENTATIVE'));
assert(ics.includes('\r\n'));
assert.equal(context.buildSingle(guide.events[0]).filter(s=>s==='BEGIN:VEVENT').length,1);
for(const line of ics.split('\r\n')){if(!line)continue;assert(Buffer.byteLength(line,'utf8')<=75,'unfolded line >75 bytes: '+line.slice(0,50));}
console.log(`Calendar export passed: ${guide.events.length} events, Australia/Sydney TZ, unknown-time safeguards`);
