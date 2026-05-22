import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const TP_MARKER = "";
const UNSPLASH_KEY = "z33MKSymKePZB5EmPynqEyxjxQ5ujCrPD3Bn5-FxtYU";
const photoCache = {};

const C = {
  gold:"#B8972E",rust:"#C1440E",forest:"#2C4A3E",navy:"#1A3A5C",
  ink:"#1C1A14",cream:"#FAF6EE",parch:"#EDE0C4",mist:"#8A9E93"
};

function selBtn(active,color=C.navy){return{padding:"9px 12px",border:"1.5px solid",borderRadius:6,textAlign:"left",width:"100%",background:active?color+"18":"transparent",borderColor:active?color:C.parch,color:active?color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:active?600:400,transition:"all .15s"};}
function pillBtn(active,color=C.navy){return{padding:"7px 13px",border:"1.5px solid",borderRadius:100,background:active?color+"18":"transparent",borderColor:active?color:C.parch,color:active?color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:active?600:400,transition:"all .15s"};}

const STYLES_LIST=["⭐ Incontournables","🏛️ Culture","🏰 Centre historique","🌿 Nature","🍷 Gastronomie","🏖️ Plages","⛰️ Montagne","🥾 Randonnées","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS=["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse"];
const BUDGETS=["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const TRANSPORTS_LOCAL=["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];
const TRANSPORT_TO=["✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture louée","🚌 Bus","⛴️ Ferry","🚢 Croisière","🛺 Navette"];
const VOYAGEURS=["Solo","2 adultes","Famille (bébé 0-3 ans)","Famille (enfants 4-12 ans)","Famille (ados)","Groupe d'amis","Couple senior"];

const enc=s=>encodeURIComponent(s||"");
const enc2=s=>s?s.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""):"";
const fixDest=s=>s?s.replace(/\b\w/g,c=>c.toUpperCase()):"Voyage";
function getAdults(v,a){const val=v==="Autre"?(a||""):(v||"");if(val==="Solo")return 1;if(val.includes("2 adultes")||val.includes("Couple"))return 2;if(val.includes("Groupe"))return 4;return 2;}

// ─── Unsplash photo hook ────────────────────────────────────
function usePhoto(query){
  const cacheKey=(query||"travel").substring(0,60);
  const [src,setSrc]=useState(photoCache[cacheKey]||null);
  useEffect(()=>{
    if(!query) return;
    if(photoCache[cacheKey]){setSrc(photoCache[cacheKey]);return;}
    if(UNSPLASH_KEY){
      fetch(`https://api.unsplash.com/photos/random?query=${enc(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`)
        .then(r=>r.ok?r.json():Promise.reject())
        .then(d=>{const url=d?.urls?.regular||d?.urls?.small;if(url){photoCache[cacheKey]=url;setSrc(url);}else throw new Error();})
        .catch(()=>{const fb=`https://source.unsplash.com/800x400/?${enc(query)}`;photoCache[cacheKey]=fb;setSrc(fb);});
    }else{setSrc(`https://source.unsplash.com/800x400/?${enc(query)}`);}
  },[cacheKey]);
  return src||`https://picsum.photos/seed/${enc2(query||"travel")}/800/400`;
}

function Photo({query,h=140}){
  const src=usePhoto(query);
  return(<div style={{height:h,overflow:"hidden",background:C.parch,flexShrink:0}}><img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/></div>);
}
function HeroPhoto({query}){
  const src=usePhoto(query);
  return <img src={src} alt="" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:.5}} loading="lazy"/>;
}

// ─── Link builders ──────────────────────────────────────────
function buildLinks(type,dest,dateStart,dateEnd,voy,voyA,itemName=""){
  const adults=getAdults(voy,voyA);const cin=dateStart||"";const cout=dateEnd||"";
  const aid=TP_MARKER?`&aid=${TP_MARKER}`:"";const d=enc(dest);const it=enc(itemName||dest);
  switch(type){
    case "accommodations":return[
      {l:"Booking",c:"#003580",u:`https://www.booking.com/search.html?ss=${it}&checkin=${cin}&checkout=${cout}&group_adults=${adults}${aid}`},
      {l:"Airbnb",c:"#FF5A5F",u:`https://www.airbnb.fr/s/${enc(dest)}/homes?checkin=${cin}&checkout=${cout}&adults=${adults}&locale=fr`},
      {l:"Hotels.com",c:"#C00",u:`https://fr.hotels.com/search.do?q-destination=${it}&q-check-in=${cin}&q-check-out=${cout}&q-room-0-adults=${adults}`},
    ];
    case "restaurants":return[
      {l:"TripAdvisor",c:"#00AA6C",u:`https://www.tripadvisor.fr/Search?q=${enc(itemName||"restaurants")}+${d}`},
      {l:"TheFork",c:"#00B551",u:`https://www.thefork.fr/recherche?q=${it}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||"restaurant")}+${d}`},
    ];
    case "outings":return[
      {l:"AllTrails",c:"#3D6B35",u:`https://www.alltrails.com/explore?q=${it}`},
      {l:"Visorando",c:"#5D8B3C",u:`https://www.visorando.com/recherche/?q=${it}`},
      {l:"GetYourGuide",c:"#FF6B35",u:`https://www.getyourguide.fr/s/?q=${it}&date_from=${cin}`},
      {l:"Viator",c:"#142A51",u:`https://www.viator.com/searchResults/all?text=${it}&startDate=${cin}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||"activité")}+${d}`},
    ];
    case "remarkable_sites":return[
      {l:"Office Tourisme",c:"#E84D3D",u:`https://www.google.com/search?q=office+tourisme+officiel+${d}`},
      {l:"Patrimoine UNESCO",c:"#009EDB",u:`https://www.google.com/search?q=UNESCO+patrimoine+mondial+${d}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/sites+touristiques+${d}`},
    ];
    default:return[];
  }
}

function buildMapUrl(plan,dest){
  if(!plan||!dest||dest==="Voyage") return `https://www.google.com/maps/search/${enc(dest||"")}`;
  const clean=loc=>{if(!loc)return null;const main=loc.split(',')[0].trim();if(!main||main.toLowerCase()==="voyage")return null;const d=dest.split(',')[0].trim();return main.toLowerCase().includes(d.toLowerCase())?main:`${main}, ${d}`;};
  const locs=(plan.days||[]).map(d=>clean(d.location)).filter(Boolean);
  if(!locs.length) return `https://www.google.com/maps/search/${enc(dest)}`;
  if(locs.length===1) return `https://www.google.com/maps/search/${enc(locs[0])}`;
  return `https://www.google.com/maps/dir/${locs.map(l=>enc(l)).join("/")}`;
}

// ─── Small UI components ────────────────────────────────────
function LinkBar({type,dest,dateStart,dateEnd,voy,voyA,itemName,itemWebsite}){
  const links=buildLinks(type,dest,dateStart,dateEnd,voy,voyA,itemName);
  return(<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
    {itemWebsite&&<a href={itemWebsite} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:C.ink,color:C.gold,borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🌐 Site officiel</a>}
    {links.map(l=><a key={l.l} href={l.u} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:l.c,color:"#fff",borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🔗 {l.l}</a>)}
  </div>);
}

function NoteField({id}){
  const [open,setOpen]=useState(false);const [val,setVal]=useState("");
  return(<div style={{marginTop:8}}>
    <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.mist}}>📝 {open?"Fermer":"Ajouter une note"}</button>
    {open&&<textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Tes notes…" style={{width:"100%",padding:"8px 10px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,resize:"none",outline:"none",minHeight:56,marginTop:4,boxSizing:"border-box"}}/>}
    {!open&&val&&<div style={{fontSize:11,color:C.mist,fontStyle:"italic",marginTop:4}}>📌 {val}</div>}
  </div>);
}

