"use strict";
/* ================= STAFF PMS (PRD phase 1: resort rooms and speedboats) =================
   Replaces the old staff console. Role-based navigation, English / Bahasa Indonesia,
   availability, multi-item reservations, front desk, housekeeping, maintenance,
   speedboat ops with manifests and weather cancellation, pier counter, guests,
   payments and invoices per legal entity, setup, users and roles, messages, audit log. */
const PXI={
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  bed:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/></svg>`,
  broom:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3 11 11"/><path d="M5 13l6-2 2 2-2 6-6-6z"/><path d="M5 13l-2 8 8-2"/></svg>`,
  wrench:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L4 12l2.3-2.3a4 4 0 0 0 5-5L14 2l.7 4.3z"/></svg>`,
  ticket:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 0 0-4V4H3z"/><path d="M14 4v12" stroke-dasharray="2 2"/></svg>`,
  card:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
  chat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/></svg>`,
  people:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.7 2.8 2.4 3 5.2"/></svg>`};
const PX_ROLES=["Owner","Property Manager","Front Desk","Boat Operations","Housekeeping","Maintenance","Finance"];
const ALL_R=PX_ROLES,MGR=["Owner","Property Manager"];
const PX_NAV=[
  ["Overview",[["dash","Dashboard",ICON.dash,["Owner","Property Manager","Finance"]]]],
  ["Sales",[["cal","Availability",ICON.cal,["Owner","Property Manager","Front Desk","Boat Operations"]],["res","Reservations",ICON.list,["Owner","Property Manager","Front Desk","Boat Operations","Finance"]],["newbk","New booking",PXI.plus,["Owner","Property Manager","Front Desk"]],["guests","Guests",PXI.people,["Owner","Property Manager","Front Desk"]]]],
  ["Operations",[["front","Front desk",PXI.bed,["Owner","Property Manager","Front Desk"]],["hk","Housekeeping",PXI.broom,["Owner","Property Manager","Front Desk","Housekeeping"]],["mnt","Maintenance",PXI.wrench,["Owner","Property Manager","Maintenance","Housekeeping"]],["boats","Speedboat ops",ICON.boat,["Owner","Property Manager","Boat Operations"]],["pier","Pier counter",PXI.ticket,["Owner","Property Manager","Boat Operations"]]]],
  ["Finance",[["pay","Payments and invoices",PXI.card,["Owner","Property Manager","Finance"]]]],
  ["Admin",[["setup","Setup",ICON.gear,["Owner","Property Manager"]],["users","Users and roles",PXI.people,["Owner"]],["msgs","Messages",PXI.chat,["Owner","Property Manager","Front Desk"]],["audit","Audit log",PXI.shield,["Owner","Property Manager","Finance"]]]]];
const PX_ID={"Dashboard":"Dasbor","Availability":"Ketersediaan","Reservations":"Reservasi","New booking":"Pemesanan baru","Guests":"Tamu","Front desk":"Resepsionis","Housekeeping":"Tata graha","Maintenance":"Perawatan","Speedboat ops":"Operasi speedboat","Pier counter":"Loket dermaga","Payments and invoices":"Pembayaran dan faktur","Setup":"Pengaturan","Users and roles":"Pengguna dan peran","Messages":"Pesan","Audit log":"Log audit","Overview":"Ringkasan","Sales":"Penjualan","Operations":"Operasional","Finance":"Keuangan","Admin":"Admin","Sign out":"Keluar","Open guest site":"Buka situs tamu","Demo: view as role":"Demo: lihat sebagai peran",
  "Confirmed":"Terkonfirmasi","Hold":"Ditahan","In use":"Sedang berlangsung","Completed":"Selesai","Cancelled":"Dibatalkan","Expired":"Kedaluwarsa","No-show":"Tidak datang","Boarded":"Sudah naik","Open":"Terbuka","Done":"Selesai","In progress":"Dikerjakan","Pending approval":"Menunggu persetujuan","Refunded":"Dikembalikan","Rejected":"Ditolak","Paid":"Dibayar","Scheduled":"Terjadwal","Departed":"Berangkat","Closed":"Ditutup",
  "Check in":"Check-in","Check out":"Check-out","Today":"Hari ini","Save":"Simpan","Cancel":"Batal","Close":"Tutup","Arrivals":"Kedatangan","In-house":"Menginap","Departures":"Keberangkatan","Room occupancy":"Okupansi kamar","Boat seat utilization":"Utilisasi kursi speedboat","Attach rate":"Tingkat penjualan silang","Direct booking share":"Porsi pemesanan langsung","Double bookings":"Pemesanan ganda","Source":"Sumber","Guest":"Tamu","Status":"Status","Total":"Total","Balance":"Sisa tagihan","Take payment":"Terima pembayaran","Post charge":"Tambah tagihan","Refund":"Pengembalian dana","Rooms":"Kamar","Speedboats":"Speedboat","Room":"Kamar","Dirty":"Kotor","Clean":"Bersih","Inspected":"Sudah diperiksa","Occupied":"Terisi","Vacant":"Kosong","Manifest":"Manifes","Weather cancel":"Batal karena cuaca","Passengers":"Penumpang","Work orders":"Perintah kerja","New work order":"Perintah kerja baru","Payments":"Pembayaran","Refunds":"Pengembalian dana","Invoices":"Faktur","Create booking":"Buat pemesanan","Items":"Item","Next 30 days":"30 hari ke depan","Last 30 days":"30 hari terakhir","This month":"Bulan ini","Date":"Tanggal","Time":"Waktu","Route":"Rute","Boat":"Kapal","Role":"Peran","Name":"Nama","Phone":"Telepon","Country":"Negara","Amount":"Jumlah","Method":"Metode","Approve":"Setujui","Reject":"Tolak","Walk-in booking":"Pemesanan walk-in","Folio":"Folio","Booking":"Pemesanan","Sell seats":"Jual kursi","Seats left":"Kursi tersisa","Search":"Cari",
  "Owner":"Pemilik","Property Manager":"Manajer properti","Front Desk":"Resepsionis","Boat Operations":"Operasi kapal","Finance":"Keuangan"};
