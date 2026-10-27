"use strict";
/* ================= PMS CORE =================
   Shared by the guest site and the staff PMS (PRD phase 1):
   legal entities, properties, asset types with booking modes, rate engine,
   one booking (header) holding many items, folio per booking, payments split by legal entity,
   holds with expiry, cancellation policy, invoices per entity, templated messages, audit log. */
const LE_ROOM="le1",LE_BOAT="le2";
const SOURCES=["Consumer app","WhatsApp","Walk-in","Phone","Agent"];
const CURRENCIES=["USD","IDR","EUR","GBP","AUD","SGD","JPY"];
const PIVOT_METHODS=[["Card","Visa, Mastercard, JCB, Amex. Confirmed instantly."],["E-wallet","GoPay, OVO, DANA, ShopeePay. Confirmed instantly."],["Virtual account","BCA, Mandiri, BNI, BRI. Confirmed when paid."],["QRIS","Scan with any banking or e-wallet app. Confirmed when paid."]];
const DESK_METHODS=["Cash","QRIS","Card (EDC)","Bank transfer","Pivot payment link"];
const PORT_OF={v1:"SIB",v2:"SIP",v3:"PAG"};
function hstr(s){let h=7;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h;}
function entityOfType(t){return t==="villa"?LE_ROOM:LE_BOAT;}
function ent(id){return DB.pms.entities.find(e=>e.id===id);}
function depTs(s){return Date.parse(s.date+"T"+s.time+":00+07:00");}
function nowIso(){return new Date().toISOString();}
function wib(ts){return new Date(ts).toLocaleString("en-GB",{timeZone:"Asia/Jakarta",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+" WIB";}
function wibTime(ts){return new Date(ts).toLocaleTimeString("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit"});}
const normPhone=p=>String(p||"").replace(/\D/g,"").replace(/^0/,"62");
function fmtUSD(v){return (v<0?"-$":"$")+Math.abs(Math.round(v)).toLocaleString("en-US");}
const H=ref=>DB.pms&&DB.pms.headers[ref];
function itemsOf(ref){return DB.bookings.filter(b=>b.ref===ref);}

/* ---------- seed and upgrade existing demo data ---------- */
function buildPMS(D){
  const P={v:1,
    entities:[
      {id:LE_ROOM,name:"PT Mentawai Indah Tirta Raya Abadi",short:"Resort",npwp:"01.234.567.8-201.000",prefix:"MI",merchant:"pivot_mi_001",tax:10,svc:0,address:"Jl. Raya Tuapejat, Kepulauan Mentawai, Sumatera Barat"},
      {id:LE_BOAT,name:"PT Mitra Mentawai Makmur Maju Mandiri",short:"Speedboat",npwp:"02.345.678.9-201.000",prefix:"MM",merchant:"pivot_mm_001",tax:0,svc:0,address:"Pelabuhan Muaro, Padang, Sumatera Barat"}],
    properties:[{id:"p1",name:"Mentawai Indah Resort",location:"Siberut, Sipora and North Pagai",tz:"WIB (UTC+7)",entity:LE_ROOM},{id:"p2",name:"Padang Pier speedboat base",location:"Muaro, Padang",tz:"WIB (UTC+7)",entity:LE_BOAT}],
    types:[
      {id:"room",name:"Resort room",mode:"Nightly",unit:"Room per night (check-in and check-out dates)",entity:LE_ROOM,property:"p1",phase:1},
      {id:"boat",name:"Speedboat seat",mode:"Time slot, shared",unit:"Seats on a scheduled departure",entity:LE_BOAT,property:"p2",phase:1},
      {id:"charter",name:"Private speedboat charter",mode:"Time slot, private",unit:"Whole boat for a start and end time",phase:2},
      {id:"dining",name:"Restaurant table",mode:"Table / cover",unit:"Table or covers in a seating",phase:2}],
    rates:{weekendPct:15,minStay:2,
      seasons:[{id:"se1",name:"Christmas and New Year",from:"2026-12-20",to:"2027-01-05",pct:25},{id:"se2",name:"Peak surf season",from:"2027-06-01",to:"2027-08-31",pct:20}],
      los:[{nights:7,pct:10}],promos:[{code:"MENTAWAI10",pct:10,until:addDays(TODAY,90),active:true}],
      cancel:{roomFreeDays:14,roomFeePct:50,boatFreeHours:24,boatFeePct:50}},
    rules:{waHoldMin:120,appHoldHours:24,closeMin:30,depositPct:30,refundApproval:200,fx:{IDR:(D.settings&&D.settings.rate)||16300,EUR:0.92,GBP:0.79,AUD:1.52,SGD:1.34,JPY:150}},
    headers:{},hk:{},tasks:[],orders:[],msgs:[],audit:[],invSeq:{[LE_ROOM]:0,[LE_BOAT]:0},invoices:[],boarded:{},closed:{},
    templates:{
      confirm:{name:"Booking confirmation",en:"Hi {name}, your booking {ref} is confirmed. Total {total}, paid so far {paid}. See you in Mentawai!",id:"Halo {name}, pemesanan {ref} sudah terkonfirmasi. Total {total}, sudah dibayar {paid}. Sampai jumpa di Mentawai!"},
      link:{name:"Payment link",en:"Hi {name}, here is your Pivot payment link for booking {ref}: {link}. We hold your booking until {until}.",id:"Halo {name}, ini link pembayaran Pivot untuk pemesanan {ref}: {link}. Pemesanan Anda kami tahan sampai {until}."},
      paid:{name:"Payment received",en:"Thank you {name}, we received {amount} for booking {ref}.",id:"Terima kasih {name}, kami sudah menerima {amount} untuk pemesanan {ref}."},
      expired:{name:"Hold expired",en:"Hi {name}, the hold on booking {ref} has expired, so the rooms and seats were released. Reply here if you'd like to book again.",id:"Halo {name}, masa tahan pemesanan {ref} sudah habis, jadi kamar dan kursi sudah dilepas. Balas pesan ini jika ingin memesan lagi."},
      prearrival:{name:"Pre-arrival",en:"Hi {name}, we look forward to welcoming you on {date}. Please bring your passport for the speedboat manifest.",id:"Halo {name}, kami menantikan kedatangan Anda pada {date}. Mohon bawa paspor untuk manifes speedboat."},
      cancel:{name:"Item cancelled",en:"Hi {name}, {item} on booking {ref} has been cancelled. Cancellation fee: {fee}.",id:"Halo {name}, {item} pada pemesanan {ref} sudah dibatalkan. Biaya pembatalan: {fee}."},
      weather:{name:"Weather cancellation",en:"Hi {name}, for your safety the {route} speedboat on {date} at {time} is cancelled because of the weather. {action}",id:"Halo {name}, demi keselamatan, speedboat {route} pada {date} pukul {time} dibatalkan karena cuaca. {action}"},
      tickets:{name:"Speedboat QR tickets",en:"Hi {name}, here are your speedboat QR tickets for booking {ref}. Show them at the pier to board.",id:"Halo {name}, ini tiket QR speedboat untuk pemesanan {ref}. Tunjukkan di dermaga saat naik kapal."}}};
  const CC={"Germany":"+49 151","Ireland":"+353 85","Japan":"+81 90","Australia":"+61 412","France":"+33 6","Singapore":"+65 9","Italy":"+39 347","United States":"+1 415","Netherlands":"+31 6","United Kingdom":"+44 7700","Norway":"+47 400","Indonesia":"+62 812"};
  const phoneFor=(email,country)=>(CC[country]||"+62 812")+" "+String(1000000+hstr(email)%8999999).replace(/(\d{3})(\d{4})$/,"$1 $2");
  const users=D.users=D.users||[];
  users.forEach(u=>{if(!u.phone||/000 0000/.test(u.phone))u.phone=phoneFor(u.email,u.country);
    if(u.role==="Admin")u.role="Owner";else if(u.role==="Staff")u.role="Front Desk";
    if(u.role!=="Guest"&&!u.props)u.props=["p1","p2"];if(u.role==="Guest"&&!u.tags)u.tags=[];});
  /* a realistic operating day: guests leaving today are still in-house, and two arrivals are due today */
  D.bookings.forEach(b=>{if(b.type==="villa"&&b.checkOut===TODAY&&b.status==="Completed")b.status="Checked in";});
  const arrP=[["Emma de Vries","emma.dv@example.com","Netherlands"],["Noah Smith","noah.s@example.com","United States"]];const arrRooms=[];
  for(const v of D.villas)for(const r of v.rooms){if(arrRooms.length>=2)break;const co=addDays(TODAY,3);
    if(D.bookings.some(b=>b.type==="villa"&&b.roomId===r.id&&b.status!=="Cancelled"&&b.checkIn<co&&TODAY<b.checkOut))continue;
    if(D.blocks.some(k=>k.roomId===r.id&&k.date>=TODAY&&k.date<co))continue;
    const p=arrP[arrRooms.length];arrRooms.push(r.id);const sub=r.price*3,tax=Math.round(sub*.1);
    D.bookings.push({code:code("MI"),type:"villa",villaId:v.id,roomId:r.id,checkIn:TODAY,checkOut:co,guests:2,nights:3,subtotal:sub,tax,total:sub+tax,contact:{name:p[0],email:p[1],country:p[2],phone:""},status:"Paid",pay:"Card",created:addDays(TODAY,-5),log:[[addDays(TODAY,-5),"Booking placed online"]],depositOnly:true});}
  D.bookings.forEach(b=>{if(!b.contact.phone||/000 0000/.test(b.contact.phone))b.contact.phone=phoneFor(b.contact.email,b.contact.country);});
  [["Sari Wulandari","manager@mentawaiindah.example","Property Manager",["p1","p2"]],["Yudi Pratama","boats@mentawaiindah.example","Boat Operations",["p2"]],["Wayan Sudira","housekeeping@mentawaiindah.example","Housekeeping",["p1"]],["Agus Salim","maintenance@mentawaiindah.example","Maintenance",["p1","p2"]],["Maya Putri","finance@mentawaiindah.example","Finance",["p1","p2"]]]
    .forEach(([name,email,role,props],i)=>{if(!users.some(u=>lc(u.email)===email))users.push({id:"s"+(i+1),name,email,phone:"+62 812 7000 00"+(10+i),country:"Indonesia",role,props,status:"Active",created:addDays(TODAY,-60+i*5),lastLogin:addDays(TODAY,-(i%3)),notes:""});});
  const jack=users.find(u=>lc(u.email)==="jackr@example.com");
  if(jack&&!users.some(u=>lc(u.email)==="jack.robertson@example.com")){
    users.push({id:"udup1",name:"Jack Robertson",email:"jack.robertson@example.com",phone:jack.phone,country:jack.country,role:"Guest",status:"Active",created:addDays(TODAY,-20),lastLogin:addDays(TODAY,-20),notes:"Booked by WhatsApp with a different email",tags:[]});
    const jb=D.bookings.find(b=>lc(b.contact.email)==="jackr@example.com"&&b.type==="boat");if(jb)jb.contact=Object.assign({},jb.contact,{email:"jack.robertson@example.com"});}
  const W=[["Consumer app",45],["WhatsApp",25],["Walk-in",14],["Phone",8],["Agent",8]];
  const pickSrc=k=>{let x=hstr(k)%100;for(const[s,w]of W){if(x<w)return s;x-=w;}return "Consumer app";};
  const mapPay=(p,src)=>src==="Walk-in"?(hstr(p+src)%2?"Cash":"QRIS"):({"Card":"Card","PayPal":"Card","QRIS":"QRIS","Bank transfer (VA)":"Virtual account"}[p]||"Card");
  const guestId=email=>(users.find(u=>u.role==="Guest"&&lc(u.email)===lc(email))||{}).id||null;
  for(const b of D.bookings){
    if(b.ref)continue;
    const ref="BK-"+b.code.split("-")[1];b.ref=ref;
    const src=b.code==="MI-ANNA1"?"Consumer app":pickSrc(b.code);
    const h=P.headers[ref]={ref,guestId:guestId(b.contact.email),email:b.contact.email,name:b.contact.name,phone:b.contact.phone,source:src,created:b.created,createdAt:b.created+"T03:00:00Z",payments:[],charges:[],refunds:[],holdUntil:null,convo:src==="WhatsApp"?"MC-"+(10000+hstr(ref)%89999):null,by:src==="Consumer app"?"Guest (website)":"Budi Santoso (Front Desk)"};
    b.pay=mapPay(b.pay,src);b.contact.guestId=h.guestId;
    if(b.type==="boat"){b.net=b.total;b.tax=0;}
    if(b.status==="Paid")b.status="Confirmed";
    if(["Confirmed","Checked in","Completed"].includes(b.status))h.payments.push({id:"py"+hstr(ref),at:b.created+"T09:00:00Z",method:b.pay,channel:src==="Walk-in"?"Desk":"Pivot",amount:b.total,split:{[entityOfType(b.type)]:b.total},status:"Paid",by:src==="Walk-in"?"Front desk":"Guest"});
    if(b.status==="Awaiting payment")h.holdUntil=Date.now()+(2+hstr(ref)%20)*36e5;
  }
  for(const b of D.bookings.filter(x=>x.depositOnly)){const h=P.headers[b.ref];if(h&&h.payments[0]){const dep=Math.round(b.total*.3);h.payments[0].amount=dep;h.payments[0].split={[LE_ROOM]:dep};h.source="Consumer app";}delete b.depositOnly;}
  /* about 40% of stays get a matching arrival transfer, so the attach rate has data */
  for(const b of D.bookings.filter(x=>x.type==="villa"&&x.status!=="Cancelled")){
    if(hstr(b.code+"t")%100>=40)continue;
    const r=D.routes.find(x=>x.from==="PDG"&&x.to===PORT_OF[b.villaId]);if(!r)continue;
    const s=D.schedules.find(x=>x.routeId===r.id&&x.date===b.checkIn&&x.status==="Scheduled");if(!s)continue;
    const cap=(D.boats.find(x=>x.id===s.boatId)||{}).cap||0;const free=seatLabels(cap).filter(l=>!s.taken.includes(l));
    const k=Math.min(b.guests,free.length);if(!k)continue;const seats=free.slice(0,k);s.taken.push(...seats);
    const total=(s.price+((D.settings&&D.settings.portFee)||3))*k;
    const st=["Checked in","Completed"].includes(b.status)?"Completed":b.status;
    D.bookings.push({code:code("MB"),ref:b.ref,type:"boat",legs:[{sid:s.id,seats}],pax:seats.map((_,i)=>({name:i?["Mila","Tom","Ella","Sam"][i%4]+" "+b.contact.name.split(" ").slice(-1)[0]:b.contact.name,nat:b.contact.country,passport:i&&hstr(b.code+i)%3===0?"":String.fromCharCode(65+hstr(b.code+i)%26)+(1e7+hstr(b.code+"p"+i)%8e7)})),
      net:total,tax:0,total,contact:b.contact,status:st,pay:b.pay,created:b.created,log:[[b.created,"Arrival transfer added"]]});
    const h=P.headers[b.ref];if(["Confirmed","Completed"].includes(st)&&h.payments[0]){h.payments[0].amount+=total;h.payments[0].split[LE_BOAT]=total;}
  }
  D.villas.forEach(v=>v.rooms.forEach(r=>{
    const out=D.bookings.some(b=>b.type==="villa"&&b.roomId===r.id&&b.checkOut===TODAY&&b.status!=="Cancelled");
    P.hk[r.id]=out?"dirty":(hstr(r.id)%4===0?"clean":"inspected");
    if(out)P.tasks.push({id:"t"+r.id,roomId:r.id,type:"Cleaning",status:"Open",due:TODAY,created:TODAY,note:"Guest checks out today",assignee:"Wayan Sudira"});}));
  arrRooms.forEach((rid,i)=>{P.hk[rid]=i===0?"inspected":"clean";});
  const wr="r8",from=addDays(TODAY,3),to=addDays(TODAY,5);let free8=true;
  for(let d=from;d<=to;d=addDays(d,1))if(D.bookings.some(b=>b.type==="villa"&&b.roomId===wr&&b.status!=="Cancelled"&&b.checkIn<=d&&d<b.checkOut))free8=false;
  P.orders.push({id:"WO-1001",roomId:wr,title:"Aircon not cooling, replace compressor",priority:"High",status:"Open",from:free8?from:null,to:free8?to:null,created:addDays(TODAY,-1),by:"Wayan Sudira"});
  if(free8)for(let d=from;d<=to;d=addDays(d,1))D.blocks.push({roomId:wr,date:d,reason:"WO-1001"});
  P.orders.push({id:"WO-1000",roomId:"r2",title:"Replace torn mosquito net",priority:"Low",status:"Done",from:null,to:null,created:addDays(TODAY,-6),by:"Budi Santoso",done:addDays(TODAY,-5)});
  P.audit.push({at:nowIso(),actor:"System",entity:"PMS",id:"-",action:"Go-live: baseline recording started",before:"",after:""});
  return P;
}
function ensurePMS(){if(DB.pms&&DB.pms.v===1)return;DB.pms=buildPMS(DB);save();
  for(const h of Object.values(DB.pms.headers))if(h.created>=addDays(TODAY,-3))notify(h.ref,"confirm",{});save();}
const _coreSeed=seed;
seed=function(){const d=_coreSeed();if(!d.users&&typeof seedUsers==="function")d.users=seedUsers(d.bookings);d.pms=buildPMS(d);return d;};
ensurePMS();
if(ui.user&&ui.user.role==="admin"){const m={Admin:"Owner",Staff:"Front Desk"};if(m[ui.user.staffRole])ui.user.staffRole=m[ui.user.staffRole];}

/* ---------- money and currencies (USD base, guest can view others) ---------- */
try{const c=localStorage.getItem("mi-cur");if(c&&CURRENCIES.includes(c))ui.cur=c;}catch(e){}
money=function(usd){const c=ui.cur||"USD";if(c==="USD"||!DB.pms)return fmtUSD(usd);const r=DB.pms.rules.fx[c]||1,v=usd*r;
  if(c==="IDR")return (v<0?"-":"")+"Rp "+(Math.round(Math.abs(v)/1000)*1000).toLocaleString("id-ID");
  try{return new Intl.NumberFormat("en-GB",{style:"currency",currency:c,maximumFractionDigits:0}).format(v);}catch(e){return c+" "+Math.round(v);}};
ON.cur=el=>{ui.cur=el.value;try{localStorage.setItem("mi-cur",ui.cur);}catch(e){}render(true);};

/* ---------- rate engine (R-06): season, weekend, length of stay, promo code ---------- */
function seasonOf(d){let best=null;for(const s of DB.pms.rates.seasons)if(d>=s.from&&d<=s.to&&(!best||s.pct>best.pct))best=s;return best;}
function promoFind(code){if(!code)return null;const p=DB.pms.rates.promos.find(x=>x.active&&x.code.toUpperCase()===String(code).trim().toUpperCase()&&x.until>=TODAY);return p||null;}
function quoteStay(roomId,ci,co,promo){
  const r=roomById(roomId),R=DB.pms.rates,n=Math.max(0,diffDays(ci,co));const G={};let sub=0;
  for(let i=0;i<n;i++){const d=addDays(ci,i),wk=[5,6].includes(dow(d)),se=seasonOf(d);const p=Math.round(r.price*(1+(wk?R.weekendPct:0)/100)*(1+(se?se.pct:0)/100));sub+=p;
    const k=p+"|"+wk+"|"+(se?se.id:"");(G[k]=G[k]||{p,wk,se,n:0}).n++;}
  const lines=Object.values(G).map(g=>({label:`${g.n} night${g.n>1?"s":""} x ${money(g.p)}${g.wk?", weekend":""}${g.se?", "+g.se.name:""}`,amount:g.p*g.n}));
  let disc=0;const los=R.los.filter(l=>n>=l.nights).sort((a,b)=>b.pct-a.pct)[0];
  if(los){const a=Math.round(sub*los.pct/100);lines.push({label:`${los.nights}+ nights, ${los.pct}% off`,amount:-a});disc+=a;}
  const pr=promoFind(promo);if(pr){const a=Math.round((sub-disc)*pr.pct/100);lines.push({label:`Promo ${pr.code}, ${pr.pct}% off`,amount:-a});disc+=a;}
  const net=sub-disc,E=ent(LE_ROOM),tax=Math.round(net*E.tax/100),svc=Math.round(net*E.svc/100);
  return {lines,net,tax,svc,total:net+tax+svc,nights:n,minStayOk:n>=R.minStay};
}
function quoteBoat(sids,pax){
  const lines=[];let net=0;
  sids.forEach((sid,i)=>{const s=sch(sid),r=route(s.routeId);lines.push({label:`${i?"Return":"Departure"} ${portShort(r.from)} to ${portShort(r.to)}, ${pax} x ${money(s.price)}`,amount:s.price*pax});net+=s.price*pax;});
  const fee=(DB.settings.portFee||0)*pax*sids.length;if(fee){lines.push({label:`Port fee, ${pax} x ${sids.length} crossing${sids.length>1?"s":""}`,amount:fee});net+=fee;}
  const E=ent(LE_BOAT),tax=Math.round(net*E.tax/100),svc=Math.round(net*E.svc/100);
  return {lines,net,tax,svc,total:net+tax+svc};
}
function saleOpen(s){return s&&s.status==="Scheduled"&&boat(s.boatId).status==="Active"&&Date.now()<depTs(s)-DB.pms.rules.closeMin*6e4;}

/* ---------- lifecycle ---------- */
function itemLife(b){return {"Awaiting payment":"Hold","Paid":"Confirmed","Confirmed":"Confirmed","Checked in":"In use","Boarded":"In use","Completed":"Completed","Cancelled":"Cancelled","No-show":"No-show"}[b.status]||b.status;}
function headerStatus(ref){const it=itemsOf(ref),h=H(ref);if(!it.length)return "Cancelled";const L=it.map(itemLife);
  if(L.every(x=>x==="Cancelled"||x==="No-show"))return h&&h.expired?"Expired":"Cancelled";
  if(L.includes("Hold"))return "Hold";if(L.includes("In use"))return "In use";
  if(L.every(x=>["Completed","Cancelled","No-show"].includes(x)))return "Completed";return "Confirmed";}
function itemTitle(b){if(b.type==="villa"){const r=roomById(b.roomId);return r?r.villa.name+", "+r.name:"Room";}const s=sch(b.legs[0].sid),r=route(s.routeId);return "Speedboat "+portShort(r.from)+" to "+portShort(r.to)+(b.legs.length>1?" and back":"");}
function itemWhen(b){return b.type==="villa"?fd(b.checkIn)+" to "+fd(b.checkOut):b.legs.map(l=>{const s=sch(l.sid);return fd(s.date)+" "+s.time;}).join(", ");}
function itemStart(b){return b.type==="villa"?b.checkIn:sch(b.legs[0].sid).date;}
function ticketCode(b,seat){return b.code+"-"+seat;}

/* ---------- folio (F-01) ---------- */
function itemMoney(b){
  if(b.status==="Cancelled"||b.status==="No-show")return {net:b.cancelFee||0,tax:0,total:b.cancelFee||0};
  if(b.type==="villa")return {net:b.subtotal,tax:b.tax,total:b.total};
  return {net:b.net!=null?b.net:b.total,tax:b.tax||0,total:b.total};
}
function folio(ref){
  const h=H(ref),lines=[],E={};const T=e=>E[e]=E[e]||{net:0,tax:0,total:0,paid:0,refunded:0};
  const add=(e,l)=>{lines.push(Object.assign({ent:e},l));const t=T(e);t.net+=l.net;t.tax+=l.tax;t.total+=l.total;};
  for(const b of itemsOf(ref)){const m=itemMoney(b);const gone=b.status==="Cancelled"||b.status==="No-show";if(gone&&!m.total)continue;
    add(entityOfType(b.type),{kind:"item",code:b.code,label:(b.status==="Cancelled"?"Cancellation fee, ":b.status==="No-show"?"No-show fee, ":"")+itemTitle(b)+", "+itemWhen(b),net:m.net,tax:m.tax,total:m.total});}
  for(const c of (h&&h.charges)||[])add(c.ent,{kind:"charge",label:c.label,net:c.net,tax:c.tax,total:c.total});
  for(const p of (h&&h.payments)||[])if(p.status==="Paid")for(const[e,a]of Object.entries(p.split||{}))T(e).paid+=a;
  for(const r of (h&&h.refunds)||[])if(r.status==="Refunded")for(const[e,a]of Object.entries(r.split||{}))T(e).refunded+=a;
  let total=0,paid=0,refunded=0;for(const e of Object.values(E)){e.balance=e.total-e.paid+e.refunded;total+=e.total;paid+=e.paid;refunded+=e.refunded;}
  return {lines,E,total,paid,refunded,balance:total-paid+refunded};
}
function allocate(ref,amount){
  const f=folio(ref);const due=Object.entries(f.E).map(([e,t])=>[e,Math.max(0,t.balance)]).filter(x=>x[1]>0);const sum=due.reduce((a,x)=>a+x[1],0);const out={};
  if(!sum){out[(Object.keys(f.E)[0])||LE_ROOM]=amount;return out;}
  let left=amount;due.forEach(([e,d],i)=>{const a=i===due.length-1?left:Math.min(left,Math.round(amount*d/sum));out[e]=a;left-=a;});return out;
}
function refundSplit(ref,amount){
  const f=folio(ref);const cr=Object.entries(f.E).map(([e,t])=>[e,Math.max(0,t.paid-t.refunded)]).filter(x=>x[1]>0);const sum=cr.reduce((a,x)=>a+x[1],0)||1;const out={};
  let left=amount;cr.forEach(([e,c],i)=>{const a=i===cr.length-1?left:Math.min(left,Math.round(amount*c/sum));out[e]=a;left-=a;});return out;
}

/* ---------- audit (A-02) and messages (G-04) ---------- */
function actorName(){return ui.user?ui.user.name+(ui.user.role==="admin"?" ("+(ui.user.staffRole||"Staff")+")":" (guest)"):"Guest (website)";}
function audit(entity,id,action,before,after,actor){DB.pms.audit.unshift({at:nowIso(),actor:actor||actorName(),entity,id,action,before:before==null?"":String(before),after:after==null?"":String(after)});if(DB.pms.audit.length>600)DB.pms.audit.length=600;}
function notify(ref,tpl,vars){
  const h=H(ref),T=DB.pms.templates[tpl];if(!h||!T)return;const f=folio(ref);
  const g=(DB.users||[]).find(u=>u.id===h.guestId);const lang=g&&g.country==="Indonesia"?"id":"en";
  const first=itemsOf(ref).slice().sort((a,b)=>itemStart(a).localeCompare(itemStart(b)))[0];
  const V=Object.assign({name:(h.name||"").split(" ")[0],ref,total:fmtUSD(f.total),paid:fmtUSD(f.paid),link:"https://pay.pivot.id/l/"+ref.toLowerCase(),until:h.holdUntil?wib(h.holdUntil):"",date:first?fd(itemStart(first)):""},vars||{});
  const text=T[lang].replace(/\{(\w+)\}/g,(m,k)=>V[k]!=null?V[k]:m);
  const ch=[h.phone?"WhatsApp":null,h.email&&!/@guest\.local$/.test(h.email)?"Email":null].filter(Boolean).join(" + ")||"WhatsApp";
  DB.pms.msgs.unshift({at:nowIso(),ref,channel:ch,to:[h.phone,h.email].filter(Boolean).join(", "),tpl,name:T.name,text,lang});
  if(DB.pms.msgs.length>400)DB.pms.msgs.length=400;
}

/* ---------- guests (G-03) ---------- */
function ensureGuestRec(g){
  let u=(DB.users||[]).find(x=>x.role==="Guest"&&((g.email&&lc(x.email)===lc(g.email))||(g.phone&&normPhone(x.phone)&&normPhone(x.phone)===normPhone(g.phone))));
  if(!u){u={id:"u"+Date.now().toString(36),name:g.name,email:g.email||"",phone:g.phone||"",country:g.country||"Other",role:"Guest",status:"Active",created:TODAY,lastLogin:null,notes:"",tags:[]};DB.users.push(u);}
  else{if(!u.phone&&g.phone)u.phone=g.phone;if(!u.email&&g.email)u.email=g.email;}
  return u;
}
function guestHeaders(gid){const u=(DB.users||[]).find(x=>x.id===gid);return Object.values(DB.pms.headers).filter(h=>h.guestId===gid||(u&&u.email&&lc(h.email)===lc(u.email)));}

/* ---------- create booking (R-03, G-01, C-01..C-05) ---------- */
function holdMinutesFor(source){const R=DB.pms.rules;return ["WhatsApp","Phone","Agent"].includes(source)?R.waHoldMin:R.appHoldHours*60;}
function pmsCreateBooking(o){
  const errs=[];
  for(const it of o.items){
    if(it.kind==="stay"){const r=roomById(it.roomId);if(!r){errs.push("Room not found.");continue;}
      if(!roomFree(it.roomId,it.ci,it.co))errs.push(r.name+" at "+r.villa.name+" is no longer free for those dates.");
      if(it.guests>r.cap)errs.push(r.name+" sleeps "+r.cap+".");}
    else for(const l of it.legs){const s=sch(l.sid);
      if(!saleOpen(s)){errs.push("Sales for the "+(s?s.time+" departure on "+fd(s.date):"departure")+" have closed.");continue;}
      if(l.seats&&l.seats.length){if(l.seats.some(x=>s.taken.includes(x)))errs.push("A chosen seat on the "+s.time+" departure was just taken.");}
      else if(seatsLeft(s)<it.pax.length)errs.push("Only "+seatsLeft(s)+" seats left on the "+s.time+" departure.");}
  }
  if(errs.length)return {err:errs[0]};
  const g=ensureGuestRec(o.guest);const src=o.source||"Consumer app",hold=o.mode==="hold";
  let ref=o.ref,h=ref&&H(ref);
  if(!h){ref=code("BK");h=DB.pms.headers[ref]={ref,guestId:g.id,email:g.email,name:g.name,phone:g.phone,source:src,created:TODAY,createdAt:nowIso(),payments:[],charges:[],refunds:[],holdUntil:null,convo:o.convo||null,promo:o.promo||"",by:o.by||actorName(),note:o.note||""};}
  if(hold)h.holdUntil=Date.now()+holdMinutesFor(src)*6e4;
  const contact={name:g.name,email:g.email,phone:g.phone,country:g.country,guestId:g.id};const st=hold?"Awaiting payment":"Confirmed";const made=[];
  for(const it of o.items){
    if(it.kind==="stay"){const r=roomById(it.roomId),q=quoteStay(it.roomId,it.ci,it.co,o.promo);
      made.push({code:code("MI"),ref,type:"villa",villaId:r.villa.id,roomId:it.roomId,checkIn:it.ci,checkOut:it.co,guests:it.guests,nights:q.nights,subtotal:q.net,tax:q.tax+q.svc,total:q.total,note:it.note||"",contact,status:st,pay:o.payment?o.payment.method:"Pivot",created:TODAY,log:[[TODAY,"Booked via "+src]]});}
    else{const legs=it.legs.map(l=>{const s=sch(l.sid);const seats=l.seats&&l.seats.length?l.seats.slice():seatLabels(boat(s.boatId).cap).filter(x=>!s.taken.includes(x)).slice(0,it.pax.length);s.taken.push(...seats);return {sid:l.sid,seats};});
      const q=quoteBoat(it.legs.map(l=>l.sid),it.pax.length);
      made.push({code:code("MB"),ref,type:"boat",legs,pax:it.pax.map(p=>({name:p.name||"",nat:p.nat||"",passport:p.passport||""})),net:q.net,tax:q.tax+q.svc,total:q.total,contact,status:st,pay:o.payment?o.payment.method:"Pivot",created:TODAY,log:[[TODAY,"Booked via "+src]]});}
  }
  DB.bookings.push(...made);
  audit("Booking",ref,o.ref?"Items added":"Created via "+src,null,made.map(itemTitle).join(" + "));
  if(o.payment&&o.payment.amount>0)pmsPay(ref,o.payment.amount,o.payment.method,o.payment.channel||"Pivot",o.by);
  else if(hold)notify(ref,"link",{});
  if(!hold)notify(ref,"confirm",{});
  if(made.some(b=>b.type==="boat")&&!hold)notify(ref,"tickets",{});
  save();return {ref,items:made};
}

/* ---------- payments (F-02/F-03), holds (R-05/C-03), cancellation (R-05) ---------- */
function pmsPay(ref,amount,method,channel,by){
  const h=H(ref);if(!h||!(amount>0))return null;
  const p={id:"py"+Date.now().toString(36)+Math.floor(Math.random()*99),at:nowIso(),method,channel,amount:Math.round(amount),split:allocate(ref,Math.round(amount)),status:"Paid",by:by||actorName()};h.payments.push(p);
  let conf=false;itemsOf(ref).forEach(b=>{if(b.status==="Awaiting payment"){b.status="Confirmed";b.log.push([TODAY,"Confirmed after payment"]);conf=true;}});h.holdUntil=null;
  notify(ref,"paid",{amount:fmtUSD(amount)});if(conf&&itemsOf(ref).some(b=>b.type==="boat"))notify(ref,"tickets",{});
  audit("Payment",ref,"Payment received",null,fmtUSD(amount)+" by "+method+" ("+channel+")");save();return p;
}
function releaseItem(b,why){if(b.type==="boat")b.legs.forEach(l=>{const s=sch(l.sid);if(s)s.taken=s.taken.filter(x=>!l.seats.includes(x));});b.status="Cancelled";b.log.push([TODAY,why]);}
function sweepHolds(){
  if(!DB.pms)return;const now=Date.now();let ch=false;
  for(const h of Object.values(DB.pms.headers)){if(h.holdUntil&&now>h.holdUntil){const its=itemsOf(h.ref).filter(b=>b.status==="Awaiting payment");
    if(its.length){its.forEach(b=>releaseItem(b,"Hold expired, capacity released"));h.expired=true;notify(h.ref,"expired",{});audit("Booking",h.ref,"Hold expired, rooms and seats released","Hold","Expired","System");}
    h.holdUntil=null;ch=true;}}
  if(ch)save();
}
function cancelFee(b){
  const C=DB.pms.rates.cancel,m=itemMoney(b).total;if(b.status==="Awaiting payment")return 0;
  if(b.type==="villa"){const days=diffDays(TODAY,b.checkIn);return days>=C.roomFreeDays?0:Math.round(m*C.roomFeePct/100);}
  const hrs=(depTs(sch(b.legs[0].sid))-Date.now())/36e5;return hrs>=C.boatFreeHours?0:Math.round(m*C.boatFeePct/100);
}
function pmsCancelItem(code_,fee,reason){
  const b=DB.bookings.find(x=>x.code===code_);if(!b)return;const before=itemLife(b);
  releaseItem(b,"Cancelled"+(reason?": "+reason:""));b.cancelFee=fee||0;
  notify(b.ref,"cancel",{item:itemTitle(b),fee:fmtUSD(fee||0)});
  audit("Booking item",b.code,"Cancelled"+(reason?" ("+reason+")":"")+(fee?", fee "+fmtUSD(fee):""),before,"Cancelled");save();
}
function pmsRefund(ref,amount,reason,role){
  const h=H(ref);const needApproval=amount>DB.pms.rules.refundApproval&&!["Owner","Property Manager"].includes(role);
  const r={id:"rf"+Date.now().toString(36),at:nowIso(),amount:Math.round(amount),reason,split:refundSplit(ref,Math.round(amount)),status:needApproval?"Pending approval":"Refunded",by:actorName()};
  h.refunds.push(r);audit("Refund",ref,needApproval?"Refund requested, waiting for approval":"Refund issued",null,fmtUSD(amount)+" ("+reason+")");save();return r;
}

/* ---------- invoices per legal entity (F-04) ---------- */
function invoiceNo(ref,e){const h=H(ref);h.inv=h.inv||{};
  if(!h.inv[e]){const E=ent(e);DB.pms.invSeq[e]=(DB.pms.invSeq[e]||0)+1;const no="INV/"+E.prefix+"/"+TODAY.slice(0,4)+"/"+String(DB.pms.invSeq[e]).padStart(4,"0");h.inv[e]=no;DB.pms.invoices.push({no,ent:e,ref,date:TODAY});audit("Invoice",no,"Issued",null,ref);save();}
  return h.inv[e];}
function invoiceHTML(ref,e){
  const E=ent(e),h=H(ref),f=folio(ref),no=invoiceNo(ref,e),t=f.E[e]||{net:0,tax:0,total:0,paid:0,refunded:0,balance:0},rate=DB.pms.rules.fx.IDR;
  const idr=v=>"Rp "+Math.round(v*rate).toLocaleString("id-ID");const lines=f.lines.filter(l=>l.ent===e);
  const pays=(h.payments||[]).filter(p=>p.status==="Paid"&&p.split&&p.split[e]);
  return `<div class="inv" id="inv-print"><div class="inv-top"><img src="${e===LE_ROOM?LOGO_MARK:LOGO_BOAT}" alt="" class="inv-logo ${e===LE_BOAT?"round":""}"><div style="flex:1;min-width:200px"><b class="inv-ent">${esc(E.name)}</b><p class="tiny muted">${esc(E.address)}<br>NPWP ${esc(E.npwp)}</p></div><div class="inv-no"><p class="tiny muted">Invoice</p><b>${esc(no)}</b><p class="tiny muted">${fdl(TODAY)}</p></div></div>
  <p class="small" style="margin:14px 0"><b>Bill to</b> ${esc(h.name)}${h.email?", "+esc(h.email):""}${h.phone?", "+esc(h.phone):""}<br><b>Booking</b> ${esc(ref)}</p>
  <div class="tbl-wrap"><table><thead><tr><th>Description</th><th style="text-align:right">Amount</th><th style="text-align:right">Tax and service</th><th style="text-align:right">Total</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${esc(l.label)}</td><td style="text-align:right">${fmtUSD(l.net)}</td><td style="text-align:right">${fmtUSD(l.tax)}</td><td style="text-align:right">${fmtUSD(l.total)}</td></tr>`).join("")||`<tr><td colspan="4" class="muted">No charges.</td></tr>`}</tbody></table></div>
  <div class="inv-sum"><div><span>Total</span><b>${fmtUSD(t.total)}</b></div><div><span>Paid</span><b>${fmtUSD(t.paid-t.refunded)}</b></div><div><span>Balance due</span><b>${fmtUSD(Math.max(0,t.balance))}</b></div></div>
  ${pays.length?`<p class="tiny muted" style="margin-top:8px">Payments: ${pays.map(p=>`${fd(p.at.slice(0,10))} ${esc(p.method)} ${fmtUSD(p.split[e])}`).join("; ")}</p>`:""}
  <p class="tiny muted" style="margin-top:8px">IDR equivalent at Rp ${rate.toLocaleString("id-ID")} per USD: total ${idr(t.total)}, balance ${idr(Math.max(0,t.balance))}. Tax ${E.tax}%, service ${E.svc}%. Settles to Pivot merchant account ${esc(E.merchant)}.</p></div>`;
}
function ticketsHTML(ref){
  const its=itemsOf(ref).filter(b=>b.type==="boat"&&b.status!=="Cancelled");
  if(!its.length)return `<p class="muted">No speedboat tickets on this booking.</p>`;
  return `<div class="tk-grid">${its.flatMap(b=>b.legs.flatMap((l,li)=>{const s=sch(l.sid),r=route(s.routeId);return l.seats.map((seat,i)=>`<div class="tk"><div>${qr(ticketCode(b,seat))}</div><div><p class="tiny muted">${li?"Return":"Departure"}, seat ${esc(seat)}</p><b>${esc((b.pax[i]||{}).name||"Passenger "+(i+1))}</b><p class="small">${esc(portShort(r.from))} to ${esc(portShort(r.to))}<br>${fd(s.date)}, ${s.time}</p><p class="tiny muted">${esc(ticketCode(b,seat))}</p></div></div>`);})).join("")}</div>`;
}

/* ---------- shared UI: badges, invoice and ticket dialogs, payment simulation ---------- */
const _coreBadge=statusBadge;
statusBadge=function(s){const m={"Confirmed":"b-ok","Hold":"b-warn","In use":"b-info","Expired":"b-plain","No-show":"b-danger","Boarded":"b-info","Pending approval":"b-warn","Refunded":"b-plain","Rejected":"b-danger","Open":"b-warn","Done":"b-ok","In progress":"b-info","Closed":"b-plain"};return m[s]?`<span class="badge ${m[s]}">${esc(s)}</span>`:_coreBadge(s);};
const _coreModal=modalHTML;
modalHTML=function(){const m=ui.modal;
  if(m&&m.kind==="invoice")return `<div class="scrim" data-a="scrim"><div class="modal wide" role="dialog" aria-modal="true"><div class="modal-head"><h2 style="font-size:1.3rem">Invoice</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>${invoiceHTML(m.ref,m.ent)}<div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" data-a="invPrint">Print or save as PDF</button></div></div></div>`;
  if(m&&m.kind==="tickets")return `<div class="scrim" data-a="scrim"><div class="modal wide" role="dialog" aria-modal="true"><div class="modal-head"><div><h2 style="font-size:1.3rem">Speedboat QR tickets</h2><p class="small muted">Booking ${esc(m.ref)}. Scan at the pier to board.</p></div><button class="x" data-a="close" aria-label="Close">&times;</button></div><div id="inv-print">${ticketsHTML(m.ref)}</div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" data-a="invPrint">Print tickets</button></div></div></div>`;
  return _coreModal();};
