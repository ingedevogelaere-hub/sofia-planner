import Head from "next/head";
import { useState, useRef, useEffect } from "react";

/* ─── Constants ─────────────────────────────────────────── */
const STYLES = ["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS = ["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse"];
const BUDGETS = ["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const TRANSPORTS = ["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];

const LINKS = {
  accommodations: [
    {l:"Booking.com", c:"#003580", u:(d)=>`https://www.booking.com/search.html?ss=${enc(d)}`},
    {l:"Airbnb",      c:"#FF5A5F", u:(d)=>`https://www.airbnb.fr/s/${enc(d)}/homes`},
    {l:"Hotels.com",  c:"#C00",    u:(d)=>`https://fr.hotels.com/search.do?q-destination=${enc(d)}`},
    {l:"Hostelworld", c:"#F60",    u:(d)=>`https://www.hostelworld.com/findabed.php/ChosenCity.${enc(d)}`},
  ],
  restaurants: [
    {l:"TripAdvisor", c:"#00AA6C", u:(d)=>`https://www.tripadvisor.fr/Search?q=restaurants+${enc(d)}`},
    {l:"TheFork",     c:"#00B551", u:(d)=>`https://www.thefork.fr/recherche?city=${enc(d)}`},
    {l:"Google Maps", c:"#4285F4", u:(d)=>`https://www.google.com/maps/search/restaurants+${enc(d)}`},
  ],
  hikes: [
    {l:"AllTrails",  c:"#3D6B35", u:(d)=>`https://www.alltrails.com/explore?q=${enc(d)}`},
    {l:"Visorando", c:"#5D8B3C", u:(d)=>`https://www.visorando.com/randonnee-${d.toLowerCase().replace(/\s+/g,"-")}.html`},
    {l:"Komoot",    c:"#6EA8C8", u:(d)=>`https://www.komoot.com/discover/${enc(d)}`},
  ],
  activities: [
    {l:"Viator",       c:"#142A51", u:(d)=>`https://www.viator.com/searchResults/all?text=${enc(d)}`},
    {l:"GetYourGuide", c:"#FF6B35", u:(d)=>`https://www.getyourguide.fr/s/?q=${enc(d)}`},
    {l:"Civitatis",    c:"#E84D3D", u:(d)=>`https://www.civitatis.com/fr/?buscar=${enc(d)}`},
  ],
  remarkable_sites: [
    {l:"Grands Sites France", c:"#004A8F", u:()=>`https://www.grandsitedefrance.com`},
    {l:"UNESCO",              c:"#009EDB", u:()=>`https://whc.unesco.org/fr/list/`},
    {l:"Parcs Nationaux",     c:"#2D7A27", u:()=>`https://www.parcsnationaux.fr`},
    {l:"National Trust UK",   c:"#5C4A1A", u:()=>`https://www.nationaltrust.org.uk`},
    {l:"Google Maps",         c:"#4285F4", u:(d)=>`https://www.google.com/maps/search/${enc(d)}`},
  ],
};

const enc = (s) => encodeURIComponent(s || "");

/* ─── Sub-components ─────────────────────────────────────── */
function NoteField({ id }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  return (
    <div style={{marginTop:8}}>
      <button className="note-toggle" onClick={()=>setOpen(o=>!o)}>
        📝 {open ? "Masquer la note" : val ? "Modifier ma note" : "Ajouter une note personnelle"}
      </button>
      {open && (
        <textarea className="note-area" value={val} onChange={e=>setVal(e.target.value)}
          placeholder="Tes notes, idées, questions pour ce point…"/>
      )}
      {!open && val && (
        <div style={{fontSize:12,color:"#888",fontStyle:"italic",marginTop:4}}>📌 {val}</div>
      )}
    </div>
  );
}

function LinkBar({ type, dest }) {
  const links = LINKS[type] || [];
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
      {links.map(l=>(
        <a key={l.l} href={l.u(dest)} target="_blank" rel="noopener noreferrer"
          style={{padding:"5px 11px",background:l.c,color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,display:"inline-flex",alignItems:"center",gap:4}}>
          🔗 {l.l}
        </a>
      ))}
    </div>
  );
}

function CardPhoto({ seed, height=140 }) {
  return (
    <div style={{height,overflow:"hidden",background:"#EDE0C4",flexShrink:0}}>
      <img src={`https://picsum.photos/seed/${seed}/600/300`} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
    </div>
  );
}

