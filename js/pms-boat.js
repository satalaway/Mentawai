"use strict";
/* ================= SPEEDBOAT TYPES, SEAT LAYOUTS AND PHOTOS =================
   Setup > Speedboats: boat types (model, specs, seat layout as rows x seats left/right of the aisle, photos)
   and boats (type, registration, photos). Seat labels, auto seat assignment and the guest seat map
   all follow the boat type's layout. */
(function(){const s=document.createElement("style");s.textContent=`
.hull{width:fit-content;max-width:100%}
.bt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;margin-bottom:8px}
.bt-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column}
.bt-card .cover{aspect-ratio:16/8;background:var(--sand);display:grid;place-items:center;overflow:hidden}
.bt-card .cover img{width:100%;height:100%;object-fit:cover;display:block}.bt-card .cover img.logo{width:auto;height:70%;object-fit:contain}
.bt-card .body{padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1}
.bt-spec{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:.84rem}.bt-spec dt{color:var(--ink-2)}.bt-spec dd{margin:0;font-weight:600}
.mini-hull{display:inline-flex;flex-direction:column;gap:3px;background:var(--surface-2);border-radius:40px 40px 10px 10px;padding:16px 10px 8px}
.mini-row{display:flex;gap:3px;justify-content:center}.mini-row i{width:12px;height:12px;border-radius:3px;background:var(--lagoon);display:block}.mini-row b{width:8px}
.lay-prev{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;margin-top:8px}
.boat-thumb{width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px}
.seat-photo{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:14px;margin-bottom:12px;display:block}`;document.head.appendChild(s);})();

/* ---------- data: boat types and boats ---------- */
const BT_LETTERS="ABCDEFGH";
const btById=id=>(DB.boatTypes||[]).find(t=>t.id===id);
function btCap(t){return (+t.rows||0)*((+t.left||0)+(+t.right||0));}
function btLabels(lay){const out=[];for(let r=1;r<=lay.rows;r++)for(let j=0;j<lay.left+lay.right;j++)out.push(r+BT_LETTERS[j]);return out;}
function pxBoatLink(){
  if(!DB.boatTypes){
    DB.boatTypes=[
      {id:"bt1",name:"Mitra 24",hull:"12 m fibreglass monohull, covered cabin",engines:"2 x 250 HP outboard",speed:28,length:12,rows:6,left:2,right:2,luggage:"1 surfboard per passenger on the roof rack, bags in the bow locker",photos:[]},
      {id:"bt2",name:"Mitra 32",hull:"14 m fibreglass monohull, covered cabin",engines:"3 x 250 HP outboard",speed:30,length:14,rows:8,left:2,right:2,luggage:"1 surfboard per passenger, large rear luggage deck",photos:[]},
      {id:"bt3",name:"Mitra 16",hull:"10 m aluminium, open deck with canopy",engines:"2 x 200 HP outboard",speed:26,length:10,rows:4,left:2,right:2,luggage:"Surfboards on deck, small bags only",photos:[]}];
    const map={24:"bt1",32:"bt2",16:"bt3"};
    for(const b of DB.boats){if(!b.typeId)b.typeId=map[+b.cap]||null;if(!b.photos)b.photos=[];if(b.reg===undefined){b.reg="GT."+(20+(+b.cap||0))+" No. "+(4000+DB.boats.indexOf(b)*17)+"/PDG";b.year=2019+DB.boats.indexOf(b);}}
    save();
  }
  for(const b of DB.boats){const d=Object.getOwnPropertyDescriptor(b,"cap");if(d&&d.get)continue;let raw=+b.cap||0;if(!b.photos)b.photos=[];
    Object.defineProperty(b,"cap",{enumerable:true,configurable:true,
      get(){const t=b.typeId&&btById(b.typeId);if(!t)return raw;return Object.assign(new Number(btCap(t)),{lay:{rows:+t.rows,left:+t.left,right:+t.right}});},
      set(v){raw=+v||0;}});}
}
const _btSeatLabels=seatLabels;
seatLabels=function(cap){return cap&&cap.lay?btLabels(cap.lay):_btSeatLabels(+cap);};
pxBoatLink();
const _btRender=render;
render=function(k){pxBoatLink();return _btRender(k);};
function layOf(b){const c=b.cap;return c&&c.lay?c.lay:{rows:Math.ceil(+c/4),left:2,right:2};}
function miniHull(lay){let h="";for(let r=0;r<Math.min(lay.rows,14);r++)h+=`<div class="mini-row">${"<i></i>".repeat(lay.left)}<b></b>${"<i></i>".repeat(lay.right)}</div>`;return `<div class="mini-hull" aria-hidden="true">${h}</div>`;}
function boatPhoto(b){const t=b&&btById(b.typeId);return (b&&(b.photos||[])[0])||(t&&(t.photos||[])[0])||null;}
/* departures already sold must still fit the layout */
function layoutClash(boatIds,lay){const ok=new Set(btLabels(lay));const bad=[];
  for(const s of DB.schedules){if(!boatIds.includes(s.boatId)||s.status!=="Scheduled"||s.date<TODAY)continue;const miss=s.taken.filter(x=>!ok.has(x));if(miss.length)bad.push(fd(s.date)+" "+s.time+" (seats "+miss.slice(0,4).join(", ")+")");}
  return bad;}

