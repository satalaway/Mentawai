"use strict";
/* ================= ONE "BOOKING" MENU =================
   Availability, Reservations and New booking become one menu, Booking, with a calendar view
   (availability) and a list view (reservations). The new booking form opens in a modal from
   "Create new booking" in the top-right corner, from any page that starts a booking. */
Object.assign(PX_ID,{"Calendar":"Kalender","List":"Daftar","Create new booking":"Buat pemesanan baru"});
(function(){const s=document.createElement("style");s.textContent=`
.nb-modal{width:min(1180px,100%)!important;max-height:calc(100% - 24px);background:var(--bg)!important}
.nb-modal .panel{margin-bottom:14px}
.nb-modal aside .panel{top:0}
.vw-toggle button{display:inline-flex;align-items:center;gap:6px}.vw-toggle svg{width:16px;height:16px}
@media (max-width:900px){.nb-modal .cards2{grid-template-columns:1fr!important}}`;document.head.appendChild(s);})();

/* ---------- navigation: replace three entries with one ---------- */
const NB_ROLES=["Owner","Property Manager","Front Desk"];
const BOOK_ROLES=["Owner","Property Manager","Front Desk","Boat Operations","Finance"];
(function(){const sales=PX_NAV.find(g=>g[0]==="Sales");if(!sales||sales[1].some(x=>x[0]==="book"))return;
  const items=sales[1].filter(x=>!["cal","res","newbk"].includes(x[0]));
  sales[1].length=0;sales[1].push(["book","Booking",ICON.cal,BOOK_ROLES],...items);})();
const _navCan=pxCan;
pxCan=function(pv,role){
  if(pv==="newbk")return NB_ROLES.includes(role);
  if(pv==="cal"||pv==="res"||pv==="booking")return BOOK_ROLES.includes(role);
  return _navCan(pv,role);
};

/* ---------- the Booking page ---------- */
const VW_ICON={cal:ICON.cal,list:ICON.list};
PX.book=()=>{
  const v=ui.pq.bk||"cal",pg=v==="list"?PX.res():PX.cal();
  const toggle=`<div class="segbar vw-toggle" role="group" aria-label="View">${[["cal","Calendar"],["list","List"]].map(([k,l])=>`<button class="${v===k?"on":""}" data-a="bkView" data-v="${k}" aria-pressed="${v===k}">${VW_ICON[k].replace("<svg",'<svg width="16" height="16"')}${tx(l)}</button>`).join("")}</div>`;
  const create=NB_ROLES.includes(pxRole())?`<button class="btn btn-sm" data-a="nbOpen">${PXI.plus.replace("<svg",'<svg width="16" height="16"')} ${tx("Create new booking")}</button>`:"";
  return {title:tx("Booking"),sub:v==="list"?"Every booking from the app, WhatsApp, walk-ins, phone and agents":"Rooms and speedboat seats on one calendar, shared by the app, WhatsApp and walk-in sales",actions:toggle+create,body:pg.body};
};
A.bkView=el=>{ui.pq.bk=el.dataset.v;render(true);};
A.nbOpen=()=>{if(!ui.nb)ui.nb=nbFresh();ui.nbErr=null;ui.modal={kind:"nbModal"};render(true);};

/* ---------- new booking in a modal ---------- */
PXM.nbModal=()=>{const pg=PX.newbk();
  return `<div class="scrim" data-a="scrim"><div class="modal nb-modal" role="dialog" aria-modal="true" aria-label="New booking"><div class="modal-head"><div><h2 style="font-size:1.5rem">${tx("New booking")}</h2><p class="small muted" style="margin-top:4px">${pg.sub}</p></div><button class="x" data-a="close" aria-label="Close">&times;</button></div>${pg.body}</div></div>`;};

/* ---------- route old page names to the new menu, keep the modal's scroll position ---------- */
let navLastPv=null;
const _navRender=pxRender;
pxRender=function(k){
  if(ui.pv==="newbk"){ui.pv=navLastPv&&navLastPv!=="newbk"?navLastPv:"book";if(!ui.nb)ui.nb=nbFresh();ui.nbErr=null;ui.modal={kind:"nbModal"};k=true;}
  if(ui.pv==="cal"){ui.pv="book";ui.pq.bk="cal";}
  if(ui.pv==="res"){ui.pv="book";ui.pq.bk="list";}
  const nbOpen=ui.modal&&ui.modal.kind==="nbModal";
  if(nbOpen){if(!ui.nb)ui.nb=nbFresh();const F=ui.nb.f;
    const pick=(rid,d,cur)=>{const ds=DB.schedules.filter(s=>s.routeId===rid&&s.date===d&&saleOpen(s)).sort((a,b)=>a.time.localeCompare(b.time));return ds.some(s=>s.id===cur)?cur:(ds[0]||{}).id||"";};
    F.dep=pick(F.route,F.bdate,F.dep);const rt=route(F.route),back=DB.routes.find(r=>r.from===rt.to&&r.to===rt.from);F.rdep=back?pick(back.id,F.rdate,F.rdep):"";}
  const m=document.querySelector(".nb-modal"),top=m?m.scrollTop:0;
  _navRender(k);navLastPv=ui.pv;
  const m2=document.querySelector(".nb-modal");if(m2&&m)m2.scrollTop=top;
};
/* after a booking is created the detail page opens; the modal closes itself (nbCreate sets ui.modal) */
render(true);
