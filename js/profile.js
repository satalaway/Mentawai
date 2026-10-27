"use strict";
/* ================= GUEST PROFILE =================
   "My profile" replaces "My trips" for signed-in guests, with three sections:
   My bookings, Payment (saved cards, preferences, history) and Security (change password).
   Passwords are stored as SHA-256 hashes; cards keep only brand, last 4 digits and expiry. */
ui.ptab=ui.ptab||"bookings";
ui.pfFilter=ui.pfFilter||"upcoming";

function pfMe(){
  if(!isGuest())return null;
  let u=findUser(ui.user.email);
  if(!u)u=ensureUser({name:ui.user.name,email:ui.user.email,country:ui.user.country},"Signed up on the website");
  if(u&&!u.cards)u.cards=[];
  return u;
}
async function pfHash(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function pfBrand(n){n=n.replace(/\D/g,"");if(/^4/.test(n))return "Visa";if(/^(5[1-5]|2[2-7])/.test(n))return "Mastercard";if(/^3[47]/.test(n))return "Amex";if(/^35/.test(n))return "JCB";return "Card";}
function pfLuhn(n){n=n.replace(/\D/g,"");if(n.length<12||n.length>19)return false;let s=0,alt=false;for(let i=n.length-1;i>=0;i--){let d=+n[i];if(alt){d*=2;if(d>9)d-=9;}s+=d;alt=!alt;}return s%10===0;}
function pfInitials(n){return String(n||"?").split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("")||"?";}
function pfStrength(p){let s=0;if(p.length>=8)s++;if(p.length>=12)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return Math.min(4,s);}
const PF_STRENGTH=[["Too weak","var(--danger)"],["Weak","var(--danger)"],["Fair","var(--warn)"],["Good","var(--lagoon)"],["Strong","var(--ok)"]];

/* ---------- header: "My profile" menu in the top-right corner, with Sign out inside ---------- */
(function(){const s=document.createElement("style");s.textContent=`
.pm{position:relative}
.pm-btn{display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:4px 12px 4px 4px;font-weight:600;font-size:.88rem;color:var(--ink)}
.pm-btn:hover,.pm.open .pm-btn,.pm-btn.on{border-color:var(--lagoon);background:var(--shallow);color:var(--lagoon-ink)}
.pm-av{width:30px;height:30px;border-radius:50%;background:var(--lagoon);color:#fff;display:grid;place-items:center;font-size:.78rem;font-weight:700}
.pm-btn svg{width:14px;height:14px;transition:transform .15s}
.pm.open .pm-btn svg{transform:rotate(180deg)}
.pm-menu{display:none;position:absolute;right:0;top:calc(100% + 8px);min-width:230px;background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 32px rgba(18,41,58,.16);padding:6px;z-index:70}
.pm.open .pm-menu{display:block}
.pm-who{padding:10px 12px 12px;border-bottom:1px solid var(--line);margin-bottom:4px}
.pm-who b{display:block;font-size:.95rem}
.pm-who span{display:block;font-size:.8rem;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:210px}
.pm-menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:10px 12px;border-radius:10px;font-weight:600;font-size:.92rem;color:var(--ink)}
.pm-menu button:hover,.pm-menu button:focus-visible{background:var(--surface-2)}
.pm-menu hr{border:0;border-top:1px solid var(--line);margin:4px 0}
.pm-menu .pm-out{color:var(--danger)}
@media (max-width:520px){.pm-name{display:none}.pm-btn{padding:4px 8px 4px 4px}}`;document.head.appendChild(s);})();
const pfSiteHeader=siteHeader;
siteHeader=function(){
  let h=pfSiteHeader().replace(/\s*<button data-a="go" data-v="trips"[^>]*>[^<]*<\/button>/,"");
  if(isGuest()){
    const on=ui.view==="trips";
    const menu=`<div class="pm"><button class="pm-btn ${on?"on":""}" data-a="pmToggle" aria-haspopup="menu" aria-expanded="false"><span class="pm-av" aria-hidden="true">${esc(pfInitials(ui.user.name))}</span><span class="pm-name">My profile</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="pm-menu" role="menu"><div class="pm-who"><b>${esc(ui.user.name)}</b><span>${esc(ui.user.email)}</span></div>
    <button role="menuitem" data-a="pmGo" data-t="bookings">My bookings</button><button role="menuitem" data-a="pmGo" data-t="payment">Payment</button><button role="menuitem" data-a="pmGo" data-t="security">Security</button>
    <hr><button role="menuitem" class="pm-out" data-a="signout">Sign out</button></div></div>`;
    h=h.replace(/<button class="btn btn-ghost btn-sm" data-a="signout">[^<]*<\/button>/,menu);
  }
  return h;
};
function pmClose(){document.querySelectorAll(".pm.open").forEach(m=>{m.classList.remove("open");const b=m.querySelector(".pm-btn");if(b)b.setAttribute("aria-expanded","false");});}
document.addEventListener("click",e=>{if(!e.target.closest(".pm"))pmClose();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.querySelector(".pm.open")){pmClose();const b=document.querySelector(".pm-btn");if(b)b.focus();}});

