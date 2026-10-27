"use strict";
const LOGO_MARK="/assets/resort-mark.webp";
const LOGO_BOAT="/assets/boat.webp";

/* ---------- helpers ---------- */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
function todayISO(){const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function addDays(iso,n){const[y,m,d]=iso.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10);}
function diffDays(a,b){return Math.round((Date.parse(b)-Date.parse(a))/864e5);}
function fd(iso,o){return new Date(iso+"T00:00:00Z").toLocaleDateString("en-GB",Object.assign({timeZone:"UTC"},o||{weekday:"short",day:"numeric",month:"short"}));}
function fdl(iso){return fd(iso,{weekday:"short",day:"numeric",month:"short",year:"numeric"});}
function dow(iso){return new Date(iso+"T00:00:00Z").getUTCDay();}
function addMin(t,m){const[h,mm]=t.split(":").map(Number);const x=h*60+mm+m;return pad(Math.floor(x/60)%24)+":"+pad(x%60);}
function durTxt(m){return Math.floor(m/60)+"h "+pad(m%60)+"m";}
const TODAY=todayISO();
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function code(prefix){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return prefix+"-"+s;}
function seatLabels(cap){const L="ABCD",out=[];for(let i=0;i<cap;i++)out.push(Math.floor(i/4)+1+L[i%4]);return out;}

/* ---------- seed data ---------- */
function seed(){
  const R=rng(42);
  const villas=[
    {id:"v1",name:"Siberut Point Villa",island:"Siberut",pal:0,active:true,
     blurb:"Clifftop timber villa above a left-hand reef break, ten minutes by dinghy from the jetty. Built for surfers and anyone who likes waking up to the sound of the reef.",
     amen:["Full board meals","Surf guide on request","Starlink Wi-Fi","Solar power","Snorkel gear","Airport pickup in Padang"],
     rooms:[{id:"r1",name:"Ocean suite",bed:"King bed",cap:2,price:240,active:true},{id:"r2",name:"Reef bungalow",bed:"Two single beds",cap:2,price:180,active:true},{id:"r3",name:"Family loft",bed:"King bed and two singles",cap:4,price:320,active:true}]},
    {id:"v2",name:"Sipora Lagoon Villa",island:"Sipora",pal:1,active:true,
     blurb:"Stilt rooms over a calm, shallow lagoon. The easiest crossing from Padang and the gentlest water for families, swimmers and first-time paddlers.",
     amen:["Breakfast and dinner","Kayaks and paddleboards","Starlink Wi-Fi","Kids' room","Yoga deck","Laundry"],
     rooms:[{id:"r4",name:"Lagoon stilt room",bed:"Queen bed",cap:2,price:200,active:true},{id:"r5",name:"Garden twin",bed:"Two single beds",cap:2,price:150,active:true},{id:"r6",name:"Two-bedroom house",bed:"Two queen beds",cap:4,price:360,active:true}]},
    {id:"v3",name:"Pagai Ridge Villa",island:"North Pagai",pal:2,active:true,
     blurb:"The quiet one. A hillside villa in the far south with jungle walks, fishing trips with local boatmen and empty sunset beaches.",
     amen:["Full board meals","Fishing trips","Jungle walks","Solar power","Starlink Wi-Fi"],
     rooms:[{id:"r7",name:"Ridge suite",bed:"King bed",cap:2,price:220,active:true},{id:"r8",name:"Hillside cabin",bed:"Queen bed",cap:2,price:170,active:true}]}
  ];
  const ports={PDG:"Padang (Muaro)",SIB:"Siberut (Maileppet)",SIP:"Sipora (Tuapejat)",PAG:"North Pagai (Sikakap)"};
  const routes=[
    {id:"t1",from:"PDG",to:"SIB",mins:225},{id:"t2",from:"SIB",to:"PDG",mins:225},
    {id:"t3",from:"PDG",to:"SIP",mins:200},{id:"t4",from:"SIP",to:"PDG",mins:200},
    {id:"t5",from:"PDG",to:"PAG",mins:300},{id:"t6",from:"PAG",to:"PDG",mins:300}
  ];
  const boats=[
    {id:"b1",name:"KM Mitra Satu",operator:"PT Mitra Mentawai Makmur Maju Mandiri",cap:24,status:"Active"},
    {id:"b2",name:"KM Mitra Dua",operator:"PT Mitra Mentawai Makmur Maju Mandiri",cap:32,status:"Active"},
    {id:"b3",name:"KM Mitra Tiga",operator:"PT Mitra Mentawai Makmur Maju Mandiri",cap:16,status:"Maintenance"}
  ];
  const schedules=[];let sid=1;
  for(let d=-14;d<=45;d++){
    const date=addDays(TODAY,d);
    const plan=[["t1","07:00","b1",65],["t2","13:30","b1",65],["t3","08:00","b2",55],["t4","14:30","b2",55]];
    if([1,3,5].includes(dow(date)))plan.push(["t5","06:30","b2",80],["t6","13:00","b2",80]);
    for(const[r,time,b,price]of plan){
      const boat=boats.find(x=>x.id===b);const labels=seatLabels(boat.cap);
      const fill=d<0?.55+R()*.4:Math.max(0,(.75-d*.018)+R()*.25);
      const n=Math.min(boat.cap-2,Math.floor(boat.cap*fill));
      const taken=labels.filter(()=>R()<n/boat.cap);
      schedules.push({id:"s"+(sid++),routeId:r,date,time,boatId:b,price,taken,status:"Scheduled"});
    }
  }
  const people=[["Anna Keller","anna.keller@example.com","Germany"],["Liam O'Connor","liam.oc@example.com","Ireland"],["Mia Tanaka","mia.t@example.com","Japan"],["Jack Robertson","jackr@example.com","Australia"],["Chloé Martin","chloe.m@example.com","France"],["Daniel Ng","dng@example.com","Singapore"],["Sofia Rossi","sofia.r@example.com","Italy"],["Noah Smith","noah.s@example.com","United States"],["Emma de Vries","emma.dv@example.com","Netherlands"],["Oliver Brown","oliverb@example.com","United Kingdom"]];
  const bookings=[];
  const rooms=villas.flatMap(v=>v.rooms.map(r=>({...r,villaId:v.id})));
  const occupied={};
  function free(roomId,ci,co){return !(occupied[roomId]||[]).some(([a,b])=>a<co&&ci<b);}
  let tries=0;
  while(bookings.length<30&&tries<600){
    tries++;
    const room=rooms[Math.floor(R()*rooms.length)];
    const ci=addDays(TODAY,Math.floor(R()*48)-16);const n=2+Math.floor(R()*6);const co=addDays(ci,n);
    if(!free(room.id,ci,co))continue;
    (occupied[room.id]=occupied[room.id]||[]).push([ci,co]);
    const p=people[Math.floor(R()*people.length)];
    const sub=room.price*n,tax=Math.round(sub*.1);
    const created=addDays(TODAY,-Math.floor(R()*14)-(ci<TODAY?diffDays(ci,TODAY):0)%10);
    let status=co<=TODAY?"Completed":ci<=TODAY?"Checked in":(R()<.15?"Awaiting payment":"Paid");
    if(R()<.06)status="Cancelled";
    bookings.push({code:code("MI"),type:"villa",villaId:room.villaId,roomId:room.id,checkIn:ci,checkOut:co,guests:Math.min(room.cap,1+Math.floor(R()*room.cap)),nights:n,subtotal:sub,tax,total:sub+tax,
      contact:{name:p[0],email:p[1],country:p[2],phone:"+00 000 0000"},status,pay:status==="Awaiting payment"?"Bank transfer (VA)":["Card","Card","PayPal","QRIS"][Math.floor(R()*4)],created,log:[[created,"Booking placed online"]]});
  }
  /* boat bookings drawn from seats already taken */
  const nat=p=>p[2];
  const FN=["Lucas","Hannah","Ben","Grace","Tom","Ella","Sam","Zoe","Max","Lea","Kai","Ruby"],LN=["Walker","Becker","Murphy","Sato","Dubois","Tan","Bianchi","Miller","Jansen","Clarke"];
  for(const s of schedules){
    const off=diffDays(TODAY,s.date);
    if(off<-10||off>24||s.taken.length<2||R()>.38)continue;
    const p=people[Math.floor(R()*people.length)];
    const k=1+Math.floor(R()*Math.min(3,s.taken.length));
    const start=Math.floor(R()*(s.taken.length-k+1));
    const seats=s.taken.slice(start,start+k);
    const pax=seats.map((_,i)=>({name:i===0?p[0]:FN[Math.floor(R()*FN.length)]+" "+LN[Math.floor(R()*LN.length)],nat:i===0?p[2]:people[Math.floor(R()*people.length)][2],passport:String.fromCharCode(65+Math.floor(R()*26))+Math.floor(1e7+R()*8e7)}));
    const total=(s.price+3)*k;
    const status=s.date<TODAY?"Completed":(R()<.12?"Awaiting payment":"Paid");
    const created=addDays(s.date<TODAY?s.date:TODAY,-Math.floor(R()*12)-1);
    bookings.push({code:code("MB"),type:"boat",legs:[{sid:s.id,seats}],pax,total,contact:{name:p[0],email:p[1],country:p[2],phone:"+00 000 0000"},status,pay:status==="Awaiting payment"?"QRIS":"Card",created,log:[[created,"Booking placed online"]]});
  }
  /* a guaranteed upcoming trip for the demo guest */
  const ci=addDays(TODAY,9),co=addDays(TODAY,15);
  if(free("r1",ci,co)){
    bookings.push({code:"MI-ANNA1",type:"villa",villaId:"v1",roomId:"r1",checkIn:ci,checkOut:co,guests:2,nights:6,subtotal:1440,tax:144,total:1584,contact:{name:"Anna Keller",email:"anna.keller@example.com",country:"Germany",phone:"+49 151 0000 0000"},status:"Paid",pay:"Card",created:addDays(TODAY,-3),log:[[addDays(TODAY,-3),"Booking placed online"],[addDays(TODAY,-3),"Paid by card"]]});
  }
  return {villas,ports,routes,boats,schedules,bookings,blocks:[],settings:{rate:16300,tax:10,portFee:3,pay:{"Card":true,"PayPal":true,"Bank transfer (VA)":true,"QRIS":true}},v:1};
}

/* ---------- storage ---------- */
const LS="mentawai-indah-proto-v1";
let DB;
function load(){try{const s=localStorage.getItem(LS);if(s){DB=JSON.parse(s);return;}}catch(e){}DB=seed();save();}
function save(){try{localStorage.setItem(LS,JSON.stringify(DB));}catch(e){}}
load();

/* ---------- UI state ---------- */
const ui={
  mode:"site", view:"home", p:{}, cur:"USD", tab:"villa", user:null, modal:null, drawer:null, toast:null,
  vs:{villa:"all",ci:addDays(TODAY,14),co:addDays(TODAY,18),guests:2},
  bs:{trip:"oneway",from:"PDG",to:"SIB",date:addDays(TODAY,14),ret:addDays(TODAY,18),pax:2},
  cart:null, selRoom:null, err:null,
  a:{view:"dash",bkType:"all",bkStatus:"all",bkQ:"",calStart:TODAY,depRoute:"all",depFrom:TODAY}
};
try{const u=sessionStorage.getItem("mi-user");if(u){ui.user=JSON.parse(u);if(ui.user.role==="admin")ui.mode="admin";}}catch(e){}

/* ---------- lookups ---------- */
const villaById=id=>DB.villas.find(v=>v.id===id);
function roomById(id){for(const v of DB.villas){const r=v.rooms.find(r=>r.id===id);if(r)return Object.assign({villa:v},r);}return null;}
const sch=id=>DB.schedules.find(s=>s.id===id);
const route=id=>DB.routes.find(r=>r.id===id);
const boat=id=>DB.boats.find(b=>b.id===id);
const port=k=>DB.ports[k]||k;
const portShort=k=>(DB.ports[k]||k).split(" (")[0];
function routeFor(from,to){return DB.routes.find(r=>r.from===from&&r.to===to);}
function seatsLeft(s){return boat(s.boatId).cap-s.taken.length;}
function money(usd){
  if(ui.cur==="IDR")return "Rp "+(Math.round(usd*DB.settings.rate/1000)*1000).toLocaleString("id-ID");
  return "$"+Math.round(usd).toLocaleString("en-US");
}
function roomFree(roomId,ci,co,ignore){
  for(const b of DB.bookings){if(b.type!=="villa"||b.roomId!==roomId||b.status==="Cancelled"||b.code===ignore)continue;if(b.checkIn<co&&ci<b.checkOut)return false;}
  for(const k of DB.blocks){if(k.roomId===roomId&&k.date>=ci&&k.date<co)return false;}
  return true;
}
function minPrice(v){const a=v.rooms.filter(r=>r.active).map(r=>r.price);return a.length?Math.min(...a):0;}
function statusBadge(s){const m={"Paid":"b-ok","Completed":"b-plain","Checked in":"b-info","Boarded":"b-info","Awaiting payment":"b-warn","Cancelled":"b-danger","Scheduled":"b-info","Departed":"b-plain","Active":"b-ok","Maintenance":"b-warn","Retired":"b-plain"};return `<span class="badge ${m[s]||"b-plain"}">${esc(s)}</span>`;}

