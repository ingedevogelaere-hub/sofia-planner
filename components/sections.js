import { useState, useRef } from "react";
import { C, enc } from "../lib/constants";
import { Chip } from "./ui";

// ─── AgendaSection ────────────────────────────────────────────
export function AgendaSection({ agenda }) {
  if (!agenda?.length) return (
    <div style={{ textAlign: "center", padding: 40, color: C.mist, fontStyle: "italic" }}>
      Aucune info particulière pour ces dates.
    </div>
  );

  const cols = {
    positive: { bg: "#e8f5e9", border: "#2e7d32", icon: "🎉" },
    negative: { bg: "#fce4ec", border: "#c62828", icon: "⚠️" },
    info:     { bg: "#e3f2fd", border: "#1565c0", icon: "ℹ️" },
  };

  return (
    <div>
      {agenda.map((ev, i) => {
        const col = cols[ev.type] || cols.info;
        return (
          <div key={i} style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12, display: "flex", gap: 12 }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>{col.icon}</div>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700 }}>{ev.name}</div>
                {ev.date && <Chip label={ev.date} bg="rgba(0,0,0,.07)" color="#333" />}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "#3a3830" }}>{ev.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PackingSection ───────────────────────────────────────────
export function PackingSection({ packing }) {
  const [catExtras, setCatExtras] = useState({});
  const [catInputs, setCatInputs] = useState({});
  const [myItems,   setMyItems]   = useState([]);
  const [newItem,   setNewItem]   = useState("");
  const [checked,   setChecked]   = useState({});

  const toggle   = k => setChecked(c => ({ ...c, [k]: !c[k] }));
  const addToCat = catName => {
    const val = (catInputs[catName] || "").trim();
    if (!val) return;
    setCatExtras(prev => ({ ...prev, [catName]: [...(prev[catName] || []), val] }));
    setCatInputs(prev => ({ ...prev, [catName]: "" }));
  };
  const addMy = () => { if (newItem.trim()) { setMyItems(m => [...m, newItem.trim()]); setNewItem(""); } };
  const icons = { "Documents": "📄", "Santé": "💊", "Vêtements": "👕", "Technologie": "🔌", "Divers": "📦" };

  return (
    <div>
      {(packing || []).map((cat, ci) => (
        <div key={ci} style={{ background: "#fff", border: "1.5px solid " + C.parch, borderRadius: 8, padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            {icons[cat.category] || "📦"} {cat.category}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {(cat.items || []).map((item, ii) => {
              const k = `c${ci}-${ii}`;
              return (
                <label key={ii} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0" }}>
                  <input type="checkbox" checked={!!checked[k]} onChange={() => toggle(k)} style={{ width: 16, height: 16, accentColor: C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: checked[k] ? "#aaa" : C.ink, textDecoration: checked[k] ? "line-through" : "none" }}>{item}</span>
                </label>
              );
            })}
            {(catExtras[cat.category] || []).map((item, ei) => {
              const k = `ce${ci}-${ei}`;
              return (
                <label key={`e${ei}`} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0" }}>
                  <input type="checkbox" checked={!!checked[k]} onChange={() => toggle(k)} style={{ width: 16, height: 16, accentColor: C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: checked[k] ? "#aaa" : C.ink, textDecoration: checked[k] ? "line-through" : "none" }}>{item}</span>
                </label>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={catInputs[cat.category] || ""} onChange={e => setCatInputs(prev => ({ ...prev, [cat.category]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addToCat(cat.category)}
              placeholder={`Ajouter dans ${cat.category}…`}
              style={{ flex: 1, padding: "6px 10px", border: "1.5px solid " + C.parch, borderRadius: 4, background: C.cream, fontFamily: "'DM Sans',sans-serif", fontSize: 12, outline: "none" }} />
            <button onClick={() => addToCat(cat.category)} style={{ padding: "6px 12px", background: C.parch, color: C.ink, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
          </div>
        </div>
      ))}
      <div style={{ background: "#fff", border: "1.5px solid " + C.gold, borderRadius: 8, padding: "16px 18px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, marginBottom: 12, color: C.gold }}>🧳 Mes affaires personnelles</div>
        {myItems.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {myItems.map((item, i) => {
              const k = `my-${i}`;
              return (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0" }}>
                  <input type="checkbox" checked={!!checked[k]} onChange={() => toggle(k)} style={{ width: 16, height: 16, accentColor: C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: checked[k] ? "#aaa" : C.ink, textDecoration: checked[k] ? "line-through" : "none" }}>{item}</span>
                </label>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addMy()}
            placeholder="Coussins, fromages, café, couteaux, plaid…"
            style={{ flex: 1, padding: "8px 12px", border: "1.5px solid " + C.parch, borderRadius: 4, background: C.cream, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none" }} />
          <button onClick={addMy} style={{ padding: "8px 16px", background: C.gold, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── DateRangePicker ─────────────────────────────────────────
function parseLocalDate(str) { if (!str) return null; const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); }
function toDateStr(d) { if (!d) return ""; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

export function DateRangePicker({ dateStart, dateEnd, nuits, onDateStart, onDateEnd, onNuits }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [curMonth, setCurMonth] = useState(() => {
    const d = dateStart ? parseLocalDate(dateStart) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [hovered, setHovered] = useState(null);
  const start = parseLocalDate(dateStart);
  const end   = parseLocalDate(dateEnd);

  const daysInMonth = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(curMonth.getFullYear(), curMonth.getMonth(), 1).getDay();
  const offset      = (firstDay + 6) % 7;

  const click = (day) => {
    const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), day);
    if (d < today) return;
    if (!start || (start && end)) { onDateStart(toDateStr(d)); onDateEnd(""); setHovered(null); }
    else if (d <= start)          { onDateStart(toDateStr(d)); onDateEnd(""); setHovered(null); }
    else { onDateEnd(toDateStr(d)); onNuits(Math.round((d - start) / 864e5)); setHovered(null); }
  };

  const getInfo = (day) => {
    const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), day);
    const isS   = !!(start && d.getTime() === start.getTime());
    const isE   = !!(end   && d.getTime() === end.getTime());
    const effEnd = end || (hovered ? new Date(curMonth.getFullYear(), curMonth.getMonth(), hovered) : null);
    const inR   = !!(start && effEnd && d > start && d < effEnd);
    const past  = d < today;
    const isT   = d.getTime() === today.getTime();
    return { isS, isE, inR, past, isT, d };
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const DAYS   = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
  const fmtDate = d => d ? d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";

  return (
    <div style={{ border: "1.5px solid " + C.parch, borderRadius: 6, background: "#fff", overflow: "hidden", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "7px 10px", background: C.cream, borderBottom: "1px solid " + C.parch, gap: 6 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: dateStart ? C.rust : "#bbb" }}>{dateStart ? fmtDate(start) : "Départ"}</span>
          <span style={{ color: "#ccc", fontSize: 11 }}>—</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: dateEnd ? C.forest : dateStart ? C.gold : "#bbb" }}>{dateEnd ? fmtDate(end) : dateStart ? "Retour ?" : "Retour"}</span>
          {dateStart && dateEnd && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginLeft: 4 }}>· {nuits}n</span>}
        </div>
        {(dateStart || dateEnd) && (
          <button onClick={() => { onDateStart(""); onDateEnd(""); onNuits(7); setHovered(null); }}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 9, color: "#aaa", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>↺</button>
        )}
      </div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", borderBottom: "1px solid " + C.cream }}>
        <button onClick={() => setCurMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 16, lineHeight: 1, padding: "0 4px" }}>‹</button>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.ink, fontWeight: 600 }}>
          {MONTHS[curMonth.getMonth()]} {curMonth.getFullYear()}
        </span>
        <button onClick={() => setCurMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 16, lineHeight: 1, padding: "0 4px" }}>›</button>
      </div>
      {/* Grid */}
      <div style={{ padding: "4px 6px 6px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 2 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 8, color: C.mist, padding: "1px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ height: 26 }} />;
            const { isS, isE, inR, past, isT } = getInfo(day);
            const rangeBg = isS && end   ? "linear-gradient(to right, transparent 50%, #FDE8E4 50%)"
                          : isE && start ? "linear-gradient(to left, transparent 50%, #FDE8E4 50%)"
                          : inR          ? "#FDE8E4" : "transparent";
            return (
              <div key={i} onClick={() => !past && click(day)}
                onMouseEnter={() => start && !end && !past && setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: past ? "default" : "pointer", background: rangeBg }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", zIndex: 1,
                  background: isS || isE ? C.rust : "transparent",
                  color: isS || isE ? "#fff" : past ? "#ccc" : isT ? C.gold : C.ink,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 11,
                  fontWeight: isS || isE ? 700 : isT ? 600 : 400,
                  boxShadow: isT && !isS && !isE ? "0 0 0 1.5px " + C.gold : "none",
                }}>
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Manual nights */}
      {!dateStart && (
        <div style={{ padding: "5px 10px 6px", borderTop: "1px solid " + C.parch, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#bbb", letterSpacing: 1 }}>OU</span>
          <button onClick={() => onNuits(Math.max(1, nuits - 1))} style={{ width: 20, height: 20, border: "1px solid " + C.parch, borderRadius: "50%", background: "#fff", fontSize: 13, cursor: "pointer", lineHeight: 1, color: C.ink }}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.gold, minWidth: 20, textAlign: "center", fontFamily: "'Playfair Display',serif" }}>{nuits}</span>
          <button onClick={() => onNuits(Math.min(90, nuits + 1))} style={{ width: 20, height: 20, border: "1px solid " + C.parch, borderRadius: "50%", background: "#fff", fontSize: 13, cursor: "pointer", lineHeight: 1, color: C.ink }}>+</button>
          <span style={{ fontSize: 11, color: "#bbb" }}>nuits</span>
        </div>
      )}
    </div>
  );
}

// ─── FileUpload ───────────────────────────────────────────────
export function FileUpload({ file, onFile, onClear }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const process = f => {
    if (!f) return;
    const ok = ["image/jpeg","image/png","image/webp","image/gif","application/pdf","text/plain"];
    if (!ok.includes(f.type)) { alert("Format non supporté. JPG, PNG, PDF ou TXT."); return; }
    if (f.size > 15 * 1024 * 1024) { alert("Fichier trop grand (max 15 Mo)."); return; }
    if (f.type.startsWith("image/")) {
      const img = new Image(); const url = URL.createObjectURL(f);
      img.onload = () => {
        const canvas = document.createElement("canvas"); const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h * MAX / w); w = MAX; } else { w = Math.round(w * MAX / h); h = MAX; } }
        canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const comp = canvas.toDataURL("image/jpeg", 0.85);
        onFile({ name: f.name, type: "image/jpeg", data: comp.split(",")[1], preview: comp });
        URL.revokeObjectURL(url);
      }; img.src = url;
    } else {
      const r = new FileReader();
      r.onload = e => onFile({ name: f.name, type: f.type, data: e.target.result.split(",")[1], preview: null });
      r.readAsDataURL(f);
    }
  };

  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid " + C.parch }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>📎 Partage tes notes ou idées à Sofia</div>
      <div style={{ fontSize: 13, color: C.mist, marginBottom: 12 }}>Photo d'un carnet, article, liste… Sofia lit tout et crée ton voyage.</div>
      {!file ? (
        <div onClick={() => ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); process(e.dataTransfer.files[0]); }}
          style={{ border: `2px dashed ${drag ? C.gold : C.parch}`, borderRadius: 8, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: drag ? "#FDF8ED" : C.cream }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>📸</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Glisse ou clique pour importer</div>
          <div style={{ fontSize: 12, color: C.mist }}>JPG, PNG, PDF, TXT — max 15 Mo</div>
          <input ref={ref} type="file" accept="image/*,.pdf,.txt" style={{ display: "none" }} onChange={e => process(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ border: "1.5px solid " + C.gold, borderRadius: 8, padding: "14px 16px", background: "#FDF8ED", display: "flex", gap: 12, alignItems: "center" }}>
          {file.preview
            ? <img src={file.preview} alt="preview" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
            : <div style={{ width: 56, height: 56, background: C.parch, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: C.gold, marginBottom: 3 }}>✅ FICHIER CHARGÉ</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
          </div>
          <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", flexShrink: 0 }}>×</button>
        </div>
      )}
      {file && (
        <div style={{ marginTop: 10, padding: "8px 14px", background: "#e3f2fd", border: "1px solid #1565c0", borderRadius: 6, fontSize: 12, color: "#1565c0" }}>
          ℹ️ <strong>Remplis le formulaire ci-dessous</strong> pour affiner, ou laisse Sofia tout déduire depuis ton document.
        </div>
      )}
    </div>
  );
}