/* ---------- section: bookings ---------- */
function pfBookings(u){
  const all=activity(u.email).bookings.slice().sort((a,b)=>startOf(a).localeCompare(startOf(b)));
  const up=all.filter(b=>endOf(b)>=TODAY&&b.status!=="Cancelled"),past=all.filter(b=>!up.includes(b)).reverse();
  const f=ui.pfFilter,list=f==="upcoming"?up:past;
  const row=b=>{let t,sub;
    if(b.type==="villa"){const r=roomById(b.roomId);t=r.villa.name;sub=`${esc(r.name)}, ${fd(b.checkIn)} to ${fd(b.checkOut)}, ${b.nights} night${b.nights>1?"s":""}`;}
    else{const d=sch(b.legs[0].sid),r=route(d.routeId);t=`Fast boat, ${portShort(r.from)} to ${portShort(r.to)}${b.legs.length>1?" and back":""}`;sub=`${fd(d.date)}, ${d.time}, ${b.pax.length} passenger${b.pax.length>1?"s":""}`;}
    return `<article class="pf-bk"><div class="pf-ic">${b.type==="villa"?ICON.villa:ICON.boat}</div>
    <div style="min-width:0"><p style="font-weight:700">${esc(t)}</p><p class="small muted">${sub}</p><p class="tiny muted">${b.code}, paid with ${esc(b.pay)}</p></div>
    <div class="end"><div style="display:flex;gap:8px;align-items:center">${statusBadge(b.status)}<b>${money(b.total)}</b></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${b.status==="Awaiting payment"?`<button class="btn btn-sm" data-a="simPay" data-code="${b.code}">Pay now</button>`:""}<button class="btn btn-ghost btn-sm" data-a="showVoucher" data-code="${b.code}">Voucher</button></div></div></article>`;};
  return `<div class="pf-sec-head"><h2>My bookings</h2><div class="segbar" role="group" aria-label="Which bookings">
    <button class="${f==="upcoming"?"on":""}" data-a="pfFilter" data-t="upcoming">Upcoming (${up.length})</button><button class="${f==="past"?"on":""}" data-a="pfFilter" data-t="past">Past and cancelled (${past.length})</button></div></div>
  ${list.length?list.map(row).join(""):`<div class="empty"><h3>${f==="upcoming"?"No upcoming trips":"Nothing here yet"}</h3><p>${f==="upcoming"?"Book a villa or a seat on the fast boat and it will appear here.":"Completed and cancelled bookings will show up here."}</p>${f==="upcoming"?`<button class="btn" data-a="go" data-v="villas">Find a villa</button>`:""}</div>`}`;
}

