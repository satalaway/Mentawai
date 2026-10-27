"use strict";
/* ================= PMS EXTENSIONS =================
   1. Housekeeping: inspection list with To do / Done tabs and filters (In house, Check out, Check in, On demand)
   2. Setup: properties (address, location, contact, description, photos) and rooms (details, amenities,
      facilities, photos), shown on the guest website
   3. Back arrow on every staff page, returning to the previous page until the role's main page */
Object.assign(PX_ID,{"To do":"Perlu dikerjakan","In house":"Menginap","On demand":"Permintaan tamu","Back":"Kembali","All":"Semua","New request":"Permintaan baru","Properties":"Properti"});
(function(){const s=document.createElement("style");s.textContent=`
.pm-back{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink);vertical-align:middle;margin-right:12px;position:relative;top:-3px}
.pm-back:hover{background:var(--surface-2);border-color:var(--lagoon)}.pm-back svg{width:18px;height:18px}
.hk-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.hk-filters button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 14px;font-weight:600;font-size:.86rem;color:var(--ink-2)}
.hk-filters button.on{background:var(--ink);border-color:var(--ink);color:#fff}
.hk-filters button i{font-style:normal;opacity:.75;margin-left:4px}
.hk-type{display:inline-flex;padding:3px 10px;border-radius:999px;font-size:.76rem;font-weight:700}
.hk-type.checkout{background:var(--danger-soft);color:var(--danger)}.hk-type.checkin{background:var(--warn-soft);color:var(--warn)}
.hk-type.inhouse{background:var(--shallow);color:var(--lagoon-ink)}.hk-type.demand{background:var(--gold-soft);color:var(--gold)}
.hk-sel{min-height:36px;height:36px;padding:4px 10px;font-size:.85rem;width:auto}
.ph-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:8px}
.ph{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:4/3;background:var(--surface-2);border:1px solid var(--line)}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph .cov{position:absolute;top:6px;left:6px;background:var(--lagoon);color:#fff;font-size:.7rem;font-weight:700;border-radius:999px;padding:2px 8px}
.ph .ph-act{position:absolute;inset:auto 6px 6px 6px;display:flex;gap:4px;justify-content:flex-end}
.ph .ph-act button{border:0;border-radius:999px;background:rgba(18,41,58,.78);color:#fff;font-size:.7rem;font-weight:700;padding:4px 8px}
.ph-up{display:grid;place-items:center;text-align:center;border:1.5px dashed var(--line);border-radius:12px;aspect-ratio:4/3;cursor:pointer;color:var(--lagoon-ink);font-weight:600;font-size:.85rem;padding:8px}
.ph-up:hover{border-color:var(--lagoon);background:var(--surface-2)}.ph-up input{display:none}
.ck-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px 12px;margin-top:6px}
.ck-grid label{display:flex;gap:8px;align-items:center;font-size:.88rem}.ck-grid input{accent-color:var(--lagoon)}
.thumb{width:72px;height:54px;border-radius:8px;object-fit:cover;display:block;background:var(--surface-2)}
.thumb-ph{width:72px;height:54px;border-radius:8px;overflow:hidden}
.prop-card{display:grid;grid-template-columns:200px 1fr auto;gap:18px;align-items:start;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;margin-bottom:12px}
.prop-card .cover{border-radius:12px;overflow:hidden;aspect-ratio:4/3}.prop-card .cover img,.prop-card .cover svg{width:100%;height:100%;object-fit:cover;display:block}
.sec-lbl{font-size:.8rem;font-weight:700;color:var(--ink-2);margin:16px 0 4px}
.room-extra .chips{margin-top:6px}
@media (max-width:820px){.prop-card{grid-template-columns:1fr}}`;document.head.appendChild(s);})();

