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

const subscriptionSection=source.slice(source.indexOf('const subscribedCalendarLinks='),source.indexOf('function eventCard(e){'));
assert(subscriptionSection.includes('webcal://neurips-2026.chrstnsn.de/NeurIPS_Focus.ics'));
assert(subscriptionSection.includes('webcal://neurips-2026.chrstnsn.de/NeurIPS_Master.ics'));
assert(subscriptionSection.includes('webcal://neurips-2026.chrstnsn.de/NeurIPS_Posters.ics'));
assert(source.includes('navigator.canShare({files:[file]})'));
assert(source.includes("navigator.share({files:[file]"));
assert(!source.includes("${link('NeurIPS_Focus.ics','Focused calendar')}"));


const drwBooth=guide.booths.find(b=>b.id==='b-drw');
assert(drwBooth && drwBooth.booth==='95' && drwBooth.confirmed);
assert.equal(drwBooth.talks.length,4);
const drwTalks=guide.events.filter(e=>e.id.startsWith('drw-opt-')||e.id.startsWith('drw-conformal-'));
assert.equal(drwTalks.length,4);
for(const e of drwTalks){
 assert(!e.end,'Unpublished booth talk duration must not be guessed');
 const item=context.buildSingle(e).join('\\r\\n');
 assert(item.includes('DTSTART;TZID=Australia/Sydney:'+e.day.replace(/-/g,'')+'T'+e.start.replace(':','')+'00'));
 assert(!item.includes('DTEND'), 'Start-only booth talks should not invent an end time');
 assert(item.includes('TRANSP:TRANSPARENT'));
}
const bandara=guide.events.find(e=>e.id==='drw-bandara-expo');
assert(bandara && bandara.start==='12:00' && bandara.end==='13:00');
assert.equal(bandara.location.includes('Darling Harbour Theatre'),true);


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

// Home pickup card is shown only on presentation days, with independent completion.
const pickupSource=source.slice(source.indexOf('const pickupTaskByDay='),source.indexOf('function renderToday(){'));
assert(pickupSource.includes('function renderPosterPickup(day)'));
const pickupCtx={guide,store:{checks:{}},escapeHTML:String,isChecked(id){return !!this.store.checks[id]}};
pickupCtx.isChecked=id=>!!pickupCtx.store.checks[id];
vm.runInNewContext(pickupSource+';this.pickup=renderPosterPickup;',pickupCtx);
for(const day of ['2026-12-06','2026-12-07','2026-12-08','2026-12-10']){
 assert.equal(pickupCtx.pickup(day),'','Pickup card must be absent on '+day);
}
assert(pickupCtx.pickup('2026-12-09').includes('15:00–15:20'));
assert(pickupCtx.pickup('2026-12-11').includes('10:50–11:10'));
assert(pickupCtx.pickup('2026-12-12').includes('09:00–09:20 or 12:15–12:35'));
assert(!pickupCtx.pickup('2026-12-09').includes('Mon 08:00'));
pickupCtx.store.checks['t-poster-pickup']=true;
assert.equal(pickupCtx.pickup('2026-12-09'),'');
assert(pickupCtx.pickup('2026-12-11').includes('Printed poster pickup'));
assert(pickupCtx.pickup('2026-12-12').includes('Printed poster pickup'));
pickupCtx.store.checks['t-poster-pickup-wrl']=true;
assert.equal(pickupCtx.pickup('2026-12-11'),'');
assert(pickupCtx.pickup('2026-12-12').includes('Printed poster pickup'));
pickupCtx.store.checks['t-poster-pickup-tae']=true;
assert.equal(pickupCtx.pickup('2026-12-12'),'');
assert(!source.slice(source.indexOf('function renderSchedule(){'),source.indexOf('function renderPosters(){')).includes('renderPosterPickup('));
const daySource=source.slice(source.indexOf('const todaySydney='),source.indexOf('const currentSydneyTime='));
for(const [iso,expected] of [
 ['2026-12-08T12:59:00Z','2026-12-08'],
 ['2026-12-08T13:00:00Z','2026-12-09'],
 ['2026-12-11T13:00:00Z','2026-12-12']
]){
 const fake={...Date,now:()=>Date.parse(iso)};
 const dayCtx={Intl,TZ:'Australia/Sydney',Date:class extends Date{constructor(){super(iso)}}};
 vm.runInNewContext(daySource+';this.day=todaySydney();',dayCtx);
 assert.equal(dayCtx.day,expected,'Wrong Sydney day at '+iso);
}

console.log(`Calendar export passed: ${guide.events.length} events, Australia/Sydney TZ, unknown-time safeguards`);
