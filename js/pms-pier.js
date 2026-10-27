"use strict";
/* ================= PIER COUNTER: always show what can be sold =================
   Lists the next 3 days of departures grouped by day, hides departed ones (collapsed),
   explains why a departure can't be sold (full, sales closed, boat in maintenance)
   and scrolls to the sale form when a departure is picked. */
(function(){const s=document.createElement("style");s.textContent=`
.pier-day{font-size:1.1rem;margin:18px 0 10px;display:flex;gap:10px;align-items:baseline}
.pier-tile:not(:disabled){cursor:pointer}.pier-tile:not(:disabled):hover{border-color:var(--lagoon);box-shadow:0 0 0 2px var(--shallow)}
.pier-tile.off{opacity:.55;background:var(--surface-2)}
.pier-ok{color:var(--ok);font-weight:600}
.pier-note{background:var(--gold-soft);border-color:transparent;margin-bottom:6px}
.pier-gone{margin-top:18px}.pier-gone summary{cursor:pointer;font-weight:600;color:var(--ink-2)}`;document.head.appendChild(s);})();
PX.pier=()=>{
  const q=ui.pq.pier=ui.pq.pier||{sid:null,n:1,pay:"Cash",pax:[],phone:"",done:null,start:Date.now()};
  if(q.done){const h=H(q.done);return {title:tx("Pier counter"),sub:"Sale complete",body:`<div class="card" style="margin-bottom:14px"><b>Sold. Booking ${esc(q.done)}, paid ${fmtUSD(folio(q.done).paid)} by ${esc((h.payments[0]||{}).method||"")}.</b><p class="small muted">Tickets were also sent to ${esc(h.phone)} on WhatsApp. Seat counts are updated on the app and WhatsApp straight away.</p></div><div id="inv-print">${ticketsHTML(q.done)}</div><div class="btn-row" style="justify-content:flex-start;margin-top:14px"><button class="btn" data-a="pxPierNew">Sell another</button><button class="btn btn-ghost" data-a="invPrint">Print tickets</button></div>`};}
  const now=Date.now(),last=addDays(TODAY,3);
  const all=DB.schedules.filter(s=>s.date>=TODAY&&s.date<=last&&s.status==="Scheduled").sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const gone=all.filter(s=>depTs(s)<=now),next=all.filter(s=>depTs(s)>now);
  const state=s=>{const left=seatsLeft(s);if(boat(s.boatId).status!=="Active")return ["Boat in maintenance",false];if(left<=0)return ["Full",false];
    if(!saleOpen(s))return ["Sales closed at "+wibTime(depTs(s)-DB.pms.rules.closeMin*6e4),false];return ["On sale until "+wibTime(depTs(s)-DB.pms.rules.closeMin*6e4),true];};
  const tile=s=>{const r=route(s.routeId),left=seatsLeft(s),[why,ok]=state(s);
    return `<button class="pier-tile ${q.sid===s.id?"on":""} ${ok?"":"off"}" data-a="pxPierPick" data-sid="${s.id}" ${ok?"":"disabled"} aria-label="${esc(s.time+" "+portShort(r.from)+" to "+portShort(r.to)+", "+why)}"><span class="tiny muted">${esc(boat(s.boatId).name)}</span><b style="font-size:1.25rem">${s.time}</b><span>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</span><span class="small ${ok&&left<=4?"miss":""}">${left>0?left+" "+tx("Seats left").toLowerCase()+", "+fmtUSD(s.price):"No seats left"}</span><span class="tiny ${ok?"pier-ok":"muted"}">${esc(why)}</span></button>`;};
  const days=[...new Set(next.map(s=>s.date))];
  const dayLbl=d=>d===TODAY?tx("Today"):d===addDays(TODAY,1)?"Tomorrow, "+fd(d):fd(d);
  const openToday=next.filter(s=>s.date===TODAY&&state(s)[1]).length;
  const tiles=(openToday?"":`<div class="card pier-note"><b>${gone.some(s=>s.date===TODAY)?"Today's departures have all left or closed for sale.":"No departures left on sale today."}</b> <span class="small muted">Sell seats for the next departures below.</span></div>`)+
    days.map(d=>{const ds=next.filter(s=>s.date===d),n=ds.filter(s=>state(s)[1]).length;return `<h3 class="pier-day">${dayLbl(d)} <span class="tiny muted">${n} of ${ds.length} on sale</span></h3><div class="pier-grid">${ds.map(tile).join("")}</div>`;}).join("")+
    (gone.filter(s=>s.date===TODAY).length?`<details class="pier-gone"><summary>Departed today (${gone.filter(s=>s.date===TODAY).length})</summary><p class="small muted">${gone.filter(s=>s.date===TODAY).map(s=>{const r=route(s.routeId);return s.time+" "+portShort(r.from)+" to "+portShort(r.to);}).join(", ")}</p></details>`:"");
  let form="";
  if(q.sid){const s=sch(q.sid),r=route(s.routeId),qt=quoteBoat([s.id],q.n);while(q.pax.length<q.n)q.pax.push({name:"",nat:"Indonesia",passport:""});
    form=`<section class="panel" id="pier-form" style="margin-top:16px"><div class="card-head"><h3 style="margin:0">${s.time} ${esc(portShort(r.from))} to ${esc(portShort(r.to))}, ${fd(s.date)}</h3><span class="nb-timer" id="nb-timer">0:00</span></div>
     <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label class="field" style="width:120px"><span>${tx("Passengers")}</span><select class="input" data-on="pxPierN">${[1,2,3,4,5,6].filter(n=>n<=seatsLeft(s)).map(n=>`<option ${q.n===n?"selected":""}>${n}</option>`).join("")}</select></label>
      <label class="field" style="min-width:220px"><span>Lead passenger phone</span><input class="input" data-pier="phone" value="${esc(q.phone)}" placeholder="+62 812 3456 7890"></label></div>
     ${Array.from({length:q.n},(_,i)=>`<div class="grid3" style="margin-top:10px"><input class="input" data-pier="${i}|name" placeholder="Passenger ${i+1} full name" value="${esc(q.pax[i].name)}"><select class="input" data-pier="${i}|nat">${COUNTRIES.map(c=>`<option ${q.pax[i].nat===c?"selected":""}>${c}</option>`).join("")}</select><input class="input" data-pier="${i}|passport" placeholder="KTP or passport number" value="${esc(q.pax[i].passport)}"></div>`).join("")}
     <div style="display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap"><div class="segbar">${["Cash","QRIS"].map(m=>`<button class="${q.pay===m?"on":""}" data-a="pxPierPay" data-v="${m}">${m}</button>`).join("")}</div><b style="font-size:1.2rem">${fmtUSD(qt.total)}</b><span class="small muted">Rp ${Math.round(qt.total*DB.pms.rules.fx.IDR).toLocaleString("id-ID")}</span>
      <button class="btn" data-a="pxSell">${tx("Sell seats")} (${q.n})</button></div>${ui.nbErr?`<p class="err" style="margin-top:10px">${esc(ui.nbErr)}</p>`:""}</section>`;}
  return {title:tx("Pier counter"),sub:`Walk-in seat sales. Sales close ${DB.pms.rules.closeMin} minutes before departure on every channel`,body:`${days.length?tiles:`<div class="empty"><p>No departures scheduled in the next 3 days.</p></div>`}${form}`};
};

const _pierPick=A.pxPierPick;
A.pxPierPick=el=>{_pierPick(el);setTimeout(()=>{const f=document.getElementById("pier-form");if(f)f.scrollIntoView({behavior:"smooth",block:"start"});},30);};
render(true);
