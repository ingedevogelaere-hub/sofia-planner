import { C, enc } from "../lib/constants";
import { Photo, Chip, LinkBar, NoteField } from "./ui";

// ─── DayCard ─────────────────────────────────────────────────
export function DayCard({ d, form, plan, setTab, setOutingDayFilter }) {
  const photoQ = d.unsplash_query || (d.location ? `${d.location} ${form.destination}` : form.destination + " paysage voyage");
  const dayMapsUrl = `https://www.google.com/maps/search/${enc(d.location + ", " + form.destination)}`;

  return (
    <div style={{ background: "#fff", border: "1.5px solid " + C.parch, borderRadius: 8, overflow: "hidden", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <Photo query={photoQ} h={160} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.forest, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {d.num}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700 }}>{d.title}</div>
            {d.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                <a href={`https://www.google.com/maps/search/${enc(d.location + ", " + form.destination)}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>
                  📍 {d.location} ↗
                </a>
                <a href={dayMapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#4285F4", background: "#e8f0fe", padding: "2px 8px", borderRadius: 10, letterSpacing: 1, textDecoration: "none" }}>
                  🗺️ Itinéraire jour {d.num}
                </a>
              </div>
            )}
          </div>
        </div>

        {[["🌅 Matin", d.morning], ["☀️ Après-midi", d.afternoon], ["🌙 Soir", d.evening]].map(([lbl, val]) => val && (
          <div key={lbl} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid " + C.cream }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: "#3a3830" }}>{val}</div>
          </div>
        ))}

        {d.tip && (
          <div style={{ background: C.cream, border: "1px solid " + C.parch, borderRadius: 4, padding: "8px 12px", fontSize: 12, color: C.mist, fontStyle: "italic", marginBottom: 10 }}>
            💡 {d.tip}
          </div>
        )}

        {plan?.outings?.filter(o => o.day_num === d.num || !o.day_num).length > 0 && (
          <button onClick={() => { setOutingDayFilter(d.num); setTab("outings"); }}
            style={{ background: C.forest + "11", border: "1px solid " + C.forest, borderRadius: 4, padding: "5px 10px", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.forest, letterSpacing: 1, marginBottom: 8 }}>
            🎯 Sorties & activités du jour {d.num}
          </button>
        )}
        <NoteField id={`day-${d.num}`} />
      </div>
    </div>
  );
}

// ─── OutingCard ──────────────────────────────────────────────
export function OutingCard({ item, i, form }) {
  const isHike = item.type === "randonnée";
  const photoQ = item.unsplash_query || (item.name ? `${item.name} ${form.destination}` : `${form.destination} ${isHike ? "randonnée sentier" : "activité tourisme"}`);

  return (
    <div style={{ background: "#fff", border: "1.5px solid " + C.parch, borderRadius: 8, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <Photo query={photoQ} h={120} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>{isHike ? "🥾" : "🎯"}</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700 }}>{item.name}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {item.subtype    && <Chip label={item.subtype} bg={isHike ? "#e8f5e9" : "#e3f2fd"} color={isHike ? "#2e7d32" : "#1565c0"} />}
          {item.difficulty && <Chip label={item.difficulty} bg={item.difficulty === "Facile" ? "#e8f5e9" : item.difficulty === "Difficile" ? "#fce4ec" : "#fff3e0"} color={item.difficulty === "Facile" ? "#2e7d32" : item.difficulty === "Difficile" ? "#c62828" : "#e65100"} />}
          {item.distance   && <Chip label={`📏 ${item.distance}`} bg="#f2f7f2" color="#3D5A3E" />}
          {item.duration   && <Chip label={`⏱️ ${item.duration}`} bg="#f2f7f2" color="#3D5A3E" />}
          {item.price      && <Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist} />}
        </div>
        {item.highlights          && <div style={{ fontSize: 13, lineHeight: 1.65, color: "#4a4640", marginBottom: 6 }}>👁️ {item.highlights}</div>}
        {item.start_point         && <div style={{ fontSize: 12, color: C.forest, marginBottom: 3, fontWeight: 600 }}>🚩 Départ : {item.start_point}</div>}
        {item.transport_from_center && <div style={{ fontSize: 12, color: C.forest, marginBottom: 6 }}>🚌 Accès : {item.transport_from_center}</div>}
        {item.address && (
          <a href={`https://www.google.com/maps/search/${enc(item.address + ", " + form.destination)}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", fontSize: 12, color: C.gold, marginBottom: 6 }}>
            📍 {item.address} ↗
          </a>
        )}
        {item.info && <div style={{ fontSize: 12, color: C.mist, fontStyle: "italic", marginBottom: 6 }}>💡 {item.info}</div>}
        <LinkBar type="outings" dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website} />
        <NoteField id={`outing-${i}`} />
      </div>
    </div>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────
export function ItemCard({ item, type, i, form }) {
  const photoQ = item.unsplash_query || (item.name ? `${item.name} ${form.destination}` : `${form.destination} ${type === "accommodations" ? "hôtel" : type === "restaurants" ? "restaurant" : "tourisme"}`);
  const coordUrl = item.coords ? `https://www.google.com/maps/search/?api=1&query=${item.coords[0]},${item.coords[1]}` : null;

  return (
    <div style={{ background: "#fff", border: "1.5px solid " + C.parch, borderRadius: 8, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <Photo query={photoQ} h={110} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {item.label   && <Chip label={item.label} bg="#004A8F22" color="#004A8F" />}
          {item.type    && <Chip label={item.type} />}
          {item.cuisine && <Chip label={item.cuisine} bg="#fff5f0" color="#8B2500" />}
          {item.price   && <Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist} />}
        </div>
        {(item.address || item.location) && (
          <a href={coordUrl || `https://www.google.com/maps/search/${enc((item.address || item.location) + ", " + form.destination)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "block", fontSize: 12, color: C.gold, marginBottom: 6 }}>
            📍 {item.address || item.location} ↗
          </a>
        )}
        {(item.why || item.description || item.specialty || item.info) && (
          <div style={{ fontSize: 13, lineHeight: 1.65, color: "#4a4640", marginBottom: 6 }}>
            {item.why || item.description || item.specialty || item.info}
          </div>
        )}
        {item.tip && <div style={{ fontSize: 12, color: C.mist, fontStyle: "italic", marginBottom: 6 }}>💡 {item.tip}</div>}
        <LinkBar type={type} dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website} />
        <NoteField id={`${type}-${i}`} />
      </div>
    </div>
  );
}