/* ---------- data upgrade: property contacts, room details, housekeeping records ---------- */
const VIEWS=["Ocean","Lagoon","Garden","Jungle","Hillside","Pool"];
const ROOM_AMEN=["Air conditioning","Ceiling fan","Wi-Fi","Minibar","In-room safe","Hot water","Coffee and tea kettle","Mosquito net","Hammock","Private terrace","Hair dryer","Beach towels"];
const ROOM_FAC=["Ensuite bathroom","Outdoor shower","Bathtub","Kitchenette","Living area","Workspace","Extra bed available","Wheelchair accessible"];
const PROP_AMEN=["Full board meals","Breakfast and dinner","Surf guide on request","Starlink Wi-Fi","Solar power","Snorkel gear","Kayaks and paddleboards","Yoga deck","Kids' room","Laundry","Fishing trips","Jungle walks","Airport pickup in Padang","Restaurant and bar"];
const HK_REQ=["Extra towels","Extra cleaning","Turndown service","Bed linen change","Amenities refill","Maintenance check","Other"];
function pxUpgrade(){
  let ch=false;const P=DB.pms;
  const dflt={v1:{address:"Jl. Pantai Katiet, Siberut Selatan, Kepulauan Mentawai, Sumatera Barat",location:"-1.6080, 99.2370",phone:"+62 812 0000 1101",email:"siberut@mentawaiindah.example",view:"Ocean"},
    v2:{address:"Jl. Raya Tuapejat, Sipora Utara, Kepulauan Mentawai, Sumatera Barat",location:"-2.0310, 99.5930",phone:"+62 812 0000 1102",email:"sipora@mentawaiindah.example",view:"Lagoon"},
    v3:{address:"Desa Sikakap, Pagai Utara, Kepulauan Mentawai, Sumatera Barat",location:"-2.7560, 100.2410",phone:"+62 812 0000 1103",email:"pagai@mentawaiindah.example",view:"Hillside"}};
  for(const v of DB.villas){const d=dflt[v.id]||{};
    if(v.address===undefined){Object.assign(v,{address:d.address||"",location:d.location||"",phone:d.phone||"",email:d.email||"",photos:[]});ch=true;}
    if(!v.photos){v.photos=[];ch=true;}
    for(const r of v.rooms){if(r.desc===undefined){const view=d.view||"Garden";
      Object.assign(r,{view,size:r.cap>=4?55:32,desc:`A calm ${view.toLowerCase()}-view room with a ${String(r.bed||"queen bed").toLowerCase()}, ceiling fan and a private terrace.`,amen:["Air conditioning","Wi-Fi","Hot water","Mosquito net","Private terrace"],fac:["Ensuite bathroom"].concat(r.cap>=4?["Living area"]:[]),photos:[]});ch=true;}
      if(!r.photos){r.photos=[];ch=true;}if(!P.hk[r.id]){P.hk[r.id]="inspected";ch=true;}}}
  const base=P.properties.find(p=>p.id==="p2");if(base&&base.address===undefined){Object.assign(base,{address:"Pelabuhan Muaro, Jl. Batang Arau, Padang, Sumatera Barat",location:"-0.9640, 100.3600",phone:"+62 812 0000 1200",email:"boats@mentawaiindah.example"});ch=true;}
  if(!P.hkDone){P.hkDone=[];P.hkAssign={};P.hkReq=[];ch=true;
    const inh=DB.bookings.filter(b=>b.type==="villa"&&b.status==="Checked in"&&b.checkOut>TODAY);
    [["Extra towels","2 extra bath towels and 2 beach towels","Now"],["Turndown service","Guest asked for turndown at 18:00","Evening"]].forEach((x,i)=>{const b=inh[i];if(b)P.hkReq.push({id:"HR-"+(101+i),roomId:b.roomId,ref:b.ref,guest:b.contact.name,type:x[0],note:x[1],when:x[2],status:"Open",created:TODAY,at:nowIso(),by:"Budi Santoso (Front Desk)"});});}
  if(!(DB.users||[]).some(u=>u.role==="Housekeeping"&&u.name==="Ketut Ayu")){DB.users.push({id:"s9",name:"Ketut Ayu",email:"ketut@mentawaiindah.example",phone:"+62 812 7000 0019",country:"Indonesia",role:"Housekeeping",props:["p1"],status:"Active",created:addDays(TODAY,-30),lastLogin:TODAY,notes:""});ch=true;}
  if(ch)save();
}
pxUpgrade();
function saveOk(){try{localStorage.setItem(LS,JSON.stringify(DB));return true;}catch(e){return false;}}