/* ---------- guest website: seat map and boat photo follow the type ---------- */
const _btViewSeats=viewSeats;
viewSeats=function(){
  let h=_btViewSeats();const c=ui.cart,leg=ui.p.leg||0,l=c.legs[leg],d=sch(l.sid),b=boat(d.boatId),lay=layOf(b),labels=seatLabels(b.cap),per=lay.left+lay.right,t=btById(b.typeId);
  const seat=lab=>{if(!lab)return `<span></span>`;const taken=d.taken.includes(lab),on=l.seats.includes(lab);
    return `<button class="seat ${on?"on":""}" data-a="seat" data-s="${lab}" ${taken?"disabled aria-label='Seat "+lab+" taken'":`aria-pressed="${on}" aria-label="Seat ${lab}"`}>${lab}</button>`;};
  let map="";for(let i=0;i<lay.rows;i++){const row=labels.slice(i*per,i*per+per);
    map+=`<div class="seatrow" style="grid-template-columns:repeat(${lay.left},44px) 30px repeat(${lay.right},44px)">${row.slice(0,lay.left).map(seat).join("")}<span class="rn">${i+1}</span>${row.slice(lay.left).map(seat).join("")}</div>`;}
  const a='<div class="hull"><div class="helm">Helm</div>',i=h.indexOf(a),j=h.indexOf('<div class="legend">',i);
  if(i>=0&&j>i){const end=h.lastIndexOf("</div>",j);h=h.slice(0,i)+a+map+h.slice(end);}
  const ph=boatPhoto(b);
  h=h.replace('<aside class="summary"><h3>',`<aside class="summary">${ph?`<img class="seat-photo" src="${ph}" alt="${esc(b.name)}">`:""}<h3>`);
  if(t)h=h.replace(`, ${esc(b.name)}</p>`,`, ${esc(b.name)}</p><p class="tiny muted" style="margin:-8px 0 12px">${esc(t.name)} fast boat, ${btCap(t)} seats in a ${lay.left}+${lay.right} layout${t.speed?", about "+t.speed+" knots":""}</p>`);
  return h;
};
const _btViewBoats=viewBoats;
viewBoats=function(){let h=_btViewBoats();for(const b of DB.boats){const ph=boatPhoto(b);if(ph)h=h.split(`<span class="chip">${esc(b.name)}</span>`).join(`<span class="chip"><img class="boat-thumb" src="${ph}" alt="">${esc(b.name)}</span>`);}return h;};

