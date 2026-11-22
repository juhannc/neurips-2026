/* Small, dependency-free day calendar geometry. Also usable by Node's test runner. */
(function(root){
  "use strict";
  function minutes(time) {
    if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
    return Number(time.slice(0,2))*60 + Number(time.slice(3,5));
  }
  function isTimed(e) {
    const start=minutes(e.start), end=minutes(e.end);
    return start!==null && end!==null && end>start;
  }
  function plan(events) {
    const timed=events.filter(isTimed).map(e=>({event:e,start:minutes(e.start),end:minutes(e.end)}))
      .sort((a,b)=>a.start-b.start || b.end-a.end || String(a.event.id).localeCompare(String(b.event.id)));
    const clusters=[]; let current=[],clusterEnd=-1;
    function push(){if(current.length)clusters.push(current);current=[];clusterEnd=-1;}
    for(const entry of timed){
      if(current.length && entry.start>=clusterEnd)push();
      current.push(entry); clusterEnd=Math.max(clusterEnd,entry.end);
    }
    push();
    const positioned=[]; let maxColumns=1;
    for(const cluster of clusters){
      const ends=[];
      for(const entry of cluster){
        let col=ends.findIndex(end=>end<=entry.start);
        if(col<0){col=ends.length;ends.push(entry.end);}else ends[col]=entry.end;
        positioned.push({...entry,column:col});
      }
      maxColumns=Math.max(maxColumns,ends.length);
      for(const entry of positioned.slice(-cluster.length))entry.columns=ends.length;
    }
    return {entries:positioned, maxColumns, untimed:events.filter(e=>!isTimed(e))};
  }
  const api={minutes,isTimed,plan};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.NeuroCalendar=api;
})(typeof window!=="undefined"?window:globalThis);