/* ---------- section: payment ---------- */
function pfPayment(u){
  const cards=u.cards,methods=Object.keys(DB.settings.pay).filter(k=>DB.settings.pay[k]);
  const hist=activity(u.email).bookings.slice().sort((a,b)=>b.created.localeCompare(a.created));
  const e=ui.pfErr&&ui.pfErr.k==="card"?ui.pfErr.t:"";
  return `<div class="pf-sec-head"><h2>Payment</h2></div>
  <section class="panel"><div class="pf-sec-head" style="margin-bottom:10px"><h3 style="margin:0">Saved cards</h3>${ui.pfAdd?"":`<button class="btn btn-soft btn-sm" data-a="pfAddCard">Add a card</button>`}</div>
   ${cards.length?cards.map(c=>`<div class="pf-card"><div class="pf-cardart">${esc(c.brand)}</div><div style="flex:1;min-width:150px"><b>${esc(c.brand)} ending in ${esc(c.last4)}</b><div class="small muted">${esc(c.name)}, expires ${esc(c.exp)}</div></div>
     ${c.def?`<span class="badge b-ok">Default</span>`:`<button class="btn btn-ghost btn-sm" data-a="pfCardDefault" data-id="${c.id}">Set as default</button>`}<button class="btn btn-danger btn-sm" data-a="pfCardRemove" data-id="${c.id}">Remove</button></div>`).join("")
     :(ui.pfAdd?"":`<p class="muted small">No saved cards yet. Save one to check out faster next time.</p>`)}
   ${ui.pfAdd?`<div class="pf-addcard"><div class="grid2"><label class="field"><span>Name on card</span><input class="input" id="pc-name" autocomplete="cc-name" value="${esc(u.name)}"></label>
     <label class="field"><span>Card number</span><input class="input" id="pc-num" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242"></label></div>
     <div class="grid2" style="margin-top:12px"><label class="field"><span>Expiry (MM/YY)</span><input class="input" id="pc-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="08/29"></label>
     <label class="field"><span>Security code (CVC)</span><input class="input" id="pc-cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123"></label></div>
     ${e?`<p class="err" role="alert" style="margin-top:10px">${esc(e)}</p>`:""}
     <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" data-a="pfSaveCard">Save card</button><button class="btn btn-ghost" data-a="pfCancelCard">Cancel</button></div></div>`:""}
   <p class="tiny muted" style="margin-top:12px">For your security we keep only the card type, last 4 digits and expiry date. The full card number and security code are never stored. Prototype: try 4242 4242 4242 4242.</p>
  </section>
  <section class="panel"><h3>Payment preferences</h3><div class="grid2">
   <label class="field"><span>Preferred payment method</span><select class="input" data-on="pfPref" data-k="payPref">${methods.map(m=>`<option ${(u.payPref||methods[0])===m?"selected":""}>${esc(m)}</option>`).join("")}</select></label>
   <label class="field"><span>Billing country</span><select class="input" data-on="pfPref" data-k="country">${COUNTRIES.map(c=>`<option ${u.country===c?"selected":""}>${esc(c)}</option>`).join("")}</select></label></div>
   <p class="tiny muted" style="margin-top:10px">Your preferred method is selected for you at checkout.</p></section>
  <section class="panel"><h3>Payment history</h3>${hist.length?`<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Booking</th><th>Method</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
   ${hist.map(b=>`<tr><td style="white-space:nowrap">${fd(b.created)}</td><td><b>${b.code}</b><div class="tiny muted">${esc(bookingTitle(b))}</div></td><td>${esc(b.pay)}</td><td style="white-space:nowrap">${money(b.total)}</td><td>${statusBadge(b.status==="Cancelled"?"Cancelled":b.status==="Awaiting payment"?"Awaiting payment":"Paid")}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-a="showVoucher" data-code="${b.code}">Receipt</button></td></tr>`).join("")}
   </tbody></table></div>`:`<p class="muted small">No payments yet.</p>`}</section>`;
}

/* ---------- section: security ---------- */
function pfSecurity(u){
  const e=ui.pfErr&&ui.pfErr.k==="pw"?ui.pfErr.t:"";
  const pw=(id,label,ac)=>`<label class="field"><span>${label}</span><span class="pw-wrap"><input class="input" type="password" id="${id}" autocomplete="${ac}"><button type="button" data-a="pfShowPw" data-id="${id}" aria-label="Show ${label.toLowerCase()}">Show</button></span></label>`;
  return `<div class="pf-sec-head"><h2>Security</h2></div>
  <section class="panel"><h3>Change password</h3><p class="small muted" style="margin:-6px 0 14px">${u.pwChanged?`Last changed on ${fdl(u.pwChanged)}.`:"You haven't changed your password yet."}</p>
   <div class="stack" style="max-width:440px">
    ${pw("pw-cur","Current password","current-password")}
    ${pw("pw-new","New password","new-password")}
    <div><div class="pf-meter"><i id="pw-bar"></i></div><p class="tiny muted" id="pw-label" style="margin-top:4px">Password strength</p>
     <ul class="pf-rules"><li id="pr-len">At least 8 characters</li><li id="pr-mix">Letters and numbers</li><li id="pr-diff">Different from your current password</li></ul></div>
    ${pw("pw-conf","Confirm new password","new-password")}
    ${e?`<p class="err" role="alert">${esc(e)}</p>`:""}
    <div><button class="btn" data-a="pfSavePw">Update password</button></div></div></section>
  <section class="panel"><h3>Sign-in activity</h3>
   <div class="list-row"><div><b>This device</b><p class="small muted">Signed in now</p></div><span class="badge b-ok">Active</span></div>
   <div class="list-row"><div><b>Last sign-in</b><p class="small muted">${u.lastLogin?fdl(u.lastLogin):"Today"}</p></div></div>
   <div class="list-row"><div><b>Account created</b><p class="small muted">${fdl(u.created||TODAY)}</p></div></div>
   <button class="btn btn-ghost btn-sm" style="margin-top:12px" data-a="pfSignoutAll">Sign out of all other devices</button></section>`;
}

/* ---------- the profile page (shown at "trips") ---------- */
viewTrips=function(){
  if(!isGuest())return `${siteHeader()}<main class="wrap page"><div class="empty"><h3>Sign in to see your profile</h3><p>Your bookings, saved payment details and password settings are all in one place.</p><button class="btn" data-a="pfSignin">Sign in</button></div></main>${siteFooter()}`;
  const u=pfMe(),act=activity(u.email),t=ui.ptab;
  const tabs=[["bookings","My bookings",act.total],["payment","Payment",u.cards.length],["security","Security",null]];
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><span>My profile</span></div>
  <section class="pf-head"><div class="pf-av" aria-hidden="true">${esc(pfInitials(u.name))}</div><div style="flex:1;min-width:200px"><h1 style="font-size:1.8rem">${esc(u.name)}</h1><p class="muted small">${esc(u.email)}, member since ${fd(u.created||TODAY,{month:"long",year:"numeric"})}</p></div>
   <div class="pf-stats"><div><b>${act.upcoming}</b><span>Upcoming trips</span></div><div><b>${act.total}</b><span>Bookings</span></div><div><b>${money(act.spent)}</b><span>Total spent</span></div></div></section>
  <div class="pf-layout"><nav class="pf-tabs" role="tablist" aria-label="Profile sections">${tabs.map(x=>`<button role="tab" aria-selected="${t===x[0]}" class="${t===x[0]?"on":""}" data-a="ptab" data-t="${x[0]}">${x[1]}${x[2]!=null?`<span class="pf-count">${x[2]}</span>`:""}</button>`).join("")}</nav>
  <div class="pf-body">${t==="payment"?pfPayment(u):t==="security"?pfSecurity(u):pfBookings(u)}</div></div>
  </main>${siteFooter()}`;
};