/* ---------- guest website: real photos, room details, property contact ---------- */
function pxPhotoFor(label){
  const vil=ui.mode!=="admin"&&ui.view==="villa"?villaById(ui.p.id):null;
  if(vil){const ph=vil.photos||[];if(ph.length){if(label===vil.name)return ph[0];if(label==="Room view")return ph[1]||ph[0];if(label==="Sunset at the jetty")return ph[2]||ph[1]||ph[0];}
    const r=vil.rooms.find(x=>x.name===label);if(r)return (r.photos||[])[0]||null;}
  const v=DB.villas.find(x=>x.name===label);if(v)return (v.photos||[])[0]||null;
  return null;
}
const _pxScene=scene;
scene=function(p,v,label){const img=pxPhotoFor(label);return img?`<img class="scene" src="${img}" alt="${esc(label||"")}" style="width:100%;height:100%;object-fit:cover">`:_pxScene(p,v,label);};
function mapUrl(loc){loc=String(loc||"").trim();if(!loc)return "";return /^https?:\/\//.test(loc)?loc:"https://maps.google.com/?q="+encodeURIComponent(loc);}
const _pxExtVilla=viewVilla;
viewVilla=function(){
  let h=_pxExtVilla();const v=villaById(ui.p.id);if(!v)return h;
  for(const r of v.rooms){const tag=`>${esc(r.name)}</h3>`;const i=h.indexOf(tag);if(i<0)continue;
    const ex=`<div class="room-extra"><p class="tiny muted">${r.size?r.size+" m², ":""}${r.view?esc(r.view)+" view":""}</p>${r.desc?`<p class="small" style="margin-top:4px">${esc(r.desc)}</p>`:""}<div class="chips">${[...(r.amen||[]),...(r.fac||[])].slice(0,6).map(a=>`<span class="chip">${esc(a)}</span>`).join("")}</div></div>`;
    h=h.slice(0,i+tag.length)+ex+h.slice(i+tag.length);}
  const anchor='<h2 style="margin-bottom:6px">Rooms</h2>';
  if((v.address||v.phone||v.email)&&h.includes(anchor)){const mu=mapUrl(v.location);
    h=h.replace(anchor,`<section class="panel" style="margin-bottom:26px"><h3>Location and contact</h3>${v.address?`<p class="small">${esc(v.address)}</p>`:""}
    <p class="small" style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">${mu?`<a href="${esc(mu)}" target="_blank" rel="noopener" style="color:var(--lagoon-ink);font-weight:600">Open in Google Maps</a>`:""}${v.phone?`<a href="tel:${esc(v.phone.replace(/\s/g,""))}" style="color:var(--lagoon-ink);font-weight:600">${esc(v.phone)}</a>`:""}${v.email?`<a href="mailto:${esc(v.email)}" style="color:var(--lagoon-ink);font-weight:600">${esc(v.email)}</a>`:""}</p></section>`+anchor);}
  return h;
};

/* ---------- 3. back arrow on every staff page ---------- */
ui.navStack=ui.navStack||[];let pxLastKey=null;
const pxKey=()=>ui.pv+(ui.pv==="booking"?"|"+ui.pref:"");
const _pxExtRender=pxRender;
pxRender=function(k){
  pxUpgrade();if(!ui.pv)ui.pv=pxHome(pxRole());
  const cur=pxKey();
  if(pxLastKey&&cur!==pxLastKey&&!ui._back){ui.navStack.push(pxLastKey);if(ui.navStack.length>30)ui.navStack.shift();}
  ui._back=false;_pxExtRender(k);pxLastKey=pxKey();
};
const _pxExtShell=pxShell;
pxShell=function(pg){
  const show=ui.navStack.length>0||ui.pv!==pxHome(pxRole());
  const back=show?`<button class="pm-back" data-a="pxBack" aria-label="${tx("Back")}" title="${tx("Back")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>`:"";
  return _pxExtShell(Object.assign({},pg,{title:back+pg.title}));
};
A.pxBack=()=>{const role=pxRole();let key=null;
  while(ui.navStack.length){const k=ui.navStack.pop();const pv=k.split("|")[0];if(pxCan(pv,role)&&!(pv==="booking"&&!H(k.split("|")[1]))){key=k;break;}}
  if(!key)key=pxHome(role);const[pv,ref]=key.split("|");ui.pv=pv;if(ref)ui.pref=ref;ui._back=true;ui.modal=null;render();};
const _pxExtRole=ON.pxRole;ON.pxRole=el=>{ui.navStack=[];pxLastKey=null;_pxExtRole(el);};

/* ---------- 1. housekeeping inspection list ---------- */
const HK_T={inhouse:"In house",checkout:"Check out",checkin:"Check in",demand:"On demand"};
function hkStaff(){return (DB.users||[]).filter(u=>u.role==="Housekeeping"&&u.status==="Active").map(u=>u.name);}
function hkIsDone(rid,type,reqId){return DB.pms.hkDone.some(d=>d.date===TODAY&&d.roomId===rid&&d.type===type&&(!reqId||d.reqId===reqId));}
function hkTodo(){
  const out=[];
  for(const r of roomsList()){
    if(oosOn(r.id,TODAY))continue;
    const V=DB.bookings.filter(b=>b.type==="villa"&&b.roomId===r.id&&!["Cancelled","No-show"].includes(b.status));
    const co=V.find(b=>b.checkOut===TODAY&&["Checked in","Completed"].includes(b.status));
    const ar=V.find(b=>b.checkIn===TODAY&&["Confirmed","Paid","Awaiting payment"].includes(b.status));
    const ih=V.find(b=>b.status==="Checked in"&&b.checkIn<TODAY&&b.checkOut>TODAY);
    if(co&&!hkIsDone(r.id,"checkout"))out.push({key:"checkout|"+r.id,type:"checkout",r,b:co,arr:ar,prio:ar?1:2,
      detail:co.status==="Completed"?"Guest has checked out. Clean, then inspect.":"Due out today. Clean and inspect after check-out at 11:00."+(ar?" Next guest arrives today.":"")});
    else if(ar&&!hkIsDone(r.id,"checkin"))out.push({key:"checkin|"+r.id,type:"checkin",r,b:ar,prio:1,detail:`${esc(ar.contact.name)} arrives today, check-in from 14:00. Inspect before arrival.`});
    if(ih&&!hkIsDone(r.id,"inhouse"))out.push({key:"inhouse|"+r.id,type:"inhouse",r,b:ih,prio:3,detail:`Stay-over service, night ${diffDays(ih.checkIn,TODAY)+1} of ${ih.nights}.`});
  }
  for(const q of DB.pms.hkReq.filter(x=>x.status==="Open")){const r=roomById(q.roomId);if(!r)continue;
    out.push({key:"demand|"+q.id,type:"demand",r,req:q,b:DB.bookings.find(b=>b.ref===q.ref&&b.type==="villa"),prio:q.when==="Now"?0:2,detail:`<b>${esc(q.type)}</b>${q.note?": "+esc(q.note):""}. ${esc(q.when==="Now"?"As soon as possible":q.when==="Afternoon"?"This afternoon":"This evening")}.`});}
  return out.sort((a,b)=>a.prio-b.prio||a.r.villa.name.localeCompare(b.r.villa.name));
}
PX.hk=()=>{
  const q=ui.pq.hk=ui.pq.hk||{tab:"todo",f:"all"};const rooms=roomsList(),cnt=s=>rooms.filter(r=>DB.pms.hk[r.id]===s).length;
  const all=hkTodo(),list=all.filter(x=>q.f==="all"||x.type===q.f);
  const done=DB.pms.hkDone.filter(d=>d.date>=addDays(TODAY,-6)&&(q.f==="all"||d.type===q.f)).sort((a,b)=>b.at.localeCompare(a.at));
  const n=t=>all.filter(x=>t==="all"||x.type===t).length,staff=hkStaff();
  const row=x=>{const s=DB.pms.hk[x.r.id]||"dirty",as=DB.pms.hkAssign[x.key]||"";const acts=[];
    if(x.type==="checkout"||x.type==="checkin"){if(s==="dirty")acts.push(`<button class="btn btn-ghost btn-sm" data-a="hkClean" data-k="${x.key}">Mark cleaned</button>`);
      acts.push(`<button class="btn btn-sm" data-a="hkDone" data-k="${x.key}" ${x.type==="checkout"&&x.b.status!=="Completed"&&s==="dirty"?"":""}>${s==="inspected"?"Confirm ready":"Inspect and complete"}</button>`);}
    else acts.push(`<button class="btn btn-sm" data-a="hkDone" data-k="${x.key}">${x.type==="inhouse"?"Service done":"Mark done"}</button>`);
    return `<tr><td><b>${esc(x.r.name)}</b><div class="tiny muted">${esc(x.r.villa.name)}</div></td><td><span class="hk-type ${x.type}">${tx(HK_T[x.type])}</span>${x.arr&&x.type==="checkout"?` <span class="hk-type checkin">Arrival today</span>`:""}</td>
     <td class="small">${x.b?`<button class="link" data-a="pxOpen" data-ref="${x.b.ref}">${esc(x.b.contact.name)}</button><br>`:""}${x.detail}</td><td>${hkBadge(s)}</td>
     <td><select class="input hk-sel" data-on="hkAssign" data-k="${x.key}" aria-label="Assign"><option value="">Unassigned</option>${staff.map(p=>`<option ${as===p?"selected":""}>${esc(p)}</option>`).join("")}</select></td><td><div class="btn-row">${acts.join("")}</div></td></tr>`;};
  const filters=`<div class="hk-filters">${[["all","All"],["inhouse","In house"],["checkout","Check out"],["checkin","Check in"],["demand","On demand"]].map(([k,l])=>`<button class="${q.f===k?"on":""}" data-a="hkF" data-v="${k}">${tx(l)}${q.tab==="todo"?`<i>${n(k)}</i>`:""}</button>`).join("")}</div>`;
  const todo=`<div class="tbl-wrap"><table><thead><tr><th>${tx("Room")}</th><th>Type</th><th>${tx("Guest")} and details</th><th>Room status</th><th>Assigned to</th><th></th></tr></thead><tbody>${list.map(row).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:26px">Nothing to do here. All rooms in this list are inspected.</td></tr>`}</tbody></table></div>`;
  const dn=`<div class="tbl-wrap"><table><thead><tr><th>Completed</th><th>${tx("Room")}</th><th>Type</th><th>Details</th><th>By</th></tr></thead><tbody>${done.map(d=>{const r=roomById(d.roomId);return `<tr><td style="white-space:nowrap">${d.date===TODAY?tx("Today"):fd(d.date)}, ${wibTime(Date.parse(d.at))}</td><td><b>${esc(r?r.name:"")}</b><div class="tiny muted">${esc(r?r.villa.name:"")}</div></td><td><span class="hk-type ${d.type}">${tx(HK_T[d.type])}</span></td><td class="small">${esc(d.note||"")}</td><td class="small">${esc(d.by)}</td></tr>`;}).join("")||`<tr><td colspan="5" class="muted" style="text-align:center;padding:26px">Nothing completed yet in the last 7 days.</td></tr>`}</tbody></table></div>`;
  const body=`<div class="kpis"><div class="kpi"><div class="small muted">${tx("Dirty")}</div><div class="v">${cnt("dirty")}</div></div><div class="kpi"><div class="small muted">${tx("Clean")}, not inspected</div><div class="v">${cnt("clean")}</div></div><div class="kpi"><div class="small muted">${tx("Inspected")}</div><div class="v">${cnt("inspected")}</div><div class="s">Ready to sell for today</div></div><div class="kpi"><div class="small muted">${tx("To do")} today</div><div class="v">${all.length}</div><div class="s">${n("demand")} guest request${n("demand")===1?"":"s"}</div></div></div>
  <div class="tabsx">${[["todo",tx("To do")+" ("+all.length+")"],["done",tx("Done")]].map(x=>`<button class="${q.tab===x[0]?"on":""}" data-a="hkTab" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>${filters}${q.tab==="todo"?todo:dn}
  <p class="small muted" style="margin-top:10px">Check-out marks a room dirty automatically. Same-day arrivals can only be checked into rooms marked inspected. On-demand requests come from guests through the front desk.</p>`;
  return {title:tx("Housekeeping"),sub:"Rooms to clean and inspect today",actions:pxCan("front",pxRole())||pxRole()==="Housekeeping"?`<button class="btn btn-sm" data-a="hkReqNew">${tx("New request")}</button>`:"",body};
};
PXM.hkReq=m=>{const rooms=roomsList();const rid=m.room||(rooms.find(r=>{const b=stayToday(r.id);return b&&b.status==="Checked in";})||rooms[0]).id;const b=stayToday(rid);
  return mod(tx("New request"),`<p class="small muted" style="margin-top:-8px">A guest asked the front desk for something in their room.</p>
  <div class="grid2" style="margin-top:12px"><label class="field"><span>${tx("Room")}</span><select class="input" id="hr-room" data-a2="hr">${rooms.map(r=>{const s=stayToday(r.id);return `<option value="${r.id}" ${r.id===rid?"selected":""}>${esc(r.villa.name)}, ${esc(r.name)}${s&&s.status==="Checked in"?" ("+esc(s.contact.name)+")":""}</option>`;}).join("")}</select></label>
  <label class="field"><span>Request</span><select class="input" id="hr-type">${HK_REQ.map(x=>`<option>${x}</option>`).join("")}</select></label></div>
  <label class="field" style="margin-top:12px"><span>Details</span><input class="input" id="hr-note" placeholder="e.g. 2 extra towels, guest is out until 16:00"></label>
  <label class="field" style="margin-top:12px;max-width:260px"><span>When</span><select class="input" id="hr-when"><option value="Now">As soon as possible</option><option value="Afternoon">This afternoon</option><option value="Evening">This evening</option></select></label>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="hkReqGo">Send to housekeeping</button></div>`);};
Object.assign(A,{
  hkTab:el=>{ui.pq.hk.tab=el.dataset.v;render(true);},
  hkF:el=>{ui.pq.hk.f=el.dataset.v;render(true);},
  hkClean:el=>{const[type,id]=el.dataset.k.split("|");const rid=type==="demand"?(DB.pms.hkReq.find(x=>x.id===id)||{}).roomId:id;const before=DB.pms.hk[rid];DB.pms.hk[rid]="clean";audit("Room",rid,"Cleaned",before,"clean");save();toast(roomById(rid).name+" cleaned. Inspect it to finish.");},
  hkDone:el=>{const x=hkTodo().find(i=>i.key===el.dataset.k);if(!x)return render(true);
    const rec={id:"hd"+Date.now().toString(36),date:TODAY,at:nowIso(),roomId:x.r.id,type:x.type,ref:x.b?x.b.ref:"",by:DB.pms.hkAssign[x.key]||actorName(),note:""};
    if(x.type==="checkout"||x.type==="checkin"){const before=DB.pms.hk[x.r.id];DB.pms.hk[x.r.id]="inspected";DB.pms.tasks.filter(t=>t.roomId===x.r.id&&t.status!=="Done").forEach(t=>{t.status="Done";t.done=TODAY;});
      rec.note=x.type==="checkout"?"Cleaned and inspected after check-out":"Inspected, ready for "+x.b.contact.name;audit("Room",x.r.id,"Inspected",before,"inspected");
      if(x.type==="checkout"&&x.arr)DB.pms.hkDone.push(Object.assign({},rec,{id:rec.id+"b",type:"checkin",note:"Ready for "+x.arr.contact.name}));}
    else if(x.type==="inhouse"){rec.note="Stay-over service done";audit("Room",x.r.id,"Stay-over service done",null,x.b.contact.name);}
    else{x.req.status="Done";x.req.doneAt=nowIso();rec.reqId=x.req.id;rec.note=x.req.type+(x.req.note?": "+x.req.note:"");audit("Housekeeping request",x.req.id,"Completed","Open","Done");}
    DB.pms.hkDone.push(rec);save();toast(x.r.name+": "+(x.type==="demand"?"request done":x.type==="inhouse"?"service done":"inspected and ready"));},
  hkReqNew:()=>{ui.modal={kind:"hkReq"};render(true);},
  hkReqFrom:el=>{const b=DB.bookings.find(x=>x.ref===el.dataset.ref&&x.type==="villa"&&x.status==="Checked in");ui.modal={kind:"hkReq",room:b?b.roomId:null};render(true);},
  hkReqGo:()=>{const rid=val("hr-room"),b=stayToday(rid),type=val("hr-type"),note=val("hr-note"),when=val("hr-when");
    if(type==="Other"&&!note)return pxErr("Describe what the guest needs.");
    const id="HR-"+(101+DB.pms.hkReq.length);DB.pms.hkReq.push({id,roomId:rid,ref:b?b.ref:"",guest:b?b.contact.name:"",type,note,when,status:"Open",created:TODAY,at:nowIso(),by:actorName()});
    audit("Housekeeping request",id,"Created",null,type+(note?": "+note:""));save();ui.modal=null;toast("Request sent to housekeeping: "+type);}
});
ON.hkAssign=el=>{DB.pms.hkAssign[el.dataset.k]=el.value;audit("Housekeeping",el.dataset.k,"Assigned",null,el.value||"Unassigned");save();toast(el.value?"Assigned to "+el.value:"Unassigned");};
const _pxExtFront=PX.front;
PX.front=()=>{const pg=_pxExtFront();pg.body=pg.body.replace(/<button class="btn btn-ghost btn-sm" data-a="pxOpenCharge" data-ref="([^"]+)">/g,`<button class="btn btn-ghost btn-sm" data-a="hkReqFrom" data-ref="$1">Housekeeping request</button>$&`);return pg;};

/* ---------- 2. setup: properties and rooms with photos and details ---------- */
function pxImg(file,max,q){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,(max||1000)/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",q||.72));};im.onerror=rej;im.src=fr.result;};fr.onerror=rej;fr.readAsDataURL(file);});}
function photoEditor(ph,max){return `<div class="ph-grid">${ph.map((src,i)=>`<div class="ph"><img src="${src}" alt="Photo ${i+1}">${i===0?`<span class="cov">Cover</span>`:""}<div class="ph-act">${i?`<button data-a="phCover" data-i="${i}">Make cover</button>`:""}<button data-a="phDel" data-i="${i}">Remove</button></div></div>`).join("")}
  ${ph.length<max?`<label class="ph-up"><input type="file" accept="image/*" multiple data-up="1"><span>+ Upload photos<br><span class="tiny muted" style="font-weight:400">JPG or PNG, resized automatically</span></span></label>`:""}</div>`;}
const chk=(list,sel,k)=>`<div class="ck-grid">${list.map(a=>`<label><input type="checkbox" data-dl="${k}" value="${esc(a)}" ${sel.includes(a)?"checked":""}>${esc(a)}</label>`).join("")}</div>`;
PXM.pxRoomEd=m=>{const d=m.d,v=villaById(m.villa);
  return mod(m.id?"Edit "+esc(d.name||"room"):"Add room to "+esc(v.name),`<div class="grid2">
   <label class="field"><span>Room name</span><input class="input" data-d="name" value="${esc(d.name)}" placeholder="Ocean suite"></label>
   <label class="field"><span>Beds</span><input class="input" data-d="bed" value="${esc(d.bed)}" placeholder="King bed"></label>
   <label class="field"><span>Sleeps</span><input class="input" type="number" min="1" max="10" data-d="cap" value="${d.cap}"></label>
   <label class="field"><span>Size (m²)</span><input class="input" type="number" min="0" data-d="size" value="${d.size||""}"></label>
   <label class="field"><span>View</span><select class="input" data-d="view">${VIEWS.map(x=>`<option ${d.view===x?"selected":""}>${x}</option>`).join("")}</select></label>
   <label class="field"><span>Nightly rate (USD)</span><input class="input" type="number" min="0" data-d="price" value="${d.price}"></label></div>
  <label class="field" style="margin-top:12px"><span>Description shown to guests</span><textarea class="input" rows="3" data-d="desc">${esc(d.desc)}</textarea></label>
  <p class="sec-lbl">Amenities</p>${chk(ROOM_AMEN,d.amen,"amen")}
  <p class="sec-lbl">Facilities</p>${chk(ROOM_FAC,d.fac,"fac")}
  <label class="field" style="margin-top:12px"><span>Other amenities or facilities, separated by commas</span><input class="input" data-d="extra" value="${esc(d.extra)}" placeholder="e.g. Surfboard rack, Yoga mat"></label>
  <p class="sec-lbl">Photos (the first one is the cover)</p>${photoEditor(d.photos,8)}
  <p class="tiny muted" style="margin-top:8px">Photos and details appear on the room card on the guest website. In this prototype photos are stored in your browser, so keep it to a few per room.</p>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxRoomSave">${tx("Save")}</button></div>`,true);};
PXM.pxPropEd=m=>{const d=m.d;const mu=mapUrl(d.location);
  return mod(m.id?"Edit "+esc(d.name||"property"):"Add property",`<div class="grid2">
   <label class="field"><span>Property name</span><input class="input" data-d="name" value="${esc(d.name)}"></label>
   <label class="field"><span>Island</span><input class="input" data-d="island" value="${esc(d.island)}"></label></div>
  <label class="field" style="margin-top:12px"><span>Address</span><textarea class="input" rows="2" data-d="address">${esc(d.address)}</textarea></label>
  <div class="grid2" style="margin-top:12px"><label class="field"><span>Location (Google Maps link or coordinates)</span><input class="input" data-d="location" value="${esc(d.location)}" placeholder="-1.6080, 99.2370"></label>
   <div class="field"><span>Check the pin</span>${mu?`<a class="btn btn-ghost btn-sm" style="align-self:flex-start" href="${esc(mu)}" target="_blank" rel="noopener">Open in Google Maps</a>`:`<span class="small muted">Add a location first</span>`}</div>
   <label class="field"><span>Contact number</span><input class="input" data-d="phone" value="${esc(d.phone)}" placeholder="+62 812 0000 0000"></label>
   <label class="field"><span>Email</span><input class="input" type="email" data-d="email" value="${esc(d.email)}"></label></div>
  <label class="field" style="margin-top:12px"><span>Description shown to guests</span><textarea class="input" rows="3" data-d="blurb">${esc(d.blurb)}</textarea></label>
  <p class="sec-lbl">Property amenities</p>${chk(PROP_AMEN,d.amen,"amen")}
  <label class="field" style="margin-top:12px"><span>Other amenities, separated by commas</span><input class="input" data-d="extra" value="${esc(d.extra)}"></label>
  <p class="sec-lbl">Photos (the first one is the cover on the home page and villa page)</p>${photoEditor(d.photos,8)}${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxPropSave">${tx("Save")}</button></div>`,true);};
document.addEventListener("input",e=>{const t=e.target;if(t.dataset.d&&ui.modal&&ui.modal.d)ui.modal.d[t.dataset.d]=t.value;});
document.addEventListener("change",async e=>{const t=e.target;
  if(t.dataset.d&&ui.modal&&ui.modal.d)ui.modal.d[t.dataset.d]=t.value;
  if(t.dataset.dl&&ui.modal&&ui.modal.d){const arr=ui.modal.d[t.dataset.dl];const i=arr.indexOf(t.value);if(t.checked&&i<0)arr.push(t.value);if(!t.checked&&i>=0)arr.splice(i,1);}
  if(t.dataset.up&&ui.modal&&ui.modal.d){const files=[...t.files].slice(0,8-ui.modal.d.photos.length);
    for(const f of files){try{ui.modal.d.photos.push(await pxImg(f,1000,.72));}catch(err){ui.modal.err="One of the files isn't an image we can read.";}}render(true);}});
function splitExtra(s){return String(s||"").split(",").map(x=>x.trim()).filter(Boolean);}
Object.assign(A,{
  phCover:el=>{const p=ui.modal.d.photos,i=+el.dataset.i;p.unshift(p.splice(i,1)[0]);render(true);},
  phDel:el=>{ui.modal.d.photos.splice(+el.dataset.i,1);render(true);},
  pxRoomEdit:el=>{const v=villaById(el.dataset.villa),r=el.dataset.id?v.rooms.find(x=>x.id===el.dataset.id):null;
    const base=r||{name:"",bed:"",cap:2,price:150,size:32,view:"Garden",desc:"",amen:["Air conditioning","Wi-Fi","Hot water"],fac:["Ensuite bathroom"],photos:[]};
    const known=[...ROOM_AMEN,...ROOM_FAC];
    ui.modal={kind:"pxRoomEd",villa:v.id,id:r?r.id:null,d:{name:base.name,bed:base.bed,cap:base.cap,price:base.price,size:base.size||"",view:base.view||"Garden",desc:base.desc||"",amen:(base.amen||[]).filter(a=>ROOM_AMEN.includes(a)),fac:(base.fac||[]).filter(a=>ROOM_FAC.includes(a)),extra:[...(base.amen||[]),...(base.fac||[])].filter(a=>!known.includes(a)).join(", "),photos:(base.photos||[]).slice()}};render(true);},
  pxRoomSave:()=>{const m=ui.modal,d=m.d,v=villaById(m.villa);
    if(!String(d.name).trim())return pxErr("Give the room a name guests will recognise.");if(!(+d.cap>0))return pxErr("Sleeps must be at least 1.");if(!(+d.price>=0))return pxErr("Enter a nightly rate.");
    const vals={name:String(d.name).trim(),bed:String(d.bed||"").trim()||"Queen bed",cap:+d.cap,price:+d.price,size:+d.size||0,view:d.view,desc:String(d.desc||"").trim(),amen:[...d.amen,...splitExtra(d.extra)],fac:d.fac.slice(),photos:d.photos.slice()};
    let r=m.id?v.rooms.find(x=>x.id===m.id):null;const backup=r?JSON.stringify(r):null;
    if(r)Object.assign(r,vals);else{r=Object.assign({id:"r"+Date.now().toString(36),active:true},vals);v.rooms.push(r);DB.pms.hk[r.id]="inspected";}
    if(!saveOk()){if(backup)Object.assign(r,JSON.parse(backup));else v.rooms=v.rooms.filter(x=>x!==r);return pxErr("The browser's storage is full. Remove a photo or two and try again.");}
    audit("Room",r.id,m.id?"Room details updated":"Room added",null,r.name+", "+r.photos.length+" photo(s)");save();ui.modal=null;toast(r.name+" saved. The guest website shows the new details.");},
  pxPropEdit:el=>{const v=el.dataset.id?villaById(el.dataset.id):null;const base=v||{name:"",island:"",address:"",location:"",phone:"",email:"",blurb:"",amen:[],photos:[]};
    ui.modal={kind:"pxPropEd",id:v?v.id:null,d:{name:base.name,island:base.island,address:base.address||"",location:base.location||"",phone:base.phone||"",email:base.email||"",blurb:base.blurb||"",amen:(base.amen||[]).filter(a=>PROP_AMEN.includes(a)),extra:(base.amen||[]).filter(a=>!PROP_AMEN.includes(a)).join(", "),photos:(base.photos||[]).slice()}};render(true);},
  pxPropSave:()=>{const m=ui.modal,d=m.d;
    if(!String(d.name).trim()||!String(d.island).trim())return pxErr("Property name and island are both needed.");
    if(d.email&&!/^\S+@\S+\.\S+$/.test(d.email))return pxErr("That email address doesn't look complete.");
    const vals={name:String(d.name).trim(),island:String(d.island).trim(),address:String(d.address||"").trim(),location:String(d.location||"").trim(),phone:String(d.phone||"").trim(),email:String(d.email||"").trim(),blurb:String(d.blurb||"").trim()||"New property.",amen:[...d.amen,...splitExtra(d.extra)],photos:d.photos.slice()};
    let v=m.id?villaById(m.id):null;const backup=v?JSON.stringify(Object.assign({},v,{rooms:undefined})):null;
    if(v)Object.assign(v,vals);else{v=Object.assign({id:"v"+Date.now().toString(36),pal:DB.villas.length%3,active:false,rooms:[]},vals);DB.villas.push(v);}
    if(!saveOk()){if(backup)Object.assign(v,JSON.parse(backup),{rooms:v.rooms});else DB.villas=DB.villas.filter(x=>x!==v);return pxErr("The browser's storage is full. Remove a photo or two and try again.");}
    audit("Property",v.id,m.id?"Property details updated":"Property added",null,v.name+", "+v.photos.length+" photo(s)");save();ui.modal=null;toast(v.name+" saved"+(m.id?". The guest website shows the new details.":". Add rooms, then switch on Show on site."));}
});
ON.pxBase=el=>{const p=DB.pms.properties.find(x=>x.id===el.dataset.id),k=el.dataset.k,before=p[k];p[k]=el.value;audit("Property",p.id,"Changed "+k,before,el.value);save();toast("Saved");};
const _pxExtSetup=PX.setup;
PX.setup=()=>{
  const tab=ui.pq.setup||"ent";const pg=_pxExtSetup();if(tab!=="assets"&&tab!=="rooms")return pg;
  const cut=pg.body.indexOf("</div>")+6,tabs=pg.body.slice(0,cut).replace(">Properties and asset types<",">Properties<");let inner="",act="";
  if(tab==="assets"){
    inner=DB.villas.map(v=>`<div class="prop-card"><div class="cover">${(v.photos||[])[0]?`<img src="${v.photos[0]}" alt="">`:_pxScene(v.pal||0,0,v.name)}</div>
      <div style="min-width:0"><h3 style="font-size:1.2rem">${esc(v.name)}</h3><p class="small muted">${esc(v.island)}, ${v.rooms.length} rooms, ${(v.photos||[]).length} photo${(v.photos||[]).length===1?"":"s"}</p>
       <p class="small" style="margin-top:8px">${esc(v.address||"No address yet")}</p><p class="small muted" style="margin-top:4px">${esc(v.phone||"No phone")}, ${esc(v.email||"no email")}${v.location?`, <a href="${esc(mapUrl(v.location))}" target="_blank" rel="noopener" style="color:var(--lagoon-ink)">map</a>`:""}</p>
       <div class="chips" style="margin-top:8px">${(v.amen||[]).slice(0,5).map(a=>`<span class="chip">${esc(a)}</span>`).join("")}</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end"><label class="small" style="display:flex;gap:8px;align-items:center">Show on site <span class="switch"><input type="checkbox" data-on="villaActive" data-id="${v.id}" ${v.active?"checked":""}><span></span></span></label><button class="btn btn-sm" data-a="pxPropEdit" data-id="${v.id}">Edit property</button></div></div>`).join("")+
     DB.pms.properties.filter(p=>p.id==="p2").map(p=>`<div class="card" style="margin:20px 0"><h3 style="font-size:1.1rem;margin-bottom:10px">${esc(p.name)} <span class="tiny muted">${esc(ent(p.entity).name)}</span></h3>
      <div class="grid2">${[["address","Address"],["location","Location (link or coordinates)"],["phone","Contact number"],["email","Email"]].map(([k,l])=>`<label class="field"><span>${l}</span><input class="input" data-on="pxBase" data-id="${p.id}" data-k="${k}" value="${esc(p[k]||"")}"></label>`).join("")}</div></div>`).join("")+
     `<h3 style="margin:24px 0 10px">Asset types</h3><div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Booking mode</th><th>Unit of sale</th><th>${tx("Status")}</th></tr></thead><tbody>${DB.pms.types.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.mode)}</td><td class="small">${esc(t.unit)}</td><td>${t.phase===1?`<span class="badge b-ok">Live</span>`:`<span class="badge b-plain">Phase 2</span>`}</td></tr>`).join("")}</tbody></table></div>`;
    act=`<button class="btn btn-sm" data-a="pxPropEdit">Add property</button>`;}
  else{
    inner=DB.villas.map(v=>`<section class="villa-block"><div class="vb-head"><div><h2 style="font-size:1.3rem">${esc(v.name)}</h2><p class="small muted">${esc(v.island)}, ${v.rooms.length} rooms</p></div><button class="btn btn-soft btn-sm" data-a="pxRoomEdit" data-villa="${v.id}">Add room</button></div>
     <div class="tbl-wrap"><table><thead><tr><th></th><th>${tx("Room")}</th><th>Beds and size</th><th>Amenities</th><th>Nightly rate (USD)</th><th>Bookable</th><th></th></tr></thead><tbody>
     ${v.rooms.map(r=>`<tr><td><div class="thumb-ph">${(r.photos||[])[0]?`<img class="thumb" src="${r.photos[0]}" alt="">`:_pxScene(v.pal||0,1,r.name)}</div></td><td><b>${esc(r.name)}</b><div class="tiny muted">${(r.photos||[]).length} photo${(r.photos||[]).length===1?"":"s"}</div></td><td class="small">${esc(r.bed)}, sleeps ${r.cap}<br><span class="muted">${r.size?r.size+" m², ":""}${esc(r.view||"")} view</span></td>
      <td class="small">${[...(r.amen||[]),...(r.fac||[])].length} listed</td><td><input class="input num-in" type="number" min="0" step="5" value="${r.price}" data-on="roomPrice" data-id="${r.id}" aria-label="Nightly rate for ${esc(r.name)}"></td>
      <td><span class="switch"><input type="checkbox" data-on="roomActive" data-id="${r.id}" ${r.active?"checked":""} aria-label="${esc(r.name)} bookable"><span></span></span></td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-a="pxRoomEdit" data-villa="${v.id}" data-id="${r.id}">Edit details</button></td></tr>`).join("")||`<tr><td colspan="7" class="muted" style="text-align:center;padding:20px">No rooms yet.</td></tr>`}</tbody></table></div></section>`).join("");}
  pg.body=tabs+inner;pg.actions=act;return pg;
};
render(true);