/* ---------- illustrations ---------- */
const PAL=[
  {s1:"#CBEDF1",s2:"#F1FAF8",sun:"#F6D58E",sea1:"#7FD0C7",sea2:"#2A9893",land:"#2F6B57",hut:"#8A6A44"},
  {s1:"#F5E4D2",s2:"#FAF5EC",sun:"#F2BE84",sea1:"#8CCDD2",sea2:"#3A8FA0",land:"#3D6650",hut:"#7A5A3A"},
  {s1:"#DCE2F3",s2:"#F3F2F9",sun:"#F1C9A9",sea1:"#93C7D8",sea2:"#3E7FA0",land:"#35574F",hut:"#6E5440"}];
let gid=0;
function scene(p,v,label){
  const c=PAL[p%3];const id="g"+(gid++);v=v||0;const ix=[160,240,200][v%3];const sx=[320,90,300][v%3];
  return `<svg class="scene" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label||"Illustration")}">
<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.s1}"/><stop offset="1" stop-color="${c.s2}"/></linearGradient>
<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sea1}"/><stop offset="1" stop-color="${c.sea2}"/></linearGradient></defs>
<rect width="400" height="260" fill="url(#${id}s)"/><circle cx="${sx}" cy="${62+v*8}" r="28" fill="${c.sun}" opacity=".85"/>
<path d="M${ix-150} 172 Q${ix-60} ${118+v*6} ${ix+30} 150 T${ix+170} 172 Z" fill="${c.land}" opacity=".88"/>
<rect y="168" width="400" height="92" fill="url(#${id}w)"/>
<path d="M0 192 Q50 186 100 192 T200 192 T300 192 T400 192" stroke="#fff" stroke-opacity=".55" fill="none" stroke-width="1.5"/>
<path d="M0 220 Q50 214 100 220 T200 220 T300 220 T400 220" stroke="#fff" stroke-opacity=".35" fill="none" stroke-width="1.5"/>
<g transform="translate(${ix+20} 118)"><path d="M-30 24 L0 0 L30 24 Z" fill="${c.hut}"/><rect x="-21" y="24" width="42" height="22" fill="#F5ECDD"/><rect x="-6" y="32" width="12" height="14" fill="${c.hut}" opacity=".55"/><path d="M-18 46v14M18 46v14M0 46v14" stroke="${c.hut}" stroke-width="2.5"/></g>
<g transform="translate(${ix-70} 96)" stroke="${c.land}" fill="none" stroke-linecap="round"><path d="M0 74 Q8 36 2 0" stroke-width="3.5"/><path d="M2 0 q-18 -6 -32 8 M2 0 q16 -10 32 2 M2 0 q-12 8 -22 24 M2 0 q14 6 22 22" stroke-width="3.5"/></g>
</svg>`;
}
function qr(text){
  let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  const R=rng(h>>>0),n=21;let r="";
  const finder=(x,y)=>`<rect x="${x}" y="${y}" width="7" height="7" fill="#12293A"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3" fill="#12293A"/>`;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){if((x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12))continue;if(R()<.48)r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="#12293A"/>`;}
  return `<svg class="qr" viewBox="0 0 21 21" shape-rendering="crispEdges" role="img" aria-label="Booking QR code"><rect width="21" height="21" fill="#fff"/>${finder(0,0)}${finder(14,0)}${finder(0,14)}${r}</svg>`;
}
const ICON={
  villa:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/></svg>`,
  boat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h18l-2.5 4h-13z"/><path d="M6 15V10h9l3 5"/><path d="M9 10V7h4"/></svg>`,
  swap:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/></svg>`,
  dash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  cal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  gear:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`
};

