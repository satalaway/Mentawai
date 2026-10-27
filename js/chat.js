"use strict";
/* ================= CHAT ASSISTANT ================= */
const chat={open:false,busy:false,msgs:[],noted:false};
try{const s=sessionStorage.getItem("mi-chat");if(s){const o=JSON.parse(s);chat.msgs=o.msgs||[];chat.noted=!!o.noted;}}catch(e){}
function saveChat(){try{sessionStorage.setItem("mi-chat",JSON.stringify({msgs:chat.msgs.slice(-40),noted:chat.noted}));}catch(e){}}
const CHAT_ICON=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>`;
function bookedRanges(roomId,end){
  const nights=new Set();
  for(const b of DB.bookings){if(b.type!=="villa"||b.roomId!==roomId||b.status==="Cancelled"||b.checkOut<=TODAY)continue;for(let d=b.checkIn<TODAY?TODAY:b.checkIn;d<b.checkOut&&d<=end;d=addDays(d,1))nights.add(d);}
  for(const k of DB.blocks)if(k.roomId===roomId&&k.date>=TODAY&&k.date<=end)nights.add(k.date);
  const ds=[...nights].sort(),out=[];let s=null,p=null;
  for(const d of ds){if(s&&addDays(p,1)===d){p=d;continue;}if(s)out.push(s+" to "+p);s=p=d;}
  if(s)out.push(s+" to "+p);return out;
}
function chatContext(){
  const end=addDays(TODAY,60);
  return {
    today:TODAY, guestCurrency:ui.cur, idrPerUsd:DB.settings.rate, villaTaxAndServicePct:DB.settings.tax, boatPortFeeUsdPerPersonPerCrossing:DB.settings.portFee,
    paymentMethods:Object.keys(DB.settings.pay).filter(k=>DB.settings.pay[k]),
    policies:["Villa: free cancellation up to 14 days before check-in","Villa: check-in from 14:00, check-out by 11:00","Boat: one surfboard per person included, reserved seating, crossings can be rescheduled for weather","Boat: passport name and number needed for every passenger","Bank transfer and QRIS bookings are held 24 hours until paid"],
    contact:"hello@mentawaiindah.example, WhatsApp +62 000 0000 0000",
    ports:DB.ports,
    villas:DB.villas.filter(v=>v.active).map(v=>({id:v.id,name:v.name,island:v.island,about:v.blurb,amenities:v.amen,ferryPort:{v1:"SIB",v2:"SIP",v3:"PAG"}[v.id]||null,
      rooms:v.rooms.filter(r=>r.active).map(r=>({name:r.name,beds:r.bed,sleeps:r.cap,usdPerNight:r.price,unavailableNights_next60days:bookedRanges(r.id,end)}))})),
    routes:DB.routes.map(r=>({from:r.from,to:r.to,duration:durTxt(r.mins)})),
    departures_next30days:DB.schedules.filter(s=>s.date>=TODAY&&s.date<=addDays(TODAY,30)&&s.status==="Scheduled"&&boat(s.boatId).status==="Active").sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
      .map(s=>{const r=route(s.routeId);return `${s.date} ${s.time} ${r.from}->${r.to} $${s.price} seatsLeft:${seatsLeft(s)}`;}),
    guestIsOnPage:ui.view+(ui.p&&ui.p.id?" "+ui.p.id:"")
  };
}
/* tiny safe markdown: **bold**, bullet lines, paragraphs, and action tags */
function chatActionBtn(tag){
  const [kind,...rest]=tag.split(":");
  if(kind==="villa"){const v=villaById(rest[0]);if(!v)return "";return `<button data-a="chatGo" data-k="villa" data-id="${esc(v.id)}">View ${esc(v.name)}</button>`;}
  if(kind==="boat"){const [ft,date]=[rest[0],rest[1]];const [f,t]=(ft||"").split("-");if(!DB.ports[f]||!DB.ports[t])return "";return `<button data-a="chatGo" data-k="boat" data-f="${f}" data-t="${t}" data-d="${esc(date||"")}">Departures ${esc(portShort(f))} to ${esc(portShort(t))}${date?", "+fd(date):""}</button>`;}
  if(kind==="stay"){const [vid,ci,co,g]=rest;if(!/^\d{4}-\d\d-\d\d$/.test(ci||"")||!/^\d{4}-\d\d-\d\d$/.test(co||""))return "";const v=villaById(vid);return `<button data-a="chatGo" data-k="stay" data-id="${esc(v?v.id:"all")}" data-ci="${ci}" data-co="${co}" data-g="${esc(g||"2")}">Check ${v?esc(v.name):"villas"}, ${fd(ci)} to ${fd(co)}</button>`;}
  return "";
}
function chatMD(text){
  const acts=[];
  text=text.replace(/\[\[([a-z]+:[^\]]+)\]\]/g,(m,t)=>{const b=chatActionBtn(t.trim());if(b&&!acts.includes(b))acts.push(b);return "";});
  const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
  const lines=text.trim().split(/\n/);let h="",inList=false;
  for(const raw of lines){const l=raw.trim();
    if(/^[-*•]\s+/.test(l)){if(!inList){h+="<ul>";inList=true;}h+="<li>"+inline(l.replace(/^[-*•]\s+/,""))+"</li>";continue;}
    if(inList){h+="</ul>";inList=false;}
    if(l)h+="<p>"+inline(l)+"</p>";}
  if(inList)h+="</ul>";
  return h+(acts.length?`<div class="acts">${acts.join("")}</div>`:"");
}
const CHAT_SUGG=["Which villa is best for a family?","How do I get there from Padang?","Is there a boat to Siberut next Friday?","What's included in the price?"];
function renderChat(){
  const root=document.getElementById("chat");if(!root)return;
  if(ui.mode==="admin"){root.innerHTML="";return;}
  if(!chat.open){root.innerHTML=`<button class="chat-fab" data-a="chatOpen" aria-label="Chat with our assistant"><span class="av"><img src="${LOGO_MARK}" alt=""></span><span class="lbl">Ask us anything</span></button>`;return;}
  const greet=`<div class="msg bot"><p>Hi${ui.user&&ui.user.role==="guest"?" "+esc(ui.user.name.split(" ")[0]):""}! I can help you pick a villa, check dates and boat times from Padang, and explain how booking works.</p></div>`;
  const log=chat.msgs.map(m=>m.role==="note"?`<div class="msg note">${esc(m.content)}</div>`:m.role==="user"?`<div class="msg me">${esc(m.content).replace(/\n/g,"<br>")}</div>`:`<div class="msg bot">${chatMD(m.content)}</div>`).join("");
  const keep=document.getElementById("chat-in");const draft=keep?keep.value:"";
  root.innerHTML=`<section class="chat-panel" role="dialog" aria-label="Chat with the Mentawai Indah assistant">
  <div class="chat-head"><span class="av"><img src="${LOGO_MARK}" alt=""></span><div><b>Mentawai Indah assistant</b><small>Answers about villas, boats and booking</small></div><button class="x" data-a="chatClose" aria-label="Close chat">&times;</button></div>
  <div class="chat-log" id="chat-log" aria-live="polite">${greet}${log}${chat.busy?`<div class="msg bot" aria-label="Assistant is typing"><span class="typing"><i></i><i></i><i></i></span></div>`:""}</div>
  ${chat.msgs.length?"":`<div class="chat-sugg">${CHAT_SUGG.map(s=>`<button data-a="chatSugg">${esc(s)}</button>`).join("")}</div>`}
  <form class="chat-form" id="chat-form" onsubmit="return false"><label class="sr" for="chat-in">Your message</label><textarea id="chat-in" rows="1" placeholder="Ask about villas, dates or the boat">${esc(draft)}</textarea><button class="chat-send" data-a="chatSend" aria-label="Send" ${chat.busy?"disabled":""}>${CHAT_ICON}</button></form>
  <p class="chat-foot">AI assistant. Prices and seats are confirmed at checkout.</p></section>`;
  const lg=document.getElementById("chat-log");lg.scrollTop=lg.scrollHeight;
}
async function chatAsk(text){
  text=text.trim();if(!text||chat.busy)return;
  chat.msgs.push({role:"user",content:text.slice(0,2000)});chat.busy=true;saveChat();renderChat();
  const history=[];for(const m of chat.msgs){if(m.role==="note")continue;const last=history[history.length-1];if(last&&last.role===m.role)last.content+="\n"+m.content;else history.push({role:m.role,content:m.content});}
  let reply=null;
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history.slice(-16),context:chatContext()})});
    if(r.ok){const d=await r.json();reply=(d.reply||"").trim()||null;}
  }catch(e){}
  if(!reply){
    if(!chat.noted){chat.msgs.push({role:"note",content:"Demo mode: the AI assistant isn't connected on this copy of the site, so you're seeing preset answers."});chat.noted=true;}
    reply=chatFallback(text);
  }
  chat.msgs.push({role:"assistant",content:reply});chat.busy=false;saveChat();renderChat();
  const inp=document.getElementById("chat-in");if(inp&&window.matchMedia("(min-width:521px)").matches)inp.focus();
}
function chatFallback(q){
  q=q.toLowerCase();const lo=k=>Math.min(...DB.schedules.filter(s=>route(s.routeId).to===k&&route(s.routeId).from==="PDG"&&s.date>=TODAY).map(s=>s.price));
  if(/boat|ferry|crossing|padang|get there|transfer|speedboat|fast/.test(q))return `Every villa is reached by fast boat from **Padang (Muaro)**:\n- Siberut: about 3h 45m, daily, from $${lo("SIB")}\n- Sipora: about 3h 20m, daily, from $${lo("SIP")}\n- North Pagai: about 5h, Mon, Wed and Fri, from $${lo("PAG")}\nYou choose your seats when you book. [[boat:PDG-SIB:${addDays(TODAY,7)}]] [[boat:PDG-SIP:${addDays(TODAY,7)}]]`;
  if(/family|kid|child|calm|swim/.test(q))return `For families I'd suggest **Sipora Lagoon Villa**. The lagoon is calm and shallow, there's a kids' room, and it's the shortest crossing from Padang. The **Two-bedroom house** sleeps 4. [[villa:v2]]`;
  if(/surf|wave|break/.test(q))return `Surfers usually pick **Siberut Point Villa**. It sits above a left-hand reef break and a surf guide is available on request. Your board travels free on the boat. [[villa:v1]]`;
  if(/quiet|honeymoon|couple|fish|jungle/.test(q))return `**Pagai Ridge Villa** is the quiet one: jungle walks, fishing trips and empty beaches. The Ridge suite has a king bed. [[villa:v3]]`;
  if(/cancel|refund/.test(q))return `Villa stays can be cancelled free of charge up to **14 days before check-in**. Boat crossings can be rescheduled if the weather is bad.`;
  if(/pay|card|paypal|qris|transfer/.test(q))return `You can pay by card, PayPal, Indonesian bank transfer (virtual account) or QRIS. Card and PayPal confirm instantly. Transfers and QRIS are held 24 hours until paid.`;
  if(/price|cost|how much|include|rate/.test(q))return `Villa rooms start from **$${Math.min(...DB.villas.flatMap(v=>v.rooms.map(r=>r.price)))} per night**, plus ${DB.settings.tax}% tax and service. Siberut and Pagai include full board, Sipora includes breakfast and dinner. Boat seats start from $${lo("SIP")} each way, plus a $${DB.settings.portFee} port fee.`;
  return `I can help with villas, dates, boat times from Padang, prices and payment. For anything else, message the team on WhatsApp +62 000 0000 0000.`;
}
Object.assign(A,{
  chatOpen:()=>{chat.open=true;renderChat();const i=document.getElementById("chat-in");if(i)i.focus();},
  chatClose:()=>{chat.open=false;renderChat();},
  chatSugg:el=>chatAsk(el.textContent),
  chatSend:()=>{const i=document.getElementById("chat-in");const v=i.value;i.value="";chatAsk(v);},
  chatGo:el=>{const k=el.dataset.k;
    if(window.matchMedia("(max-width:520px)").matches)chat.open=false;
    if(k==="villa"){ui.selRoom=null;go("villa",{id:el.dataset.id});}
    if(k==="boat"){Object.assign(ui.bs,{from:el.dataset.f,to:el.dataset.t,trip:"oneway"});if(el.dataset.d&&el.dataset.d>=TODAY)ui.bs.date=el.dataset.d;ui.cart=null;go("boats",{leg:0});}
    if(k==="stay"){Object.assign(ui.vs,{ci:el.dataset.ci<TODAY?TODAY:el.dataset.ci,co:el.dataset.co,guests:Math.min(4,Math.max(1,+el.dataset.g||2)),villa:el.dataset.id});if(ui.vs.co<=ui.vs.ci)ui.vs.co=addDays(ui.vs.ci,1);ui.selRoom=null;if(el.dataset.id!=="all")go("villa",{id:el.dataset.id});else go("villas");}
  }
});
document.addEventListener("keydown",e=>{if(e.target.id==="chat-in"&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();A.chatSend();}});
document.addEventListener("input",e=>{if(e.target.id==="chat-in"){e.target.style.height="auto";e.target.style.height=Math.min(120,e.target.scrollHeight)+"px";}});

renderChat();
