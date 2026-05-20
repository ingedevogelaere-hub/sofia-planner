import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const STYLES = ["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS = ["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse","✏️ Autre"];
const BUDGETS = ["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)","💵 Budget global à préciser"];
const TRANSPORTS = ["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car","✏️ Autre"];
const TRANSPORT_TO = ["✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture de location","🚌 Bus","⛴️ Ferry / Bateau","🚢 Croisière","✏️ Autre"];
const VOYAGEURS = ["Solo","2 adultes","Famille avec bébé (0-3 ans)","Famille avec enfants (4-12 ans)","Famille avec ados","Groupe d'amis","Couple senior","✏️ Autre"];
const DUREES = [2,3,4,5,6,7,8,10,12,14,21];

const LINKS = {
  accommodations:[
    {l:"Booking",c:"#003580",u:d=>`https://www.booking.com/search.html?ss=${e(d)}`},
    {l:"Airbnb",c:"#FF5A5F",u:d=>`https://www.airbnb.fr/s/${e(d)}/homes`},
    {l:"Hotels.com",c:"#C00",u:d=>`https://fr.hotels.com/search.do?q-destination=${e(d)}`},
    {l:"Hostelworld",c:"#F60",u:d=>`https://www.hostelworld.com/findabed.php/ChosenCity.${e(d)}`},
  ],
  restaurants:[
    {l:"TripAdvisor",c:"#00AA6C",u:d=>`https://www.tripadvisor.fr/Search?q=restaurants+${e(d)}`},
    {l:"TheFork",c:"#00B551",u:d=>`https://www.thefork.fr/recherche?city=${e(d)}`},
    {l:"Google Maps",c:"#4285F4",u:d=>`https://www.google.com/maps/search/restaurants+${e(d)}`},
  ],
  hikes:[
    {l:"AllTrails",c:"#3D6B35",u:d=>`https://www.alltrails.com/explore?q=${e(d)}`},
    {l:"Visorando",c:"#5D8B3C",u:d=>`https://www.visorando.com/randonnee-${d.toLowerCase().replace(/\s+/g,'-')}.html`},
    {l:"Komoot",c:"#6EA8C8",u:d=>`https://www.komoot.com/discover/${e(d)}`},
  ],
  activities:[
    {l:"Viator",c:"#142A51",u:d=>`https://www.viator.com/searchResults/all?text=${e(d)}`},
    {l:"GetYourGuide",c:"#FF6B35",u:d=>`https://www.getyourguide.fr/s/?q=${e(d)}`},
    {l:"Civitatis",c:"#E84D3D",u:d=>`https://www.civitatis.com/fr/?buscar=${e(d)}`},
  ],
  remarkable_sites:[
    {l:"Grands Sites France",c:"#004A8F",u:()=>`https://www.grandsitedefrance.com`},
    {l:"UNESCO",c:"#009EDB",u:()=>`https://whc.unesco.org/fr/list/`},
    {l:"Parcs Nationaux",c:"#2D7A27",u:()=>`https://www.parcsnationaux.fr`},
    {l:"National Trust",c:"#5C4A1A",u:()=>`https://www.nationaltrust.org.uk`},
  ],
};
const e = s => encodeURIComponent(s||"");

// ── Helpers ──────────────────────────────────────
function Photo({ seed, h=140 }) {
  return <div style={{height:h,overflow:"hidden",background:"#EDE0C4",flexShrink:0}}>
    <img src={`https://picsum.photos/seed/${seed}/700/300`} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
  </div>;
}

function LinkRow({ type, dest }) {
  return <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
    {(LINKS[type]||[]).map(l=>(
      <a key={l.l} href={l.u(dest)} target="_blank" rel="noopener noreferrer"
        style={{padding:"4px 10px",background:l.c,color:"#fff",borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>
        🔗 {l.l}
      </a>
    ))}
  </div>;
}

function Note({ id }) {
  const [open,setOpen]=useState(false);
  const [val,setVal]=useState("");
  return <div style={{marginTop:8}}>
    <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#8A9E93",display:"flex",alignItems:"center",gap:4}}>
      📝 {open?"Fermer":"Ajouter une note"}
    </button>
    {open && <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Tes notes personnelles…"
      style={{width:"100%",padding:"8px 10px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1C1A14",resize:"none",outline:"none",minHeight:56,marginTop:6}}/>}
    {!open && val && <div style={{fontSize:11,color:"#8A9E93",fontStyle:"italic",marginTop:4}}>📌 {val}</div>}
  </div>;
}

function Chip({ label, color="#EDE0C4", text="#1C1A14" }) {
  return <span style={{display:"inline-block",padding:"3px 9px",borderRadius:100,background:color,color:text,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>;
}

function DayCard({ d, dest }) {
  return <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,overflow:"hidden",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
    <Photo seed={`${dest}-day${d.num}`} h={160}/>
    <div style={{padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"#1C1A14",color:"#B8972E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,flexShrink:0}}>{d.num}</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#1C1A14"}}>{d.title}</div>
          {d.location && <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:"#B8972E",textTransform:"uppercase",marginTop:2}}>📍 {d.location}</div>}
        </div>
      </div>
      {[["🌅 Matin",d.morning],["☀️ Après-midi",d.afternoon],["🌙 Soir",d.evening]].map(([label,val])=>val&&(
        <div key={label} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #FAF6EE"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:4}}>{label}</div>
          <div style={{fontSize:13,lineHeight:1.7,color:"#3a3830"}}>{val}</div>
        </div>
      ))}
      {d.tip && <div style={{background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:4,padding:"8px 12px",fontSize:12,color:"#8A9E93",fontStyle:"italic"}}>💡 {d.tip}</div>}
      <Note id={`day-${d.num}`}/>
    </div>
  </div>;
}

function ItemCard({ item, type, i, dest }) {
  const seeds = { accommodations:`hotel-${dest}-${i}`, restaurants:`resto-${dest}-${i}`, hikes:`hike-${dest}-${i}`, activities:`act-${dest}-${i}`, remarkable_sites:`site-${dest}-${i}` };
  return <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
    <Photo seed={seeds[type]||`${type}-${i}`} h={110}/>
    <div style={{padding:"14px 16px"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:8}}>{item.name}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
        {item.label     && <Chip label={item.label} color="#004A8F22" text="#004A8F"/>}
        {item.type      && <Chip label={item.type}/>}
        {item.cuisine   && <Chip label={item.cuisine} color="#fff5f0" text="#8B2500"/>}
        {item.difficulty && <Chip label={item.difficulty} color={item.difficulty==="Facile"?"#e8f5e9":item.difficulty==="Difficile"?"#fce4ec":"#fff3e0"} text={item.difficulty==="Facile"?"#2e7d32":item.difficulty==="Difficile"?"#c62828":"#e65100"}/>}
        {item.distance  && <Chip label={`📏 ${item.distance}`} color="#f2f7f2" text="#3D5A3E"/>}
        {item.duration  && <Chip label={`⏱️ ${item.duration}`} color="#f2f7f2" text="#3D5A3E"/>}
        {item.price     && <Chip label={`💰 ${item.price}`} color="#FAF6EE" text="#8A9E93"/>}
        {item.location  && <Chip label={`📍 ${item.location}`} color="#FAF6EE" text="#8A9E93"/>}
      </div>
      {(item.why||item.description||item.specialty||item.highlights||item.info) && (
        <div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>
          {item.why||item.description||item.specialty||item.highlights||item.info}
        </div>
      )}
      {item.tip && <div style={{fontSize:12,color:"#8A9E93",fontStyle:"italic",marginBottom:4}}>💡 {item.tip}</div>}
      {item.website && <a href={item.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"4px 10px",background:"#004A8F",color:"#fff",borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace",marginBottom:6}}>🔗 Site officiel</a>}
      <LinkRow type={type} dest={dest}/>
      <Note id={`${type}-${i}`}/>
    </div>
  </div>;
}

function PackingSection({ packing, dest }) {
  const [myItems, setMyItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [checked, setChecked] = useState({});
  const toggle = k => setChecked(c=>({...c,[k]:!c[k]}));
  const addItem = () => { if(newItem.trim()){setMyItems(m=>[...m,newItem.trim()]);setNewItem("");} };
  return (
    <div>
      {packing?.map((cat,ci)=>(
        <div key={ci} style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12,color:"#1C1A14"}}>
            {cat.category==="Documents"?"📄":cat.category==="Santé"?"💊":cat.category==="Vêtements"?"👕":cat.category==="Technologie"?"🔌":"📦"} {cat.category}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {cat.items?.map((item,ii)=>{
              const k=`cat${ci}-${ii}`;
              return <label key={ii} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:"#B8972E",cursor:"pointer"}}/>
                <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
              </label>;
            })}
          </div>
        </div>
      ))}
      <div style={{background:"#fff",border:"1.5px solid #B8972E",borderRadius:8,padding:"16px 18px",marginBottom:14}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12,color:"#B8972E"}}>🧳 Mes affaires personnelles</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {myItems.map((item,i)=>{
            const k=`my-${i}`;
            return <label key={i} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:"#B8972E",cursor:"pointer"}}/>
              <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
            </label>;
          })}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={newItem} onChange={ev=>setNewItem(ev.target.value)} onKeyDown={ev=>ev.key==="Enter"&&addItem()}
            placeholder="Ajouter un article…" style={{flex:1,padding:"8px 12px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none"}}/>
          <button onClick={addItem} style={{padding:"8px 14px",background:"#B8972E",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:14}}>+</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────
export default function SofiaPlanner() {
  const [phase,setPhase] = useState("form");
  const [plan,setPlan]   = useState(null);
  const [form,setForm]   = useState({
    destination:"",depart:"",dateStart:"",dateEnd:"",duree:7,
    voyageurs:"2 adultes",voyageurs_autre:"",
    budget:"",budget_global:"",
    styles:[],style_autre:"",
    hebergement:"",hebergement_autre:"",
    transport:"",transport_autre:"",
    transport_to:"",transport_to_autre:"",
    special:"",musts:"",avoid:"",notes:""
  });
  const [errors,setErrors]   = useState({});
  const [msgs,setMsgs]       = useState([]);
  const [chatIn,setChatIn]   = useState("");
  const [chatLoad,setChatLoad] = useState(false);
  const [tab,setTab]         = useState("days");
  const [showMap,setShowMap] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleStyle = s => setF("styles",form.styles.includes(s)?form.styles.filter(x=>x!==s):[...form.styles,s]);

  const handleDate = (k,v) => {
    setF(k,v);
    const s = k==="dateStart"?v:form.dateStart;
    const en = k==="dateEnd"?v:form.dateEnd;
    if(s&&en){ const d=Math.round((new Date(en)-new Date(s))/(864e5)); if(d>0)setF("duree",d); }
  };

  const validate = () => {
    const e={};
    if(!form.destination.trim()) e.destination="Destination obligatoire";
    if(!form.budget) e.budget="Budget obligatoire";
    if(!form.hebergement) e.hebergement="Hébergement obligatoire";
    if(form.dateStart&&form.dateEnd&&new Date(form.dateEnd)<=new Date(form.dateStart)) e.dateEnd="La date de retour doit être après le départ";
    setErrors(e);
    if(Object.keys(e).length>0){
      const first=Object.keys(e)[0];
      document.getElementById(first)?.scrollIntoView({behavior:"smooth",block:"center"});
    }
    return Object.keys(e).length===0;
  };

  const generate = async () => {
    if(!validate()) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({formData:form})});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      if(data.type==="plan"){ setPlan(data.data); setMsgs([{role:"assistant",content:data.data.intro||"Votre plan est prêt !"}]); setPhase("result"); }
      else { alert("Format inattendu. Réessaie."); setPhase("form"); }
    } catch(err){ alert("Erreur : "+err.message); setPhase("form"); }
  };

  const sendChat = async () => {
    if(!chatIn.trim()||chatLoad) return;
    const userMsg={role:"user",content:chatIn.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs); setChatIn(""); setChatLoad(true);
    try {
      const res = await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content}))})});
      const data = await res.json();
      if(data.type==="plan" && data.data?.days){
        setPlan(data.data);
        setMsgs([...newMsgs,{role:"assistant",content:"✅ J'ai mis à jour votre plan de voyage ! — Sofia 🌍"}]);
      } else {
        setMsgs([...newMsgs,{role:"assistant",content:data.reply||"Désolée, une erreur est survenue !"}]);
      }
    } catch { setMsgs([...newMsgs,{role:"assistant",content:"Désolée, une erreur est survenue !"}]); }
    setChatLoad(false);
  };

  const openPDF = () => {
    const win = window.open("","_blank");
    const dest = form.destination;
    const seed = dest.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    const rows = (arr,render) => (arr||[]).map(render).join("");
    const dayHTML = rows(plan?.days, d=>`
      <div style="page-break-inside:avoid;margin-bottom:20px;border:1px solid #ddd;border-radius:8px;overflow:hidden">
        <div style="background:#1C1A14;color:#B8972E;padding:12px 16px;font-family:Georgia,serif;font-size:16px;font-weight:700">Jour ${d.num} — ${d.title||""} <span style="font-size:11px;color:#888;margin-left:8px">📍 ${d.location||""}</span></div>
        <div style="padding:14px 16px;font-size:12px;line-height:1.7;color:#333">
          ${d.morning?`<p><b>🌅 Matin :</b> ${d.morning}</p>`:""}
          ${d.afternoon?`<p style="margin-top:8px"><b>☀️ Après-midi :</b> ${d.afternoon}</p>`:""}
          ${d.evening?`<p style="margin-top:8px"><b>🌙 Soir :</b> ${d.evening}</p>`:""}
          ${d.tip?`<p style="margin-top:8px;color:#8A9E93;font-style:italic">💡 ${d.tip}</p>`:""}
        </div>
      </div>`);
    const siteHTML = rows(plan?.remarkable_sites, s=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${s.name}</b> <span style="color:#004A8F;font-size:10px">${s.label||""}</span><br><span style="color:#666;font-size:11px">📍 ${s.location||""}</span><br><span style="font-size:11px">${s.description||""}</span></div>`);
    const hotelHTML = rows(plan?.accommodations, h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — ${h.type||""} — 📍 ${h.location||""} — 💰 ${h.price||""}<br><span style="font-size:11px;font-style:italic">${h.why||""}</span></div>`);
    const restoHTML = rows(plan?.restaurants, r=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${r.name}</b> — ${r.cuisine||""} — 💰 ${r.price||""}<br><span style="font-size:11px">⭐ ${r.specialty||""} ${r.tip?"— 💡 "+r.tip:""}</span></div>`);
    const hikeHTML = rows(plan?.hikes, h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — 📏 ${h.distance||""} — ⏱️ ${h.duration||""} — 🎯 ${h.difficulty||""}<br><span style="font-size:11px">👁️ ${h.highlights||""}</span></div>`);
    const actHTML = rows(plan?.activities, a=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${a.name}</b> — ⏱️ ${a.duration||""} — 💰 ${a.price||""}<br><span style="font-size:11px;font-style:italic">💡 ${a.info||""}</span></div>`);
    const tipsHTML = (plan?.tips||[]).map((t,i)=>`<p style="margin-bottom:6px"><b>${i+1}.</b> ${t}</p>`).join("");
    const b = plan?.budget||{};
    const budgetHTML = `<table style="width:100%;border-collapse:collapse;font-size:12px"><tr><td style="padding:6px;border-bottom:1px solid #eee">🏨 Hébergement</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${b.accommodation||"-"}</td></tr><tr><td style="padding:6px;border-bottom:1px solid #eee">🍽️ Repas</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${b.meals||"-"}</td></tr><tr><td style="padding:6px;border-bottom:1px solid #eee">🎯 Activités</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${b.activities||"-"}</td></tr><tr><td style="padding:6px;border-bottom:1px solid #eee">🚗 Transport local</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${b.transport||"-"}</td></tr><tr style="font-weight:700;color:#C1440E"><td style="padding:8px">TOTAL ESTIMÉ</td><td style="text-align:right;padding:8px">${b.total||"-"}</td></tr></table>`;
    const sec = (title,html) => html?`<div style="page-break-before:always;padding:20px 0"><h2 style="font-family:Georgia,serif;font-size:20px;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">${title}</h2>${html}</div>`:"";
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sofia Planner — ${dest}</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#333}@media print{body{padding:0}}</style></head><body>
      <div style="background:#1C1A14;color:#fff;padding:24px;text-align:center;border-radius:8px;margin-bottom:24px">
        <div style="font-size:10px;letter-spacing:4px;color:#B8972E;margin-bottom:6px">✦ ON THE ROAD AGAIN ✦</div>
        <h1 style="font-family:Georgia,serif;font-size:32px;margin:0">${dest}</h1>
        <div style="font-size:11px;color:#aaa;margin-top:8px">${form.duree} JOURS · ${form.voyageurs.toUpperCase()} · ${(form.budget||"").replace(/^[^\s]+\s/,"").toUpperCase()}</div>
        ${form.dateStart?`<div style="font-size:10px;color:#666;margin-top:4px">${form.dateStart} → ${form.dateEnd}</div>`:""}
      </div>
      ${plan?.intro?`<div style="background:#f0f7f4;border-left:3px solid #2C4A3E;padding:14px 18px;margin-bottom:20px;font-style:italic;font-size:13px;color:#2C4A3E">${plan.intro}</div>`:""}
      <div><h2 style="font-family:Georgia,serif;font-size:20px;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">🗺️ Itinéraire Jour par Jour</h2>${dayHTML}</div>
      ${sec("🏛️ Sites Remarquables",siteHTML)}
      ${sec("🏨 Hébergements",hotelHTML)}
      ${sec("🍽️ Restaurants",restoHTML)}
      ${sec("🥾 Randonnées & Balades",hikeHTML)}
      ${sec("🎯 Activités",actHTML)}
      ${plan?.tips?.length?sec("💡 Conseils Pratiques",tipsHTML):""}
      ${plan?.budget?sec("💰 Budget Estimé",budgetHTML):""}
      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#aaa">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString('fr-FR')}</div>
      <script>window.onload=()=>window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const seed = form.destination.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const TABS = [
    {k:"days",    l:"🗺️ Itinéraire",       n:plan?.days?.length},
    {k:"sites",   l:"🏛️ Sites",            n:plan?.remarkable_sites?.length},
    {k:"hotels",  l:"🏨 Hébergements",     n:plan?.accommodations?.length},
    {k:"restos",  l:"🍽️ Restaurants",      n:plan?.restaurants?.length},
    {k:"hikes",   l:"🥾 Randonnées",       n:plan?.hikes?.length},
    {k:"acts",    l:"🎯 Activités",        n:plan?.activities?.length},
    {k:"tips",    l:"💡 Conseils",         n:plan?.tips?.length},
    {k:"budget",  l:"💰 Budget",           n:null},
    {k:"packing", l:"🧳 Ma Valise",        n:null},
  ];

  // Form field styles
  const inp = {width:"100%",padding:"10px 14px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none"};
  const lbl = {display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7};
  const errStyle = {fontFamily:"'DM Mono',monospace",fontSize:9,color:"#C1440E",marginTop:4,letterSpacing:1};
  const toggleBtn = (val,cur,onClick) => ({padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:cur===val?"#1C1A14":"transparent",borderColor:cur===val?"#1C1A14":"#EDE0C4",color:cur===val?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",width:"100%"});

  return (
    <>
      <Head><title>Sofia Planner · On The Road Again</title></Head>

      {/* HEADER */}
      <div className="no-print" style={{background:"#1C1A14",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:"#B8972E"}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,textTransform:"uppercase",color:"#555"}}>On The Road Again</div>
        </div>
        {phase==="result" && (
          <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={openPDF} style={{padding:"8px 14px",background:"#B8972E",color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>setShowMap(m=>!m)} style={{padding:"8px 14px",background:showMap?"#C1440E":"transparent",color:showMap?"#fff":"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>🗺️ Carte</button>
            <button onClick={()=>{setPhase("form");setPlan(null);setMsgs([]);}} style={{padding:"8px 14px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ══ FORM ══ */}
      {phase==="form" && (
        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:48,marginBottom:12}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,5vw,46px)",fontWeight:900,lineHeight:1.1}}>Planifie tes <em style={{color:"#C1440E"}}>vacances parfaites</em></h1>
            <p style={{color:"#8A9E93",fontSize:14,marginTop:10,maxWidth:500,margin:"10px auto 0"}}>Sofia génère ton plan complet avec itinéraire, sites, hébergements, restaurants, randonnées et valise</p>
          </div>

          <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"32px 28px",boxShadow:"6px 6px 0 #EDE0C4"}}>

            {/* 1 - Destination */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>📍 Destination & dates</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div id="destination">
                  <span style={lbl}>Destination *</span>
                  <input style={{...inp,borderColor:errors.destination?"#C1440E":undefined}} value={form.destination} onChange={ev=>setF("destination",ev.target.value)} placeholder="Côte Amalfitaine, Kyoto, Islande…"/>
                  {errors.destination && <div style={errStyle}>⚠️ {errors.destination}</div>}
                </div>
                <div>
                  <span style={lbl}>Ville de départ</span>
                  <input style={inp} value={form.depart} onChange={ev=>setF("depart",ev.target.value)} placeholder="Paris, Luxembourg, Bruxelles…"/>
                </div>
                <div id="dateStart">
                  <span style={lbl}>Date de départ</span>
                  <input type="date" style={inp} value={form.dateStart} onChange={ev=>handleDate("dateStart",ev.target.value)}/>
                </div>
                <div id="dateEnd">
                  <span style={lbl}>Date de retour</span>
                  <input type="date" style={inp} value={form.dateEnd} onChange={ev=>handleDate("dateEnd",ev.target.value)}/>
                  {errors.dateEnd && <div style={errStyle}>⚠️ {errors.dateEnd}</div>}
                </div>
              </div>
              <div>
                <span style={lbl}>
                  Durée : <strong style={{color:"#C1440E"}}>{form.duree} jour{form.duree>1?"s":""}</strong>
                  {form.dateStart&&form.dateEnd?" (calculée automatiquement)":" — ajuste si pas de dates"}
                </span>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {DUREES.map(d=><button key={d} onClick={()=>setF("duree",d)} style={{padding:"6px 12px",border:"1.5px solid",borderRadius:3,background:form.duree===d?"#B8972E":"transparent",borderColor:form.duree===d?"#B8972E":"#EDE0C4",color:form.duree===d?"#1C1A14":"#aaa",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer"}}>{d}j</button>)}
                </div>
              </div>
            </div>

            {/* 2 - Comment s'y rendre */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>✈️ Comment vous y rendre</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {TRANSPORT_TO.map(t=>{
                  const isAutre = t==="✏️ Autre";
                  return <button key={t} onClick={()=>setF("transport_to",t)} style={{...toggleBtn(t,form.transport_to),textAlign:"center"}}>{t}</button>;
                })}
              </div>
              {form.transport_to==="✏️ Autre" && <input style={{...inp,marginTop:10}} value={form.transport_to_autre} onChange={ev=>setF("transport_to_autre",ev.target.value)} placeholder="Précise ton moyen de transport…"/>}
            </div>

            {/* 3 - Voyageurs & Budget */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>👥 Voyageurs & budget</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="voyageurs">
                  <span style={lbl}>Voyageurs</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOYAGEURS.map(v=><button key={v} onClick={()=>setF("voyageurs",v)} style={toggleBtn(v,form.voyageurs)}>{v}</button>)}
                  </div>
                  {form.voyageurs==="✏️ Autre" && <input style={{...inp,marginTop:8}} value={form.voyageurs_autre} onChange={ev=>setF("voyageurs_autre",ev.target.value)} placeholder="Précise la composition du groupe…"/>}
                </div>
                <div id="budget">
                  <span style={lbl}>Budget *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=><button key={b} onClick={()=>setF("budget",b)} style={toggleBtn(b,form.budget)}>{b}</button>)}
                  </div>
                  {errors.budget && <div style={errStyle}>⚠️ {errors.budget}</div>}
                  {form.budget==="💵 Budget global à préciser" && <input style={{...inp,marginTop:8}} value={form.budget_global} onChange={ev=>setF("budget_global",ev.target.value)} placeholder="Ex: 3000€ pour 2 personnes, 7 jours…"/>}
                </div>
              </div>
            </div>

            {/* 4 - Style & hébergement */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>🎯 Style & hébergement</div>
              <div style={{marginBottom:16}}>
                <span style={lbl}>Style de voyage (plusieurs choix)</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES.map(s=><button key={s} onClick={()=>toggleStyle(s)} style={{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:form.styles.includes(s)?"#1C1A14":"transparent",borderColor:form.styles.includes(s)?"#1C1A14":"#EDE0C4",color:form.styles.includes(s)?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{s}</button>)}
                  <button onClick={()=>toggleStyle("✏️ Autre")} style={{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:form.styles.includes("✏️ Autre")?"#1C1A14":"transparent",borderColor:form.styles.includes("✏️ Autre")?"#1C1A14":"#EDE0C4",color:form.styles.includes("✏️ Autre")?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>✏️ Autre</button>
                </div>
                {form.styles.includes("✏️ Autre") && <input style={{...inp,marginTop:10}} value={form.style_autre} onChange={ev=>setF("style_autre",ev.target.value)} placeholder="Précise ton style de voyage…"/>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="hebergement">
                  <span style={lbl}>Hébergement *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=><button key={h} onClick={()=>setF("hebergement",h)} style={{...toggleBtn(h,form.hebergement),background:form.hebergement===h?"#2C4A3E":"transparent",borderColor:form.hebergement===h?"#2C4A3E":"#EDE0C4"}}>{h}</button>)}
                  </div>
                  {errors.hebergement && <div style={errStyle}>⚠️ {errors.hebergement}</div>}
                  {form.hebergement==="✏️ Autre" && <input style={{...inp,marginTop:8}} value={form.hebergement_autre} onChange={ev=>setF("hebergement_autre",ev.target.value)} placeholder="Précise ton hébergement…"/>}
                </div>
                <div>
                  <span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS.map(t=><button key={t} onClick={()=>setF("transport",t)} style={{...toggleBtn(t,form.transport),background:form.transport===t?"#1A3A5C":"transparent",borderColor:form.transport===t?"#1A3A5C":"#EDE0C4"}}>{t}</button>)}
                  </div>
                  {form.transport==="✏️ Autre" && <input style={{...inp,marginTop:8}} value={form.transport_autre} onChange={ev=>setF("transport_autre",ev.target.value)} placeholder="Précise ton transport sur place…"/>}
                </div>
              </div>
            </div>

            {/* 5 - Personnalisation */}
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>✨ Tes envies & besoins</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <span style={lbl}>Incontournables / Rêves</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.musts} onChange={ev=>setF("musts",ev.target.value)} placeholder="Voir le Fuji-san, manger dans une trattoria, voir un coucher de soleil…"/>
                </div>
                <div>
                  <span style={lbl}>À éviter absolument</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.avoid} onChange={ev=>setF("avoid",ev.target.value)} placeholder="Éviter les foules, pas de musées, pas de circuits organisés…"/>
                </div>
                <div>
                  <span style={lbl}>Besoins spéciaux</span>
                  <input style={inp} value={form.special} onChange={ev=>setF("special",ev.target.value)} placeholder="Végétarien, allergie gluten, mobilité réduite, peur des hauteurs…"/>
                </div>
                <div>
                  <span style={lbl}>Autres informations</span>
                  <input style={inp} value={form.notes} onChange={ev=>setF("notes",ev.target.value)} placeholder="Tout ce que Sofia doit savoir…"/>
                </div>
              </div>
            </div>

            <button onClick={generate} style={{width:"100%",padding:"17px",background:"#C1440E",color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:20,cursor:"pointer"}}>
              Créer mon plan de vacances avec Sofia →
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:2}}>* Destination · Budget · Hébergement sont obligatoires</div>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading" && (
        <div style={{textAlign:"center",padding:"120px 24px"}}>
          <style>{`@keyframes sp{to{transform:rotate(360deg)}} @keyframes fade{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
          <div style={{fontSize:54,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:"italic",marginTop:20}}>Sofia prépare ton aventure…</div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","🏛️ Sites","🏨 Hébergements","🍽️ Restos","🥾 Randos","🎯 Activités","🧳 Valise"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:"#B8972E",animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result" && plan && (
        <div style={{display:"flex",height:"calc(100vh - 60px)"}}>

          {/* LEFT */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:"#1C1A14",flexShrink:0}}>
              <img src={`https://picsum.photos/seed/${seed}/1200/500`} alt={form.destination} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,textTransform:"uppercase",color:"#B8972E",marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,42px)",fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>{form.destination}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.duree} JOURS · {(form.voyageurs==="✏️ Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()} · {(form.budget||"").replace(/^[^\s]+\s/,"").toUpperCase()}
                </div>
                {(form.dateStart||form.dateEnd) && <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4,letterSpacing:2}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>

            {/* Map */}
            {showMap && (
              <div style={{flexShrink:0,borderBottom:"1px solid #EDE0C4"}}>
                <div style={{background:"#1C1A14",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>🗺️ Carte — {form.destination}</span>
                  <a href={`https://www.google.com/maps/search/${e(form.destination)}`} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:"#4285F4",color:"#fff",borderRadius:3,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1}}>Ouvrir dans Maps</a>
                </div>
                <iframe src={`https://maps.google.com/maps?q=${e(form.destination)}&output=embed&z=11`} width="100%" height="280" style={{border:"none",display:"block"}} loading="lazy" title="Carte"/>
              </div>
            )}

            {/* Intro */}
            {plan.intro && (
              <div style={{padding:"14px 20px",background:"#f0f7f4",borderBottom:"1px solid #EDE0C4",display:"flex",gap:10,alignItems:"flex-start",flexShrink:0}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div style={{fontSize:13,lineHeight:1.65,color:"#2C4A3E",fontStyle:"italic"}}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #EDE0C4",background:"#fff",flexShrink:0}}>
              {TABS.map(t=>(
                <button key={t.k} onClick={()=>setTab(t.k)}
                  style={{padding:"10px 12px",border:"none",borderBottom:`2px solid ${tab===t.k?"#C1440E":"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:tab===t.k?"#C1440E":"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.l} {t.n>0&&<span style={{background:"#EDE0C4",color:"#888",borderRadius:10,padding:"1px 5px",fontSize:8}}>{t.n}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>

                {tab==="days" && (plan.days||[]).map((d,i)=><DayCard key={i} d={d} dest={form.destination}/>)}
                {tab==="sites" && (<><LinkRow type="remarkable_sites" dest={form.destination}/><div style={{height:12}}/>{(plan.remarkable_sites||[]).map((s,i)=><ItemCard key={i} item={s} type="remarkable_sites" i={i} dest={form.destination}/>)}</>)}
                {tab==="hotels" && (plan.accommodations||[]).map((h,i)=><ItemCard key={i} item={h} type="accommodations" i={i} dest={form.destination}/>)}
                {tab==="restos" && (plan.restaurants||[]).map((r,i)=><ItemCard key={i} item={r} type="restaurants" i={i} dest={form.destination}/>)}
                {tab==="hikes" && (plan.hikes||[]).map((h,i)=><ItemCard key={i} item={h} type="hikes" i={i} dest={form.destination}/>)}
                {tab==="acts" && (plan.activities||[]).map((a,i)=><ItemCard key={i} item={a} type="activities" i={i} dest={form.destination}/>)}

                {tab==="tips" && (
                  <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                    {(plan.tips||[]).map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(plan.tips||[]).length-1?"1px solid #EDE0C4":"none"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:"#B8972E",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:13,lineHeight:1.7,color:"#4a4640"}}>{t}</div>
                      </div>
                    ))}
                  </div>
                )}

                {tab==="budget" && plan.budget && (
                  <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                    {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport local",plan.budget.transport]].map(([l,v])=>v&&(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #EDE0C4"}}>
                        <span style={{fontSize:14,color:"#4a4640"}}>{l}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"#1C1A14",fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 0"}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#C1440E"}}>{plan.budget.total}</span>
                    </div>
                    <Note id="budget-note"/>
                  </div>
                )}

                {tab==="packing" && <PackingSection packing={plan.packing_essentials} dest={form.destination}/>}

              </div>
            </div>

            <div style={{textAlign:"center",padding:10,borderTop:"1px solid #EDE0C4",fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#aaa",textTransform:"uppercase",flexShrink:0}}>
              Sofia Planner · On The Road Again
            </div>
          </div>

          {/* RIGHT - Chat */}
          <div style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid #EDE0C4"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #EDE0C4",background:"#FAF6EE",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>Chat avec Sofia</div>
                  <div style={{fontSize:10,color:"#aaa",marginTop:1}}>Demande des changements → le plan se met à jour</div>
                </div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <style>{`@keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant" && <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?"#C1440E":"#FAF6EE",color:m.role==="user"?"#fff":"#1C1A14",fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid #EDE0C4":"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoad && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                    <div style={{padding:"9px 14px",background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:"14px 14px 14px 3px"}}>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"#B8972E",margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>
            <div style={{borderTop:"1px solid #EDE0C4",padding:"10px 12px",background:"#fff",flexShrink:0}}>
              <div style={{fontSize:10,color:"#B8972E",fontFamily:"'DM Mono',monospace",letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>💡 Exemples</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {["Change le jour 2","Ajoute une randonnée","Hébergement moins cher","Version végétarienne"].map(s=>(
                  <button key={s} onClick={()=>setChatIn(s)} style={{padding:"4px 8px",background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",color:"#888"}}>{s}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={chatIn} onChange={ev=>setChatIn(ev.target.value)} onKeyDown={ev=>ev.key==="Enter"&&sendChat()}
                  placeholder="Demande un changement à Sofia…" disabled={chatLoad}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid #EDE0C4",borderRadius:20,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1C1A14",outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad}
                  style={{padding:"9px 15px",background:chatIn.trim()&&!chatLoad?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatIn.trim()&&!chatLoad?"pointer":"not-allowed",fontSize:15}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