/* ================= CUSTOMER SITE ================= */
function siteHeader(){
  const v=ui.view,isV=["villas","villa"].includes(v)||(v==="checkout"&&ui.cart&&ui.cart.type==="villa"),isB=["boats","seats"].includes(v)||(v==="checkout"&&ui.cart&&ui.cart.type==="boat");
  return `<header class="site-head"><div class="wrap head-in">
  <button class="brand" data-a="go" data-v="home" aria-label="Mentawai Indah home"><img src="${LOGO_MARK}" alt=""><span><b>Mentawai Indah</b><small>Villas and fast boat, Mentawai Islands</small></span></button>
  <nav class="main-nav" aria-label="Main">
    <button data-a="go" data-v="villas" class="${isV?"on":""}">Villa stays</button>
    <button data-a="go" data-v="boats" class="${isB?"on":""}">Fast boat</button>
    <button data-a="go" data-v="trips" class="${v==="trips"?"on":""}">My trips</button>
  </nav>
  <div class="head-tools">
    <label class="cur"><span class="sr">Currency</span><select data-on="cur"><option ${ui.cur==="USD"?"selected":""}>USD</option><option ${ui.cur==="IDR"?"selected":""}>IDR</option></select></label>
    ${ui.user?`<button class="btn btn-ghost btn-sm" data-a="signout">Sign out ${esc(ui.user.name.split(" ")[0])}</button>`:`<button class="btn btn-sm" data-a="signin">Sign in</button>`}
  </div></div></header>`;
}
function siteFooter(){
  return `<footer class="site-foot"><div class="wrap foot-grid">
  <div class="foot-logo" style="text-align:center"><img src="${LOGO_MARK}" alt="" style="width:96px;margin:0 auto 6px"><b style="display:block;color:#12293A;font-size:.8rem;letter-spacing:.04em;line-height:1.3">PT MENTAWAI INDAH<br>TIRTA RAYA ABADI</b></div>
  <div class="small muted stack">
    <p>Villas operated by PT Mentawai Indah Tirta Raya Abadi. Fast boat crossings operated by PT Mitra Mentawai Makmur Maju Mandiri.</p>
    <p>Questions about a booking: hello@mentawaiindah.example, WhatsApp +62 000 0000 0000.</p>
    <p class="tiny">Clickable prototype. Prices, villa names and schedules are placeholders.</p>
  </div>
  <div class="foot-boat"><img src="${LOGO_BOAT}" alt="PT Mitra Mentawai Makmur Maju Mandiri"></div>
  </div></footer>`;
}
function villaSearchFields(btnLabel){
  const s=ui.vs;
  return `<div class="sgrid v">
    <label class="field"><span>Villa</span><select class="input" data-on="vs" data-k="villa"><option value="all">All three villas</option>${DB.villas.filter(v=>v.active).map(v=>`<option value="${v.id}" ${s.villa===v.id?"selected":""}>${esc(v.name)}, ${esc(v.island)}</option>`).join("")}</select></label>
    <label class="field"><span>Check-in</span><input class="input" type="date" min="${TODAY}" value="${s.ci}" data-on="vs" data-k="ci"></label>
    <label class="field"><span>Check-out</span><input class="input" type="date" min="${addDays(s.ci,1)}" value="${s.co}" data-on="vs" data-k="co"></label>
    <label class="field"><span>Guests</span><select class="input" data-on="vs" data-k="guests">${[1,2,3,4].map(n=>`<option ${+s.guests===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <button class="btn" data-a="searchVillas">${btnLabel||"Search villas"}</button>
  </div>`;
}
function boatSearchFields(btnLabel){
  const s=ui.bs;const opts=k=>Object.keys(DB.ports).map(p=>`<option value="${p}" ${k===p?"selected":""}>${esc(port(p))}</option>`).join("");
  return `<div class="trip-toggle" role="group" aria-label="Trip type">
     <button class="seg" aria-pressed="${s.trip==="oneway"}" data-a="trip" data-t="oneway">One way</button>
     <button class="seg" aria-pressed="${s.trip==="return"}" data-a="trip" data-t="return">Return</button></div>
   <div class="sgrid b">
    <label class="field"><span>From</span><select class="input" data-on="bs" data-k="from">${opts(s.from)}</select></label>
    <button class="swap" data-a="swap" aria-label="Swap from and to">${ICON.swap}</button>
    <label class="field"><span>To</span><select class="input" data-on="bs" data-k="to">${opts(s.to)}</select></label>
    <label class="field"><span>Departure</span><input class="input" type="date" min="${TODAY}" value="${s.date}" data-on="bs" data-k="date"></label>
    <label class="field"><span>Return</span><input class="input" type="date" min="${s.date}" value="${s.ret}" data-on="bs" data-k="ret" ${s.trip==="oneway"?"disabled":""}></label>
    <label class="field"><span>Passengers</span><select class="input" data-on="bs" data-k="pax">${[1,2,3,4,5,6].map(n=>`<option ${+s.pax===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <button class="btn" data-a="searchBoats">${btnLabel||"Find departures"}</button>
  </div>`;
}
function heroSVG(){
  return `<svg class="horizon" viewBox="0 -140 1440 720" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>
  <linearGradient id="hsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sea1)"/><stop offset="1" stop-color="var(--sea2)"/></linearGradient></defs>
  <rect y="-140" width="1440" height="720" fill="url(#hsky)"/>
  <circle cx="1180" cy="190" r="70" fill="var(--gold)" opacity=".16"/>
  <path d="M0 330 L0 290 Q60 280 120 290 Q190 276 250 298 Q300 306 330 330 Z" fill="var(--land-2)" opacity=".75"/>
  <path d="M760 332 Q820 268 900 296 Q950 280 990 332 Z" fill="var(--land)"/>
  <path d="M1040 334 Q1090 290 1150 312 Q1180 306 1200 334 Z" fill="var(--land)"/>
  <path d="M1250 336 Q1300 298 1360 318 Q1400 314 1420 336 Z" fill="var(--land)"/>
  <rect y="330" width="1440" height="250" fill="url(#hsea)"/>
  <g stroke="#fff" fill="none" stroke-width="1.5"><path d="M0 372 Q60 364 120 372 T240 372 T360 372 T480 372 T600 372 T720 372 T840 372 T960 372 T1080 372 T1200 372 T1320 372 T1440 372" stroke-opacity=".45"/>
  <path d="M0 430 Q80 420 160 430 T320 430 T480 430 T640 430 T800 430 T960 430 T1120 430 T1280 430 T1440 430" stroke-opacity=".3"/></g>
  <path id="crossing" d="M240 342 C420 430 640 440 860 344" fill="none" stroke="var(--lagoon-ink)" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
  <path d="M600 418 C800 420 1000 400 1120 348" fill="none" stroke="var(--lagoon-ink)" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" opacity=".7"/>
  <path d="M760 412 C980 430 1200 410 1330 350" fill="none" stroke="var(--lagoon-ink)" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" opacity=".55"/>
  <g font-family="Figtree, sans-serif" font-size="15" font-weight="600" fill="var(--ink)">
    <circle cx="240" cy="340" r="5" fill="var(--ink)"/><text x="232" y="326" text-anchor="end">Padang</text>
    <circle cx="860" cy="342" r="5" fill="var(--gold)"/><text x="870" y="282">Siberut</text>
    <circle cx="1120" cy="346" r="5" fill="var(--gold)"/><text x="1112" y="296">Sipora</text>
    <circle cx="1330" cy="348" r="5" fill="var(--gold)"/><text x="1300" y="306" text-anchor="middle">North Pagai</text>
  </g>
  <g id="hboat"><path d="M-16 -2 L16 -2 L11 6 L-12 6 Z" fill="var(--ink)"/><path d="M-8 -2 L-6 -9 L6 -9 L9 -2" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.5"/>
  <animateMotion dur="7s" begin="0.4s" fill="freeze" keyPoints="0;0.62" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .2 1"><mpath href="#crossing"/></animateMotion></g>
  </svg>`;
}
function viewHome(){
  const v=DB.villas.filter(v=>v.active);
  const r=DB.routes.filter(r=>r.from==="PDG");
  return `${siteHeader()}
  <div class="hero">${heroSVG()}<div class="wrap hero-copy"><h1>Three villas across the Mentawai islands, and the boat that gets you there</h1></div></div>
  <div class="wrap"><div class="searchbox">
   <div class="tabs" role="tablist">
     <button class="tab" role="tab" aria-selected="${ui.tab==="villa"}" data-a="tab" data-t="villa">${ICON.villa} Villa stays</button>
     <button class="tab" role="tab" aria-selected="${ui.tab==="boat"}" data-a="tab" data-t="boat">${ICON.boat} Fast boat</button>
   </div>
   ${ui.tab==="villa"?villaSearchFields():boatSearchFields()}
  </div></div>
  <section class="band"><div class="wrap">
    <div class="sec-head"><div><h2>Our villas</h2><p class="muted" style="margin-top:6px">Each sits on a different island with its own jetty. Pick the island first, the room second.</p></div><button class="btn btn-ghost" data-a="go" data-v="villas">See availability</button></div>
    <div class="villa-cards">${v.map(x=>`<button class="vcard" data-a="openVilla" data-id="${x.id}"><div class="pic">${scene(x.pal,0,x.name)}</div><div class="body"><h3>${esc(x.name)}</h3><p class="muted small">${esc(x.island)}, ${x.rooms.filter(r=>r.active).length} rooms</p><p class="small">${esc(x.blurb.split(". ")[0])}.</p><div class="foot"><span class="price">${money(minPrice(x))} <small>per night from</small></span><span class="link">View rooms</span></div></div></button>`).join("")}</div>
  </div></section>
  <section class="band boatband"><div class="wrap inner">
    <div class="boat-badge"><img src="${LOGO_BOAT}" alt="PT Mitra Mentawai Makmur Maju Mandiri"></div>
    <div><h2>Fast boat from Padang</h2><p class="muted" style="margin-top:8px;max-width:58ch">Crossings are run by our boat partner, PT Mitra Mentawai Makmur Maju Mandiri. Pick your seat when you book. You can book seats on their own, or add them after you book a villa.</p>
    <div class="routes-list">${r.map(x=>{const lo=Math.min(...DB.schedules.filter(s=>s.routeId===x.id&&s.date>=TODAY).map(s=>s.price));return `<button class="route-tile" data-a="quickRoute" data-to="${x.to}"><b>Padang to ${esc(portShort(x.to))}</b><span class="small muted">About ${durTxt(x.mins)}${x.to==="PAG"?", Mon, Wed and Fri":", daily"}</span><span class="price" style="font-size:1rem">${money(lo)} <small>per seat</small></span></button>`}).join("")}</div></div>
  </div></section>
  <section class="band"><div class="wrap"><div class="sec-head"><h2>How booking works</h2></div>
    <ol class="steps"><li><b>Choose your villa and dates</b><span class="muted">Rooms show live availability. Booked nights can't be selected.</span></li>
    <li><b>Add your boat seats</b><span class="muted">Pick a departure and choose seats on the boat plan. Passport details go on the passenger list.</span></li>
    <li><b>Pay and get your vouchers</b><span class="muted">Card, PayPal, bank transfer or QRIS. Vouchers with QR codes arrive by email straight away.</span></li></ol>
  </div></section>
  ${siteFooter()}`;
}
function viewVillas(){
  const s=ui.vs;const n=diffDays(s.ci,s.co);
  const list=DB.villas.filter(v=>v.active&&(s.villa==="all"||v.id===s.villa));
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><span>Villa stays</span></div>
  <h1 style="font-size:2rem;margin-bottom:16px">Villa stays</h1>
  <div class="strip">${villaSearchFields("Update search")}</div>
  <p class="muted small" style="margin-bottom:14px">${fd(s.ci)} to ${fd(s.co)}, ${n} night${n>1?"s":""}, ${s.guests} guest${s.guests>1?"s":""}</p>
  ${list.map(v=>{const rooms=v.rooms.filter(r=>r.active&&r.cap>=s.guests);const free=rooms.filter(r=>roomFree(r.id,s.ci,s.co));const lo=free.length?Math.min(...free.map(r=>r.price)):null;
    return `<article class="result"><div class="pic">${scene(v.pal,0,v.name)}</div><div class="mid"><h3>${esc(v.name)}</h3><p class="muted small">${esc(v.island)} island, Mentawai</p><p class="small" style="max-width:56ch">${esc(v.blurb)}</p><div class="chips">${v.amen.slice(0,4).map(a=>`<span class="chip">${esc(a)}</span>`).join("")}</div></div>
    <div class="end"><div>${free.length?`<span class="badge b-ok">${free.length} of ${rooms.length} rooms free</span>`:`<span class="badge b-danger">Fully booked</span>`}</div>
    <div>${lo!=null?`<div class="price">${money(lo)}<small> per night</small></div><div class="tiny muted">${money(lo*n)} for ${n} nights before tax</div>`:`<div class="small muted">Try other dates</div>`}
    <button class="btn btn-block" style="margin-top:10px" data-a="openVilla" data-id="${v.id}">${free.length?"Choose a room":"See rooms"}</button></div></div></article>`;}).join("")||`<div class="empty"><h3>No villas match</h3><p>Change the villa filter to see all three islands.</p></div>`}
  </main>${siteFooter()}`;
}
function viewVilla(){
  const v=villaById(ui.p.id);const s=ui.vs;const n=Math.max(1,diffDays(s.ci,s.co));
  const sel=ui.selRoom&&v.rooms.find(r=>r.id===ui.selRoom&&roomFree(r.id,s.ci,s.co)&&r.cap>=s.guests);
  const sub=sel?sel.price*n:0,tax=Math.round(sub*DB.settings.tax/100);
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><button data-a="go" data-v="villas">Villa stays</button><span>/</span><span>${esc(v.name)}</span></div>
  <div class="gallery"><div>${scene(v.pal,0,v.name)}</div><div>${scene(v.pal,1,"Room view")}</div><div>${scene((v.pal+1)%3,2,"Sunset at the jetty")}</div></div>
  <div class="detail"><div>
    <h1 style="font-size:2.2rem">${esc(v.name)}</h1><p class="muted" style="margin-top:4px">${esc(v.island)} island, Mentawai. Reached by fast boat from Padang.</p>
    <p style="margin-top:16px;max-width:62ch">${esc(v.blurb)}</p>
    <div class="chips" style="margin:16px 0 28px">${v.amen.map(a=>`<span class="chip">${esc(a)}</span>`).join("")}</div>
    <h2 style="margin-bottom:6px">Rooms</h2><p class="muted small" style="margin-bottom:14px">Availability for ${fd(s.ci)} to ${fd(s.co)}, ${s.guests} guest${s.guests>1?"s":""}.</p>
    ${v.rooms.filter(r=>r.active).map((r,i)=>{const free=roomFree(r.id,s.ci,s.co);const fits=r.cap>=s.guests;const ok=free&&fits;
      return `<div class="room ${sel&&sel.id===r.id?"sel":""} ${ok?"":"off"}"><div class="pic">${scene(v.pal,i,r.name)}</div>
      <div><h3 style="font-size:1.1rem">${esc(r.name)}</h3><p class="small muted">${esc(r.bed)}, sleeps ${r.cap}</p>${!fits?`<p class="small err">Sleeps ${r.cap}, you searched for ${s.guests}</p>`:!free?`<p class="small err">Booked on some of these nights</p>`:`<p class="small" style="color:var(--ok);font-weight:600">Free for all ${n} nights</p>`}</div>
      <div class="r-end" style="text-align:right"><div class="price">${money(r.price)}<small> per night</small></div><button class="btn btn-sm ${sel&&sel.id===r.id?"":"btn-ghost"}" style="margin-top:8px" data-a="pickRoom" data-id="${r.id}" ${ok?"":"disabled"}>${sel&&sel.id===r.id?"Selected":"Select"}</button></div></div>`;}).join("")}
  </div>
  <aside class="summary"><h3 style="margin-bottom:12px">Your stay</h3>
    <div class="grid2" style="gap:10px"><label class="field"><span>Check-in</span><input class="input" type="date" min="${TODAY}" value="${s.ci}" data-on="vs" data-k="ci" data-r="1"></label><label class="field"><span>Check-out</span><input class="input" type="date" min="${addDays(s.ci,1)}" value="${s.co}" data-on="vs" data-k="co" data-r="1"></label></div>
    <label class="field" style="margin-top:10px"><span>Guests</span><select class="input" data-on="vs" data-k="guests" data-r="1">${[1,2,3,4].map(x=>`<option ${+s.guests===x?"selected":""}>${x}</option>`).join("")}</select></label>
    <div style="margin-top:14px">${sel?`<div class="sum-row"><span>${esc(sel.name)}</span><span></span></div><div class="sum-row"><span class="muted">${money(sel.price)} x ${n} nights</span><span>${money(sub)}</span></div><div class="sum-row"><span class="muted">Tax and service (${DB.settings.tax}%)</span><span>${money(tax)}</span></div><div class="sum-row sum-total"><span>Total</span><span>${money(sub+tax)}</span></div>`:`<p class="muted small">Select a room to see the price for your dates.</p>`}</div>
    <button class="btn btn-block" style="margin-top:14px" data-a="villaCheckout" ${sel?"":"disabled"}>Continue to checkout</button>
    <p class="tiny muted" style="margin-top:10px">Free cancellation up to 14 days before check-in.</p>
  </aside></div></main>${siteFooter()}`;
}
function legBar(){
  if(!ui.cart||ui.cart.type!=="boat")return "";const c=ui.cart;const legs=c.trip==="return"?2:1;let h=`<div class="legbar">`;
  for(let i=0;i<legs;i++){const l=c.legs[i];const from=i===0?c.from:c.to,to=i===0?c.to:c.from;const done=l&&l.seats.length===c.pax;
    h+=`<span class="leg ${ui.p.leg===i&&ui.view!=="checkout"?"on":""} ${done?"done":""}">${i===0?"Departure":"Return"}: ${esc(portShort(from))} to ${esc(portShort(to))}${l?", "+fd(sch(l.sid).date)+" "+sch(l.sid).time:""}${done?", seats "+l.seats.join(" "):""}</span>`;}
  return h+`</div>`;
}
function viewBoats(){
  const s=ui.bs;const leg=ui.p.leg||0;
  const from=leg===0?s.from:s.to,to=leg===0?s.to:s.from,date=leg===0?s.date:s.ret;
  const r=routeFor(from,to);
  const deps=r?DB.schedules.filter(x=>x.routeId===r.id&&x.date===date&&x.status==="Scheduled"&&boat(x.boatId).status==="Active").sort((a,b)=>a.time.localeCompare(b.time)):[];
  const start=addDays(date,-3)<TODAY?TODAY:addDays(date,-3);
  const strip=r?Array.from({length:8},(_,i)=>{const d=addDays(start,i);const ds=DB.schedules.filter(x=>x.routeId===r.id&&x.date===d&&x.status==="Scheduled");const lo=ds.length?Math.min(...ds.map(x=>x.price)):null;
    return `<button class="dchip ${d===date?"on":""}" data-a="pickDate" data-d="${d}" data-leg="${leg}"><b>${fd(d)}</b><span>${lo!=null?money(lo):"No crossing"}</span></button>`}).join(""):"";
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><span>Fast boat</span></div>
  <h1 style="font-size:2rem;margin-bottom:16px">${leg===1?"Choose your return crossing":"Fast boat"}</h1>
  ${leg===0?`<div class="strip">${boatSearchFields("Update search")}</div>`:legBar()}
  ${!r?`<div class="empty"><h3>No crossing on this route</h3><p>Boats run between Padang and each island. Pick Padang as one end of the trip.</p></div>`:`
  <h2 style="font-size:1.35rem;margin-bottom:12px">${esc(port(from))} to ${esc(port(to))}</h2>
  <div class="datestrip" aria-label="Nearby dates">${strip}</div>
  ${deps.length?deps.map(d=>{const b=boat(d.boatId),left=seatsLeft(d),ok=left>=s.pax;
    return `<article class="dep"><div><div class="dep-times"><div><div class="t">${d.time}</div><div class="small muted">${esc(portShort(from))}</div></div><div class="dep-line"><span>${durTxt(r.mins)}, direct</span></div><div style="text-align:right"><div class="t">${addMin(d.time,r.mins)}</div><div class="small muted">${esc(portShort(to))}</div></div></div>
    <div class="dep-meta"><span class="chip">${esc(b.name)}</span><span class="chip">${b.cap} seats, reserved seating</span><span class="chip">1 surfboard per person included</span>${left<=6?`<span class="badge b-warn">${left} seats left</span>`:`<span class="badge b-ok">${left} seats left</span>`}</div></div>
    <div class="dep-end"><div class="price">${money(d.price)}<small> per seat</small></div><div class="tiny muted">${money(d.price*s.pax)} for ${s.pax} passenger${s.pax>1?"s":""}</div><button class="btn" data-a="pickDep" data-id="${d.id}" data-leg="${leg}" ${ok?"":"disabled"}>${ok?"Choose seats":"Not enough seats"}</button></div></article>`;}).join("")
  :`<div class="empty"><h3>No crossing on ${fd(date)}</h3><p>${r.to==="PAG"||r.from==="PAG"?"North Pagai runs on Mondays, Wednesdays and Fridays.":"Pick another day from the dates above."}</p></div>`}`}
  </main>${siteFooter()}`;
}
function viewSeats(){
  const c=ui.cart,leg=ui.p.leg||0,l=c.legs[leg],d=sch(l.sid),b=boat(d.boatId),r=route(d.routeId);
  const labels=seatLabels(b.cap);const rows=Math.ceil(b.cap/4);let map="";
  for(let i=0;i<rows;i++){const seat=j=>{const lab=labels[i*4+j];if(!lab)return `<span></span>`;const taken=d.taken.includes(lab),on=l.seats.includes(lab);
      return `<button class="seat ${on?"on":""}" data-a="seat" data-s="${lab}" ${taken?"disabled aria-label='Seat "+lab+" taken'":`aria-pressed="${on}" aria-label="Seat ${lab}"`}>${lab}</button>`;};
    map+=`<div class="seatrow">${seat(0)}${seat(1)}<span class="rn">${i+1}</span>${seat(2)}${seat(3)}</div>`;}
  const needReturn=c.trip==="return"&&leg===0;const done=l.seats.length===c.pax;
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><button data-a="backToDeps" data-leg="${leg}">Fast boat</button><span>/</span><span>Seats</span></div>
  <h1 style="font-size:2rem;margin-bottom:14px">Choose ${c.pax} seat${c.pax>1?"s":""}</h1>${legBar()}
  <div class="detail"><div class="panel"><div class="hull"><div class="helm">Helm</div>${map}</div>
    <div class="legend"><span><i></i>Free</span><span><i class="s"></i>Your seat</span><span><i class="t"></i>Taken</span></div>
    <p class="small muted" style="text-align:center;margin-top:10px">Front rows are drier, back rows ride smoother in a swell.</p></div>
  <aside class="summary"><h3>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</h3><p class="muted small" style="margin:4px 0 12px">${fdl(d.date)}, departs ${d.time}, ${esc(b.name)}</p>
    <div class="sum-row"><span class="muted">Seats</span><span>${l.seats.length?l.seats.join(", "):"None yet"}</span></div>
    <div class="sum-row"><span class="muted">${money(d.price)} x ${c.pax}</span><span>${money(d.price*c.pax)}</span></div>
    <p class="small" style="margin-top:8px">${done?"All seats chosen.":`Pick ${c.pax-l.seats.length} more.`}</p>
    <button class="btn btn-block" style="margin-top:12px" data-a="seatsNext" data-leg="${leg}" ${done?"":"disabled"}>${needReturn?"Choose return crossing":"Continue to checkout"}</button>
    <button class="btn btn-ghost btn-block" style="margin-top:8px" data-a="backToDeps" data-leg="${leg}">Change departure</button>
  </aside></div></main>${siteFooter()}`;
}
function cartTotals(){
  const c=ui.cart;
  if(c.type==="villa"){const r=roomById(c.roomId);const n=diffDays(c.ci,c.co);const sub=r.price*n,tax=Math.round(sub*DB.settings.tax/100);return{lines:[[`${money(r.price)} x ${n} nights`,sub],[`Tax and service (${DB.settings.tax}%)`,tax]],total:sub+tax,sub,tax,n};}
  const lines=[];let t=0;c.legs.forEach((l,i)=>{const d=sch(l.sid);lines.push([`${i?"Return":"Departure"} fare, ${money(d.price)} x ${c.pax}`,d.price*c.pax]);t+=d.price*c.pax;});
  const fee=DB.settings.portFee*c.pax*c.legs.length;lines.push([`Port fee, ${money(DB.settings.portFee)} per person per crossing`,fee]);return{lines,total:t+fee};
}
function viewCheckout(){
  if(!isGuest())return `${siteHeader()}<main class="wrap page"><div class="empty"><h3>Sign in to check out</h3><p>Your booking is saved to your account so you can find your vouchers later in My trips. New guests can create an account with just an email and password.</p><button class="btn" data-a="checkoutSignin">Sign in to continue</button></div></main>${siteFooter()}`;
  const c=ui.cart,t=cartTotals(),u=ui.user&&ui.user.role==="guest"?ui.user:{};const f=c.form||{};
  const val=(k,d)=>esc(f[k]!=null?f[k]:(d||""));
  const countries=["Australia","France","Germany","Indonesia","Ireland","Italy","Japan","Netherlands","Singapore","United Kingdom","United States","Other"];
  const cSel=(k,d)=>`<select class="input" data-f="${k}">${countries.map(x=>`<option ${(f[k]||d)===x?"selected":""}>${x}</option>`).join("")}</select>`;
  let what="";
  if(c.type==="villa"){const r=roomById(c.roomId);what=`<h3>${esc(r.villa.name)}</h3><p class="muted small" style="margin:4px 0 10px">${esc(r.name)}, ${c.guests} guest${c.guests>1?"s":""}<br>${fdl(c.ci)} to ${fdl(c.co)}</p>`;}
  else what=c.legs.map((l,i)=>{const d=sch(l.sid),r=route(d.routeId);return `<h3 style="font-size:1.05rem">${esc(portShort(r.from))} to ${esc(portShort(r.to))}</h3><p class="muted small" style="margin:2px 0 10px">${fdl(d.date)}, ${d.time}, seats ${l.seats.join(", ")}</p>`;}).join("");
  const methods=[["Card","Visa, Mastercard, Amex. Confirmed instantly."],["PayPal","Pay with your PayPal balance or card."],["Bank transfer (VA)","Indonesian virtual account. Confirmed when paid."],["QRIS","Scan with any Indonesian e-wallet or bank app."]].filter(m=>DB.settings.pay[m[0]]);
  const pm=f.pay||methods[0][0];
  return `${siteHeader()}<main class="wrap page">
  <div class="crumbs"><button data-a="go" data-v="home">Home</button><span>/</span><span>Checkout</span></div>
  <h1 style="font-size:2rem;margin-bottom:16px">Checkout</h1>${c.type==="boat"?legBar():""}
  <div class="detail"><div id="ckform">
    <section class="panel"><h3>Contact details</h3><p class="small muted" style="margin:-8px 0 14px">We send vouchers and boat updates here.</p>
      <div class="grid2"><label class="field"><span>Full name</span><input class="input" data-f="name" autocomplete="name" value="${val("name",u.name)}"></label>
      <label class="field"><span>Email</span><input class="input" type="email" data-f="email" autocomplete="email" value="${val("email",u.email)}"></label>
      <label class="field"><span>WhatsApp or phone</span><input class="input" data-f="phone" autocomplete="tel" placeholder="+44 7700 900000" value="${val("phone")}"></label>
      <label class="field"><span>Country of residence</span>${cSel("country",u.country||"Australia")}</label></div>
      ${c.type==="villa"?`<label class="field" style="margin-top:14px"><span>Anything we should know? (optional)</span><textarea class="input" rows="2" data-f="note" placeholder="Dietary needs, arrival time, surfboards">${val("note")}</textarea></label>`:""}
    </section>
    ${c.type==="boat"?`<section class="panel"><h3>Passengers</h3><p class="small muted" style="margin:-8px 0 4px">Names must match passports. The harbour master checks the passenger list before departure.</p>
      ${Array.from({length:c.pax},(_,i)=>`<div class="pax"><p style="font-weight:700;margin-bottom:10px">Passenger ${i+1}, seat ${c.legs.map(l=>l.seats[i]).join(" and ")}</p><div class="grid3">
      <label class="field"><span>Full name</span><input class="input" data-f="p${i}name" value="${val("p"+i+"name",i===0?u.name:"")}"></label>
      <label class="field"><span>Nationality</span>${cSel("p"+i+"nat",u.country||"Australia")}</label>
      <label class="field"><span>Passport number</span><input class="input" data-f="p${i}pp" value="${val("p"+i+"pp")}"></label></div></div>`).join("")}</section>`:""}
    <section class="panel"><h3>Payment</h3><div class="pay-opts">${methods.map(m=>`<label class="pay-opt"><input type="radio" name="pay" data-f="pay" value="${m[0]}" ${pm===m[0]?"checked":""}><span><b>${m[0]}</b><span class="small muted">${m[1]}</span></span></label>`).join("")}</div>
      ${pm==="Card"?`<div class="grid3" style="margin-top:14px"><label class="field" style="grid-column:span 1"><span>Card number</span><input class="input" inputmode="numeric" placeholder="4242 4242 4242 4242" data-f="cc" value="${val("cc")}"></label><label class="field"><span>Expiry</span><input class="input" placeholder="MM / YY" data-f="exp" value="${val("exp")}"></label><label class="field"><span>CVC</span><input class="input" placeholder="123" data-f="cvc" value="${val("cvc")}"></label></div><p class="tiny muted" style="margin-top:8px">Prototype: any numbers work, nothing is charged.</p>`:""}
      <label style="display:flex;gap:10px;align-items:flex-start;margin-top:16px" class="small"><input type="checkbox" data-f="terms" ${f.terms?"checked":""} style="margin-top:4px;accent-color:var(--lagoon)"><span>I agree to the booking terms and the cancellation policy${c.type==="boat"?", and I understand crossings can be rescheduled for weather":""}.</span></label>
      ${ui.err?`<p class="err" role="alert" style="margin-top:12px">${esc(ui.err)}</p>`:""}
    </section></div>
  <aside class="summary"><h3 style="margin-bottom:10px">Summary</h3>${what}
    ${t.lines.map(l=>`<div class="sum-row"><span class="muted">${l[0]}</span><span>${money(l[1])}</span></div>`).join("")}
    <div class="sum-row sum-total"><span>Total</span><span>${money(t.total)}</span></div>
    ${ui.cur==="IDR"?`<p class="tiny muted">Charged in IDR at Rp ${DB.settings.rate.toLocaleString("id-ID")} per USD.</p>`:""}
    <button class="btn btn-block" style="margin-top:14px" data-a="pay">${pm==="Card"||pm==="PayPal"?"Pay "+money(t.total):"Place booking"}</button>
  </aside></div></main>${siteFooter()}`;
}
function voucherHTML(b){
  let rows="",title="";
  if(b.type==="villa"){const r=roomById(b.roomId);title=r.villa.name;
    rows=`<dt>Room</dt><dd>${esc(r.name)}</dd><dt>Check-in</dt><dd>${fdl(b.checkIn)}, from 14:00</dd><dt>Check-out</dt><dd>${fdl(b.checkOut)}, by 11:00</dd><dt>Guests</dt><dd>${b.guests}</dd>`;}
  else{title="Fast boat crossing";rows=b.legs.map((l,i)=>{const d=sch(l.sid),r=route(d.routeId);return `<dt>${i?"Return":"Departure"}</dt><dd>${esc(portShort(r.from))} to ${esc(portShort(r.to))}<br>${fdl(d.date)}, ${d.time}, ${esc(boat(d.boatId).name)}<br>Seats ${l.seats.join(", ")}</dd>`;}).join("")+`<dt>Passengers</dt><dd>${b.pax.map(p=>esc(p.name)).join("<br>")}</dd>`;}
  return `<div class="voucher"><div class="voucher-top"><div style="display:flex;gap:14px;align-items:center"><img src="${b.type==="villa"?LOGO_MARK:LOGO_BOAT}" alt="" style="width:${b.type==="villa"?64:56}px;${b.type==="boat"?"background:#fff;border-radius:50%":""}"><div><p class="small muted">${b.type==="villa"?"Villa voucher":"Boarding voucher"}</p><h2 style="font-size:1.5rem">${esc(title)}</h2></div></div>
  <div style="text-align:right"><p class="small muted">Booking code</p><p style="font-size:1.4rem;font-weight:700;letter-spacing:.04em">${b.code}</p></div></div>
  <div class="voucher-body"><dl class="kv"><dt>Lead guest</dt><dd>${esc(b.contact.name)}</dd>${rows}<dt>Total</dt><dd>${money(b.total)} ${statusBadge(b.status)}</dd><dt>Paid with</dt><dd>${esc(b.pay)}</dd></dl>${qr(b.code)}</div></div>`;
}
function viewConfirm(){
  const b=DB.bookings.find(x=>x.code===ui.p.code);if(!b)return viewHome();
  const pend=b.status==="Awaiting payment";
  let cross="";
  if(b.type==="villa"){const r=roomById(b.roomId);const to=b.villaId==="v1"?"SIB":b.villaId==="v2"?"SIP":"PAG";
    cross=`<div class="crosssell"><div class="boat-mini"><img src="${LOGO_BOAT}" alt=""></div><div style="flex:1;min-width:220px"><h3>Need the boat to ${esc(portShort(to))}?</h3><p class="small muted">Crossings from Padang on ${fd(b.checkIn)} and back on ${fd(b.checkOut)} are open for booking.</p></div><button class="btn" data-a="bookTransfer" data-to="${to}" data-ci="${b.checkIn}" data-co="${b.checkOut}" data-g="${b.guests}">Book boat seats</button></div>`;}
  return `${siteHeader()}<main class="wrap page">
  <div style="max-width:760px;margin:0 auto 20px"><h1 style="font-size:2rem">${pend?"Booking placed, waiting for payment":"You're booked"}</h1>
  <p class="muted" style="margin-top:6px">${pend?`We're holding this for 24 hours. ${b.pay==="QRIS"?"Scan the QR code below with your banking or e-wallet app.":"Transfer to virtual account BCA 8808 1234 5678 9012."}`:`We've emailed the voucher to ${esc(b.contact.email)}. Show the QR code at ${b.type==="villa"?"check-in":"the jetty"}.`}</p>
  ${pend?`<button class="btn btn-soft btn-sm" style="margin-top:12px" data-a="simPay" data-code="${b.code}">Simulate payment received</button>`:""}</div>
  ${voucherHTML(b)}${cross}
  <div style="text-align:center;margin-top:22px"><button class="btn btn-ghost" data-a="go" data-v="trips">Go to my trips</button></div>
  </main>${siteFooter()}`;
}
function viewTrips(){
  if(!ui.user||ui.user.role!=="guest")return `${siteHeader()}<main class="wrap page"><div class="empty"><h3>Sign in to see your trips</h3><p>Your villa stays and boat tickets are kept under the email you booked with.</p><button class="btn" data-a="signin">Sign in</button></div></main>${siteFooter()}`;
  const mine=DB.bookings.filter(b=>b.contact.email.toLowerCase()===ui.user.email.toLowerCase()).sort((a,b)=>startOf(a).localeCompare(startOf(b)));
  const up=mine.filter(b=>endOf(b)>=TODAY&&b.status!=="Cancelled"),past=mine.filter(b=>!up.includes(b));
  const card=b=>{let t,sub;if(b.type==="villa"){const r=roomById(b.roomId);t=r.villa.name;sub=`${esc(r.name)}, ${fd(b.checkIn)} to ${fd(b.checkOut)}`;}else{const d=sch(b.legs[0].sid),r=route(d.routeId);t=`Fast boat, ${portShort(r.from)} to ${portShort(r.to)}${b.legs.length>1?" and back":""}`;sub=`${fd(d.date)}, ${d.time}, ${b.pax.length} passenger${b.pax.length>1?"s":""}`;}
    return `<div class="list-row" style="background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px 18px;margin-bottom:10px"><div><p style="font-weight:700">${esc(t)}</p><p class="small muted">${sub}</p><p class="tiny muted">${b.code}</p></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${statusBadge(b.status)}<button class="btn btn-ghost btn-sm" data-a="showVoucher" data-code="${b.code}">Voucher</button></div></div>`;};
  return `${siteHeader()}<main class="wrap page" style="max-width:860px"><h1 style="font-size:2rem;margin-bottom:6px">My trips</h1><p class="muted" style="margin-bottom:20px">Signed in as ${esc(ui.user.email)}</p>
  <h2 style="font-size:1.3rem;margin-bottom:10px">Upcoming</h2>${up.length?up.map(card).join(""):`<div class="empty"><p>No upcoming trips.</p><button class="btn" data-a="go" data-v="villas">Find a villa</button></div>`}
  ${past.length?`<h2 style="font-size:1.3rem;margin:26px 0 10px">Past and cancelled</h2>${past.map(card).join("")}`:""}</main>${siteFooter()}`;
}
function startOf(b){return b.type==="villa"?b.checkIn:sch(b.legs[0].sid).date;}
function endOf(b){return b.type==="villa"?b.checkOut:sch(b.legs[b.legs.length-1].sid).date;}

/* ================= ADMIN ================= */
const ANAV=[["dash","Overview",ICON.dash],["bookings","Bookings",ICON.list],["calendar","Room calendar",ICON.cal],["rooms","Villas and rooms",ICON.villa],["fleet","Boats",ICON.boat],["deps","Departures",ICON.clock],["settings","Settings",ICON.gear]];
function adminShell(title,actions,body){
  return `<div class="admin"><aside class="side"><div class="brand"><img src="${LOGO_MARK}" alt=""><span><b>Mentawai Indah</b><small>Operations</small></span></div>
  <nav class="side-nav" aria-label="Admin">${ANAV.map(n=>`<button class="${ui.a.view===n[0]?"on":""}" data-a="aview" data-v="${n[0]}">${n[2]}${n[1]}</button>`).join("")}</nav>
  <div class="side-foot"><p class="small" style="padding:0 12px"><b>${esc(ui.user.name)}</b><br><span class="muted">${esc(ui.user.email)}</span></p><button class="btn btn-ghost btn-sm" data-a="viewSite">Open customer site</button><button class="btn btn-ghost btn-sm" data-a="signout">Sign out</button></div></aside>
  <div><div class="mobile-adminbar">${ANAV.map(n=>`<button class="${ui.a.view===n[0]?"on":""}" data-a="aview" data-v="${n[0]}">${n[1]}</button>`).join("")}<button data-a="signout">Sign out</button></div>
  <main class="main"><div class="topbar"><h1>${title}</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${actions||""}</div></div>${body}</main></div></div>`;
}
function bookingTitle(b){if(b.type==="villa"){const r=roomById(b.roomId);return `${r.villa.name}, ${r.name}`;}const d=sch(b.legs[0].sid),r=route(d.routeId);return `${portShort(r.from)} to ${portShort(r.to)}${b.legs.length>1?" and back":""}`;}
function bookingWhen(b){if(b.type==="villa")return `${fd(b.checkIn)} to ${fd(b.checkOut)}`;const d=sch(b.legs[0].sid);return `${fd(d.date)}, ${d.time}`;}
function viewDash(){
  const live=DB.bookings.filter(b=>b.status!=="Cancelled");
  const since=addDays(TODAY,-29);const rev=live.filter(b=>b.created>=since&&b.status!=="Awaiting payment").reduce((a,b)=>a+b.total,0);
  const activeRooms=DB.villas.filter(v=>v.active).flatMap(v=>v.rooms.filter(r=>r.active));let occ=0;
  for(let i=0;i<14;i++){const d=addDays(TODAY,i);for(const r of activeRooms)if(!roomFree(r.id,d,addDays(d,1)))occ++;}
  const occPct=Math.round(occ/(activeRooms.length*14)*100);
  const wk=DB.schedules.filter(s=>s.date>=TODAY&&s.date<addDays(TODAY,7)&&s.status==="Scheduled");const cap=wk.reduce((a,s)=>a+boat(s.boatId).cap,0),sold=wk.reduce((a,s)=>a+s.taken.length,0);
  const pend=live.filter(b=>b.status==="Awaiting payment");
  const days=Array.from({length:14},(_,i)=>addDays(TODAY,i-13));
  const data=days.map(d=>{const x=live.filter(b=>b.created===d&&b.status!=="Awaiting payment");return{d,v:x.filter(b=>b.type==="villa").reduce((a,b)=>a+b.total,0),b:x.filter(b=>b.type==="boat").reduce((a,b)=>a+b.total,0)};});
  const max=Math.max(100,...data.map(x=>x.v+x.b));const W=640,H=200,bw=W/14;
  const bars=data.map((x,i)=>{const hv=x.v/max*(H-30),hb=x.b/max*(H-30);return `<g><title>${fd(x.d)}: villas ${money(x.v)}, boat ${money(x.b)}</title><rect x="${i*bw+8}" y="${H-20-hv}" width="${bw-16}" height="${hv}" rx="3" fill="var(--lagoon)"/><rect x="${i*bw+8}" y="${H-20-hv-hb}" width="${bw-16}" height="${hb}" rx="3" fill="var(--gold)"/>${i%2===1?`<text x="${i*bw+bw/2}" y="${H-4}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${fd(x.d,{day:"numeric",month:"short"})}</text>`:""}</g>`;}).join("");
  const next=DB.schedules.filter(s=>(s.date>TODAY||(s.date===TODAY))&&s.status==="Scheduled").sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,6);
  const arr=live.filter(b=>b.type==="villa"&&b.checkIn>=TODAY&&b.checkIn<=addDays(TODAY,7)).sort((a,b)=>a.checkIn.localeCompare(b.checkIn)).slice(0,6);
  const body=`<div class="kpis">
   <div class="kpi"><div class="small muted">Revenue, last 30 days</div><div class="v">${money(rev)}</div><div class="s">Paid bookings, villas and boat</div></div>
   <div class="kpi"><div class="small muted">Villa occupancy, next 14 nights</div><div class="v">${occPct}%</div><div class="s">${occ} of ${activeRooms.length*14} room-nights</div></div>
   <div class="kpi"><div class="small muted">Boat seats sold, next 7 days</div><div class="v">${sold} / ${cap}</div><div class="s">${wk.length} departures</div></div>
   <div class="kpi"><div class="small muted">Waiting for payment</div><div class="v">${pend.length}</div><div class="s">${money(pend.reduce((a,b)=>a+b.total,0))} held</div></div></div>
  <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>Bookings revenue by day</h3><div class="cal-legend" style="margin:0"><span><i style="background:var(--lagoon)"></i>Villas</span><span><i style="background:var(--gold)"></i>Fast boat</span></div></div>
   <div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:520px;height:auto" role="img" aria-label="Revenue chart, last 14 days">${bars}</svg></div></div>
  <div class="cards2"><div class="card"><div class="card-head"><h3>Next departures</h3><button class="link" data-a="aview" data-v="deps">All departures</button></div>
   ${next.map(s=>{const r=route(s.routeId),b=boat(s.boatId),pct=Math.round(s.taken.length/b.cap*100);return `<div class="list-row"><div style="min-width:0"><p style="font-weight:600">${esc(portShort(r.from))} to ${esc(portShort(r.to))}</p><p class="small muted">${fd(s.date)}, ${s.time}, ${esc(b.name)}</p></div><div style="display:flex;align-items:center;gap:12px"><div><div class="load"><i style="width:${pct}%"></i></div><div class="tiny muted">${s.taken.length} of ${b.cap} seats</div></div><button class="btn btn-ghost btn-sm" data-a="manifest" data-id="${s.id}">Passengers</button></div></div>`;}).join("")}</div>
  <div class="card"><div class="card-head"><h3>Arriving in the next 7 days</h3><button class="link" data-a="aview" data-v="calendar">Room calendar</button></div>
   ${arr.length?arr.map(b=>`<div class="list-row clickable" style="cursor:pointer" data-a="openBk" data-code="${b.code}"><div><p style="font-weight:600">${esc(b.contact.name)}</p><p class="small muted">${esc(bookingTitle(b))}</p></div><div style="text-align:right"><p class="small">${fd(b.checkIn)}</p>${statusBadge(b.status)}</div></div>`).join(""):`<p class="muted small">No check-ins this week.</p>`}</div></div>`;
  return adminShell("Overview",`<span class="badge b-plain">${fdl(TODAY)}</span>`,body);
}
function bookingRows(){
  const a=ui.a,q=a.bkQ.trim().toLowerCase();
  let list=DB.bookings.filter(b=>(a.bkType==="all"||b.type===a.bkType)&&(a.bkStatus==="all"||b.status===a.bkStatus));
  if(q)list=list.filter(b=>(b.code+" "+b.contact.name+" "+b.contact.email+" "+bookingTitle(b)).toLowerCase().includes(q));
  list.sort((x,y)=>startOf(y).localeCompare(startOf(x)));
  if(!list.length)return `<tr><td colspan="7" style="text-align:center;padding:30px" class="muted">No bookings match. Clear the search or pick another status.</td></tr>`;
  return list.map(b=>`<tr class="clickable" data-a="openBk" data-code="${b.code}"><td><b>${b.code}</b></td><td>${b.type==="villa"?"Villa":"Boat"}</td><td>${esc(b.contact.name)}<div class="tiny muted">${esc(b.contact.country)}</div></td><td>${esc(bookingTitle(b))}</td><td style="white-space:nowrap">${bookingWhen(b)}</td><td style="white-space:nowrap">${money(b.total)}</td><td>${statusBadge(b.status)}</td></tr>`).join("");
}
function viewBookings(){
  const a=ui.a;const sts=["all","Awaiting payment","Paid","Checked in","Completed","Cancelled"];
  const body=`<div class="filters"><div class="segbar" role="group" aria-label="Booking type">${[["all","All"],["villa","Villa stays"],["boat","Fast boat"]].map(t=>`<button class="${a.bkType===t[0]?"on":""}" data-a="bkType" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>
   <label class="field"><span class="sr">Status</span><select class="input" data-on="bkStatus">${sts.map(s=>`<option value="${s}" ${a.bkStatus===s?"selected":""}>${s==="all"?"Any status":s}</option>`).join("")}</select></label>
   <label class="field" style="flex:1;min-width:200px"><span class="sr">Search</span><input class="input" type="search" placeholder="Search code, guest name or email" value="${esc(a.bkQ)}" data-in="bkQ"></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Type</th><th>Guest</th><th>Villa or route</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead><tbody id="bk-body">${bookingRows()}</tbody></table></div>`;
  return adminShell("Bookings",`<button class="btn btn-ghost btn-sm" data-a="export">Export CSV</button>`,body);
}
function viewCalendar(){
  const st=ui.a.calStart,days=Array.from({length:21},(_,i)=>addDays(st,i));
  let rows="";
  for(const v of DB.villas){rows+=`<tr class="vrow"><td colspan="${days.length+1}">${esc(v.name)}${v.active?"":" (hidden from site)"}</td></tr>`;
    for(const r of v.rooms){rows+=`<tr><td class="rname">${esc(r.name)}<div class="tiny muted">${money(r.price)} per night${r.active?"":", inactive"}</div></td>`;
      for(const d of days){const b=DB.bookings.find(b=>b.type==="villa"&&b.roomId===r.id&&b.status!=="Cancelled"&&b.checkIn<=d&&d<b.checkOut);const blk=DB.blocks.some(k=>k.roomId===r.id&&k.date===d);
        if(b)rows+=`<td><button class="cell bk ${b.status==="Awaiting payment"?"pend":""}" data-a="openBk" data-code="${b.code}" title="${esc(b.code+", "+b.contact.name)}">${b.checkIn===d||d===st?esc(b.contact.name.split(" ")[0]):""}</button></td>`;
        else if(blk)rows+=`<td><button class="cell blk" data-a="toggleBlock" data-r="${r.id}" data-d="${d}" title="Blocked. Click to open for sale." aria-label="${esc(r.name)} ${d} blocked">x</button></td>`;
        else rows+=`<td><button class="cell" data-a="toggleBlock" data-r="${r.id}" data-d="${d}" title="Free. Click to block." aria-label="${esc(r.name)} ${d} free"></button></td>`;}
      rows+=`</tr>`;}}
  const body=`<div class="filters"><button class="btn btn-ghost btn-sm" data-a="calMove" data-n="-7">Previous week</button><button class="btn btn-ghost btn-sm" data-a="calMove" data-n="0">Today</button><button class="btn btn-ghost btn-sm" data-a="calMove" data-n="7">Next week</button><span class="small muted">${fd(st)} to ${fd(days[20])}</span></div>
  <div class="tbl-wrap"><table class="cal"><thead><tr><th class="rname">Room</th>${days.map(d=>`<th class="${d===TODAY?"today":[0,6].includes(dow(d))?"wk":""}">${fd(d,{weekday:"narrow"})}<br>${fd(d,{day:"numeric"})}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
  <div class="cal-legend"><span><i style="background:var(--lagoon)"></i>Paid or checked in</span><span><i style="background:var(--gold)"></i>Waiting for payment</span><span><i style="background:repeating-linear-gradient(135deg,var(--surface-2) 0 3px,var(--line) 3px 6px)"></i>Blocked (maintenance, owner use)</span><span>Click an empty night to block it, click again to open it.</span></div>`;
  return adminShell("Room calendar","",body);
}
function viewRooms(){
  const body=DB.villas.map(v=>`<section class="villa-block"><div class="vb-head"><div><h2 style="font-size:1.35rem">${esc(v.name)}</h2><p class="small muted">${esc(v.island)}, ${v.rooms.length} rooms</p></div>
   <div style="display:flex;gap:10px;align-items:center"><label class="small" style="display:flex;gap:8px;align-items:center">Show on site <span class="switch"><input type="checkbox" data-on="villaActive" data-id="${v.id}" ${v.active?"checked":""}><span></span></span></label><button class="btn btn-ghost btn-sm" data-a="modal" data-m="villa" data-id="${v.id}">Edit villa</button><button class="btn btn-soft btn-sm" data-a="modal" data-m="room" data-villa="${v.id}">Add room</button></div></div>
   <div class="tbl-wrap"><table><thead><tr><th>Room</th><th>Beds</th><th>Sleeps</th><th>Nightly rate (USD)</th><th>Bookable</th><th></th></tr></thead><tbody>
   ${v.rooms.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.bed)}</td><td>${r.cap}</td><td><input class="input num-in" type="number" min="0" step="5" value="${r.price}" data-on="roomPrice" data-id="${r.id}" aria-label="Nightly rate for ${esc(r.name)}"></td><td><span class="switch"><input type="checkbox" data-on="roomActive" data-id="${r.id}" ${r.active?"checked":""} aria-label="${esc(r.name)} bookable"><span></span></span></td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-a="modal" data-m="room" data-villa="${v.id}" data-id="${r.id}">Edit</button></td></tr>`).join("")}</tbody></table></div></section>`).join("");
  return adminShell("Villas and rooms",`<button class="btn btn-sm" data-a="modal" data-m="villa">Add villa</button>`,body);
}
function viewFleet(){
  const body=`<div class="tbl-wrap"><table><thead><tr><th>Boat</th><th>Operator</th><th>Seats</th><th>Departures, next 30 days</th><th>Status</th><th></th></tr></thead><tbody>
  ${DB.boats.map(b=>{const n=DB.schedules.filter(s=>s.boatId===b.id&&s.date>=TODAY&&s.date<addDays(TODAY,30)&&s.status==="Scheduled").length;return `<tr><td><b>${esc(b.name)}</b></td><td class="small">${esc(b.operator)}</td><td>${b.cap}</td><td>${n}</td><td><select class="input" style="min-height:36px;padding:6px 10px;width:auto" data-on="boatStatus" data-id="${b.id}" aria-label="Status of ${esc(b.name)}">${["Active","Maintenance","Retired"].map(s=>`<option ${b.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-a="modal" data-m="boat" data-id="${b.id}">Edit</button></td></tr>`;}).join("")}</tbody></table></div>
  <p class="small muted" style="margin-top:12px">Boats in maintenance stay on the schedule but their departures are hidden from customers until the boat is active again.</p>
  <h2 style="font-size:1.35rem;margin:28px 0 10px">Routes</h2>
  <div class="tbl-wrap"><table><thead><tr><th>From</th><th>To</th><th>Crossing time</th><th>Departures, next 30 days</th></tr></thead><tbody>${DB.routes.map(r=>`<tr><td>${esc(port(r.from))}</td><td>${esc(port(r.to))}</td><td>${durTxt(r.mins)}</td><td>${DB.schedules.filter(s=>s.routeId===r.id&&s.date>=TODAY&&s.date<addDays(TODAY,30)&&s.status==="Scheduled").length}</td></tr>`).join("")}</tbody></table></div>`;
  return adminShell("Boats",`<button class="btn btn-ghost btn-sm" data-a="modal" data-m="route">Add route</button><button class="btn btn-sm" data-a="modal" data-m="boat">Add boat</button>`,body);
}
function viewDeps(){
  const a=ui.a;const list=DB.schedules.filter(s=>(a.depRoute==="all"||s.routeId===a.depRoute)&&s.date>=a.depFrom).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time)).slice(0,40);
  const body=`<div class="filters"><label class="field"><span>Route</span><select class="input" data-on="depRoute"><option value="all">All routes</option>${DB.routes.map(r=>`<option value="${r.id}" ${a.depRoute===r.id?"selected":""}>${esc(portShort(r.from))} to ${esc(portShort(r.to))}</option>`).join("")}</select></label>
   <label class="field"><span>From date</span><input class="input" type="date" value="${a.depFrom}" data-on="depFrom"></label></div>
  <div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Route</th><th>Boat</th><th>Seats sold</th><th>Fare (USD)</th><th>Status</th><th></th></tr></thead><tbody>
  ${list.length?list.map(s=>{const r=route(s.routeId),b=boat(s.boatId),pct=Math.round(s.taken.length/b.cap*100);const st=s.status==="Cancelled"?"Cancelled":b.status!=="Active"?"Maintenance":s.date<TODAY?"Departed":"Scheduled";
   return `<tr><td style="white-space:nowrap">${fd(s.date)}</td><td>${s.time}</td><td style="white-space:nowrap">${esc(portShort(r.from))} to ${esc(portShort(r.to))}</td><td>${esc(b.name)}</td><td><div class="load"><i style="width:${pct}%"></i></div><span class="tiny muted">${s.taken.length} of ${b.cap}</span></td><td><input class="input num-in" type="number" min="0" value="${s.price}" data-on="depPrice" data-id="${s.id}" aria-label="Fare" ${s.date<TODAY?"disabled":""}></td><td>${statusBadge(st)}</td>
   <td style="white-space:nowrap;text-align:right"><button class="btn btn-ghost btn-sm" data-a="manifest" data-id="${s.id}">Passengers</button> ${s.date>=TODAY?(s.status==="Cancelled"?`<button class="btn btn-ghost btn-sm" data-a="depStatus" data-id="${s.id}">Restore</button>`:`<button class="btn btn-danger btn-sm" data-a="depStatus" data-id="${s.id}">Cancel</button>`):""}</td></tr>`;}).join(""):`<tr><td colspan="8" class="muted" style="text-align:center;padding:30px">No departures from this date. Add one with the button above.</td></tr>`}
  </tbody></table></div><p class="small muted" style="margin-top:10px">Showing up to 40 departures. Change the date to see more.</p>`;
  return adminShell("Departures",`<button class="btn btn-sm" data-a="modal" data-m="dep">Add departures</button>`,body);
}
function viewSettings(){
  const s=DB.settings;
  const body=`<div class="cards2"><div class="card"><h3 style="margin-bottom:14px">Pricing</h3>
   <div class="grid2"><label class="field"><span>Exchange rate, IDR per USD</span><input class="input" type="number" value="${s.rate}" data-on="set" data-k="rate"></label>
   <label class="field"><span>Villa tax and service (%)</span><input class="input" type="number" value="${s.tax}" data-on="set" data-k="tax"></label>
   <label class="field"><span>Port fee per person per crossing (USD)</span><input class="input" type="number" value="${s.portFee}" data-on="set" data-k="portFee"></label></div>
   <p class="small muted" style="margin-top:12px">Rates are stored in USD. Customers who pick IDR see converted prices at this rate.</p></div>
  <div class="card"><h3 style="margin-bottom:14px">Payment methods</h3>${Object.keys(s.pay).map(k=>`<div class="list-row"><span>${k}</span><span class="switch"><input type="checkbox" data-on="payToggle" data-k="${k}" ${s.pay[k]?"checked":""} aria-label="${k}"><span></span></span></div>`).join("")}</div></div>
  <div class="card" style="margin-top:18px"><h3 style="margin-bottom:6px">Demo data</h3><p class="small muted" style="margin-bottom:12px">Changes in this prototype are saved in this browser only. Reset to start from the sample bookings again.</p><button class="btn btn-danger btn-sm" data-a="reset">Reset demo data</button></div>`;
  return adminShell("Settings","",body);
}

/* ---------- modal + drawer content ---------- */
function modalHTML(){
  const m=ui.modal;if(!m)return "";let h="",wide=false;
  const head=t=>`<div class="modal-head"><h2 style="font-size:1.4rem">${t}</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>`;
  if(m.kind==="signin"){
    const tab=m.tab||"guest";
    h=head(tab==="guest"?(m.note?"Sign in to continue":"Sign in to your trips"):"Staff sign in")+`${m.note?`<p class="small" style="background:var(--gold-soft);border-radius:12px;padding:10px 12px;margin:-4px 0 14px">${esc(m.note)}</p>`:""}<div class="segbar login-tabs" role="group"><button class="${tab==="guest"?"on":""}" data-a="loginTab" data-t="guest">Guest</button><button class="${tab==="admin"?"on":""}" data-a="loginTab" data-t="admin">Staff</button></div>
    <div class="stack"><label class="field"><span>Email</span><input class="input" id="li-email" type="email" value="${tab==="guest"?"anna.keller@example.com":"admin@mentawaiindah.example"}"></label>
    <label class="field"><span>Password</span><input class="input" id="li-pw" type="password" value="demo1234"></label>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<button class="btn btn-block" data-a="doLogin" data-t="${tab}">Sign in</button></div>
    <div class="demo-box">${tab==="guest"?"Demo guest account is filled in. Any email works too: you'll see bookings made with that email.":"Demo staff account is filled in. Staff sign-in opens the operations console for bookings, rooms, boats and departures."}</div>`;
  }
  if(m.kind==="voucher"){wide=true;const b=DB.bookings.find(x=>x.code===m.code);h=head("Voucher")+voucherHTML(b)+(b.status==="Awaiting payment"?`<button class="btn btn-soft btn-sm" style="margin-top:14px" data-a="simPay" data-code="${b.code}">Simulate payment received</button>`:"");}
  if(m.kind==="room"){const v=villaById(m.villa);const r=m.id?v.rooms.find(x=>x.id===m.id):{name:"",bed:"",cap:2,price:150,active:true};
    h=head(m.id?"Edit room":"Add room to "+esc(v.name))+`<div class="stack"><label class="field"><span>Room name</span><input class="input" id="f-name" value="${esc(r.name)}" placeholder="Ocean suite"></label>
    <div class="grid2"><label class="field"><span>Beds</span><input class="input" id="f-bed" value="${esc(r.bed)}" placeholder="King bed"></label><label class="field"><span>Sleeps</span><input class="input" id="f-cap" type="number" min="1" max="10" value="${r.cap}"></label></div>
    <label class="field"><span>Nightly rate (USD)</span><input class="input" id="f-price" type="number" min="0" value="${r.price}"></label>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="saveRoom">${m.id?"Save room":"Add room"}</button></div></div>`;}
  if(m.kind==="villa"){const v=m.id?villaById(m.id):{name:"",island:"",blurb:"",amen:[]};
    h=head(m.id?"Edit villa":"Add villa")+`<div class="stack"><div class="grid2"><label class="field"><span>Villa name</span><input class="input" id="f-name" value="${esc(v.name)}"></label><label class="field"><span>Island</span><input class="input" id="f-island" value="${esc(v.island)}"></label></div>
    <label class="field"><span>Description shown to guests</span><textarea class="input" id="f-blurb" rows="3">${esc(v.blurb)}</textarea></label>
    <label class="field"><span>Amenities, separated by commas</span><input class="input" id="f-amen" value="${esc(v.amen.join(", "))}"></label>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="saveVilla">${m.id?"Save villa":"Add villa"}</button></div></div>`;}
  if(m.kind==="boat"){const b=m.id?boat(m.id):{name:"",operator:"PT Mitra Mentawai Makmur Maju Mandiri",cap:24};
    h=head(m.id?"Edit boat":"Add boat")+`<div class="stack"><label class="field"><span>Boat name</span><input class="input" id="f-name" value="${esc(b.name)}" placeholder="KM Mitra Empat"></label>
    <label class="field"><span>Operator</span><input class="input" id="f-op" value="${esc(b.operator)}"></label>
    <label class="field"><span>Passenger seats</span><input class="input" id="f-cap" type="number" min="4" max="80" step="4" value="${b.cap}"></label><p class="tiny muted">Seats are laid out four across (A, B, aisle, C, D).</p>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="saveBoat">${m.id?"Save boat":"Add boat"}</button></div></div>`;}
  if(m.kind==="route"){const po=Object.keys(DB.ports).map(p=>`<option value="${p}">${esc(port(p))}</option>`).join("");
    h=head("Add route")+`<div class="stack"><div class="grid2"><label class="field"><span>From</span><select class="input" id="f-from">${po}</select></label><label class="field"><span>To</span><select class="input" id="f-to">${po}</select></label></div>
    <label class="field"><span>Or add a new port</span><input class="input" id="f-port" placeholder="e.g. Siberut (Muara Sikabaluan)"></label>
    <label class="field"><span>Crossing time (minutes)</span><input class="input" id="f-mins" type="number" value="210"></label>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="saveRoute">Add route</button></div></div>`;}
  if(m.kind==="dep"){
    h=head("Add departures")+`<div class="stack"><label class="field"><span>Route</span><select class="input" id="f-route">${DB.routes.map(r=>`<option value="${r.id}">${esc(port(r.from))} to ${esc(port(r.to))}</option>`).join("")}</select></label>
    <div class="grid2"><label class="field"><span>Boat</span><select class="input" id="f-boat">${DB.boats.filter(b=>b.status!=="Retired").map(b=>`<option value="${b.id}">${esc(b.name)}, ${b.cap} seats</option>`).join("")}</select></label><label class="field"><span>Fare per seat (USD)</span><input class="input" id="f-price" type="number" value="65"></label></div>
    <div class="grid2"><label class="field"><span>First date</span><input class="input" id="f-date" type="date" min="${TODAY}" value="${addDays(TODAY,46)}"></label><label class="field"><span>Departure time</span><input class="input" id="f-time" type="time" value="07:00"></label></div>
    <label class="field"><span>Repeat</span><select class="input" id="f-rep"><option value="1">Once</option><option value="7">Every day for 1 week</option><option value="30">Every day for 30 days</option><option value="w8">Same weekday for 8 weeks</option></select></label>
    ${m.err?`<p class="err">${esc(m.err)}</p>`:""}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" data-a="close">Cancel</button><button class="btn" data-a="saveDep">Add departures</button></div></div>`;}
  if(m.kind==="manifest"){wide=true;const s=sch(m.id),r=route(s.routeId),b=boat(s.boatId);
    const pax=[];for(const bk of DB.bookings){if(bk.type!=="boat"||bk.status==="Cancelled")continue;bk.legs.forEach(l=>{if(l.sid===s.id)l.seats.forEach((seat,i)=>pax.push({seat,p:bk.pax[i],bk}));});}
    pax.sort((x,y)=>x.seat.localeCompare(y.seat,undefined,{numeric:true}));const other=s.taken.length-pax.length;
    h=head("Passenger list")+`<p class="muted" style="margin:-8px 0 14px">${esc(port(r.from))} to ${esc(port(r.to))}, ${fdl(s.date)} at ${s.time}, ${esc(b.name)}. ${s.taken.length} of ${b.cap} seats taken.</p>
    <div class="tbl-wrap"><table><thead><tr><th>Seat</th><th>Name</th><th>Nationality</th><th>Passport</th><th>Booking</th><th>Status</th></tr></thead><tbody>${pax.length?pax.map(x=>`<tr><td><b>${x.seat}</b></td><td>${esc(x.p.name)}</td><td>${esc(x.p.nat)}</td><td>${esc(x.p.passport)}</td><td>${x.bk.code}</td><td>${statusBadge(x.bk.status)}</td></tr>`).join(""):`<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">No online bookings on this departure yet.</td></tr>`}</tbody></table></div>
    ${other>0?`<p class="small muted" style="margin-top:10px">${other} more seat${other>1?"s":""} held by walk-in and agent sales.</p>`:""}
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" data-a="printManifest">Print for harbour master</button></div>`;}
  return `<div class="scrim" data-a="scrim"><div class="modal ${wide?"wide":""}" role="dialog" aria-modal="true">${h}</div></div>`;
}
function drawerHTML(){
  const b=DB.bookings.find(x=>x.code===ui.drawer);if(!b)return "";
  let det="";
  if(b.type==="villa"){const r=roomById(b.roomId);det=`<dt>Villa</dt><dd>${esc(r.villa.name)}</dd><dt>Room</dt><dd>${esc(r.name)}</dd><dt>Stay</dt><dd>${fdl(b.checkIn)} to ${fdl(b.checkOut)}, ${b.nights} nights</dd><dt>Guests</dt><dd>${b.guests}</dd>${b.note?`<dt>Guest note</dt><dd>${esc(b.note)}</dd>`:""}`;}
  else det=b.legs.map((l,i)=>{const d=sch(l.sid),r=route(d.routeId);return `<dt>${i?"Return":"Departure"}</dt><dd>${esc(portShort(r.from))} to ${esc(portShort(r.to))}, ${fdl(d.date)} ${d.time}<br>Seats ${l.seats.join(", ")}</dd>`;}).join("")+`<dt>Passengers</dt><dd>${b.pax.map(p=>`${esc(p.name)}, ${esc(p.nat)}, ${esc(p.passport)}`).join("<br>")}</dd>`;
  const acts=[];
  if(b.status==="Awaiting payment")acts.push(`<button class="btn btn-sm" data-a="bkSet" data-s="Paid">Mark as paid</button>`);
  if(b.status==="Paid")acts.push(`<button class="btn btn-sm" data-a="bkSet" data-s="Checked in">${b.type==="villa"?"Check in guest":"Mark as boarded"}</button>`);
  if(b.status==="Checked in")acts.push(`<button class="btn btn-sm" data-a="bkSet" data-s="Completed">${b.type==="villa"?"Check out":"Complete"}</button>`);
  if(!["Cancelled","Completed"].includes(b.status))acts.push(`<button class="btn btn-danger btn-sm" data-a="bkSet" data-s="Cancelled">Cancel booking</button>`);
  acts.push(`<button class="btn btn-ghost btn-sm" data-a="resend">Resend voucher</button>`);
  return `<div class="scrim drawer-scrim" data-a="scrim"><aside class="drawer" role="dialog" aria-modal="true"><div class="modal-head"><div><p class="small muted">${b.type==="villa"?"Villa stay":"Fast boat"}</p><h2 style="font-size:1.5rem">${b.code}</h2></div><button class="x" data-a="close" aria-label="Close">&times;</button></div>
  <div style="margin-bottom:16px">${statusBadge(b.status)}</div>
  <dl class="kv" style="grid-template-columns:110px 1fr"><dt>Guest</dt><dd>${esc(b.contact.name)}</dd><dt>Email</dt><dd>${esc(b.contact.email)}</dd><dt>Phone</dt><dd>${esc(b.contact.phone)}</dd><dt>Country</dt><dd>${esc(b.contact.country)}</dd>${det}<dt>Total</dt><dd>${money(b.total)}</dd><dt>Payment</dt><dd>${esc(b.pay)}</dd><dt>Booked on</dt><dd>${fdl(b.created)}</dd></dl>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:20px 0">${acts.join("")}</div>
  <h3 style="font-size:1.05rem;margin-bottom:10px">History</h3><div class="timeline">${b.log.map(l=>`<div><b>${fd(l[0])}</b> <span class="muted">${esc(l[1])}</span></div>`).join("")}</div></aside></div>`;
}

/* ---------- render ---------- */
function render(keepScroll){
  if(ui.afterLogin&&!ui.modal){if(isGuest()){const next=ui.afterLogin;ui.afterLogin=null;return next();}ui.afterLogin=null;}
  const y=window.scrollY;let h;
  if(ui.mode==="admin"&&ui.user&&ui.user.role==="admin"){
    h={dash:viewDash,bookings:viewBookings,calendar:viewCalendar,rooms:viewRooms,fleet:viewFleet,deps:viewDeps,settings:viewSettings}[ui.a.view]();
  }else{
    ui.mode="site";
    h=({home:viewHome,villas:viewVillas,villa:viewVilla,boats:viewBoats,seats:viewSeats,checkout:viewCheckout,confirm:viewConfirm,trips:viewTrips}[ui.view]||viewHome)();
  }
  document.getElementById("app").innerHTML=h;
  document.getElementById("layer").innerHTML=(ui.drawer?drawerHTML():"")+modalHTML()+(ui.toast?`<div class="toast" role="status">${esc(ui.toast)}</div>`:"");
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){document.querySelectorAll("animateMotion").forEach(a=>a.remove());}
  window.scrollTo(0,keepScroll?y:0);
  if(typeof renderChat==="function")renderChat();
}
let toastT;
function toast(t){ui.toast=t;clearTimeout(toastT);render(true);toastT=setTimeout(()=>{ui.toast=null;const el=document.querySelector(".toast");if(el)el.remove();},2600);}
function isGuest(){return !!(ui.user&&ui.user.role==="guest");}
function needGuest(next){
  if(isGuest())return next();
  ui.afterLogin=next;
  ui.modal={kind:"signin",tab:"guest",note:"Please sign in to continue to checkout. New here? Enter your email and choose a password, and we'll create your account."};
  render(true);
}
function go(view,p){ui.view=view;ui.p=p||{};ui.err=null;render();}

/* ---------- actions ---------- */
const A={
  go:el=>go(el.dataset.v),
  tab:el=>{ui.tab=el.dataset.t;render(true);},
  trip:el=>{ui.bs.trip=el.dataset.t;render(true);},
  swap:()=>{const s=ui.bs;[s.from,s.to]=[s.to,s.from];render(true);},
  searchVillas:()=>{if(ui.vs.co<=ui.vs.ci)ui.vs.co=addDays(ui.vs.ci,1);ui.selRoom=null;if(ui.vs.villa!=="all")go("villa",{id:ui.vs.villa});else go("villas");},
  searchBoats:()=>{const s=ui.bs;if(s.trip==="return"&&s.ret<s.date)s.ret=s.date;ui.cart=null;go("boats",{leg:0});},
  quickRoute:el=>{ui.bs.from="PDG";ui.bs.to=el.dataset.to;ui.bs.trip="oneway";go("boats",{leg:0});},
  openVilla:el=>{ui.selRoom=null;go("villa",{id:el.dataset.id});},
  pickRoom:el=>{ui.selRoom=el.dataset.id;render(true);},
  villaCheckout:()=>{const s=ui.vs;ui.cart={type:"villa",roomId:ui.selRoom,ci:s.ci,co:s.co,guests:+s.guests,form:{}};needGuest(()=>go("checkout"));},
  pickDate:el=>{const leg=+el.dataset.leg;if(leg===0)ui.bs.date=el.dataset.d;else ui.bs.ret=el.dataset.d;if(ui.bs.ret<ui.bs.date)ui.bs.ret=ui.bs.date;render(true);},
  pickDep:el=>{const leg=+el.dataset.leg,s=ui.bs;
    if(leg===0||!ui.cart)ui.cart={type:"boat",trip:s.trip,pax:+s.pax,from:s.from,to:s.to,legs:[],form:{}};
    ui.cart.legs[leg]={sid:el.dataset.id,seats:[]};ui.cart.legs.length=leg+1;go("seats",{leg});},
  seat:el=>{const l=ui.cart.legs[ui.p.leg||0],s=el.dataset.s;const i=l.seats.indexOf(s);if(i>=0)l.seats.splice(i,1);else{if(l.seats.length>=ui.cart.pax)l.seats.shift();l.seats.push(s);}render(true);},
  seatsNext:el=>{const leg=+el.dataset.leg;if(ui.cart.trip==="return"&&leg===0)go("boats",{leg:1});else needGuest(()=>go("checkout"));},
  backToDeps:el=>go("boats",{leg:+el.dataset.leg}),
  bookTransfer:el=>{Object.assign(ui.bs,{trip:"return",from:"PDG",to:el.dataset.to,date:el.dataset.ci,ret:el.dataset.co,pax:Math.max(1,+el.dataset.g)});ui.tab="boat";ui.cart=null;go("boats",{leg:0});},
  pay:()=>placeBooking(),
  checkoutSignin:()=>needGuest(()=>go("checkout")),
  simPay:el=>{const b=DB.bookings.find(x=>x.code===el.dataset.code);b.status="Paid";b.log.push([TODAY,"Payment received by "+b.pay]);save();if(ui.modal)ui.modal=null;toast("Payment received. Booking "+b.code+" is confirmed.");},
  showVoucher:el=>{ui.modal={kind:"voucher",code:el.dataset.code};render(true);},
  signin:()=>{ui.modal={kind:"signin",tab:"guest"};render(true);},
  loginTab:el=>{ui.modal={kind:"signin",tab:el.dataset.t};render(true);},
  doLogin:el=>{const email=document.getElementById("li-email").value.trim(),pw=document.getElementById("li-pw").value;
    if(!/^\S+@\S+\.\S+$/.test(email)){ui.modal.err="Enter a valid email address.";render(true);return;}
    if(pw.length<4){ui.modal.err="Password needs at least 4 characters.";render(true);return;}
    if(el.dataset.t==="admin"){if(!/mentawaiindah/i.test(email)){ui.modal.err="Staff accounts use a @mentawaiindah address. Try admin@mentawaiindah.example.";render(true);return;}
      ui.user={role:"admin",name:"Rina Siregar",email};ui.mode="admin";ui.a.view="dash";}
    else{const known=DB.bookings.find(b=>b.contact.email.toLowerCase()===email.toLowerCase());ui.user={role:"guest",email,name:known?known.contact.name:email.split("@")[0],country:known?known.contact.country:"Australia"};}
    try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}
    ui.modal=null;if(ui.mode==="admin")render();else toast("Signed in as "+ui.user.name);},
  signout:()=>{ui.user=null;ui.mode="site";ui.drawer=null;try{sessionStorage.removeItem("mi-user");}catch(e){}ui.view="home";render();},
  viewSite:()=>{ui.mode="site";ui.user=null;try{sessionStorage.removeItem("mi-user");}catch(e){}go("home");toast("Signed out of staff console");},
  close:()=>{ui.modal=null;ui.drawer=null;render(true);},
  scrim:(el,e)=>{if(e.target===el){ui.modal=null;ui.drawer=null;render(true);}},
  /* admin */
  aview:el=>{ui.a.view=el.dataset.v;ui.drawer=null;render();},
  openBk:el=>{ui.drawer=el.dataset.code;render(true);},
  bkType:el=>{ui.a.bkType=el.dataset.t;render(true);},
  bkSet:el=>{const b=DB.bookings.find(x=>x.code===ui.drawer),s=el.dataset.s;
    if(s==="Cancelled"&&b.type==="boat")b.legs.forEach(l=>{const d=sch(l.sid);d.taken=d.taken.filter(x=>!l.seats.includes(x));});
    b.status=s;b.log.push([TODAY,{"Paid":"Marked as paid by "+ui.user.name,"Checked in":b.type==="villa"?"Guest checked in":"Passengers boarded","Completed":"Completed","Cancelled":"Cancelled by "+ui.user.name+(b.type==="boat"?", seats released":"")}[s]]);
    save();toast(b.code+": "+s.toLowerCase());},
  resend:()=>toast("Voucher sent again to the guest's email"),
  export:()=>toast("CSV export would download here"),
  printManifest:()=>toast("Passenger list sent to print"),
  calMove:el=>{const n=+el.dataset.n;ui.a.calStart=n===0?TODAY:addDays(ui.a.calStart,n);render(true);},
  toggleBlock:el=>{const r=el.dataset.r,d=el.dataset.d;const i=DB.blocks.findIndex(k=>k.roomId===r&&k.date===d);if(i>=0)DB.blocks.splice(i,1);else DB.blocks.push({roomId:r,date:d});save();render(true);},
  manifest:el=>{ui.modal={kind:"manifest",id:el.dataset.id};render(true);},
  depStatus:el=>{const s=sch(el.dataset.id);s.status=s.status==="Cancelled"?"Scheduled":"Cancelled";save();toast(s.status==="Cancelled"?"Departure cancelled. It's hidden from customers.":"Departure restored");},
  modal:el=>{ui.modal={kind:el.dataset.m,id:el.dataset.id,villa:el.dataset.villa};render(true);},
  saveRoom:()=>{const m=ui.modal,v=villaById(m.villa);const name=val("f-name"),bed=val("f-bed"),cap=+val("f-cap"),price=+val("f-price");
    if(!name){m.err="Give the room a name guests will recognise.";render(true);return;}if(!(cap>0)||!(price>=0)){m.err="Sleeps and rate must be numbers.";render(true);return;}
    if(m.id)Object.assign(v.rooms.find(r=>r.id===m.id),{name,bed,cap,price});else v.rooms.push({id:"r"+Date.now(),name,bed:bed||"Queen bed",cap,price,active:true});
    save();ui.modal=null;toast(m.id?"Room saved":"Room added. It's bookable now.");},
  saveVilla:()=>{const m=ui.modal;const name=val("f-name"),island=val("f-island"),blurb=val("f-blurb"),amen=val("f-amen").split(",").map(s=>s.trim()).filter(Boolean);
    if(!name||!island){m.err="Villa name and island are both needed.";render(true);return;}
    if(m.id)Object.assign(villaById(m.id),{name,island,blurb,amen});else DB.villas.push({id:"v"+Date.now(),name,island,blurb:blurb||"New villa.",amen,pal:DB.villas.length%3,active:false,rooms:[]});
    save();ui.modal=null;toast(m.id?"Villa saved":"Villa added. Add rooms, then switch on Show on site.");},
  saveBoat:()=>{const m=ui.modal;const name=val("f-name"),op=val("f-op"),cap=Math.max(4,Math.round(+val("f-cap")/4)*4);
    if(!name){m.err="Give the boat a name.";render(true);return;}
    if(m.id)Object.assign(boat(m.id),{name,operator:op,cap});else DB.boats.push({id:"b"+Date.now(),name,operator:op,cap,status:"Active"});
    save();ui.modal=null;toast(m.id?"Boat saved":"Boat added");},
  saveRoute:()=>{const m=ui.modal;let from=val("f-from"),to=val("f-to");const np=val("f-port"),mins=+val("f-mins");
    if(np){const k="P"+Date.now().toString(36).slice(-4).toUpperCase();DB.ports[k]=np;to=k;}
    if(from===to){m.err="From and to must be different ports.";render(true);return;}
    if(routeFor(from,to)){m.err="That route already exists.";render(true);return;}
    DB.routes.push({id:"t"+Date.now(),from,to,mins:mins||210});save();ui.modal=null;toast("Route added. Add departures to put it on sale.");},
  saveDep:()=>{const m=ui.modal;const r=val("f-route"),b=val("f-boat"),price=+val("f-price"),date=val("f-date"),time=val("f-time"),rep=val("f-rep");
    if(!date||!time){m.err="Pick a first date and a time.";render(true);return;}
    const dates=rep==="w8"?Array.from({length:8},(_,i)=>addDays(date,i*7)):Array.from({length:+rep},(_,i)=>addDays(date,i));
    let n=0;for(const d of dates){if(DB.schedules.some(s=>s.routeId===r&&s.date===d&&s.time===time))continue;DB.schedules.push({id:"s"+Date.now()+n,routeId:r,date:d,time,boatId:b,price,taken:[],status:"Scheduled"});n++;}
    save();ui.modal=null;ui.a.depRoute=r;ui.a.depFrom=date;toast(n+" departure"+(n===1?"":"s")+" added");},
  reset:()=>{if(!confirm("Reset all demo data?"))return;DB=seed();save();toast("Demo data reset");}
};
function val(id){const e=document.getElementById(id);return e?e.value.trim():"";}
function readForm(){const f=ui.cart.form;document.querySelectorAll("#ckform [data-f]").forEach(e=>{if(e.type==="radio"){if(e.checked)f[e.dataset.f]=e.value;}else if(e.type==="checkbox")f[e.dataset.f]=e.checked;else f[e.dataset.f]=e.value.trim();});return f;}
function placeBooking(){
  const c=ui.cart,f=readForm();
  const need=(k,msg)=>{if(!f[k]){ui.err=msg;return true;}return false;};
  if(need("name","Enter the lead guest's full name.")||need("email","Enter an email so we can send the voucher."))return render(true);
  if(!/^\S+@\S+\.\S+$/.test(f.email)){ui.err="That email address doesn't look complete.";return render(true);}
  if(need("phone","Add a WhatsApp or phone number for day-of-travel updates."))return render(true);
  if(c.type==="boat")for(let i=0;i<c.pax;i++){if(need("p"+i+"name",`Enter passenger ${i+1}'s name as it appears on the passport.`)||need("p"+i+"pp",`Enter passenger ${i+1}'s passport number.`))return render(true);}
  const pm=f.pay||Object.keys(DB.settings.pay).find(k=>DB.settings.pay[k]);
  if(pm==="Card"&&(!f.cc||f.cc.replace(/\D/g,"").length<12)){ui.err="Enter a card number. Any 12 or more digits work in this prototype.";return render(true);}
  if(!f.terms){ui.err="Tick the box to accept the booking terms.";return render(true);}
  /* re-check availability */
  if(c.type==="villa"&&!roomFree(c.roomId,c.ci,c.co)){ui.err="Someone just booked this room for these dates. Pick another room.";return render(true);}
  if(c.type==="boat")for(const l of c.legs){const d=sch(l.sid);if(l.seats.some(s=>d.taken.includes(s))){ui.err="One of your seats was just taken. Go back and pick another.";return render(true);}}
  const t=cartTotals();const instant=pm==="Card"||pm==="PayPal";const contact={name:f.name,email:f.email,phone:f.phone,country:f.country};
  let b;
  if(c.type==="villa"){const r=roomById(c.roomId);b={code:code("MI"),type:"villa",villaId:r.villa.id,roomId:c.roomId,checkIn:c.ci,checkOut:c.co,guests:c.guests,nights:t.n,subtotal:t.sub,tax:t.tax,total:t.total,note:f.note||""};}
  else{b={code:code("MB"),type:"boat",legs:c.legs.map(l=>({sid:l.sid,seats:[...l.seats]})),pax:Array.from({length:c.pax},(_,i)=>({name:f["p"+i+"name"],nat:f["p"+i+"nat"],passport:f["p"+i+"pp"]})),total:t.total};
    c.legs.forEach(l=>sch(l.sid).taken.push(...l.seats));}
  Object.assign(b,{contact,status:instant?"Paid":"Awaiting payment",pay:pm,created:TODAY,log:[[TODAY,"Booking placed online"]].concat(instant?[[TODAY,"Paid by "+pm]]:[])});
  DB.bookings.push(b);save();
  if(!ui.user)ui.user={role:"guest",email:f.email,name:f.name,country:f.country};
  try{sessionStorage.setItem("mi-user",JSON.stringify(ui.user));}catch(e){}

  document.querySelector('[data-a="pay"]').disabled=true;document.querySelector('[data-a="pay"]').textContent="Processing payment";
  setTimeout(()=>{ui.cart=null;go("confirm",{code:b.code});},900);
}
const ON={
  cur:el=>{ui.cur=el.value;render(true);},
  vs:el=>{const s=ui.vs;s[el.dataset.k]=el.dataset.k==="guests"?+el.value:el.value;if(s.co<=s.ci)s.co=addDays(s.ci,1);if(el.dataset.r||el.dataset.k==="ci")render(true);},
  bs:el=>{const s=ui.bs;s[el.dataset.k]=el.dataset.k==="pax"?+el.value:el.value;if(s.ret<s.date)s.ret=s.date;if(el.dataset.k==="date")render(true);},
  bkStatus:el=>{ui.a.bkStatus=el.value;render(true);},
  villaActive:el=>{villaById(el.dataset.id).active=el.checked;save();toast(el.checked?"Villa is live on the site":"Villa hidden from the site");},
  roomActive:el=>{for(const v of DB.villas){const r=v.rooms.find(r=>r.id===el.dataset.id);if(r)r.active=el.checked;}save();toast(el.checked?"Room is bookable":"Room hidden from guests");},
  roomPrice:el=>{for(const v of DB.villas){const r=v.rooms.find(r=>r.id===el.dataset.id);if(r)r.price=Math.max(0,+el.value||0);}save();toast("Rate updated");},
  boatStatus:el=>{boat(el.dataset.id).status=el.value;save();toast(el.value==="Active"?"Boat is active":"Departures on this boat are hidden from customers");},
  depRoute:el=>{ui.a.depRoute=el.value;render(true);},
  depFrom:el=>{ui.a.depFrom=el.value||TODAY;render(true);},
  depPrice:el=>{sch(el.dataset.id).price=Math.max(0,+el.value||0);save();toast("Fare updated");},
  set:el=>{DB.settings[el.dataset.k]=+el.value||0;save();toast("Setting saved");},
  payToggle:el=>{const on=Object.values(DB.settings.pay).filter(Boolean).length;if(!el.checked&&on<=1){el.checked=true;toast("Keep at least one payment method on");return;}DB.settings.pay[el.dataset.k]=el.checked;save();toast(el.dataset.k+(el.checked?" turned on":" turned off"));}
};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el)return;const fn=A[el.dataset.a];if(!fn)return;if(el.dataset.a==="scrim"&&e.target!==el)return;fn(el,e);});
document.addEventListener("change",e=>{const el=e.target.closest("[data-on]");if(el&&ON[el.dataset.on])ON[el.dataset.on](el);
  if(e.target.closest("#ckform")&&e.target.dataset.f==="pay"){readForm();render(true);}});
document.addEventListener("input",e=>{if(e.target.dataset.in==="bkQ"){ui.a.bkQ=e.target.value;const tb=document.getElementById("bk-body");if(tb)tb.innerHTML=bookingRows();}
  if(e.target.closest("#ckform")&&ui.cart)readForm();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&(ui.modal||ui.drawer)){ui.modal=null;ui.drawer=null;render(true);}else if(e.key==="Escape"&&typeof chat!=="undefined"&&chat.open){chat.open=false;renderChat();}});
render();
