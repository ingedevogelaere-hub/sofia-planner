import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const STYLES = ["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping"];
const HEBERGEMENTS = ["🏨 Hôtel","🏠 Location","⛺ Camping","🛏️ B&B","💎 Luxe"];
const BUDGETS = ["🌱 Petit budget","💼 Moyen","✨ Confort","💎 Luxe"];
const DUREES = [3,4,5,6,7,8,10,14,21];

export default function SofiaPlanner() {
  const [phase, setPhase] = useState("form");
  const [form, setForm] = useState({ destination:"", dates:"", duree:7, voyageurs:"2 adultes", budget:"", styles:[], hebergement:"", notes:"" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const setF = (k,v) => setForm(f => ({...f, [k]:v}));
  const toggleStyle = s => setF("styles", form.styles.includes(s) ? form.styles.filter(x=>x!==s) : [...form.styles,s]);

  const generate = async () => {
    if (!form.destination.trim() || !form.budget || !form.hebergement) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/plan", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ formData: form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItinerary(data.reply);
      setMessages([
        { role:"user", content:`Planifie mon voyage de ${form.duree} jours à ${form.destination}` },
        { role:"assistant", content:data.reply }
      ]);
      setPhase("result");
    } catch(e) {
      alert("Erreur : " + e.message);
      setPhase("form");
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
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

  const fmt = text => text.split("\n").map((l,i) => <span key={i}>{l}{i < text.split("\n").length-1 && <br/>}</span>);

  return (
    <>
      <Head>
        <title>Sofia Planner · On The Road Again</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap" rel="stylesheet"/>
      </Head>
      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FAF6EE;color:#1C1A14;min-height:100vh}
        @media print{.no-print{display:none!important}.print-only{display:block!important}body{background:#fff!important}}
        .print-only{display:none}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#1C1A14",padding:"14px 24px",display:"flex",alignItems:"center",gap:14}} className="no-print">
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌍</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#FAF6EE"}}>Sofia <span style={{color:"#B8972E",fontStyle:"italic"}}>Planner</span></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#666"}}>On The Road Again</div>
        </div>
        {phase==="result" && (
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button onClick={()=>window.print()} style={{padding:"8px 16px",background:"#B8972E",color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>{setPhase("form");setMessages([]);setItinerary("");}} style={{padding:"8px 16px",background:"transparent",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",color:"#666"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* FORM */}
      {phase==="form" && (
        <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 60px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:42,marginBottom:12}}>🗺️</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,5vw,42px)",fontWeight:900,lineHeight:1}}>
              Planifie tes <em style={{color:"#C1440E"}}>vacances</em>
            </h1>
            <p style={{color:"#8A9E93",fontSize:14,marginTop:10}}>Remplis le formulaire · Sofia génère ton plan complet · tu discutes et ajustes</p>
          </div>

          <div style={{background:"#fff",border:"1.5px solid #EDE0C4",borderRadius:6,padding:"28px 24px",boxShadow:"5px 5px 0 #EDE0C4"}}>

            {/* Destination */}
            <div style={{marginBottom:20}}>
              <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>📍 Destination *</span>
              <input value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Ex : Côte Amalfitaine, Kyoto, Islande, Grau-du-Roi…"
                style={{width:"100%",padding:"11px 14px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#1C1A14",outline:"none"}}/>
            </div>

            {/* Dates + Durée */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div>
                <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>📅 Dates</span>
                <input value={form.dates} onChange={e=>setF("dates",e.target.value)} placeholder="Ex : 15-22 juillet 2025"
                  style={{width:"100%",padding:"11px 14px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none"}}/>
              </div>
              <div>
                <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>⏱️ Durée</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {DUREES.map(d=>(
                    <button key={d} onClick={()=>setF("duree",d)}
                      style={{padding:"7px 11px",border:"1.5px solid",borderRadius:3,background:form.duree===d?"#B8972E":"transparent",borderColor:form.duree===d?"#B8972E":"#EDE0C4",color:form.duree===d?"#1C1A14":"#aaa",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer"}}>
                      {d}j
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voyageurs + Budget */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div>
                <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>👥 Voyageurs</span>
                <select value={form.voyageurs} onChange={e=>setF("voyageurs",e.target.value)}
                  style={{width:"100%",padding:"11px 14px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none"}}>
                  <option>Solo</option><option>2 adultes</option><option>Famille avec enfants</option><option>Groupe d'amis</option><option>Couple senior</option>
                </select>
              </div>
              <div>
                <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>💰 Budget *</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {BUDGETS.map(b=>(
                    <button key={b} onClick={()=>setF("budget",b)}
                      style={{padding:"7px 10px",border:"1.5px solid",borderRadius:3,background:form.budget===b?"#B8972E":"transparent",borderColor:form.budget===b?"#B8972E":"#EDE0C4",color:form.budget===b?"#1C1A14":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer"}}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Styles */}
            <div style={{marginBottom:20}}>
              <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>🎯 Style de voyage</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {STYLES.map(s=>(
                  <button key={s} onClick={()=>toggleStyle(s)}
                    style={{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:form.styles.includes(s)?"#1C1A14":"transparent",borderColor:form.styles.includes(s)?"#1C1A14":"#EDE0C4",color:form.styles.includes(s)?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Hébergement */}
            <div style={{marginBottom:20}}>
              <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>🏨 Hébergement *</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {HEBERGEMENTS.map(h=>(
                  <button key={h} onClick={()=>setF("hebergement",h)}
                    style={{padding:"8px 14px",border:"1.5px solid",borderRadius:4,background:form.hebergement===h?"#1C1A14":"transparent",borderColor:form.hebergement===h?"#1C1A14":"#EDE0C4",color:form.hebergement===h?"#FAF6EE":"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{marginBottom:24}}>
              <span style={{display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E",marginBottom:7}}>💬 Envies particulières (optionnel)</span>
              <textarea value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Allergies alimentaires, mobilité réduite, incontournables, éviter les foules, passionné de photo…"
                style={{width:"100%",padding:"11px 14px",border:"1.5px solid #EDE0C4",borderRadius:4,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none",resize:"none",height:80}}/>
            </div>

            <button onClick={generate} disabled={!form.destination.trim()||!form.budget||!form.hebergement}
              style={{width:"100%",padding:16,background:form.destination.trim()&&form.budget&&form.hebergement?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:4,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:19,cursor:form.destination.trim()&&form.budget&&form.hebergement?"pointer":"not-allowed"}}>
              Créer mon plan de vacances →
            </button>
            <div style={{textAlign:"center",marginTop:10,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#ccc",letterSpacing:2}}>* champs obligatoires</div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {phase==="loading" && (
        <div style={{textAlign:"center",padding:"100px 24px"}}>
          <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
          <div style={{fontSize:48,display:"inline-block",animation:"sp 1.8s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",marginTop:20,color:"#1C1A14"}}>Sofia prépare votre plan…</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:"#8A9E93",marginTop:10}}>Hébergements · Restaurants · Randonnées · Activités</div>
        </div>
      )}

      {/* RESULT */}
      {phase==="result" && (
        <div style={{display:"flex",height:"calc(100vh - 66px)"}}>

          {/* LEFT - Itinerary */}
          <div style={{flex:1,overflowY:"auto",borderRight:"1px solid #EDE0C4"}}>
            {/* Hero photo */}
            <div style={{position:"relative",height:180,overflow:"hidden",background:"#1C1A14"}}>
              <img src={`https://picsum.photos/seed/${seed}/900/300`} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.5}}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,38px)",fontWeight:900,color:"#fff"}}>{form.destination}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:3,color:"#EDE0C4",marginTop:8}}>
                  {form.duree} JOURS · {form.voyageurs.toUpperCase()} · {form.budget.replace(/^\S+\s/,"").toUpperCase()}
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{padding:"24px 28px",maxWidth:700,margin:"0 auto"}}>
              <div style={{fontSize:14,lineHeight:1.8,color:"#2a2820",whiteSpace:"pre-wrap"}}>
                {itinerary}
              </div>
            </div>

            {/* Print footer */}
            <div className="print-only" style={{textAlign:"center",padding:16,borderTop:"1px solid #EDE0C4",fontFamily:"'DM Mono',monospace",fontSize:8,color:"#aaa",letterSpacing:2,textTransform:"uppercase"}}>
              Sofia Planner · On The Road Again
            </div>
          </div>

          {/* RIGHT - Chat */}
          <div className="no-print" style={{width:360,display:"flex",flexDirection:"column",background:"#fff"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #EDE0C4",background:"#FAF6EE"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#B8972E"}}>💬 Discuter avec Sofia</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:3}}>Pose des questions, demande des ajustements…</div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {messages.slice(1).map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant" && (
                      <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:8,flexShrink:0,marginTop:2}}>🌍</div>
                    )}
                    <div style={{maxWidth:"85%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 16px 3px 16px":"16px 16px 16px 3px",background:m.role==="user"?"#C1440E":"#FAF6EE",color:m.role==="user"?"#fff":"#1C1A14",fontSize:13,lineHeight:1.6,border:m.role==="assistant"?"1px solid #EDE0C4":"none"}}>
                      {fmt(m.content)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🌍</div>
                    <div style={{padding:"10px 14px",background:"#FAF6EE",border:"1px solid #EDE0C4",borderRadius:"16px 16px 16px 3px"}}>
                      <style>{`@keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"#B8972E",margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>

            <div style={{borderTop:"1px solid #EDE0C4",padding:"12px"}}>
              <div style={{display:"flex",gap:8}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                  placeholder="Ex : Ajoute une randonnée le jour 3…" disabled={loading}
                  style={{flex:1,padding:"10px 14px",border:"1.5px solid #EDE0C4",borderRadius:20,background:"#FAF6EE",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#1C1A14",outline:"none"}}/>
                <button onClick={send} disabled={!input.trim()||loading}
                  style={{padding:"10px 16px",background:input.trim()&&!loading?"#C1440E":"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:input.trim()&&!loading?"pointer":"not-allowed",fontSize:16}}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
