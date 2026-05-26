/**
 * pages/index.js
 * ─────────────────────────────────────────────────────────
 * Page principale et composant racine de Sofia Planner.
 * Gère les trois phases de l'application :
 *   1. "form"    — formulaire de création du voyage (destination,
 *                   dates, budget, style, hébergement, transport…)
 *   2. "loading" — écran d'attente pendant la génération IA
 *   3. "result"  — affichage du plan avec onglets (itinéraire,
 *                   agenda, incontournables, hébergements, restos,
 *                   sorties, conseils, budget, valise) + chat Sofia.
 * Importe tous les composants, hooks et utilitaires du projet.
 */

import Head from "next/head";
import { useState, useRef, useEffect } from "react";

import { C, TP_MARKER, STYLES_LIST, HEBERGEMENTS, BUDGETS, TRANSPORTS_LOCAL, TRANSPORT_TO, VOYAGEURS, enc, fixDest, selBtn, pillBtn } from "../lib/constants";
import { buildMapUrl } from "../lib/links";
import { usePhoto } from "../hooks/usePhoto";
import { Photo, HeroPhoto, Chip, LinkBar, NoteField, CityInput } from "../components/ui";
import { DayCard, OutingCard, ItemCard } from "../components/cards";
import { AgendaSection, PackingSection, DateRangePicker, FileUpload } from "../components/sections";
import { generatePDF } from "../utils/pdf";

