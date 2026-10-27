"use strict";
/* ================= USER MANAGEMENT (staff console) ================= */
ICON.users=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18.5 14.8c1.7.7 2.8 2.4 3 5.2"/></svg>`;
ANAV.splice(ANAV.findIndex(n=>n[0]==="settings"),0,["users","Users",ICON.users]);

const COUNTRIES=["Australia","France","Germany","Indonesia","Ireland","Italy","Japan","Netherlands","Norway","Singapore","United Kingdom","United States","Other"];
const lc=s=>String(s||"").trim().toLowerCase();
const findUser=email=>(DB.users||[]).find(u=>lc(u.email)===lc(email));
const userById=id=>(DB.users||[]).find(u=>u.id===id);
const isAdmin=()=>ui.user&&ui.user.role==="admin"&&(ui.user.staffRole||"Admin")==="Admin";

function seedUsers(bookings){
  const users=[],seen={};let n=1;
  const sorted=[...bookings].sort((a,b)=>a.created.localeCompare(b.created));
  for(const b of sorted){const k=lc(b.contact.email);if(seen[k])continue;seen[k]=1;
    const mine=bookings.filter(x=>lc(x.contact.email)===k);const last=mine.map(x=>x.created).sort().pop();
    users.push({id:"u"+(n++),name:b.contact.name,email:b.contact.email,phone:b.contact.phone||"",country:b.contact.country||"Other",role:"Guest",status:"Active",created:addDays(b.created,-(3+n%9)),lastLogin:last,notes:""});}
  users.push({id:"u"+(n++),name:"Lars Nilsen",email:"lars.n@example.com",phone:"+47 400 00 000",country:"Norway",role:"Guest",status:"Active",created:addDays(TODAY,-6),lastLogin:addDays(TODAY,-2),notes:"Signed up, no booking yet"});
  users.push({id:"u"+(n++),name:"Aiko Mori",email:"aiko.m@example.com",phone:"+81 90 0000 0000",country:"Japan",role:"Guest",status:"Suspended",created:addDays(TODAY,-40),lastLogin:addDays(TODAY,-35),notes:"Suspended after repeated payment chargebacks"});
  users.push({id:"u"+(n++),name:"Rina Siregar",email:"admin@mentawaiindah.example",phone:"+62 812 0000 0001",country:"Indonesia",role:"Admin",status:"Active",created:addDays(TODAY,-120),lastLogin:TODAY,notes:"Resort operations manager"});
  users.push({id:"u"+(n++),name:"Budi Santoso",email:"budi@mentawaiindah.example",phone:"+62 812 0000 0002",country:"Indonesia",role:"Staff",status:"Active",created:addDays(TODAY,-90),lastLogin:addDays(TODAY,-1),notes:"Front desk, Sipora"});
  users.push({id:"u"+(n++),name:"Dewi Lestari",email:"dewi@mentawaiindah.example",phone:"+62 812 0000 0003",country:"Indonesia",role:"Staff",status:"Suspended",created:addDays(TODAY,-200),lastLogin:addDays(TODAY,-60),notes:"On leave"});
  return users;
}
const _seed=seed;
seed=function(){const d=_seed();d.users=seedUsers(d.bookings);return d;};
if(!DB.users){DB.users=seedUsers(DB.bookings);save();}

function ensureUser(contact,source){
  if(!contact||!contact.email||findUser(contact.email))return null;
  const u={id:"u"+Date.now(),name:contact.name||contact.email.split("@")[0],email:contact.email,phone:contact.phone||"",country:contact.country||"Other",role:"Guest",status:"Active",created:TODAY,lastLogin:TODAY,notes:source||""};
  DB.users.push(u);save();return u;
}
function activity(email){
  const bs=DB.bookings.filter(b=>lc(b.contact.email)===lc(email));const live=bs.filter(b=>b.status!=="Cancelled");
  return {bookings:bs,total:bs.length,villa:bs.filter(b=>b.type==="villa").length,boat:bs.filter(b=>b.type==="boat").length,
    spent:live.filter(b=>b.status!=="Awaiting payment").reduce((a,b)=>a+b.total,0),
    upcoming:live.filter(b=>endOf(b)>=TODAY).length,cancelled:bs.length-live.length,
    last:bs.length?bs.map(b=>b.created).sort().pop():null};
}
const roleBadge=r=>`<span class="badge ${r==="Admin"?"b-gold":r==="Staff"?"b-info":"b-plain"}">${esc(r)}</span>`;
const userStatusBadge=s=>`<span class="badge ${s==="Active"?"b-ok":"b-danger"}">${esc(s)}</span>`;

