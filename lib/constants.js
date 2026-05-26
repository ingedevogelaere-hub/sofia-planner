export const TP_MARKER = "";
export const UNSPLASH_KEY = "z33MKSymKePZB5EmPynqEyxjxQ5ujCrPD3Bn5-FxtYU";

export const C = {
  gold:   "#B8972E",
  rust:   "#C1440E",
  forest: "#2C4A3E",
  navy:   "#1A3A5C",
  ink:    "#1C1A14",
  cream:  "#FAF6EE",
  parch:  "#EDE0C4",
  mist:   "#8A9E93",
};

export const STYLES_LIST = [
  "⭐ Incontournables","🏛️ Culture","🏰 Centre historique","🌿 Nature",
  "🍷 Gastronomie","🏖️ Plages","⛰️ Montagne","🥾 Randonnées","🧗 Aventure",
  "🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping",
];
export const HEBERGEMENTS = [
  "🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping",
  "🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse",
];
export const BUDGETS = [
  "🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)",
  "✨ Confort (150-250€/j)","💎 Luxe (250€+/j)",
];
export const TRANSPORTS_LOCAL = [
  "🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo",
  "🚶 À pied","🛵 Scooter","🚐 Van / Camping-car",
];
export const TRANSPORT_TO = [
  "✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture louée",
  "🚌 Bus","⛴️ Ferry","🚢 Croisière","🛺 Navette",
];
export const VOYAGEURS = [
  "Solo","2 adultes","Famille (bébé 0-3 ans)","Famille (enfants 4-12 ans)",
  "Famille (ados)","Groupe d'amis","Couple senior",
];

export const enc  = s => encodeURIComponent(s || "");
export const enc2 = s => s ? s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : "";
export const fixDest = s => s ? s.replace(/\b\w/g, c => c.toUpperCase()) : "Voyage";

export function getAdults(v, a) {
  const val = v === "Autre" ? (a || "") : (v || "");
  if (val === "Solo") return 1;
  if (val.includes("2 adultes") || val.includes("Couple")) return 2;
  if (val.includes("Groupe")) return 4;
  return 2;
}

export function selBtn(active, color = C.navy) {
  return {
    padding: "9px 12px", border: "1.5px solid", borderRadius: 6,
    textAlign: "left", width: "100%",
    background: active ? color + "18" : "transparent",
    borderColor: active ? color : C.parch,
    color: active ? color : "#666",
    fontFamily: "'DM Sans',sans-serif", fontSize: 12,
    cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all .15s",
  };
}

export function pillBtn(active, color = C.navy) {
  return {
    padding: "7px 13px", border: "1.5px solid", borderRadius: 100,
    background: active ? color + "18" : "transparent",
    borderColor: active ? color : C.parch,
    color: active ? color : "#888",
    fontFamily: "'DM Sans',sans-serif", fontSize: 12,
    cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all .15s",
  };
}
