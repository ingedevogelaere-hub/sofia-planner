import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const STYLES = ["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS = ["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse"];
const BUDGETS = ["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const DUREES = [2,3,4,5,6,7,8,10,12,14,21];
const TRANSPORTS = ["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];

const SECTIONS = ["ITINÉRAIRE","SITES REMARQUABLES","HÉBERGEMENTS","RESTAURANTS","RANDONNÉES","ACTIVITÉS","CONSEILS","BUDGET ESTIMÉ"];

const SMETA = {
  "ITINÉRAIRE":         { icon:"🗺️", bg:"#1C1A14", light:"#FAF6EE", img:"travel,road" },
  "SITES REMARQUABLES": { icon:"🏛️", bg:"#4A1A00", light:"#fff8f0", img:"heritage,monument,landscape" },
  "HÉBERGEMENTS":       { icon:"🏨", bg:"#2C4A3E", light:"#f0f7f4", img:"hotel,room,cozy" },
  "RESTAURANTS":        { icon:"🍽️", bg:"#8B2500", light:"#fff5f0", img:"food,restaurant,cuisine" },
  "RANDONNÉES":         { icon:"🥾", bg:"#3D5A3E", light:"#f2f7f2", img:"hiking,trail,mountain" },
  "ACTIVITÉS":          { icon:"🎯", bg:"#1A3A5C", light:"#f0f4f8", img:"tourism,experience,culture" },
  "CONSEILS":           { icon:"💡", bg:"#5C4A1A", light:"#fdf8f0", img:"travel,tips,map" },
  "BUDGET ESTIMÉ":      { icon:"💰", bg:"#3A1A5C", light:"#f5f0fd", img:"budget,finance" },
};

function Links({ dest, section }) {
  const enc = encodeURIComponent(dest);
  const links = {
    "HÉBERGEMENTS": [
      { label:"Booking.com", url:`https://www.booking.com/search.html?ss=${enc}`, color:"#003580" },
      { label:"Airbnb", url:`https://www.airbnb.fr/s/${enc}/homes`, color:"#FF5A5F" },
      { label:"Hotels.com", url:`https://fr.hotels.com/search.do?q-destination=${enc}`, color:"#C00" },
      { label:"Hostelworld", url:`https://www.hostelworld.com/findabed.php/ChosenCity.${enc}`, color:"#F60" },
    ],
    "RESTAURANTS": [
      { label:"TripAdvisor", url:`https://www.tripadvisor.fr/Search?q=restaurants+${enc}`, color:"#00AA6C" },
      { label:"TheFork", url:`https://www.thefork.fr/recherche?city=${enc}`, color:"#00B551" },
      { label:"Google Maps", url:`https://www.google.com/maps/search/restaurants+${enc}`, color:"#4285F4" },
    ],
    "RANDONNÉES": [
      { label:"AllTrails", url:`https://www.alltrails.com/explore?q=${enc}`, color:"#3D6B35" },
      { label:"Visorando", url:`https://www.visorando.com/randonnee-${enc.toLowerCase()}.html`, color:"#5D8B3C" },
      { label:"Komoot", url:`https://www.komoot.com/discover/${enc}`, color:"#6EA8C8" },
    ],
    "ACTIVITÉS": [
      { label:"Viator", url:`https://www.viator.com/searchResults/all?text=${enc}`, color:"#142A51" },
      { label:"GetYourGuide", url:`https://www.getyourguide.fr/s/?q=${enc}`, color:"#FF6B35" },
      { label:"Civitatis", url:`https://www.civitatis.com/fr/?buscar=${enc}`, color:"#E84D3D" },
    ],
    "SITES REMARQUABLES": [
      { label:"Grands Sites France", url:`https://www.grandsitedefrance.com`, color:"#004A8F" },
      { label:"UNESCO", url:`https://whc.unesco.org/fr/list/`, color:"#009EDB" },
      { label:"Parcs Nationaux", url:`https://www.parcsnationaux.fr`, color:"#2D7A27" },
    ],
  };
  const list = links[section];
  if (!list) return null;
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
      {list.map(l=>(
        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
          style={{padding:"6px 12px",background:l.color,color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:1,textDecoration:"none",display:"inline-block"}}>
          🔗 {l.label}
        </a>
      ))}
    </div>
  );
}

function parseContent(text) {
  const result = {};
  let current = null;
  for (const line of text.split("\n")) {
    const match = SECTIONS.find(s => line.includes(`##${s}##`));
    if (match) { current = match; result[match] = ""; }
    else if (current) result[current] += line + "\n";
  }
  return Object.keys(result).length > 0 ? result : null;
}

export default function SofiaPlanner() {
  const [phase, setPhase]       = useState("form");
  const [form, setForm]         = useState({ destination:"", depart:"", dates:"", duree:7, voyageurs:"2 adultes", budget:"", styles:[], hebergement:"", transport:"", special:"", musts:"", avoid:"", notes:"" });
  const [sections, setSections] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("ITINÉRAIRE");
  const [showMap, setShowMap]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleStyle = s => setF("styles", form.styles.includes(s)?form.styles.filter(x=>x!==s):[...form.styles,s]);
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
      const parsed = parseContent(data.reply);
      setSections(parsed);
      setMessages([
        { role:"user", content:`Plan ${form.duree}j à ${form.destination}` },
        { role:"assistant", content: data.reply }
      ]);
      setPhase("result");
    } catch(e) { alert("Erreur : "+e.message); setPhase("form"); }
  };

  const send = async () => {
    if (!input.trim()||loading) return;
    const userMsg = { role:"user", content:input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role:"assistant", content:data.reply }]);
    } catch(e) {
      setMessages([...newMsgs, { role:"assistant", content:"Désolée, une erreur est survenue !" }]);
    }
    setLoading(false);
  };

  const seed = form.destination.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(form.destination)}&output=embed&z=10`;

  const inp  = { width:"100%", padding:"10px 14px", border:"1.5px solid #EDE0C4", borderRadius:4, background:"#FAF6EE", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#1C1A14", outline:"none" };
  const lbl  = { display:"block", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#B8972E", marginBottom:7 };
  const fg   = { marginBottom:18 };
  const sec  = { marginBottom:24, paddingBottom:24, borderBottom:"1px solid #EDE0C4" };

  const fmt = t => t.split("\n").map((l,i)=><span key={i}>{l}{i<t.split("\n").length-1&&<br/>}</span>);

  return (
    <>
      <Head>
        <title>Sofia Planner · On The Road Again</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap" rel="stylesheet"/>
      </Head>
      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FAF6EE;color:#1C1A14;min-height:100vh}
        a{color:inherit}
        @media print{
          .no-print{display:none!important}
          .print-break{page-break-before:always}
          body{background:#fff!important;font-size:11px}
          .result-left{width:100%!important;height:auto!important;overflow:visible!important}
          .result-right{display:none!important}
          .section-content{white-space:pre-wrap;line-height:1.7}
        }
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{background:"#1C1A14",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,.3)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌍</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:"#B8972E"}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,textTransform:"uppercase",color:"#555"}}>On The Road Again</div>
        </div>
        {phase==="result" && (
          <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>window.print()} style={{padding:"8px 14px",background:"#B8972E",color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>setShowMap(m=>!m)} style={{padding:"8px 14px",background:showMap?"#C1440E":"transparent",color:showMap?"#fff":"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>🗺️ Carte</button>
            <button onClick={()=>{setPhase("form");setMessages([]);setSections(null);setShowMap(false);}} style={{padding:"8px 14px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ══ FORM ══ */}
      {phase==="form" && (
        <div style={{maxWidth:740,margin:"0 auto",padding:"32px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:48,marginBottom:14}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,5vw,46px)",fontWeight:900,lineHeight:1.1}}>
              Planifie tes <em style={{color:"#C1440E"}}>vacances parfaites</em>
            </h1>
            <p style={{color:"#8A9E93",fontSize:14,marginTop:12,maxWidth:520,margin:"12px auto 0"}}>
              Sofia génère un plan complet : itinéraire, sites remarquables, hébergements, restaurants, randonnées, activités et budget
            </p>
          </div>

          <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:8,padding:"32px 28px",boxShadow:"6px 6px 0 #EDE0C4"}}>

            {/* Destination & dates */}
            <div style={sec}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>📍 Destination & dates</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={fg}><span style={lbl}>Destination *</span>
                  <input style={inp} value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Côte Amalfitaine, Kyoto, Islande…"/>
                </div>
                <div style={fg}><span style={lbl}>Ville de départ</span>
                  <input style={inp} value={form.depart} onChange={e=>setF("depart",e.target.value)} placeholder="Paris, Luxembourg, Bruxelles…"/>
                </div>
                <div style={fg}><span style={lbl}>Dates envisagées</span>
                  <input style={inp} value={form.dates} onChange={e=>setF("dates",e.target.value)} placeholder="10-17 août 2025"/>
                </div>
                <div style={fg}><span style={lbl}>Durée</span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {DUREES.map(d=>(
                      <button key={d} onClick={()=>setF("duree",d)} style={{padding:"6px 11px",border:"1.5px solid",borderRadius:3,background:form.duree===d?"#B8972E":"transparent",borderColor:form.duree===d?"#B8972E":"#EDE0C4",color:form.duree===d?"#1C1A14":"#aaa",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer"}}>{d}j</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Voyageurs & budget */}
            <div style={sec}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>👥 Voyageurs & budget</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={fg}><span style={lbl}>Voyageurs</span>
                  <select style={inp} value={form.voyageurs} onChange={e=>setF("voyageurs",e.target.value)}>
                    <option>Solo</option><option>2 adultes</option>
                    <option>Famille avec enfants (0-6 ans)</option>
                    <option>Famille avec enfants (7-12 ans)</option>
                    <option>Famille avec ados</option>
                    <option>Groupe d'amis</option>
                    <option>Couple senior</option>
                    <option>Voyage scolaire</option>
                  </select>
                </div>
                <div style={fg}><span style={lbl}>Budget par personne/jour *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=>(
                      <button key={b} onClick={()=>setF("budget",b)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.budget===b?"#1C1A14":"transparent",borderColor:form.budget===b?"#1C1A14":"#EDE0C4",color:form.budget===b?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{b}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Style & hébergement */}
            <div style={sec}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>🎯 Style & hébergement</div>
              <div style={fg}><span style={lbl}>Style de voyage (plusieurs choix)</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES.map(s=>(
                    <button key={s} onClick={()=>toggleStyle(s)} style={{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:form.styles.includes(s)?"#1C1A14":"transparent",borderColor:form.styles.includes(s)?"#1C1A14":"#EDE0C4",color:form.styles.includes(s)?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={fg}><span style={lbl}>Hébergement préféré *</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=>(
                      <button key={h} onClick={()=>setF("hebergement",h)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.hebergement===h?"#2C4A3E":"transparent",borderColor:form.hebergement===h?"#2C4A3E":"#EDE0C4",color:form.hebergement===h?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{h}</button>
                    ))}
                  </div>
                </div>
                <div style={fg}><span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS.map(t=>(
                      <button key={t} onClick={()=>setF("transport",t)} style={{padding:"8px 12px",border:"1.5px solid",borderRadius:4,textAlign:"left",background:form.transport===t?"#1A3A5C":"transparent",borderColor:form.transport===t?"#1A3A5C":"#EDE0C4",color:form.transport===t?"#FAF6EE":"#777",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personnalisation */}
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:16}}>✨ Personnalisation</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={fg}><span style={lbl}>Incontournables / Bucket list</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Voir le Fuji-san, manger dans une trattoria locale…"/>
                </div>
                <div style={fg}><span style={lbl}>À éviter</span>
                  <textarea style={{...inp,height:80,resize:"none"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Éviter les foules, pas de musées, pas de guides…"/>
                </div>
                <div style={fg}><span style={lbl}>Besoins spéciaux</span>
                  <input style={inp} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie gluten, mobilité réduite…"/>
                </div>
                <div style={fg}><span style={lbl}>Autres notes</span>
                  <input style={inp} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Tout ce que Sofia doit savoir…"/>
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={!canGo} style={{width:"100%",padding:"17px",background:canGo?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:20,cursor:canGo?"pointer":"not-allowed"}}>
              Créer mon plan de vacances avec Sofia →
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:2}}>* champs obligatoires</div>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading" && (
        <div style={{textAlign:"center",padding:"120px 24px"}}>
          <style>{`@keyframes sp{to{transform:rotate(360deg)}} @keyframes fade{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
          <div style={{fontSize:54,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:"italic",marginTop:20}}>Sofia prépare votre aventure…</div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","🏛️ Sites remarquables","🏨 Hébergements","🍽️ Restaurants","🥾 Randonnées","🎯 Activités"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:"#B8972E",animation:`fade 2s ${i*0.25}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result" && (
        <div style={{display:"flex",height:"calc(100vh - 60px)"}}>

          {/* LEFT — content */}
          <div className="result-left" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:"#1C1A14",flexShrink:0}}>
              <img src={`https://picsum.photos/seed/${seed}/1200/500`} alt={form.destination} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.5}}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,textTransform:"uppercase",color:"#B8972E",marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,40px)",fontWeight:900,color:"#fff",lineHeight:1}}>{form.destination}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.duree} JOURS · {form.voyageurs.toUpperCase()} · {form.budget.replace(/^[^\s]+\s/,"").toUpperCase()}
                </div>
                {form.dates && <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#888",marginTop:4,letterSpacing:2}}>{form.dates.toUpperCase()}</div>}
              </div>
            </div>

            {/* Map */}
            {showMap && (
              <div className="no-print" style={{height:240,flexShrink:0,borderBottom:"1px solid #EDE0C4"}}>
                <iframe src={mapSrc} width="100%" height="240" style={{border:"none",display:"block"}} loading="lazy" title="Carte"/>
              </div>
            )}

            {/* Tabs */}
            <div className="no-print" style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #EDE0C4",background:"#fff",flexShrink:0}}>
              {SECTIONS.map(s=>{
                const m = SMETA[s]||{icon:"📄"};
                return (
                  <button key={s} onClick={()=>setActiveTab(s)}
                    style={{padding:"10px 14px",border:"none",borderBottom:`2px solid ${activeTab===s?"#C1440E":"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:activeTab===s?"#C1440E":"#888",whiteSpace:"nowrap",flexShrink:0}}>
                    {m.icon} {s}
                  </button>
                );
              })}
            </div>

            {/* Section content */}
            {sections ? (
              <div style={{flex:1,overflowY:"auto"}}>
                {SECTIONS.map((s,i) => {
                  const m = SMETA[s]||{icon:"📄",bg:"#1C1A14",light:"#FAF6EE",img:"travel"};
                  const content = sections[s]||"";
                  const isActive = activeTab === s;
                  return (
                    <div key={s} className={i>0?"print-break":""} style={{display:isActive?"block":"none"}}>
                      {/* Section header with photo */}
                      <div style={{position:"relative",height:120,overflow:"hidden",background:m.bg}}>
                        <img src={`https://picsum.photos/seed/${seed}-${s}/800/200`} alt={s} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.4}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 24px",gap:16}}>
                          <div style={{fontSize:32}}>{m.icon}</div>
                          <div>
                            <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:4}}>On The Road Again</div>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#fff"}}>{s}</div>
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div style={{padding:"12px 24px",background:m.light,borderBottom:"1px solid #EDE0C4"}} className="no-print">
                        <Links dest={form.destination} section={s}/>
                      </div>

                      {/* Text */}
                      <div className="section-content" style={{padding:"24px 28px",fontSize:14,lineHeight:1.8,color:"#2a2820",whiteSpace:"pre-wrap",background:"#fff"}}>
                        {content.trim() || "Aucun contenu pour cette section."}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{flex:1,padding:"24px 28px",fontSize:14,lineHeight:1.8,color:"#2a2820",whiteSpace:"pre-wrap",overflowY:"auto"}}>
                {messages[1]?.content || ""}
              </div>
            )}
          </div>

          {/* RIGHT — Chat */}
          <div className="result-right no-print" style={{width:340,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid #EDE0C4"}}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid #EDE0C4",background:"#FAF6EE"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>Chat avec Sofia</div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:1}}>Pose des questions, demande des ajustements</div>
                </div>
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {messages.slice(1).map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant" && (
                      <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>
                    )}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?"#C1440E":"#FAF6EE",color:m.role==="user"?"#fff":"#1C1A14",fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid #EDE0C4":"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                    <div style={{padding:"9px 14px",background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:"14px 14px 14px 3px"}}>
                      <style>{`@keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"#B8972E",margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>

            <div style={{borderTop:"1px solid #EDE0C4",padding:"10px 12px",background:"#fff"}}>
              <div style={{display:"flex",gap:8}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                  placeholder="Ex : Ajoute une randonnée le jour 3…" disabled={loading}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid #EDE0C4",borderRadius:20,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1C1A14",outline:"none"}}/>
                <button onClick={send} disabled={!input.trim()||loading}
                  style={{padding:"9px 15px",background:input.trim()&&!loading?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:input.trim()&&!loading?"pointer":"not-allowed",fontSize:15}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