/* ---------- list page ---------- */
ui.a.uRole=ui.a.uRole||"all";ui.a.uStatus=ui.a.uStatus||"all";ui.a.uQ=ui.a.uQ||"";
function userRows(){
  const a=ui.a,q=lc(a.uQ);
  let list=DB.users.filter(u=>(a.uRole==="all"||(a.uRole==="guest"?u.role==="Guest":u.role!=="Guest"))&&(a.uStatus==="all"||u.status===a.uStatus));
  if(q)list=list.filter(u=>lc(u.name+" "+u.email+" "+u.country+" "+u.phone).includes(q));
  list.sort((x,y)=>(activity(y.email).last||y.created).localeCompare(activity(x.email).last||x.created));
  if(!list.length)return `<tr><td colspan="8" class="muted" style="text-align:center;padding:30px">No users match. Clear the search or change the filters.</td></tr>`;
  return list.map(u=>{const ac=activity(u.email);return `<tr class="clickable" data-a="openUser" data-id="${u.id}">
    <td><b>${esc(u.name)}</b><div class="tiny muted">${esc(u.email)}</div></td><td>${roleBadge(u.role)}</td><td>${esc(u.country)}</td>
    <td style="white-space:nowrap">${u.role==="Guest"?(ac.total?`<b>${ac.total}</b> <span class="tiny muted">(${ac.villa} villa, ${ac.boat} boat)</span>`:`<span class="muted">None</span>`):`<span class="muted">Staff</span>`}</td>
    <td style="white-space:nowrap">${u.role==="Guest"?money(ac.spent):""}</td>
    <td style="white-space:nowrap">${ac.last?fd(ac.last):`<span class="muted">Never</span>`}</td>
    <td style="white-space:nowrap">${fd(u.created,{day:"numeric",month:"short",year:"numeric"})}</td><td>${userStatusBadge(u.status)}</td></tr>`;}).join("");
}
function viewUsers(){
  const a=ui.a,g=DB.users.filter(u=>u.role==="Guest");
  const booked=g.filter(u=>activity(u.email).total>0).length;
  const fresh=g.filter(u=>u.created>=addDays(TODAY,-30)).length;
  const staff=DB.users.filter(u=>u.role!=="Guest");
  const body=`<div class="kpis">
    <div class="kpi"><div class="small muted">Registered guests</div><div class="v">${g.length}</div><div class="s">${g.filter(u=>u.status==="Suspended").length} suspended</div></div>
    <div class="kpi"><div class="small muted">Guests who have booked</div><div class="v">${g.length?Math.round(booked/g.length*100):0}%</div><div class="s">${booked} of ${g.length} guests</div></div>
    <div class="kpi"><div class="small muted">New guests, last 30 days</div><div class="v">${fresh}</div><div class="s">Signed up or booked as new</div></div>
    <div class="kpi"><div class="small muted">Staff accounts</div><div class="v">${staff.length}</div><div class="s">${staff.filter(u=>u.role==="Admin").length} admin, ${staff.filter(u=>u.role==="Staff").length} staff</div></div></div>
  <div class="filters"><div class="segbar" role="group" aria-label="User type">${[["all","All"],["guest","Guests"],["staff","Staff"]].map(t=>`<button class="${a.uRole===t[0]?"on":""}" data-a="uRole" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>
    <label class="field"><span class="sr">Status</span><select class="input" data-on="uStatus">${[["all","Any status"],["Active","Active"],["Suspended","Suspended"]].map(s=>`<option value="${s[0]}" ${a.uStatus===s[0]?"selected":""}>${s[1]}</option>`).join("")}</select></label>
    <label class="field" style="flex:1;min-width:200px"><span class="sr">Search users</span><input class="input" type="search" placeholder="Search name, email, country or phone" value="${esc(a.uQ)}" data-in="uQ"></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Country</th><th>Bookings</th><th>Spent</th><th>Last booking</th><th>Joined</th><th>Status</th></tr></thead><tbody id="u-body">${userRows()}</tbody></table></div>
  <p class="small muted" style="margin-top:10px">Guests are added automatically when they sign in or book with a new email. Click a user to see their activity and manage the account.</p>`;
  return adminShell("Users",`<button class="btn btn-ghost btn-sm" data-a="export">Export CSV</button><button class="btn btn-sm" data-a="userNew">Add user</button>`,body);
}

/* ---------- user drawer ---------- */
function userDrawerHTML(){
  const u=userById(ui.drawer.user);if(!u)return "";const ac=activity(u.email);const me=ui.user&&lc(ui.user.email)===lc(u.email);
  const tile=(l,v)=>`<div class="kpi" style="padding:12px 14px"><div class="tiny muted">${l}</div><div style="font-size:1.25rem;font-weight:700;margin-top:2px">${v}</div></div>`;
  const list=[...ac.bookings].sort((a,b)=>b.created.localeCompare(a.created));
  return `<div class="scrim drawer-scrim" data-a="scrim"><aside class="drawer" role="dialog" aria-modal="true" aria-label="User ${esc(u.name)}">
  <div class="modal-head"><div><p class="small muted">${u.role==="Guest"?"Guest account":"Staff account"}</p><h2 style="font-size:1.5rem">${esc(u.name)}</h2><p class="small muted">${esc(u.email)}</p></div><button class="x" data-a="close" aria-label="Close">&times;</button></div>
  <div style="display:flex;gap:6px;margin-bottom:16px">${roleBadge(u.role)}${userStatusBadge(u.status)}${me?`<span class="badge b-plain">You</span>`:""}</div>
  ${u.role==="Guest"?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">${tile("Bookings",`${ac.total} <span class="tiny muted" style="font-weight:500">(${ac.villa} villa, ${ac.boat} boat)</span>`)}${tile("Total spent",money(ac.spent))}${tile("Upcoming trips",ac.upcoming)}${tile("Cancelled",ac.cancelled)}</div>`:""}
  <dl class="kv" style="grid-template-columns:110px 1fr"><dt>Phone</dt><dd>${esc(u.phone)||"<span class='muted'>Not given</span>"}</dd><dt>Country</dt><dd>${esc(u.country)}</dd><dt>Joined</dt><dd>${fdl(u.created)}</dd><dt>Last sign-in</dt><dd>${u.lastLogin?fdl(u.lastLogin):"Never"}</dd><dt>Last booking</dt><dd>${ac.last?fdl(ac.last):"None yet"}</dd>${u.notes?`<dt>Notes</dt><dd style="font-weight:500">${esc(u.notes)}</dd>`:""}</dl>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:20px 0">
    <button class="btn btn-sm" data-a="userEdit" data-id="${u.id}">Edit details</button>
    ${me?"":(u.status==="Active"?`<button class="btn btn-danger btn-sm" data-a="userToggle" data-id="${u.id}">Suspend</button>`:`<button class="btn btn-soft btn-sm" data-a="userToggle" data-id="${u.id}">Reactivate</button>`)}
    <button class="btn btn-ghost btn-sm" data-a="userReset" data-id="${u.id}">Send password reset</button>
    ${me?"":`<button class="btn btn-ghost btn-sm" data-a="userDelete" data-id="${u.id}">Delete</button>`}
  </div>
  ${u.role==="Guest"?`<h3 style="font-size:1.05rem;margin-bottom:8px">Booking history</h3>${list.length?list.map(b=>`<div class="list-row clickable" style="cursor:pointer" data-a="openBk" data-code="${b.code}"><div><p style="font-weight:600">${esc(bookingTitle(b))}</p><p class="small muted">${b.code}, ${bookingWhen(b)}</p></div><div style="text-align:right"><p class="small">${money(b.total)}</p>${statusBadge(b.status)}</div></div>`).join(""):`<p class="small muted">No bookings yet.</p>`}`:`<p class="small muted">Staff can sign in to this console with their email. ${u.role==="Admin"?"Admins can also manage users.":"Staff can manage bookings, rooms, boats and departures, but not users."}</p>`}
  </aside></div>`;
}
const _drawerHTML=drawerHTML;
drawerHTML=function(){return ui.drawer&&typeof ui.drawer==="object"?userDrawerHTML():_drawerHTML();};

/* ---------- add / edit modal ---------- */
const _modalHTML=modalHTML;
modalHTML=function(){
  const m=ui.modal;if(!m||m.kind!=="user")return _modalHTML();
  const u=m.id?userById(m.id):{name:"",email:"",phone:"",country:"Australia",role:"Guest",status:"Active",notes:""};const d=Object.assign({},u,m.draft||{});
  const me=m.id&&ui.user&&lc(ui.user.email)===lc(u.email);
  return `<div class="scrim" data-a="scrim"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2 style="font-size:1.4rem">${m.id?"Edit user":"Add user"}</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>
  <div class="stack"><div class="grid2"><label class="field"><span>Full name</span><input class="input" id="f-uname" value="${esc(d.name)}"></label><label class="field"><span>Email</span><input class="input" id="f-uemail" type="email" value="${esc(d.email)}"></label></div>
  <div class="grid2"><label class="field"><span>Phone or WhatsApp</span><input class="input" id="f-uphone" value="${esc(d.phone)}" placeholder="+62 812 0000 0000"></label><label class="field"><span>Country</span><select class="input" id="f-ucountry">${COUNTRIES.map(c=>`<option ${d.country===c?"selected":""}>${c}</option>`).join("")}</select></label></div>
  <div class="grid2"><label class="field"><span>Role</span><select class="input" id="f-urole" ${me?"disabled":""}>${["Guest","Staff","Admin"].map(r=>`<option ${d.role===r?"selected":""}>${r}</option>`).join("")}</select></label><label class="field"><span>Status</span><select class="input" id="f-ustatus" ${me?"disabled":""}>${["Active","Suspended"].map(s=>`<option ${d.status===s?"selected":""}>${s}</option>`).join("")}</select></label></div>
  <p class="tiny muted">Guests book on the website. Staff can use this console. Admins can also add and manage users.${me?" You can't change your own role or status.":""}</p>
  <label class="field"><span>Internal notes (optional)</span><textarea class="input" id="f-unotes" rows="2" placeholder="Only staff see this">${esc(d.notes)}</textarea></label>
  ${m.id?"":`<label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="f-uinvite" checked style="accent-color:var(--lagoon)">Email them a link to set their password</label>`}
  ${m.err?`<p class="err" role="alert">${esc(m.err)}</p>`:""}
  <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="userSave">${m.id?"Save changes":"Add user"}</button></div></div></div></div>`;
};

/* ---------- render hook for the Users page ---------- */
const _adminShell=adminShell;
adminShell=function(t,a,b){if(isAdmin())return _adminShell(t,a,b);const keep=ANAV.slice();const i=ANAV.findIndex(n=>n[0]==="users");if(i>=0)ANAV.splice(i,1);try{return _adminShell(t,a,b);}finally{ANAV.length=0;ANAV.push(...keep);}};
const _render=render;
render=function(keepScroll){
  if(ui.mode==="admin"&&ui.user&&ui.user.role==="admin"&&ui.a.view==="users"){
    if(!isAdmin()){ui.a.view="dash";return _render(keepScroll);}
    const y=window.scrollY;
    document.getElementById("app").innerHTML=viewUsers();
    document.getElementById("layer").innerHTML=(ui.drawer?drawerHTML():"")+modalHTML()+(ui.toast?`<div class="toast" role="status">${esc(ui.toast)}</div>`:"");
    window.scrollTo(0,keepScroll?y:0);
    if(typeof renderChat==="function")renderChat();
    return;
  }
  _render(keepScroll);
};

/* ---------- sign-in now checks accounts ---------- */
A.doLogin=el=>{
  const email=document.getElementById("li-email").value.trim(),pw=document.getElementById("li-pw").value;
  if(!/^\S+@\S+\.\S+$/.test(email)){ui.modal.err="Enter a valid email address.";render(true);return;}
  if(pw.length<4){ui.modal.err="Password needs at least 4 characters.";render(true);return;}
  let u=findUser(email);
  if(u&&u.status==="Suspended"){ui.modal.err="This account is suspended. Please contact the resort team.";render(true);return;}
  if(el.dataset.t==="admin"){
    if(!u||u.role==="Guest"){ui.modal.err="There's no staff account for this email. An admin can create one under Users.";render(true);return;}
    u.lastLogin=TODAY;save();
    ui.user={role:"admin",staffRole:u.role,name:u.name,email:u.email};ui.mode="admin";ui.a.view="dash";
  }else{
    let created=false;
    if(!u){const known=DB.bookings.find(b=>lc(b.contact.email)===lc(email));u=ensureUser(known?known.contact:{email,name:email.split("@")[0],country:"Australia"},"Signed up on the website");created=true;}
    u.lastLogin=TODAY;save();
    ui.user={role:"guest",email:u.email,name:u.name,country:u.country};
    ui.modal=null;try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}
    toast(created?"Account created. Welcome, "+u.name.split(" ")[0]+"!":"Signed in as "+u.name);return;
  }
  try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}
  ui.modal=null;render();
};
if(ui.user&&ui.user.role==="admin"&&!ui.user.staffRole){const u=findUser(ui.user.email);ui.user.staffRole=u?u.role:"Admin";}

/* ---------- checkout: block suspended accounts, register new guests ---------- */
const _placeBooking=placeBooking;
placeBooking=function(){
  const f=readForm();const u=findUser(f.email);
  if(u&&u.status==="Suspended"){ui.err="The account for this email is suspended, so it can't book online. Please contact the resort team.";return render(true);}
  const n=DB.bookings.length;_placeBooking();
  if(DB.bookings.length>n){const b=DB.bookings[DB.bookings.length-1];ensureUser(b.contact,"Created at checkout");}
};

/* ---------- actions ---------- */
Object.assign(A,{
  uRole:el=>{ui.a.uRole=el.dataset.t;render(true);},
  openUser:el=>{ui.drawer={user:el.dataset.id};render(true);},
  userNew:()=>{ui.modal={kind:"user"};render(true);},
  userEdit:el=>{ui.modal={kind:"user",id:el.dataset.id};render(true);},
  userSave:()=>{
    const m=ui.modal;const d={name:val("f-uname"),email:val("f-uemail"),phone:val("f-uphone"),country:val("f-ucountry"),role:val("f-urole"),status:val("f-ustatus"),notes:val("f-unotes")};
    m.draft=d;
    if(!d.name){m.err="Enter the user's full name.";return render(true);}
    if(!/^\S+@\S+\.\S+$/.test(d.email)){m.err="Enter a valid email address.";return render(true);}
    const clash=findUser(d.email);if(clash&&clash.id!==m.id){m.err="Another user already has this email.";return render(true);}
    if(m.id){
      const u=userById(m.id);const me=ui.user&&lc(ui.user.email)===lc(u.email);
      if(me){d.role=u.role;d.status=u.status;}
      if(lc(u.email)!==lc(d.email))DB.bookings.forEach(b=>{if(lc(b.contact.email)===lc(u.email))b.contact.email=d.email;});
      Object.assign(u,d);if(me){ui.user.name=u.name;ui.user.email=u.email;try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}}
      save();ui.modal=null;toast("Changes saved for "+u.name);
    }else{
      const invite=document.getElementById("f-uinvite");
      const u=Object.assign({id:"u"+Date.now(),created:TODAY,lastLogin:null},d);DB.users.push(u);save();
      ui.modal=null;ui.drawer={user:u.id};toast(u.name+" added"+(invite&&invite.checked?". Password link sent to "+u.email:""));
    }
  },
  userToggle:el=>{const u=userById(el.dataset.id);u.status=u.status==="Active"?"Suspended":"Active";save();toast(u.status==="Suspended"?u.name+" is suspended and can't sign in or book":u.name+" is active again");},
  userReset:el=>{const u=userById(el.dataset.id);toast("Password reset link sent to "+u.email);},
  userDelete:el=>{const u=userById(el.dataset.id);const ac=activity(u.email);
    if(ac.total){toast(u.name+" has bookings, so the account can't be deleted. Suspend it instead.");return;}
    if(!confirm("Delete "+u.name+"? This can't be undone."))return;
    DB.users=DB.users.filter(x=>x.id!==u.id);save();ui.drawer=null;toast(u.name+" deleted");}
});
/* closing a dialog opened from a drawer returns to the drawer */
A.close=()=>{if(ui.modal)ui.modal=null;else ui.drawer=null;render(true);};
A.scrim=(el,e)=>{if(e.target!==el)return;if(ui.modal)ui.modal=null;else ui.drawer=null;render(true);};
Object.assign(ON,{uStatus:el=>{ui.a.uStatus=el.value;render(true);}});
document.addEventListener("input",e=>{if(e.target.dataset.in==="uQ"){ui.a.uQ=e.target.value;const tb=document.getElementById("u-body");if(tb)tb.innerHTML=userRows();}});
render();