/* ---------- staff: Setup > Speedboats ---------- */
PXM.pxBtEd=m=>{const d=m.d,lay={rows:+d.rows||0,left:+d.left||0,right:+d.right||0},n=btCap(lay);
  return mod(m.id?"Edit speedboat type":"Add speedboat type",`<div class="grid2">
   <label class="field"><span>Type name</span><input class="input" data-d="name" value="${esc(d.name)}" placeholder="Mitra 40"></label>
   <label class="field"><span>Hull and cabin</span><input class="input" data-d="hull" value="${esc(d.hull)}" placeholder="15 m fibreglass, covered cabin"></label>
   <label class="field"><span>Engines</span><input class="input" data-d="engines" value="${esc(d.engines)}" placeholder="3 x 250 HP outboard"></label>
   <div class="grid2"><label class="field"><span>Length (m)</span><input class="input" type="number" min="0" data-d="length" value="${esc(d.length)}"></label><label class="field"><span>Speed (knots)</span><input class="input" type="number" min="0" data-d="speed" value="${esc(d.speed)}"></label></div></div>
  <label class="field" style="margin-top:12px"><span>Luggage and surfboards</span><input class="input" data-d="luggage" value="${esc(d.luggage)}"></label>
  <p class="sec-lbl">Seat format</p>
  <div class="lay-prev"><div class="grid3" style="flex:1;min-width:260px">
   <label class="field"><span>Rows</span><input class="input" type="number" min="1" max="20" data-d="rows" data-rr="1" value="${esc(d.rows)}"></label>
   <label class="field"><span>Seats left of aisle</span><select class="input" data-d="left" data-rr="1">${[1,2,3,4].map(x=>`<option ${+d.left===x?"selected":""}>${x}</option>`).join("")}</select></label>
   <label class="field"><span>Seats right of aisle</span><select class="input" data-d="right" data-rr="1">${[0,1,2,3,4].map(x=>`<option ${+d.right===x?"selected":""}>${x}</option>`).join("")}</select></label>
   <p class="small" style="grid-column:1/-1"><b>${n} passenger seats</b>, ${lay.left}+${lay.right} across, labelled ${n?`1A to ${lay.rows}${BT_LETTERS[lay.left+lay.right-1]}`:"-"}. Boats of this type sell exactly these seats.</p></div>
   ${n?miniHull(lay):""}</div>
  <p class="sec-lbl">Photos (the first one is the cover, shown to guests when they pick seats)</p>${photoEditor(d.photos,6)}${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxBtSave">${tx("Save")}</button></div>`,true);};
PXM.pxBoatEd=m=>{const d=m.d,t=btById(d.typeId);
  return mod(m.id?"Edit "+esc(d.name||"boat"):"Add speedboat",`<div class="grid2">
   <label class="field"><span>Boat name</span><input class="input" data-d="name" value="${esc(d.name)}" placeholder="KM Mitra Empat"></label>
   <label class="field"><span>Speedboat type</span><select class="input" data-d="typeId" data-rr="1">${(DB.boatTypes||[]).map(x=>`<option value="${x.id}" ${d.typeId===x.id?"selected":""}>${esc(x.name)}, ${btCap(x)} seats (${x.left}+${x.right})</option>`).join("")}</select></label>
   <label class="field"><span>Registration</span><input class="input" data-d="reg" value="${esc(d.reg)}" placeholder="GT.24 No. 4017/PDG"></label>
   <label class="field"><span>Year built</span><input class="input" type="number" min="1980" max="2030" data-d="year" value="${esc(d.year)}"></label>
   <label class="field"><span>Operator</span><input class="input" data-d="operator" value="${esc(d.operator)}"></label>
   <label class="field"><span>${tx("Status")}</span><select class="input" data-d="status">${["Active","Maintenance","Retired"].map(x=>`<option ${d.status===x?"selected":""}>${x}</option>`).join("")}</select></label></div>
  ${t?`<div class="lay-prev"><p class="small" style="flex:1;min-width:220px"><b>${btCap(t)} seats</b> in a ${t.left}+${t.right} layout, ${t.rows} rows. ${esc(t.hull||"")}${t.engines?", "+esc(t.engines):""}.</p>${miniHull({rows:+t.rows,left:+t.left,right:+t.right})}</div>`:""}
  <p class="sec-lbl">Photos of this boat (if none, guests see the type's photo)</p>${photoEditor(d.photos,6)}${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxBoatSave">${tx("Save")}</button></div>`,true);};