/* ---------- sign-in checks a changed password ---------- */
const pfDoLogin=A.doLogin;
A.doLogin=async el=>{
  const em=val("li-email"),pwEl=document.getElementById("li-pw"),pw=pwEl?pwEl.value:"";
  const u=findUser(em);
  if(u&&u.pwHash&&pw.length>=4){const h=await pfHash(pw);if(h!==u.pwHash){ui.modal.err="That password isn't right. If you changed it in your profile, use your new password.";render(true);return;}}
  pfDoLogin(el);
};

/* ---------- actions ---------- */
Object.assign(A,{
  pmToggle:el=>{const m=el.closest(".pm"),open=!m.classList.contains("open");pmClose();if(open){m.classList.add("open");el.setAttribute("aria-expanded","true");const f=m.querySelector(".pm-menu button");if(f)f.focus();}},
  pmGo:el=>{pmClose();ui.ptab=el.dataset.t;ui.pfErr=null;ui.pfAdd=false;go("trips");},
  ptab:el=>{ui.ptab=el.dataset.t;ui.pfErr=null;ui.pfAdd=false;render(true);},
  pfFilter:el=>{ui.pfFilter=el.dataset.t;render(true);},
  pfSignin:()=>needGuest(()=>go("trips")),
  pfAddCard:()=>{ui.pfAdd=true;ui.pfErr=null;render(true);const n=document.getElementById("pc-num");if(n)n.focus();},
  pfCancelCard:()=>{ui.pfAdd=false;ui.pfErr=null;render(true);},
  pfSaveCard:()=>{
    const u=pfMe(),name=val("pc-name"),num=val("pc-num").replace(/\D/g,""),exp=val("pc-exp").replace(/\s/g,""),cvc=val("pc-cvc");
    const fail=t=>{ui.pfErr={k:"card",t};render(true);};
    if(!name)return fail("Enter the name shown on the card.");
    if(!pfLuhn(num))return fail("That card number doesn't look right. Check the digits and try again.");
    const m=exp.match(/^(\d{2})\/?(\d{2})$/);if(!m||+m[1]<1||+m[1]>12)return fail("Enter the expiry date as MM/YY, for example 08/29.");
    const expDate=new Date(Date.UTC(2000+ +m[2],+m[1],1));if(expDate<=new Date(TODAY+"T00:00:00Z"))return fail("This card has expired.");
    if(!/^\d{3,4}$/.test(cvc))return fail("Enter the 3 or 4 digit security code from the back of the card.");
    const last4=num.slice(-4),brand=pfBrand(num);
    if(u.cards.some(c=>c.last4===last4&&c.brand===brand&&c.exp===m[1]+"/"+m[2]))return fail("This card is already saved.");
    u.cards.push({id:"c"+Date.now(),brand,last4,exp:m[1]+"/"+m[2],name,def:!u.cards.length,added:TODAY});
    save();ui.pfAdd=false;ui.pfErr=null;toast(brand+" ending in "+last4+" saved");
  },
  pfCardDefault:el=>{const u=pfMe();u.cards.forEach(c=>c.def=c.id===el.dataset.id);save();toast("Default card updated");},
  pfCardRemove:el=>{const u=pfMe();const c=u.cards.find(x=>x.id===el.dataset.id);if(!c||!confirm("Remove "+c.brand+" ending in "+c.last4+"?"))return;
    u.cards=u.cards.filter(x=>x.id!==c.id);if(c.def&&u.cards.length)u.cards[0].def=true;save();toast("Card removed");},
  pfShowPw:el=>{const i=document.getElementById(el.dataset.id);if(!i)return;const show=i.type==="password";i.type=show?"text":"password";el.textContent=show?"Hide":"Show";},
  pfSavePw:async()=>{
    const u=pfMe(),cur=document.getElementById("pw-cur").value,nw=document.getElementById("pw-new").value,cf=document.getElementById("pw-conf").value;
    const fail=t=>{ui.pfErr={k:"pw",t};render(true);};
    if(!cur)return fail("Enter your current password.");
    if(u.pwHash&&await pfHash(cur)!==u.pwHash)return fail("Your current password isn't right.");
    if(nw.length<8)return fail("Your new password needs at least 8 characters.");
    if(!/[A-Za-z]/.test(nw)||!/\d/.test(nw))return fail("Use both letters and numbers in your new password.");
    if(nw===cur)return fail("Choose a password that's different from your current one.");
    if(nw!==cf)return fail("The two new passwords don't match.");
    u.pwHash=await pfHash(nw);u.pwChanged=TODAY;save();ui.pfErr=null;
    toast("Password updated. Use your new password next time you sign in.");
  },
  pfSignoutAll:()=>toast("Signed out of all other devices")
});
Object.assign(ON,{pfPref:el=>{const u=pfMe();u[el.dataset.k]=el.value;save();toast(el.dataset.k==="payPref"?"Preferred payment method saved":"Billing country saved");}});

