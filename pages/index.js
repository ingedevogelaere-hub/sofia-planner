import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const TP_MARKER = "";

const STYLES_LIST = ["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","⛰️ Montagne","🥾 Randonnées","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS = ["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse","🏠 Je dors chez moi"];
const BUDGETS = ["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const TRANSPORTS_LOCAL = ["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];
const TRANSPORT_TO = ["✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture louée","🚌 Bus","⛴️ Ferry","🚢 Croisière","🛺 Navette"];
const VOYAGEURS = ["Solo","2 adultes","Famille (bébé 0-3 ans)","Famille (enfants 4-12 ans)","Famille (ados)","Groupe d'amis","Couple senior"];

const enc = s => encodeURIComponent(s||"");

function getAdults(v, autre) {
  const val = v === "Autre" ? (autre||"") : (v||"");
  if (val==="Solo") return 1;
  if (val.includes("2 adultes")||val.includes("Couple")) return 2;
  if (val.includes("Groupe")) return 4;
  return 2;
}

function buildLinks(type, dest, dateStart, dateEnd, voyageurs, voyageurs_autre, itemName="") {
  const adults = getAdults(voyageurs, voyageurs_autre);
  const cin = dateStart||""; const cout = dateEnd||"";
  const aid = TP_MARKER ? `&aid=${TP_MARKER}` : "";
  switch(type) {
    case "accommodations": return [
      {l:"Booking",c:"#003580",u:`https://www.booking.com/search.html?ss=${enc(itemName||dest)}&checkin=${cin}&checkout=${cout}&group_adults=${adults}${aid}`},
      {l:"Airbnb",c:"#FF5A5F",u:`https://www.airbnb.fr/s/${enc(dest)}/homes?checkin=${cin}&checkout=${cout}&adults=${adults}`},
      {l:"Hotels.com",c:"#C00",u:`https://fr.hotels.com/search.do?q-destination=${enc(itemName||dest)}&q-check-in=${cin}&q-check-out=${cout}&q-rooms=1&q-room-0-adults=${adults}`},
    ];
    case "restaurants": return [
      {l:"TripAdvisor",c:"#00AA6C",u:`https://www.tripadvisor.fr/Search?q=${enc(itemName||'restaurants')}+${enc(dest)}`},
      {l:"TheFork",c:"#00B551",u:`https://www.thefork.fr/recherche?q=${enc(itemName||dest)}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||'restaurants')}+${enc(dest)}`},
    ];
    case "hikes": return [
      {l:"AllTrails",c:"#3D6B35",u:`https://www.alltrails.com/explore?q=${enc(itemName||dest)}`},
      {l:"Visorando",c:"#5D8B3C",u:`https://www.visorando.com/recherche/?q=${enc(itemName||dest)}`},
      {l:"Komoot",c:"#6EA8C8",u:`https://www.komoot.com/discover/${enc(dest).replace(/%20/g,'-')}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||'randonnée')}+${enc(dest)}`},
    ];
    case "activities": return [
      {l:"Viator",c:"#142A51",u:`https://www.viator.com/searchResults/all?text=${enc(itemName||dest)}&startDate=${cin}`},
      {l:"GetYourGuide",c:"#FF6B35",u:`https://www.getyourguide.fr/s/?q=${enc(itemName||dest)}&date_from=${cin}`},
      {l:"Site officiel",c:"#555",u:`https://www.google.com/search?q=${enc(itemName)}+${enc(dest)}+officiel`},
    ];
    case "remarkable_sites": return [
      {l:"Office Tourisme",c:"#E84D3D",u:`https://www.google.com/search?q=office+tourisme+${enc(dest)}+officiel`},
      {l:"UNESCO",c:"#009EDB",u:`https://whc.unesco.org/fr/list/`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(dest)}+sites`},
    ];
    default: return [];
  }
}

function buildMapUrl(plan, dest) {
  if (!plan) return `https://www.google.com/maps/search/${enc(dest)}`;
  const locs = (plan.days||[]).map(d=>d.location).filter(Boolean);
  if (!locs.length) return `https://www.google.com/maps/search/${enc(dest)}`;
  if (locs.length===1) return `https://www.google.com/maps/search/${enc(locs[0]+", "+dest)}`;
  return `https://www.google.com/maps/dir/${locs.map(l=>enc(l+", "+dest)).join("/")}`;
}

function photoUrl(dest, tag="tourism") {
  return `https://source.unsplash.com/800x400/?${enc(dest+" "+tag)}`;
}

// ─── Styles helpers ────────────────────────────────────────
const COLORS = {
  gold:"#B8972E", rust:"#C1440E", forest:"#2C4A3E", navy:"#1A3A5C",
  ink:"#1C1A14", cream:"#FAF6EE", parch:"#EDE0C4", mist:"#8A9E93"
};

function selBtn(active, activeColor=COLORS.navy) {
  return {
    padding:"9px 12px", border:"1.5px solid", borderRadius:4, textAlign:"left", width:"100%",
    background: active ? activeColor : "transparent",
    borderColor: active ? activeColor : COLORS.parch,
    color: active ? "#fff" : "#666",
    fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", transition:"all .15s"
  };
}
function pillBtn(active, activeColor=COLORS.navy) {
  return {
    padding:"7px 13px", border:"1.5px solid", borderRadius:100,
    background: active ? activeColor : "transparent",
    borderColor: active ? activeColor : COLORS.parch,
    color: active ? "#fff" : "#888",
    fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", transition:"all .15s"
  };
}

// ─── Small components ──────────────────────────────────────
function Photo({ dest, tag="tourism", h=140 }) {
  const [src,setSrc] = useState(photoUrl(dest,tag));
  return (
    <div style={{height:h,overflow:"hidden",background:COLORS.parch,flexShrink:0}}>
      <img src={src} alt={dest} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"
        onError={()=>setSrc(`https://picsum.photos/seed/${enc(dest)}-${tag}/800/400`)}/>
    </div>
  );
}

function LinkBar({type,dest,dateStart,dateEnd,voyageurs,voyageurs_autre,itemName,itemWebsite}) {
  const links = buildLinks(type,dest,dateStart,dateEnd,voyageurs,voyageurs_autre,itemName);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
      {itemWebsite && <a href={itemWebsite} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:COLORS.ink,color:COLORS.gold,borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🌐 Site officiel</a>}
      {links.map(l=><a key={l.l} href={l.u} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:l.c,color:"#fff",borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🔗 {l.l}</a>)}
    </div>
  );
}

function NoteField({id}) {
  const [open,setOpen]=useState(false); const [val,setVal]=useState("");
  return (
    <div style={{marginTop:8}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:COLORS.mist}}>
        📝 {open?"Fermer":"Ajouter une note"}
      </button>
      {open&&<textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Tes notes…" style={{width:"100%",padding:"8px 10px",border:"1.5px solid "+COLORS.parch,borderRadius:4,background:COLORS.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,resize:"none",outline:"none",minHeight:56,marginTop:4,boxSizing:"border-box"}}/>}
      {!open&&val&&<div style={{fontSize:11,color:COLORS.mist,fontStyle:"italic",marginTop:4}}>📌 {val}</div>}
    </div>
  );
}

function Chip({label,bg=COLORS.parch,color=COLORS.ink}) {
  return <span style={{display:"inline-block",padding:"3px 9px",borderRadius:100,background:bg,color,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>{label}</span>;
}

function DayCard({d,form}) {
  return (
    <div style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,overflow:"hidden",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo dest={d.location||form.destination} tag="tourism" h={160}/>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:COLORS.ink,color:COLORS.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,flexShrink:0}}>{d.num}</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{d.title}</div>
            {d.location&&<a href={`https://www.google.com/maps/search/${enc(d.location+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:COLORS.gold,textTransform:"uppercase",marginTop:2,display:"block",textDecoration:"none"}}>📍 {d.location} ↗</a>}
          </div>
        </div>
        {[["🌅 Matin",d.morning],["☀️ Après-midi",d.afternoon],["🌙 Soir",d.evening]].map(([lbl,val])=>val&&(
          <div key={lbl} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+COLORS.cream}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:COLORS.gold,marginBottom:4}}>{lbl}</div>
            <div style={{fontSize:13,lineHeight:1.7,color:"#3a3830"}}>{val}</div>
          </div>
        ))}
        {d.tip&&<div style={{background:COLORS.cream,border:"1px solid "+COLORS.parch,borderRadius:4,padding:"8px 12px",fontSize:12,color:COLORS.mist,fontStyle:"italic"}}>💡 {d.tip}</div>}
        <NoteField id={`day-${d.num}`}/>
      </div>
    </div>
  );
}

function ItemCard({item,type,i,form}) {
  const dest=form.destination;
  const tags={accommodations:"hotel room",restaurants:"restaurant food",hikes:"hiking trail",activities:"tourism",remarkable_sites:"landmark"};
  const coordUrl=item.coords?`https://www.google.com/maps/search/?api=1&query=${item.coords[0]},${item.coords[1]}`:null;
  return (
    <div style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo dest={item.name||dest} tag={tags[type]||"travel"} h={110}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:8}}>{item.name}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {item.label&&<Chip label={item.label} bg="#004A8F22" color="#004A8F"/>}
          {item.type&&<Chip label={item.type}/>}
          {item.cuisine&&<Chip label={item.cuisine} bg="#fff5f0" color="#8B2500"/>}
          {item.difficulty&&<Chip label={item.difficulty} bg={item.difficulty==="Facile"?"#e8f5e9":item.difficulty==="Difficile"?"#fce4ec":"#fff3e0"} color={item.difficulty==="Facile"?"#2e7d32":item.difficulty==="Difficile"?"#c62828":"#e65100"}/>}
          {item.distance&&<Chip label={`📏 ${item.distance}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.duration&&<Chip label={`⏱️ ${item.duration}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.price&&<Chip label={`💰 ${item.price}`} bg={COLORS.cream} color={COLORS.mist}/>}
        </div>
        {(item.address||item.location)&&<a href={coordUrl||`https://www.google.com/maps/search/${enc((item.address||item.location)+", "+dest)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:COLORS.gold,marginBottom:6,textDecoration:"none"}}>📍 {item.address||item.location} ↗</a>}
        {item.start_point&&<div style={{fontSize:12,color:COLORS.forest,marginBottom:4}}>🚩 Départ : {item.start_point}</div>}
        {item.transport_from_center&&<div style={{fontSize:12,color:COLORS.forest,marginBottom:6}}>🚌 Accès : {item.transport_from_center}</div>}
        {(item.why||item.description||item.specialty||item.highlights||item.info)&&<div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>{item.why||item.description||item.specialty||item.highlights||item.info}</div>}
        {item.tip&&<div style={{fontSize:12,color:COLORS.mist,fontStyle:"italic",marginBottom:6}}>💡 {item.tip}</div>}
        <LinkBar type={type} dest={dest} dateStart={form.dateStart} dateEnd={form.dateEnd} voyageurs={form.voyageurs} voyageurs_autre={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website}/>
        <NoteField id={`${type}-${i}`}/>
      </div>
    </div>
  );
}

function AgendaSection({agenda}) {
  if (!agenda?.length) return <div style={{textAlign:"center",padding:40,color:COLORS.mist,fontStyle:"italic"}}>Aucun événement notable aux dates de votre voyage.</div>;
  const colors={positive:{bg:"#e8f5e9",border:"#2e7d32",icon:"🎉"},negative:{bg:"#fce4ec",border:"#c62828",icon:"⚠️"},info:{bg:"#e3f2fd",border:"#1565c0",icon:"ℹ️"}};
  return (
    <div>
      {agenda.map((ev,i)=>{
        const c=colors[ev.type]||colors.info;
        return (
          <div key={i} style={{background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:8,padding:"14px 16px",marginBottom:12,display:"flex",gap:12}}>
            <div style={{fontSize:20,flexShrink:0}}>{c.icon}</div>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700}}>{ev.name}</div>
                {ev.date&&<Chip label={ev.date} bg="rgba(0,0,0,.07)" color="#333"/>}
              </div>
              <div style={{fontSize:13,lineHeight:1.6,color:"#3a3830"}}>{ev.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PackingSection({packing}) {
  const [myItems,setMyItems]=useState([]); const [newItem,setNewItem]=useState(""); const [checked,setChecked]=useState({});
  const toggle=k=>setChecked(c=>({...c,[k]:!c[k]}));
  const add=()=>{if(newItem.trim()){setMyItems(m=>[...m,newItem.trim()]);setNewItem("");}};
  const icons={"Documents":"📄","Santé":"💊","Vêtements":"👕","Technologie":"🔌","Divers":"📦"};
  return (
    <div>
      {(packing||[]).map((cat,ci)=>(
        <div key={ci} style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12}}>{icons[cat.category]||"📦"} {cat.category}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {(cat.items||[]).map((item,ii)=>{const k=`c${ci}-${ii}`;return(
              <label key={ii} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:COLORS.gold,cursor:"pointer",flexShrink:0}}/>
                <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
              </label>
            );})}
          </div>
        </div>
      ))}
      <div style={{background:"#fff",border:"1.5px solid "+COLORS.gold,borderRadius:8,padding:"16px 18px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12,color:COLORS.gold}}>🧳 Mes affaires personnelles</div>
        {myItems.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {myItems.map((item,i)=>{const k=`my-${i}`;return(
            <label key={i} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:COLORS.gold,cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
            </label>
          );})}
        </div>}
        <div style={{display:"flex",gap:8}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Coussins, fromages, café, couteaux…" style={{flex:1,padding:"8px 12px",border:"1.5px solid "+COLORS.parch,borderRadius:4,background:COLORS.cream,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
          <button onClick={add} style={{padding:"8px 16px",background:COLORS.gold,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── File Upload Component ─────────────────────────────────
function FileUpload({file, onFile, onClear}) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain'];
    if (!allowed.includes(f.type)) { alert("Format non supporté. Utilise JPG, PNG, PDF ou TXT."); return; }
    if (f.size > 5 * 1024 * 1024) { alert("Fichier trop grand (max 5 Mo)."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      onFile({ name: f.name, type: f.type, data: base64, preview: f.type.startsWith('image/') ? e.target.result : null });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid "+COLORS.parch}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:8}}>📎 Partage tes notes ou idées à Sofia</div>
      <div style={{fontSize:13,color:COLORS.mist,marginBottom:12}}>Photo d'un carnet, d'un article, d'une liste, d'un email… Sofia lit tout et crée ton voyage.</div>

      {!file ? (
        <div
          onClick={()=>ref.current.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
          style={{border:`2px dashed ${drag?COLORS.gold:COLORS.parch}`,borderRadius:8,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:drag?"#FDF8ED":COLORS.cream,transition:"all .2s"}}>
          <div style={{fontSize:36,marginBottom:8}}>📸</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:COLORS.gold,marginBottom:4}}>Glisse un fichier ici ou clique</div>
          <div style={{fontSize:12,color:COLORS.mist}}>JPG, PNG, PDF, TXT — max 5 Mo</div>
          <input ref={ref} type="file" accept="image/*,.pdf,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      ) : (
        <div style={{border:"1.5px solid "+COLORS.gold,borderRadius:8,padding:"14px 16px",background:"#FDF8ED",display:"flex",gap:12,alignItems:"center"}}>
          {file.preview
            ? <img src={file.preview} alt="preview" style={{width:60,height:60,objectFit:"cover",borderRadius:4,flexShrink:0}}/>
            : <div style={{width:60,height:60,background:COLORS.parch,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>📄</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:COLORS.gold,marginBottom:3}}>✅ Fichier chargé</div>
            <div style={{fontSize:13,color:COLORS.ink,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</div>
            <div style={{fontSize:11,color:COLORS.mist,marginTop:2}}>Sofia va analyser ce document</div>
          </div>
          <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#aaa",flexShrink:0}}>×</button>
        </div>
      )}

      {file && (
        <div style={{marginTop:10,padding:"10px 14px",background:"#e3f2fd",border:"1px solid #1565c0",borderRadius:6,fontSize:12,color:"#1565c0"}}>
          ℹ️ <strong>Tu peux remplir le formulaire ci-dessous</strong> pour affiner, ou laisser Sofia déduire tout depuis ton document.
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function SofiaPlanner() {
  const [phase,setPhase]=useState("form");
  const [plan,setPlan]=useState(null);
  const [errors,setErrors]=useState({});
  const [msgs,setMsgs]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [tab,setTab]=useState("days");
  const [showMap,setShowMap]=useState(false);
  const [overloaded,setOverloaded]=useState(false);
  const [uploadedFile,setUploadedFile]=useState(null);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const [form,setForm]=useState({
    destination:"",depart:"",dateStart:"",dateEnd:"",nuits:7,
    voyageurs:"",voyageurs_autre:"",
    budget:"",budget_global:"",
    styles:[],style_autre:"",
    hebergement:"",hebergement_autre:"",
    transport:"",transport_autre:"",
    transport_to:[],transport_to_autre:"",
    special:"",musts:"",avoid:"",notes:""
  });

  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleArr=(k,v)=>setF(k,form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const handleDate=(k,v)=>{
    setF(k,v);
    const start=k==="dateStart"?v:form.dateStart;
    const end=k==="dateEnd"?v:form.dateEnd;
    if(start&&end){
      const diff=Math.round((new Date(end)-new Date(start))/(1000*60*60*24));
      if(diff>0){setF("nuits",diff);setErrors(e=>({...e,dateEnd:undefined}));}
      else setErrors(e=>({...e,dateEnd:"La date de retour doit être après le départ"}));
    }
  };

  const validate=()=>{
    const e={};
    // If file uploaded, destination is optional
    if(!uploadedFile && !form.destination.trim()) e.destination="Destination obligatoire";
    if(!uploadedFile && !form.budget) e.budget="Budget obligatoire";
    if(!uploadedFile && !form.hebergement) e.hebergement="Hébergement obligatoire";
    if(form.dateStart&&form.dateEnd&&new Date(form.dateEnd)<=new Date(form.dateStart)) e.dateEnd="La date de retour doit être après le départ";
    setErrors(e);
    if(Object.keys(e).length>0){
      document.getElementById("field-"+Object.keys(e)[0])?.scrollIntoView({behavior:"smooth",block:"center"});
    }
    return Object.keys(e).length===0;
  };

  const generate=async()=>{
    if(!validate())return;
    setPhase("loading");setOverloaded(false);
    try{
      const body={formData:form.destination||form.budget?form:null};
      if(uploadedFile){body.fileData=uploadedFile.data;body.fileType=uploadedFile.type;}
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(res.status===529||data.error==="OVERLOADED"){setPhase("form");setOverloaded(true);return;}
      if(!res.ok)throw new Error(data.error||"Erreur");
      if(data.type==="plan"){
        const p={...data.data,destination:form.destination||data.data.destination||"Voyage"};
        setPlan(p);setMsgs([{role:"assistant",content:data.data.intro||"Votre plan est prêt !"}]);setPhase("result");
      }else{
        // Chat response - still a valid reply
        alert("Sofia répond : "+data.reply);setPhase("form");
      }
    }catch(err){alert("Erreur : "+err.message);setPhase("form");}
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad)return;
    const userMsg={role:"user",content:chatIn.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setChatIn("");setChatLoad(true);
    try{
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),currentPlan:plan})});
      const data=await res.json();
      if(data.type==="plan"&&data.data?.days){
        const p={...data.data,destination:form.destination||plan?.destination||"Voyage"};
        setPlan(p);setMsgs([...newMsgs,{role:"assistant",content:"✅ J'ai mis à jour ton plan ! — Sofia 🌍"}]);
      }else{
        setMsgs([...newMsgs,{role:"assistant",content:data.reply||"Désolée, une erreur !"}]);
      }
    }catch{setMsgs([...newMsgs,{role:"assistant",content:"Désolée, une erreur !"}]);}
    setChatLoad(false);
  };

  const openPDF=()=>{
    const win=window.open("","_blank");
    const dest=plan?.destination||form.destination;
    const rows=(arr,fn)=>(arr||[]).map(fn).join("");
    const dayH=rows(plan?.days,d=>`<div style="page-break-inside:avoid;margin-bottom:20px;border:1px solid #ddd;border-radius:8px;overflow:hidden"><div style="background:#1C1A14;color:#B8972E;padding:12px 16px;font-family:Georgia,serif;font-size:15px;font-weight:700">Jour ${d.num} — ${d.title||""}${d.location?` 📍 ${d.location}`:""}</div><div style="padding:14px;font-size:12px;line-height:1.7">${d.morning?`<p><b>🌅 Matin :</b> ${d.morning}</p>`:""}${d.afternoon?`<p><b>☀️ Après-midi :</b> ${d.afternoon}</p>`:""}${d.evening?`<p><b>🌙 Soir :</b> ${d.evening}</p>`:""}${d.tip?`<p style="color:#8A9E93;font-style:italic">💡 ${d.tip}</p>`:""}</div></div>`);
    const siteH=rows(plan?.remarkable_sites,s=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${s.name}</b>${s.label?` [${s.label}]`:""}<br><small style="color:#B8972E">📍 ${s.location||""}</small><br>${s.description||""}</div>`);
    const hotelH=rows(plan?.accommodations,h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — ${h.type||""} — 📍 ${h.location||""} — 💰 ${h.price||""}<br><i>${h.why||""}</i></div>`);
    const restoH=rows(plan?.restaurants,r=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${r.name}</b> — ${r.cuisine||""} — 💰 ${r.price||""}<br>📍 ${r.address||""}<br>⭐ ${r.specialty||""}</div>`);
    const hikeH=rows(plan?.hikes,h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — 📏${h.distance||""} — ⏱️${h.duration||""} — 🎯${h.difficulty||""}<br>🚩 ${h.start_point||""} — 🚌 ${h.transport_from_center||""}<br>${h.highlights||""}</div>`);
    const actH=rows(plan?.activities,a=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${a.name}</b> — ⏱️${a.duration||""} — 💰${a.price||""}<br>📍${a.address||""}<br><i>${a.info||""}</i></div>`);
    const agendaH=rows(plan?.agenda,ev=>`<div style="margin-bottom:8px;padding:8px;border-left:3px solid ${ev.type==="positive"?"#2e7d32":ev.type==="negative"?"#c62828":"#1565c0"};background:${ev.type==="positive"?"#e8f5e9":ev.type==="negative"?"#fce4ec":"#e3f2fd"}"><b>${ev.type==="positive"?"🎉":ev.type==="negative"?"⚠️":"ℹ️"} ${ev.name}</b>${ev.date?` — ${ev.date}`:""}<br>${ev.description||""}</div>`);
    const tipsH=(plan?.tips||[]).map((t,i)=>`<p style="margin-bottom:6px"><b>${i+1}.</b> ${t}</p>`).join("");
    const b=plan?.budget||{};
    const budH=`<table style="width:100%;font-size:12px">${[["🏨",b.accommodation],["🍽️",b.meals],["🎯",b.activities],["🚗",b.transport]].map(([l,v])=>v?`<tr><td>${l} ${l==="🏨"?"Hébergement":l==="🍽️"?"Repas":l==="🎯"?"Activités":"Transport"}</td><td style="text-align:right;font-weight:600">${v}</td></tr>`:"").join("")}<tr style="font-weight:700;color:#C1440E"><td>TOTAL ESTIMÉ</td><td style="text-align:right">${b.total||"—"}</td></tr></table>`;
    const sec=(t,h)=>h?`<div style="page-break-before:always;padding:20px 0"><h2 style="font-family:Georgia,serif;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">${t}</h2>${h}</div>`:"";
    const mapUrl=buildMapUrl(plan,dest);
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sofia — ${dest}</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#333}@media print{body{margin:0;padding:20px}.no-print{display:none}}</style></head><body>
<div style="background:#1C1A14;color:#fff;padding:24px;text-align:center;border-radius:8px;margin-bottom:24px">
  <div style="font-size:10px;letter-spacing:4px;color:#B8972E">✦ ON THE ROAD AGAIN ✦</div>
  <h1 style="font-family:Georgia,serif;font-size:30px;margin:8px 0">${dest}</h1>
  <div style="font-size:11px;color:#aaa">${form.nuits} NUITS${form.dateStart?" · "+form.dateStart+" → "+form.dateEnd:""}</div>
</div>
${plan?.intro?`<div style="background:#f0f7f4;border-left:4px solid #2C4A3E;padding:14px;margin-bottom:20px;font-style:italic;color:#2C4A3E">${plan.intro}</div>`:""}
<div class="no-print" style="text-align:center;margin-bottom:20px"><a href="${mapUrl}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4285F4;color:#fff;border-radius:4px;text-decoration:none">🗺️ Voir l'itinéraire sur Google Maps</a></div>
<h2 style="font-family:Georgia,serif;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">🗺️ Itinéraire</h2>${dayH}
${plan?.agenda?.length?sec("📅 Agenda & Événements",agendaH):""}
${sec("🏛️ Sites Remarquables",siteH)}${sec("🏨 Hébergements",hotelH)}${sec("🍽️ Restaurants",restoH)}${sec("🥾 Randonnées",hikeH)}${sec("🎯 Activités",actH)}
${plan?.tips?.length?sec("💡 Conseils",tipsH):""}${plan?.budget?sec("💰 Budget",budH):""}
<div style="text-align:center;margin-top:32px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:16px">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString("fr-FR")}${TP_MARKER?" · Liens partenaires":""}</div>
<script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
  };

  const destForDisplay = plan?.destination||form.destination;
  const seed = destForDisplay.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");

  const TABS=[
    {k:"days",l:"🗺️ Itinéraire",n:plan?.days?.length},
    {k:"agenda",l:"📅 Agenda",n:plan?.agenda?.length},
    {k:"sites",l:"🏛️ Sites",n:plan?.remarkable_sites?.length},
    {k:"hotels",l:"🏨 Hébergements",n:plan?.accommodations?.length},
    {k:"restos",l:"🍽️ Restaurants",n:plan?.restaurants?.length},
    {k:"hikes",l:"🥾 Randonnées",n:plan?.hikes?.length},
    {k:"acts",l:"🎯 Activités",n:plan?.activities?.length},
    {k:"tips",l:"💡 Conseils",n:plan?.tips?.length},
    {k:"budget",l:"💰 Budget",n:null},
    {k:"packing",l:"🧳 Ma Valise",n:null},
  ];

  const inp={width:"100%",padding:"11px 14px",border:"1.5px solid "+COLORS.parch,borderRadius:4,background:COLORS.cream,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:COLORS.ink,outline:"none",boxSizing:"border-box"};
  const lbl={display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:COLORS.gold,marginBottom:7};
  const secTitle=t=><div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:14}}>{t}</div>;

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
        @media(max-width:768px){
          .result-layout{flex-direction:column!important;height:auto!important}
          .chat-panel{width:100%!important;height:380px!important;border-left:none!important;border-top:1px solid #EDE0C4!important}
          .form-grid-2{grid-template-columns:1fr!important}
          .form-grid-4{grid-template-columns:1fr 1fr!important}
          .header-btns button{font-size:7px!important;padding:6px 8px!important}
        }
        @media print{.no-print{display:none!important}body{background:#fff!important}}
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{background:COLORS.ink,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:COLORS.gold}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#555"}}>On The Road Again</div>
        </div>
        {phase==="result"&&(
          <div className="header-btns" style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={openPDF} style={{padding:"8px 12px",background:COLORS.gold,color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>setShowMap(m=>!m)} style={{padding:"8px 12px",background:showMap?COLORS.rust:"transparent",color:showMap?"#fff":"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>🗺️ Carte</button>
            <button onClick={()=>{setPhase("form");setPlan(null);setMsgs([]);}} style={{padding:"8px 12px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ══ FORM ══ */}
      {phase==="form"&&(
        <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px 80px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:44,marginBottom:10}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,5vw,44px)",fontWeight:900,lineHeight:1.1}}>Planifie tes <em style={{color:COLORS.rust}}>vacances parfaites</em></h1>
            <p style={{color:COLORS.mist,fontSize:14,marginTop:10,maxWidth:480,margin:"10px auto 0"}}>Sofia crée ton plan complet avec itinéraire, sites, hébergements, restaurants, randonnées et valise</p>
          </div>

          {overloaded&&(
            <div style={{background:"#fff3cd",border:"1.5px solid "+COLORS.gold,borderRadius:6,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>⏳</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:COLORS.gold,marginBottom:2}}>Serveurs surchargés</div>
                <div style={{fontSize:13,color:"#666"}}>Attends 1-2 minutes et réessaie.</div>
              </div>
              <button onClick={()=>setOverloaded(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#aaa"}}>×</button>
            </div>
          )}

          <div style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,padding:"24px 20px",boxShadow:"5px 5px 0 "+COLORS.parch}}>

            {/* FILE UPLOAD */}
            <FileUpload file={uploadedFile} onFile={setUploadedFile} onClear={()=>setUploadedFile(null)}/>

            {/* 1 - Destination & dates */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+COLORS.parch}}>
              {secTitle("📍 Destination & dates")}
              <div className="form-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div id="field-destination">
                  <span style={lbl}>Destination {!uploadedFile&&"*"}</span>
                  <input style={{...inp,borderColor:errors.destination?"#C1440E":undefined}} value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Corse, Kyoto, Islande…"/>
                  {errors.destination&&<div style={{fontSize:11,color:COLORS.rust,marginTop:4}}>⚠️ {errors.destination}</div>}
                </div>
                <div>
                  <span style={lbl}>Ville de départ</span>
                  <input style={inp} value={form.depart} onChange={e=>setF("depart",e.target.value)} placeholder="Luxembourg, Paris, Bruxelles…"/>
                </div>
              </div>
<div style={{background:COLORS.cream,border:"1px solid "+COLORS.parch,borderRadius:6,padding:"14px 16px"}}>
                <span style={lbl}>Dates du séjour</span>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:10,color:COLORS.mist,marginBottom:4,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>📅 DATE DE DÉPART</div>
                    <input type="date" style={inp} value={form.dateStart} onChange={e=>handleDate("dateStart",e.target.value)}/>
                  </div>
                  <div id="field-nuits">
                    <div style={{fontSize:10,color:COLORS.mist,marginBottom:4,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>🌙 NOMBRE DE NUITS</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>setF("nuits",Math.max(1,form.nuits-1))} style={{width:36,height:36,border:"1.5px solid "+COLORS.parch,borderRadius:4,background:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                      <div style={{flex:1,textAlign:"center",fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:COLORS.gold}}>{form.nuits}</div>
                      <button onClick={()=>setF("nuits",Math.min(90,form.nuits+1))} style={{width:36,height:36,border:"1.5px solid "+COLORS.parch,borderRadius:4,background:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    </div>
                  </div>
                </div>
                {form.dateStart && (()=>{
                  const end = new Date(form.dateStart);
                  end.setDate(end.getDate()+form.nuits);
                  const endStr = end.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
                  return <div style={{padding:"10px 14px",background:"#fff",border:"1.5px solid "+COLORS.gold,borderRadius:4,fontSize:13,color:COLORS.ink}}>
                    🏠 Retour le <strong>{endStr}</strong>
                  </div>;
                })()}
              </div>
                  <div>
                    <div style={{fontSize:10,color:COLORS.mist,marginBottom:4,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>DÉPART</div>
                    <input type="date" style={inp} value={form.dateStart} onChange={e=>handleDate("dateStart",e.target.value)}/>
                  </div>
                  <div style={{textAlign:"center",color:COLORS.gold,fontSize:18}}>→</div>
                  <div id="field-dateEnd">
                    <div style={{fontSize:10,color:COLORS.mist,marginBottom:4,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>RETOUR</div>
                    <input type="date" style={{...inp,borderColor:errors.dateEnd?"#C1440E":undefined}} value={form.dateEnd} onChange={e=>handleDate("dateEnd",e.target.value)}/>
                    {errors.dateEnd&&<div style={{fontSize:11,color:COLORS.rust,marginTop:4}}>⚠️ {errors.dateEnd}</div>}
                  </div>
                </div>
                {form.dateStart&&form.dateEnd&&!errors.dateEnd?(
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fff",border:"1.5px solid "+COLORS.gold,borderRadius:4}}>
                    <span style={{fontSize:18}}>🌙</span>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:COLORS.gold}}>{form.nuits} nuits</span>
                  </div>
                ):(
                  <div id="field-nuits">
                    <span style={{...lbl,color:COLORS.mist}}>Ou combien de nuits ?</span>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <input type="number" min="1" max="90" style={{...inp,width:80}} value={form.nuits} onChange={e=>setF("nuits",parseInt(e.target.value)||1)}/>
                      <span style={{fontSize:13,color:COLORS.mist}}>nuits</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2 - Transport aller (multi-select) */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+COLORS.parch}}>
              {secTitle("✈️ Comment vous y rendre")}
              <div style={{fontSize:12,color:COLORS.mist,marginBottom:10}}>Tu peux sélectionner <strong>plusieurs étapes</strong> — ex : Ma voiture + Ferry</div>
              <div className="form-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:8}}>
                {TRANSPORT_TO.map(t=>(
                  <button key={t} onClick={()=>toggleArr("transport_to",t)}
                    style={{...pillBtn(form.transport_to.includes(t),COLORS.navy),borderRadius:4,textAlign:"center",padding:"9px 6px",fontSize:11}}>
                    {t}
                  </button>
                ))}
              </div>
              {form.transport_to.length>0&&(
                <div style={{padding:"8px 12px",background:"#e3f2fd",border:"1px solid "+COLORS.navy,borderRadius:4,marginBottom:8,fontSize:12,color:COLORS.navy}}>
                  🛣️ Trajet : {form.transport_to.join(" → ")}
                </div>
              )}
              <input style={inp} value={form.transport_to_autre} onChange={e=>setF("transport_to_autre",e.target.value)} placeholder={form.transport_to.includes("⛴️ Ferry") && form.destination ? `ex: ferry vers ${form.destination} — port et horaire` : form.transport_to.includes("✈️ Avion") && form.depart ? `ex: vol depuis ${form.depart||"Luxembourg"} avec escale` : form.transport_to.includes("🚄 Train") ? `ex: départ depuis ${form.depart||"Luxembourg"}, correspondances` : "Précise les détails de ton trajet…"}/>
            </div>

            {/* 3 - Voyageurs & budget */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+COLORS.parch}}>
              {secTitle("👥 Voyageurs & budget")}
              <div className="form-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-voyageurs">
                  <span style={lbl}>Voyageurs</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOYAGEURS.map(v=>(
                      <button key={v} onClick={()=>setF("voyageurs",v)} style={selBtn(form.voyageurs===v,"#3D5A3E")}>{v}</button>
                    ))}
                    {form.voyageurs==="Autre"
                      ? <input autoFocus style={inp} value={form.voyageurs_autre} onChange={e=>setF("voyageurs_autre",e.target.value)} placeholder="Ex: 3 adultes + 2 enfants…"/>
                      : <button onClick={()=>setF("voyageurs","Autre")} style={selBtn(false)}>✏️ Autre</button>
                    }
                  </div>
                </div>
                <div id="field-budget">
                  <span style={lbl}>Budget {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=>(
                      <button key={b} onClick={()=>setF("budget",b)} style={{...selBtn(form.budget===b,"#8B2500"),borderColor:form.budget===b?"#8B2500":errors.budget?"#C1440E":COLORS.parch}}>{b}</button>
                    ))}
                    {form.budget==="Budget global"
                      ? <input autoFocus style={inp} value={form.budget_global} onChange={e=>setF("budget_global",e.target.value)} placeholder="Ex: 3000€ pour 2 personnes, 7 nuits…"/>
                      : <button onClick={()=>setF("budget","Budget global")} style={{...selBtn(false),borderColor:errors.budget?"#C1440E":COLORS.parch}}>💵 Budget global à préciser</button>
                    }
                  </div>
                  {errors.budget&&<div style={{fontSize:11,color:COLORS.rust,marginTop:4}}>⚠️ {errors.budget}</div>}
                </div>
              </div>
            </div>

            {/* 4 - Style & hébergement */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+COLORS.parch}}>
              {secTitle("🎯 Style & hébergement")}
              <div style={{marginBottom:14}}>
                <span style={lbl}>Style de voyage (plusieurs choix)</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES_LIST.map(s=>(
                    <button key={s} onClick={()=>toggleArr("styles",s)} style={pillBtn(form.styles.includes(s),"#4A3560")}>{s}</button>
                  ))}
                  {form.styles.includes("Autre")
                    ? <input autoFocus style={{...inp,width:"auto",flex:1,minWidth:160}} value={form.style_autre} onChange={e=>setF("style_autre",e.target.value)} placeholder="Précise…"/>
                    : <button onClick={()=>toggleArr("styles","Autre")} style={pillBtn(false)}>✏️ Autre</button>
                  }
                </div>
              </div>
              <div className="form-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-hebergement">
                  <span style={lbl}>Hébergement {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=>(
                      <button key={h} onClick={()=>setF("hebergement",h)} style={{...selBtn(form.hebergement===h,COLORS.forest),borderColor:form.hebergement===h?COLORS.forest:errors.hebergement?"#C1440E":COLORS.parch}}>{h}</button>
                    ))}
                    {form.hebergement==="Autre"
                      ? <input autoFocus style={inp} value={form.hebergement_autre} onChange={e=>setF("hebergement_autre",e.target.value)} placeholder="Précise…"/>
                      : <button onClick={()=>setF("hebergement","Autre")} style={{...selBtn(false),borderColor:errors.hebergement?"#C1440E":COLORS.parch}}>✏️ Autre</button>
                    }
                  </div>
                  {errors.hebergement&&<div style={{fontSize:11,color:COLORS.rust,marginTop:4}}>⚠️ {errors.hebergement}</div>}
                </div>
                <div>
                  <span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS_LOCAL.map(t=>(
                      <button key={t} onClick={()=>setF("transport",t)} style={selBtn(form.transport===t,COLORS.navy)}>{t}</button>
                    ))}
                    {form.transport==="Autre"
                      ? <input autoFocus style={inp} value={form.transport_autre} onChange={e=>setF("transport_autre",e.target.value)} placeholder="Précise…"/>
                      : <button onClick={()=>setF("transport","Autre")} style={selBtn(false)}>✏️ Autre</button>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* 5 - Envies */}
            <div style={{marginBottom:24}}>
              {secTitle("✨ Tes envies & besoins")}
              <div className="form-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><span style={lbl}>Incontournables / Rêves</span><textarea style={{...inp,height:80,resize:"none"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Voir les Calanques, manger du vrai brocciu, coucher de soleil sur Bonifacio…"/></div>
                <div><span style={lbl}>À éviter</span><textarea style={{...inp,height:80,resize:"none"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Pas de foules, pas de circuits organisés, éviter le nord de l'île…"/></div>
                <div><span style={lbl}>Besoins spéciaux</span><textarea style={{...inp,height:70,resize:"none"}} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie gluten, mobilité réduite, bébé, animal de compagnie…"/></div>
                <div><span style={lbl}>Autres informations</span><textarea style={{...inp,height:70,resize:"none"}} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Passionné de plongée, budget resto max 25€/pers, fan de street food…"/></div>
              </div>
            </div>

            <button onClick={generate} style={{width:"100%",padding:"16px",background:COLORS.rust,color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:19,cursor:"pointer"}}>
              {uploadedFile ? "📎 Analyser mon document et créer mon plan →" : "Créer mon plan de vacances avec Sofia →"}
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:1}}>
              ⓘ {uploadedFile ? "Sofia analysera ton document et créera un plan complet" : "Destination, Budget et Hébergement sont nécessaires"}
            </div>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading"&&(
        <div style={{textAlign:"center",padding:"100px 24px"}}>
          <div style={{fontSize:52,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",marginTop:18}}>
            {uploadedFile ? "Sofia analyse ton document…" : "Sofia prépare ton aventure…"}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","📅 Agenda","🏛️ Sites","🏨 Hébergements","🍽️ Restos","🥾 Randos","🎯 Activités","🧳 Valise"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:COLORS.gold,animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result"&&plan&&(
        <div className="result-layout" style={{display:"flex",height:"calc(100vh - 60px)"}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:COLORS.ink,flexShrink:0}}>
              <img src={`https://source.unsplash.com/1200x500/?${enc(destForDisplay)},city,tourism`} alt={destForDisplay}
                style={{width:"100%",height:"100%",objectFit:"cover",opacity:.55}}
                onError={e=>{e.target.src=`https://picsum.photos/seed/${seed}/1200/500`;}}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,color:COLORS.gold,marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,40px)",fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.6)"}}>{destForDisplay}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.nuits} NUITS{form.voyageurs?` · ${(form.voyageurs==="Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()}`:""}
                </div>
                {form.dateStart&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>

            {/* Map */}
            {showMap&&(
              <div style={{flexShrink:0,borderBottom:"1px solid "+COLORS.parch}}>
                <div style={{background:COLORS.ink,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:COLORS.gold}}>🗺️ {destForDisplay}</span>
                  <a href={buildMapUrl(plan,destForDisplay)} target="_blank" rel="noopener noreferrer"
                    style={{padding:"4px 10px",background:"#4285F4",color:"#fff",borderRadius:3,fontFamily:"'DM Mono',monospace",fontSize:8}}>
                    Ouvrir dans Maps ↗
                  </a>
                </div>
                <iframe src={`https://maps.google.com/maps?q=${enc(destForDisplay)}&output=embed&z=12`} width="100%" height="260" style={{border:"none",display:"block"}} loading="lazy" title="Carte"/>
              </div>
            )}

            {/* Intro */}
            {plan.intro&&(
              <div style={{padding:"14px 18px",background:"#f0f7f4",borderBottom:"1px solid "+COLORS.parch,display:"flex",gap:10,flexShrink:0}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div style={{fontSize:13,lineHeight:1.65,color:COLORS.forest,fontStyle:"italic"}}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+COLORS.parch,background:"#fff",flexShrink:0}}>
              {TABS.map(t=>(
                <button key={t.k} onClick={()=>setTab(t.k)}
                  style={{padding:"10px 10px",border:"none",borderBottom:`2px solid ${tab===t.k?COLORS.rust:"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:tab===t.k?COLORS.rust:"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.l}{t.n>0&&<span style={{background:COLORS.parch,color:"#888",borderRadius:10,padding:"1px 5px",fontSize:8}}>{t.n}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>
                {tab==="days"  &&(plan.days||[]).map((d,i)=><DayCard key={i} d={d} form={{...form,destination:destForDisplay}}/>)}
                {tab==="agenda"&&<AgendaSection agenda={plan.agenda}/>}
                {tab==="sites" &&(<><LinkBar type="remarkable_sites" dest={destForDisplay} dateStart={form.dateStart} dateEnd={form.dateEnd} voyageurs={form.voyageurs} voyageurs_autre={form.voyageurs_autre}/><div style={{height:12}}/>{(plan.remarkable_sites||[]).map((s,i)=><ItemCard key={i} item={s} type="remarkable_sites" i={i} form={{...form,destination:destForDisplay}}/>)}</>)}
                {tab==="hotels"&&(plan.accommodations||[]).map((h,i)=><ItemCard key={i} item={h} type="accommodations" i={i} form={{...form,destination:destForDisplay}}/>)}
                {tab==="restos"&&(plan.restaurants||[]).map((r,i)=><ItemCard key={i} item={r} type="restaurants" i={i} form={{...form,destination:destForDisplay}}/>)}
                {tab==="hikes" &&(plan.hikes||[]).map((h,i)=><ItemCard key={i} item={h} type="hikes" i={i} form={{...form,destination:destForDisplay}}/>)}
                {tab==="acts"  &&(plan.activities||[]).map((a,i)=><ItemCard key={i} item={a} type="activities" i={i} form={{...form,destination:destForDisplay}}/>)}
                {tab==="tips"  &&(
                  <div style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                    {(plan.tips||[]).map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(plan.tips||[]).length-1?"1px solid "+COLORS.parch:"none"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:COLORS.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:13,lineHeight:1.7,color:"#4a4640"}}>{t}</div>
                      </div>
                    ))}
                  </div>
                )}
                {tab==="budget"&&plan.budget&&(
                  <div style={{background:"#fff",border:"1.5px solid "+COLORS.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                    {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport",plan.budget.transport]].map(([l,v])=>v&&(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+COLORS.parch}}>
                        <span style={{fontSize:14,color:"#4a4640"}}>{l}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0"}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:COLORS.rust}}>{plan.budget.total}</span>
                    </div>
                    <NoteField id="budget-note"/>
                  </div>
                )}
                {tab==="packing"&&<PackingSection packing={plan.packing_essentials}/>}
              </div>
            </div>

            <div style={{textAlign:"center",padding:10,borderTop:"1px solid "+COLORS.parch,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#aaa",flexShrink:0}}>
              Sofia Planner · On The Road Again{TP_MARKER?" · Liens partenaires":""}
            </div>
          </div>

          {/* CHAT */}
          <div className="chat-panel" style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid "+COLORS.parch,flexShrink:0}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid "+COLORS.parch,background:COLORS.cream,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:COLORS.gold}}>Chat avec Sofia</div>
                  <div style={{fontSize:10,color:"#aaa",marginTop:1}}>Demande un changement → plan mis à jour</div>
                </div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?COLORS.rust:COLORS.cream,color:m.role==="user"?"#fff":COLORS.ink,fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid "+COLORS.parch:"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoad&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                    <div style={{padding:"9px 14px",background:COLORS.cream,border:"1px solid "+COLORS.parch,borderRadius:"14px 14px 14px 3px"}}>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:COLORS.gold,margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>
            <div style={{borderTop:"1px solid "+COLORS.parch,padding:"10px 12px",flexShrink:0}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {["Ajoute une journée","Change le jour 2","Plus de randonnées","Hébergement moins cher","Version végétarienne","Optimise le budget"].map(s=>(
                  <button key={s} onClick={()=>setChatIn(s)} style={{padding:"4px 8px",background:COLORS.cream,border:"1px solid "+COLORS.parch,borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",color:"#888"}}>{s}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder="Demande un changement à Sofia…" disabled={chatLoad}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid "+COLORS.parch,borderRadius:20,background:COLORS.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:COLORS.ink,outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad}
                  style={{padding:"9px 14px",background:chatIn.trim()&&!chatLoad?COLORS.rust:"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatIn.trim()&&!chatLoad?"pointer":"not-allowed",fontSize:15,flexShrink:0}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
