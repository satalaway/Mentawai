"use strict";
/* ---------- availability: Gantt view (one bar per booking) ---------- */
(function(){const s=document.createElement("style");s.textContent=`
.gc{--gc-first:240px;background:var(--surface);border:1px solid var(--line);border-radius:18px;overflow-x:auto}
.gc-in{min-width:1000px}
.gc-row{display:grid;border-bottom:1px solid var(--line)}
.gc-row:last-child{border-bottom:0}
.gc-lab{grid-column:1;grid-row:1;padding:14px 16px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:3px;justify-content:center;position:sticky;left:0;background:var(--surface);z-index:3}
.gc-lab b{font-weight:600;font-size:.95rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.gc-lab span{font-size:.78rem;color:var(--ink-2)}
.gc-head .gc-lab{color:var(--ink-2)}
.gc-day{grid-row:1;padding:14px 6px;text-align:center;font-size:.84rem;color:var(--ink-2);border-right:1px solid var(--line);display:flex;align-items:center;justify-content:center}
.gc-day.wk{color:var(--gold)}
.today{background:color-mix(in srgb,var(--shallow) 45%,transparent)}
.gc-day.today{color:var(--lagoon-ink);font-weight:700}
.gc-cell{grid-row:1;border:0;border-right:1px solid var(--line);background:transparent;min-height:76px;cursor:pointer;padding:0}
.gc-cell.today{background:color-mix(in srgb,var(--shallow) 45%,transparent)}
.gc-cell:hover{background:var(--surface-2)}
.gc-bar{grid-row:1;z-index:2;align-self:center;margin:8px 5px;border:0;border-radius:10px;padding:8px 12px;text-align:left;color:#fff;background:var(--lagoon);overflow:hidden;min-height:56px;display:flex;flex-direction:column;justify-content:center;gap:3px;box-shadow:0 1px 2px rgba(18,41,58,.14);min-width:0}
.gc-bar b{font-size:.86rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gc-bar span{font-size:.74rem;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gc-bar:hover{filter:brightness(1.07)}
.gc-bar.inuse{background:#12293A}
.gc-bar.hold{background:var(--gold-soft);color:var(--gold);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--gold) 35%,transparent)}
.gc-bar.done{background:var(--surface-2);color:var(--ink-2);box-shadow:inset 0 0 0 1px var(--line)}
.gc-bar.oos{background:repeating-linear-gradient(135deg,var(--surface-2) 0 6px,var(--line) 6px 11px);color:var(--ink-2);box-shadow:none}
.gc-bar.cl{border-top-left-radius:0;border-bottom-left-radius:0;margin-left:0}
.gc-bar.cr{border-top-right-radius:0;border-bottom-right-radius:0;margin-right:0}
.gc-grp,.gc-grp .gc-lab{background:var(--sand)}
.gc-sum{grid-row:1;border-right:1px solid var(--line);display:flex;align-items:center;justify-content:center;text-align:center;font-size:.8rem;padding:8px 4px}
.gc-grp .gc-sum{color:var(--sand-ink)}
.gc-foot .gc-sum{font-weight:700;color:var(--lagoon-ink);font-size:.88rem;background:color-mix(in srgb,var(--shallow) 30%,transparent)}
.gc-foot .gc-sum.low{color:var(--danger)}
.gc-dcell{grid-row:1;border-right:1px solid var(--line);padding:6px;display:flex;flex-direction:column;gap:5px;justify-content:center;min-height:62px}
.gc-dep{position:relative;display:flex;justify-content:space-between;gap:6px;align-items:center;border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:6px 8px 7px;font-size:.75rem;overflow:hidden;color:var(--ink)}
.gc-dep:hover{border-color:var(--lagoon)}
.gc-dep i{position:absolute;left:0;bottom:0;height:3px;background:var(--lagoon)}
.gc-dep.full i{background:var(--danger)}
.gc-dep.x{text-decoration:line-through;color:var(--danger);background:var(--danger-soft)}
.gc-range{font-family:var(--display);font-size:1.35rem;margin-right:auto}
.gc-legend{display:flex;gap:18px;flex-wrap:wrap;font-size:.82rem;color:var(--ink-2);margin-top:14px}
.gc-legend i{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:6px}
@media (max-width:820px){.gc{--gc-first:170px}}`;document.head.appendChild(s);})();
PX.cal=()=>{
  const q=ui.pq.cal=ui.pq.cal||{type:"all",start:TODAY};const N=7,days=Array.from({length:N},(_,i)=>addDays(q.start,i)),end=addDays(q.start,N);
  const loc=ui.lang==="id"?"id-ID":"en-GB",D=(d,o)=>new Date(d+"T00:00:00Z").toLocaleDateString(loc,Object.assign({timeZone:"UTC"},o));
  const short=d=>D(d,{day:"numeric",month:"short"}),range=`${D(q.start,{day:"numeric",month:"short"})}${ui.lang==="id"?" s.d. ":" to "}${D(addDays(q.start,N-1),{day:"numeric",month:"long",year:"numeric"})}`;
  const cols=`grid-template-columns:var(--gc-first) repeat(${N},minmax(0,1fr))`,col=i=>`grid-column:${i+2}`;
  const span=(a,z)=>{const s=a<q.start?q.start:a,e=z>end?end:z;return {c:`grid-column:${2+diffDays(q.start,s)}/${2+diffDays(q.start,e)}`,l:a<q.start,r:z>end,n:diffDays(s,e)};};
  const left=ms=>{const m=Math.max(0,Math.round(ms/6e4));return m>=60?Math.floor(m/60)+"h "+(m%60)+"m":m+"m";};
  const lifeLbl={"Hold":"On hold","In use":"In-house","Confirmed":"Confirmed","Completed":"Checked out"};
  const lifeId={"On hold":"Ditahan","In-house":"Menginap","Confirmed":"Terkonfirmasi","Checked out":"Selesai"};
  const L=s=>ui.lang==="id"&&lifeId[s]?lifeId[s]:s;const TO=ui.lang==="id"?" s.d. ":" to ",OF=(a,b)=>ui.lang==="id"?`${a} dari ${b} kosong`:`${a} of ${b} free`;
  const roomRow=r=>{
    const bs=DB.bookings.filter(b=>b.type==="villa"&&b.roomId===r.id&&!["Cancelled","No-show"].includes(b.status)&&b.checkIn<end&&b.checkOut>q.start);
    const cells=days.map((d,i)=>`<button class="gc-cell ${d===TODAY?"today":""}" style="${col(i)}" data-a="pxNewFrom" data-room="${r.id}" data-d="${d}" aria-label="Book ${esc(r.name)} from ${fd(d)}" title="Free. Click to book"></button>`).join("");
    const bars=bs.map(b=>{const life=itemLife(b),lab=lifeLbl[life]||life,sp=span(b.checkIn,b.checkOut),h=H(b.ref);
      const cls=life==="Hold"?"hold":life==="In use"?"inuse":life==="Completed"?"done":"";
      const who=sp.n>=2?b.contact.name:b.contact.name.split(" ")[0];
      const sub=`${short(b.checkIn)}${TO}${short(b.checkOut)}${life==="Hold"&&h&&h.holdUntil?", "+left(h.holdUntil-Date.now())+" left":sp.n>=2?", "+b.ref:""}`;
      return `<button class="gc-bar ${cls} ${sp.l?"cl":""} ${sp.r?"cr":""}" style="${sp.c}" data-a="pxOpen" data-ref="${b.ref}" title="${esc(b.contact.name+", "+L(lab)+", "+fd(b.checkIn)+" to "+fd(b.checkOut)+", "+b.ref)}"><b>${esc(who)}, ${esc(L(lab))}</b><span>${sub}</span></button>`;}).join("");
    const bl=DB.blocks.filter(k=>k.roomId===r.id&&k.date>=q.start&&k.date<end).map(k=>k.date).sort();const runs=[];
    bl.forEach(d=>{const last=runs[runs.length-1];if(last&&addDays(last.e,0)===d)last.e=addDays(d,1);else runs.push({s:d,e:addDays(d,1),reason:(oosOn(r.id,d)||{}).reason});});
    const oos=runs.map(x=>{const sp=span(x.s,x.e);return `<button class="gc-bar oos ${sp.l?"cl":""} ${sp.r?"cr":""}" style="${sp.c}" data-a="pv" data-v="mnt" title="Out of service"><b>Out of service</b><span>${esc(x.reason||"")}</span></button>`;}).join("");
    return `<div class="gc-row" style="${cols}"><div class="gc-lab"><b>${esc(r.name)} ${hkBadge(DB.pms.hk[r.id])}</b><span>${fmtUSD(r.price)} base, sleeps ${r.cap}</span></div>${cells}${bars}${oos}</div>`;};
  const freeOn=(rooms,d)=>rooms.filter(r=>!stayToday(r.id,d)&&!oosOn(r.id,d)).length;
  let html=`<div class="gc-row gc-head" style="${cols}"><div class="gc-lab">${q.type==="boats"?tx("Route"):tx("Room")}</div>${days.map((d,i)=>`<div class="gc-day ${d===TODAY?"today":""} ${[0,6].includes(dow(d))?"wk":""}" style="${col(i)}">${D(d,{weekday:"short",day:"numeric",month:"short"})}</div>`).join("")}</div>`;
  if(q.type!=="boats"){const all=[];
    for(const v of DB.villas){const rs=v.rooms.filter(r=>r.active);all.push(...rs);
      html+=`<div class="gc-row gc-grp" style="${cols}"><div class="gc-lab"><b>${esc(v.name)}</b><span>${esc(v.island)}, ${rs.length} rooms</span></div>${days.map((d,i)=>`<div class="gc-sum" style="${col(i)}">${OF(freeOn(rs,d),rs.length)}</div>`).join("")}</div>`;
      html+=rs.map(roomRow).join("");}
    html+=`<div class="gc-row gc-foot" style="${cols}"><div class="gc-lab"><b>Rooms available</b><span>All rooms minus sold, on hold and out of service</span></div>${days.map((d,i)=>{const n=freeOn(all,d);return `<div class="gc-sum ${n<=1?"low":""} ${d===TODAY?"today":""}" style="${col(i)}">${n} of ${all.length}</div>`;}).join("")}</div>`;}
  if(q.type!=="rooms"){
    html+=`<div class="gc-row gc-grp" style="${cols}"><div class="gc-lab"><b>Speedboat departures</b><span>Seats sold of capacity. Click for the manifest</span></div>${days.map((d,i)=>{const ds=DB.schedules.filter(s=>s.date===d&&s.status==="Scheduled");return `<div class="gc-sum" style="${col(i)}">${ds.length} departures</div>`;}).join("")}</div>`;
    for(const rt of DB.routes){
      html+=`<div class="gc-row" style="${cols}"><div class="gc-lab"><b>${esc(portShort(rt.from))} to ${esc(portShort(rt.to))}</b><span>${durTxt(rt.mins)}</span></div>${days.map((d,i)=>{const ds=DB.schedules.filter(s=>s.routeId===rt.id&&s.date===d).sort((a,b)=>a.time.localeCompare(b.time));
        return `<div class="gc-dcell ${d===TODAY?"today":""}" style="${col(i)}">${ds.map(s=>{const c=boat(s.boatId).cap,u=s.taken.length/c;return `<button class="gc-dep ${s.status==="Cancelled"?"x":u>=.85?"full":""}" data-a="pxManifest" data-sid="${s.id}" title="${esc(boat(s.boatId).name+", "+s.taken.length+" of "+c+" seats sold")}"><b>${s.time}</b><span>${s.taken.length}/${c}</span><i style="width:${Math.round(u*100)}%"></i></button>`;}).join("")}</div>`;}).join("")}</div>`;}
    html+=`<div class="gc-row gc-foot" style="${cols}"><div class="gc-lab"><b>Seats available</b><span>Across all open departures</span></div>${days.map((d,i)=>{const ds=DB.schedules.filter(s=>s.date===d&&s.status==="Scheduled");const n=ds.reduce((a,s)=>a+seatsLeft(s),0);return `<div class="gc-sum ${d===TODAY?"today":""}" style="${col(i)}">${n} seats</div>`;}).join("")}</div>`;}
  const body=`<div class="filters" style="align-items:center"><span class="gc-range">${range}</span><div class="segbar">${[["all","All"],["rooms",tx("Rooms")],["boats",tx("Speedboats")]].map(x=>`<button class="${q.type===x[0]?"on":""}" data-a="pxCalType" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>
   <button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="-7">Previous week</button><button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="0">${tx("Today")}</button><button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="7">Next week</button></div>
  <div class="gc"><div class="gc-in">${html}</div></div>
  <div class="gc-legend"><span><i style="background:var(--lagoon)"></i>${L("Confirmed")}</span><span><i style="background:#12293A"></i>${L("In-house")}</span><span><i style="background:var(--gold-soft);box-shadow:inset 0 0 0 1px var(--gold)"></i>${L("On hold")} (waiting for payment)</span><span><i style="background:var(--surface-2);box-shadow:inset 0 0 0 1px var(--line)"></i>${L("Checked out")}</span><span><i style="background:repeating-linear-gradient(135deg,var(--surface-2) 0 3px,var(--line) 3px 6px)"></i>Out of service</span><span><i style="background:var(--surface);box-shadow:inset 0 0 0 1px var(--line)"></i>Free, click to book</span></div>`;
  return {title:tx("Availability"),sub:"One calendar for rooms and speedboat seats, shared by the app, WhatsApp and walk-in sales",actions:`<button class="btn btn-sm" data-a="pv" data-v="newbk">${PXI.plus.replace("<svg",'<svg width="16" height="16"')} ${tx("New booking")}</button>`,body};
};
render(true);