/* live helpers: card number spacing, expiry slash, password checks */
document.addEventListener("input",e=>{
  const id=e.target.id;
  if(id==="pc-num"){const d=e.target.value.replace(/\D/g,"").slice(0,19);e.target.value=d.replace(/(.{4})/g,"$1 ").trim();}
  if(id==="pc-exp"){let d=e.target.value.replace(/\D/g,"").slice(0,4);if(d.length>2)d=d.slice(0,2)+"/"+d.slice(2);e.target.value=d;}
  if(id==="pw-new"||id==="pw-cur"){
    const nw=(document.getElementById("pw-new")||{}).value||"",cur=(document.getElementById("pw-cur")||{}).value||"";
    const s=pfStrength(nw),bar=document.getElementById("pw-bar"),lab=document.getElementById("pw-label");
    if(bar){bar.style.width=nw?((s+1)*20)+"%":"0";bar.style.background=PF_STRENGTH[s][1];}
    if(lab)lab.textContent=nw?"Strength: "+PF_STRENGTH[s][0]:"Password strength";
    const set=(i,ok)=>{const el=document.getElementById(i);if(el)el.classList.toggle("ok",ok);};
    set("pr-len",nw.length>=8);set("pr-mix",/[A-Za-z]/.test(nw)&&/\d/.test(nw));set("pr-diff",!!nw&&nw!==cur);
  }
});

/* confirmation page: "Go to my trips" opens My bookings in the profile */
const pfViewConfirm=viewConfirm;
viewConfirm=function(){return pfViewConfirm().replace('data-a="go" data-v="trips">Go to my trips<','data-a="pmGo" data-t="bookings">Go to my bookings<');};

/* checkout lists the guest's preferred payment method first */
const pfViewCheckout=viewCheckout;
viewCheckout=function(){
  const u=isGuest()?findUser(ui.user.email):null;
  if(u&&u.payPref&&ui.cart&&ui.cart.form&&!ui.cart.form.pay&&DB.settings.pay[u.payPref])ui.cart.form.pay=u.payPref;
  return pfViewCheckout();
};

render(true);