document.addEventListener("change",e=>{if(e.target.dataset.rr&&ui.modal&&ui.modal.d)setTimeout(()=>render(true),0);});
Object.assign(A,{
  pxBtEdit:el=>{const t=el.dataset.id?btById(el.dataset.id):null;const b=t||{name:"",hull:"",engines:"",length:"",speed:"",luggage:"1 surfboard per passenger",rows:8,left:2,right:2,photos:[]};
    ui.modal={kind:"pxBtEd",id:t?t.id:null,d:{name:b.name,hull:b.hull||"",engines:b.engines||"",length:b.length||"",speed:b.speed||"",luggage:b.luggage||"",rows:b.rows,left:b.left,right:b.right,photos:(b.photos||[]).slice()}};render(true);},
  pxBtSave:()=>{const m=ui.modal,d=m.d,lay={rows:+d.rows,left:+d.left,right:+d.right};
    if(!String(d.name).trim())return pxErr("Give the type a name, for example Mitra 40.");
    if(!(lay.rows>=1&&lay.rows<=20)||!(lay.left>=1)||lay.left+lay.right>8)return pxErr("Use 1 to 20 rows and up to 8 seats across.");
    if(m.id){const ids=DB.boats.filter(b=>b.typeId===m.id).map(b=>b.id),bad=layoutClash(ids,lay);if(bad.length)return pxErr("Seats already sold on upcoming departures don't fit this layout: "+bad.slice(0,3).join("; ")+". Move those passengers first.");}
    const vals={name:String(d.name).trim(),hull:String(d.hull||"").trim(),engines:String(d.engines||"").trim(),length:+d.length||0,speed:+d.speed||0,luggage:String(d.luggage||"").trim(),rows:lay.rows,left:lay.left,right:lay.right,photos:d.photos.slice()};
    let t=m.id?btById(m.id):null;const backup=t?JSON.stringify(t):null;
    if(t)Object.assign(t,vals);else{t=Object.assign({id:"bt"+Date.now().toString(36)},vals);DB.boatTypes.push(t);}
    if(!saveOk()){if(backup)Object.assign(t,JSON.parse(backup));else DB.boatTypes=DB.boatTypes.filter(x=>x!==t);return pxErr("The browser's storage is full. Remove a photo or two and try again.");}
    audit("Boat type",t.id,m.id?"Type updated":"Type added",null,t.name+", "+btCap(t)+" seats "+t.left+"+"+t.right);save();ui.modal=null;toast(t.name+" saved, "+btCap(t)+" seats");},
  pxBoatEdit:el=>{const b=el.dataset.id?boat(el.dataset.id):null;
    ui.modal={kind:"pxBoatEd",id:b?b.id:null,d:b?{name:b.name,typeId:b.typeId||(DB.boatTypes[0]||{}).id,reg:b.reg||"",year:b.year||"",operator:b.operator,status:b.status,photos:(b.photos||[]).slice()}
      :{name:"",typeId:(DB.boatTypes[0]||{}).id,reg:"",year:"",operator:ent(LE_BOAT).name,status:"Active",photos:[]}};render(true);},
  pxBoatSave:()=>{const m=ui.modal,d=m.d,t=btById(d.typeId);
    if(!String(d.name).trim())return pxErr("Give the boat a name.");if(!t)return pxErr("Pick a speedboat type.");
    if(DB.boats.some(b=>b.id!==m.id&&b.name.toLowerCase()===String(d.name).trim().toLowerCase()))return pxErr("Another boat already has that name.");
    if(m.id){const bad=layoutClash([m.id],{rows:+t.rows,left:+t.left,right:+t.right});if(bad.length)return pxErr("Seats already sold on upcoming departures don't exist on a "+t.name+": "+bad.slice(0,3).join("; ")+".");}
    const vals={name:String(d.name).trim(),typeId:t.id,reg:String(d.reg||"").trim(),year:+d.year||"",operator:String(d.operator||"").trim(),status:d.status,photos:d.photos.slice()};
    let b=m.id?boat(m.id):null;const backup=b?{name:b.name,typeId:b.typeId,reg:b.reg,year:b.year,operator:b.operator,status:b.status,photos:b.photos}:null;
    if(b)Object.assign(b,vals);else{b=Object.assign({id:"b"+Date.now().toString(36),cap:btCap(t)},vals);DB.boats.push(b);pxBoatLink();}
    if(!saveOk()){if(backup)Object.assign(b,backup);else DB.boats=DB.boats.filter(x=>x!==b);return pxErr("The browser's storage is full. Remove a photo or two and try again.");}
    audit("Boat",b.id,m.id?"Boat updated":"Boat added",null,b.name+", "+t.name);save();ui.modal=null;toast(b.name+" saved");}
});
ON.bxType=el=>{const b=boat(el.dataset.id),t=btById(el.value);const bad=layoutClash([b.id],{rows:+t.rows,left:+t.left,right:+t.right});
  if(bad.length){toast("Can't change: seats sold on "+bad[0]+" don't exist on a "+t.name);return render(true);}
  const before=(btById(b.typeId)||{}).name;b.typeId=t.id;audit("Boat",b.id,"Type changed",before,t.name);save();toast(b.name+" is now a "+t.name+", "+btCap(t)+" seats");};