// ─── Main Component ──────────────────────────────────────────
export default function SofiaPlanner() {
  const [phase, setPhase] = useState("form");
  const [plan, setPlan] = useState(null);
  const [errors, setErrors] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [tab, setTab] = useState("days");
  const [genError, setGenError] = useState(null);
  const [outingDayFilter, setOutingDayFilter] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (genError && typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }, [genError]);

  const [form, setForm] = useState({
    destination:"", depart:"", dateStart:"", dateEnd:"", nuits:7,
    voyageurs:"", voyageurs_autre:"", budget:"", budget_global:"",
    styles:[], style_autre:"", hebergement:"", hebergement_autre:"",
    transport:"", transport_autre:"", transport_to:[], transport_to_autre:"",
    special:"", musts:"", avoid:"", notes:"", pmr:false
  });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setF(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v]);

  const handleDate = (k, v) => {
    setF(k, v);
    const start = k === "dateStart" ? v : form.dateStart;
    const end   = k === "dateEnd"   ? v : form.dateEnd;
    if (start && end) {
      const diff = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
      if (diff > 0) { setF("nuits", diff); setErrors(e => ({ ...e, dateEnd: undefined })); }
      else setErrors(e => ({ ...e, dateEnd: "La date de retour doit être après le départ" }));
    }
  };

  const validate = () => {
    const e = {};
    if (!uploadedFile && !form.destination.trim()) e.destination = "Destination obligatoire";
    if (!uploadedFile && !form.budget)             e.budget      = "Budget obligatoire";
    if (!uploadedFile && !form.hebergement)        e.hebergement = "Hébergement obligatoire";
    if (form.dateStart && form.dateEnd && new Date(form.dateEnd) <= new Date(form.dateStart))
      e.dateEnd = "La date de retour doit être après le départ";
    setErrors(e);
    if (Object.keys(e).length > 0)
      document.getElementById("field-" + Object.keys(e)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
    return Object.keys(e).length === 0;
  };

  const generate = async () => {
    if (!validate()) return;
    setPhase("loading"); setGenError(null);
    try {
      const body = { formData: form.destination || form.budget ? form : null };
      if (uploadedFile) { body.fileData = uploadedFile.data; body.fileType = uploadedFile.type; }
      const res  = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 529 || data.error === "OVERLOADED") {
        setPhase("form");
        setGenError({ type: "overloaded", msg: "L'IA est temporairement surchargée. Patiente 30 secondes et clique à nouveau sur \"Créer mon plan\"." });
        return;
      }
      if (!res.ok) throw new Error(data.error || "Erreur serveur " + res.status);
      if (data.type === "plan") {
        const p = { ...data.data, destination: fixDest(form.destination || data.data.destination || "Voyage") };
        setPlan(p); setMsgs([{ role: "assistant", content: data.data.intro || "Votre plan est prêt !" }]); setPhase("result");
      } else {
        setPhase("form");
        setGenError({ type: "error", msg: "La génération n'a pas abouti. Vérifie tes champs et relance." });
      }
    } catch (err) {
      setPhase("form");
      setGenError({ type: "error", msg: "Génération échouée. Clique sur \"Créer mon plan\" pour réessayer." });
    }
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const userMsg  = { role: "user", content: chatIn.trim() };
    const newMsgs  = [...msgs, userMsg];
    setMsgs(newMsgs); setChatIn(""); setChatLoad(true);
    try {
      const res  = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), currentPlan: plan }) });
      const data = await res.json();
      if (data.type === "plan" && data.data?.days) {
        const updatedPlan = { ...data.data, destination: plan?.destination || form.destination || "Voyage" };
        if (updatedPlan.days?.length) setF("nuits", updatedPlan.days.length);
        setPlan(updatedPlan);
        setMsgs([...newMsgs, { role: "assistant", content: "✅ Plan mis à jour ! Consulte les onglets. — Sofia 🌍" }]);
      } else if (data.type === "chat" && data.reply) {
        setMsgs([...newMsgs, { role: "assistant", content: data.reply }]);
      } else {
        setMsgs([...newMsgs, { role: "assistant", content: "⏳ Les serveurs sont surchargés en ce moment. Réessaie dans 1 minute ! — Sofia 🌍" }]);
      }
    } catch { setMsgs([...newMsgs, { role: "assistant", content: "Désolée, erreur de connexion. Réessaie ! — Sofia 🌍" }]); }
    setChatLoad(false);
  };

  const destDisplay = plan?.destination || fixDest(form.destination) || "";

  const transportPlaceholder = (() => {
    const dep = form.depart && form.depart.length > 2 ? form.depart : "Luxembourg";
    if ((form.transport_to || []).includes("⛴️ Ferry"))           return "ex: ferry depuis Nice ou Marseille (port + horaire)";
    if ((form.transport_to || []).includes("✈️ Avion"))           return `ex: vol depuis ${dep}, heure de départ, escale ?`;
    if ((form.transport_to || []).includes("🚄 Train"))           return `ex: départ gare de ${dep}, connexions et durée`;
    if ((form.transport_to || []).includes("🚗 Ma voiture") || form.transport_to?.includes("🚗 Voiture louée"))
                                                                    return "ex: durée estimée, autoroutes prévues, parking";
    if ((form.transport_to || []).includes("🚌 Bus"))             return "ex: compagnie, numéro de bus, durée";
    return "Ajoute des détails utiles sur ton trajet…";
  })();

  const TABS = [
    { k:"days",    l:"🗺️ Itinéraire",        n: plan?.days?.length },
    { k:"agenda",  l:"📅 À noter",            n: plan?.agenda?.length },
    { k:"sites",   l:"⭐ Incontournables",    n: plan?.remarkable_sites?.length },
    { k:"hotels",  l:"🏨 Hébergements",       n: plan?.accommodations?.length },
    { k:"restos",  l:"🍽️ Restaurants",        n: plan?.restaurants?.length },
    { k:"outings", l:"🎯 Sorties & Activités",n: plan?.outings?.length },
    { k:"tips",    l:"💡 Conseils",           n: plan?.tips?.length },
    { k:"budget",  l:"💰 Budget",             n: null },
    { k:"packing", l:"🧳 Ma Valise",          n: null },
  ];

  const inp    = { width:"100%", padding:"11px 14px", border:"none", background:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.ink, outline:"none", boxSizing:"border-box" };
  const inpBox = { border:"1.5px solid "+C.parch, borderRadius:6, background:C.cream, overflow:"hidden" };
  const lbl    = { display:"block", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:C.gold, marginBottom:7 };
  const secT   = t => <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:14 }}>{t}</div>;

  return (
    <>
      <Head><title>Sofia Planner · On The Road Again</title></Head>
      <style>{`
        *{box-sizing:border-box}
        body{font-family:'DM Sans',sans-serif;background:#FAF6EE;color:#1C1A14;margin:0}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#FAF6EE}::-webkit-scrollbar-thumb{background:#EDE0C4;border-radius:2px}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fade{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @media(max-width:768px){.result-layout{flex-direction:column!important;height:auto!important}.chat-panel{width:100%!important;height:360px!important;border-left:none!important;border-top:1px solid #EDE0C4!important}.fg2{grid-template-columns:1fr!important}.fg4{grid-template-columns:1fr 1fr!important}}
        @media print{.np{display:none!important}body{background:#fff!important}}
      `}</style>

      {/* HEADER */}
      <div className="np" style={{ background:C.forest, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,.25)" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#B8972E,#C1440E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🌍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#FAF6EE" }}>Sofia <em style={{ color:C.gold }}>Planner</em></div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:2, color:"#8fb8a8" }}>On The Road Again</div>
        </div>
        {phase === "result" && (
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={() => generatePDF(plan, form, destDisplay)} style={{ padding:"8px 12px", background:C.gold, color:"#fff", border:"none", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1, textTransform:"uppercase", cursor:"pointer" }}>📄 PDF</button>
            <a href={buildMapUrl(plan, destDisplay)} target="_blank" rel="noopener noreferrer" style={{ padding:"8px 12px", background:"transparent", color:"#888", border:"1px solid #333", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:8, cursor:"pointer", display:"inline-block", textDecoration:"none" }}>🗺️ Carte ↗</a>
            <button onClick={() => { setPhase("form"); setPlan(null); setMsgs([]); }} style={{ padding:"8px 12px", background:"transparent", color:"#666", border:"1px solid #333", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:8, cursor:"pointer" }}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ─── FORM ─── */}
      {phase === "form" && (
        <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 32px 80px" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:44, marginBottom:10 }}>🌍</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,5vw,44px)", fontWeight:900, lineHeight:1.1 }}>Planifie tes <em style={{ color:C.rust }}>vacances parfaites</em></h1>
            <p style={{ color:C.mist, fontSize:14, marginTop:10, maxWidth:480, margin:"10px auto 0" }}>Sofia crée ton plan complet avec itinéraire, incontournables, hébergements, restaurants, sorties et valise</p>
          </div>

          {genError && (
            <div style={{ background:genError.type==="overloaded"?"#fff3cd":"#fce4ec", border:"1.5px solid "+(genError.type==="overloaded"?C.gold:"#c62828"), borderRadius:6, padding:"14px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{genError.type==="overloaded"?"⏳":"⚠️"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, color:genError.type==="overloaded"?C.gold:"#c62828", marginBottom:2, textTransform:"uppercase" }}>{genError.type==="overloaded"?"Serveurs surchargés":"Génération échouée"}</div>
                <div style={{ fontSize:13, color:"#555" }}>{genError.msg}</div>
              </div>
              <button onClick={() => setGenError(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#aaa", flexShrink:0, padding:"0 4px" }}>×</button>
            </div>
          )}

          <div style={{ background:"#fff", border:"1.5px solid "+C.parch, borderRadius:8, padding:"24px 20px", boxShadow:"5px 5px 0 "+C.parch }}>
            <FileUpload file={uploadedFile} onFile={setUploadedFile} onClear={() => setUploadedFile(null)} />

            {/* Destination & dates */}
            <div style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid "+C.parch }}>
              {secT("📍 Destination & dates")}
              <div className="fg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div id="field-destination">
                  <span style={lbl}>Destination {!uploadedFile && "*"}</span>
                  <CityInput value={form.destination} onChange={v => setF("destination", v)} placeholder="Corse, Bruxelles, Kyoto…" style={{ borderColor: errors.destination ? "#C1440E" : C.parch }} />
                  {errors.destination && <div style={{ fontSize:11, color:C.rust, marginTop:4 }}>⚠️ {errors.destination}</div>}
                </div>
                <div>
                  <span style={lbl}>Ville de départ</span>
                  <CityInput value={form.depart} onChange={v => setF("depart", v)} placeholder="Luxembourg, Paris, Bruxelles…" />
                </div>
              </div>
              <div>
                <span style={lbl}>📅 Dates du séjour</span>
                <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ flex:"0 0 auto", minWidth:0, width:"min(340px,100%)" }}>
                    <DateRangePicker dateStart={form.dateStart} dateEnd={form.dateEnd} nuits={form.nuits} onDateStart={v => handleDate("dateStart", v)} onDateEnd={v => handleDate("dateEnd", v)} onNuits={v => setF("nuits", v)} />
                  </div>
                  <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8, paddingTop:4 }}>
                    {form.dateStart && form.dateEnd ? (
                      <div style={{ background:C.cream, border:"1.5px solid "+C.parch, borderRadius:8, padding:"14px 16px" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:C.gold, marginBottom:6 }}>🌙 {form.nuits} nuits</div>
                        <div style={{ fontSize:12, color:C.mist, marginBottom:4 }}>📅 Du {new Date(form.dateStart+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"long"})}</div>
                        <div style={{ fontSize:12, color:C.mist }}>🏠 Au {new Date(form.dateEnd+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}</div>
                      </div>
                    ) : (
                      <div style={{ background:C.cream, border:"1.5px solid "+C.parch, borderRadius:8, padding:"14px 16px" }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:8 }}>Comment ça marche ?</div>
                        <div style={{ fontSize:12, color:C.mist, lineHeight:1.7 }}>1️⃣ Clique sur la date de départ<br/>2️⃣ Puis sur la date de retour<br/>3️⃣ Les nuits sont calculées automatiquement</div>
                      </div>
                    )}
                  </div>
                </div>
                {errors.dateEnd && <div style={{ fontSize:11, color:C.rust, marginTop:4 }}>⚠️ {errors.dateEnd}</div>}
              </div>
            </div>

            {/* Transport aller */}
            <div style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid "+C.parch }}>
              {secT("✈️ Comment vous y rendre")}
              <div style={{ fontSize:12, color:C.mist, marginBottom:10 }}>Plusieurs étapes possibles — ex : 🚗 + ⛴️ Ferry</div>
              <div className="fg4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7, marginBottom:8 }}>
                {TRANSPORT_TO.map(t => <button key={t} onClick={() => toggleArr("transport_to", t)} style={{ ...pillBtn(form.transport_to.includes(t), C.navy), borderRadius:4, textAlign:"center", padding:"9px 6px", fontSize:11 }}>{t}</button>)}
              </div>
              {form.transport_to.length > 0 && <div style={{ padding:"8px 12px", background:C.navy+"11", border:"1px solid "+C.navy, borderRadius:4, marginBottom:8, fontSize:12, color:C.navy, fontWeight:600 }}>🛣️ {form.transport_to.join(" → ")}</div>}
              <div style={inpBox}><input style={inp} value={form.transport_to_autre} onChange={e => setF("transport_to_autre", e.target.value)} placeholder={transportPlaceholder} /></div>
            </div>

            {/* Voyageurs & budget */}
            <div style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid "+C.parch }}>
              {secT("👥 Voyageurs & budget")}
              <div className="fg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div id="field-voyageurs">
                  <span style={lbl}>Voyageurs</span>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {VOYAGEURS.map(v => <button key={v} onClick={() => setF("voyageurs", v)} style={selBtn(form.voyageurs === v, "#3D5A3E")}>{v}</button>)}
                    {form.voyageurs === "Autre"
                      ? <div style={inpBox}><input autoFocus style={inp} value={form.voyageurs_autre} onChange={e => setF("voyageurs_autre", e.target.value)} placeholder="Ex: 3 adultes + 2 enfants…" /></div>
                      : <button onClick={() => setF("voyageurs", "Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
                <div id="field-budget">
                  <span style={lbl}>Budget {!uploadedFile && "*"}</span>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {BUDGETS.map(b => <button key={b} onClick={() => setF("budget", b)} style={{ ...selBtn(form.budget === b, "#8B2500"), borderColor: form.budget===b?"#8B2500":errors.budget?"#C1440E":C.parch }}>{b}</button>)}
                    {form.budget === "Budget global"
                      ? <div style={inpBox}><input autoFocus style={inp} value={form.budget_global} onChange={e => setF("budget_global", e.target.value)} placeholder="Ex: 3000€ pour 2 pers., 7 nuits…" /></div>
                      : <button onClick={() => setF("budget", "Budget global")} style={{ ...selBtn(false), borderColor: errors.budget?"#C1440E":C.parch }}>💵 Budget global à préciser</button>}
                  </div>
                  {errors.budget && <div style={{ fontSize:11, color:C.rust, marginTop:4 }}>⚠️ {errors.budget}</div>}
                </div>
              </div>
            </div>

            {/* Style & hébergement */}
            <div style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid "+C.parch }}>
              {secT("🎯 Style & hébergement")}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={lbl}>Style de voyage <span style={{ fontSize:8, fontWeight:400, color:C.mist, letterSpacing:1 }}>— plusieurs choix possibles</span></span>
                  <button onClick={() => { if (form.styles.includes("__sofia__")) setF("styles", []); else setF("styles", ["__sofia__"]); }}
                    style={{ padding:"3px 10px", border:"1.5px solid", borderRadius:100, fontSize:10, cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:1, transition:"all .15s", flexShrink:0, background: form.styles.includes("__sofia__")?"linear-gradient(135deg,#B8972E,#C1440E)":"transparent", borderColor: form.styles.includes("__sofia__")?C.gold:C.parch, color: form.styles.includes("__sofia__")?"#fff":C.gold, fontWeight:700 }}>
                    ✨ Sofia choisit
                  </button>
                </div>
                {form.styles.includes("__sofia__") ? (
                  <div style={{ padding:"10px 14px", background:"linear-gradient(135deg,#FDF8ED,#FFF9F0)", border:"1.5px solid "+C.gold, borderRadius:6, fontSize:12, color:"#4a3800" }}>
                    <strong>✨ Sofia recommande !</strong>
                    <div style={{ color:C.mist, marginTop:2 }}>Sofia analysera ta destination pour recommander le style de voyage idéal</div>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {STYLES_LIST.map(s => <button key={s} onClick={() => toggleArr("styles", s)} style={pillBtn(form.styles.includes(s), "#4A3560")}>{s}</button>)}
                    {form.styles.includes("Autre")
                      ? <div style={{ ...inpBox, flex:1, minWidth:160 }}><input autoFocus style={{ ...inp, padding:"7px 12px" }} value={form.style_autre} onChange={e => setF("style_autre", e.target.value)} placeholder="Précise…" /></div>
                      : <button onClick={() => toggleArr("styles", "Autre")} style={pillBtn(false)}>✏️ Autre</button>}
                  </div>
                )}
              </div>
              <div className="fg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div id="field-hebergement">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={lbl}>Hébergement {!uploadedFile && "*"}</span>
                    <button onClick={() => setF("hebergement", form.hebergement==="sofia"?"":"sofia")}
                      style={{ padding:"3px 10px", border:"1.5px solid", borderRadius:100, fontSize:10, cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:1, transition:"all .15s", flexShrink:0, background: form.hebergement==="sofia"?"linear-gradient(135deg,#B8972E,#C1440E)":"transparent", borderColor: form.hebergement==="sofia"?C.gold:C.parch, color: form.hebergement==="sofia"?"#fff":C.gold, fontWeight:700 }}>
                      ✨ Sofia choisit
                    </button>
                  </div>
                  {form.hebergement === "sofia" ? (
                    <div style={{ padding:"10px 14px", background:"linear-gradient(135deg,#FDF8ED,#FFF9F0)", border:"1.5px solid "+C.gold, borderRadius:6, fontSize:12, color:"#4a3800", marginBottom:6 }}>
                      <strong>✨ Sofia recommande !</strong>
                      <div style={{ color:C.mist, marginTop:2 }}>Sofia choisira le meilleur hébergement selon ta destination et ton budget</div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {HEBERGEMENTS.map(h => <button key={h} onClick={() => setF("hebergement", h)} style={{ ...selBtn(form.hebergement===h, C.forest), borderColor: form.hebergement===h?C.forest:errors.hebergement?"#C1440E":C.parch }}>{h}</button>)}
                      {form.hebergement === "Autre"
                        ? <div style={inpBox}><input autoFocus style={inp} value={form.hebergement_autre} onChange={e => setF("hebergement_autre", e.target.value)} placeholder="Précise…" /></div>
                        : <button onClick={() => setF("hebergement", "Autre")} style={{ ...selBtn(false), borderColor: errors.hebergement?"#C1440E":C.parch }}>✏️ Autre</button>}
                    </div>
                  )}
                  {errors.hebergement && <div style={{ fontSize:11, color:C.rust, marginTop:4 }}>⚠️ {errors.hebergement}</div>}
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={lbl}>Transport sur place</span>
                    <button onClick={() => setF("transport", form.transport==="sofia"?"":"sofia")}
                      style={{ padding:"4px 10px", border:"1.5px solid", borderRadius:100, fontSize:10, cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:1, transition:"all .15s", background: form.transport==="sofia"?"linear-gradient(135deg,#B8972E,#C1440E)":"transparent", borderColor: form.transport==="sofia"?C.gold:C.parch, color: form.transport==="sofia"?"#fff":C.gold, fontWeight: form.transport==="sofia"?700:400 }}>
                      {form.transport === "sofia" ? "✨ Sofia choisit" : "✨ Sofia choisit pour moi"}
                    </button>
                  </div>
                  {form.transport === "sofia" ? (
                    <div style={{ padding:"12px 14px", background:"linear-gradient(135deg,#FDF8ED,#FFF9F0)", border:"1.5px solid "+C.gold, borderRadius:6, fontSize:12, color:"#4a3800" }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>✨ Sofia s'en charge !</div>
                      <div style={{ color:C.mist }}>Sofia analysera ta destination, ton style et ton profil pour recommander le transport idéal.</div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {TRANSPORTS_LOCAL.map(t => <button key={t} onClick={() => setF("transport", t)} style={selBtn(form.transport===t, C.navy)}>{t}</button>)}
                      {form.transport === "Autre"
                        ? <div style={inpBox}><input autoFocus style={inp} value={form.transport_autre} onChange={e => setF("transport_autre", e.target.value)} placeholder="Précise…" /></div>
                        : <button onClick={() => setF("transport", "Autre")} style={selBtn(false)}>✏️ Autre</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Envies */}
            <div style={{ marginBottom:24 }}>
              {secT("✨ Tes envies & besoins")}
              <div className="fg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><span style={lbl}>Incontournables / Rêves</span><div style={inpBox}><textarea spellCheck style={{ ...inp, height:80, resize:"none", padding:"10px 14px" }} value={form.musts} onChange={e => setF("musts", e.target.value)} placeholder="Grand-Place, Calanques, plage Palombaggia…" /></div></div>
                <div><span style={lbl}>À éviter</span><div style={inpBox}><textarea spellCheck style={{ ...inp, height:80, resize:"none", padding:"10px 14px" }} value={form.avoid} onChange={e => setF("avoid", e.target.value)} placeholder="Pas trop touristique…" /></div></div>
                <div><span style={lbl}>Besoins spéciaux</span><div style={inpBox}><textarea spellCheck style={{ ...inp, height:70, resize:"none", padding:"10px 14px" }} value={form.special} onChange={e => setF("special", e.target.value)} placeholder="Végétarien, allergie, mobilité réduite…" /></div></div>
                <div><span style={lbl}>Autres informations</span><div style={inpBox}><textarea spellCheck style={{ ...inp, height:70, resize:"none", padding:"10px 14px" }} value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Passionné de plongée, fan de gastronomie…" /></div></div>
              </div>
            </div>

            {/* PMR Toggle */}
            <div style={{ marginBottom:16, padding:"14px 16px", background: form.pmr?"linear-gradient(135deg,#e8f4fd,#e3f2fd)":C.cream, border:"1.5px solid "+(form.pmr?"#1565c0":C.parch), borderRadius:6, transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: form.pmr?6:0 }}>
                    <span style={{ fontSize:20 }}>♿</span>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color: form.pmr?"#1565c0":C.ink }}>Accessibilité / Mobilité réduite</div>
                      <div style={{ fontSize:11, color:C.mist }}>Sofia adapte tout le plan : hébergements, restos, activités, transports</div>
                    </div>
                  </div>
                  {form.pmr && (
                    <div style={{ fontSize:12, color:"#1565c0", lineHeight:1.6, marginLeft:28 }}>
                      ✓ Hébergements accessibles PMR<br/>✓ Restaurants de plain-pied<br/>✓ Activités adaptées<br/>✓ Transports accessibles
                    </div>
                  )}
                </div>
                {form.pmr
                  ? <button onClick={() => setF("pmr", false)} style={{ padding:"7px 14px", border:"1.5px solid #c62828", borderRadius:100, cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1, fontWeight:700, flexShrink:0, background:"#c62828", color:"#fff" }}>✕ Désactiver</button>
                  : <button onClick={() => setF("pmr", true)}  style={{ padding:"7px 14px", border:"1.5px solid #1565c0", borderRadius:100, cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1, fontWeight:700, flexShrink:0, background:"transparent", color:"#1565c0" }}>Activer</button>}
              </div>
            </div>

            <button onClick={generate} style={{ width:"100%", padding:"16px", background:C.rust, color:"#fff", border:"none", borderRadius:6, fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:19, cursor:"pointer" }}>
              {uploadedFile ? "📎 Analyser mes notes et créer mon plan →" : "Créer mon plan de vacances avec Sofia →"}
            </button>
            <div style={{ textAlign:"center", marginTop:8, fontFamily:"'DM Mono',monospace", fontSize:8, color:"#bbb", letterSpacing:1 }}>
              ⓘ {uploadedFile ? "Sofia analysera ton document pour créer un plan complet" : "Destination, Budget et Hébergement sont nécessaires"}
            </div>
          </div>
        </div>
      )}

      {/* ─── LOADING ─── */}
      {phase === "loading" && (
        <div style={{ textAlign:"center", padding:"100px 24px" }}>
          <div style={{ fontSize:52, display:"inline-block", animation:"sp 2s linear infinite" }}>🧭</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontStyle:"italic", marginTop:18 }}>
            {uploadedFile ? "Sofia lit tes notes et prépare ton aventure…" : "Sofia prépare ton aventure…"}
          </div>
          <div style={{ marginTop:12, fontSize:12, color:C.mist }}>Cela peut prendre jusqu'à 30 secondes…</div>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:14, flexWrap:"wrap" }}>
            {["🗺️ Itinéraire","📅 Agenda","⭐ Incontournables","🏨 Hébergements","🍽️ Restos","🎯 Sorties","🧳 Valise"].map((t, i) => (
              <span key={t} style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, color:C.gold, animation:`fade 2s ${i*0.2}s infinite` }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── RESULT ─── */}
      {phase === "result" && plan && (
        <div className="result-layout" style={{ display:"flex", height:"calc(100vh - 60px)" }}>
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", minWidth:0 }}>
            {/* Hero */}
            <div style={{ position:"relative", height:160, overflow:"hidden", background:"linear-gradient(135deg,#2C4A3E,#1A3A5C)", flexShrink:0 }}>
              <HeroPhoto query={destDisplay ? `${destDisplay} landmark famous tourism travel` : "beautiful travel destination landscape"} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(0,0,0,.55) 100%)" }} />
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:24 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:4, color:C.gold, marginBottom:8 }}>✦ On The Road Again ✦</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,4vw,40px)", fontWeight:900, color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,.6)" }}>{destDisplay}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:3, color:"#EDE0C4", marginTop:10 }}>
                  {plan?.days?.length || form.nuits} NUITS{form.voyageurs ? ` · ${(form.voyageurs==="Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()}` : ""}
                </div>
                {form.dateStart && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"rgba(255,255,255,.5)", marginTop:4 }}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>

            {plan.intro && (
              <div style={{ padding:"14px 18px", background:"#f0f7f4", borderBottom:"1px solid "+C.parch, display:"flex", gap:10, flexShrink:0 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#B8972E,#C1440E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>🌍</div>
                <div style={{ fontSize:13, lineHeight:1.65, color:C.forest, fontStyle:"italic" }}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid "+C.parch, background:"#fff", flexShrink:0 }}>
              {TABS.map(t => (
                <button key={t.k} onClick={() => { setTab(t.k); if (t.k !== "outings") setOutingDayFilter(null); }}
                  style={{ padding:"10px 10px", border:"none", borderBottom:`2px solid ${tab===t.k?C.rust:"transparent"}`, background:"transparent", fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", color: tab===t.k?C.rust:"#888", whiteSpace:"nowrap", flexShrink:0, display:"flex", gap:4, alignItems:"center" }}>
                  {t.l}{t.n > 0 && <span style={{ background:C.parch, color:"#888", borderRadius:10, padding:"1px 5px", fontSize:8 }}>{t.n}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
              <div style={{ maxWidth:720, margin:"0 auto" }}>
                {tab === "days"   && (plan.days || []).map((d, i) => <DayCard key={i} d={d} form={{ ...form, destination:destDisplay }} plan={plan} setTab={setTab} setOutingDayFilter={setOutingDayFilter} />)}
                {tab === "agenda" && <AgendaSection agenda={plan.agenda} />}
                {tab === "sites"  && (<>
                  {plan.tourism_office?.website && (
                    <div style={{ background:"#fff", border:"1.5px solid "+C.gold, borderRadius:8, padding:"16px 18px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ fontSize:28, flexShrink:0 }}>🏛️</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, marginBottom:4 }}>Office de Tourisme officiel</div>
                        <div style={{ fontSize:13, color:"#4a4640", marginBottom:6 }}>{plan.tourism_office.name}</div>
                        {plan.tourism_office.address && <div style={{ fontSize:12, color:C.mist, marginBottom:4 }}>📍 {plan.tourism_office.address}</div>}
                        {plan.tourism_office.phone   && <div style={{ fontSize:12, color:C.mist, marginBottom:6 }}>📞 {plan.tourism_office.phone}</div>}
                        <a href={plan.tourism_office.website} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", padding:"7px 14px", background:C.gold, color:"#fff", borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1 }}>🌐 Site officiel</a>
                      </div>
                    </div>
                  )}
                  <LinkBar type="remarkable_sites" dest={destDisplay} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} />
                  <div style={{ height:12 }} />
                  {(plan.remarkable_sites || []).map((s, i) => <ItemCard key={i} item={s} type="remarkable_sites" i={i} form={{ ...form, destination:destDisplay }} />)}
                </>)}
                {tab === "hotels"  && (plan.accommodations || []).map((h, i) => <ItemCard key={i} item={h} type="accommodations" i={i} form={{ ...form, destination:destDisplay }} />)}
                {tab === "restos"  && (plan.restaurants    || []).map((r, i) => <ItemCard key={i} item={r} type="restaurants"    i={i} form={{ ...form, destination:destDisplay }} />)}
                {tab === "outings" && (
                  <div>
                    {outingDayFilter && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"8px 12px", background:C.forest+"11", border:"1px solid "+C.forest, borderRadius:6 }}>
                        <span style={{ fontSize:12, color:C.forest, fontWeight:600 }}>🗓️ Jour {outingDayFilter} uniquement</span>
                        <button onClick={() => setOutingDayFilter(null)} style={{ marginLeft:"auto", background:"none", border:"1px solid "+C.forest, borderRadius:12, padding:"2px 8px", cursor:"pointer", fontSize:10, color:C.forest }}>✕ Voir tout</button>
                      </div>
                    )}
                    {(plan.outings || []).filter(o => !outingDayFilter || o.day_num===outingDayFilter || !o.day_num).map((o, i) => <OutingCard key={i} item={o} i={i} form={{ ...form, destination:destDisplay }} />)}
                  </div>
                )}
                {tab === "tips" && (
                  <div style={{ background:"#fff", border:"1.5px solid "+C.parch, borderRadius:8, padding:"20px 24px" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:16 }}>💡 Conseils pratiques</div>
                    {(plan.tips || []).map((t, i) => (
                      <div key={i} style={{ display:"flex", gap:12, marginBottom:14, paddingBottom:14, borderBottom: i<(plan.tips||[]).length-1?"1px solid "+C.parch:"none" }}>
                        <div style={{ width:26, height:26, borderRadius:"50%", background:C.gold, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                        <div style={{ fontSize:13, lineHeight:1.7, color:"#4a4640" }}>{t}</div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "budget" && plan.budget && (
                  <div style={{ background:"#fff", border:"1.5px solid "+C.parch, borderRadius:8, padding:"20px 24px" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:16 }}>💰 Budget estimé</div>
                    {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport",plan.budget.transport]].map(([l,v]) => v && (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid "+C.parch }}>
                        <span style={{ fontSize:14, color:"#4a4640" }}>{l}</span>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display:"flex", justifyContent:"space-between", padding:"16px 0 0" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700 }}>TOTAL ESTIMÉ</span>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:C.rust }}>{plan.budget.total}</span>
                    </div>
                    <NoteField id="budget-note" />
                  </div>
                )}
                {tab === "packing" && <PackingSection packing={plan.packing_essentials} />}
              </div>
            </div>
            <div style={{ textAlign:"center", padding:10, borderTop:"1px solid "+C.parch, fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:2, color:"#aaa", flexShrink:0 }}>Sofia Planner · On The Road Again</div>
          </div>

          {/* ─── CHAT ─── */}
          <div className="chat-panel" style={{ width:320, display:"flex", flexDirection:"column", background:"#fff", borderLeft:"1px solid "+C.parch, flexShrink:0 }}>
            <div style={{ padding:"12px 14px", borderBottom:"1px solid "+C.parch, background:C.cream, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#B8972E,#C1440E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>🌍</div>
                <div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, color:C.gold }}>Chat avec Sofia</div>
                  <div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>Demande un changement → plan mis à jour</div>
                </div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                    {m.role === "assistant" && <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#B8972E,#C1440E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, marginRight:7, flexShrink:0, marginTop:2 }}>🌍</div>}
                    <div style={{ maxWidth:"85%", padding:"9px 12px", borderRadius: m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px", background: m.role==="user"?C.rust:C.cream, color: m.role==="user"?"#fff":C.ink, fontSize:12, lineHeight:1.6, border: m.role==="assistant"?"1px solid "+C.parch:"none" }}>
                      {m.content.split("\n").map((l, j) => <span key={j}>{l}{j < m.content.split("\n").length-1 && <br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoad && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#B8972E,#C1440E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>🌍</div>
                    <div style={{ padding:"9px 14px", background:C.cream, border:"1px solid "+C.parch, borderRadius:"14px 14px 14px 3px" }}>
                      {[0,1,2].map(i => <span key={i} style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:C.gold, margin:"0 2px", animation:`d 1.2s ${i*0.2}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
            <div style={{ borderTop:"1px solid "+C.parch, padding:"10px 12px", flexShrink:0 }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                {[
                  "Ajoute une journée",
                  plan?.outings?.length ? "Plus d'activités locales" : "Propose des activités",
                  plan?.accommodations?.[0]?.name ? "Alternative à "+plan.accommodations[0].name : "Hébergement moins cher",
                  "Que faire s'il pleut ?",
                  plan?.restaurants?.[0]?.name ? "Autre option que "+plan.restaurants[0].name : "Conseil restaurant ce soir",
                  "Optimise le budget"
                ].map(s => (
                  <button key={s} onClick={() => setChatIn(s)} style={{ padding:"4px 8px", background:C.cream, border:"1px solid "+C.parch, borderRadius:12, fontFamily:"'DM Mono',monospace", fontSize:8, cursor:"pointer", color:"#888" }}>{s}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} placeholder="Demande un changement à Sofia…" disabled={chatLoad}
                  style={{ flex:1, padding:"9px 13px", border:"1.5px solid "+C.parch, borderRadius:20, background:C.cream, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.ink, outline:"none" }} />
                <button onClick={sendChat} disabled={!chatIn.trim() || chatLoad}
                  style={{ padding:"9px 14px", background: chatIn.trim()&&!chatLoad?C.rust:"#ccc", color:"#fff", border:"none", borderRadius:20, cursor: chatIn.trim()&&!chatLoad?"pointer":"not-allowed", fontSize:15, flexShrink:0 }}>&#9658;</button>
              </div>
              <div style={{ textAlign:"center", marginTop:6, fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ccc", letterSpacing:2 }}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
