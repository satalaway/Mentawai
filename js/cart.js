"use strict";
/* ================= GUEST SITE: one combined trip =================
   Villas and speedboat seats go into one trip, checked out once, creating one booking
   with one folio (split into a resort invoice and a speedboat invoice). Prices use the rate engine. */
const ICON_BAG=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`;
ui.trip=(()=>{try{return JSON.parse(sessionStorage.getItem("mi-trip"))||null;}catch(e){return null;}})()||{items:[],promo:"",deposit:true};
ui.tco=ui.tco||{};
function tripSave(){try{sessionStorage.setItem("mi-trip",JSON.stringify(ui.trip));}catch(e){}}
(function(){const s=document.createElement("style");s.textContent=`
.trip-btn{position:relative;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 12px;font-weight:600;font-size:.85rem;color:var(--ink)}
.trip-btn:hover,.trip-btn.on{border-color:var(--lagoon);background:var(--shallow);color:var(--lagoon-ink)}
.trip-btn i{font-style:normal;background:var(--lagoon);color:#fff;border-radius:999px;font-size:.72rem;padding:1px 7px}
.ti{display:grid;grid-template-columns:44px 1fr auto;gap:14px;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:12px}
.ti.bad{border-color:var(--danger)}
.ti .ic{width:44px;height:44px;border-radius:12px;background:var(--surface-2);color:var(--lagoon-ink);display:grid;place-items:center}.ti .ic svg{width:22px;height:22px}
.ti details{margin-top:6px;font-size:.85rem}.ti summary{cursor:pointer;color:var(--lagoon-ink);font-weight:600}
.xs{background:var(--sand);border-radius:18px;padding:16px 18px;margin-bottom:12px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.xs .boat-mini{width:52px;height:52px;border-radius:50%;background:#fff;display:grid;place-items:center;flex:0 0 auto}.xs .boat-mini img{width:90%}
.ent-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line);font-size:.92rem}
.ent-row small{display:block;color:var(--ink-3);font-size:.75rem}
.dep-opt{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px;cursor:pointer}
.dep-opt:has(input:checked){border-color:var(--lagoon);background:var(--shallow)}
@media (max-width:700px){.ti{grid-template-columns:1fr}.ti .ic{display:none}}`;document.head.appendChild(s);})();

/* ---------- header: currency list and trip button ---------- */
const cartSiteHeader=siteHeader;
siteHeader=function(){
  let h=cartSiteHeader();
  h=h.replace(/<select data-on="cur">[\s\S]*?<\/select>/,`<select data-on="cur">${CURRENCIES.map(c=>`<option ${(ui.cur||"USD")===c?"selected":""}>${c}</option>`).join("")}</select>`);
  const n=ui.trip.items.length;
  h=h.replace('<div class="head-tools">',`<div class="head-tools"><button class="trip-btn ${String(ui.view).startsWith("trip")?"on":""}" data-a="go" data-v="trip" aria-label="Your trip, ${n} item${n===1?"":"s"}">${ICON_BAG}<span>Trip</span>${n?`<i>${n}</i>`:""}</button>`);
  return h;
};

/* ---------- villa page: rate-engine price and "Add to trip" ---------- */
const cartViewVilla=viewVilla;
viewVilla=function(){
  let h=cartViewVilla();const v=villaById(ui.p.id),s=ui.vs;
  const sel=ui.selRoom&&v.rooms.find(r=>r.id===ui.selRoom&&roomFree(r.id,s.ci,s.co)&&r.cap>=s.guests);
  const i=h.indexOf('<div style="margin-top:14px">'),k=h.indexOf('data-a="villaCheckout"'),j=k<0?-1:h.indexOf("</button>",k);if(i<0||j<0)return h;
  let blk;
  if(sel){const q=quoteStay(sel.id,s.ci,s.co,ui.trip.promo);
    blk=`<div style="margin-top:14px"><div class="sum-row"><b>${esc(sel.name)}</b><span></span></div>${q.lines.map(l=>`<div class="sum-row"><span class="muted">${esc(l.label)}</span><span>${money(l.amount)}</span></div>`).join("")}<div class="sum-row"><span class="muted">Tax and service</span><span>${money(q.tax+q.svc)}</span></div><div class="sum-row sum-total"><span>Total</span><span>${money(q.total)}</span></div>${q.minStayOk?"":`<p class="err" style="margin-top:6px">The minimum stay is ${DB.pms.rates.minStay} nights.</p>`}</div><button class="btn btn-block" style="margin-top:14px" data-a="villaCheckout" ${q.minStayOk?"":"disabled"}>Add to trip`;}
  else blk=`<div style="margin-top:14px"><p class="muted small">Select a room to see the price for your dates.</p></div><button class="btn btn-block" style="margin-top:14px" data-a="villaCheckout" disabled>Add to trip`;
  return h.slice(0,i)+blk+h.slice(j);
};
const cartViewSeats=viewSeats;
viewSeats=function(){return cartViewSeats().replace(">Continue to checkout<",">Add to trip<");};

/* ---------- trip contents ---------- */
function tripLines(){
  const out=[],E={};let total=0;
  for(const it of ui.trip.items){
    if(it.kind==="stay"){const r=roomById(it.roomId);if(!r)continue;const q=quoteStay(it.roomId,it.ci,it.co,ui.trip.promo);const ok=it.ci>=TODAY&&roomFree(it.roomId,it.ci,it.co)&&q.minStayOk;
      out.push({it,ok,msg:ok?"":"This room is no longer available for these dates. Remove it and pick another.",icon:ICON.villa,title:r.villa.name,sub:`${esc(r.name)}, ${fd(it.ci)} to ${fd(it.co)}, ${q.nights} night${q.nights>1?"s":""}, ${it.guests} guest${it.guests>1?"s":""}`,q,ent:LE_ROOM});}
    else{const ss=it.legs.map(l=>sch(l.sid));if(ss.some(x=>!x))continue;const q=quoteBoat(it.legs.map(l=>l.sid),it.pax);
      const ok=it.legs.every((l,i)=>saleOpen(ss[i])&&!l.seats.some(x=>ss[i].taken.includes(x)));const r0=route(ss[0].routeId);
      out.push({it,ok,msg:ok?"":"A seat or departure is no longer available. Remove it and choose again.",icon:ICON.boat,title:`Speedboat ${portShort(r0.from)} to ${portShort(r0.to)}${it.legs.length>1?" and back":""}`,sub:it.legs.map((l,i)=>`${i?"Return":"Departure"}: ${fd(ss[i].date)}, ${ss[i].time}, seat${l.seats.length>1?"s":""} ${l.seats.join(" ")}`).join("<br>")+`<br>${it.pax} passenger${it.pax>1?"s":""}`,q,ent:LE_BOAT});}
  }
  for(const x of out){if(!x.ok)continue;const t=E[x.ent]=E[x.ent]||{total:0};t.total+=x.q.total;total+=x.q.total;}
  const hasStay=out.some(x=>x.ok&&x.it.kind==="stay");const R=DB.pms.rules;
  const deposit=hasStay&&ui.trip.deposit?Math.round(total*R.depositPct/100):total;
  return {out,E,total,deposit,hasStay,allOk:out.length&&out.every(x=>x.ok)};
}
function crossSell(){
  const res=[];
  for(const it of ui.trip.items.filter(x=>x.kind==="stay")){const r=roomById(it.roomId);if(!r)continue;const p=PORT_OF[r.villa.id];if(!p)continue;
    const has=ui.trip.items.some(x=>x.kind==="boat"&&x.legs.some(l=>{const s=sch(l.sid);return s&&route(s.routeId).to===p&&s.date===it.ci;}));if(has)continue;
    const pick=(from,to,date)=>DB.schedules.filter(s=>{const rt=route(s.routeId);return rt.from===from&&rt.to===to&&s.date===date&&saleOpen(s)&&seatsLeft(s)>=it.guests;}).sort((a,b)=>a.time.localeCompare(b.time))[0];
    const out=pick("PDG",p,it.ci),back=pick(p,"PDG",it.co);if(out||back)res.push({it,p,out,back,r});}
  return res;
}
function sitePage(inner,crumb){return `${siteHeader()}<main class="wrap page"><div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><span>${crumb}</span></div>${inner}</main>${siteFooter()}`;}
function viewTrip(){
  if(!ui.trip.items.length)return sitePage(`<h1 style="font-size:2rem;margin-bottom:16px">Your trip</h1><div class="empty"><h3>Your trip is empty</h3><p>Add a villa stay, speedboat seats or both. You check out once for everything.</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn" data-a="go" data-v="villas">Find a villa</button><button class="btn btn-ghost" data-a="go" data-v="boats">Find a speedboat</button></div></div>`,"Your trip");
  const T=tripLines(),cs=crossSell(),R=DB.pms.rules,pr=promoFind(ui.trip.promo);
  const items=T.out.map(x=>`<article class="ti ${x.ok?"":"bad"}"><div class="ic">${x.icon}</div><div style="min-width:0"><h3 style="font-size:1.1rem">${esc(x.title)}</h3><p class="small muted">${x.sub}</p>
    <details><summary>Price details</summary>${x.q.lines.map(l=>`<div class="sum-row"><span class="muted">${esc(l.label)}</span><span>${money(l.amount)}</span></div>`).join("")}${x.q.tax+x.q.svc?`<div class="sum-row"><span class="muted">Tax and service</span><span>${money(x.q.tax+x.q.svc)}</span></div>`:""}</details>
    ${x.ok?"":`<p class="err" style="margin-top:6px">${x.msg}</p>`}</div>
    <div style="text-align:right;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;gap:8px"><b class="price">${money(x.q.total)}</b><button class="btn btn-ghost btn-sm" data-a="tripRemove" data-id="${x.it.id}">Remove</button></div></article>`).join("");
  const xs=cs.map(c=>{const parts=[];if(c.out)parts.push(`Padang to ${portShort(c.p)} on ${fd(c.out.date)} at ${c.out.time}`);if(c.back)parts.push(`back on ${fd(c.back.date)} at ${c.back.time}`);
    const price=(c.out?c.out.price:0)+(c.back?c.back.price:0);
    return `<div class="xs"><div class="boat-mini"><img src="${LOGO_BOAT}" alt=""></div><div style="flex:1;min-width:220px"><b>Getting to ${esc(c.r.villa.name)}?</b><p class="small muted">${parts.join(", ")}. From ${money(price)} per person for ${c.it.guests} guest${c.it.guests>1?"s":""}, seats are free now.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" data-a="tripAddTransfer" data-id="${c.it.id}">Add transfer</button><button class="btn btn-ghost btn-sm" data-a="bookTransfer" data-to="${c.p}" data-ci="${c.it.ci}" data-co="${c.it.co}" data-g="${c.it.guests}">Choose seats</button></div></div>`;}).join("");
  const entRows=[[LE_ROOM,"Villa stays"],[LE_BOAT,"Speedboat"]].filter(([e])=>T.E[e]).map(([e,l])=>`<div class="ent-row"><span>${l}<small>${esc(ent(e).name)}</small></span><b>${money(T.E[e].total)}</b></div>`).join("");
  return sitePage(`<h1 style="font-size:2rem;margin-bottom:16px">Your trip</h1>
  <div class="detail"><div>${items}${xs}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn btn-ghost btn-sm" data-a="go" data-v="villas">Add a villa stay</button><button class="btn btn-ghost btn-sm" data-a="go" data-v="boats">Add speedboat seats</button></div></div>
  <aside class="summary"><h3 style="margin-bottom:8px">Trip summary</h3>${entRows}
    <div class="sum-row sum-total"><span>Total</span><span>${money(T.total)}</span></div>
    <label class="field" style="margin-top:10px"><span>Promo code (villa stays)</span><div style="display:flex;gap:6px"><input class="input" id="trip-promo" value="${esc(ui.trip.promo||"")}" placeholder="e.g. MENTAWAI10"><button class="btn btn-ghost btn-sm" data-a="tripPromo">Apply</button></div></label>
    ${ui.trip.promo?(pr?`<p class="small" style="color:var(--ok);margin-top:4px">${esc(pr.code)} applied: ${pr.pct}% off villa stays.</p>`:`<p class="err" style="margin-top:4px">That code isn't valid.</p>`):""}
    ${T.hasStay?`<div style="margin-top:10px"><label class="dep-opt"><input type="radio" name="dep" data-a="tripDeposit" data-v="1" ${ui.trip.deposit?"checked":""}><span><b>Pay a ${R.depositPct}% deposit now: ${money(Math.round(T.total*R.depositPct/100))}</b><span class="small muted" style="display:block">The balance is paid at check-in.</span></span></label>
      <label class="dep-opt"><input type="radio" name="dep" data-a="tripDeposit" data-v="0" ${ui.trip.deposit?"":"checked"}><span><b>Pay in full: ${money(T.total)}</b></span></label></div>`:""}
    <button class="btn btn-block" style="margin-top:14px" data-a="tripCheckout" ${T.allOk?"":"disabled"}>Continue to checkout</button>
    <p class="tiny muted" style="margin-top:8px">One payment covers everything. You get separate invoices from the resort and the speedboat company.</p>
  </aside></div>`,"Your trip");
}

/* ---------- checkout ---------- */
function viewTripCheckout(){
  if(!ui.trip.items.length)return viewTrip();
  if(!isGuest())return sitePage(`<div class="empty"><h3>Sign in to check out</h3><p>Your booking is saved to your account so you can find vouchers and tickets later.</p><button class="btn" data-a="tripCheckout">Sign in to continue</button></div>`,"Checkout");
  const T=tripLines(),f=ui.tco,u=findUser(ui.user.email)||{};const v=(k,d)=>esc(f[k]!=null?f[k]:(d||""));
  const cSel=(k,d)=>`<select class="input" data-tf="${k}">${COUNTRIES.map(x=>`<option ${(f[k]||d)===x?"selected":""}>${x}</option>`).join("")}</select>`;
  const boats=ui.trip.items.filter(x=>x.kind==="boat");const pm=f.pay||(u.payPref&&PIVOT_METHODS.some(m=>m[0]===u.payPref)?u.payPref:"Card");
  const saved=(u.cards||[]).find(c=>c.def);
  let pi=0;
  const paxHTML=boats.map((b,bi)=>{const s=sch(b.legs[0].sid),r=route(s.routeId);return `<div class="pax"><p style="font-weight:700;margin-bottom:8px">Speedboat ${esc(portShort(r.from))} to ${esc(portShort(r.to))}${b.legs.length>1?" and back":""}, ${fd(s.date)}</p>${Array.from({length:b.pax},(_,i)=>{const k=`b${bi}p${i}`;const first=pi++===0;return `<div class="grid3" style="margin-bottom:10px">
    <label class="field"><span>Passenger ${i+1} full name</span><input class="input" data-tf="${k}n" value="${v(k+"n",first?ui.user.name:"")}"></label>
    <label class="field"><span>Nationality</span>${cSel(k+"c",first?(u.country||"Australia"):"Australia")}</label>
    <label class="field"><span>Passport number</span><input class="input" data-tf="${k}p" value="${v(k+"p")}"></label></div>`;}).join("")}</div>`;}).join("");
  return sitePage(`<h1 style="font-size:2rem;margin-bottom:16px">Checkout</h1>
  <div class="detail"><div id="tripform">
   <section class="panel"><h3>Lead guest</h3><div class="grid2">
    <label class="field"><span>Full name</span><input class="input" data-tf="name" value="${v("name",ui.user.name)}"></label>
    <label class="field"><span>Email</span><input class="input" type="email" data-tf="email" value="${v("email",ui.user.email)}" readonly></label>
    <label class="field"><span>WhatsApp number</span><input class="input" data-tf="phone" placeholder="+61 412 345 678" value="${v("phone",u.phone)}"></label>
    <label class="field"><span>Country of residence</span>${cSel("country",u.country||"Australia")}</label></div>
    ${T.hasStay?`<label class="field" style="margin-top:12px"><span>Anything we should know? (optional)</span><textarea class="input" rows="2" data-tf="note" placeholder="Arrival time, dietary needs, surfboards">${v("note")}</textarea></label>`:""}</section>
   ${boats.length?`<section class="panel"><h3>Speedboat passengers</h3><p class="small muted" style="margin:-8px 0 8px">Names, nationality and passport numbers go on the harbour master's manifest and must match passports.</p>${paxHTML}</section>`:""}
   <section class="panel"><h3>Payment by Pivot</h3><div class="pay-opts">${PIVOT_METHODS.map(m=>`<label class="pay-opt"><input type="radio" name="tpay" data-tf="pay" value="${m[0]}" ${pm===m[0]?"checked":""}><span><b>${m[0]}</b><span class="small muted">${m[1]}</span></span></label>`).join("")}</div>
    ${pm==="Card"?(saved?`<p class="small" style="margin-top:12px">Paying with your saved ${esc(saved.brand)} ending in ${esc(saved.last4)}.</p>`:`<div class="grid3" style="margin-top:12px"><label class="field"><span>Card number</span><input class="input" inputmode="numeric" data-tf="cc" placeholder="4242 4242 4242 4242" value="${v("cc")}"></label><label class="field"><span>Expiry</span><input class="input" data-tf="exp" placeholder="MM/YY" value="${v("exp")}"></label><label class="field"><span>CVC</span><input class="input" data-tf="cvc" placeholder="123" value="${v("cvc")}"></label></div>`):""}
    ${pm==="E-wallet"?`<label class="field" style="margin-top:12px;max-width:260px"><span>E-wallet</span><select class="input" data-tf="wallet">${["GoPay","OVO","DANA","ShopeePay"].map(x=>`<option ${f.wallet===x?"selected":""}>${x}</option>`).join("")}</select></label>`:""}
    <label class="small" style="display:flex;gap:10px;align-items:flex-start;margin-top:14px"><input type="checkbox" data-tf="terms" ${f.terms?"checked":""} style="margin-top:4px;accent-color:var(--lagoon)"><span>I agree to the booking terms and cancellation policy: villas are free to cancel up to ${DB.pms.rates.cancel.roomFreeDays} days before check-in, speedboat seats up to ${DB.pms.rates.cancel.boatFreeHours} hours before departure. Crossings can be rescheduled for weather.</span></label>
    ${ui.err?`<p class="err" role="alert" style="margin-top:12px">${esc(ui.err)}</p>`:""}</section></div>
  <aside class="summary"><h3 style="margin-bottom:8px">Summary</h3>${T.out.map(x=>`<div class="sum-row"><span>${esc(x.title)}</span><span>${money(x.q.total)}</span></div>`).join("")}
    <div class="sum-row sum-total"><span>Total</span><span>${money(T.total)}</span></div>
    <div class="sum-row"><span><b>Due now</b>${T.deposit<T.total?` (${DB.pms.rules.depositPct}% deposit)`:""}</span><b>${money(T.deposit)}</b></div>
    ${T.deposit<T.total?`<div class="sum-row"><span class="muted">Due at check-in</span><span>${money(T.total-T.deposit)}</span></div>`:""}
    ${(ui.cur||"USD")!=="USD"?`<p class="tiny muted">Charged in USD (${fmtUSD(T.deposit)}). ${esc(ui.cur)} amounts are shown for reference.</p>`:""}
    <button class="btn btn-block" style="margin-top:14px" data-a="tripPlace">${["Card","E-wallet"].includes(pm)?"Pay "+money(T.deposit):"Place booking"}</button>
    <button class="btn btn-ghost btn-block" style="margin-top:8px" data-a="go" data-v="trip">Back to trip</button></aside></div>`,"Checkout");
}
function readTripForm(){document.querySelectorAll("#tripform [data-tf]").forEach(e=>{if(e.type==="radio"){if(e.checked)ui.tco[e.dataset.tf]=e.value;}else if(e.type==="checkbox")ui.tco[e.dataset.tf]=e.checked;else ui.tco[e.dataset.tf]=e.value.trim();});return ui.tco;}
function placeTrip(){
  const f=readTripForm(),T=tripLines(),fail=t=>{ui.err=t;render(true);};
  const u=findUser(ui.user.email);if(u&&u.status==="Suspended")return fail("This account is suspended, so it can't book online. Please contact the resort team.");
  if(!T.allOk)return fail("Something in your trip is no longer available. Go back to your trip to fix it.");
  if(!f.name)return fail("Enter the lead guest's full name.");
  if(!f.phone||normPhone(f.phone).length<8)return fail("Add a WhatsApp number so we can send tickets and day-of-travel updates.");
  const boats=ui.trip.items.filter(x=>x.kind==="boat");
  for(let bi=0;bi<boats.length;bi++)for(let i=0;i<boats[bi].pax;i++){const k=`b${bi}p${i}`;if(!f[k+"n"])return fail(`Enter passenger ${i+1}'s full name as on the passport.`);if(!f[k+"p"])return fail(`Enter passenger ${i+1}'s passport number. It's required for the speedboat manifest.`);}
  const pm=f.pay||"Card";const saved=u&&(u.cards||[]).find(c=>c.def);
  if(pm==="Card"&&!saved&&(f.cc||"").replace(/\D/g,"").length<12)return fail("Enter a card number. Any 12 or more digits work in this prototype.");
  if(!f.terms)return fail("Tick the box to accept the booking terms.");
  const instant=["Card","E-wallet"].includes(pm);
  const items=ui.trip.items.map(it=>it.kind==="stay"?{kind:"stay",roomId:it.roomId,ci:it.ci,co:it.co,guests:it.guests,note:f.note||""}
    :{kind:"boat",legs:it.legs.map(l=>({sid:l.sid,seats:l.seats})),pax:Array.from({length:it.pax},(_,i)=>{const k=`b${boats.indexOf(it)}p${i}`;return {name:f[k+"n"],nat:f[k+"c"],passport:f[k+"p"]};})});
  const res=pmsCreateBooking({guest:{name:f.name,email:ui.user.email,phone:f.phone,country:f.country},items,source:"Consumer app",mode:instant?"confirm":"hold",payment:instant?{method:pm==="E-wallet"?(f.wallet||"E-wallet"):pm,channel:"Pivot",amount:T.deposit}:null,promo:ui.trip.promo,by:"Guest (website)"});
  if(res.err)return fail(res.err);
  const h=H(res.ref);h.dueNow=T.deposit;if(!instant)itemsOf(res.ref).forEach(b=>b.pay=pm);save();
  ui.trip={items:[],promo:"",deposit:true};ui.tco={};tripSave();ui.err=null;
  const btn=document.querySelector('[data-a="tripPlace"]');if(btn){btn.disabled=true;btn.textContent="Processing payment";}
  setTimeout(()=>go("tripDone",{ref:res.ref}),700);
}

/* ---------- confirmation ---------- */
function viewTripDone(){
  const ref=ui.p.ref,h=H(ref);if(!h)return viewHome();
  const f=folio(ref),st=headerStatus(ref),its=itemsOf(ref),hold=st==="Hold";const first=its[0];
  const ents=Object.keys(f.E);
  return sitePage(`<div style="max-width:820px;margin:0 auto">
   <h1 style="font-size:2rem">${hold?"Booking placed, waiting for payment":st==="Expired"?"This hold has expired":"You're booked"}</h1>
   <p class="muted" style="margin-top:6px">Booking <b>${esc(ref)}</b>. ${hold?`We're holding your rooms and seats until ${wib(h.holdUntil)}. ${first.pay==="QRIS"?"Scan the QRIS code in the payment link we sent to your WhatsApp.":"Pay into virtual account BCA 8808 "+String(hstr(ref)).slice(0,4)+" "+String(hstr(ref+"x")).slice(0,4)+" before then."}`:st==="Expired"?"The rooms and seats were released. You can book again any time.":`We sent your vouchers${its.some(b=>b.type==="boat")?" and QR tickets":""} by email and WhatsApp.`}</p>
   ${hold?`<button class="btn btn-soft btn-sm" style="margin-top:12px" data-a="simPay" data-code="${first.code}">Simulate payment received</button>`:""}
   <section class="panel" style="margin-top:20px"><h3>What you booked</h3>${its.map(b=>`<div class="list-row"><div><b>${esc(itemTitle(b))}</b><p class="small muted">${itemWhen(b)}${b.type==="villa"?", "+b.guests+" guest"+(b.guests>1?"s":""):", "+b.pax.length+" passenger"+(b.pax.length>1?"s":"")}</p></div><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${statusBadge(itemLife(b))}<b>${money(b.total)}</b><button class="btn btn-ghost btn-sm" data-a="showVoucher" data-code="${b.code}">Voucher</button></div></div>`).join("")}
    ${its.some(b=>b.type==="boat")&&!hold?`<button class="btn btn-sm" style="margin-top:12px" data-a="tkOpen" data-ref="${esc(ref)}">Show QR tickets</button>`:""}</section>
   <section class="panel"><h3>Payment</h3><div class="sum-row"><span>Total</span><b>${money(f.total)}</b></div><div class="sum-row"><span>Paid</span><b>${money(f.paid)}</b></div><div class="sum-row"><span>${hold?"Due now":"Balance due at check-in"}</span><b>${money(hold?(h.dueNow||f.balance):Math.max(0,f.balance))}</b></div>
    <p class="small muted" style="margin-top:10px">Invoices are issued by each company:</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${ents.map(e=>`<button class="btn btn-ghost btn-sm" data-a="invOpen" data-ref="${esc(ref)}" data-ent="${e}">${e===LE_ROOM?"Resort invoice":"Speedboat invoice"}</button>`).join("")}</div></section>
   <div style="text-align:center;margin-top:10px"><button class="btn btn-ghost" data-a="pmGo" data-t="bookings">Go to my bookings</button></div></div>`,"Booking "+esc(ref));
}

/* ---------- actions ---------- */
A.villaCheckout=()=>{const s=ui.vs,r=roomById(ui.selRoom);if(!r)return;
  if(ui.trip.items.some(x=>x.kind==="stay"&&x.roomId===r.id&&x.ci<s.co&&s.ci<x.co)){toast("This room is already in your trip for overlapping dates");return;}
  ui.trip.items.push({id:"i"+Date.now(),kind:"stay",roomId:r.id,ci:s.ci,co:s.co,guests:+s.guests});tripSave();ui.selRoom=null;go("trip");toast(r.villa.name+" added to your trip");};
A.seatsNext=el=>{const leg=+el.dataset.leg,c=ui.cart;if(c.trip==="return"&&leg===0){go("boats",{leg:1});return;}
  ui.trip.items.push({id:"i"+Date.now(),kind:"boat",pax:c.pax,legs:c.legs.map(l=>({sid:l.sid,seats:l.seats.slice()}))});tripSave();ui.cart=null;go("trip");toast("Speedboat seats added to your trip");};
Object.assign(A,{
  tripRemove:el=>{ui.trip.items=ui.trip.items.filter(x=>x.id!==el.dataset.id);tripSave();render(true);},
  tripPromo:()=>{ui.trip.promo=(document.getElementById("trip-promo").value||"").trim().toUpperCase();tripSave();render(true);},
  tripDeposit:el=>{ui.trip.deposit=el.dataset.v==="1";tripSave();render(true);},
  tripAddTransfer:el=>{const it=ui.trip.items.find(x=>x.id===el.dataset.id);const c=crossSell().find(x=>x.it===it);if(!c)return;
    const legs=[c.out,c.back].filter(Boolean).map(s=>({sid:s.id,seats:seatLabels(boat(s.boatId).cap).filter(x=>!s.taken.includes(x)).slice(0,it.guests)}));
    ui.trip.items.push({id:"i"+Date.now(),kind:"boat",pax:it.guests,legs});tripSave();render(true);toast("Speedboat transfer added for "+it.guests+" guest"+(it.guests>1?"s":""));},
  tripCheckout:()=>needGuest(()=>go("tripCheckout")),
  tripPlace:()=>placeTrip()
});
document.addEventListener("change",e=>{if(e.target.closest("#tripform")&&e.target.dataset.tf==="pay"){readTripForm();render(true);}if(e.target.closest("#tripform")&&e.target.dataset.tf==="wallet")readTripForm();});
document.addEventListener("input",e=>{if(e.target.closest("#tripform"))readTripForm();});

/* ---------- render the trip pages ---------- */
const cartRender=render;
render=function(k){
  if(ui.mode!=="admin"&&["trip","tripCheckout","tripDone"].includes(ui.view)){
    if(ui.afterLogin&&!ui.modal){if(isGuest()){const n=ui.afterLogin;ui.afterLogin=null;return n();}ui.afterLogin=null;}
    sweepHolds();const y=window.scrollY;
    document.getElementById("app").innerHTML={trip:viewTrip,tripCheckout:viewTripCheckout,tripDone:viewTripDone}[ui.view]();
    document.getElementById("layer").innerHTML=modalHTML()+(ui.toast?`<div class="toast" role="status">${esc(ui.toast)}</div>`:"");
    window.scrollTo(0,k?y:0);if(typeof renderChat==="function")renderChat();return;}
  return cartRender(k);
};