const _btSetup=PX.setup;
PX.setup=()=>{
  const tab=ui.pq.setup||"ent";const pg=_btSetup();pg.body=pg.body.replace(">Properties and asset types<",">Properties<");if(tab!=="boats")return pg;
  const cut=pg.body.indexOf("</div>")+6,tabs=pg.body.slice(0,cut);
  const F=legacyBody(viewFleet),D=legacyBody(viewDeps);const ri=F.b.indexOf('<h2 style="font-size:1.35rem;margin:28px 0 10px">Routes</h2>');const routes=ri>=0?F.b.slice(ri).replace('margin:28px 0 10px">Routes','margin:28px 0 10px">Routes'):"";
  const types=`<div class="vb-head" style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap"><div><h2 style="font-size:1.35rem">Speedboat types</h2><p class="small muted">Model, specs, seat format and photos. Every boat belongs to one type.</p></div><button class="btn btn-soft btn-sm" data-a="pxBtEdit">Add type</button></div>
   <div class="bt-grid">${(DB.boatTypes||[]).map(t=>{const used=DB.boats.filter(b=>b.typeId===t.id);const ph=(t.photos||[])[0];return `<article class="bt-card"><div class="cover">${ph?`<img src="${ph}" alt="${esc(t.name)}">`:`<img class="logo" src="${LOGO_BOAT}" alt="">`}</div>
    <div class="body"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><h3 style="font-size:1.15rem">${esc(t.name)}</h3><p class="small muted">${btCap(t)} seats, ${t.left}+${t.right} across, ${t.rows} rows</p></div>${miniHull({rows:+t.rows,left:+t.left,right:+t.right})}</div>
    <dl class="bt-spec">${t.hull?`<dt>Hull</dt><dd>${esc(t.hull)}</dd>`:""}${t.engines?`<dt>Engines</dt><dd>${esc(t.engines)}</dd>`:""}${t.speed?`<dt>Speed</dt><dd>About ${t.speed} knots</dd>`:""}${t.luggage?`<dt>Luggage</dt><dd>${esc(t.luggage)}</dd>`:""}<dt>Boats</dt><dd>${used.map(b=>esc(b.name)).join(", ")||"None yet"}</dd></dl>
    <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center"><span class="tiny muted">${(t.photos||[]).length} photo${(t.photos||[]).length===1?"":"s"}</span><button class="btn btn-ghost btn-sm" data-a="pxBtEdit" data-id="${t.id}">Edit type</button></div></div></article>`;}).join("")}</div>`;
  const boats=`<div class="vb-head" style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin:26px 0 10px;flex-wrap:wrap"><div><h2 style="font-size:1.35rem">Boats</h2><p class="small muted">Boats in maintenance stay on the schedule, but their departures are hidden from guests until the boat is active again.</p></div><button class="btn btn-soft btn-sm" data-a="pxBoatEdit">Add boat</button></div>
   <div class="tbl-wrap"><table><thead><tr><th></th><th>${tx("Boat")}</th><th>Type</th><th>Seats</th><th>Departures, next 30 days</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${DB.boats.map(b=>{const ph=boatPhoto(b),n=DB.schedules.filter(s=>s.boatId===b.id&&s.date>=TODAY&&s.date<addDays(TODAY,30)&&s.status==="Scheduled").length,lay=layOf(b);
    return `<tr><td><div class="thumb-ph">${ph?`<img class="thumb" src="${ph}" alt="">`:`<img class="thumb" src="${LOGO_BOAT}" alt="" style="object-fit:contain;background:#fff">`}</div></td><td><b>${esc(b.name)}</b><div class="tiny muted">${esc(b.reg||"")}${b.year?", built "+b.year:""}</div></td>
     <td><select class="input hk-sel" data-on="bxType" data-id="${b.id}" aria-label="Type of ${esc(b.name)}">${(DB.boatTypes||[]).map(t=>`<option value="${t.id}" ${b.typeId===t.id?"selected":""}>${esc(t.name)}</option>`).join("")}</select></td><td>${+b.cap} <span class="tiny muted">(${lay.left}+${lay.right})</span></td><td>${n}</td>
     <td><select class="input hk-sel" data-on="boatStatus" data-id="${b.id}" aria-label="Status of ${esc(b.name)}">${["Active","Maintenance","Retired"].map(s=>`<option ${b.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-a="pxBoatEdit" data-id="${b.id}">Edit boat</button></td></tr>`;}).join("")}</tbody></table></div>`;
  pg.body=tabs+types+boats+routes+`<h2 style="font-size:1.35rem;margin:28px 0 10px">Departure timetable</h2>`+D.b;
  pg.actions=`<button class="btn btn-ghost btn-sm" data-a="modal" data-m="route">Add route</button><button class="btn btn-sm" data-a="modal" data-m="dep">Add departures</button>`;
  return pg;
};
render(true);
