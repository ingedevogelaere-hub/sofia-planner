import Head from "next/head";
import { useState, useRef, useEffect } from "react";

// ─── Config ────────────────────────────────────────────────
const TP_MARKER = "";
const UNSPLASH_KEY = "z33MKSymKePZB5EmPynqEyxjxQ5ujCrPD3Bn5-FxtYU";
const photoCache = {};

// ─── Unsplash photo hook ────────────────────────────────────
// Chain: cached API URL → Unsplash API (high quality) → source.unsplash.com fallback → picsum
function usePhoto(query){
  const cacheKey=(query||"travel").substring(0,60);
  const [src,setSrc]=useState(photoCache[cacheKey]||null);
  useEffect(()=>{
    if(!query) return;
    if(photoCache[cacheKey]){setSrc(photoCache[cacheKey]);return;}
    if(UNSPLASH_KEY){
      fetch(`https://api.unsplash.com/photos/random?query=${enc(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`)
        .then(r=>r.ok?r.json():Promise.reject("api_fail"))
        .then(d=>{
          const url=d?.urls?.regular||d?.urls?.small;
          if(url){photoCache[cacheKey]=url;setSrc(url);}
          else throw new Error("no_url");
        })
        .catch(()=>{
          // Fallback: deprecated but still functional
          const fb=`https://source.unsplash.com/800x400/?${enc(query)}`;
          photoCache[cacheKey]=fb;
          setSrc(fb);
        });
    } else {
      const fb=`https://source.unsplash.com/800x400/?${enc(query)}`;
      photoCache[cacheKey]=fb;
      setSrc(fb);
    }
  },[cacheKey]);
  return src||`https://picsum.photos/seed/${enc2(query||"travel")}/800/400`;
}

function Photo({query,h=140}){
  const src=usePhoto(query);
  return(
    <div style={{height:h,overflow:"hidden",background:C.parch,flexShrink:0}}>
      <img src={src} alt={query||""} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
    </div>
  );
}

// HeroPhoto: separate component so usePhoto hook is never called conditionally
function HeroPhoto({query}){
  const src=usePhoto(query);
  return <img src={src} alt="" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:.55}} loading="lazy"/>;
}

// ─── Design tokens ─────────────────────────────────────────
const C = {
  gold:"#B8972E",rust:"#C1440E",forest:"#2C4A3E",navy:"#1A3A5C",
  ink:"#1C1A14",cream:"#FAF6EE",parch:"#EDE0C4",mist:"#8A9E93"
};

function selBtn(active,color=C.navy){
  return{padding:"9px 12px",border:"1.5px solid",borderRadius:6,textAlign:"left",width:"100%",
    background:active?color+"18":"transparent",borderColor:active?color:C.parch,
    color:active?color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",
    fontWeight:active?600:400,transition:"all .15s"};
}
function pillBtn(active,color=C.navy){
  return{padding:"7px 13px",border:"1.5px solid",borderRadius:100,
    background:active?color+"18":"transparent",borderColor:active?color:C.parch,
    color:active?color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",
    fontWeight:active?600:400,transition:"all .15s"};
}

// ─── Constants ─────────────────────────────────────────────
const STYLES_LIST=["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","⛰️ Montagne","🥾 Randonnées","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS=["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse","🏠 Je dors chez moi"];
const BUDGETS=["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const TRANSPORTS_LOCAL=["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];
const TRANSPORT_TO=["✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture louée","🚌 Bus","⛴️ Ferry","🚢 Croisière","🛺 Navette"];
const VOYAGEURS=["Solo","2 adultes","Famille (bébé 0-3 ans)","Famille (enfants 4-12 ans)","Famille (ados)","Groupe d'amis","Couple senior"];

const enc=s=>encodeURIComponent(s||"");
const enc2=s=>s?s.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""):"";

// ─── Date Range Picker ─────────────────────────────────────
// Helper: parse date string to LOCAL date (avoids UTC timezone offset bug)
function parseLocalDate(str) {
  if (!str) return null;
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}
function toDateStr(d) {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function DateRangePicker({dateStart,dateEnd,nuits,onDateStart,onDateEnd,onNuits}){

  const today=new Date(); today.setHours(0,0,0,0);