function DayCard({ day, dest }) {
  const seed = `${dest}-day${day.num}`;
  return (
    <div className="card" style={{marginBottom:16}}>
      <CardPhoto seed={seed} height={120}/>
      <div style={{padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"#1C1A14",color:"#B8972E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,flexShrink:0}}>{day.num}</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#1C1A14"}}>{day.title}</div>
            {day.location && <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:"#B8972E",textTransform:"uppercase",marginTop:2}}>📍 {day.location}</div>}
          </div>
        </div>
        {day.morning   && <div style={{marginBottom:8}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#B8972E",letterSpacing:1,textTransform:"uppercase"}}>🌅 Matin</span><div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginTop:3}}>{day.morning}</div></div>}
        {day.afternoon && <div style={{marginBottom:8}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#B8972E",letterSpacing:1,textTransform:"uppercase"}}>☀️ Après-midi</span><div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginTop:3}}>{day.afternoon}</div></div>}
        {day.evening   && <div style={{marginBottom:8}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#B8972E",letterSpacing:1,textTransform:"uppercase"}}>🌙 Soir</span><div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginTop:3}}>{day.evening}</div></div>}
        {day.tip && <div style={{background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:4,padding:"8px 12px",fontSize:12,color:"#8A9E93",fontStyle:"italic",marginTop:8}}>💡 {day.tip}</div>}
        <NoteField id={`day-${day.num}`}/>
      </div>
    </div>
  );
}

function SiteCard({ site, i, dest }) {
  return (
    <div className="card" style={{marginBottom:12}}>
      <CardPhoto seed={`site-${dest}-${i}`} height={100}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-start",flexWrap:"wrap",marginBottom:8}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,flex:1}}>{site.name}</div>
          {site.label && <span className="tag" style={{background:"#004A8F",color:"#fff"}}>{site.label}</span>}
        </div>
        {site.location && <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#B8972E",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>📍 {site.location}</div>}
        <div style={{fontSize:13,lineHeight:1.65,color:"#4a4640"}}>{site.description}</div>
        {site.website && <a href={site.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:8,padding:"5px 11px",background:"#004A8F",color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1}}>🔗 Site officiel</a>}
        <NoteField id={`site-${i}`}/>
      </div>
    </div>
  );
}

function HotelCard({ h, i, dest }) {
  return (
    <div className="card" style={{marginBottom:12}}>
      <CardPhoto seed={`hotel-${dest}-${i}`} height={100}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:4}}>{h.name}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {h.type     && <span className="tag" style={{background:"#EDE0C4",color:"#1C1A14"}}>{h.type}</span>}
          {h.location && <span className="tag" style={{background:"#FAF6EE",color:"#8A9E93"}}>📍 {h.location}</span>}
          {h.price    && <span className="tag" style={{background:"#f0f7f4",color:"#2C4A3E"}}>💰 {h.price}</span>}
        </div>
        {h.why && <div style={{fontSize:13,lineHeight:1.6,color:"#4a4640",fontStyle:"italic"}}>✨ {h.why}</div>}
        <LinkBar type="accommodations" dest={dest}/>
        <NoteField id={`hotel-${i}`}/>
      </div>
    </div>
  );
}

function RestaurantCard({ r, i, dest }) {
  return (
    <div className="card" style={{marginBottom:12}}>
      <CardPhoto seed={`resto-${dest}-${i}`} height={100}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:6}}>{r.name}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {r.cuisine   && <span className="tag" style={{background:"#fff5f0",color:"#8B2500"}}>🍽️ {r.cuisine}</span>}
          {r.price     && <span className="tag" style={{background:"#FAF6EE",color:"#8A9E93"}}>💰 {r.price}</span>}
        </div>
        {r.specialty && <div style={{fontSize:13,color:"#4a4640",marginBottom:4}}>⭐ À commander : <strong>{r.specialty}</strong></div>}
        {r.tip       && <div style={{fontSize:12,color:"#8A9E93",fontStyle:"italic"}}>💡 {r.tip}</div>}
        <LinkBar type="restaurants" dest={dest}/>
        <NoteField id={`resto-${i}`}/>
      </div>
    </div>
  );
}

