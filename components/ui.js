/**
 * components/ui.js
 * ─────────────────────────────────────────────────────────
 * Composants UI atomiques réutilisables dans toute l'application.
 * Photo       : image Unsplash avec hauteur configurable.
 * HeroPhoto   : image en position absolute pour les bandeaux.
 * Chip        : badge/étiquette colorée inline.
 * LinkBar     : barre de liens externes (Booking, Maps, etc.).
 * NoteField   : champ de note personnel dépliable par item.
 * CityInput   : champ texte avec autocomplétion ville (Nominatim OSM).
 */

import { useState, useRef, useEffect } from "react";
import { C, enc } from "../lib/constants";
import { buildLinks } from "../lib/links";
import { usePhoto } from "../hooks/usePhoto";

// ─── Photo ───────────────────────────────────────────────────
export function Photo({ query, h = 140 }) {
  const src = usePhoto(query);
  return (
    <div style={{ height: h, overflow: "hidden", background: C.parch, flexShrink: 0 }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
    </div>
  );
}

export function HeroPhoto({ query }) {
  const src = usePhoto(query);
  if (!src) return null;
  return (
    <img src={src} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} loading="eager" />
  );
}

// ─── Chip ─────────────────────────────────────────────────────
export function Chip({ label, bg = C.parch, color = C.ink }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 100, background: bg, color, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
      {label}
    </span>
  );
}

// ─── LinkBar ──────────────────────────────────────────────────
export function LinkBar({ type, dest, dateStart, dateEnd, voy, voyA, itemName, itemWebsite }) {
  const links = buildLinks(type, dest, dateStart, dateEnd, voy, voyA, itemName);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
      {itemWebsite && (
        <a href={itemWebsite} target="_blank" rel="noopener noreferrer"
          style={{ padding: "4px 10px", background: C.forest, color: C.gold, borderRadius: 3, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
          🌐 Site officiel
        </a>
      )}
      {links.map(l => (
        <a key={l.l} href={l.u} target="_blank" rel="noopener noreferrer"
          style={{ padding: "4px 10px", background: l.c, color: "#fff", borderRadius: 3, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
          🔗 {l.l}
        </a>
      ))}
    </div>
  );
}

// ─── NoteField ────────────────────────────────────────────────
export function NoteField({ id }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.mist }}>
        📝 {open ? "Fermer" : "Ajouter une note"}
      </button>
      {open && (
        <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Tes notes…"
          style={{ width: "100%", padding: "8px 10px", border: "1.5px solid " + C.parch, borderRadius: 4, background: C.cream, fontFamily: "'DM Sans',sans-serif", fontSize: 12, resize: "none", outline: "none", minHeight: 56, marginTop: 4, boxSizing: "border-box" }} />
      )}
      {!open && val && (
        <div style={{ fontSize: 11, color: C.mist, fontStyle: "italic", marginTop: 4 }}>📌 {val}</div>
      )}
    </div>
  );
}

// ─── CityInput ────────────────────────────────────────────────
export function CityInput({ value, onChange, placeholder, style: styleProp }) {
  const [sugg, setSugg] = useState([]);
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const search = async (q) => {
    if (q.length < 1) { setSugg([]); setShow(false); return; }
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${enc(q)}&format=json&limit=6&addressdetails=1&featuretype=settlement`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await r.json();
      const cities = data
        .map(d => ({
          city: d.address?.city || d.address?.town || d.address?.municipality ||
                d.address?.village || d.address?.county || d.name || "",
          country: d.address?.country || "",
        }))
        .filter(c => c.city && c.city.length > 1)
        .filter((c, i, arr) => arr.findIndex(x => x.city === c.city) === i)
        .slice(0, 5);
      setSugg(cities);
      setShow(cities.length > 0);
    } catch { setSugg([]); setShow(false); }
  };

  const handleChange = v => {
    onChange(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 200);
  };

  const select = city => { onChange(city); setSugg([]); setShow(false); };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ ...{ border: "1.5px solid " + C.parch, borderRadius: 6, background: C.cream, overflow: "visible" }, ...styleProp }}>
        <input
          style={{ width: "100%", padding: "11px 14px", border: "none", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: C.ink, outline: "none", boxSizing: "border-box" }}
          value={value} onChange={e => handleChange(e.target.value)} placeholder={placeholder}
          spellCheck={false} autoComplete="off"
          onFocus={() => value.length >= 1 && search(value)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
        />
      </div>
      {show && sugg.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, background: "#fff", border: "1.5px solid " + C.parch, borderRadius: "0 0 8px 8px", zIndex: 999, boxShadow: "0 6px 20px rgba(0,0,0,.12)", overflow: "hidden" }}>
          {sugg.map((s, i) => (
            <div key={i} onClick={() => select(s.city)}
              style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < sugg.length - 1 ? "1px solid " + C.cream : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onMouseEnter={e => e.currentTarget.style.background = C.cream}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>📍 {s.city}</span>
              <span style={{ fontSize: 11, color: C.mist }}>{s.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