// ─── City Autocomplete (Nominatim / OpenStreetMap) ──────────
function CityInput({value, onChange, placeholder, style: styleProp}){
  const [sugg, setSugg] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const search = async (q) => {
    if (q.length < 2) { setSugg([]); setShow(false); return; }
    setLoading(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${enc(q)}&format=json&limit=6&addressdetails=1&featuretype=settlement`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await r.json();
      const cities = data.map(d => {
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.hamlet || d.name;
        const country = d.address?.country || '';
        return { city, country };
      }).filter((c, i, arr) => c.city && arr.findIndex(x => x.city === c.city) === i);
      setSugg(cities.slice(0, 5));
      setShow(cities.length > 0);
    } catch { setSugg([]); setShow(false); }
    setLoading(false);
  };

  const handleChange = (v) => {
    onChange(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 350);
  };

  const select = (city) => {
    onChange(city);
    setSugg([]);
    setShow(false);
  };

  return (
    <div style={{position:'relative'}}>
      <div style={{...{border:'1.5px solid '+C.parch,borderRadius:6,background:C.cream,overflow:'visible'}, ...styleProp}}>
        <input style={{width:'100%',padding:'11px 14px',border:'none',background:'transparent',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.ink,outline:'none',boxSizing:'border-box'}}
          value={value} onChange={e=>handleChange(e.target.value)} placeholder={placeholder}
          onFocus={()=>value.length>=2&&search(value)} onBlur={()=>setTimeout(()=>setShow(false),200)}
        />
      </div>
      {show && sugg.length > 0 && (
        <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#fff',border:'1.5px solid '+C.parch,borderRadius:'0 0 8px 8px',zIndex:999,boxShadow:'0 6px 20px rgba(0,0,0,.12)',overflow:'hidden'}}>
          {sugg.map((s,i) => (
            <div key={i} onClick={()=>select(s.city)}
              style={{padding:'9px 14px',cursor:'pointer',borderBottom:i<sugg.length-1?'1px solid '+C.cream:'none',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'background .1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.cream}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}
            >
              <div>
                <span style={{fontSize:13,fontWeight:500,color:C.ink}}>📍 {s.city}</span>
              </div>
              <span style={{fontSize:11,color:C.mist}}>{s.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({label,bg=C.parch,color=C.ink}){
  return <span style={{display:"inline-block",padding:"3px 9px",borderRadius:100,background:bg,color,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>{label}</span>;
}

// ─── Day Card ────────────────────────────────────────────────
function DayCard({d,form,plan,setTab,setOutingDayFilter}){
  const photoQ=d.unsplash_query||(d.location?`${d.location} ${form.destination}`:form.destination+" paysage voyage");
  const dayMapsUrl=`https://www.google.com/maps/search/${enc(d.location+", "+form.destination)}`;
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQ} h={160}/>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.ink,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,flexShrink:0}}>{d.num}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{d.title}</div>
            {d.location&&(
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,flexWrap:"wrap"}}>
                <a href={`https://www.google.com/maps/search/${enc(d.location+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold,textTransform:"uppercase"}}>📍 {d.location} ↗</a>
                <a href={dayMapsUrl} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#4285F4",background:"#e8f0fe",padding:"2px 8px",borderRadius:10,letterSpacing:1,textDecoration:"none"}}>🗺️ Itinéraire jour {d.num}</a>
              </div>
            )}
          </div>
        </div>
        {[["🌅 Matin",d.morning],["☀️ Après-midi",d.afternoon],["🌙 Soir",d.evening]].map(([lbl,val])=>val&&(
          <div key={lbl} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+C.cream}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:4}}>{lbl}</div>
            <div style={{fontSize:13,lineHeight:1.7,color:"#3a3830"}}>{val}</div>
          </div>
        ))}
        {d.tip&&<div style={{background:C.cream,border:"1px solid "+C.parch,borderRadius:4,padding:"8px 12px",fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:10}}>💡 {d.tip}</div>}
        {plan?.outings?.filter(o=>o.day_num===d.num||!o.day_num).length>0&&(
          <button onClick={()=>{setOutingDayFilter(d.num);setTab("outings");}} style={{background:C.forest+"11",border:"1px solid "+C.forest,borderRadius:4,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,color:C.forest,letterSpacing:1,marginBottom:8}}>
            🎯 Sorties & activités du jour {d.num}
          </button>
        )}
        <NoteField id={`day-${d.num}`}/>
      </div>
    </div>
  );
}

// ─── Outing Card ─────────────────────────────────────────────
function OutingCard({item,i,form}){
  const isHike=item.type==="randonnée";
  const photoQ=item.unsplash_query||(item.name?`${item.name} ${form.destination}`:`${form.destination} ${isHike?"randonnée sentier":"activité tourisme"}`);
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQ} h={120}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:18}}>{isHike?"🥾":"🎯"}</span>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>{item.name}</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {item.subtype&&<Chip label={item.subtype} bg={isHike?"#e8f5e9":"#e3f2fd"} color={isHike?"#2e7d32":"#1565c0"}/>}
          {item.difficulty&&<Chip label={item.difficulty} bg={item.difficulty==="Facile"?"#e8f5e9":item.difficulty==="Difficile"?"#fce4ec":"#fff3e0"} color={item.difficulty==="Facile"?"#2e7d32":item.difficulty==="Difficile"?"#c62828":"#e65100"}/>}
          {item.distance&&<Chip label={`📏 ${item.distance}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.duration&&<Chip label={`⏱️ ${item.duration}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.price&&<Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist}/>}
        </div>
        {item.highlights&&<div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>👁️ {item.highlights}</div>}
        {item.start_point&&<div style={{fontSize:12,color:C.forest,marginBottom:3,fontWeight:600}}>🚩 Départ : {item.start_point}</div>}
        {item.transport_from_center&&<div style={{fontSize:12,color:C.forest,marginBottom:6}}>🚌 Accès : {item.transport_from_center}</div>}
        {item.address&&<a href={`https://www.google.com/maps/search/${enc(item.address+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:C.gold,marginBottom:6}}>📍 {item.address} ↗</a>}
        {item.info&&<div style={{fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:6}}>💡 {item.info}</div>}
        <LinkBar type="outings" dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website}/>
        <NoteField id={`outing-${i}`}/>
      </div>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────
function ItemCard({item,type,i,form}){
  const photoQ=item.unsplash_query||(item.name?`${item.name} ${form.destination}`:`${form.destination} ${type==="accommodations"?"hôtel":type==="restaurants"?"restaurant":"tourisme"}`);
  const coordUrl=item.coords?`https://www.google.com/maps/search/?api=1&query=${item.coords[0]},${item.coords[1]}`:null;
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQ} h={110}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:8}}>{item.name}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {item.label&&<Chip label={item.label} bg="#004A8F22" color="#004A8F"/>}
          {item.type&&<Chip label={item.type}/>}
          {item.cuisine&&<Chip label={item.cuisine} bg="#fff5f0" color="#8B2500"/>}
          {item.price&&<Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist}/>}
        </div>
        {(item.address||item.location)&&<a href={coordUrl||`https://www.google.com/maps/search/${enc((item.address||item.location)+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:C.gold,marginBottom:6}}>📍 {item.address||item.location} ↗</a>}
        {(item.why||item.description||item.specialty||item.info)&&<div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>{item.why||item.description||item.specialty||item.info}</div>}
        {item.tip&&<div style={{fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:6}}>💡 {item.tip}</div>}
        <LinkBar type={type} dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website}/>
        <NoteField id={`${type}-${i}`}/>
      </div>
    </div>
  );
}

// ─── Agenda ──────────────────────────────────────────────────
function AgendaSection({agenda}){
  if(!agenda?.length) return <div style={{textAlign:"center",padding:40,color:C.mist,fontStyle:"italic"}}>Aucune info particulière pour ces dates.</div>;
  const cols={positive:{bg:"#e8f5e9",border:"#2e7d32",icon:"🎉"},negative:{bg:"#fce4ec",border:"#c62828",icon:"⚠️"},info:{bg:"#e3f2fd",border:"#1565c0",icon:"ℹ️"}};
  return(<div>{agenda.map((ev,i)=>{const col=cols[ev.type]||cols.info;return(
    <div key={i} style={{background:col.bg,border:`1.5px solid ${col.border}`,borderRadius:8,padding:"14px 16px",marginBottom:12,display:"flex",gap:12}}>
      <div style={{fontSize:20,flexShrink:0}}>{col.icon}</div>
      <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700}}>{ev.name}</div>{ev.date&&<Chip label={ev.date} bg="rgba(0,0,0,.07)" color="#333"/>}</div><div style={{fontSize:13,lineHeight:1.6,color:"#3a3830"}}>{ev.description}</div></div>
    </div>
  );})}</div>);
}

// ─── Ma Valise ────────────────────────────────────────────────
function PackingSection({packing}){
  const [catExtras,setCatExtras]=useState({});
  const [catInputs,setCatInputs]=useState({});
  const [myItems,setMyItems]=useState([]);
  const [newItem,setNewItem]=useState("");
  const [checked,setChecked]=useState({});
  const toggle=k=>setChecked(c=>({...c,[k]:!c[k]}));
  const addToCat=catName=>{const val=(catInputs[catName]||"").trim();if(!val)return;setCatExtras(prev=>({...prev,[catName]:[...(prev[catName]||[]),val]}));setCatInputs(prev=>({...prev,[catName]:""}));};
  const addMy=()=>{if(newItem.trim()){setMyItems(m=>[...m,newItem.trim()]);setNewItem("");}};
  const icons={"Documents":"📄","Santé":"💊","Vêtements":"👕","Technologie":"🔌","Divers":"📦"};
  return(<div>
    {(packing||[]).map((cat,ci)=>(
      <div key={ci} style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"16px 18px",marginBottom:14}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12}}>{icons[cat.category]||"📦"} {cat.category}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
          {(cat.items||[]).map((item,ii)=>{const k=`c${ci}-${ii}`;return(
            <label key={ii} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
              <span style={{fontSize:13,color:checked[k]?"#aaa":C.ink,textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
            </label>
          );})}
          {(catExtras[cat.category]||[]).map((item,ei)=>{const k=`ce${ci}-${ei}`;return(
            <label key={`e${ei}`} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
              <span style={{fontSize:13,color:checked[k]?"#aaa":C.ink,textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
            </label>
          );})}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={catInputs[cat.category]||""} onChange={e=>setCatInputs(prev=>({...prev,[cat.category]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToCat(cat.category)} placeholder={`Ajouter dans ${cat.category}…`} style={{flex:1,padding:"6px 10px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <button onClick={()=>addToCat(cat.category)} style={{padding:"6px 12px",background:C.parch,color:C.ink,border:"none",borderRadius:4,cursor:"pointer",fontSize:14,fontWeight:700}}>+</button>
        </div>
      </div>
    ))}
    <div style={{background:"#fff",border:"1.5px solid "+C.gold,borderRadius:8,padding:"16px 18px"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12,color:C.gold}}>🧳 Mes affaires personnelles</div>
      {myItems.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
        {myItems.map((item,i)=>{const k=`my-${i}`;return(
          <label key={i} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
            <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
            <span style={{fontSize:13,color:checked[k]?"#aaa":C.ink,textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
          </label>
        );})}
      </div>}
      <div style={{display:"flex",gap:8}}>
        <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMy()} placeholder="Coussins, fromages, café, couteaux, plaid…" style={{flex:1,padding:"8px 12px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
        <button onClick={addMy} style={{padding:"8px 16px",background:C.gold,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
      </div>
    </div>
  </div>);
}

// ─── Date Range Picker ─────────────────────────────────────
function parseLocalDate(str){if(!str)return null;const [y,m,d]=str.split('-').map(Number);return new Date(y,m-1,d);}
function toDateStr(d){if(!d)return"";return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

function DateRangePicker({dateStart,dateEnd,nuits,onDateStart,onDateEnd,onNuits}){
  const today=new Date();today.setHours(0,0,0,0);
  const [curMonth,setCurMonth]=useState(()=>{
    const d=dateStart?parseLocalDate(dateStart):new Date();
    return new Date(d.getFullYear(),d.getMonth(),1);
  });
  const [hovered,setHovered]=useState(null);
  const start=parseLocalDate(dateStart);
  const end=parseLocalDate(dateEnd);

  const daysInMonth=new Date(curMonth.getFullYear(),curMonth.getMonth()+1,0).getDate();
  const firstDay=new Date(curMonth.getFullYear(),curMonth.getMonth(),1).getDay();
  const offset=(firstDay+6)%7;

  const click=(day)=>{
    const d=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
    if(d<today)return;
    if(!start||(start&&end)){onDateStart(toDateStr(d));onDateEnd("");setHovered(null);}
    else if(d<=start){onDateStart(toDateStr(d));onDateEnd("");setHovered(null);}
    else{onDateEnd(toDateStr(d));onNuits(Math.round((d-start)/(864e5)));setHovered(null);}
  };

  const getStyle=(day)=>{
    const d=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
    const isS=start&&d.getTime()===start.getTime();
    const isE=end&&d.getTime()===end.getTime();
    const effEnd=end||(hovered?new Date(curMonth.getFullYear(),curMonth.getMonth(),hovered):null);
    const inR=start&&effEnd&&d>start&&d<effEnd;
    const past=d<today;
    const isT=d.getTime()===today.getTime();
    return{isS,isE,inR,past,isT};
  };

  const cells=[];
  for(let i=0;i<offset;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);

  const M=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const D=["L","M","M","J","V","S","D"];

  const fmt=d=>d?d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):null;

  return(
    <div style={{border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",background:"#fff"}}>
      {/* Summary bar */}
      <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:C.cream,borderBottom:"1px solid "+C.parch,gap:6,minHeight:38}}>
        <span style={{fontSize:13,fontWeight:600,color:dateStart?C.rust:C.mist,fontFamily:"'DM Sans',sans-serif"}}>{dateStart?fmt(start):"Départ"}</span>
        <span style={{color:C.parch,fontSize:12,flexShrink:0}}>→</span>
        <span style={{fontSize:13,fontWeight:600,color:dateEnd?C.forest:dateStart?C.gold:C.mist,fontFamily:"'DM Sans',sans-serif"}}>{dateEnd?fmt(end):dateStart?"Retour ?":"Retour"}</span>
        {dateStart&&dateEnd&&<span style={{marginLeft:"auto",fontSize:12,fontWeight:700,color:C.gold,fontFamily:"'Playfair Display',serif",flexShrink:0}}>🌙 {nuits}n</span>}
        {(dateStart||dateEnd)&&<button onClick={()=>{onDateStart("");onDateEnd("");onNuits(7);setHovered(null);}} style={{width:20,height:20,borderRadius:"50%",border:"1.5px solid "+C.parch,background:"#fff",cursor:"pointer",fontSize:10,color:C.mist,lineHeight:1,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:"auto"}}>↺</button>}
      </div>

      <div style={{padding:"8px 10px"}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <button onClick={()=>setCurMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontSize:14,padding:"2px 6px",lineHeight:1}}>‹</button>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,fontWeight:600,color:C.ink}}>{M[curMonth.getMonth()]} {curMonth.getFullYear()}</span>
          <button onClick={()=>setCurMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontSize:14,padding:"2px 6px",lineHeight:1}}>›</button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:2}}>
          {D.map((d,i)=><div key={i} style={{textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:8,color:C.mist,padding:"2px 0",letterSpacing:1}}>{d}</div>)}
        </div>

        {/* Days */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px 0"}}>
          {cells.map((day,i)=>{
            if(!day)return<div key={i}/>;
            const{isS,isE,inR,past,isT}=getStyle(day);
            // Range background spans full cell width
            const rangeStyle=inR?{background:"#FDE8E4"}:{};
            const startCapStyle=isS?{background:"#FDE8E4",borderRadius:"0"}:{};
            const endCapStyle=isE?{background:"#FDE8E4",borderRadius:"0"}:{};
            // First/last in row: round the range bg
            const col=(i%7);
            const isFirstInRow=col===0;
            const isLastInRow=col===6;
            const dotStyle={
              width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",position:"relative",zIndex:1,
              background:isS||isE?C.rust:"transparent",
              color:isS||isE?"#fff":past?"#ccc":isT?C.gold:C.ink,
              fontWeight:isS||isE?700:isT?600:400,
              fontSize:12,
              fontFamily:"'DM Sans',sans-serif",
              outline:isT&&!isS&&!isE?"2px solid "+C.gold:"none",
              outlineOffset:"1px",
            };
            return(
              <div key={i} onClick={()=>!past&&click(day)}
                onMouseEnter={()=>start&&!end&&!past&&setHovered(day)}
                onMouseLeave={()=>setHovered(null)}
                style={{
                  position:"relative",cursor:past?"default":"pointer",
                  padding:"1px 0",
                  background:inR?"#FDE8E4":isS&&end?"#FDE8E4":isE&&start?"#FDE8E4":"transparent",
                  borderRadius:isS?"50% 0 0 50%":isE?"0 50% 50% 0":"0",
                  // Clip range edges at row boundaries
                  ...(inR&&isFirstInRow?{borderRadius:"50% 0 0 50%"}:{}),
                  ...(inR&&isLastInRow?{borderRadius:"0 50% 50% 0"}:{}),
                }}>
                <div style={dotStyle}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual nights when no dates */}
      {!dateStart&&(
        <div style={{padding:"6px 12px 8px",borderTop:"1px solid "+C.parch,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:C.mist,letterSpacing:1,textTransform:"uppercase"}}>Ou nb de nuits</span>
          <button onClick={()=>onNuits(Math.max(1,nuits-1))} style={{width:22,height:22,border:"1.5px solid "+C.parch,borderRadius:"50%",background:"#fff",fontSize:14,cursor:"pointer",lineHeight:1,flexShrink:0}}>−</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.gold,minWidth:24,textAlign:"center"}}>{nuits}</span>
          <button onClick={()=>onNuits(Math.min(90,nuits+1))} style={{width:22,height:22,border:"1.5px solid "+C.parch,borderRadius:"50%",background:"#fff",fontSize:14,cursor:"pointer",lineHeight:1,flexShrink:0}}>+</button>
          <span style={{fontSize:11,color:C.mist}}>nuits</span>
        </div>
      )}
    </div>
  );
}

// ─── File Upload ────────────────────────────────────────────
function FileUpload({file,onFile,onClear}){
  const ref=useRef();const [drag,setDrag]=useState(false);
  const process=f=>{
    if(!f)return;
    const ok=['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain'];
    if(!ok.includes(f.type)){alert("Format non supporté. JPG, PNG, PDF ou TXT.");return;}
    if(f.size>15*1024*1024){alert("Fichier trop grand (max 15 Mo).");return;}
    if(f.type.startsWith('image/')){
      const img=new Image();const url=URL.createObjectURL(f);
      img.onload=()=>{
        const canvas=document.createElement('canvas');const MAX=1200;let w=img.width,h=img.height;
        if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
        canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
        const comp=canvas.toDataURL('image/jpeg',0.85);
        onFile({name:f.name,type:'image/jpeg',data:comp.split(',')[1],preview:comp});
        URL.revokeObjectURL(url);
      };img.src=url;
    }else{
      const r=new FileReader();
      r.onload=e=>onFile({name:f.name,type:f.type,data:e.target.result.split(',')[1],preview:null});
      r.readAsDataURL(f);
    }
  };
  return(
    <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid "+C.parch}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:6}}>📎 Partage tes notes ou idées à Sofia</div>
      <div style={{fontSize:13,color:C.mist,marginBottom:12}}>Photo d'un carnet, article, liste… Sofia lit tout et crée ton voyage.</div>
      {!file?(
        <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files[0]);}}
          style={{border:`2px dashed ${drag?C.gold:C.parch}`,borderRadius:8,padding:"24px 20px",textAlign:"center",cursor:"pointer",background:drag?"#FDF8ED":C.cream}}>
          <div style={{fontSize:32,marginBottom:6}}>📸</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:4}}>Glisse ou clique pour importer</div>
          <div style={{fontSize:12,color:C.mist}}>JPG, PNG, PDF, TXT — max 15 Mo</div>
          <input ref={ref} type="file" accept="image/*,.pdf,.txt" style={{display:"none"}} onChange={e=>process(e.target.files[0])}/>
        </div>
      ):(
        <div style={{border:"1.5px solid "+C.gold,borderRadius:8,padding:"14px 16px",background:"#FDF8ED",display:"flex",gap:12,alignItems:"center"}}>
          {file.preview?<img src={file.preview} alt="preview" style={{width:56,height:56,objectFit:"cover",borderRadius:4,flexShrink:0}}/>:<div style={{width:56,height:56,background:C.parch,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📄</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,marginBottom:3}}>✅ FICHIER CHARGÉ</div>
            <div style={{fontSize:13,color:C.ink,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</div>
          </div>
          <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#aaa",flexShrink:0}}>×</button>
        </div>
      )}
      {file&&<div style={{marginTop:10,padding:"8px 14px",background:"#e3f2fd",border:"1px solid #1565c0",borderRadius:6,fontSize:12,color:"#1565c0"}}>ℹ️ <strong>Remplis le formulaire ci-dessous</strong> pour affiner, ou laisse Sofia tout déduire depuis ton document.</div>}
    </div>
  );
}

// ─── PDF Generator (beautiful magazine layout) ──────────────
async function generatePDF(plan,form,destDisplay){
  // Pre-load photos as base64 for reliable PDF embedding
  async function toBase64(url){
    try{const r=await fetch(url);const b=await r.blob();return await new Promise(res=>{const fr=new FileReader();fr.onloadend=()=>res(fr.result);fr.readAsDataURL(b);});}
    catch{return null;}
  }

  const heroQ=`${destDisplay} city panoramic tourism`;
  const heroUrl=photoCache[(heroQ).substring(0,60)]||`https://source.unsplash.com/1200x500/?${enc(destDisplay+" city tourism")}`;
  const heroB64=await toBase64(heroUrl)||"";

  const dayPhotos={};
  for(const d of (plan?.days||[])){
    const q=(d.unsplash_query||d.location||destDisplay||"travel").substring(0,60);
    const url=photoCache[q]||`https://source.unsplash.com/800x300/?${enc(q)}`;
    dayPhotos[d.num]=await toBase64(url)||"";
  }

  const nuits=(plan?.days?.length)||form.nuits;
  const rows=(arr,fn)=>(arr||[]).map(fn).join("");

  const dayH=rows(plan?.days,d=>`
    <div class="day-card">
      ${dayPhotos[d.num]?`<img src="${dayPhotos[d.num]}" class="day-photo" onerror="this.style.display='none'"/>`:""}
      <div class="day-header">
        <div class="day-num">Jour ${d.num}</div>
        <div class="day-title">${d.title||""}${d.location?`<span class="day-loc">📍 ${d.location}</span>`:""}</div>
      </div>
      <div class="day-body">
        ${d.morning?`<div class="moment"><span class="moment-lbl">🌅 Matin</span>${d.morning}</div>`:""}
        ${d.afternoon?`<div class="moment"><span class="moment-lbl">☀️ Après-midi</span>${d.afternoon}</div>`:""}
        ${d.evening?`<div class="moment"><span class="moment-lbl">🌙 Soir</span>${d.evening}</div>`:""}
        ${d.tip?`<div class="tip">💡 ${d.tip}</div>`:""}
      </div>
    </div>`);

  const siteH=rows(plan?.remarkable_sites,s=>`<div class="list-item"><div class="list-item-title">${s.name}${s.label?` <span class="badge">${s.label}</span>`:""}</div><div class="list-item-loc">📍 ${s.location||""}</div><div class="list-item-desc">${s.description||""}</div>${s.website?`<a href="${s.website}" class="link-btn">🌐 Site officiel</a>`:""}</div>`);
  const hotelH=rows(plan?.accommodations,h=>`<div class="list-item"><div class="list-item-title">${h.name} <span class="badge">${h.type||""}</span> <span class="price">${h.price||""}</span></div><div class="list-item-loc">📍 ${h.location||""}</div><div class="list-item-desc">${h.why||""}</div>${h.website?`<a href="${h.website}" class="link-btn">🌐 Réserver</a>`:""}</div>`);
  const restoH=rows(plan?.restaurants,r=>`<div class="list-item"><div class="list-item-title">${r.name} <span class="badge">${r.cuisine||""}</span> <span class="price">${r.price||""}</span></div><div class="list-item-loc">📍 ${r.address||""}</div><div class="list-item-desc">⭐ ${r.specialty||""}</div></div>`);
  const outingH=rows(plan?.outings,o=>`<div class="list-item"><div class="list-item-title">${o.type==="randonnée"?"🥾":"🎯"} ${o.name}${o.difficulty?` <span class="badge">${o.difficulty}</span>`:""}${o.distance?` <span class="badge">${o.distance}</span>`:""}</div>${o.start_point?`<div class="list-item-loc">🚩 ${o.start_point}</div>`:""}${o.highlights?`<div class="list-item-desc">${o.highlights}</div>`:""}</div>`);
  const agendaH=rows(plan?.agenda,ev=>`<div class="agenda-item agenda-${ev.type}"><strong>${ev.type==="positive"?"🎉":ev.type==="negative"?"⚠️":"ℹ️"} ${ev.name}</strong>${ev.date?` <span class="badge">${ev.date}</span>`:""}<br/>${ev.description||""}</div>`);
  const tipsH=(plan?.tips||[]).map((t,i)=>`<div class="tip-item"><span class="tip-num">${i+1}</span>${t}</div>`).join("");
  const b=plan?.budget||{};
  const budH=`<div class="budget-grid">${[["🏨 Hébergement",b.accommodation],["🍽️ Repas",b.meals],["🎯 Activités",b.activities],["🚗 Transport",b.transport]].filter(([,v])=>v).map(([l,v])=>`<div class="budget-row"><span>${l}</span><strong>${v}</strong></div>`).join("")}</div><div class="budget-total">Total estimé : <strong>${b.total||"—"}</strong></div>`;

  const sec=(icon,title,content)=>content?`<div class="section"><h2 class="section-title">${icon} ${title}</h2>${content}</div>`:"";

  const win=window.open("","_blank");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${destDisplay} — Sofia Planner</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Lato',sans-serif;color:#1C1A14;background:#fff;font-size:13px;line-height:1.6}
a{color:#B8972E;text-decoration:none}
/* Cover */
.cover{page-break-after:always;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#1C1A14}
.cover-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45}
.cover-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.7))}
.cover-content{position:relative;z-index:2;text-align:center;color:#fff;padding:40px}
.cover-eyebrow{font-family:'Lato',sans-serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#B8972E;margin-bottom:20px}
.cover-title{font-family:'Playfair Display',serif;font-size:72px;font-weight:900;line-height:1;margin-bottom:16px;text-shadow:0 4px 20px rgba(0,0,0,.5)}
.cover-sub{font-family:'Lato',sans-serif;font-size:16px;font-weight:300;letter-spacing:4px;color:rgba(255,255,255,.8);text-transform:uppercase;margin-bottom:12px}
.cover-dates{font-size:13px;color:rgba(255,255,255,.6);letter-spacing:2px}
.cover-intro{max-width:600px;margin:30px auto 0;font-style:italic;font-size:15px;color:rgba(255,255,255,.85);line-height:1.8}
.cover-footer{position:absolute;bottom:30px;left:0;right:0;text-align:center;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4)}
/* Tourism office */
.tourism-box{border:1.5px solid #B8972E;border-radius:6px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;gap:12}
.tourism-box a{background:#B8972E;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;letter-spacing:1px}
/* Sections */
.section{page-break-inside:avoid;margin-bottom:40px}
.section-title{font-family:'Playfair Display',serif;font-size:22px;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:20px}
/* Day cards */
.day-card{margin-bottom:30px;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);page-break-inside:avoid}
.day-photo{width:100%;height:220px;object-fit:cover;display:block}
.day-header{background:#1C1A14;padding:14px 20px;display:flex;align-items:baseline;gap:16}
.day-num{font-family:'Lato',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8972E;flex-shrink:0}
.day-title{font-family:'Playfair Display',serif;font-size:18px;color:#fff;font-weight:700}
.day-loc{font-size:12px;color:#999;margin-left:10px;font-family:'Lato',sans-serif;font-weight:300}
.day-body{padding:20px 24px;background:#fff}
.moment{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #FAF6EE}
.moment:last-of-type{border-bottom:none}
.moment-lbl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B8972E;font-family:'Lato',sans-serif;font-weight:700;margin-bottom:4px}
.tip{background:#FAF6EE;border-left:3px solid #B8972E;padding:10px 14px;font-style:italic;color:#8A9E93;font-size:12px;border-radius:0 4px 4px 0;margin-top:12px}
/* List items */
.list-item{padding:14px 0;border-bottom:1px solid #EDE0C4;display:flex;flex-direction:column;gap:4}
.list-item:last-child{border-bottom:none}
.list-item-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8;flex-wrap:wrap}
.list-item-loc{font-size:12px;color:#B8972E}
.list-item-desc{font-size:12px;color:#555;line-height:1.6}
.link-btn{display:inline-block;margin-top:6px;padding:4px 10px;background:#1C1A14;color:#B8972E!important;border-radius:3px;font-size:10px;letter-spacing:1px}
/* Badge & price */
.badge{display:inline-block;padding:2px 8px;border-radius:10px;background:#EDE0C4;color:#666;font-size:10px;font-family:'Lato',sans-serif;font-weight:700;letter-spacing:1px}
.price{display:inline-block;padding:2px 8px;border-radius:10px;background:#FAF6EE;color:#B8972E;font-size:11px;font-weight:700}
/* Agenda */
.agenda-item{padding:12px 16px;border-radius:6px;margin-bottom:10px;font-size:12px;line-height:1.6}
.agenda-positive{background:#e8f5e9;border-left:4px solid #2e7d32}
.agenda-negative{background:#fce4ec;border-left:4px solid #c62828}
.agenda-info{background:#e3f2fd;border-left:4px solid #1565c0}
/* Budget */
.budget-grid{border:1px solid #EDE0C4;border-radius:6px;overflow:hidden}
.budget-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #EDE0C4;font-size:13px}
.budget-row:last-child{border-bottom:none}
.budget-total{margin-top:12px;text-align:right;font-size:16px;color:#C1440E}
/* Tips */
.tip-item{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #FAF6EE;font-size:13px;line-height:1.7}
.tip-num{width:26px;height:26px;border-radius:50%;background:#B8972E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}
/* Maps link */
.maps-bar{text-align:center;margin:20px 0}
.maps-btn{display:inline-block;padding:10px 24px;background:#4285F4;color:#fff!important;border-radius:6px;font-size:12px;letter-spacing:1px}
/* Print */
@media print{body{margin:0;padding:0}.cover{height:100vh}.np{display:none}}
/* Page content padding */
.page-content{padding:40px 50px}
</style>
</head><body>
<!-- COVER -->
<div class="cover">
  ${heroB64?`<img src="${heroB64}" class="cover-bg" onerror="this.style.display='none'"/>`:""}
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-eyebrow">✦ On The Road Again ✦</div>
    <div class="cover-title">${destDisplay}</div>
    <div class="cover-sub">${nuits} nuits${form.voyageurs&&form.voyageurs!=="Autre"?" · "+form.voyageurs.toUpperCase():""}</div>
    ${form.dateStart?`<div class="cover-dates">${form.dateStart} → ${form.dateEnd||""}</div>`:""}
    ${plan?.intro?`<div class="cover-intro">${plan.intro}</div>`:""}
  </div>
  <div class="cover-footer">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString("fr-FR")}</div>
</div>

<!-- CONTENT -->
<div class="page-content">
  ${plan?.tourism_office?.website?`<div class="tourism-box"><span style="font-size:24px">🏛️</span><div style="flex:1"><strong>${plan.tourism_office.name||"Office de Tourisme"}</strong>${plan.tourism_office.address?`<br/><span style="font-size:11px;color:#8A9E93">📍 ${plan.tourism_office.address}</span>`:""}</div><a href="${plan.tourism_office.website}">${plan.tourism_office.website}</a></div>`:""}

  <div class="maps-bar np"><a href="${buildMapUrl(plan,destDisplay)}" target="_blank" class="maps-btn">🗺️ Voir l'itinéraire complet sur Google Maps</a></div>

  ${sec("🗺️","Itinéraire",dayH)}
  ${plan?.agenda?.length?sec("📅","À noter pour ton séjour",agendaH):""}
  ${sec("⭐","Incontournables",siteH)}
  ${sec("🏨","Hébergements",hotelH)}
  ${sec("🍽️","Restaurants",restoH)}
  ${sec("🎯","Sorties & Activités",outingH)}
  ${plan?.tips?.length?sec("💡","Conseils pratiques",tipsH):""}
  ${plan?.budget?sec("💰","Budget estimé",budH):""}
</div>

<script>
window.onload=function(){
  var imgs=document.querySelectorAll('img');
  var count=imgs.length;if(!count){window.print();return;}
  var done=0;
  imgs.forEach(function(img){
    if(img.complete){done++;if(done===count)window.print();}
    else{img.onload=img.onerror=function(){done++;if(done===count)window.print();};}
  });
  setTimeout(function(){window.print();},5000);
};
</script>
</body></html>`);
  win.document.close();
}

// ─── Main Component ──────────────────────────────────────────
export default function SofiaPlanner(){
  const [phase,setPhase]=useState("form");
  const [plan,setPlan]=useState(null);
  const [errors,setErrors]=useState({});
  const [msgs,setMsgs]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [tab,setTab]=useState("days");
  const [genError,setGenError]=useState(null); // {type:'overloaded'|'network'|'error', msg:string}
  const [outingDayFilter,setOutingDayFilter]=useState(null);
  const [uploadedFile,setUploadedFile]=useState(null);
  const bottomRef=useRef(null);
  const pageTopRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{
    if(genError) window.scrollTo({top:0,behavior:"smooth"});
  },[genError]);

  const [form,setForm]=useState({destination:"",depart:"",dateStart:"",dateEnd:"",nuits:7,voyageurs:"",voyageurs_autre:"",budget:"",budget_global:"",styles:[],style_autre:"",hebergement:"",hebergement_autre:"",transport:"",transport_autre:"",transport_to:[],transport_to_autre:"",special:"",musts:"",avoid:"",notes:"",pmr:false});
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleArr=(k,v)=>setF(k,form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const handleDate=(k,v)=>{
    setF(k,v);const start=k==="dateStart"?v:form.dateStart;const end=k==="dateEnd"?v:form.dateEnd;
    if(start&&end){const diff=Math.round((new Date(end)-new Date(start))/(1000*60*60*24));if(diff>0){setF("nuits",diff);setErrors(e=>({...e,dateEnd:undefined}));}else setErrors(e=>({...e,dateEnd:"La date de retour doit être après le départ"}));}
  };

  const validate=()=>{
    const e={};
    if(!uploadedFile&&!form.destination.trim()) e.destination="Destination obligatoire";
    if(!uploadedFile&&!form.budget) e.budget="Budget obligatoire";
    if(!uploadedFile&&!form.hebergement) e.hebergement="Hébergement obligatoire";
    if(form.dateStart&&form.dateEnd&&new Date(form.dateEnd)<=new Date(form.dateStart)) e.dateEnd="La date de retour doit être après le départ";
    setErrors(e);
    if(Object.keys(e).length>0) document.getElementById("field-"+Object.keys(e)[0])?.scrollIntoView({behavior:"smooth",block:"center"});
    return Object.keys(e).length===0;
  };

  const generate=async()=>{
    if(!validate())return;
    setPhase("loading");setGenError(null);
    try{
      const body={formData:form.destination||form.budget?form:null};
      if(uploadedFile){body.fileData=uploadedFile.data;body.fileType=uploadedFile.type;}
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(res.status===529||data.error==="OVERLOADED"){
        setPhase("form");
        setGenError({type:"overloaded",msg:"Les serveurs IA sont surchargés en ce moment. Réessaie dans 1-2 minutes."});
        return;
      }
      if(!res.ok) throw new Error(data.error||"Erreur serveur "+res.status);
      if(data.type==="plan"){
        const p={...data.data,destination:fixDest(form.destination||data.data.destination||"Voyage")};
        setPlan(p);setMsgs([{role:"assistant",content:data.data.intro||"Votre plan est prêt !"}]);setPhase("result");
      }else{
        setPhase("form");
        setGenError({type:"error",msg:"La génération n'a pas abouti. Vérifie que tu as bien rempli les champs obligatoires et réessaie."});
      }
    }catch(err){
      setPhase("form");
      if(!navigator.onLine){
        setGenError({type:"network",msg:"Pas de connexion internet. Vérifie ta connexion et réessaie."});
      } else {
        setGenError({type:"error",msg:"Une erreur inattendue s'est produite. Réessaie dans quelques instants."});
      }
    }
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad)return;
    const userMsg={role:"user",content:chatIn.trim()};
    const newMsgs=[...msgs,userMsg];setMsgs(newMsgs);setChatIn("");setChatLoad(true);
    try{
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),currentPlan:plan})});
      const data=await res.json();
      if(data.type==="plan"&&data.data?.days){
        const updatedPlan={...data.data,destination:plan?.destination||form.destination||"Voyage"};
        if(updatedPlan.days?.length)setF("nuits",updatedPlan.days.length);
        setPlan(updatedPlan);
        setMsgs([...newMsgs,{role:"assistant",content:"✅ Plan mis à jour ! Consulte les onglets. — Sofia 🌍"}]);
      }else if(data.type==="chat"&&data.reply){
        setMsgs([...newMsgs,{role:"assistant",content:data.reply}]);
      }else{
        setMsgs([...newMsgs,{role:"assistant",content:"⏳ Les serveurs sont surchargés en ce moment. Réessaie dans 1 minute ! — Sofia 🌍"}]);
      }
    }catch{setMsgs([...newMsgs,{role:"assistant",content:"Désolée, erreur de connexion. Réessaie ! — Sofia 🌍"}]);}
    setChatLoad(false);
  };

  const destDisplay=plan?.destination||fixDest(form.destination)||"";
  const transportPlaceholder=(()=>{
    const dep=form.depart&&form.depart.length>2?form.depart:"Luxembourg";
    if((form.transport_to||[]).includes("⛴️ Ferry"))return"ex: ferry depuis Nice ou Marseille (port + horaire)";
    if((form.transport_to||[]).includes("✈️ Avion"))return`ex: vol depuis ${dep}, heure de départ, escale ?`;
    if((form.transport_to||[]).includes("🚄 Train"))return`ex: départ gare de ${dep}, connexions et durée`;
    if((form.transport_to||[]).includes("🚗 Ma voiture")||form.transport_to?.includes("🚗 Voiture louée"))return"ex: durée estimée, autoroutes prévues, parking";
    if((form.transport_to||[]).includes("🚌 Bus"))return"ex: compagnie, numéro de bus, durée";
    return "Ajoute des détails utiles sur ton trajet…";
  })();

  const TABS=[
    {k:"days",l:"🗺️ Itinéraire",n:plan?.days?.length},
    {k:"agenda",l:"📅 À noter",n:plan?.agenda?.length},
    {k:"sites",l:"⭐ Incontournables",n:plan?.remarkable_sites?.length},
    {k:"hotels",l:"🏨 Hébergements",n:plan?.accommodations?.length},
    {k:"restos",l:"🍽️ Restaurants",n:plan?.restaurants?.length},
    {k:"outings",l:"🎯 Sorties & Activités",n:plan?.outings?.length},
    {k:"tips",l:"💡 Conseils",n:plan?.tips?.length},
    {k:"budget",l:"💰 Budget",n:null},
    {k:"packing",l:"🧳 Ma Valise",n:null},
  ];

  const inp={width:"100%",padding:"11px 14px",border:"none",background:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.ink,outline:"none",boxSizing:"border-box"};
  const inpBox={border:"1.5px solid "+C.parch,borderRadius:6,background:C.cream,overflow:"hidden"};
  const lbl={display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:7};
  const secT=t=><div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:14}}>{t}</div>;

  return(
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
      <div className="np" style={{background:C.ink,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div style={{flex:1}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:C.gold}}>Planner</em></div><div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#555"}}>On The Road Again</div></div>
        {phase==="result"&&(
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>generatePDF(plan,form,destDisplay)} style={{padding:"8px 12px",background:C.gold,color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <a href={buildMapUrl(plan,destDisplay)} target="_blank" rel="noopener noreferrer" style={{padding:"8px 12px",background:"transparent",color:"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",display:"inline-block",textDecoration:"none"}}>🗺️ Carte ↗</a>
            <button onClick={()=>{setPhase("form");setPlan(null);setMsgs([]);}} style={{padding:"8px 12px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* FORM */}
      {phase==="form"&&(
        <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px 80px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:44,marginBottom:10}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,5vw,44px)",fontWeight:900,lineHeight:1.1}}>Planifie tes <em style={{color:C.rust}}>vacances parfaites</em></h1>
            <p style={{color:C.mist,fontSize:14,marginTop:10,maxWidth:480,margin:"10px auto 0"}}>Sofia crée ton plan complet avec itinéraire, incontournables, hébergements, restaurants, sorties et valise</p>
          </div>
          {genError&&(
            <div style={{background:genError.type==="network"?"#e3f2fd":genError.type==="overloaded"?"#fff3cd":"#fce4ec",border:"1.5px solid "+(genError.type==="network"?"#1565c0":genError.type==="overloaded"?C.gold:"#c62828"),borderRadius:6,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20,flexShrink:0}}>{genError.type==="network"?"📵":genError.type==="overloaded"?"⏳":"⚠️"}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:genError.type==="network"?"#1565c0":genError.type==="overloaded"?C.gold:"#c62828",marginBottom:2,textTransform:"uppercase"}}>
                  {genError.type==="network"?"Pas de connexion":genError.type==="overloaded"?"Serveurs surchargés":"Génération échouée"}
                </div>
                <div style={{fontSize:13,color:"#555"}}>{genError.msg}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                <button onClick={()=>{setGenError(null);generate();}} style={{background:C.rust,color:"#fff",border:"none",borderRadius:4,padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,whiteSpace:"nowrap"}}>🔄 Réessayer</button>
                <button onClick={()=>setGenError(null)} style={{background:"none",border:"none",fontSize:12,cursor:"pointer",color:"#aaa",textAlign:"center"}}>✕ Fermer</button>
              </div>
            </div>
          )}
          <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"24px 20px",boxShadow:"5px 5px 0 "+C.parch}}>
            <FileUpload file={uploadedFile} onFile={setUploadedFile} onClear={()=>setUploadedFile(null)}/>
            {/* Destination & dates */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("📍 Destination & dates")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div id="field-destination">
                  <span style={lbl}>Destination {!uploadedFile&&"*"}</span>
                  <CityInput value={form.destination} onChange={v=>setF("destination",v)} placeholder="Corse, Bruxelles, Kyoto…" style={{borderColor:errors.destination?"#C1440E":C.parch}}/>
                  {errors.destination&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.destination}</div>}
                </div>
                <div><span style={lbl}>Ville de départ</span><CityInput value={form.depart} onChange={v=>setF("depart",v)} placeholder="Luxembourg, Paris, Bruxelles…"/></div>
              </div>
              <div><span style={lbl}>📅 Dates du séjour</span>
                <DateRangePicker dateStart={form.dateStart} dateEnd={form.dateEnd} nuits={form.nuits} onDateStart={v=>handleDate("dateStart",v)} onDateEnd={v=>handleDate("dateEnd",v)} onNuits={v=>setF("nuits",v)}/>
                {errors.dateEnd&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.dateEnd}</div>}
              </div>
            </div>
            {/* Transport aller */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("✈️ Comment vous y rendre")}
              <div style={{fontSize:12,color:C.mist,marginBottom:10}}>Plusieurs étapes possibles — ex : 🚗 + ⛴️ Ferry</div>
              <div className="fg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:8}}>
                {TRANSPORT_TO.map(t=><button key={t} onClick={()=>toggleArr("transport_to",t)} style={{...pillBtn(form.transport_to.includes(t),C.navy),borderRadius:4,textAlign:"center",padding:"9px 6px",fontSize:11}}>{t}</button>)}
              </div>
              {form.transport_to.length>0&&<div style={{padding:"8px 12px",background:C.navy+"11",border:"1px solid "+C.navy,borderRadius:4,marginBottom:8,fontSize:12,color:C.navy,fontWeight:600}}>🛣️ {form.transport_to.join(" → ")}</div>}
              <div style={inpBox}><input style={inp} value={form.transport_to_autre} onChange={e=>setF("transport_to_autre",e.target.value)} placeholder={transportPlaceholder}/></div>
            </div>
            {/* Voyageurs & budget */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("👥 Voyageurs & budget")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-voyageurs"><span style={lbl}>Voyageurs</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOYAGEURS.map(v=><button key={v} onClick={()=>setF("voyageurs",v)} style={selBtn(form.voyageurs===v,"#3D5A3E")}>{v}</button>)}
                    {form.voyageurs==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.voyageurs_autre} onChange={e=>setF("voyageurs_autre",e.target.value)} placeholder="Ex: 3 adultes + 2 enfants…"/></div>:<button onClick={()=>setF("voyageurs","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
                <div id="field-budget"><span style={lbl}>Budget {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=><button key={b} onClick={()=>setF("budget",b)} style={{...selBtn(form.budget===b,"#8B2500"),borderColor:form.budget===b?"#8B2500":errors.budget?"#C1440E":C.parch}}>{b}</button>)}
                    {form.budget==="Budget global"?<div style={inpBox}><input autoFocus style={inp} value={form.budget_global} onChange={e=>setF("budget_global",e.target.value)} placeholder="Ex: 3000€ pour 2 pers., 7 nuits…"/></div>:<button onClick={()=>setF("budget","Budget global")} style={{...selBtn(false),borderColor:errors.budget?"#C1440E":C.parch}}>💵 Budget global à préciser</button>}
                  </div>
                  {errors.budget&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.budget}</div>}
                </div>
              </div>
            </div>
            {/* Style & hébergement */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("🎯 Style & hébergement")}
              <div style={{marginBottom:14}}><span style={lbl}>Style de voyage <span style={{fontSize:8,fontWeight:400,color:C.mist,letterSpacing:1}}>— plusieurs choix possibles</span></span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES_LIST.map(s=><button key={s} onClick={()=>toggleArr("styles",s)} style={pillBtn(form.styles.includes(s),"#4A3560")}>{s}</button>)}
                  {form.styles.includes("Autre")?<div style={{...inpBox,flex:1,minWidth:160}}><input autoFocus style={{...inp,padding:"7px 12px"}} value={form.style_autre} onChange={e=>setF("style_autre",e.target.value)} placeholder="Précise…"/></div>:<button onClick={()=>toggleArr("styles","Autre")} style={pillBtn(false)}>✏️ Autre</button>}
                </div>
              </div>
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-hebergement"><span style={lbl}>Hébergement {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=><button key={h} onClick={()=>setF("hebergement",h)} style={{...selBtn(form.hebergement===h,C.forest),borderColor:form.hebergement===h?C.forest:errors.hebergement?"#C1440E":C.parch}}>{h}</button>)}
                    {form.hebergement==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.hebergement_autre} onChange={e=>setF("hebergement_autre",e.target.value)} placeholder="Précise…"/></div>:<button onClick={()=>setF("hebergement","Autre")} style={{...selBtn(false),borderColor:errors.hebergement?"#C1440E":C.parch}}>✏️ Autre</button>}
                  </div>
                  {errors.hebergement&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.hebergement}</div>}
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                    <span style={lbl}>Transport sur place</span>
                    <button onClick={()=>setF("transport",form.transport==="sofia"?"":"sofia")}
                      style={{padding:"4px 10px",border:"1.5px solid",borderRadius:100,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:1,transition:"all .15s",
                        background:form.transport==="sofia"?"linear-gradient(135deg,#B8972E,#C1440E)":"transparent",
                        borderColor:form.transport==="sofia"?C.gold:C.parch,
                        color:form.transport==="sofia"?"#fff":C.gold,
                        fontWeight:form.transport==="sofia"?700:400
                      }}>
                      {form.transport==="sofia"?"✨ Sofia choisit":"✨ Sofia choisit pour moi"}
                    </button>
                  </div>
                  {form.transport==="sofia"?(
                    <div style={{padding:"12px 14px",background:"linear-gradient(135deg,#FDF8ED,#FFF9F0)",border:"1.5px solid "+C.gold,borderRadius:6,fontSize:12,color:"#4a3800"}}>
                      <div style={{fontWeight:700,marginBottom:4}}>✨ Sofia s'en charge !</div>
                      <div style={{color:C.mist}}>Sofia analysera ta destination, ton style et ton profil pour recommander le transport idéal dans ton plan.</div>
                    </div>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {TRANSPORTS_LOCAL.map(t=><button key={t} onClick={()=>setF("transport",t)} style={selBtn(form.transport===t,C.navy)}>{t}</button>)}
                      {form.transport==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.transport_autre} onChange={e=>setF("transport_autre",e.target.value)} placeholder="Précise…"/></div>:<button onClick={()=>setF("transport","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Envies */}
            <div style={{marginBottom:24}}>
              {secT("✨ Tes envies & besoins")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><span style={lbl}>Incontournables / Rêves</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Grand-Place, Calanques, plage Palombaggia…"/></div></div>
                <div><span style={lbl}>À éviter</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Pas trop touristique…"/></div></div>
                <div><span style={lbl}>Besoins spéciaux</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie, mobilité réduite…"/></div></div>
                <div><span style={lbl}>Autres informations</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Passionné de plongée, fan de gastronomie…"/></div></div>
              </div>
            </div>
            {/* PMR Toggle */}
            <div style={{marginBottom:16,padding:"14px 16px",background:form.pmr?"linear-gradient(135deg,#e8f4fd,#e3f2fd)":C.cream,border:"1.5px solid "+(form.pmr?"#1565c0":C.parch),borderRadius:6,transition:"all .2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:form.pmr?6:0}}>
                    <span style={{fontSize:20}}>♿</span>
                    <div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:form.pmr?"#1565c0":C.ink}}>Accessibilité / Mobilité réduite</div>
                      <div style={{fontSize:11,color:C.mist}}>Sofia adapte tout le plan : hébergements, restos, activités, transports</div>
                    </div>
                  </div>
                  {form.pmr&&(
                    <div style={{fontSize:12,color:"#1565c0",lineHeight:1.6,marginLeft:28}}>
                      ✓ Hébergements accessibles PMR<br/>
                      ✓ Restaurants de plain-pied<br/>
                      ✓ Activités adaptées (pas de randonnées difficiles)<br/>
                      ✓ Transports accessibles (bus à plancher bas, taxis PMR)
                    </div>
                  )}
                </div>
                <button onClick={()=>setF("pmr",!form.pmr)}
                  style={{padding:"8px 16px",border:"1.5px solid",borderRadius:100,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:1,fontWeight:700,flexShrink:0,transition:"all .2s",
                    background:form.pmr?"#1565c0":"transparent",
                    borderColor:form.pmr?"#1565c0":"#1565c0",
                    color:form.pmr?"#fff":"#1565c0"
                  }}>
                  {form.pmr?"✓ ACTIVÉ":"Activer"}
                </button>
              </div>
            </div>
            <button onClick={generate} style={{width:"100%",padding:"16px",background:C.rust,color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:19,cursor:"pointer"}}>
              {uploadedFile?"📎 Analyser mes notes et créer mon plan →":"Créer mon plan de vacances avec Sofia →"}
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:1}}>
              ⓘ {uploadedFile?"Sofia analysera ton document pour créer un plan complet":"Destination, Budget et Hébergement sont nécessaires"}
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {phase==="loading"&&(
        <div style={{textAlign:"center",padding:"100px 24px"}}>
          <div style={{fontSize:52,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",marginTop:18}}>
            {uploadedFile?"Sofia lit tes notes et prépare ton aventure…":"Sofia prépare ton aventure…"}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","📅 Agenda","⭐ Incontournables","🏨 Hébergements","🍽️ Restos","🎯 Sorties","🧳 Valise"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {phase==="result"&&plan&&(
        <div className="result-layout" style={{display:"flex",height:"calc(100vh - 60px)"}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
            {/* Hero */}
            <div style={{position:"relative",height:130,overflow:"hidden",background:C.ink,flexShrink:0}}>
              <HeroPhoto query={destDisplay?`${destDisplay} ville paysage panoramique`:"travel landscape"}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,color:C.gold,marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,40px)",fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.6)"}}>{destDisplay}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {plan?.days?.length||form.nuits} NUITS{form.voyageurs?` · ${(form.voyageurs==="Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()}`:""}
                </div>
                {form.dateStart&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>
            {plan.intro&&(<div style={{padding:"14px 18px",background:"#f0f7f4",borderBottom:"1px solid "+C.parch,display:"flex",gap:10,flexShrink:0}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
              <div style={{fontSize:13,lineHeight:1.65,color:C.forest,fontStyle:"italic"}}>{plan.intro}</div>
            </div>)}
            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+C.parch,background:"#fff",flexShrink:0}}>
              {TABS.map(t=>(
                <button key={t.k} onClick={()=>{setTab(t.k);if(t.k!=="outings")setOutingDayFilter(null);}} style={{padding:"10px 10px",border:"none",borderBottom:`2px solid ${tab===t.k?C.rust:"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:tab===t.k?C.rust:"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.l}{t.n>0&&<span style={{background:C.parch,color:"#888",borderRadius:10,padding:"1px 5px",fontSize:8}}>{t.n}</span>}
                </button>
              ))}
            </div>
            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>
                {tab==="days"&&(plan.days||[]).map((d,i)=><DayCard key={i} d={d} form={{...form,destination:destDisplay}} plan={plan} setTab={setTab} setOutingDayFilter={setOutingDayFilter}/>)}
                {tab==="agenda"&&<AgendaSection agenda={plan.agenda}/>}
                {tab==="sites"&&(<>
                  {plan.tourism_office?.website&&(<div style={{background:"#fff",border:"1.5px solid "+C.gold,borderRadius:8,padding:"16px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{fontSize:28,flexShrink:0}}>🏛️</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:4}}>Office de Tourisme officiel</div>
                      <div style={{fontSize:13,color:"#4a4640",marginBottom:6}}>{plan.tourism_office.name}</div>
                      {plan.tourism_office.address&&<div style={{fontSize:12,color:C.mist,marginBottom:4}}>📍 {plan.tourism_office.address}</div>}
                      {plan.tourism_office.phone&&<div style={{fontSize:12,color:C.mist,marginBottom:6}}>📞 {plan.tourism_office.phone}</div>}
                      <a href={plan.tourism_office.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"7px 14px",background:C.gold,color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1}}>🌐 Site officiel</a>
                    </div>
                  </div>)}
                  <LinkBar type="remarkable_sites" dest={destDisplay} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre}/><div style={{height:12}}/>
                  {(plan.remarkable_sites||[]).map((s,i)=><ItemCard key={i} item={s} type="remarkable_sites" i={i} form={{...form,destination:destDisplay}}/>)}
                </>)}
                {tab==="hotels"&&(plan.accommodations||[]).map((h,i)=><ItemCard key={i} item={h} type="accommodations" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="restos"&&(plan.restaurants||[]).map((r,i)=><ItemCard key={i} item={r} type="restaurants" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="outings"&&(
                  <div>
                    {outingDayFilter&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"8px 12px",background:C.forest+"11",border:"1px solid "+C.forest,borderRadius:6}}>
                        <span style={{fontSize:12,color:C.forest,fontWeight:600}}>🗓️ Jour {outingDayFilter} uniquement</span>
                        <button onClick={()=>setOutingDayFilter(null)} style={{marginLeft:"auto",background:"none",border:"1px solid "+C.forest,borderRadius:12,padding:"2px 8px",cursor:"pointer",fontSize:10,color:C.forest}}>✕ Voir tout</button>
                      </div>
                    )}
                    {(plan.outings||[]).filter(o=>!outingDayFilter||o.day_num===outingDayFilter||!o.day_num).map((o,i)=><OutingCard key={i} item={o} i={i} form={{...form,destination:destDisplay}}/>)}
                  </div>
                )}
                {tab==="tips"&&(<div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                  {(plan.tips||[]).map((t,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(plan.tips||[]).length-1?"1px solid "+C.parch:"none"}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:C.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                    <div style={{fontSize:13,lineHeight:1.7,color:"#4a4640"}}>{t}</div>
                  </div>))}
                </div>)}
                {tab==="budget"&&plan.budget&&(<div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                  {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport",plan.budget.transport]].map(([l,v])=>v&&(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+C.parch}}><span style={{fontSize:14,color:"#4a4640"}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700}}>{v}</span></div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:C.rust}}>{plan.budget.total}</span></div>
                  <NoteField id="budget-note"/>
                </div>)}
                {tab==="packing"&&<PackingSection packing={plan.packing_essentials}/>}
              </div>
            </div>
            <div style={{textAlign:"center",padding:10,borderTop:"1px solid "+C.parch,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#aaa",flexShrink:0}}>Sofia Planner · On The Road Again{TP_MARKER?" · Liens partenaires":""}</div>
          </div>

          {/* CHAT */}
          <div className="chat-panel" style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid "+C.parch,flexShrink:0}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid "+C.parch,background:C.cream,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold}}>Chat avec Sofia</div><div style={{fontSize:10,color:"#aaa",marginTop:1}}>Demande un changement → plan mis à jour</div></div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?C.rust:C.cream,color:m.role==="user"?"#fff":C.ink,fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid "+C.parch:"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoad&&(<div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                  <div style={{padding:"9px 14px",background:C.cream,border:"1px solid "+C.parch,borderRadius:"14px 14px 14px 3px"}}>
                    {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:C.gold,margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                  </div>
                </div>)}
                <div ref={bottomRef}/>
              </div>
            </div>
            <div style={{borderTop:"1px solid "+C.parch,padding:"10px 12px",flexShrink:0}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {(()=>{
                  const sugg=[
                    "Ajoute une journée",
                    plan?.outings?.length ? "Plus d'activités locales" : "Propose des activités",
                    plan?.accommodations?.[0]?.name ? "Alternative à "+plan.accommodations[0].name : "Hébergement moins cher",
                    "Que faire s'il pleut ?",
                    plan?.restaurants?.[0]?.name ? "Autre option que "+plan.restaurants[0].name : "Conseil restaurant ce soir",
                    "Optimise le budget"
                  ];
                  return sugg.map(s=>(
                    <button key={s} onClick={()=>setChatIn(s)} style={{padding:"4px 8px",background:C.cream,border:"1px solid "+C.parch,borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",color:"#888"}}>{s}</button>
                  ));
                })()}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Demande un changement à Sofia…" disabled={chatLoad} style={{flex:1,padding:"9px 13px",border:"1.5px solid "+C.parch,borderRadius:20,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.ink,outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad} style={{padding:"9px 14px",background:chatIn.trim()&&!chatLoad?C.rust:"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatIn.trim()&&!chatLoad?"pointer":"not-allowed",fontSize:15,flexShrink:0}}>&#9658;</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