const _coreSimPay=A.simPay;
Object.assign(A,{
  invOpen:el=>{ui.modal={kind:"invoice",ref:el.dataset.ref,ent:el.dataset.ent};render(true);},
  tkOpen:el=>{ui.modal={kind:"tickets",ref:el.dataset.ref};render(true);},
  invPrint:()=>window.print(),
  simPay:el=>{const b=DB.bookings.find(x=>x.code===el.dataset.code);const h=b&&H(b.ref);
    if(!h)return _coreSimPay(el);
    const f=folio(b.ref);const amt=Math.min(f.balance,h.dueNow||f.balance);pmsPay(b.ref,amt,b.pay||"Virtual account","Pivot","Guest");if(ui.modal&&ui.modal.kind==="voucher")ui.modal=null;toast("Payment received. Booking "+b.ref+" is confirmed.");}
});
const _coreRender=render;
render=function(k){sweepHolds();return _coreRender(k);};
setInterval(()=>{if(DB.pms&&Object.values(DB.pms.headers).some(h=>h.holdUntil&&Date.now()>h.holdUntil)){sweepHolds();render(true);}},30000);
(function(){const s=document.createElement("style");s.textContent=`
.inv{color:var(--ink)}.inv-top{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;border-bottom:2px solid var(--line);padding-bottom:14px}
.inv-logo{width:64px;height:auto}.inv-logo.round{background:#fff;border-radius:50%;width:60px}.inv-ent{font-family:var(--display);font-weight:400;font-size:1.15rem}
.inv-no{text-align:right}.inv-no b{font-size:1rem}.inv-sum{display:flex;gap:10px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
.inv-sum div{background:var(--surface-2);border-radius:12px;padding:8px 14px;min-width:120px;text-align:right}.inv-sum span{display:block;font-size:.75rem;color:var(--ink-2)}
.tk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.tk{display:flex;gap:12px;align-items:center;border:1px dashed var(--line);border-radius:14px;padding:12px;background:var(--surface)}
.tk .qr{width:96px;height:96px;padding:4px}
@media print{body *{visibility:hidden!important}#inv-print,#inv-print *{visibility:visible!important}#inv-print{position:absolute;left:0;top:0;width:100%;padding:20px}}`;document.head.appendChild(s);})();