function HikeCard({ h, i, dest }) {
  const diffColor = h.difficulty==="Facile"?"#2D7A27":h.difficulty==="Difficile"?"#C1440E":"#B8972E";
  return (
    <div className="card" style={{marginBottom:12}}>
      <CardPhoto seed={`hike-${dest}-${i}`} height={100}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:6}}>{h.name}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {h.distance   && <span className="tag" style={{background:"#f2f7f2",color:"#3D5A3E"}}>📏 {h.distance}</span>}
          {h.duration   && <span className="tag" style={{background:"#f2f7f2",color:"#3D5A3E"}}>⏱️ {h.duration}</span>}
          {h.difficulty && <span className="tag" style={{background:diffColor+"22",color:diffColor}}>🎯 {h.difficulty}</span>}
        </div>
        {h.highlights && <div style={{fontSize:13,lineHeight:1.6,color:"#4a4640"}}>👁️ {h.highlights}</div>}
        <LinkBar type="hikes" dest={dest}/>
        <NoteField id={`hike-${i}`}/>
      </div>
    </div>
  );
}

function ActivityCard({ a, i, dest }) {
  return (
    <div className="card" style={{marginBottom:12}}>
      <CardPhoto seed={`activity-${dest}-${i}`} height={100}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:6}}>{a.name}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {a.duration && <span className="tag" style={{background:"#f0f4f8",color:"#1A3A5C"}}>⏱️ {a.duration}</span>}
          {a.price    && <span className="tag" style={{background:"#f0f4f8",color:"#1A3A5C"}}>💰 {a.price}</span>}
        </div>
        {a.info && <div style={{fontSize:13,color:"#4a4640",fontStyle:"italic"}}>💡 {a.info}</div>}
        <LinkBar type="activities" dest={dest}/>
        <NoteField id={`act-${i}`}/>
      </div>
    </div>
  );
}