const tx=s=>ui.lang==="id"&&PX_ID[s]?PX_ID[s]:s;
try{ui.lang=localStorage.getItem("mi-lang")||"en";}catch(e){ui.lang="en";}
ui.pq=ui.pq||{};
function pxRole(){return ui.user&&ui.user.staffRole&&PX_ROLES.includes(ui.user.staffRole)?ui.user.staffRole:"Owner";}
function pxCan(pv,role){if(pv==="booking")return pxCan("res",role);for(const[,items]of PX_NAV)for(const x of items)if(x[0]===pv)return x[3].includes(role);return false;}
function pxHome(role){for(const[,items]of PX_NAV)for(const x of items)if(x[3].includes(role))return x[0];return "dash";}
const isMgr=()=>MGR.includes(pxRole());
const lb=s=>statusBadge(s).replace(">"+esc(s)+"<",">"+esc(tx(s))+"<");
const srcBadge=s=>`<span class="badge ${{"Consumer app":"b-info","WhatsApp":"b-ok","Walk-in":"b-gold"}[s]||"b-plain"}">${esc(s)}</span>`;
const hkBadge=s=>`<span class="badge ${{dirty:"b-danger",clean:"b-info",inspected:"b-ok"}[s]||"b-plain"}">${esc(tx(s?s[0].toUpperCase()+s.slice(1):"Unknown"))}</span>`;
const pct=v=>Math.round(v*100)+"%";
function roomsList(){return DB.villas.flatMap(v=>v.rooms.map(r=>Object.assign({villa:v},r)));}
function stayToday(roomId,d){d=d||TODAY;return DB.bookings.find(b=>b.type==="villa"&&b.roomId===roomId&&b.status!=="Cancelled"&&b.status!=="No-show"&&b.checkIn<=d&&d<b.checkOut);}
function oosOn(roomId,d){return DB.blocks.find(k=>k.roomId===roomId&&k.date===d);}
function guestOf(h){return (DB.users||[]).find(u=>u.id===h.guestId)||null;}
function mod(title,body,wide,sub){return `<div class="scrim" data-a="scrim"><div class="modal ${wide?"wide":""}" role="dialog" aria-modal="true"><div class="modal-head"><div><h2 style="font-size:1.35rem">${title}</h2>${sub?`<p class="small muted" style="margin-top:4px">${sub}</p>`:""}</div><button class="x" data-a="close" aria-label="Close">&times;</button></div>${body}</div></div>`;}
function errP(){return ui.modal&&ui.modal.err?`<p class="err" role="alert" style="margin-top:10px">${esc(ui.modal.err)}</p>`:"";}
function dl(name,rows){const csv=rows.map(r=>r.map(v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=name;document.body.appendChild(a);a.click();a.remove();}
(function(){const s=document.createElement("style");s.textContent=`
.pms .side-nav .pm-grp{font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);margin:14px 12px 4px}
.pms .side-foot .field span{font-size:.72rem}.pms .side-foot select{min-height:36px;height:36px;padding:6px 10px;font-size:.85rem}
.pm-mbar select{flex:1;min-height:38px;height:38px;padding:6px 10px}
.kpi.ok .s{color:var(--ok)}.kpi.low .s{color:var(--warn)}
.chart-bar{fill:var(--lagoon)}.chart-tgt{stroke:var(--gold);stroke-dasharray:4 4}
.hbar{display:grid;grid-template-columns:120px 1fr 80px;gap:10px;align-items:center;font-size:.85rem;margin:6px 0}.hbar i{display:block;height:12px;border-radius:99px;background:var(--lagoon)}
.cell.inuse{background:#12293A;color:#fff}.dcell{display:block;width:100%;border:0;border-radius:6px;font-size:.66rem;font-weight:700;padding:3px 2px;margin:2px 0;background:var(--surface-2);color:var(--ink)}
.dcell.mid{background:var(--shallow);color:var(--lagoon-ink)}.dcell.full{background:var(--lagoon);color:#fff}.dcell.x{background:var(--danger-soft);color:var(--danger);text-decoration:line-through}
.chip-src{display:inline-flex;gap:6px;flex-wrap:wrap}.chip-src button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 14px;font-weight:600;font-size:.88rem;color:var(--ink-2)}
.chip-src button.on{background:var(--ink);border-color:var(--ink);color:#fff}
.nb-timer{font-variant-numeric:tabular-nums;background:var(--gold-soft);color:var(--gold);border-radius:999px;padding:4px 12px;font-weight:700;font-size:.85rem}
.nb-res button{display:flex;justify-content:space-between;width:100%;text-align:left;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:9px 12px;margin-top:6px;font-size:.88rem}
.nb-res button:hover{border-color:var(--lagoon)}
.nb-item{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:10px;background:var(--surface)}.nb-item.bad{border-color:var(--danger)}
.sugg{background:var(--sand);border-radius:14px;padding:12px 14px;margin-bottom:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.hk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.hk-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px}.hk-card.dirty{border-left:4px solid var(--danger)}.hk-card.clean{border-left:4px solid var(--lagoon)}.hk-card.inspected{border-left:4px solid var(--ok)}
.pier-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.pier-tile{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:4px}
.pier-tile.on{border-color:var(--lagoon);box-shadow:0 0 0 2px var(--shallow)}.pier-tile:disabled{opacity:.5;cursor:not-allowed}
.tabsx{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:16px;overflow-x:auto}
.tabsx button{background:none;border:0;border-bottom:3px solid transparent;padding:10px 14px;font-weight:700;color:var(--ink-2);white-space:nowrap}
.tabsx button.on{color:var(--lagoon-ink);border-bottom-color:var(--lagoon)}
.wa{background:#E6F4EA;border-radius:16px;padding:14px;max-width:460px}.wa p{background:#fff;border-radius:12px 12px 12px 4px;padding:10px 12px;font-size:.9rem;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.mx td,.mx th{text-align:center}.mx td:first-child,.mx th:first-child{text-align:left}
.miss{color:var(--danger);font-weight:700}
.btn-row{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
@media (max-width:820px){.hbar{grid-template-columns:90px 1fr 60px}}`;document.head.appendChild(s);})();

/* ================= shell ================= */
function pxShell(pg){
  const role=pxRole();
  const nav=PX_NAV.map(([g,items])=>{const vis=items.filter(x=>x[3].includes(role));if(!vis.length)return "";return `<p class="pm-grp">${tx(g)}</p>`+vis.map(x=>`<button class="${ui.pv===x[0]||(ui.pv==="booking"&&x[0]==="res")?"on":""}" data-a="pv" data-v="${x[0]}">${x[2]}${tx(x[1])}</button>`).join("");}).join("");
  const mopts=PX_NAV.flatMap(([,items])=>items.filter(x=>x[3].includes(role))).map(x=>`<option value="${x[0]}" ${ui.pv===x[0]?"selected":""}>${tx(x[1])}</option>`).join("");
  return `<div class="admin pms"><aside class="side"><div class="brand"><img src="${LOGO_MARK}" alt=""><span><b>Mentawai Indah</b><small>Property management</small></span></div>
  <nav class="side-nav" aria-label="PMS">${nav}</nav>
  <div class="side-foot"><label class="field"><span>${tx("Demo: view as role")}</span><select class="input" data-on="pxRole">${PX_ROLES.map(r=>`<option value="${r}" ${r===role?"selected":""}>${tx(r)}</option>`).join("")}</select></label>
   <p class="small" style="padding:0 4px"><b>${esc(ui.user.name)}</b><br><span class="muted">${esc(ui.user.email)}</span></p>
   <button class="btn btn-ghost btn-sm" data-a="viewSite">${tx("Open guest site")}</button><button class="btn btn-ghost btn-sm" data-a="signout">${tx("Sign out")}</button></div></aside>
  <div><div class="mobile-adminbar pm-mbar"><select class="input" data-on="pxNav" aria-label="Section">${mopts}</select><select class="input" style="max-width:150px" data-on="pxRole" aria-label="Role">${PX_ROLES.map(r=>`<option value="${r}" ${r===role?"selected":""}>${tx(r)}</option>`).join("")}</select><button data-a="signout">${tx("Sign out")}</button></div>
  <main class="main"><div class="topbar"><div><h1>${pg.title}</h1>${pg.sub?`<p class="muted small" style="margin-top:4px">${pg.sub}</p>`:""}</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${pg.actions||""}<div class="segbar" role="group" aria-label="Language"><button class="${ui.lang!=="id"?"on":""}" data-a="pxLang" data-v="en">EN</button><button class="${ui.lang==="id"?"on":""}" data-a="pxLang" data-v="id">ID</button></div></div></div>${pg.body}</main></div></div>`;
}

/* ================= pages ================= */
const PX={};
PX.dash=()=>{
  const q=ui.pq.dash=ui.pq.dash||{range:"next30"};let from,to;
  if(q.range==="last30"){from=addDays(TODAY,-29);to=TODAY;}else if(q.range==="month"){from=TODAY.slice(0,8)+"01";to=addDays(addDays(from,32).slice(0,8)+"01",-1);}else{from=TODAY;to=addDays(TODAY,29);}
  const days=diffDays(from,to)+1,toX=addDays(to,1),rooms=roomsList().filter(r=>r.villa.active&&r.active);
  const oos=DB.blocks.filter(k=>k.date>=from&&k.date<=to&&rooms.some(r=>r.id===k.roomId)).length,avail=rooms.length*days-oos;
  let sold=0,held=0,rev=0;const byDay={};
  for(const b of DB.bookings){if(b.type!=="villa"||b.status==="Cancelled"||b.status==="No-show")continue;const a=b.checkIn>from?b.checkIn:from,z=b.checkOut<toX?b.checkOut:toX;const n=diffDays(a,z);if(n<=0)continue;
    if(b.status==="Awaiting payment"){held+=n;continue;}sold+=n;rev+=b.subtotal/b.nights*n;for(let d=a;d<z;d=addDays(d,1))byDay[d]=(byDay[d]||0)+1;}
  const occ=avail?sold/avail:0,adr=sold?rev/sold:0,revpar=avail?rev/avail:0;
  const deps=DB.schedules.filter(s=>s.date>=from&&s.date<=to&&s.status==="Scheduled");const cap=deps.reduce((a,s)=>a+boat(s.boatId).cap,0),tk=deps.reduce((a,s)=>a+s.taken.length,0),util=cap?tk/cap:0;
  const hs=Object.values(DB.pms.headers);
  const inR=hs.filter(h=>itemsOf(h.ref).some(b=>b.status!=="Cancelled"&&itemStart(b)>=from&&itemStart(b)<=to));
  const stays=inR.filter(h=>itemsOf(h.ref).some(b=>b.type==="villa"&&b.status!=="Cancelled"));const att=stays.filter(h=>itemsOf(h.ref).some(b=>b.type==="boat"&&b.status!=="Cancelled")).length,attach=stays.length?att/stays.length:0;
  const bySrc={};SOURCES.forEach(s=>bySrc[s]={n:0,rev:0});inR.forEach(h=>{const f=folio(h.ref);bySrc[h.source]=bySrc[h.source]||{n:0,rev:0};bySrc[h.source].n++;bySrc[h.source].rev+=f.total;});
  const direct=inR.length?(bySrc["Consumer app"].n+bySrc["WhatsApp"].n)/inR.length:0;
  let dbl=0;for(const r of rooms){const bs=DB.bookings.filter(b=>b.type==="villa"&&b.roomId===r.id&&!["Cancelled","No-show"].includes(b.status)).sort((a,b)=>a.checkIn.localeCompare(b.checkIn));for(let i=1;i<bs.length;i++)if(bs[i].checkIn<bs[i-1].checkOut)dbl++;}
  const entRev={};inR.forEach(h=>{const f=folio(h.ref);for(const[e,t]of Object.entries(f.E))entRev[e]=(entRev[e]||0)+t.total;});
  const kpi=(label,val,sub,ok)=>`<div class="kpi ${ok===true?"ok":ok===false?"low":""}"><div class="small muted">${label}</div><div class="v">${val}</div><div class="s">${sub}</div></div>`;
  const W=640,Hh=170,bw=W/days,maxR=rooms.length||1;
  const bars=Array.from({length:days},(_,i)=>{const d=addDays(from,i),v=(byDay[d]||0)/maxR,h=v*(Hh-24);return `<rect class="chart-bar" x="${i*bw+1}" y="${Hh-18-h}" width="${Math.max(1,bw-2)}" height="${h}" rx="2"><title>${fd(d)}: ${pct(v)}</title></rect>${i%Math.ceil(days/8)===0?`<text x="${i*bw}" y="${Hh-4}" font-size="9" fill="var(--ink-3)">${fd(d,{day:"numeric",month:"short"})}</text>`:""}`;}).join("");
  const tgtY=Hh-18-0.6*(Hh-24);const maxSrc=Math.max(1,...Object.values(bySrc).map(x=>x.rev));
  const routes=DB.routes.map(r=>{const ds=deps.filter(s=>s.routeId===r.id);const c=ds.reduce((a,s)=>a+boat(s.boatId).cap,0),t=ds.reduce((a,s)=>a+s.taken.length,0);return {r,u:c?t/c:0,n:ds.length};}).filter(x=>x.n);
  const arr=DB.bookings.filter(b=>b.type==="villa"&&b.checkIn===TODAY&&!["Cancelled","No-show"].includes(b.status)).length,inh=DB.bookings.filter(b=>b.type==="villa"&&b.status==="Checked in").length,dep=DB.bookings.filter(b=>b.type==="villa"&&b.status==="Checked in"&&b.checkOut<=TODAY).length,bd=DB.schedules.filter(s=>s.date===TODAY&&s.status==="Scheduled");
  const body=`<div class="filters"><div class="segbar">${[["next30","Next 30 days"],["last30","Last 30 days"],["month","This month"]].map(x=>`<button class="${q.range===x[0]?"on":""}" data-a="pxDash" data-v="${x[0]}">${tx(x[1])}</button>`).join("")}</div><span class="small muted">${fd(from)} to ${fd(to)}. Baseline recorded from go-live; targets are the PRD's proposed month-6 goals.</span></div>
  <div class="kpis">${kpi(tx("Room occupancy"),pct(occ),"Target 60% or more",occ>=.6)}${kpi(tx("Boat seat utilization"),pct(util),"Target 60% or more",util>=.6)}${kpi(tx("Attach rate"),pct(attach),"Stays with a speedboat booking. Target 30%",attach>=.3)}${kpi(tx("Direct booking share"),pct(direct),"App and WhatsApp. Target 40%",direct>=.4)}</div>
  <div class="kpis">${kpi("ADR",fmtUSD(adr),"Average room rate per sold night")}${kpi("RevPAR",fmtUSD(revpar),"Room revenue per available night")}${kpi("Room-nights on hold",held,"Waiting for payment, not counted as sold")}${kpi(tx("Double bookings"),dbl,"Overlapping bookings on one room. Target 0",dbl===0)}</div>
  <div class="cards2"><div class="card"><div class="card-head"><h3>Occupancy by night</h3><span class="tiny muted">Gold line is the 60% target</span></div><div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${Hh}" style="width:100%;min-width:480px" role="img" aria-label="Occupancy by night">${bars}<line class="chart-tgt" x1="0" x2="${W}" y1="${tgtY}" y2="${tgtY}"/></svg></div></div>
   <div class="card"><div class="card-head"><h3>Revenue by booking source</h3></div>${SOURCES.map(s=>`<div class="hbar"><span>${esc(s)} <span class="tiny muted">(${bySrc[s].n})</span></span><i style="width:${Math.round(bySrc[s].rev/maxSrc*100)}%"></i><b style="text-align:right">${fmtUSD(bySrc[s].rev)}</b></div>`).join("")}
    <p class="tiny muted" style="margin-top:8px">${Object.entries(entRev).map(([e,v])=>`${esc(ent(e).short)}: ${fmtUSD(v)}`).join(", ")}</p></div></div>
  <div class="cards2" style="margin-top:18px"><div class="card"><div class="card-head"><h3>Seat utilization by route</h3></div>${routes.map(x=>`<div class="hbar"><span>${esc(portShort(x.r.from))} to ${esc(portShort(x.r.to))}</span><i style="width:${Math.round(x.u*100)}%;background:${x.u>=.6?"var(--ok)":"var(--lagoon)"}"></i><b style="text-align:right">${pct(x.u)}</b></div>`).join("")||`<p class="muted small">No departures in this range.</p>`}</div>
   <div class="card"><div class="card-head"><h3>${tx("Today")}</h3><span class="tiny muted">${fdl(TODAY)}</span></div>
    <div class="list-row"><span>${tx("Arrivals")}</span><b>${arr}</b></div><div class="list-row"><span>${tx("In-house")}</span><b>${inh}</b></div><div class="list-row"><span>Due out</span><b>${dep}</b></div>
    <div class="list-row"><span>Speedboat departures</span><b>${bd.length}, ${bd.reduce((a,s)=>a+s.taken.length,0)} seats sold</b></div>
    <div class="list-row"><span>Holds waiting for payment</span><b>${hs.filter(h=>h.holdUntil).length}</b></div></div></div>`;
  return {title:tx("Dashboard"),sub:"Occupancy and utilization across the resort and the speedboats",body};
};
PX.cal=()=>{
  const q=ui.pq.cal=ui.pq.cal||{type:"all",start:TODAY};const days=Array.from({length:14},(_,i)=>addDays(q.start,i));
  const head=`<tr><th class="rname">Unit</th>${days.map(d=>`<th class="${d===TODAY?"today":[0,6].includes(dow(d))?"wk":""}">${fd(d,{weekday:"narrow"})}<br>${fd(d,{day:"numeric"})}</th>`).join("")}</tr>`;
  let rows="";
  if(q.type!=="boats")for(const v of DB.villas){rows+=`<tr class="vrow"><td colspan="${days.length+1}">${esc(v.name)}</td></tr>`;
    for(const r of v.rooms){rows+=`<tr><td class="rname">${esc(r.name)} ${hkBadge(DB.pms.hk[r.id])}<div class="tiny muted">${fmtUSD(r.price)} base, sleeps ${r.cap}</div></td>`;
      for(const d of days){const b=stayToday(r.id,d),k=oosOn(r.id,d);
        if(b)rows+=`<td><button class="cell bk ${b.status==="Awaiting payment"?"pend":b.status==="Checked in"?"inuse":""}" data-a="pxOpen" data-ref="${b.ref}" title="${esc(b.ref+", "+b.contact.name+", "+itemLife(b))}">${b.checkIn===d||d===q.start?esc(b.contact.name.split(" ")[0]):""}</button></td>`;
        else if(k)rows+=`<td><button class="cell blk" data-a="pv" data-v="mnt" title="Out of service: ${esc(k.reason||"blocked")}">OOS</button></td>`;
        else rows+=`<td><button class="cell" data-a="pxNewFrom" data-room="${r.id}" data-d="${d}" title="Free. Click to book" aria-label="Book ${esc(r.name)} from ${d}"></button></td>`;}
      rows+=`</tr>`;}}
  if(q.type!=="rooms"){rows+=`<tr class="vrow"><td colspan="${days.length+1}">Speedboat departures (seats sold of capacity)</td></tr>`;
    for(const rt of DB.routes){rows+=`<tr><td class="rname">${esc(portShort(rt.from))} to ${esc(portShort(rt.to))}<div class="tiny muted">${durTxt(rt.mins)}</div></td>`;
      for(const d of days){const ds=DB.schedules.filter(s=>s.routeId===rt.id&&s.date===d).sort((a,b)=>a.time.localeCompare(b.time));
        rows+=`<td style="padding:2px">${ds.map(s=>{const c=boat(s.boatId).cap,u=s.taken.length/c;return `<button class="dcell ${s.status==="Cancelled"?"x":u>=.85?"full":u>=.4?"mid":""}" data-a="pxManifest" data-sid="${s.id}" title="${esc(s.time+" "+boat(s.boatId).name+", "+s.taken.length+" of "+c+" seats")}">${s.time} ${s.taken.length}/${c}</button>`;}).join("")}</td>`;}
      rows+=`</tr>`;}}
  const body=`<div class="filters"><div class="segbar">${[["all","All"],["rooms",tx("Rooms")],["boats",tx("Speedboats")]].map(x=>`<button class="${q.type===x[0]?"on":""}" data-a="pxCalType" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>
   <button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="-7">Previous week</button><button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="0">${tx("Today")}</button><button class="btn btn-ghost btn-sm" data-a="pxCalMove" data-n="7">Next week</button></div>
  <div class="tbl-wrap"><table class="cal">${head}<tbody>${rows}</tbody></table></div>
  <div class="cal-legend"><span><i style="background:var(--lagoon)"></i>Sold</span><span><i style="background:var(--gold)"></i>On hold</span><span><i style="background:#12293A"></i>In use</span><span><i style="background:repeating-linear-gradient(135deg,var(--surface-2) 0 3px,var(--line) 3px 6px)"></i>Out of service</span><span>Click a free night to start a booking. Click a departure for its manifest.</span></div>`;
  return {title:tx("Availability"),sub:"One calendar for rooms and speedboat seats, shared by the app, WhatsApp and walk-in sales",actions:`<button class="btn btn-sm" data-a="pv" data-v="newbk">${PXI.plus.replace("<svg",'<svg width="16" height="16"')} ${tx("New booking")}</button>`,body};
};
function pxResRows(){
  const q=ui.pq.res,s=(q.q||"").trim().toLowerCase();
  let hs=Object.values(DB.pms.headers).filter(h=>(q.src==="all"||h.source===q.src)&&(q.st==="all"||headerStatus(h.ref)===q.st));
  if(s)hs=hs.filter(h=>(h.ref+" "+h.name+" "+(h.phone||"")+" "+(h.email||"")).toLowerCase().includes(s));
  hs.sort((a,b)=>(b.createdAt||b.created).localeCompare(a.createdAt||a.created));
  if(!hs.length)return `<tr><td colspan="8" class="muted" style="text-align:center;padding:28px">No bookings match. Clear the search or change the filters.</td></tr>`;
  return hs.slice(0,120).map(h=>{const its=itemsOf(h.ref),f=folio(h.ref),nr=its.filter(b=>b.type==="villa").length,nb=its.filter(b=>b.type==="boat").length;const first=its.map(itemStart).sort()[0];
    return `<tr class="clickable" data-a="pxOpen" data-ref="${h.ref}"><td><b>${esc(h.ref)}</b><div class="tiny muted">${fd(h.created)}</div></td><td>${esc(h.name)}<div class="tiny muted">${esc(h.phone||h.email||"")}</div></td><td class="small">${[nr?nr+" room"+(nr>1?"s":""):"",nb?nb+" speedboat":""].filter(Boolean).join(", ")}</td><td style="white-space:nowrap">${first?fd(first):""}</td><td>${srcBadge(h.source)}</td><td>${fmtUSD(f.total)}</td><td class="${f.balance>0?"miss":""}">${fmtUSD(Math.max(0,f.balance))}</td><td>${lb(headerStatus(h.ref))}</td></tr>`;}).join("");
}
PX.res=()=>{
  const q=ui.pq.res=ui.pq.res||{src:"all",st:"all",q:""};
  const body=`<div class="filters"><label class="field"><span class="sr">${tx("Source")}</span><select class="input" data-on="pxResF" data-k="src"><option value="all">All sources</option>${SOURCES.map(s=>`<option ${q.src===s?"selected":""}>${s}</option>`).join("")}</select></label>
   <label class="field"><span class="sr">${tx("Status")}</span><select class="input" data-on="pxResF" data-k="st"><option value="all">Any status</option>${["Hold","Confirmed","In use","Completed","Cancelled","Expired"].map(s=>`<option value="${s}" ${q.st===s?"selected":""}>${tx(s)}</option>`).join("")}</select></label>
   <label class="field" style="flex:1;min-width:200px"><span class="sr">${tx("Search")}</span><input class="input" type="search" data-in="pxResQ" placeholder="Search booking, guest, phone or email" value="${esc(q.q)}"></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>${tx("Booking")}</th><th>${tx("Guest")}</th><th>${tx("Items")}</th><th>First date</th><th>${tx("Source")}</th><th>${tx("Total")}</th><th>${tx("Balance")}</th><th>${tx("Status")}</th></tr></thead><tbody id="px-res-body">${pxResRows()}</tbody></table></div>`;
  return {title:tx("Reservations"),sub:"Every booking from the app, WhatsApp, walk-ins, phone and agents",actions:pxCan("newbk",pxRole())?`<button class="btn btn-sm" data-a="pv" data-v="newbk">${tx("New booking")}</button>`:"",body};
};
PX.booking=()=>{
  const ref=ui.pref,h=H(ref);if(!h)return {title:"Booking not found",body:`<div class="empty"><p>This booking doesn't exist.</p><button class="btn" data-a="pv" data-v="res">Back to reservations</button></div>`};
  const its=itemsOf(ref),f=folio(ref),st=headerStatus(ref),g=guestOf(h),edit=["Owner","Property Manager","Front Desk"].includes(pxRole());
  const itemRow=b=>{const L=itemLife(b),acts=[];
    if(edit&&b.type==="villa"){if(["Confirmed","Paid"].includes(b.status)&&b.checkIn<=TODAY&&b.checkOut>TODAY)acts.push(`<button class="btn btn-sm" data-a="pxCheckin" data-code="${b.code}">${tx("Check in")}</button>`);
      if(b.status==="Checked in")acts.push(`<button class="btn btn-sm" data-a="pxCheckout" data-code="${b.code}">${tx("Check out")}</button>`);
      if(["Confirmed","Paid"].includes(b.status)&&b.checkIn<TODAY)acts.push(`<button class="btn btn-ghost btn-sm" data-a="pxNoShow" data-code="${b.code}">No-show</button>`);
      if(["Confirmed","Paid","Awaiting payment"].includes(b.status))acts.push(`<button class="btn btn-ghost btn-sm" data-a="pxModal" data-m="pxMoveStay" data-code="${b.code}">Change dates</button>`);}
    if(b.type==="boat"&&b.status!=="Cancelled")acts.push(`<button class="btn btn-ghost btn-sm" data-a="tkOpen" data-ref="${ref}">Tickets</button>`);
    if(edit&&b.type==="boat"&&["Confirmed","Paid","Awaiting payment"].includes(b.status))acts.push(`<button class="btn btn-ghost btn-sm" data-a="pxModal" data-m="pxMoveBoat" data-code="${b.code}">Change departure</button>`);
    if(edit&&["Confirmed","Paid","Awaiting payment"].includes(b.status))acts.push(`<button class="btn btn-danger btn-sm" data-a="pxModal" data-m="pxCancel" data-code="${b.code}">${tx("Cancel")}</button>`);
    const paxL=b.type==="boat"?`<div class="tiny" style="margin-top:4px">${b.pax.map((p,i)=>`${esc(p.name||"Passenger "+(i+1)+" (name to follow)")}${!p.passport||!p.nat?` <span class="miss">ID missing</span>`:""}`).join(", ")}</div>`:"";
    return `<tr><td><b>${esc(itemTitle(b))}</b><div class="tiny muted">${b.code}</div>${paxL}</td><td style="white-space:nowrap">${itemWhen(b)}</td><td>${b.type==="villa"?b.guests+" guests":b.pax.length+" pax"}</td><td>${fmtUSD(itemMoney(b).total)}</td><td>${lb(b.status==="Boarded"?"Boarded":L)}</td><td><div class="btn-row">${acts.join("")}</div></td></tr>`;};
  const fol=Object.entries(f.E).map(([e,t])=>`<div class="card" style="margin-bottom:12px"><div class="card-head"><h3>${esc(ent(e).short)} <span class="tiny muted">${esc(ent(e).name)}</span></h3><button class="btn btn-ghost btn-sm" data-a="invOpen" data-ref="${ref}" data-ent="${e}">${tx("Invoices").replace(/s$/,"")} ${h.inv&&h.inv[e]?esc(h.inv[e]):""}</button></div>
    ${f.lines.filter(l=>l.ent===e).map(l=>`<div class="sum-row"><span>${esc(l.label)}</span><span>${fmtUSD(l.total)}</span></div>`).join("")}
    <div class="sum-row tiny muted"><span>Of which tax and service</span><span>${fmtUSD(t.tax)}</span></div><div class="sum-row sum-total"><span>${tx("Total")}</span><span>${fmtUSD(t.total)}</span></div>
    <div class="sum-row"><span>${tx("Paid")}${t.refunded?", refunded "+fmtUSD(t.refunded):""}</span><span>${fmtUSD(t.paid)}</span></div><div class="sum-row"><b>${tx("Balance")}</b><b class="${t.balance>0?"miss":""}">${fmtUSD(t.balance)}</b></div></div>`).join("")||`<p class="muted small">No charges.</p>`;
  const msgs=DB.pms.msgs.filter(m=>m.ref===ref).slice(0,8),aud=DB.pms.audit.filter(a=>a.id===ref||its.some(b=>b.code===a.id)).slice(0,10);
  const body=`${h.holdUntil?`<div class="card" style="background:var(--warn-soft);border-color:transparent;margin-bottom:16px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>On hold until ${wib(h.holdUntil)}</b><p class="small">Rooms and seats are released automatically if not paid by then (in ${Math.max(0,Math.round((h.holdUntil-Date.now())/6e4))} minutes).</p></div><div class="btn-row"><button class="btn btn-sm" data-a="pxResendLink">Send payment link again</button><button class="btn btn-ghost btn-sm" data-a="pxRelease">Release hold now</button></div></div>`:""}
  <div class="kpis"><div class="kpi"><div class="small muted">${tx("Guest")}</div><div class="v" style="font-size:1.15rem">${g?`<button class="link" data-a="pxModal" data-m="pxGuest" data-id="${g.id}">${esc(h.name)}</button>`:esc(h.name)}</div><div class="s">${esc(h.phone||"")}${h.email?", "+esc(h.email):""}</div></div>
   <div class="kpi"><div class="small muted">${tx("Source")}</div><div class="v" style="font-size:1.15rem">${srcBadge(h.source)}</div><div class="s">${h.convo?`Mobichat conversation ${esc(h.convo)}`:"Created by "+esc(h.by||"")}</div></div>
   <div class="kpi"><div class="small muted">${tx("Total")}</div><div class="v">${fmtUSD(f.total)}</div><div class="s">${tx("Paid")} ${fmtUSD(f.paid-f.refunded)}</div></div>
   <div class="kpi"><div class="small muted">${tx("Balance")}</div><div class="v ${f.balance>0?"miss":""}">${fmtUSD(f.balance)}</div><div class="s">${f.balance<0?"Credit: refund due":f.balance>0?"Due before check-out":"Settled"}</div></div></div>
  <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${tx("Items")}</h3>${edit&&st!=="Expired"?`<div class="btn-row"><button class="btn btn-ghost btn-sm" data-a="pxAddItem" data-k="stay">Add room</button><button class="btn btn-ghost btn-sm" data-a="pxAddItem" data-k="boat">Add speedboat</button></div>`:""}</div>
   <div class="tbl-wrap"><table><thead><tr><th>Item</th><th>When</th><th>Pax</th><th>${tx("Amount")}</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${its.map(itemRow).join("")}</tbody></table></div></div>
  <div class="cards2"><div><div class="card-head"><h3>${tx("Folio")}</h3>${edit||pxRole()==="Finance"?`<div class="btn-row"><button class="btn btn-sm" data-a="pxModal" data-m="pxPay">${tx("Take payment")}</button>${edit?`<button class="btn btn-ghost btn-sm" data-a="pxModal" data-m="pxCharge">${tx("Post charge")}</button>`:""}<button class="btn btn-ghost btn-sm" data-a="pxModal" data-m="pxRefund">${tx("Refund")}</button></div>`:""}</div>${fol}
    <div class="card"><h3 style="font-size:1.05rem;margin-bottom:8px">${tx("Payments")}</h3>${h.payments.map(p=>`<div class="list-row"><span class="small">${wib(Date.parse(p.at))}, ${esc(p.method)} via ${esc(p.channel)}<br><span class="tiny muted">${Object.entries(p.split||{}).map(([e,a])=>esc(ent(e).short)+" "+fmtUSD(a)).join(", ")}</span></span><b>${fmtUSD(p.amount)}</b></div>`).join("")||`<p class="muted small">No payments yet.</p>`}
     ${h.refunds.map(r=>`<div class="list-row"><span class="small">Refund, ${esc(r.reason)}<br><span class="tiny muted">${wib(Date.parse(r.at))}</span></span><span>${lb(r.status)} <b>-${fmtUSD(r.amount)}</b>${r.status==="Pending approval"&&isMgr()?` <button class="btn btn-sm" data-a="pxRefundOk" data-ref="${ref}" data-id="${r.id}">${tx("Approve")}</button>`:""}</span></div>`).join("")}</div></div>
   <div><div class="card" style="margin-bottom:12px"><h3 style="font-size:1.05rem;margin-bottom:8px">${tx("Messages")}</h3>${msgs.map(m=>`<div class="list-row" style="align-items:flex-start"><span class="small"><b>${esc(m.name)}</b> <span class="tiny muted">${esc(m.channel)}, ${wib(Date.parse(m.at))}</span><br>${esc(m.text)}</span></div>`).join("")||`<p class="muted small">No messages yet.</p>`}</div>
    <div class="card"><h3 style="font-size:1.05rem;margin-bottom:8px">History</h3><div class="timeline">${aud.map(a=>`<div><b>${wib(Date.parse(a.at))}</b> <span class="muted">${esc(a.action)}${a.after?": "+esc(a.after):""}, ${esc(a.actor)}</span></div>`).join("")||`<p class="muted small">No changes yet.</p>`}</div></div></div></div>`;
  return {title:`${tx("Booking")} ${esc(ref)} ${lb(st)}`,sub:`Created ${fdl(h.created)}${h.promo?", promo "+esc(h.promo):""}`,actions:`<button class="btn btn-ghost btn-sm" data-a="pv" data-v="res">All reservations</button>`,body};
};

/* ---------- new booking (R-03, C-02, C-04, G-02) ---------- */
function nbFresh(o){return Object.assign({source:"WhatsApp",convo:"",q:"",gid:null,g:{name:"",phone:"",email:"",country:"Australia"},items:[],start:Date.now(),addTo:null,mode:"hold",method:"Cash",amt:"deposit",checkin:false,promo:"",
  f:{room:roomsList()[0].id,ci:addDays(TODAY,7),co:addDays(TODAY,10),guests:2,route:DB.routes[0].id,bdate:addDays(TODAY,7),dep:"",pax:2,ret:false,rdate:addDays(TODAY,10),rdep:""}},o||{});}
function nbQuote(it,promo){if(it.kind==="stay"){const q=quoteStay(it.roomId,it.ci,it.co,promo);const r=roomById(it.roomId);const ok=roomFree(it.roomId,it.ci,it.co)&&it.guests<=r.cap&&it.co>it.ci;return {q,ok,msg:ok?"":!roomFree(it.roomId,it.ci,it.co)?"Not free for these dates":"Check dates and guests"};}
  const q=quoteBoat(it.legs.map(l=>l.sid),it.pax.length);const bad=it.legs.find(l=>{const s=sch(l.sid);return !saleOpen(s)||seatsLeft(s)<it.pax.length;});return {q,ok:!bad,msg:bad?"Not enough seats or sales closed":""};}
function nbSugg(nb){const out=[];for(const it of nb.items.filter(x=>x.kind==="stay")){const r=roomById(it.roomId),p=PORT_OF[r.villa.id];
  if(nb.items.some(x=>x.kind==="boat"&&x.legs.some(l=>{const s=sch(l.sid);return route(s.routeId).to===p&&s.date===it.ci;})))continue;
  const pick=(a,b,d)=>DB.schedules.filter(s=>{const rt=route(s.routeId);return rt.from===a&&rt.to===b&&s.date===d&&saleOpen(s)&&seatsLeft(s)>=it.guests;}).sort((x,y)=>x.time.localeCompare(y.time))[0];
  const o=pick("PDG",p,it.ci),bk=pick(p,"PDG",it.co);if(o||bk)out.push({it,o,bk,p});}return out;}
PX.newbk=()=>{
  const nb=ui.nb=ui.nb||nbFresh(),F=nb.f,role=pxRole();
  const routeOpts=DB.routes.map(r=>`<option value="${r.id}" ${F.route===r.id?"selected":""}>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</option>`).join("");
  const rt=route(F.route),depsOut=DB.schedules.filter(s=>s.routeId===F.route&&s.date===F.bdate&&s.status==="Scheduled").sort((a,b)=>a.time.localeCompare(b.time));
  const back=DB.routes.find(r=>r.from===rt.to&&r.to===rt.from),depsBack=back?DB.schedules.filter(s=>s.routeId===back.id&&s.date===F.rdate&&s.status==="Scheduled").sort((a,b)=>a.time.localeCompare(b.time)):[];
  const depOpt=(list,cur)=>list.map(s=>{const open=saleOpen(s),left=seatsLeft(s);return `<option value="${s.id}" ${cur===s.id?"selected":""} ${open?"":"disabled"}>${s.time}, ${left} seats left, ${fmtUSD(s.price)}${open?"":" (sales closed)"}</option>`;}).join("")||`<option value="">No departures</option>`;
  const g=nb.gid&&userById(nb.gid);
  const items=nb.items.map((it,i)=>{const Q=nbQuote(it,nb.promo);
    if(it.kind==="stay"){const r=roomById(it.roomId);return `<div class="nb-item ${Q.ok?"":"bad"}"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>${esc(r.villa.name)}, ${esc(r.name)}</b><p class="small muted">${fd(it.ci)} to ${fd(it.co)}, ${Q.q.nights} nights, ${it.guests} guests. Room is ${esc(DB.pms.hk[r.id]||"")}.</p>${Q.ok?"":`<p class="err">${Q.msg}</p>`}</div><div style="text-align:right"><b>${fmtUSD(Q.q.total)}</b><br><button class="link small" data-a="nbRemove" data-i="${i}">Remove</button></div></div><div class="tiny muted">${Q.q.lines.map(l=>esc(l.label)+" "+fmtUSD(l.amount)).join(", ")}</div></div>`;}
    const s0=sch(it.legs[0].sid),r0=route(s0.routeId);
    return `<div class="nb-item ${Q.ok?"":"bad"}"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>Speedboat ${esc(portShort(r0.from))} to ${esc(portShort(r0.to))}${it.legs.length>1?" and back":""}</b><p class="small muted">${it.legs.map(l=>{const s=sch(l.sid);return fd(s.date)+" "+s.time+" ("+seatsLeft(s)+" left)";}).join(", ")}</p>${Q.ok?"":`<p class="err">${Q.msg}</p>`}</div><div style="text-align:right"><b>${fmtUSD(Q.q.total)}</b><br><button class="link small" data-a="nbRemove" data-i="${i}">Remove</button></div></div>
     ${it.pax.map((p,j)=>`<div class="grid3" style="margin-top:8px"><input class="input" placeholder="Passenger ${j+1} name" data-pax="${i}|${j}|name" value="${esc(p.name)}"><select class="input" data-pax="${i}|${j}|nat">${COUNTRIES.map(c=>`<option ${p.nat===c?"selected":""}>${c}</option>`).join("")}</select><input class="input" placeholder="Passport or ID (needed for manifest)" data-pax="${i}|${j}|passport" value="${esc(p.passport)}"></div>`).join("")}</div>`;}).join("");
  const sug=nbSugg(nb).map(x=>`<div class="sugg"><span class="small"><b>Suggested transfer</b> for ${esc(roomById(x.it.roomId).villa.name)}: ${x.o?`Padang to ${esc(portShort(x.p))} ${fd(x.o.date)} ${x.o.time}`:""}${x.o&&x.bk?", ":""}${x.bk?`back ${fd(x.bk.date)} ${x.bk.time}`:""} for ${x.it.guests} guests</span><button class="btn btn-sm" data-a="nbAddTransfer" data-i="${nb.items.indexOf(x.it)}">Add transfer</button></div>`).join("");
  const Qs=nb.items.map(it=>nbQuote(it,nb.promo)),total=Qs.reduce((a,x)=>a+x.q.total,0),hasStay=nb.items.some(x=>x.kind==="stay"),dep=hasStay?Math.round(total*DB.pms.rules.depositPct/100):total;
  const holdMin=holdMinutesFor(nb.source);
  const body=`<div class="cards2" style="grid-template-columns:1.4fr 1fr"><div>
   <section class="panel"><h3>1. Channel</h3><div class="chip-src">${["WhatsApp","Walk-in","Phone","Agent"].map(s=>`<button class="${nb.source===s?"on":""}" data-a="nbSrc" data-v="${s}">${s}</button>`).join("")}</div>
    ${nb.source==="WhatsApp"?`<label class="field" style="margin-top:12px;max-width:320px"><span>Mobichat conversation</span><input class="input" data-nb="convo" placeholder="MC-48213 (filled in automatically if empty)" value="${esc(nb.convo)}"></label>`:""}
    ${nb.addTo?`<p class="small" style="margin-top:10px">Adding items to booking <b>${esc(nb.addTo)}</b>.</p>`:""}</section>
   <section class="panel"><h3>2. ${tx("Guest")}</h3>${g?`<div class="list-row"><div><b>${esc(g.name)}</b><p class="small muted">${esc(g.phone||"")}${g.email?", "+esc(g.email):""}, ${esc(g.country)}. ${guestHeaders(g.id).length} previous booking(s)${(g.tags||[]).length?", "+g.tags.map(esc).join(", "):""}</p></div>${nb.addTo?"":`<button class="btn btn-ghost btn-sm" data-a="nbClearGuest">Change</button>`}</div>`
    :`<label class="field"><span>Find a returning guest by phone, email or name</span><input class="input" data-in="nbQ" placeholder="e.g. +61 412 or anna" value="${esc(nb.q)}"></label><div class="nb-res" id="nb-res">${nbResults(nb.q)}</div>
     <p class="small muted" style="margin:14px 0 8px">Or a new guest (name and phone are enough for walk-ins):</p>
     <div class="grid2"><label class="field"><span>Full name</span><input class="input" data-nb="gname" value="${esc(nb.g.name)}"></label><label class="field"><span>WhatsApp or phone</span><input class="input" data-nb="gphone" value="${esc(nb.g.phone)}" placeholder="+62 812 3456 7890"></label>
     <label class="field"><span>Email (optional)</span><input class="input" data-nb="gemail" value="${esc(nb.g.email)}"></label><label class="field"><span>Nationality</span><select class="input" data-nb="gcountry">${COUNTRIES.map(c=>`<option ${nb.g.country===c?"selected":""}>${c}</option>`).join("")}</select></label></div>`}</section>
   <section class="panel"><h3>3. ${tx("Items")}</h3>${items||`<p class="muted small">No items yet. Add a room, a speedboat trip or both.</p>`}${sug}
    <div class="card" style="margin-top:10px"><b>Add a room</b><div class="grid3" style="margin-top:8px"><label class="field"><span>${tx("Room")}</span><select class="input" data-nb="room">${DB.villas.map(v=>`<optgroup label="${esc(v.name)}">${v.rooms.filter(r=>r.active).map(r=>`<option value="${r.id}" ${F.room===r.id?"selected":""}>${esc(r.name)}, sleeps ${r.cap}</option>`).join("")}</optgroup>`).join("")}</select></label>
     <label class="field"><span>${tx("Check in")}</span><input class="input" type="date" data-nb="ci" value="${F.ci}" min="${TODAY}"></label><label class="field"><span>${tx("Check out")}</span><input class="input" type="date" data-nb="co" value="${F.co}" min="${addDays(F.ci,1)}"></label></div>
     <div style="display:flex;gap:10px;align-items:end;margin-top:8px"><label class="field" style="width:120px"><span>Guests</span><select class="input" data-nb="guests">${[1,2,3,4].map(n=>`<option ${+F.guests===n?"selected":""}>${n}</option>`).join("")}</select></label><button class="btn btn-soft btn-sm" data-a="nbAddRoom">Add room</button>
     <span class="small muted">${roomFree(F.room,F.ci,F.co)?`Free, ${fmtUSD(quoteStay(F.room,F.ci,F.co,nb.promo).total)}`:`<span class="miss">Not free for these dates</span>`}</span></div></div>
    <div class="card" style="margin-top:10px"><b>Add a speedboat trip</b><div class="grid3" style="margin-top:8px"><label class="field"><span>${tx("Route")}</span><select class="input" data-nb="route" data-nbr="1">${routeOpts}</select></label><label class="field"><span>${tx("Date")}</span><input class="input" type="date" data-nb="bdate" data-nbr="1" value="${F.bdate}" min="${TODAY}"></label><label class="field"><span>Departure</span><select class="input" data-nb="dep">${depOpt(depsOut,F.dep)}</select></label></div>
     <div style="display:flex;gap:10px;align-items:end;margin-top:8px;flex-wrap:wrap"><label class="field" style="width:110px"><span>${tx("Passengers")}</span><select class="input" data-nb="pax">${[1,2,3,4,5,6].map(n=>`<option ${+F.pax===n?"selected":""}>${n}</option>`).join("")}</select></label>
     <label class="small" style="display:flex;gap:6px;align-items:center;padding-bottom:10px"><input type="checkbox" data-nb="ret" data-nbr="1" ${F.ret?"checked":""}>Return trip</label>
     ${F.ret?`<label class="field"><span>Return date</span><input class="input" type="date" data-nb="rdate" data-nbr="1" value="${F.rdate}" min="${F.bdate}"></label><label class="field"><span>Return departure</span><select class="input" data-nb="rdep">${depOpt(depsBack,F.rdep)}</select></label>`:""}
     <button class="btn btn-soft btn-sm" data-a="nbAddBoat">Add speedboat</button></div></div></section></div>
  <aside><section class="panel" style="position:sticky;top:20px"><div class="card-head"><h3 style="margin:0">4. Summary</h3><span class="nb-timer" id="nb-timer">0:00</span></div>
   ${nb.items.map((it,i)=>`<div class="sum-row"><span class="small">${it.kind==="stay"?esc(roomById(it.roomId).name):"Speedboat"}</span><span>${fmtUSD(Qs[i].q.total)}</span></div>`).join("")}
   <div class="sum-row sum-total"><span>${tx("Total")}</span><span>${fmtUSD(total)}</span></div>
   <label class="field" style="margin-top:8px"><span>Promo code</span><input class="input" data-nb="promo" data-nbr="1" value="${esc(nb.promo)}" placeholder="MENTAWAI10"></label>
   <div style="margin-top:12px"><label class="dep-opt"><input type="radio" name="nbm" data-nb="mode" data-nbr="1" value="hold" ${nb.mode==="hold"?"checked":""}><span><b>Hold and send Pivot payment link</b><span class="small muted" style="display:block">Released automatically after ${holdMin>=60?Math.round(holdMin/60)+" hours":holdMin+" minutes"} if unpaid. Reminder before expiry.</span></span></label>
    <label class="dep-opt"><input type="radio" name="nbm" data-nb="mode" data-nbr="1" value="confirm" ${nb.mode==="confirm"?"checked":""}><span><b>Confirm and take payment now</b></span></label></div>
   ${nb.mode==="confirm"?`<div class="grid2" style="margin-top:10px"><label class="field"><span>${tx("Method")}</span><select class="input" data-nb="method">${DESK_METHODS.filter(m=>m!=="Pivot payment link").map(m=>`<option ${nb.method===m?"selected":""}>${m}</option>`).join("")}</select></label>
    <label class="field"><span>${tx("Amount")}</span><select class="input" data-nb="amt" data-nbr="1"><option value="deposit" ${nb.amt==="deposit"?"selected":""}>${hasStay?"Deposit "+DB.pms.rules.depositPct+"%: "+fmtUSD(dep):"Full: "+fmtUSD(total)}</option><option value="full" ${nb.amt==="full"?"selected":""}>Full: ${fmtUSD(total)}</option></select></label></div>
    ${nb.items.some(x=>x.kind==="stay"&&x.ci===TODAY)?`<label class="small" style="display:flex;gap:8px;margin-top:10px"><input type="checkbox" data-nb="checkin" ${nb.checkin?"checked":""}>Check the guest in now (walk-in)</label>`:""}`:""}
   ${ui.nbErr?`<p class="err" role="alert" style="margin-top:10px">${esc(ui.nbErr)}</p>`:""}
   <button class="btn btn-block" style="margin-top:14px" data-a="nbCreate">${tx("Create booking")}</button>
   <button class="btn btn-ghost btn-block btn-sm" style="margin-top:8px" data-a="nbReset">Start over</button></section></aside></div>`;
  return {title:tx("New booking"),sub:"For WhatsApp, walk-in, phone and agent bookings. One booking can hold rooms and speedboat trips",body};
};
function nbResults(q){q=(q||"").trim().toLowerCase();if(q.length<2)return "";const qd=q.replace(/\D/g,"");
  const m=(DB.users||[]).filter(u=>u.role==="Guest"&&(u.name.toLowerCase().includes(q)||lc(u.email).includes(q)||(qd.length>=3&&normPhone(u.phone).includes(qd)))).slice(0,6);
  return m.map(u=>`<button data-a="nbPick" data-id="${u.id}"><span><b>${esc(u.name)}</b> <span class="muted">${esc(u.phone||"")}, ${esc(u.email||"")}</span></span><span class="tiny muted">${guestHeaders(u.id).length} bookings</span></button>`).join("")||`<p class="small muted" style="margin-top:6px">No match. Enter a new guest below.</p>`;}

/* ---------- front desk (O-01, C-04) ---------- */
PX.front=()=>{
  const tab=ui.pq.front||"arr";const V=DB.bookings.filter(b=>b.type==="villa");
  const L={arr:V.filter(b=>b.checkIn===TODAY&&["Confirmed","Paid","Awaiting payment"].includes(b.status)),inh:V.filter(b=>b.status==="Checked in"),dep:V.filter(b=>b.status==="Checked in"&&b.checkOut<=TODAY),late:V.filter(b=>["Confirmed","Paid"].includes(b.status)&&b.checkIn<TODAY&&b.checkOut>TODAY)};
  const row=b=>{const r=roomById(b.roomId),f=folio(b.ref),acts=[];
    if(tab==="arr"||tab==="late"){acts.push(`<button class="btn btn-sm" data-a="pxCheckin" data-code="${b.code}">${tx("Check in")}</button>`);if(tab==="late")acts.push(`<button class="btn btn-ghost btn-sm" data-a="pxNoShow" data-code="${b.code}">No-show</button>`);}
    if(tab==="inh")acts.push(`<button class="btn btn-ghost btn-sm" data-a="pxOpenCharge" data-ref="${b.ref}">${tx("Post charge")}</button>`);
    if(tab==="dep"||tab==="inh")acts.push(`<button class="btn btn-sm ${tab==="inh"?"btn-ghost":""}" data-a="pxCheckout" data-code="${b.code}">${tx("Check out")}</button>`);
    return `<tr><td><button class="link" data-a="pxOpen" data-ref="${b.ref}">${esc(b.contact.name)}</button><div class="tiny muted">${esc(b.contact.phone||"")}, ${b.ref}</div></td><td>${esc(r.villa.name)}<div class="tiny muted">${esc(r.name)}</div></td><td>${fd(b.checkIn)} to ${fd(b.checkOut)}</td><td>${b.guests}</td><td>${hkBadge(DB.pms.hk[b.roomId])}</td><td class="${f.balance>0?"miss":""}">${fmtUSD(Math.max(0,f.balance))}</td><td>${lb(itemLife(b))}</td><td><div class="btn-row">${acts.join("")}</div></td></tr>`;};
  const list=L[tab];
  const body=`<div class="tabsx">${[["arr",tx("Arrivals")+" ("+L.arr.length+")"],["inh",tx("In-house")+" ("+L.inh.length+")"],["dep","Due out ("+L.dep.length+")"],["late","Late arrivals ("+L.late.length+")"]].map(x=>`<button class="${tab===x[0]?"on":""}" data-a="pxFront" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>
  <div class="tbl-wrap"><table><thead><tr><th>${tx("Guest")}</th><th>${tx("Room")}</th><th>Stay</th><th>Pax</th><th>${tx("Housekeeping")}</th><th>${tx("Balance")}</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${list.map(row).join("")||`<tr><td colspan="8" class="muted" style="text-align:center;padding:26px">Nothing here today.</td></tr>`}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Check-out is blocked while the folio has a balance, unless a manager overrides. Same-day arrivals can only go into rooms marked inspected.</p>`;
  return {title:tx("Front desk"),sub:fdl(TODAY),actions:`<button class="btn btn-sm" data-a="pxWalkin">${tx("Walk-in booking")}</button>`,body};
};

/* ---------- housekeeping (O-02) ---------- */
PX.hk=()=>{
  const rooms=roomsList();const cnt=s=>rooms.filter(r=>DB.pms.hk[r.id]===s).length;
  const occ=r=>{const b=stayToday(r.id);const arr=DB.bookings.find(x=>x.type==="villa"&&x.roomId===r.id&&x.checkIn===TODAY&&!["Cancelled","No-show"].includes(x.status)&&x.status!=="Checked in");
    if(oosOn(r.id,TODAY))return "Out of service";if(b&&b.status==="Checked in")return b.checkOut<=TODAY?"Due out":tx("Occupied");if(arr)return "Arriving today";return tx("Vacant");};
  const cards=rooms.map(r=>{const s=DB.pms.hk[r.id]||"dirty";return `<div class="hk-card ${s}"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>${esc(r.name)}</b><p class="tiny muted">${esc(r.villa.name)}</p></div>${hkBadge(s)}</div><p class="small" style="margin:8px 0">${esc(occ(r))}</p>
   <div class="btn-row" style="justify-content:flex-start">${s==="dirty"?`<button class="btn btn-sm" data-a="pxHk" data-id="${r.id}" data-v="clean">Mark clean</button>`:""}${s==="clean"?`<button class="btn btn-sm" data-a="pxHk" data-id="${r.id}" data-v="inspected">Mark inspected</button>`:""}${s!=="dirty"?`<button class="btn btn-ghost btn-sm" data-a="pxHk" data-id="${r.id}" data-v="dirty">Mark dirty</button>`:""}</div></div>`;}).join("");
  const tasks=DB.pms.tasks.filter(t=>t.status!=="Done");
  const body=`<div class="kpis"><div class="kpi"><div class="small muted">${tx("Dirty")}</div><div class="v">${cnt("dirty")}</div></div><div class="kpi"><div class="small muted">${tx("Clean")}, not inspected</div><div class="v">${cnt("clean")}</div></div><div class="kpi"><div class="small muted">${tx("Inspected")}</div><div class="v">${cnt("inspected")}</div><div class="s">Ready to sell for today</div></div><div class="kpi"><div class="small muted">Open tasks</div><div class="v">${tasks.length}</div></div></div>
  <div class="hk-grid">${cards}</div>
  <h2 style="font-size:1.3rem;margin:24px 0 10px">Tasks</h2><div class="tbl-wrap"><table><thead><tr><th>Task</th><th>${tx("Room")}</th><th>Due</th><th>Assignee</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${tasks.map(t=>{const r=roomById(t.roomId);return `<tr><td>${esc(t.type)}<div class="tiny muted">${esc(t.note||"")}</div></td><td>${esc(r?r.villa.name+", "+r.name:"")}</td><td>${fd(t.due)}</td><td>${esc(t.assignee||"Unassigned")}</td><td>${lb(t.status)}</td><td><button class="btn btn-sm" data-a="pxTaskDone" data-id="${t.id}">Done</button></td></tr>`;}).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">No open tasks.</td></tr>`}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Check-out marks a room dirty and creates a cleaning task automatically.</p>`;
  return {title:tx("Housekeeping"),sub:"Room status board: dirty, clean, inspected",body};
};

/* ---------- maintenance (O-03) ---------- */
PX.mnt=()=>{
  const o=DB.pms.orders.slice().sort((a,b)=>(a.status==="Done")-(b.status==="Done")||b.created.localeCompare(a.created));
  const body=`<div class="tbl-wrap"><table><thead><tr><th>Order</th><th>${tx("Room")}</th><th>Issue</th><th>Priority</th><th>Out of service</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${o.map(w=>{const r=roomById(w.roomId);return `<tr><td><b>${esc(w.id)}</b><div class="tiny muted">${fd(w.created)}, ${esc(w.by||"")}</div></td><td>${esc(r?r.villa.name+", "+r.name:"")}</td><td>${esc(w.title)}</td><td>${lb(w.priority==="High"?"Pending approval":"Open").replace(/>[^<]+</,">"+esc(w.priority)+"<")}</td><td>${w.from?fd(w.from)+" to "+fd(w.to):"Not blocked"}</td><td>${lb(w.status)}</td><td><div class="btn-row">${w.status==="Open"?`<button class="btn btn-ghost btn-sm" data-a="pxWo" data-id="${w.id}" data-v="In progress">Start</button>`:""}${w.status!=="Done"?`<button class="btn btn-sm" data-a="pxWo" data-id="${w.id}" data-v="Done">Complete</button>`:""}</div></td></tr>`;}).join("")}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">A blocked room disappears from availability on every channel for the block period. Completing the order puts it back on sale.</p>`;
  return {title:tx("Maintenance"),sub:tx("Work orders"),actions:`<button class="btn btn-sm" data-a="pxModal" data-m="pxWO">${tx("New work order")}</button>`,body};
};

/* ---------- speedboat ops (O-04, O-05, C-07) ---------- */
function paxOn(sid){const out=[];for(const b of DB.bookings){if(b.type!=="boat"||b.status==="Cancelled")continue;b.legs.forEach(l=>{if(l.sid===sid)l.seats.forEach((seat,i)=>out.push({seat,p:b.pax[i]||{},b}));});}return out.sort((x,y)=>x.seat.localeCompare(y.seat,undefined,{numeric:true}));}
function saleLabel(s){if(s.status==="Cancelled")return "Cancelled";if(DB.pms.closed[s.id])return "Closed";const t=depTs(s);if(Date.now()>t)return "Departed";if(Date.now()>t-DB.pms.rules.closeMin*6e4)return "Sales closed";return "On sale until "+wibTime(t-DB.pms.rules.closeMin*6e4);}
PX.boats=()=>{
  const q=ui.pq.boats=ui.pq.boats||{date:TODAY,route:"all"};
  const ds=DB.schedules.filter(s=>s.date===q.date&&(q.route==="all"||s.routeId===q.route)).sort((a,b)=>a.time.localeCompare(b.time));
  const rows=ds.map(s=>{const r=route(s.routeId),b=boat(s.boatId),px=paxOn(s.id),bd=px.filter(x=>DB.pms.boarded[s.id+"|"+x.seat]).length,miss=px.filter(x=>!x.p.passport||!x.p.nat).length;
    return `<tr><td><b>${s.time}</b></td><td>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</td><td>${esc(b.name)}</td><td><div class="load"><i style="width:${Math.round(s.taken.length/b.cap*100)}%"></i></div><span class="tiny muted">${s.taken.length} of ${b.cap} sold</span></td><td>${bd} / ${px.length}${miss?`<div class="tiny miss">${miss} ID missing</div>`:""}</td><td class="small">${esc(saleLabel(s))}</td>
    <td><div class="btn-row"><button class="btn btn-sm" data-a="pxManifest" data-sid="${s.id}">${tx("Manifest")}</button>${s.status==="Scheduled"&&depTs(s)>Date.now()-36e5?`<button class="btn btn-danger btn-sm" data-a="pxModal" data-m="pxWeather" data-sid="${s.id}">${tx("Weather cancel")}</button>`:""}</div></td></tr>`;}).join("");
  const body=`<div class="filters"><button class="btn btn-ghost btn-sm" data-a="pxBoatDay" data-n="-1">Previous day</button><button class="btn btn-ghost btn-sm" data-a="pxBoatDay" data-n="0">${tx("Today")}</button><button class="btn btn-ghost btn-sm" data-a="pxBoatDay" data-n="1">Next day</button>
   <label class="field"><span class="sr">${tx("Date")}</span><input class="input" type="date" value="${q.date}" data-on="pxBoatDate"></label>
   <label class="field"><span class="sr">${tx("Route")}</span><select class="input" data-on="pxBoatRoute"><option value="all">All routes</option>${DB.routes.map(r=>`<option value="${r.id}" ${q.route===r.id?"selected":""}>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</option>`).join("")}</select></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>${tx("Time")}</th><th>${tx("Route")}</th><th>${tx("Boat")}</th><th>Seats</th><th>${tx("Boarded")}</th><th>Sales</th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="7" class="muted" style="text-align:center;padding:26px">No departures on ${fd(q.date)}.</td></tr>`}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Boats, routes and the departure timetable are set up under Setup, Speedboats.</p>`;
  return {title:tx("Speedboat ops"),sub:fdl(q.date),body};
};

/* ---------- pier counter (C-05, C-06, C-08) ---------- */
PX.pier=()=>{
  const q=ui.pq.pier=ui.pq.pier||{sid:null,n:1,pay:"Cash",pax:[],phone:"",done:null,start:Date.now()};
  if(q.done){const h=H(q.done);return {title:tx("Pier counter"),sub:"Sale complete",body:`<div class="card" style="margin-bottom:14px"><b>Sold. Booking ${esc(q.done)}, paid ${fmtUSD(folio(q.done).paid)} by ${esc((h.payments[0]||{}).method||"")}.</b><p class="small muted">Tickets were also sent to ${esc(h.phone)} on WhatsApp. Seat counts are updated on the app and WhatsApp straight away.</p></div><div id="inv-print">${ticketsHTML(q.done)}</div><div class="btn-row" style="justify-content:flex-start;margin-top:14px"><button class="btn" data-a="pxPierNew">Sell another</button><button class="btn btn-ghost" data-a="invPrint">Print tickets</button></div>`};}
  const list=DB.schedules.filter(s=>(s.date===TODAY||s.date===addDays(TODAY,1))&&s.status==="Scheduled"&&boat(s.boatId).status==="Active").sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const tiles=list.map(s=>{const r=route(s.routeId),open=saleOpen(s),left=seatsLeft(s);return `<button class="pier-tile ${q.sid===s.id?"on":""}" data-a="pxPierPick" data-sid="${s.id}" ${open&&left?"":"disabled"}><span class="tiny muted">${s.date===TODAY?tx("Today"):"Tomorrow"}, ${esc(boat(s.boatId).name)}</span><b style="font-size:1.25rem">${s.time}</b><span>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</span><span class="small ${left<=4?"miss":""}">${left} ${tx("Seats left").toLowerCase()}, ${fmtUSD(s.price)}</span><span class="tiny muted">${esc(saleLabel(s))}</span></button>`;}).join("");
  let form="";
  if(q.sid){const s=sch(q.sid),r=route(s.routeId),qt=quoteBoat([s.id],q.n);while(q.pax.length<q.n)q.pax.push({name:"",nat:"Indonesia",passport:""});
    form=`<section class="panel" style="margin-top:16px"><div class="card-head"><h3 style="margin:0">${s.time} ${esc(portShort(r.from))} to ${esc(portShort(r.to))}, ${fd(s.date)}</h3><span class="nb-timer" id="nb-timer">0:00</span></div>
     <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label class="field" style="width:120px"><span>${tx("Passengers")}</span><select class="input" data-on="pxPierN">${[1,2,3,4,5,6].filter(n=>n<=seatsLeft(s)).map(n=>`<option ${q.n===n?"selected":""}>${n}</option>`).join("")}</select></label>
      <label class="field" style="min-width:220px"><span>Lead passenger phone</span><input class="input" data-pier="phone" value="${esc(q.phone)}" placeholder="+62 812 3456 7890"></label></div>
     ${Array.from({length:q.n},(_,i)=>`<div class="grid3" style="margin-top:10px"><input class="input" data-pier="${i}|name" placeholder="Passenger ${i+1} full name" value="${esc(q.pax[i].name)}"><select class="input" data-pier="${i}|nat">${COUNTRIES.map(c=>`<option ${q.pax[i].nat===c?"selected":""}>${c}</option>`).join("")}</select><input class="input" data-pier="${i}|passport" placeholder="KTP or passport number" value="${esc(q.pax[i].passport)}"></div>`).join("")}
     <div style="display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap"><div class="segbar">${["Cash","QRIS"].map(m=>`<button class="${q.pay===m?"on":""}" data-a="pxPierPay" data-v="${m}">${m}</button>`).join("")}</div><b style="font-size:1.2rem">${fmtUSD(qt.total)}</b><span class="small muted">Rp ${Math.round(qt.total*DB.pms.rules.fx.IDR).toLocaleString("id-ID")}</span>
      <button class="btn" data-a="pxSell">${tx("Sell seats")} (${q.n})</button></div>${ui.nbErr?`<p class="err" style="margin-top:10px">${esc(ui.nbErr)}</p>`:""}</section>`;}
  return {title:tx("Pier counter"),sub:`Walk-in seat sales. Sales close ${DB.pms.rules.closeMin} minutes before departure on every channel`,body:`<div class="pier-grid">${tiles||`<p class="muted">No departures on sale today or tomorrow.</p>`}</div>${form}`};
};

/* ---------- guests (G-03) ---------- */
function pxGuestStats(u){const hs=guestHeaders(u.id);let stays=0,trips=0,spent=0,last="";hs.forEach(h=>{const its=itemsOf(h.ref).filter(b=>b.status!=="Cancelled");stays+=its.filter(b=>b.type==="villa").length;trips+=its.filter(b=>b.type==="boat").length;spent+=folio(h.ref).paid;its.forEach(b=>{const d=itemStart(b);if(d>last)last=d;});});return {hs,stays,trips,spent,last};}
function pxGuestRows(){const s=(ui.pq.gq||"").trim().toLowerCase(),sd=s.replace(/\D/g,"");
  let gs=(DB.users||[]).filter(u=>u.role==="Guest");if(s)gs=gs.filter(u=>u.name.toLowerCase().includes(s)||lc(u.email).includes(s)||(sd.length>=3&&normPhone(u.phone).includes(sd)));
  return gs.map(u=>({u,st:pxGuestStats(u)})).sort((a,b)=>b.st.last.localeCompare(a.st.last)).map(({u,st})=>`<tr class="clickable" data-a="pxModal" data-m="pxGuest" data-id="${u.id}"><td><b>${esc(u.name)}</b><div class="tiny muted">${esc(u.email||"No email")}</div></td><td>${esc(u.phone||"")}</td><td>${esc(u.country)}</td><td>${st.stays}</td><td>${st.trips}</td><td>${fmtUSD(st.spent)}</td><td>${st.last?fd(st.last):""}</td><td>${(u.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join(" ")}${u.status!=="Active"?lb("Rejected").replace(/>[^<]+</,">Suspended<"):""}</td></tr>`).join("")||`<tr><td colspan="8" class="muted" style="text-align:center;padding:24px">No guests match.</td></tr>`;}
function pxDupes(){const gs=(DB.users||[]).filter(u=>u.role==="Guest"),out=[],seen=new Set();
  for(let i=0;i<gs.length;i++)for(let j=i+1;j<gs.length;j++){const a=gs[i],b=gs[j];const sameP=normPhone(a.phone)&&normPhone(a.phone)===normPhone(b.phone),sameN=lc(a.name)===lc(b.name);if((sameP||sameN)&&!seen.has(a.id+b.id)){seen.add(a.id+b.id);out.push({a,b,why:sameP?"same phone":"same name"});}}return out;}
PX.guests=()=>{
  const d=pxDupes();
  const body=`${d.length?`<div class="card" style="margin-bottom:16px;background:var(--gold-soft);border-color:transparent"><h3 style="font-size:1.05rem;margin-bottom:6px">Possible duplicates</h3>${d.map(x=>`<div class="list-row"><span class="small"><b>${esc(x.a.name)}</b> (${esc(x.a.email||x.a.phone)}) and <b>${esc(x.b.name)}</b> (${esc(x.b.email||x.b.phone)}), ${x.why}</span><button class="btn btn-sm" data-a="pxMerge" data-a1="${x.a.id}" data-b1="${x.b.id}">Merge into ${esc(x.a.email||x.a.name)}</button></div>`).join("")}</div>`:""}
  <div class="filters"><label class="field" style="flex:1;min-width:220px"><span class="sr">${tx("Search")}</span><input class="input" type="search" data-in="pxGQ" placeholder="Search name, phone or email" value="${esc(ui.pq.gq||"")}"></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>${tx("Guest")}</th><th>${tx("Phone")}</th><th>${tx("Country")}</th><th>Stays</th><th>Boat trips</th><th>Spent</th><th>Last visit</th><th>Tags</th></tr></thead><tbody id="px-g-body">${pxGuestRows()}</tbody></table></div>`;
  return {title:tx("Guests"),sub:"One profile per guest across rooms and speedboats, matched by phone or email",body};
};

/* ---------- payments and invoices (F-02..F-04) ---------- */
PX.pay=()=>{
  const tab=ui.pq.pay||"pay";const hs=Object.values(DB.pms.headers);
  const pays=hs.flatMap(h=>h.payments.map(p=>({p,h}))).sort((a,b)=>b.p.at.localeCompare(a.p.at));
  const refs=hs.flatMap(h=>h.refunds.map(r=>({r,h}))).sort((a,b)=>b.r.at.localeCompare(a.r.at));
  const set={};pays.forEach(({p})=>{for(const[e,a]of Object.entries(p.split||{}))set[e]=(set[e]||0)+a;});refs.forEach(({r})=>{if(r.status==="Refunded")for(const[e,a]of Object.entries(r.split||{}))set[e]=(set[e]||0)-a;});
  let inner="";
  if(tab==="pay")inner=`<div class="tbl-wrap"><table><thead><tr><th>${tx("Date")}</th><th>${tx("Booking")}</th><th>${tx("Guest")}</th><th>${tx("Method")}</th><th>Split by company</th><th>${tx("Amount")}</th></tr></thead><tbody>${pays.slice(0,150).map(({p,h})=>`<tr class="clickable" data-a="pxOpen" data-ref="${h.ref}"><td style="white-space:nowrap">${wib(Date.parse(p.at))}</td><td><b>${esc(h.ref)}</b></td><td>${esc(h.name)}</td><td>${esc(p.method)}<div class="tiny muted">${esc(p.channel)}</div></td><td class="small">${Object.entries(p.split||{}).map(([e,a])=>esc(ent(e).short)+" "+fmtUSD(a)).join(", ")}</td><td><b>${fmtUSD(p.amount)}</b></td></tr>`).join("")}</tbody></table></div>`;
  if(tab==="ref")inner=`<div class="tbl-wrap"><table><thead><tr><th>${tx("Date")}</th><th>${tx("Booking")}</th><th>Reason</th><th>${tx("Amount")}</th><th>${tx("Status")}</th><th></th></tr></thead><tbody>${refs.map(({r,h})=>`<tr><td>${wib(Date.parse(r.at))}</td><td><button class="link" data-a="pxOpen" data-ref="${h.ref}">${esc(h.ref)}</button><div class="tiny muted">${esc(h.name)}</div></td><td>${esc(r.reason)}<div class="tiny muted">By ${esc(r.by)}</div></td><td>${fmtUSD(r.amount)}</td><td>${lb(r.status)}</td><td>${r.status==="Pending approval"&&isMgr()?`<div class="btn-row"><button class="btn btn-sm" data-a="pxRefundOk" data-ref="${h.ref}" data-id="${r.id}">${tx("Approve")}</button><button class="btn btn-ghost btn-sm" data-a="pxRefundNo" data-ref="${h.ref}" data-id="${r.id}">${tx("Reject")}</button></div>`:""}</td></tr>`).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">No refunds.</td></tr>`}</tbody></table></div><p class="small muted" style="margin-top:10px">Refunds above ${fmtUSD(DB.pms.rules.refundApproval)} need a Property Manager's approval.</p>`;
  if(tab==="inv")inner=`<div class="tbl-wrap"><table><thead><tr><th>Number</th><th>Company</th><th>${tx("Booking")}</th><th>${tx("Date")}</th><th>${tx("Total")}</th><th></th></tr></thead><tbody>${DB.pms.invoices.slice().reverse().map(i=>`<tr><td><b>${esc(i.no)}</b></td><td>${esc(ent(i.ent).name)}</td><td>${esc(i.ref)}</td><td>${fd(i.date)}</td><td>${fmtUSD((folio(i.ref).E[i.ent]||{total:0}).total)}</td><td><button class="btn btn-ghost btn-sm" data-a="invOpen" data-ref="${i.ref}" data-ent="${i.ent}">View</button></td></tr>`).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">No invoices issued yet. Open a booking's folio to issue one.</td></tr>`}</tbody></table></div><p class="small muted" style="margin-top:10px">Numbering is sequential per company. One checkout for a room and a speedboat produces one invoice from each company.</p>`;
  const body=`<div class="kpis" style="grid-template-columns:repeat(2,1fr)">${DB.pms.entities.map(e=>`<div class="kpi"><div class="small muted">Settles to ${esc(e.name)}</div><div class="v">${fmtUSD(set[e.id]||0)}</div><div class="s">Pivot merchant ${esc(e.merchant)}</div></div>`).join("")}</div>
  <div class="tabsx">${[["pay",tx("Payments")],["ref",tx("Refunds")+" ("+refs.filter(x=>x.r.status==="Pending approval").length+" pending)"],["inv",tx("Invoices")]].map(x=>`<button class="${tab===x[0]?"on":""}" data-a="pxPayTab" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>${inner}`;
  return {title:tx("Payments and invoices"),sub:"Pivot (cards, virtual accounts, e-wallets, QRIS) plus cash and bank transfer",actions:`<button class="btn btn-ghost btn-sm" data-a="pxPayCsv">Export CSV</button>`,body};
};

/* ---------- messages (G-04) ---------- */
PX.msgs=()=>{
  const T=DB.pms.templates;
  const body=`<h2 style="font-size:1.2rem;margin-bottom:10px">Templates</h2><div class="cards2" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));margin-bottom:22px">${Object.entries(T).map(([k,t])=>`<div class="card"><b>${esc(t.name)}</b><p class="small" style="margin-top:6px">${esc(t.en)}</p><p class="small muted" style="margin-top:6px">${esc(t.id)}</p></div>`).join("")}</div>
  <h2 style="font-size:1.2rem;margin-bottom:10px">Sent messages</h2><div class="tbl-wrap"><table><thead><tr><th>${tx("Time")}</th><th>Channel</th><th>To</th><th>${tx("Booking")}</th><th>Message</th></tr></thead><tbody>${DB.pms.msgs.slice(0,80).map(m=>`<tr><td style="white-space:nowrap">${wib(Date.parse(m.at))}</td><td>${esc(m.channel)}</td><td class="small">${esc(m.to)}</td><td><button class="link" data-a="pxOpen" data-ref="${esc(m.ref)}">${esc(m.ref)}</button></td><td class="small"><b>${esc(m.name)}</b> (${m.lang.toUpperCase()})<br>${esc(m.text)}</td></tr>`).join("")||`<tr><td colspan="5" class="muted" style="text-align:center;padding:24px">No messages yet.</td></tr>`}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Sent automatically on booking events via WhatsApp (Mobichat) and email, in the guest's language. In this prototype they are logged, not delivered.</p>`;
  return {title:tx("Messages"),sub:"WhatsApp and email templates and delivery log",body};
};

/* ---------- setup (R-01, A-03) ---------- */
function legacyBody(fn){const keep=adminShell;let out={t:"",a:"",b:""};adminShell=(t,a,b)=>{out={t,a,b};return "";};try{fn();}finally{adminShell=keep;}return out;}
PX.setup=()=>{
  const tab=ui.pq.setup||"ent",R=DB.pms.rates,RU=DB.pms.rules;let inner="",act="";
  const num=(k,v,on,extra)=>`<input class="input num-in" type="number" value="${v}" data-on="${on}" data-k="${k}" ${extra||""}>`;
  if(tab==="ent")inner=`<div class="cards2">${DB.pms.entities.map(e=>`<div class="card"><h3 style="font-size:1.1rem;margin-bottom:10px">${esc(e.short)}</h3><div class="stack">${[["name","Legal name"],["npwp","NPWP"],["address","Address"],["prefix","Invoice prefix"],["merchant","Pivot merchant account"]].map(([k,l])=>`<label class="field"><span>${l}</span><input class="input" data-on="pxEnt" data-id="${e.id}" data-k="${k}" value="${esc(e[k])}"></label>`).join("")}
    <div class="grid2"><label class="field"><span>Tax %</span><input class="input" type="number" data-on="pxEnt" data-id="${e.id}" data-k="tax" value="${e.tax}"></label><label class="field"><span>Service charge %</span><input class="input" type="number" data-on="pxEnt" data-id="${e.id}" data-k="svc" value="${e.svc}"></label></div></div></div>`).join("")}</div><p class="small muted" style="margin-top:10px">Every asset belongs to one company. Folio charges, invoices and payment settlement are grouped by that company. Tax rates are placeholders until the client confirms them.</p>`;
  if(tab==="assets")inner=`<h3 style="margin-bottom:10px">Properties</h3><div class="tbl-wrap" style="margin-bottom:20px"><table><thead><tr><th>${tx("Name")}</th><th>Location</th><th>Time zone</th><th>Company</th></tr></thead><tbody>${DB.pms.properties.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.location)}</td><td>${esc(p.tz)}</td><td>${esc(ent(p.entity).name)}</td></tr>`).join("")}</tbody></table></div>
   <h3 style="margin-bottom:10px">Asset types</h3><div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Booking mode</th><th>Unit of sale</th><th>Company</th><th>${tx("Status")}</th></tr></thead><tbody>${DB.pms.types.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.mode)}</td><td class="small">${esc(t.unit)}</td><td class="small">${t.entity?esc(ent(t.entity).short):"To be set"}</td><td>${t.phase===1?lb("Confirmed").replace(/>[^<]+</,">Live<"):`<span class="badge b-plain">Phase 2</span>`}</td></tr>`).join("")}</tbody></table></div>
   <p class="small muted" style="margin-top:10px">Everything is sold as a generic bookable unit with a booking mode. Restaurants and private charters use the same model in phase 2.</p>`;
  if(tab==="rooms"){const L=legacyBody(viewRooms);inner=L.b;act=L.a;}
  if(tab==="boats"){const F=legacyBody(viewFleet),D=legacyBody(viewDeps);inner=`<h3 style="margin-bottom:10px">Boats and routes</h3>${F.b}<h3 style="margin:24px 0 10px">Departure timetable</h3>${D.b}`;act=F.a+D.a;}
  if(tab==="rates"){const rr=roomsList(),tq=ui.pq.tq||{room:rr[0].id,ci:addDays(TODAY,60),co:addDays(TODAY,68),promo:"MENTAWAI10"};ui.pq.tq=tq;const Q=quoteStay(tq.room,tq.ci,tq.co,tq.promo);
    inner=`<div class="cards2"><div class="card"><h3 style="font-size:1.05rem;margin-bottom:10px">Room pricing rules</h3>
     <div class="list-row"><span>Weekend uplift (Friday and Saturday nights), %</span>${num("weekendPct",R.weekendPct,"pxRate")}</div><div class="list-row"><span>Minimum stay, nights</span>${num("minStay",R.minStay,"pxRate")}</div>
     <p class="small" style="margin:12px 0 6px"><b>Seasons</b></p>${R.seasons.map((s,i)=>`<div class="grid3" style="grid-template-columns:1.4fr 1fr 1fr 70px auto;margin-bottom:6px"><input class="input" data-on="pxSeason" data-i="${i}" data-k="name" value="${esc(s.name)}"><input class="input" type="date" data-on="pxSeason" data-i="${i}" data-k="from" value="${s.from}"><input class="input" type="date" data-on="pxSeason" data-i="${i}" data-k="to" value="${s.to}"><input class="input" type="number" data-on="pxSeason" data-i="${i}" data-k="pct" value="${s.pct}" title="% uplift"><button class="btn btn-ghost btn-sm" data-a="pxSeasonDel" data-i="${i}">Remove</button></div>`).join("")}<button class="btn btn-ghost btn-sm" data-a="pxSeasonAdd">Add season</button>
     <p class="small" style="margin:12px 0 6px"><b>Length of stay discounts</b></p>${R.los.map((l,i)=>`<div class="list-row"><span>${l.nights}+ nights</span><span>${num("pct",l.pct,"pxLos",`data-i="${i}"`)} % off</span></div>`).join("")}
     <p class="small" style="margin:12px 0 6px"><b>Promo codes</b></p>${R.promos.map((p,i)=>`<div class="list-row"><span><b>${esc(p.code)}</b>, ${p.pct}% off until ${fd(p.until)}</span><span class="switch"><input type="checkbox" data-on="pxPromo" data-i="${i}" ${p.active?"checked":""} aria-label="${esc(p.code)} active"><span></span></span></div>`).join("")}
     <div style="display:flex;gap:6px;margin-top:8px"><input class="input" id="pr-code" placeholder="CODE"><input class="input num-in" id="pr-pct" type="number" placeholder="%"><button class="btn btn-ghost btn-sm" data-a="pxPromoAdd">Add code</button></div></div>
     <div><div class="card" style="margin-bottom:14px"><h3 style="font-size:1.05rem;margin-bottom:10px">Cancellation policy</h3>
      <div class="list-row"><span>Rooms: free cancellation until, days before check-in</span>${num("roomFreeDays",R.cancel.roomFreeDays,"pxCancelP")}</div><div class="list-row"><span>Rooms: fee after that, % of the stay</span>${num("roomFeePct",R.cancel.roomFeePct,"pxCancelP")}</div>
      <div class="list-row"><span>Speedboat: free until, hours before departure</span>${num("boatFreeHours",R.cancel.boatFreeHours,"pxCancelP")}</div><div class="list-row"><span>Speedboat: fee after that, % of the fare</span>${num("boatFeePct",R.cancel.boatFeePct,"pxCancelP")}</div></div>
      <div class="card"><h3 style="font-size:1.05rem;margin-bottom:10px">Test a quote</h3><div class="grid2"><select class="input" data-on="pxTq" data-k="room">${rr.map(r=>`<option value="${r.id}" ${tq.room===r.id?"selected":""}>${esc(r.villa.name)}, ${esc(r.name)}</option>`).join("")}</select><input class="input" data-on="pxTq" data-k="promo" value="${esc(tq.promo)}" placeholder="Promo code"><input class="input" type="date" data-on="pxTq" data-k="ci" value="${tq.ci}"><input class="input" type="date" data-on="pxTq" data-k="co" value="${tq.co}"></div>
       <div style="margin-top:10px">${Q.lines.map(l=>`<div class="sum-row"><span class="muted">${esc(l.label)}</span><span>${fmtUSD(l.amount)}</span></div>`).join("")}<div class="sum-row"><span class="muted">Tax and service</span><span>${fmtUSD(Q.tax+Q.svc)}</span></div><div class="sum-row sum-total"><span>Quoted price</span><span>${fmtUSD(Q.total)}</span></div></div></div></div></div>
     <p class="small muted" style="margin-top:10px">Base nightly rates are set per room under Rooms. Speedboat fares are set per departure under Speedboats.</p>`;}
  if(tab==="rules")inner=`<div class="cards2"><div class="card"><h3 style="font-size:1.05rem;margin-bottom:10px">Holds and sales</h3>
    <div class="list-row"><span>WhatsApp, phone and agent holds expire after, minutes</span>${num("waHoldMin",RU.waHoldMin,"pxRule")}</div><div class="list-row"><span>App bank transfer and QRIS holds expire after, hours</span>${num("appHoldHours",RU.appHoldHours,"pxRule")}</div>
    <div class="list-row"><span>Speedboat sales close before departure, minutes</span>${num("closeMin",RU.closeMin,"pxRule")}</div><div class="list-row"><span>Deposit for stays, %</span>${num("depositPct",RU.depositPct,"pxRule")}</div><div class="list-row"><span>Refunds above this need manager approval, USD</span>${num("refundApproval",RU.refundApproval,"pxRule")}</div></div>
   <div class="card"><h3 style="font-size:1.05rem;margin-bottom:10px">Currencies</h3><p class="small muted" style="margin-bottom:8px">Prices are stored in USD. Guests can view these currencies; amounts are charged in USD.</p>${Object.entries(RU.fx).map(([c,v])=>`<div class="list-row"><span>1 USD in ${c}</span><input class="input num-in" style="width:120px" type="number" step="any" value="${v}" data-on="pxFx" data-k="${c}"></div>`).join("")}</div></div>`;
  if(tab==="import"){const im=ui.pq.im=ui.pq.im||{kind:"deps",text:"",res:null};
    const sample=im.kind==="deps"?`from,to,date,time,boat,price_usd\nPDG,SIB,${addDays(TODAY,50)},07:00,KM Mitra Satu,65\nPDG,SIP,${addDays(TODAY,50)},08:30,KM Mitra Dua,55\nPDG,XYZ,${addDays(TODAY,51)},07:00,KM Mitra Satu,65\nSIB,PDG,${addDays(TODAY,51)},25:00,KM Mitra Satu,65`:`villa,room,beds,sleeps,price_usd\nSiberut Point Villa,Garden room,Queen bed,2,160\nPagai Ridge Villa,Treehouse,King bed,2,abc`;
    const txt=im.text||sample;
    inner=`<div class="filters"><div class="segbar">${[["deps","Departure timetable"],["rooms","Rooms"]].map(x=>`<button class="${im.kind===x[0]?"on":""}" data-a="pxImKind" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></div>
    <label class="field"><span>Paste CSV (the sample includes rows with errors)</span><textarea class="input" id="im-text" rows="7" style="font-family:monospace;font-size:.85rem">${esc(txt)}</textarea></label>
    <div class="btn-row" style="justify-content:flex-start;margin-top:10px"><button class="btn btn-ghost btn-sm" data-a="pxImCheck">Check rows</button>${im.res&&im.res.some(r=>!r.err)?`<button class="btn btn-sm" data-a="pxImGo">Import ${im.res.filter(r=>!r.err).length} valid rows</button>`:""}</div>
    ${im.res?`<div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>Row</th><th>Data</th><th>Result</th></tr></thead><tbody>${im.res.map(r=>`<tr><td>${r.n}</td><td class="small" style="font-family:monospace">${esc(r.raw)}</td><td>${r.err?`<span class="miss">${esc(r.err)}</span>`:`<span style="color:var(--ok);font-weight:700">Ready</span>`}</td></tr>`).join("")}</tbody></table></div>`:""}
    <p class="small muted" style="margin-top:10px">Nothing is saved until you import. There is no legacy data to migrate; this is for the initial setup.</p>`;}
  const body=`<div class="tabsx">${[["ent","Legal entities"],["assets","Properties and asset types"],["rooms","Rooms"],["boats","Speedboats"],["rates","Rates and policies"],["rules","Booking rules"],["import","Import CSV"]].map(x=>`<button class="${tab===x[0]?"on":""}" data-a="pxSetTab" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>${inner}`;
  return {title:tx("Setup"),sub:"Configure companies, assets, units, rates and rules without code",actions:act,body};
};

/* ---------- users and roles (A-01) ---------- */
PX.users=()=>{
  const st=(DB.users||[]).filter(u=>u.role!=="Guest");
  const mods=PX_NAV.flatMap(([,items])=>items);
  const body=`<div class="tbl-wrap" style="margin-bottom:22px"><table><thead><tr><th>${tx("Name")}</th><th>${tx("Role")}</th><th>Properties</th><th>${tx("Status")}</th><th>Last sign-in</th><th></th></tr></thead><tbody>${st.map(u=>`<tr><td><b>${esc(u.name)}</b><div class="tiny muted">${esc(u.email)}</div></td><td>${esc(tx(u.role))}</td><td class="small">${(u.props||[]).map(p=>esc((DB.pms.properties.find(x=>x.id===p)||{}).name||p)).join(", ")}</td><td>${u.status==="Active"?lb("Confirmed").replace(/>[^<]+</,">Active<"):lb("Rejected").replace(/>[^<]+</,">Suspended<")}</td><td>${u.lastLogin?fd(u.lastLogin):"Never"}</td><td><button class="btn btn-ghost btn-sm" data-a="pxModal" data-m="pxStaff" data-id="${u.id}">Edit</button></td></tr>`).join("")}</tbody></table></div>
  <h2 style="font-size:1.2rem;margin-bottom:10px">What each role can open</h2><div class="tbl-wrap"><table class="mx"><thead><tr><th>Section</th>${PX_ROLES.map(r=>`<th class="small">${esc(tx(r))}</th>`).join("")}</tr></thead><tbody>${mods.map(m=>`<tr><td>${tx(m[1])}</td>${PX_ROLES.map(r=>`<td>${m[3].includes(r)?`<span style="color:var(--ok);font-weight:700">Yes</span>`:`<span class="muted">-</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Access is also scoped per property: a user only sees the properties assigned to them. Use "Demo: view as role" in the sidebar to try each role.</p>`;
  return {title:tx("Users and roles"),sub:"Staff accounts, roles and property access",actions:`<button class="btn btn-sm" data-a="pxModal" data-m="pxStaff">Add staff</button>`,body};
};

/* ---------- audit log (A-02) ---------- */
PX.audit=()=>{
  const q=ui.pq.au=ui.pq.au||{e:"all"};const ents=[...new Set(DB.pms.audit.map(a=>a.entity))];
  const rows=DB.pms.audit.filter(a=>q.e==="all"||a.entity===q.e).slice(0,200);
  const body=`<div class="filters"><select class="input" style="max-width:240px" data-on="pxAuF"><option value="all">All records</option>${ents.map(e=>`<option ${q.e===e?"selected":""}>${esc(e)}</option>`).join("")}</select></div>
  <div class="tbl-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Record</th><th>Action</th><th>Before</th><th>After</th></tr></thead><tbody>${rows.map(a=>`<tr><td style="white-space:nowrap">${wib(Date.parse(a.at))}</td><td class="small">${esc(a.actor)}</td><td class="small">${esc(a.entity)}<div class="tiny muted">${esc(a.id)}</div></td><td class="small">${esc(a.action)}</td><td class="small muted">${esc(a.before)}</td><td class="small">${esc(a.after)}</td></tr>`).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">No changes recorded.</td></tr>`}</tbody></table></div>`;
  return {title:tx("Audit log"),sub:"Every change to bookings, rates, payments and refunds: who, when, before and after",body};
};

/* ================= dialogs ================= */
const PXM={};
const codeItem=c=>DB.bookings.find(b=>b.code===c);
PXM.pxCancel=m=>{const b=codeItem(m.code),fee=cancelFee(b),C=DB.pms.rates.cancel;
  return mod("Cancel "+esc(itemTitle(b)),`<p class="small">${itemWhen(b)}. Policy: ${b.type==="villa"?`free until ${C.roomFreeDays} days before check-in, then ${C.roomFeePct}%`:`free until ${C.boatFreeHours} hours before departure, then ${C.boatFeePct}%`}.</p>
  <div class="grid2" style="margin-top:12px"><label class="field"><span>Cancellation fee (USD)</span><input class="input" type="number" id="cx-fee" value="${fee}" ${isMgr()?"":"readonly"}></label><label class="field"><span>Reason</span><select class="input" id="cx-why">${["Guest request","Change of plans","Duplicate booking","Payment failed","Other"].map(x=>`<option>${x}</option>`).join("")}</select></label></div>
  ${isMgr()?"":`<p class="tiny muted" style="margin-top:6px">Only a manager can waive or change the fee.</p>`}<p class="small" style="margin-top:10px">The rest of the booking stays active. ${b.type==="boat"?"Seats are released to every channel immediately.":"The room goes back on sale immediately."}</p>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn btn-danger" data-a="pxCancelGo" data-code="${b.code}">Cancel this item</button></div>`);};
PXM.pxPay=()=>{const f=folio(ui.pref);return mod(tx("Take payment"),`<div class="grid2"><label class="field"><span>${tx("Amount")} (USD)</span><input class="input" type="number" id="py-amt" value="${Math.max(0,f.balance)}"></label><label class="field"><span>${tx("Method")}</span><select class="input" id="py-m">${DESK_METHODS.map(x=>`<option>${x}</option>`).join("")}</select></label></div>
  <p class="small muted" style="margin-top:8px">Balance ${fmtUSD(f.balance)}. The payment is split between the resort and speedboat companies by what each is owed. "Pivot payment link" sends a link by WhatsApp instead of recording a payment.</p>${errP()}<div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxPayGo">${tx("Take payment")}</button></div>`);};
const OUTLETS=[["Resort restaurant and bar",LE_ROOM,true],["Spa and massage",LE_ROOM,true],["Minibar",LE_ROOM,true],["Laundry",LE_ROOM,true],["Speedboat extras: surfboard bag",LE_BOAT,false],["Speedboat extras: snorkel set hire",LE_BOAT,false],["Speedboat extras: excess luggage",LE_BOAT,false]];
PXM.pxCharge=()=>mod(tx("Post charge"),`<div class="stack"><label class="field"><span>Outlet</span><select class="input" id="ch-o">${OUTLETS.map((o,i)=>`<option value="${i}">${esc(o[0])}</option>`).join("")}</select></label><div class="grid2"><label class="field"><span>Description</span><input class="input" id="ch-d" placeholder="e.g. Dinner for 2"></label><label class="field"><span>${tx("Amount")} before tax (USD)</span><input class="input" type="number" id="ch-a" value="25"></label></div></div>
  <p class="small muted" style="margin-top:8px">Resort outlets can only be charged to the room while the guest is checked in. Speedboat extras go on the speedboat company's invoice.</p>${errP()}<div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxChargeGo">${tx("Post charge")}</button></div>`);
PXM.pxRefund=()=>{const f=folio(ui.pref);const credit=Math.max(0,-f.balance);return mod(tx("Refund"),`<div class="grid2"><label class="field"><span>${tx("Amount")} (USD)</span><input class="input" type="number" id="rf-amt" value="${credit||0}"></label><label class="field"><span>Reason</span><select class="input" id="rf-why">${["Cancellation refund","Overpayment","Service recovery","Weather cancellation","Other"].map(x=>`<option>${x}</option>`).join("")}</select></label></div>
  <p class="small muted" style="margin-top:8px">${credit?`The guest has a credit of ${fmtUSD(credit)}.`:"No credit on this folio."} Paid so far ${fmtUSD(f.paid-f.refunded)}. Refunds above ${fmtUSD(DB.pms.rules.refundApproval)} need a manager's approval.</p>${errP()}<div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxRefundGo">Issue refund</button></div>`);};
PXM.pxMoveStay=m=>{const b=codeItem(m.code),d=m.d||{ci:b.checkIn,co:b.checkOut};const free=d.co>d.ci&&roomFree(b.roomId,d.ci,d.co,b.code);const q=quoteStay(b.roomId,d.ci,d.co,(H(b.ref)||{}).promo);
  return mod("Change dates",`<p class="small">${esc(itemTitle(b))}, now ${itemWhen(b)}</p><div class="grid2" style="margin-top:10px"><label class="field"><span>${tx("Check in")}</span><input class="input" type="date" id="mv-ci" value="${d.ci}" data-a2="mv"></label><label class="field"><span>${tx("Check out")}</span><input class="input" type="date" id="mv-co" value="${d.co}"></label></div>
  <div class="btn-row" style="justify-content:flex-start;margin-top:8px"><button class="btn btn-ghost btn-sm" data-a="pxMoveCheck" data-code="${b.code}">Check availability</button></div>
  <p class="small" style="margin-top:8px">${free?`Free. New price ${fmtUSD(q.total)} (was ${fmtUSD(b.total)}).`:`<span class="miss">The room isn't free for those dates.</span>`}</p>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxMoveStayGo" data-code="${b.code}" ${free?"":"disabled"}>${tx("Save")}</button></div>`);};
PXM.pxMoveBoat=m=>{const b=codeItem(m.code),s0=sch(b.legs[0].sid);const alts=DB.schedules.filter(s=>s.routeId===s0.routeId&&s.id!==s0.id&&s.date>=addDays(s0.date,-3)&&s.date<=addDays(s0.date,7)&&saleOpen(s)&&seatsLeft(s)>=b.pax.length).sort((a,c)=>(a.date+a.time).localeCompare(c.date+c.time));
  return mod("Change departure",`<p class="small">${esc(itemTitle(b))}, now ${fd(s0.date)} ${s0.time}, ${b.pax.length} passengers.</p><label class="field" style="margin-top:10px"><span>New departure (same route)</span><select class="input" id="mb-sid">${alts.map(s=>`<option value="${s.id}">${fd(s.date)} ${s.time}, ${seatsLeft(s)} seats left</option>`).join("")||`<option value="">No other departures with enough seats</option>`}</select></label>
  <p class="small muted" style="margin-top:8px">Seats are moved and new QR tickets are sent to the guest.</p>${errP()}<div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxMoveBoatGo" data-code="${b.code}" ${alts.length?"":"disabled"}>${tx("Save")}</button></div>`);};
PXM.pxCheckin=m=>{const b=codeItem(m.code),cur=roomById(b.roomId);const opts=roomsList().filter(r=>r.cap>=b.guests&&(r.id===b.roomId||roomFree(r.id,b.checkIn,b.checkOut)));const f=folio(b.ref);
  return mod(tx("Check in")+" "+esc(b.contact.name),`<p class="small">${fd(b.checkIn)} to ${fd(b.checkOut)}, ${b.guests} guests. Balance ${fmtUSD(Math.max(0,f.balance))} (can be settled at check-out).</p>
  <label class="field" style="margin-top:12px"><span>Room assignment</span><select class="input" id="ci-room">${opts.map(r=>`<option value="${r.id}" ${r.id===b.roomId?"selected":""}>${esc(r.villa.name)}, ${esc(r.name)}: ${esc(DB.pms.hk[r.id]||"")}${r.id===b.roomId?" (booked)":""}</option>`).join("")}</select></label>
  ${DB.pms.hk[cur.id]!=="inspected"?`<p class="small" style="margin-top:8px;color:var(--warn)">The booked room is ${esc(DB.pms.hk[cur.id])}. Pick an inspected room or ask housekeeping to inspect it first.</p>`:""}${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxCheckinGo" data-code="${b.code}">${tx("Check in")}</button></div>`);};
PXM.pxCheckout=m=>{const b=codeItem(m.code),f=folio(b.ref);
  return mod(tx("Check out")+" "+esc(b.contact.name),`<p>The folio still has a balance of <b class="miss">${fmtUSD(f.balance)}</b>. Settle it before check-out.</p><div class="btn-row" style="justify-content:flex-start;margin-top:14px"><button class="btn" data-a="pxOpenPay" data-ref="${b.ref}">${tx("Take payment")}</button>${isMgr()?`<button class="btn btn-danger" data-a="pxCheckoutGo" data-code="${b.code}" data-ov="1">Manager override: check out anyway</button>`:""}</div>${isMgr()?"":`<p class="tiny muted" style="margin-top:8px">Only a Property Manager or Owner can override.</p>`}`);};
PXM.pxManifest=m=>{const s=sch(m.sid),r=route(s.routeId),b=boat(s.boatId),px=paxOn(s.id),bd=px.filter(x=>DB.pms.boarded[s.id+"|"+x.seat]).length,other=s.taken.length-px.length,closed=DB.pms.closed[s.id];
  return mod(`${tx("Manifest")}: ${esc(portShort(r.from))} to ${esc(portShort(r.to))}, ${fd(s.date)} ${s.time}`,`<div class="filters"><span class="badge b-info">${esc(b.name)}</span><span class="small"><b>${bd}</b> of ${px.length} booked passengers boarded${other>0?`, plus ${other} seats sold by other channels`:""}</span>${s.status==="Cancelled"?lb("Cancelled"):closed?lb("Closed"):""}</div>
  ${s.status==="Scheduled"&&!closed?`<div style="display:flex;gap:8px;margin-bottom:12px"><input class="input" id="px-scan" placeholder="Scan or type ticket code, e.g. ${px[0]?esc(ticketCode(px[0].b,px[0].seat)):"MB-XXXXX-1A"}"><button class="btn btn-sm" data-a="pxScan" data-sid="${s.id}">Board</button></div>`:""}
  <div id="inv-print"><div class="tbl-wrap"><table><thead><tr><th>Seat</th><th>Passenger</th><th>Nationality</th><th>Passport or ID</th><th>${tx("Booking")}</th><th>${tx("Boarded")}</th></tr></thead><tbody>${px.map(x=>{const k=s.id+"|"+x.seat,on=DB.pms.boarded[k];return `<tr><td><b>${x.seat}</b></td><td>${x.p.name?esc(x.p.name):`<span class="miss">Name to follow</span>`}</td><td>${x.p.nat?esc(x.p.nat):`<span class="miss">Missing</span>`}</td><td>${x.p.passport?esc(x.p.passport):`<span class="miss">Missing</span>`}</td><td class="small">${esc(x.b.ref)}<div class="tiny muted">${esc(ticketCode(x.b,x.seat))}</div></td><td><button class="btn btn-sm ${on?"":"btn-ghost"}" data-a="pxBoard" data-k="${k}" ${closed?"disabled":""}>${on?tx("Boarded"):"Not boarded"}</button></td></tr>`;}).join("")||`<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">No online, WhatsApp or counter bookings on this departure.</td></tr>`}</tbody></table></div></div>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-a="pxManCsv" data-sid="${s.id}">Export CSV</button><button class="btn btn-ghost btn-sm" data-a="invPrint">Print for harbour master</button>${s.status==="Scheduled"&&!closed?`<button class="btn btn-sm" data-a="pxManClose" data-sid="${s.id}">Close manifest</button>`:""}</div>`,true);};
PXM.pxWeather=m=>{const s=sch(m.sid),r=route(s.routeId),px=paxOn(s.id),refs=[...new Set(px.map(x=>x.b.ref))];
  const alts=DB.schedules.filter(x=>x.routeId===s.routeId&&x.id!==s.id&&x.date>=s.date&&x.date<=addDays(s.date,4)&&saleOpen(x)&&seatsLeft(x)>=px.length).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  return mod(`${tx("Weather cancel")}: ${esc(portShort(r.from))} to ${esc(portShort(r.to))}, ${fd(s.date)} ${s.time}`,`<p class="small">${px.length} passengers on ${refs.length} bookings will be notified by WhatsApp and email in their language.</p>
  <div class="stack" style="margin-top:12px"><label class="field"><span>Reason</span><select class="input" id="wx-why">${["High waves","Storm warning","Harbour master closure","Engine fault"].map(x=>`<option>${x}</option>`).join("")}</select></label>
  <label class="dep-opt"><input type="radio" name="wx" value="move" checked id="wx-move"><span><b>Move everyone to another departure</b><select class="input" id="wx-sid" style="margin-top:6px">${alts.map(x=>`<option value="${x.id}">${fd(x.date)} ${x.time}, ${seatsLeft(x)} seats free</option>`).join("")||`<option value="">No departure has enough seats</option>`}</select></span></label>
  <label class="dep-opt"><input type="radio" name="wx" value="refund"><span><b>Cancel and refund everyone in full</b></span></label></div>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn btn-danger" data-a="pxWeatherGo" data-sid="${s.id}">Cancel departure and notify guests</button></div>`);};
PXM.pxGuest=m=>{const u=userById(m.id);if(!u)return "";const st=pxGuestStats(u);const tags=["VIP","Returning","Surfer","Family","Diver","Honeymoon"];
  const ids=DB.bookings.filter(b=>b.type==="boat"&&b.contact&&(b.contact.guestId===u.id||lc(b.contact.email)===lc(u.email))).flatMap(b=>b.pax).filter(p=>p.passport&&lc(p.name)===lc(u.name));
  return mod(esc(u.name),`<div class="grid2"><label class="field"><span>${tx("Name")}</span><input class="input" id="gu-name" value="${esc(u.name)}"></label><label class="field"><span>${tx("Phone")}</span><input class="input" id="gu-phone" value="${esc(u.phone||"")}"></label><label class="field"><span>Email</span><input class="input" id="gu-email" value="${esc(u.email||"")}"></label><label class="field"><span>Nationality</span><select class="input" id="gu-country">${COUNTRIES.map(c=>`<option ${u.country===c?"selected":""}>${c}</option>`).join("")}</select></label></div>
  <p class="small" style="margin:12px 0 6px"><b>Tags</b></p><div class="chips">${tags.map(t=>`<label class="chip" style="cursor:pointer"><input type="checkbox" class="gu-tag" value="${t}" ${(u.tags||[]).includes(t)?"checked":""} style="accent-color:var(--lagoon)"> ${t}</label>`).join("")}</div>
  <label class="field" style="margin-top:12px"><span>Preferences and notes</span><textarea class="input" id="gu-notes" rows="2">${esc(u.notes||"")}</textarea></label>
  <label class="small" style="display:flex;gap:8px;margin-top:10px"><input type="checkbox" id="gu-consent" ${u.consent?"checked":""} style="accent-color:var(--lagoon)">Agreed to receive marketing messages (UU PDP consent)</label>
  <p class="small muted" style="margin-top:8px">ID document: ${ids.length?"passport ending "+esc(ids[0].passport.slice(-4))+", stored encrypted":"none on file"}.</p>
  <div class="kpis" style="margin-top:12px"><div class="kpi"><div class="small muted">Stays</div><div class="v">${st.stays}</div></div><div class="kpi"><div class="small muted">Boat trips</div><div class="v">${st.trips}</div></div><div class="kpi"><div class="small muted">Paid</div><div class="v">${fmtUSD(st.spent)}</div></div><div class="kpi"><div class="small muted">Last visit</div><div class="v" style="font-size:1.1rem">${st.last?fd(st.last):"None"}</div></div></div>
  <h3 style="font-size:1.05rem;margin:6px 0 8px">History</h3>${st.hs.sort((a,b)=>(b.createdAt||b.created).localeCompare(a.createdAt||a.created)).map(h=>`<div class="list-row"><span class="small"><button class="link" data-a="pxOpen" data-ref="${h.ref}">${esc(h.ref)}</button> ${itemsOf(h.ref).map(b=>esc(itemTitle(b))).join(" + ")}</span><span>${lb(headerStatus(h.ref))}</span></div>`).join("")||`<p class="muted small">No bookings yet.</p>`}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxGuestSave" data-id="${u.id}">${tx("Save")}</button></div>`,true);};
PXM.pxWO=()=>mod(tx("New work order"),`<div class="stack"><label class="field"><span>${tx("Room")}</span><select class="input" id="wo-room">${roomsList().map(r=>`<option value="${r.id}">${esc(r.villa.name)}, ${esc(r.name)}</option>`).join("")}</select></label><label class="field"><span>Issue</span><input class="input" id="wo-title" placeholder="e.g. Leaking shower"></label>
  <label class="field"><span>Priority</span><select class="input" id="wo-pr"><option>Low</option><option selected>Medium</option><option>High</option></select></label>
  <label class="small" style="display:flex;gap:8px"><input type="checkbox" id="wo-block">Take the room out of service</label><div class="grid2"><label class="field"><span>From</span><input class="input" type="date" id="wo-from" value="${TODAY}"></label><label class="field"><span>To (inclusive)</span><input class="input" type="date" id="wo-to" value="${addDays(TODAY,2)}"></label></div></div>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxWoGo">${tx("Save")}</button></div>`);
PXM.pxStaff=m=>{const u=m.id?userById(m.id):{name:"",email:"",phone:"",role:"Front Desk",props:["p1"],status:"Active"};
  return mod(m.id?"Edit "+esc(u.name):"Add staff",`<div class="grid2"><label class="field"><span>${tx("Name")}</span><input class="input" id="st-name" value="${esc(u.name)}"></label><label class="field"><span>Email</span><input class="input" id="st-email" value="${esc(u.email)}"></label><label class="field"><span>${tx("Phone")}</span><input class="input" id="st-phone" value="${esc(u.phone||"")}"></label><label class="field"><span>${tx("Role")}</span><select class="input" id="st-role">${PX_ROLES.map(r=>`<option value="${r}" ${u.role===r?"selected":""}>${tx(r)}</option>`).join("")}</select></label></div>
  <p class="small" style="margin:12px 0 6px"><b>Properties</b></p>${DB.pms.properties.map(p=>`<label class="small" style="display:flex;gap:8px;margin-bottom:4px"><input type="checkbox" class="st-prop" value="${p.id}" ${(u.props||[]).includes(p.id)?"checked":""}>${esc(p.name)}</label>`).join("")}
  <label class="field" style="margin-top:10px;max-width:200px"><span>${tx("Status")}</span><select class="input" id="st-status"><option ${u.status==="Active"?"selected":""}>Active</option><option ${u.status!=="Active"?"selected":""}>Suspended</option></select></label>${errP()}
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-ghost" data-a="close">${tx("Close")}</button><button class="btn" data-a="pxStaffGo" data-id="${m.id||""}">${tx("Save")}</button></div>`);};
PXM.pxWa=m=>{const h=H(m.ref),f=folio(m.ref),msg=DB.pms.msgs.find(x=>x.ref===m.ref);return mod("Sent in WhatsApp",`<p class="small muted">Mobichat conversation ${esc(h.convo||"")} with ${esc(h.name)}, ${esc(h.phone)}</p><div class="wa" style="margin-top:12px"><p>${esc(msg?msg.text:"")}</p></div><p class="small" style="margin-top:10px">Quote ${fmtUSD(f.total)}. The booking is linked to the conversation and the payment link expires with the hold.</p><div class="btn-row" style="margin-top:14px"><button class="btn" data-a="close">${tx("Close")}</button></div>`);};
function pxLayer(){const m=ui.modal;let h="";if(m)h=PXM[m.kind]?PXM[m.kind](m):modalHTML();return h+(ui.toast?`<div class="toast" role="status">${esc(ui.toast)}</div>`:"");}

/* ================= actions ================= */
function pxErr(t){ui.modal.err=t;render(true);}
function pxCheckinDo(b,roomId){const before=b.roomId;if(roomId&&roomId!==b.roomId){const r=roomById(roomId);b.roomId=roomId;b.villaId=r.villa.id;b.log.push([TODAY,"Room changed at check-in"]);}
  b.status="Checked in";b.log.push([TODAY,"Checked in"]);audit("Booking item",b.code,"Checked in"+(before!==b.roomId?", room changed":""),before,b.roomId);save();}
Object.assign(A,{
  pv:el=>{ui.pv=el.dataset.v;ui.modal=null;if(el.dataset.v==="newbk"&&!ui.nb)ui.nb=nbFresh();render();},
  pxLang:el=>{ui.lang=el.dataset.v;try{localStorage.setItem("mi-lang",ui.lang);}catch(e){}render(true);},
  pxOpen:el=>{ui.pref=el.dataset.ref;ui.pv="booking";ui.modal=null;render();},
  pxModal:el=>{ui.modal={kind:el.dataset.m,code:el.dataset.code,sid:el.dataset.sid,id:el.dataset.id};render(true);},
  pxManifest:el=>{ui.modal={kind:"pxManifest",sid:el.dataset.sid};render(true);},
  pxDash:el=>{ui.pq.dash.range=el.dataset.v;render(true);},
  pxCalType:el=>{ui.pq.cal.type=el.dataset.v;render(true);},
  pxCalMove:el=>{const n=+el.dataset.n;ui.pq.cal.start=n?addDays(ui.pq.cal.start,n):TODAY;render(true);},
  pxNewFrom:el=>{ui.nb=nbFresh({source:"Phone"});ui.nb.f.room=el.dataset.room;ui.nb.f.ci=el.dataset.d;ui.nb.f.co=addDays(el.dataset.d,DB.pms.rates.minStay);ui.pv="newbk";render();},
  pxFront:el=>{ui.pq.front=el.dataset.v;render(true);},
  pxWalkin:()=>{ui.nb=nbFresh({source:"Walk-in",mode:"confirm",amt:"full"});ui.nb.f.ci=TODAY;ui.nb.f.co=addDays(TODAY,DB.pms.rates.minStay);ui.pv="newbk";render();},
  pxAddItem:el=>{const h=H(ui.pref);ui.nb=nbFresh({source:h.source==="Consumer app"?"Phone":h.source,addTo:h.ref,gid:h.guestId,mode:"confirm"});ui.pv="newbk";render();},
  nbSrc:el=>{const nb=ui.nb;nb.source=el.dataset.v;nb.mode=el.dataset.v==="Walk-in"?"confirm":"hold";render(true);},
  nbPick:el=>{ui.nb.gid=el.dataset.id;render(true);},
  nbClearGuest:()=>{ui.nb.gid=null;render(true);},
  nbReset:()=>{ui.nb=nbFresh();ui.nbErr=null;render();},
  nbRemove:el=>{ui.nb.items.splice(+el.dataset.i,1);render(true);},
  nbAddRoom:()=>{const F=ui.nb.f,r=roomById(F.room);ui.nbErr=null;
    if(F.co<=F.ci){ui.nbErr="Check-out must be after check-in.";return render(true);}
    if(!roomFree(F.room,F.ci,F.co)||ui.nb.items.some(x=>x.kind==="stay"&&x.roomId===F.room&&x.ci<F.co&&F.ci<x.co)){ui.nbErr=r.name+" isn't free for those dates.";return render(true);}
    if(+F.guests>r.cap){ui.nbErr=r.name+" sleeps "+r.cap+".";return render(true);}
    ui.nb.items.push({kind:"stay",roomId:F.room,ci:F.ci,co:F.co,guests:+F.guests});render(true);},
  nbAddBoat:()=>{const F=ui.nb.f,nb=ui.nb;ui.nbErr=null;const legs=[F.dep];if(F.ret)legs.push(F.rdep);
    if(legs.some(x=>!x)){ui.nbErr="Pick a departure"+(F.ret?" and a return departure":"")+".";return render(true);}
    for(const sid of legs){const s=sch(sid);if(!saleOpen(s)){ui.nbErr="Sales for the "+s.time+" departure have closed.";return render(true);}if(seatsLeft(s)<+F.pax){ui.nbErr="Only "+seatsLeft(s)+" seats left on the "+s.time+" departure.";return render(true);}}
    const g=nb.gid&&userById(nb.gid);const lead=g?g.name:nb.g.name;const nat=g?g.country:nb.g.country;
    nb.items.push({kind:"boat",legs:legs.map(sid=>({sid})),pax:Array.from({length:+F.pax},(_,i)=>({name:i===0?lead:"",nat,passport:""}))});render(true);},
  nbAddTransfer:el=>{const nb=ui.nb,it=nb.items[+el.dataset.i];const x=nbSugg(nb).find(y=>y.it===it);if(!x)return;const g=nb.gid&&userById(nb.gid);
    nb.items.push({kind:"boat",legs:[x.o,x.bk].filter(Boolean).map(s=>({sid:s.id})),pax:Array.from({length:it.guests},(_,i)=>({name:i===0?(g?g.name:nb.g.name):"",nat:g?g.country:nb.g.country,passport:""}))});render(true);},
  nbCreate:()=>{
    const nb=ui.nb,fail=t=>{ui.nbErr=t;render(true);};ui.nbErr=null;
    let guest;const g=nb.gid&&userById(nb.gid);
    if(g)guest={name:g.name,email:g.email,phone:g.phone,country:g.country};
    else{if(!nb.g.name)return fail("Enter the guest's name.");if(normPhone(nb.g.phone).length<8)return fail("Enter the guest's WhatsApp or phone number.");guest={name:nb.g.name,email:nb.g.email,phone:nb.g.phone,country:nb.g.country};}
    if(!nb.items.length)return fail("Add at least one room or speedboat trip.");
    const bad=nb.items.find(it=>!nbQuote(it,nb.promo).ok);if(bad)return fail("One of the items is no longer available. Remove it and choose again.");
    for(const it of nb.items.filter(x=>x.kind==="boat"))if(!it.pax[0].name)return fail("Enter the lead speedboat passenger's name. Other names and passport numbers can follow before departure.");
    const total=nb.items.reduce((a,it)=>a+nbQuote(it,nb.promo).q.total,0),hasStay=nb.items.some(x=>x.kind==="stay");
    const amt=nb.amt==="full"||!hasStay?total:Math.round(total*DB.pms.rules.depositPct/100);
    if(nb.checkin&&nb.mode==="confirm")for(const it of nb.items.filter(x=>x.kind==="stay"&&x.ci===TODAY))if(DB.pms.hk[it.roomId]!=="inspected")return fail(roomById(it.roomId).name+" isn't inspected yet, so it can't be checked into today. Pick another room or ask housekeeping.");
    const convo=nb.source==="WhatsApp"?(nb.convo||"MC-"+(10000+Math.floor(Math.random()*89999))):null;
    const res=pmsCreateBooking({guest,items:nb.items.map(it=>it.kind==="stay"?Object.assign({},it):{kind:"boat",legs:it.legs.map(l=>({sid:l.sid})),pax:it.pax}),source:nb.source,mode:nb.mode,payment:nb.mode==="confirm"?{method:nb.method,channel:"Desk",amount:amt}:null,promo:nb.promo,convo,by:actorName(),ref:nb.addTo});
    if(res.err)return fail(res.err);
    if(nb.checkin&&nb.mode==="confirm")res.items.filter(b=>b.type==="villa"&&b.checkIn===TODAY).forEach(b=>pxCheckinDo(b,b.roomId));
    const secs=Math.round((Date.now()-nb.start)/1000);audit("Booking",res.ref,"Staff booking time",null,Math.floor(secs/60)+"m "+(secs%60)+"s");save();
    ui.nb=null;ui.pref=res.ref;ui.pv="booking";ui.modal=nb.source==="WhatsApp"&&nb.mode==="hold"?{kind:"pxWa",ref:res.ref}:null;
    toast(`Booking ${res.ref} ${nb.addTo?"updated":"created"} in ${Math.floor(secs/60)}m ${secs%60}s`);},
  pxCheckin:el=>{ui.modal={kind:"pxCheckin",code:el.dataset.code};render(true);},
  pxCheckinGo:el=>{const b=codeItem(el.dataset.code),rid=val("ci-room");if(b.checkIn===TODAY&&DB.pms.hk[rid]!=="inspected")return pxErr("This room isn't inspected yet. Same-day arrivals need an inspected room.");
    if(rid!==b.roomId&&!roomFree(rid,b.checkIn,b.checkOut))return pxErr("That room was just taken.");pxCheckinDo(b,rid);ui.modal=null;toast(b.contact.name+" checked in to "+roomById(rid).name);},
  pxCheckout:el=>{const b=codeItem(el.dataset.code),f=folio(b.ref);if(f.balance>0){ui.modal={kind:"pxCheckout",code:b.code};return render(true);}A.pxCheckoutGo(el);},
  pxCheckoutGo:el=>{const b=codeItem(el.dataset.code),ov=el.dataset.ov==="1";b.status="Completed";b.log.push([TODAY,"Checked out"]);DB.pms.hk[b.roomId]="dirty";
    DB.pms.tasks.push({id:"t"+Date.now().toString(36),roomId:b.roomId,type:"Cleaning",status:"Open",due:TODAY,created:TODAY,note:"After check-out of "+b.contact.name,assignee:"Wayan Sudira"});
    audit("Booking item",b.code,"Checked out"+(ov?" with manager override, balance "+fmtUSD(folio(b.ref).balance):""),"In use","Completed");save();ui.modal=null;toast(b.contact.name+" checked out. "+roomById(b.roomId).name+" is now dirty and a cleaning task was created.");},
  pxNoShow:el=>{const b=codeItem(el.dataset.code);if(!confirm("Mark "+b.contact.name+" as a no-show? The room is released and the policy fee applies."))return;const fee=cancelFee(b);b.status="No-show";b.cancelFee=fee;b.log.push([TODAY,"No-show"]);audit("Booking item",b.code,"Marked no-show, fee "+fmtUSD(fee),"Confirmed","No-show");save();toast("Marked as no-show");},
  pxOpenCharge:el=>{ui.pref=el.dataset.ref;ui.modal={kind:"pxCharge"};render(true);},
  pxOpenPay:el=>{ui.pref=el.dataset.ref;ui.modal={kind:"pxPay"};render(true);},
  pxCancelGo:el=>{const fee=Math.max(0,+val("cx-fee")||0);pmsCancelItem(el.dataset.code,fee,val("cx-why"));ui.modal=null;toast("Item cancelled"+(fee?" with a "+fmtUSD(fee)+" fee":""));},
  pxPayGo:()=>{const a=+val("py-amt"),m=val("py-m");if(m==="Pivot payment link"){notify(ui.pref,"link",{});save();ui.modal=null;return toast("Pivot payment link sent by WhatsApp");}
    if(!(a>0))return pxErr("Enter an amount.");pmsPay(ui.pref,a,m,"Desk");ui.modal=null;toast(fmtUSD(a)+" received by "+m);},
  pxChargeGo:()=>{const o=OUTLETS[+val("ch-o")],d=val("ch-d")||o[0],a=+val("ch-a");if(!(a>0))return pxErr("Enter an amount.");
    if(o[2]&&!itemsOf(ui.pref).some(b=>b.type==="villa"&&b.status==="Checked in"))return pxErr("Charge to room is only allowed while the guest is checked in.");
    const E=ent(o[1]),tax=Math.round(a*(E.tax+E.svc)/100);H(ui.pref).charges.push({id:"c"+Date.now().toString(36),at:nowIso(),ent:o[1],label:o[0].replace(/^Speedboat extras: /,"Speedboat ")+": "+d,net:a,tax,total:a+tax,by:actorName()});
    audit("Folio",ui.pref,"Charge posted",null,o[0]+" "+fmtUSD(a+tax));save();ui.modal=null;toast("Charge posted to "+E.short+" folio");},
  pxRefundGo:()=>{const a=+val("rf-amt"),f=folio(ui.pref);if(!(a>0))return pxErr("Enter an amount.");if(a>f.paid-f.refunded)return pxErr("You can't refund more than was paid ("+fmtUSD(f.paid-f.refunded)+").");
    const r=pmsRefund(ui.pref,a,val("rf-why"),pxRole());ui.modal=null;toast(r.status==="Refunded"?"Refund of "+fmtUSD(a)+" issued":"Refund sent for manager approval");},
  pxRefundOk:el=>{const h=H(el.dataset.ref),r=h.refunds.find(x=>x.id===el.dataset.id);r.status="Refunded";r.approvedBy=actorName();audit("Refund",h.ref,"Refund approved","Pending approval",fmtUSD(r.amount));save();toast("Refund approved and sent");},
  pxRefundNo:el=>{const h=H(el.dataset.ref),r=h.refunds.find(x=>x.id===el.dataset.id);r.status="Rejected";audit("Refund",h.ref,"Refund rejected","Pending approval","Rejected");save();toast("Refund rejected");},
  pxResendLink:()=>{notify(ui.pref,"link",{});save();toast("Payment link sent again");},
  pxRelease:()=>{const h=H(ui.pref);if(!confirm("Release this hold now? Rooms and seats go back on sale."))return;h.holdUntil=Date.now()-1000;sweepHolds();render(true);toast("Hold released");},
  pxMoveCheck:el=>{ui.modal.d={ci:val("mv-ci"),co:val("mv-co")};render(true);},
  pxMoveStayGo:el=>{const b=codeItem(el.dataset.code),d=ui.modal.d||{ci:val("mv-ci"),co:val("mv-co")};if(!roomFree(b.roomId,d.ci,d.co,b.code))return pxErr("The room isn't free for those dates.");
    const q=quoteStay(b.roomId,d.ci,d.co,(H(b.ref)||{}).promo),before=itemWhen(b);Object.assign(b,{checkIn:d.ci,checkOut:d.co,nights:q.nights,subtotal:q.net,tax:q.tax+q.svc,total:q.total});b.log.push([TODAY,"Dates changed"]);
    audit("Booking item",b.code,"Dates changed",before,itemWhen(b));save();ui.modal=null;toast("Dates changed. New price "+fmtUSD(q.total));},
  pxMoveBoatGo:el=>{const b=codeItem(el.dataset.code),sid=val("mb-sid"),ns=sch(sid);if(!ns)return pxErr("Pick a departure.");const old=b.legs[0],os=sch(old.sid),before=itemWhen(b);
    os.taken=os.taken.filter(x=>!old.seats.includes(x));const seats=seatLabels(boat(ns.boatId).cap).filter(x=>!ns.taken.includes(x)).slice(0,old.seats.length);ns.taken.push(...seats);b.legs[0]={sid,seats};
    const q=quoteBoat(b.legs.map(l=>l.sid),b.pax.length);Object.assign(b,{net:q.net,tax:q.tax+q.svc,total:q.total});b.log.push([TODAY,"Departure changed"]);
    audit("Booking item",b.code,"Departure changed",before,itemWhen(b));notify(b.ref,"tickets",{});save();ui.modal=null;toast("Moved to "+fd(ns.date)+" "+ns.time+". New tickets sent.");},
  pxHk:el=>{const before=DB.pms.hk[el.dataset.id];DB.pms.hk[el.dataset.id]=el.dataset.v;if(el.dataset.v!=="dirty")DB.pms.tasks.filter(t=>t.roomId===el.dataset.id&&t.status!=="Done").forEach(t=>{t.status="Done";t.done=TODAY;});
    audit("Room",el.dataset.id,"Housekeeping status",before,el.dataset.v);save();toast(roomById(el.dataset.id).name+" marked "+el.dataset.v);},
  pxTaskDone:el=>{const t=DB.pms.tasks.find(x=>x.id===el.dataset.id);t.status="Done";t.done=TODAY;if(t.type==="Cleaning"&&DB.pms.hk[t.roomId]==="dirty")DB.pms.hk[t.roomId]="clean";audit("Task",t.id,"Completed",null,t.type);save();toast("Task done. Room is clean and waiting for inspection.");},
  pxWo:el=>{const w=DB.pms.orders.find(x=>x.id===el.dataset.id),before=w.status;w.status=el.dataset.v;
    if(w.status==="Done"){DB.blocks=DB.blocks.filter(k=>k.reason!==w.id);w.done=TODAY;}audit("Work order",w.id,"Status changed",before,w.status);save();toast(w.id+" "+w.status.toLowerCase()+(w.status==="Done"&&w.from?". The room is back on sale.":""));},
  pxWoGo:()=>{const rid=val("wo-room"),title=val("wo-title"),pr=val("wo-pr"),block=document.getElementById("wo-block").checked,from=val("wo-from"),to=val("wo-to");
    if(!title)return pxErr("Describe the issue.");
    if(block){if(to<from)return pxErr("The end date must be on or after the start date.");const clash=DB.bookings.filter(b=>b.type==="villa"&&b.roomId===rid&&!["Cancelled","No-show","Completed"].includes(b.status)&&b.checkIn<=to&&from<b.checkOut);
      if(clash.length)return pxErr("Booked in that period ("+clash.map(b=>b.ref).join(", ")+"). Move those bookings first.");}
    const id="WO-"+(1000+DB.pms.orders.length+1);DB.pms.orders.push({id,roomId:rid,title,priority:pr,status:"Open",from:block?from:null,to:block?to:null,created:TODAY,by:ui.user.name});
    if(block)for(let d=from;d<=to;d=addDays(d,1))if(!oosOn(rid,d))DB.blocks.push({roomId:rid,date:d,reason:id});
    audit("Work order",id,"Created"+(block?", room out of service "+fd(from)+" to "+fd(to):""),null,title);save();ui.modal=null;toast(id+" created"+(block?". The room is off sale for that period.":""));},
  pxBoatDay:el=>{const n=+el.dataset.n;ui.pq.boats.date=n?addDays(ui.pq.boats.date,n):TODAY;render(true);},
  pxBoard:el=>{const k=el.dataset.k;DB.pms.boarded[k]=!DB.pms.boarded[k];const[sid,seat]=k.split("|");pxSyncBoarded(sid);save();render(true);},
  pxScan:el=>{const sid=el.dataset.sid,c=val("px-scan").toUpperCase();const x=paxOn(sid).find(p=>ticketCode(p.b,p.seat)===c);
    if(!x)return pxErr("Ticket "+c+" isn't on this departure.");DB.pms.boarded[sid+"|"+x.seat]=true;pxSyncBoarded(sid);ui.modal.err=null;save();toast((x.p.name||"Passenger")+" boarded, seat "+x.seat);},
  pxManClose:el=>{const sid=el.dataset.sid,miss=paxOn(sid).filter(x=>!x.p.passport||!x.p.nat||!x.p.name);if(miss.length)return pxErr("Can't close: name, ID or nationality missing for seat"+(miss.length>1?"s ":" ")+miss.map(x=>x.seat).join(", ")+".");
    DB.pms.closed[sid]=true;audit("Departure",sid,"Manifest closed",null,paxOn(sid).length+" passengers");save();toast("Manifest closed");},
  pxManCsv:el=>{const s=sch(el.dataset.sid),r=route(s.routeId);dl(`manifest-${portShort(r.from)}-${portShort(r.to)}-${s.date}-${s.time.replace(":","")}.csv`,[["Seat","Name","Nationality","Passport or ID","Booking","Ticket","Boarded"]].concat(paxOn(s.id).map(x=>[x.seat,x.p.name,x.p.nat,x.p.passport,x.b.ref,ticketCode(x.b,x.seat),DB.pms.boarded[s.id+"|"+x.seat]?"Yes":"No"])));},
  pxWeatherGo:el=>{
    const s=sch(el.dataset.sid),r=route(s.routeId),why=val("wx-why"),move=document.getElementById("wx-move").checked,alt=sch(val("wx-sid"));
    if(move&&!alt)return pxErr("No departure has enough seats. Choose refund instead.");
    const items=DB.bookings.filter(b=>b.type==="boat"&&b.status!=="Cancelled"&&b.legs.some(l=>l.sid===s.id));let n=0;
    s.status="Cancelled";
    for(const b of items){const li=b.legs.findIndex(l=>l.sid===s.id),leg=b.legs[li];n+=leg.seats.length;s.taken=s.taken.filter(x=>!leg.seats.includes(x));
      const vars={route:portShort(r.from)+" to "+portShort(r.to),date:fd(s.date),time:s.time};
      if(move){const seats=seatLabels(boat(alt.boatId).cap).filter(x=>!alt.taken.includes(x)).slice(0,leg.seats.length);alt.taken.push(...seats);b.legs[li]={sid:alt.id,seats};b.log.push([TODAY,"Moved for weather"]);
        notify(b.ref,"weather",Object.assign(vars,{action:`We've moved you to ${fd(alt.date)} at ${alt.time}. New QR tickets follow in this chat.`}));notify(b.ref,"tickets",{});}
      else{const val_=itemMoney(b).total;releaseItem(b,"Cancelled for weather");b.cancelFee=0;const f=folio(b.ref),amt=Math.min(val_,Math.max(0,-f.balance));
        if(amt>0)pmsRefund(b.ref,amt,"Weather cancellation","Property Manager");notify(b.ref,"weather",Object.assign(vars,{action:amt?`A full refund of ${fmtUSD(amt)} is on its way.`:"Nothing was charged for this trip."}));}}
    audit("Departure",s.id,"Weather cancellation ("+why+")","Scheduled",move?"Moved to "+fd(alt.date)+" "+alt.time:"Refunded");save();ui.modal=null;
    toast(`Departure cancelled. ${n} passengers on ${new Set(items.map(b=>b.ref)).size} bookings notified${move?" and moved":" and refunded"}.`);},
  pxPierPick:el=>{const q=ui.pq.pier;q.sid=el.dataset.sid;q.start=Date.now();ui.nbErr=null;render(true);},
  pxPierPay:el=>{ui.pq.pier.pay=el.dataset.v;render(true);},
  pxPierNew:()=>{ui.pq.pier={sid:null,n:1,pay:"Cash",pax:[],phone:"",done:null,start:Date.now()};render();},
  pxSell:()=>{const q=ui.pq.pier,fail=t=>{ui.nbErr=t;render(true);};ui.nbErr=null;const pax=q.pax.slice(0,q.n);
    if(normPhone(q.phone).length<8)return fail("Enter the lead passenger's phone number.");
    for(let i=0;i<pax.length;i++){if(!pax[i].name)return fail("Enter passenger "+(i+1)+"'s name.");if(!pax[i].passport)return fail("Enter passenger "+(i+1)+"'s KTP or passport number. It's required for the manifest.");}
    const qt=quoteBoat([q.sid],q.n);
    const res=pmsCreateBooking({guest:{name:pax[0].name,phone:q.phone,email:"",country:pax[0].nat},items:[{kind:"boat",legs:[{sid:q.sid}],pax}],source:"Walk-in",mode:"confirm",payment:{method:q.pay,channel:"Desk",amount:qt.total},by:actorName()});
    if(res.err)return fail(res.err);const secs=Math.round((Date.now()-q.start)/1000);audit("Booking",res.ref,"Pier counter sale time",null,secs+" seconds");save();q.done=res.ref;q.sid=null;q.pax=[];q.phone="";
    toast("Sold "+pax.length+" seat"+(pax.length>1?"s":"")+" in "+secs+" seconds");},
  pxMerge:el=>{const a=userById(el.dataset.a1),b=userById(el.dataset.b1);if(!confirm("Merge "+b.name+" ("+(b.email||b.phone)+") into "+a.name+" ("+(a.email||a.phone)+")?"))return;
    Object.values(DB.pms.headers).forEach(h=>{if(h.guestId===b.id||(b.email&&lc(h.email)===lc(b.email))){h.guestId=a.id;h.email=a.email;}});
    DB.bookings.forEach(x=>{if(x.contact&&(x.contact.guestId===b.id||(b.email&&lc(x.contact.email)===lc(b.email))))x.contact=Object.assign({},x.contact,{guestId:a.id,email:a.email});});
    a.tags=[...new Set([...(a.tags||[]),...(b.tags||[])])];if(!a.phone)a.phone=b.phone;DB.users=DB.users.filter(u=>u.id!==b.id);audit("Guest",a.id,"Profiles merged",b.email||b.phone,a.email||a.phone);save();toast("Profiles merged");},
  pxGuestSave:el=>{const u=userById(el.dataset.id),before=JSON.stringify({n:u.name,p:u.phone,e:u.email});
    Object.assign(u,{name:val("gu-name"),phone:val("gu-phone"),email:val("gu-email"),country:val("gu-country"),notes:val("gu-notes"),consent:document.getElementById("gu-consent").checked,tags:[...document.querySelectorAll(".gu-tag:checked")].map(x=>x.value)});
    audit("Guest",u.id,"Profile updated",before,JSON.stringify({n:u.name,p:u.phone,e:u.email}));save();ui.modal=null;toast("Guest profile saved");},
  pxStaffGo:el=>{const id=el.dataset.id,d={name:val("st-name"),email:val("st-email"),phone:val("st-phone"),role:val("st-role"),status:val("st-status"),props:[...document.querySelectorAll(".st-prop:checked")].map(x=>x.value)};
    if(!d.name)return pxErr("Enter a name.");if(!/^\S+@\S+\.\S+$/.test(d.email))return pxErr("Enter a valid email.");const clash=findUser(d.email);if(clash&&clash.id!==id)return pxErr("Another account uses that email.");if(!d.props.length)return pxErr("Give access to at least one property.");
    if(id){const u=userById(id),before=u.role;Object.assign(u,d);audit("User",u.email,"Staff account updated",before,d.role);}else{DB.users.push(Object.assign({id:"s"+Date.now().toString(36),country:"Indonesia",created:TODAY,lastLogin:null,notes:""},d));audit("User",d.email,"Staff account created",null,d.role);}
    save();ui.modal=null;toast(d.name+" saved");},
  pxPayTab:el=>{ui.pq.pay=el.dataset.v;render(true);},
  pxPayCsv:()=>{const rows=[["Date","Booking","Guest","Method","Channel","Amount USD","Resort share","Speedboat share"]];Object.values(DB.pms.headers).forEach(h=>h.payments.forEach(p=>rows.push([p.at,h.ref,h.name,p.method,p.channel,p.amount,(p.split||{})[LE_ROOM]||0,(p.split||{})[LE_BOAT]||0])));dl("payments-"+TODAY+".csv",rows);},
  pxSetTab:el=>{ui.pq.setup=el.dataset.v;render(true);},
  pxSeasonAdd:()=>{DB.pms.rates.seasons.push({id:"se"+Date.now(),name:"New season",from:addDays(TODAY,30),to:addDays(TODAY,45),pct:10});audit("Rates","seasons","Season added",null,"New season");save();render(true);},
  pxSeasonDel:el=>{const s=DB.pms.rates.seasons.splice(+el.dataset.i,1)[0];audit("Rates","seasons","Season removed",s.name,null);save();render(true);},
  pxPromoAdd:()=>{const c=val("pr-code").toUpperCase(),p=+val("pr-pct");if(!c||!(p>0&&p<100))return toast("Enter a code and a percentage");if(DB.pms.rates.promos.some(x=>x.code===c))return toast("That code already exists");DB.pms.rates.promos.push({code:c,pct:p,until:addDays(TODAY,90),active:true});audit("Rates","promo","Promo code added",null,c+" "+p+"%");save();render(true);},
  pxImKind:el=>{ui.pq.im={kind:el.dataset.v,text:"",res:null};render(true);},
  pxImCheck:()=>{const im=ui.pq.im;im.text=document.getElementById("im-text").value;const lines=im.text.trim().split(/\n/);const rows=lines.slice(1).map((raw,i)=>({n:i+2,raw,c:raw.split(",").map(x=>x.trim())}));
    for(const r of rows){const c=r.c;
      if(im.kind==="deps"){const rt=DB.routes.find(x=>x.from===c[0]&&x.to===c[1]),bt=DB.boats.find(x=>x.name.toLowerCase()===(c[4]||"").toLowerCase());
        r.err=c.length<6?"Expected 6 columns":!rt?"Unknown route "+c[0]+" to "+c[1]:!/^\d{4}-\d\d-\d\d$/.test(c[2])||c[2]<TODAY?"Date must be YYYY-MM-DD, today or later":!/^([01]\d|2[0-3]):[0-5]\d$/.test(c[3])?"Time must be HH:MM (24-hour)":!bt?"Unknown boat "+c[4]:!(+c[5]>0)?"Price must be a number":DB.schedules.some(s=>s.routeId===rt.id&&s.date===c[2]&&s.time===c[3])?"This departure already exists":"";}
      else{const v=DB.villas.find(x=>x.name.toLowerCase()===(c[0]||"").toLowerCase());r.err=c.length<5?"Expected 5 columns":!v?"Unknown villa "+c[0]:!c[1]?"Room name is required":!(+c[3]>0)?"Sleeps must be a number":!(+c[4]>0)?"Price must be a number":v.rooms.some(x=>x.name.toLowerCase()===c[1].toLowerCase())?"Room already exists":"";}}
    im.res=rows;render(true);},
  pxImGo:()=>{const im=ui.pq.im;let n=0;for(const r of im.res.filter(x=>!x.err)){const c=r.c;
      if(im.kind==="deps"){const rt=DB.routes.find(x=>x.from===c[0]&&x.to===c[1]),bt=DB.boats.find(x=>x.name.toLowerCase()===c[4].toLowerCase());DB.schedules.push({id:"s"+Date.now()+n,routeId:rt.id,date:c[2],time:c[3],boatId:bt.id,price:+c[5],taken:[],status:"Scheduled"});}
      else{const v=DB.villas.find(x=>x.name.toLowerCase()===c[0].toLowerCase());v.rooms.push({id:"r"+Date.now()+n,name:c[1],bed:c[2]||"Queen bed",cap:+c[3],price:+c[4],active:true});DB.pms.hk["r"+Date.now()+n]="inspected";}n++;}
    audit("Import",im.kind,"CSV import",null,n+" rows");save();ui.pq.im={kind:im.kind,text:"",res:null};toast(n+" rows imported");}
});
function pxSyncBoarded(sid){for(const b of DB.bookings){if(b.type!=="boat"||b.status==="Cancelled")continue;const l=b.legs.find(x=>x.sid===sid);if(!l)continue;const all=l.seats.every(seat=>DB.pms.boarded[sid+"|"+seat]);
  if(all&&["Confirmed","Paid"].includes(b.status)){b.status="Boarded";b.log.push([TODAY,"Boarded"]);audit("Booking item",b.code,"Boarded","Confirmed","Boarded");}
  if(!all&&b.status==="Boarded"){b.status="Confirmed";}}}
Object.assign(ON,{
  pxRole:el=>{ui.user.staffRole=el.value;try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}ui.pv=pxHome(el.value);ui.modal=null;render();toast("Viewing as "+tx(el.value));},
  pxNav:el=>{ui.pv=el.value;if(el.value==="newbk"&&!ui.nb)ui.nb=nbFresh();render();},
  pxResF:el=>{ui.pq.res[el.dataset.k]=el.value;render(true);},
  pxBoatDate:el=>{ui.pq.boats.date=el.value||TODAY;render(true);},
  pxBoatRoute:el=>{ui.pq.boats.route=el.value;render(true);},
  pxPierN:el=>{ui.pq.pier.n=+el.value;render(true);},
  pxAuF:el=>{ui.pq.au.e=el.value;render(true);},
  pxEnt:el=>{const e=ent(el.dataset.id),k=el.dataset.k,before=e[k];e[k]=["tax","svc"].includes(k)?Math.max(0,+el.value||0):el.value;audit("Setup",e.short+" "+k,"Company setting changed",before,e[k]);save();toast("Saved");},
  pxRate:el=>{const R=DB.pms.rates,k=el.dataset.k,before=R[k];R[k]=Math.max(0,+el.value||0);audit("Rates",k,"Rate rule changed",before,R[k]);save();toast("Rate rule saved");},
  pxSeason:el=>{const s=DB.pms.rates.seasons[+el.dataset.i],k=el.dataset.k,before=s[k];s[k]=k==="pct"?+el.value||0:el.value;audit("Rates","season "+s.name,"Season changed",before,s[k]);save();toast("Season saved");},
  pxLos:el=>{const l=DB.pms.rates.los[+el.dataset.i],before=l.pct;l.pct=Math.max(0,+el.value||0);audit("Rates","length of stay","Discount changed",before,l.pct);save();toast("Saved");},
  pxPromo:el=>{const p=DB.pms.rates.promos[+el.dataset.i];p.active=el.checked;audit("Rates","promo "+p.code,p.active?"Activated":"Deactivated",null,null);save();toast(p.code+(p.active?" active":" off"));},
  pxCancelP:el=>{const C=DB.pms.rates.cancel,k=el.dataset.k,before=C[k];C[k]=Math.max(0,+el.value||0);audit("Rates","cancellation "+k,"Policy changed",before,C[k]);save();toast("Policy saved");},
  pxRule:el=>{const R=DB.pms.rules,k=el.dataset.k,before=R[k];R[k]=Math.max(0,+el.value||0);audit("Setup",k,"Booking rule changed",before,R[k]);save();toast("Rule saved");},
  pxFx:el=>{const R=DB.pms.rules,k=el.dataset.k,before=R.fx[k];R.fx[k]=Math.max(0,+el.value||0);if(k==="IDR")DB.settings.rate=R.fx.IDR;audit("Setup","fx "+k,"Exchange rate changed",before,R.fx[k]);save();toast("Rate saved");},
  pxTq:el=>{ui.pq.tq[el.dataset.k]=el.value;render(true);}
});
document.addEventListener("input",e=>{const t=e.target;
  if(t.dataset.in==="pxResQ"){ui.pq.res.q=t.value;const tb=document.getElementById("px-res-body");if(tb)tb.innerHTML=pxResRows();}
  if(t.dataset.in==="pxGQ"){ui.pq.gq=t.value;const tb=document.getElementById("px-g-body");if(tb)tb.innerHTML=pxGuestRows();}
  if(t.dataset.in==="nbQ"&&ui.nb){ui.nb.q=t.value;const r=document.getElementById("nb-res");if(r)r.innerHTML=nbResults(t.value);}
  if(t.dataset.nb&&ui.nb&&t.type!=="checkbox"&&t.type!=="radio"&&!t.dataset.nbr)nbSet(t);
  if(t.dataset.pax&&ui.nb){const[i,j,k]=t.dataset.pax.split("|");ui.nb.items[+i].pax[+j][k]=t.value;}
  if(t.dataset.pier&&ui.pq.pier){const p=t.dataset.pier;if(p==="phone")ui.pq.pier.phone=t.value;else{const[i,k]=p.split("|");ui.pq.pier.pax[+i][k]=t.value;}}});
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset.nb&&ui.nb){nbSet(t);if(t.dataset.nbr||t.tagName==="SELECT"&&["room","guests"].includes(t.dataset.nb)||["ci","co"].includes(t.dataset.nb))render(true);}
  if(t.dataset.pax&&ui.nb){const[i,j,k]=t.dataset.pax.split("|");ui.nb.items[+i].pax[+j][k]=t.value;}
  if(t.dataset.pier&&ui.pq.pier&&t.tagName==="SELECT"){const[i,k]=t.dataset.pier.split("|");ui.pq.pier.pax[+i][k]=t.value;}});
function nbSet(t){const nb=ui.nb,k=t.dataset.nb,v=t.type==="checkbox"?t.checked:t.value;
  if(k==="gname")nb.g.name=v;else if(k==="gphone")nb.g.phone=v;else if(k==="gemail")nb.g.email=v;else if(k==="gcountry")nb.g.country=v;
  else if(["convo","promo","mode","method","amt","checkin"].includes(k)){nb[k]=k==="promo"?String(v).toUpperCase():v;}
  else{nb.f[k]=v;if(k==="ci"&&nb.f.co<=v)nb.f.co=addDays(v,DB.pms.rates.minStay);if(k==="route"||k==="bdate"){nb.f.dep="";if(nb.f.rdate<nb.f.bdate)nb.f.rdate=nb.f.bdate;}if(k==="rdate")nb.f.rdep="";}}
setInterval(()=>{const el=document.getElementById("nb-timer");if(!el)return;const st=ui.pv==="pier"?(ui.pq.pier||{}).start:(ui.nb||{}).start;if(!st)return;const s=Math.round((Date.now()-st)/1000);el.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");},1000);

/* ================= render ================= */
function pxRender(k){
  sweepHolds();const keep=ui.cur;ui.cur="USD";
  const role=pxRole();if(!ui.pv||!pxCan(ui.pv,role))ui.pv=pxHome(role);
  if(ui.pv==="newbk"){if(!ui.nb)ui.nb=nbFresh();const F=ui.nb.f;const pick=(rid,d,cur)=>{const ds=DB.schedules.filter(s=>s.routeId===rid&&s.date===d&&saleOpen(s)).sort((a,b)=>a.time.localeCompare(b.time));return ds.some(s=>s.id===cur)?cur:(ds[0]||{}).id||"";};
    F.dep=pick(F.route,F.bdate,F.dep);const rt=route(F.route),back=DB.routes.find(r=>r.from===rt.to&&r.to===rt.from);F.rdep=back?pick(back.id,F.rdate,F.rdep):"";}
  const y=window.scrollY;let pg;try{pg=(PX[ui.pv]||PX.dash)();}catch(err){console.error(err);pg={title:"Something went wrong",body:`<div class="empty"><p>${esc(err.message)}</p></div>`};}
  document.getElementById("app").innerHTML=pxShell(pg);document.getElementById("layer").innerHTML=pxLayer();ui.cur=keep;
  window.scrollTo(0,k?y:0);const c=document.getElementById("chat");if(c)c.innerHTML="";
}
const pxPrevRender=render;
render=function(k){if(ui.mode==="admin"&&ui.user&&ui.user.role==="admin")return pxRender(k);return pxPrevRender(k);};
render(true);