function MapEmbed({ destination }) {
  return (
    <div style={{borderRadius:8,overflow:"hidden",border:"1.5px solid #EDE0C4",marginBottom:24}}>
      <div style={{background:"#1C1A14",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>🗺️ Carte — {destination}</div>
        <a href={`https://www.google.com/maps/search/${enc(destination)}`} target="_blank" rel="noopener noreferrer"
          style={{padding:"5px 10px",background:"#4285F4",color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1}}>
          Ouvrir Google Maps
        </a>
      </div>
      <iframe
        src={`https://maps.google.com/maps?q=${enc(destination)}&output=embed&z=11`}
        width="100%" height="300" style={{border:"none",display:"block"}} loading="lazy" title="Carte"
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function SofiaPlanner() {
  const [phase, setPhase]         = useState("form");
  const [plan, setPlan]           = useState(null);
  const [messages, setMessages]   = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("days");
  const [showMap, setShowMap]     = useState(false);
  const [form, setForm]           = useState({
    destination:"", depart:"", dateStart:"", dateEnd:"", duree:7,
    voyageurs:"2 adultes", budget:"", styles:[], hebergement:"",
    transport:"", special:"", musts:"", avoid:"", notes:""
  });
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleStyle = s => setF("styles", form.styles.includes(s)?form.styles.filter(x=>x!==s):[...form.styles,s]);

  // Auto-calculate days from dates
  const handleDate = (key, val) => {
    setF(key, val);
    const start = key==="dateStart" ? val : form.dateStart;
    const end   = key==="dateEnd"   ? val : form.dateEnd;
    if (start && end) {
      const diff = Math.round((new Date(end)-new Date(start))/(1000*60*60*24));
      if (diff > 0) setF("duree", diff);
    }
  };

  const canGo = form.destination.trim() && form.budget && form.hebergement;

  const generate = async () => {
    if (!canGo) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/plan", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.type === "plan") {
        setPlan(data.data);
        setMessages([{ role:"assistant", content: data.data.intro || "Voici votre plan de vacances !" }]);
        setPhase("result");
      } else {
        alert("Erreur de format. Réessaie.");
        setPhase("form");
      }
    } catch(e) { alert("Erreur : "+e.message); setPhase("form"); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()||chatLoading) return;
    const userMsg = { role:"user", content:chatInput.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: newMsgs.map(m=>({role:m.role,content:m.content})) })
      });
      const data = await res.json();
      const reply = data.type==="chat" ? data.reply : data.data?.intro || "Voici la mise à jour !";
      setMessages([...newMsgs, { role:"assistant", content:reply }]);
    } catch {
      setMessages([...newMsgs, { role:"assistant", content:"Désolée, une erreur est survenue !" }]);
    }
    setChatLoading(false);
  };

  const doPrint = () => {
    window.print();
  };

  const tabs = [
    { key:"days",       label:"🗺️ Itinéraire",       count:plan?.days?.length },
    { key:"sites",      label:"🏛️ Sites remarquables", count:plan?.remarkable_sites?.length },
    { key:"hotels",     label:"🏨 Hébergements",      count:plan?.accommodations?.length },
    { key:"restaurants",label:"🍽️ Restaurants",       count:plan?.restaurants?.length },
    { key:"hikes",      label:"🥾 Randonnées",        count:plan?.hikes?.length },
    { key:"activities", label:"🎯 Activités",         count:plan?.activities?.length },
    { key:"tips",       label:"💡 Conseils",          count:plan?.tips?.length },
    { key:"budget",     label:"💰 Budget",            count:null },
  ];

  /* ─── FORM ─── */
  const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid #EDE0C4", borderRadius:4, background:"#FAF6EE", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#1C1A14", outline:"none" };
  const lbl = { display:"block", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#B8972E", marginBottom:7 };

  return (
    <>
      <Head><title>Sofia Planner · On The Road Again</title></Head>

      {/* ── HEADER ── */}
      <div className="no-print" style={{background:"#1C1A14",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:"#B8972E"}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,textTransform:"uppercase",color:"#555"}}>On The Road Again</div>
        </div>
        {phase==="result" && (
          <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={doPrint} style={{padding:"8px 14px",background:"#B8972E",color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>setShowMap(m=>!m)} style={{padding:"8px 14px",background:showMap?"#C1440E":"transparent",color:showMap?"#fff":"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>🗺️ Carte</button>
            <button onClick={()=>{setPhase("form");setPlan(null);setMessages([]);}} style={{padding:"8px 14px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ── FORM ── */}
      {phase==="form" && (
        <div style={{maxWidth:740,margin:"0 auto",padding:"32px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:48,marginBottom:14}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,5vw,46px)",fontWeight:900,lineHeight:1.1}}>
              Planifie tes <em style={{color:"#C1440E"}}>vacances parfaites</em>
            </h1>
            <p style={{color:"#8A9E93",fontSize:14,marginTop:12,maxWidth:500,margin:"12px auto 0"}}>
              Sofia génère un plan complet avec itinéraire, sites remarquables, hébergements, restaurants, randonnées et budget
            </p>
          </div>

          <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"32px 28px",boxShadow:"6px 6px 0 #EDE0C4"}}>

            {/* Destination */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>📍 Destination & dates</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={{marginBottom:0}}>
                  <span style={lbl}>Destination *</span>
                  <input style={inp} value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Côte Amalfitaine, Kyoto, Islande…"/>
                </div>
                <div>
                  <span style={lbl}>Ville de départ</span>
                  <input style={inp} value={form.depart} onChange={e=>setF("depart",e.target.value)} placeholder="Paris, Luxembourg, Bruxelles…"/>
                </div>
                <div>
                  <span style={lbl}>Date de départ</span>
                  <input type="date" style={inp} value={form.dateStart} onChange={e=>handleDate("dateStart",e.target.value)}/>
                </div>
                <div>
                  <span style={lbl}>Date de retour</span>
                  <input type="date" style={inp} value={form.dateEnd} onChange={e=>handleDate("dateEnd",e.target.value)}/>
                </div>
              </div>
              <div style={{marginTop:14}}>
                <span style={lbl}>Durée : <strong style={{color:"#C1440E"}}>{form.duree} jours</strong> {form.dateStart&&form.dateEnd?"(calculé automatiquement)":"(ajuste si pas de dates)"}</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                  {[2,3,4,5,6,7,8,10,12,14,21].map(d=>(
                    <button key={d} onClick={()=>setF("duree",d)} style={{padding:"5px 10px",border:"1.5px solid",borderRadius:3,background:form.duree===d?"#B8972E":"transparent",borderColor:form.duree===d?"#B8972E":"#EDE0C4",color:form.duree===d?"#1C1A14":"#aaa",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer"}}>{d}j</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voyageurs & Budget */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>👥 Voyageurs & budget</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <span style={lbl}>Voyageurs</span>
                  <select style={inp} value={form.voyageurs} onChange={e=>setF("voyageurs",e.target.value)}>
                    <option>Solo</option><option>2 adultes</option>
                    <option>Famille avec bébé/enfants (0-6 ans)</option>
                    <option>Famille avec enfants (7-12 ans)</option>
                    <option>Famille avec ados</option>
                    <option>Groupe d'amis</option>
                    <option>Couple senior</option>
                  </select>
                </div>
                <div>
                  <span style={lbl}>Budget par personne/jour *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=>(
                      <button key={b} onClick={()=>setF("budget",b)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.budget===b?"#1C1A14":"transparent",borderColor:form.budget===b?"#1C1A14":"#EDE0C4",color:form.budget===b?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{b}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Style & hébergement */}
            <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid #EDE0C4"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>🎯 Style & hébergement</div>
              <div style={{marginBottom:16}}>
                <span style={lbl}>Style de voyage</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES.map(s=>(
                    <button key={s} onClick={()=>toggleStyle(s)} style={{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:form.styles.includes(s)?"#1C1A14":"transparent",borderColor:form.styles.includes(s)?"#1C1A14":"#EDE0C4",color:form.styles.includes(s)?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <span style={lbl}>Hébergement *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=>(
                      <button key={h} onClick={()=>setF("hebergement",h)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.hebergement===h?"#2C4A3E":"transparent",borderColor:form.hebergement===h?"#2C4A3E":"#EDE0C4",color:form.hebergement===h?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{h}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS.map(t=>(
                      <button key={t} onClick={()=>setF("transport",t)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.transport===t?"#1A3A5C":"transparent",borderColor:form.transport===t?"#1A3A5C":"#EDE0C4",color:form.transport===t?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personnalisation */}
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>✨ Tes envies</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <span style={lbl}>Incontournables / Rêves</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Voir le Fuji-san, manger dans une trattoria, voir un lever de soleil…"/>
                </div>
                <div>
                  <span style={lbl}>À éviter</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Éviter les foules, pas de musées, pas de circuits organisés…"/>
                </div>
                <div>
                  <span style={lbl}>Besoins spéciaux</span>
                  <input style={inp} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie gluten, mobilité réduite, peur des hauteurs…"/>
                </div>
                <div>
                  <span style={lbl}>Autres informations</span>
                  <input style={inp} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Tout ce que Sofia doit savoir…"/>
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={!canGo} style={{width:"100%",padding:"17px",background:canGo?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:20,cursor:canGo?"pointer":"not-allowed"}}>
              Créer mon plan de vacances avec Sofia →
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:2}}>* champs obligatoires : Destination · Budget · Hébergement</div>
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {phase==="loading" && (
        <div style={{textAlign:"center",padding:"120px 24px"}}>
          <style>{`@keyframes sp{to{transform:rotate(360deg)}} @keyframes fade{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
          <div style={{fontSize:54,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:"italic",marginTop:20,color:"#1C1A14"}}>Sofia prépare ton aventure…</div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","🏛️ Sites","🏨 Hébergements","🍽️ Restos","🥾 Randos","🎯 Activités","💰 Budget"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:"#B8972E",animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase==="result" && plan && (
        <div className="result-layout" style={{display:"flex",height:"calc(100vh - 60px)"}}>

          {/* LEFT - content */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:"#1C1A14",flexShrink:0}}>
              <img src={`https://picsum.photos/seed/${enc(form.destination)}/1200/500`} alt={form.destination} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,textTransform:"uppercase",color:"#B8972E",marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,42px)",fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>{form.destination}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.duree} JOURS · {form.voyageurs.toUpperCase()} · {form.budget.replace(/^[^\s]+\s/,"").toUpperCase()}
                </div>
                {(form.dateStart||form.dateEnd) && <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4,letterSpacing:2}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>

            {/* Map */}
            {showMap && (
              <div className="no-print" style={{flexShrink:0,borderBottom:"1px solid #EDE0C4"}}>
                <MapEmbed destination={form.destination}/>
              </div>
            )}

            {/* Intro */}
            {plan.intro && (
              <div style={{padding:"16px 24px",background:"#f0f7f4",borderBottom:"1px solid #EDE0C4",display:"flex",gap:12,alignItems:"flex-start",flexShrink:0}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌍</div>
                <div style={{fontSize:14,lineHeight:1.65,color:"#2C4A3E",fontStyle:"italic"}}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div className="no-print" style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #EDE0C4",background:"#fff",flexShrink:0}}>
              {tabs.map(t=>(
                <button key={t.key} onClick={()=>setActiveTab(t.key)}
                  style={{padding:"11px 14px",border:"none",borderBottom:`2px solid ${activeTab===t.key?"#C1440E":"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:activeTab===t.key?"#C1440E":"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.label} {t.count>0 && <span style={{background:"#EDE0C4",color:"#888",borderRadius:10,padding:"1px 6px",fontSize:8}}>{t.count}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 20px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>

                {activeTab==="days" && plan.days?.map((d,i)=>(
                  <DayCard key={i} day={d} dest={form.destination}/>
                ))}

                {activeTab==="sites" && (
                  <>
                    <LinkBar type="remarkable_sites" dest={form.destination}/>
                    <div style={{height:12}}/>
                    {plan.remarkable_sites?.map((s,i)=><SiteCard key={i} site={s} i={i} dest={form.destination}/>)}
                  </>
                )}

                {activeTab==="hotels" && plan.accommodations?.map((h,i)=>(
                  <HotelCard key={i} h={h} i={i} dest={form.destination}/>
                ))}

                {activeTab==="restaurants" && plan.restaurants?.map((r,i)=>(
                  <RestaurantCard key={i} r={r} i={i} dest={form.destination}/>
                ))}

                {activeTab==="hikes" && plan.hikes?.map((h,i)=>(
                  <HikeCard key={i} h={h} i={i} dest={form.destination}/>
                ))}

                {activeTab==="activities" && plan.activities?.map((a,i)=>(
                  <ActivityCard key={i} a={a} i={i} dest={form.destination}/>
                ))}

                {activeTab==="tips" && (
                  <div className="card" style={{padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                    {plan.tips?.map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<plan.tips.length-1?"1px solid #EDE0C4":"none"}}>
                        <div style={{width:24,height:24,borderRadius:"50%",background:"#B8972E",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:14,lineHeight:1.65,color:"#4a4640"}}>{t}</div>
                      </div>
                    ))}
                    <NoteField id="tips-global"/>
                  </div>
                )}

                {activeTab==="budget" && plan.budget && (
                  <div className="card" style={{padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                    {[
                      {l:"🏨 Hébergement",  v:plan.budget.accommodation},
                      {l:"🍽️ Repas",         v:plan.budget.meals},
                      {l:"🎯 Activités",     v:plan.budget.activities},
                      {l:"🚗 Transport local",v:plan.budget.transport},
                    ].map((row,i)=>row.v && (
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #EDE0C4"}}>
                        <span style={{fontSize:14,color:"#4a4640"}}>{row.l}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"#1C1A14",fontWeight:700}}>{row.v}</span>
                      </div>
                    ))}
                    {plan.budget.total && (
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 0",marginTop:4}}>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#C1440E"}}>{plan.budget.total}</span>
                      </div>
                    )}
                    <NoteField id="budget-note"/>
                  </div>
                )}

              </div>
            </div>

            {/* Print footer */}
            <div style={{textAlign:"center",padding:12,borderTop:"1px solid #EDE0C4",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,color:"#aaa",textTransform:"uppercase",flexShrink:0}}>
              Sofia Planner · On The Road Again
            </div>
          </div>

          {/* RIGHT - Chat */}
          <div className="chat-panel" style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid #EDE0C4"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #EDE0C4",background:"#FAF6EE",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>Chat avec Sofia</div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:1}}>Questions, ajustements, idées…</div>
                </div>
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <style>{`@keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {messages.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant" && (
                      <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>
                    )}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?"#C1440E":"#FAF6EE",color:m.role==="user"?"#fff":"#1C1A14",fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid #EDE0C4":"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
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
              <div style={{display:"flex",gap:8}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder="Ajoute une randonnée le jour 3…" disabled={chatLoading}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid #EDE0C4",borderRadius:20,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1C1A14",outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatInput.trim()||chatLoading}
                  style={{padding:"9px 15px",background:chatInput.trim()&&!chatLoading?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatInput.trim()&&!chatLoading?"pointer":"not-allowed",fontSize:15}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
