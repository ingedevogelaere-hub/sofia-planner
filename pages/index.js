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

  const [curMonth,setCurMonth]=useState(()=>{
    const d=dateStart?parseLocalDate(dateStart):new Date();
    return new Date(d.getFullYear(),d.getMonth(),1);
  });
  const [hovered,setHovered]=useState(null);

  const start=parseLocalDate(dateStart);
  const end=parseLocalDate(dateEnd);

  const daysInMonth=new Date(curMonth.getFullYear(),curMonth.getMonth()+1,0).getDate();
  const firstDay=new Date(curMonth.getFullYear(),curMonth.getMonth(),1).getDay();
  const startOffset=(firstDay+6)%7; // Mon=0

  const handleDay=(day)=>{
    const clicked=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
    if(clicked<today) return;
    if(!start||(start&&end)){
      // Start fresh
      onDateStart(toDateStr(clicked));
      onDateEnd("");
      setHovered(null);
    } else {
      if(clicked<=start){
        // Clicked before or on start — reset to new start
        onDateStart(toDateStr(clicked));
        onDateEnd("");
        setHovered(null);
      } else {
        // Set end date
        const nights=Math.round((clicked-start)/(1000*60*60*24));
        onDateEnd(toDateStr(clicked));
        onNuits(nights);
        setHovered(null);
      }
    }
  };

  const reset=()=>{
    onDateStart("");
    onDateEnd("");
    onNuits(7);
    setHovered(null);
  };

  const getStatus=(day)=>{
    const d=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
    const isS=start&&d.getTime()===start.getTime();
    const isE=end&&d.getTime()===end.getTime();
    const effEnd=end||(hovered?new Date(curMonth.getFullYear(),curMonth.getMonth(),hovered):null);
    const inRange=start&&effEnd&&d>start&&d<effEnd;
    const isPast=d<today;
    const isToday=d.getTime()===today.getTime();
    return {isS,isE,inRange,isPast,isToday};
  };

  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  const fmtShort=d=>d?d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}):null;
  const fmtLong=d=>d?d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):null;

  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden"}}>
      {/* Summary bar */}
      <div style={{display:"flex",alignItems:"center",padding:"10px 14px",background:C.cream,borderBottom:"1px solid "+C.parch,gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:C.mist,fontFamily:"'DM Mono',monospace",letterSpacing:1,flexShrink:0}}>📅</span>
        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:dateStart?600:400,color:dateStart?C.rust:C.mist}}>
            {dateStart?fmtShort(start):("Départ")}
          </span>
          <span style={{color:C.parch,fontSize:14}}>→</span>
          <span style={{fontSize:13,fontWeight:dateEnd?600:400,color:dateEnd?C.forest:dateStart?C.gold:C.mist}}>
            {dateEnd?fmtShort(end):dateStart?("Cliquez retour"):("Retour")}
          </span>
          {dateStart&&dateEnd&&(
            <span style={{marginLeft:4,fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:C.gold}}>
              🌙 {nuits} {"nuits"}
            </span>
          )}
        </div>
        {/* Reset button */}
        {(dateStart||dateEnd)&&(
          <button onClick={reset} title={"Réinitialiser les dates"}
            style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid "+C.parch,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.mist,flexShrink:0,lineHeight:1}}>
            ↺
          </button>
        )}
      </div>

      {/* Calendar */}
      <div style={{padding:"12px 14px"}}>
        {/* Month navigation */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={()=>setCurMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))}
            style={{background:"none",border:"1px solid "+C.parch,borderRadius:4,cursor:"pointer",padding:"2px 8px",fontSize:14,color:C.gold,lineHeight:1}}>‹</button>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.ink,fontWeight:600}}>
            {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][curMonth.getMonth()]} {curMonth.getFullYear()}
          </span>
          <button onClick={()=>setCurMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))}
            style={{background:"none",border:"1px solid "+C.parch,borderRadius:4,cursor:"pointer",padding:"2px 8px",fontSize:14,color:C.gold,lineHeight:1}}>›</button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:3}}>
          {["Lu","Ma","Me","Je","Ve","Sa","Di"].map(d=><div key={d} style={{textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:8,color:C.mist,padding:"3px 0",letterSpacing:1}}>{d}</div>)}
        </div>

        {/* Days grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
          {cells.map((day,i)=>{
            if(!day) return <div key={i}/>;
            const {isS,isE,inRange,isPast,isToday}=getStatus(day);
            return(
              <button key={i}
                onClick={()=>handleDay(day)}
                onMouseEnter={()=>start&&!end&&!isPast&&setHovered(day)}
                onMouseLeave={()=>setHovered(null)}
                style={{
                  padding:"5px 0",textAlign:"center",border:"none",
                  borderRadius:isS?"50% 0 0 50%":isE?"0 50% 50% 0":"2px",
                  background:isS||isE?C.rust:inRange?"#fde8e4":"transparent",
                  color:isS||isE?"#fff":isPast?"#d0d0d0":isToday?C.gold:C.ink,
                  fontFamily:"'DM Sans',sans-serif",fontSize:12,
                  cursor:isPast?"default":"pointer",
                  fontWeight:isS||isE?700:isToday?600:400,
                  outline:isToday&&!isS&&!isE?"1.5px solid "+C.gold:"none",
                  outlineOffset:"1px",
                  transition:"background .1s",
                }}>
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual nights fallback when no dates */}
      {!dateStart&&(
        <div style={{padding:"10px 14px",borderTop:"1px solid "+C.parch,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,color:C.mist,textTransform:"uppercase"}}>{"Ou combien de nuits si dates inconnues ?"}</span>
          <button onClick={()=>onNuits(Math.max(1,nuits-1))} style={{width:28,height:28,border:"1.5px solid "+C.parch,borderRadius:"50%",background:"#fff",fontSize:16,cursor:"pointer",lineHeight:1}}>−</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.gold,minWidth:32,textAlign:"center"}}>{nuits}</span>
          <button onClick={()=>onNuits(Math.min(90,nuits+1))} style={{width:28,height:28,border:"1.5px solid "+C.parch,borderRadius:"50%",background:"#fff",fontSize:16,cursor:"pointer",lineHeight:1}}>+</button>
          <span style={{fontSize:12,color:C.mist}}>{"nuits"}</span>
        </div>
      )}
    </div>
  );
}

// ─── File Upload ────────────────────────────────────────────
function FileUpload({file,onFile,onClear}){
  const ref=useRef();const [drag,setDrag]=useState(false);
  const process=f=>{
    if(!f) return;
    const ok=['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain'];
    if(!ok.includes(f.type)){alert("Format non supporté. JPG, PNG, PDF ou TXT.");return;}
    if(f.size>15*1024*1024){alert("Fichier trop grand (max 15 Mo).");return;}
    if(f.type.startsWith('image/')){
      const img=new Image();const url=URL.createObjectURL(f);
      img.onload=()=>{
        const canvas=document.createElement('canvas');const MAX=1200;
        let w=img.width,h=img.height;
        if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
        canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
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
      <div style={{fontSize:13,color:C.mist,marginBottom:12}}>Photo d'un carnet, d'un article, d'une liste… Sofia lit tout et crée ton voyage.</div>
      {!file?(
        <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files[0]);}}
          style={{border:`2px dashed ${drag?C.gold:C.parch}`,borderRadius:8,padding:"24px 20px",textAlign:"center",cursor:"pointer",background:drag?"#FDF8ED":C.cream}}>
          <div style={{fontSize:32,marginBottom:6}}>📸</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:4}}>Glisse ou clique pour importer</div>
          <div style={{fontSize:12,color:C.mist}}>JPG, PNG, PDF, TXT — max 15 Mo</div>
          <input ref={ref} type="file" accept="image/*,.pdf,.txt" style={{display:"none"}} onChange={e=>process(e.target.files[0])}/>
        </div>
      ):(
        <div style={{border:"1.5px solid "+C.gold,borderRadius:8,padding:"14px 16px",background:"#FDF8ED",display:"flex",gap:12,alignItems:"center"}}>
          {file.preview?<img src={file.preview} alt="preview" style={{width:56,height:56,objectFit:"cover",borderRadius:4,flexShrink:0}}/>
            :<div style={{width:56,height:56,background:C.parch,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📄</div>}
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

// ─── Main Component ─────────────────────────────────────────
export default function SofiaPlanner(){
  const [phase,setPhase]=useState("form");
  const [plan,setPlan]=useState(null);
  const [errors,setErrors]=useState({});
  const [msgs,setMsgs]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [tab,setTab]=useState("days");
  const [overloaded,setOverloaded]=useState(false);
  const [uploadedFile,setUploadedFile]=useState(null);
  const tr=(typeof T !== 'undefined' && T[lang]) ? T[lang] : T.FR;
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const [form,setForm]=useState({
    destination:"",depart:"",dateStart:"",dateEnd:"",nuits:7,
    voyageurs:"",voyageurs_autre:"",budget:"",budget_global:"",
    styles:[],style_autre:"",hebergement:"",hebergement_autre:"",
    transport:"",transport_autre:"",transport_to:[],transport_to_autre:"",
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
    if(!uploadedFile&&!form.destination.trim()) e.destination="Destination obligatoire";
    if(!uploadedFile&&!form.budget) e.budget="Budget obligatoire";
    if(!uploadedFile&&!form.hebergement) e.hebergement="Hébergement obligatoire";
    if(form.dateStart&&form.dateEnd&&new Date(form.dateEnd)<=new Date(form.dateStart)) e.dateEnd="La date de retour doit être après le départ";
    setErrors(e);
    if(Object.keys(e).length>0) document.getElementById("field-"+Object.keys(e)[0])?.scrollIntoView({behavior:"smooth",block:"center"});
    return Object.keys(e).length===0;
  };

  const generate=async()=>{
    if(!validate()) return;
    setPhase("loading");setOverloaded(false);
    try{
      const body={formData:form.destination||form.budget?form:null};
      if(uploadedFile){body.fileData=uploadedFile.data;body.fileType=uploadedFile.type;}
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(res.status===529||data.error==="OVERLOADED"){setPhase("form");setOverloaded(true);return;}
      if(!res.ok) throw new Error(data.error||"Erreur");
      if(data.type==="plan"){
        const p={...data.data,destination:form.destination||data.data.destination||"Voyage"};
        setPlan(p);setMsgs([{role:"assistant",content:data.data.intro||"Votre plan est prêt !"}]);setPhase("result");
      }else{setPhase("form");setOverloaded(true);}
    }catch(err){setPhase("form");setOverloaded(true);}
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad) return;
    const userMsg={role:"user",content:chatIn.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setChatIn("");setChatLoad(true);
    try{
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),currentPlan:plan})});
      const data=await res.json();
      if(data.type==="plan"&&data.data?.days){
        setPlan({...data.data,destination:plan?.destination||form.destination||"Voyage"});
        setMsgs([...newMsgs,{role:"assistant",content:"✅ Plan mis à jour ! Consulte les onglets pour voir les changements. — Sofia 🌍"}]);
      }else if(data.type==="chat"&&data.reply){
        setMsgs([...newMsgs,{role:"assistant",content:data.reply}]);
      }else{
        setMsgs([...newMsgs,{role:"assistant",content:"Désolée, les serveurs sont surchargés en ce moment. Réessaie dans 1 minute ! — Sofia 🌍"}]);
      }
    }catch{setMsgs([...newMsgs,{role:"assistant",content:"Désolée, erreur de connexion. Réessaie ! — Sofia 🌍"}]);}
    setChatLoad(false);
  };

  const destDisplay=plan?.destination||form.destination||"";

  // Transport placeholder dynamique
  const transportPlaceholder=(()=>{
    const dest=form.destination||"la destination";
    const dep=form.depart||"Luxembourg";
    if((form.transport_to||[]).includes("⛴️ Ferry")) return `ex: ferry depuis ${dep.includes("uxembourg")||dep.includes("aris")?"Nice ou Toulon":dep} vers ${dest}`;
    if((form.transport_to||[]).includes("✈️ Avion")) return `ex: vol depuis ${dep}, escale éventuelle`;
    if((form.transport_to||[]).includes("🚄 Train")) return `ex: départ gare de ${dep}, correspondances`;
    if((form.transport_to||[]).includes("🚗 Ma voiture")) return `ex: itinéraire autoroute depuis ${dep}, durée estimée`;
    return "Précise les détails de ton trajet…";
  })();

  const openPDF=()=>{
    const win=window.open("","_blank");
    const dest=destDisplay;
    const rows=(arr,fn)=>(arr||[]).map(fn).join("");
    const heroQ=enc(dest+" city tourism");
    const dayH=rows(plan?.days,d=>`<div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #ddd;border-radius:8px;overflow:hidden"><img src="${photoCache[(d.unsplash_query||d.location||dest||"travel").substring(0,60)]||`https://source.unsplash.com/800x200/?${enc(d.unsplash_query||d.location||dest)}`}" style="width:100%;height:160px;object-fit:cover;display:block" onerror="this.style.display='none'"/><div style="background:#1C1A14;color:#B8972E;padding:12px 16px;font-family:Georgia,serif;font-size:15px;font-weight:700">Jour ${d.num} — ${d.title||""}${d.location?` <span style='font-size:11px;color:#aaa'>📍 ${d.location}</span>`:""}</div><div style="padding:14px;font-size:12px;line-height:1.7;color:#333">${d.morning?`<p style="margin-bottom:6px"><b>🌅 Matin :</b> ${d.morning}</p>`:""}${d.afternoon?`<p style="margin-bottom:6px"><b>☀️ Après-midi :</b> ${d.afternoon}</p>`:""}${d.evening?`<p style="margin-bottom:6px"><b>🌙 Soir :</b> ${d.evening}</p>`:""}${d.tip?`<p style="color:#8A9E93;font-style:italic;margin-top:8px">💡 ${d.tip}</p>`:""}</div></div>`);
    const siteH=rows(plan?.remarkable_sites,s=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${s.name}</b>${s.label?` [${s.label}]`:""}<br><small style="color:#B8972E">📍 ${s.location||""}</small><br>${s.description||""}</div>`);
    const hotelH=rows(plan?.accommodations,h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — ${h.type||""} — 📍 ${h.location||""} — 💰 ${h.price||""}<br><i>${h.why||""}</i>${h.website?`<br><a href="${h.website}">${h.website}</a>`:""}</div>`);
    const restoH=rows(plan?.restaurants,r=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${r.name}</b> — ${r.cuisine||""} — 💰 ${r.price||""}<br>📍 ${r.address||""}<br>⭐ ${r.specialty||""}</div>`);
    const outingH=rows(plan?.outings,o=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${o.type==="randonnée"?"🥾":"🎯"} ${o.name}</b> — ${o.subtype||""} — ⏱️${o.duration||""}${o.distance?" — 📏"+o.distance:""}<br>🚩 ${o.start_point||""}<br>${o.highlights||""}</div>`);
    const agendaH=rows(plan?.agenda,ev=>`<div style="margin-bottom:8px;padding:8px;border-left:3px solid ${ev.type==="positive"?"#2e7d32":ev.type==="negative"?"#c62828":"#1565c0"};background:${ev.type==="positive"?"#e8f5e9":ev.type==="negative"?"#fce4ec":"#e3f2fd"}"><b>${ev.type==="positive"?"🎉":ev.type==="negative"?"⚠️":"ℹ️"} ${ev.name}</b>${ev.date?" — "+ev.date:""}<br>${ev.description||""}</div>`);
    const tipsH=(plan?.tips||[]).map((t,i)=>`<p style="margin-bottom:6px"><b>${i+1}.</b> ${t}</p>`).join("");
    const b=plan?.budget||{};
    const budH=`<table style="width:100%;font-size:12px">${[["🏨 Hébergement",b.accommodation],["🍽️ Repas",b.meals],["🎯 Activités",b.activities],["🚗 Transport",b.transport]].map(([l,v])=>v?`<tr><td>${l}</td><td style="text-align:right;font-weight:600">${v}</td></tr>`:"").join("")}<tr style="font-weight:700;color:#C1440E"><td>TOTAL ESTIMÉ</td><td style="text-align:right">${b.total||"—"}</td></tr></table>`;
    const sec=(t,h)=>h?`<div style="page-break-before:always;padding:20px 0"><h2 style="font-family:Georgia,serif;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">${t}</h2>${h}</div>`:"";
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sofia — ${dest}</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#333}img{max-width:100%}@media print{body{margin:0;padding:20px}.np{display:none}}</style></head><body>
<div style="position:relative;background:#1C1A14;border-radius:8px;margin-bottom:24px;overflow:hidden;min-height:140px">
  <img src="${photoCache[dest.substring(0,60)]||photoCache[(dest+" ville paysage panoramique").substring(0,60)]||`https://source.unsplash.com/1200x300/?${heroQ}`}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.4" onerror="this.style.display='none'"/>
  <div style="position:relative;z-index:1;padding:32px;text-align:center;color:#fff">
    <div style="font-size:10px;letter-spacing:4px;color:#B8972E">✦ ON THE ROAD AGAIN ✦</div>
    <h1 style="font-family:Georgia,serif;font-size:32px;margin:8px 0">${dest}</h1>
    <div style="font-size:11px;color:#aaa">${form.nuits} NUITS${form.dateStart?" · "+form.dateStart+" → "+form.dateEnd:""}</div>
  </div>
</div>
${plan?.intro?`<div style="background:#f0f7f4;border-left:4px solid #2C4A3E;padding:14px;margin-bottom:20px;font-style:italic;color:#2C4A3E">${plan.intro}</div>`:""}
${plan?.tourism_office?.website?`<div style="border:1.5px solid #B8972E;border-radius:6px;padding:12px 16px;margin-bottom:16px"><b>🏛️ ${plan.tourism_office.name||"Office de Tourisme"}</b>${plan.tourism_office.address?" — 📍 "+plan.tourism_office.address:""}<br><a href="${plan.tourism_office.website}" style="color:#B8972E">${plan.tourism_office.website}</a></div>`:""}
<div class="np" style="text-align:center;margin-bottom:20px"><a href="${buildMapUrl(plan,dest)}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4285F4;color:#fff;border-radius:4px;text-decoration:none">🗺️ Voir l'itinéraire sur Google Maps</a></div>
<h2 style="font-family:Georgia,serif;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">🗺️ Itinéraire</h2>${dayH}
${plan?.agenda?.length?sec("📅 À noter pour ton séjour",agendaH):""}
${sec("⭐ Incontournables",siteH)}${sec("🏨 Hébergements",hotelH)}${sec("🍽️ Restaurants",restoH)}${sec("🎯 Sorties & Activités",outingH)}
${plan?.tips?.length?sec("💡 Conseils pratiques",tipsH):""}${plan?.budget?sec("💰 Budget estimé",budH):""}
<div style="text-align:center;margin-top:32px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:16px">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString("fr-FR")}${TP_MARKER?" · Liens partenaires":""}</div>
<script>
window.onload=function(){
  var imgs=document.querySelectorAll('img');
  var loaded=0;
  if(!imgs.length){window.print();return;}
  imgs.forEach(function(img){
    if(img.complete){loaded++;if(loaded===imgs.length)window.print();}
    else{img.onload=img.onerror=function(){loaded++;if(loaded===imgs.length)window.print();};}
  });
  setTimeout(function(){window.print();},4000);
};
</script>
</body></html>`);
    win.document.close();
  };

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
        .date-box{display:flex;align-items:stretch;border:1.5px solid #EDE0C4;border-radius:6px;background:#FAF6EE;overflow:hidden}
        .date-box input[type=date]{flex:1;padding:4px 14px 10px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1C1A14;outline:none;cursor:pointer;min-width:0}
        .date-box input[type=date]:focus{background:#FDF8ED}
        .date-sep{width:1px;background:#EDE0C4;flex-shrink:0}
        @media(max-width:768px){
          .result-layout{flex-direction:column!important;height:auto!important}
          .chat-panel{width:100%!important;height:360px!important;border-left:none!important;border-top:1px solid #EDE0C4!important}
          .fg2{grid-template-columns:1fr!important}
          .fg4{grid-template-columns:1fr 1fr!important}
        }
        @media print{.np{display:none!important}body{background:#fff!important}}
      `}</style>

      {/* HEADER */}
      <div className="np" style={{background:C.ink,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:C.gold}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#555"}}>On The Road Again</div>
        </div>

        {phase==="result"&&(
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={openPDF} style={{padding:"8px 12px",background:C.gold,color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <a href={buildMapUrl(plan,destDisplay)} target="_blank" rel="noopener noreferrer" style={{padding:"8px 12px",background:"transparent",color:"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",display:"inline-block",textDecoration:"none"}}>🗺️ Carte ↗</a>
            <button onClick={()=>{setPhase("form");setPlan(null);setMsgs([]);}} style={{padding:"8px 12px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ══ FORM ══ */}
      {phase==="form"&&(
        <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px 80px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:44,marginBottom:10}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,5vw,44px)",fontWeight:900,lineHeight:1.1}}>Planifie tes <em style={{color:C.rust}}>vacances parfaites</em></h1>
            <p style={{color:C.mist,fontSize:14,marginTop:10,maxWidth:480,margin:"10px auto 0"}}>Sofia crée ton plan complet avec itinéraire, incontournables, hébergements, restaurants, sorties et valise</p>
          </div>

          {overloaded&&(
            <div style={{background:"#fff3cd",border:"1.5px solid "+C.gold,borderRadius:6,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20,flexShrink:0}}>⏳</span>
              <div style={{flex:1}}><div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,marginBottom:2}}>Génération échouée</div><div style={{fontSize:13,color:"#666"}}>Les serveurs sont surchargés. Attends 1-2 minutes et réessaie.</div></div>
              <button onClick={()=>setOverloaded(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#aaa"}}>×</button>
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
                  <div style={{...inpBox,borderColor:errors.destination?"#C1440E":C.parch}}><input style={inp} value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Corse, Bruxelles, Kyoto…"/></div>
                  {errors.destination&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.destination}</div>}
                </div>
                <div><span style={lbl}>Ville de départ</span><div style={inpBox}><input style={inp} value={form.depart} onChange={e=>setF("depart",e.target.value)} placeholder="Luxembourg, Paris, Bruxelles…"/></div></div>
              </div>
              {/* Date Range Picker */}
              <div>
                <span style={lbl}>📅 {"Dates du séjour"}</span>
                <DateRangePicker
                  dateStart={form.dateStart} dateEnd={form.dateEnd} nuits={form.nuits}
                  onDateStart={v=>handleDate("dateStart",v)}
                  onDateEnd={v=>handleDate("dateEnd",v)}
                  onNuits={v=>setF("nuits",v)}
                />
                {errors.dateEnd&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.dateEnd}</div>}
              </div>
            </div>

            {/* Transport aller - multi-select */}
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
                <div id="field-voyageurs">
                  <span style={lbl}>Voyageurs</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOYAGEURS.map(v=><button key={v} onClick={()=>setF("voyageurs",v)} style={selBtn(form.voyageurs===v,"#3D5A3E")}>{v}</button>)}
                    {form.voyageurs==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.voyageurs_autre} onChange={e=>setF("voyageurs_autre",e.target.value)} placeholder="Ex: 3 adultes + 2 enfants…"/></div>
                    :<button onClick={()=>setF("voyageurs","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
                <div id="field-budget">
                  <span style={lbl}>Budget {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=><button key={b} onClick={()=>setF("budget",b)} style={{...selBtn(form.budget===b,"#8B2500"),borderColor:form.budget===b?"#8B2500":errors.budget?"#C1440E":C.parch}}>{b}</button>)}
                    {form.budget==="Budget global"?<div style={inpBox}><input autoFocus style={inp} value={form.budget_global} onChange={e=>setF("budget_global",e.target.value)} placeholder="Ex: 3000€ pour 2 pers., 7 nuits…"/></div>
                    :<button onClick={()=>setF("budget","Budget global")} style={{...selBtn(false),borderColor:errors.budget?"#C1440E":C.parch}}>💵 Budget global à préciser</button>}
                  </div>
                  {errors.budget&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.budget}</div>}
                </div>
              </div>
            </div>

            {/* Style & hébergement */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("🎯 Style & hébergement")}
              <div style={{marginBottom:14}}>
                <span style={lbl}>Style de voyage (plusieurs choix)</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES_LIST.map(s=><button key={s} onClick={()=>toggleArr("styles",s)} style={pillBtn(form.styles.includes(s),"#4A3560")}>{s}</button>)}
                  {form.styles.includes("Autre")?<div style={{...inpBox,flex:1,minWidth:160}}><input autoFocus style={{...inp,padding:"7px 12px"}} value={form.style_autre} onChange={e=>setF("style_autre",e.target.value)} placeholder="Précise…"/></div>
                  :<button onClick={()=>toggleArr("styles","Autre")} style={pillBtn(false)}>✏️ Autre</button>}
                </div>
              </div>
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-hebergement">
                  <span style={lbl}>Hébergement {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=><button key={h} onClick={()=>setF("hebergement",h)} style={{...selBtn(form.hebergement===h,C.forest),borderColor:form.hebergement===h?C.forest:errors.hebergement?"#C1440E":C.parch}}>{h}</button>)}
                    {form.hebergement==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.hebergement_autre} onChange={e=>setF("hebergement_autre",e.target.value)} placeholder="Précise…"/></div>
                    :<button onClick={()=>setF("hebergement","Autre")} style={{...selBtn(false),borderColor:errors.hebergement?"#C1440E":C.parch}}>✏️ Autre</button>}
                  </div>
                  {errors.hebergement&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.hebergement}</div>}
                </div>
                <div>
                  <span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS_LOCAL.map(t=><button key={t} onClick={()=>setF("transport",t)} style={selBtn(form.transport===t,C.navy)}>{t}</button>)}
                    {form.transport==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.transport_autre} onChange={e=>setF("transport_autre",e.target.value)} placeholder="Précise…"/></div>
                    :<button onClick={()=>setF("transport","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
              </div>
            </div>

            {/* Envies */}
            <div style={{marginBottom:24}}>
              {secT("✨ Tes envies & besoins")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><span style={lbl}>Incontournables / Rêves</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Calanques, Sentier du Douanier, plage Palombaggia…"/></div></div>
                <div><span style={lbl}>À éviter</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Pas trop touristique, éviter la haute saison…"/></div></div>
                <div><span style={lbl}>Besoins spéciaux</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie, mobilité réduite, bébé…"/></div></div>
                <div><span style={lbl}>Autres informations</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Passionné de plongée, fan de gastronomie locale…"/></div></div>
              </div>
            </div>

            <button onClick={generate} style={{width:"100%",padding:"16px",background:C.rust,color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:19,cursor:"pointer"}}>
              {uploadedFile?"Créer mon plan de vacances avec Sofia →"File:"Créer mon plan de vacances avec Sofia →"}
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:1}}>
              ⓘ {uploadedFile?"Destination, Budget et Hébergement sont nécessaires"File:"Destination, Budget et Hébergement sont nécessaires"}
            </div>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading"&&(
        <div style={{textAlign:"center",padding:"100px 24px"}}>
          <div style={{fontSize:52,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",marginTop:18}}>
            {uploadedFile?"Sofia prépare ton aventure…"File:"Sofia prépare ton aventure…"}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","📅 Agenda","⭐ Incontournables","🏨 Hébergements","🍽️ Restos","🎯 Sorties","🧳 Valise"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result"&&plan&&(
        <div className="result-layout" style={{display:"flex",height:"calc(100vh - 60px)"}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:C.ink,flexShrink:0}}>
              <HeroPhoto query={destDisplay ? `${destDisplay} ville paysage panoramique` : "travel landscape"}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,color:C.gold,marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,40px)",fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.6)"}}>{destDisplay}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.nuits} NUITS{form.voyageurs?` · ${(form.voyageurs==="Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()}`:""}
                </div>
                {form.dateStart&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>



            {plan.intro&&(
              <div style={{padding:"14px 18px",background:"#f0f7f4",borderBottom:"1px solid "+C.parch,display:"flex",gap:10,flexShrink:0}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div style={{fontSize:13,lineHeight:1.65,color:C.forest,fontStyle:"italic"}}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+C.parch,background:"#fff",flexShrink:0}}>
              {TABS.map(t=>(
                <button key={t.k} onClick={()=>setTab(t.k)}
                  style={{padding:"10px 10px",border:"none",borderBottom:`2px solid ${tab===t.k?C.rust:"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:tab===t.k?C.rust:"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.l}{t.n>0&&<span style={{background:C.parch,color:"#888",borderRadius:10,padding:"1px 5px",fontSize:8}}>{t.n}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>
                {tab==="days"&&(plan.days||[]).map((d,i)=><DayCard key={i} d={d} form={{...form,destination:destDisplay}} plan={plan} setTab={setTab}/>)}
                {tab==="agenda"&&<AgendaSection agenda={plan.agenda}/>}
                {tab==="sites"&&(<>
                  {plan.tourism_office?.website&&(
                    <div style={{background:"#fff",border:"1.5px solid "+C.gold,borderRadius:8,padding:"16px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{fontSize:28,flexShrink:0}}>🏛️</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:4}}>Office de Tourisme officiel</div>
                        <div style={{fontSize:13,color:"#4a4640",marginBottom:6}}>{plan.tourism_office.name}</div>
                        {plan.tourism_office.address&&<div style={{fontSize:12,color:C.mist,marginBottom:4}}>📍 {plan.tourism_office.address}</div>}
                        {plan.tourism_office.phone&&<div style={{fontSize:12,color:C.mist,marginBottom:6}}>📞 {plan.tourism_office.phone}</div>}
                        <a href={plan.tourism_office.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"7px 14px",background:C.gold,color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1}}>🌐 Site officiel</a>
                      </div>
                    </div>
                  )}
                  <LinkBar type="remarkable_sites" dest={destDisplay} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre}/>
                  <div style={{height:12}}/>
                  {(plan.remarkable_sites||[]).map((s,i)=><ItemCard key={i} item={s} type="remarkable_sites" i={i} form={{...form,destination:destDisplay}}/>)}
                </>)}
                {tab==="hotels"&&(plan.accommodations||[]).map((h,i)=><ItemCard key={i} item={h} type="accommodations" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="restos"&&(plan.restaurants||[]).map((r,i)=><ItemCard key={i} item={r} type="restaurants" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="outings"&&(
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                      {["Tout","🥾 Randonnées","🎯 Activités"].map(f=>(
                        <button key={f} style={{padding:"6px 14px",border:"1.5px solid "+C.parch,borderRadius:100,background:"#fff",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer",color:C.ink}}>{f}</button>
                      ))}
                    </div>
                    {(plan.outings||[]).map((o,i)=><OutingCard key={i} item={o} i={i} form={{...form,destination:destDisplay}}/>)}
                  </>
                )}
                {tab==="tips"&&(
                  <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                    {(plan.tips||[]).map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(plan.tips||[]).length-1?"1px solid "+C.parch:"none"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:C.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:13,lineHeight:1.7,color:"#4a4640"}}>{t}</div>
                      </div>
                    ))}
                  </div>
                )}
                {tab==="budget"&&plan.budget&&(
                  <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                    {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport",plan.budget.transport]].map(([l,v])=>v&&(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+C.parch}}>
                        <span style={{fontSize:14,color:"#4a4640"}}>{l}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0"}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:C.rust}}>{plan.budget.total}</span>
                    </div>
                    <NoteField id="budget-note"/>
                  </div>
                )}
                {tab==="packing"&&<PackingSection packing={plan.packing_essentials}/>}
              </div>
            </div>

            <div style={{textAlign:"center",padding:10,borderTop:"1px solid "+C.parch,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#aaa",flexShrink:0}}>
              Sofia Planner · On The Road Again{TP_MARKER?" · Liens partenaires":""}
            </div>
          </div>

          {/* CHAT */}
          <div className="chat-panel" style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid "+C.parch,flexShrink:0}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid "+C.parch,background:C.cream,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold}}>Chat avec Sofia</div>
                  <div style={{fontSize:10,color:"#aaa",marginTop:1}}>Demande un changement → plan mis à jour</div>
                </div>
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
                {chatLoad&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                    <div style={{padding:"9px 14px",background:C.cream,border:"1px solid "+C.parch,borderRadius:"14px 14px 14px 3px"}}>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:C.gold,margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>
            <div style={{borderTop:"1px solid "+C.parch,padding:"10px 12px",flexShrink:0}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {[
                  "Ajoute une journée",
                  plan?.outings?.length?"Plus d'activités locales":"Propose des activités",
                  plan?.accommodations?.[0]?.name?`Alternative à ${plan.accommodations[0].name}`:"Hébergement moins cher",
                  "Que faire s'il pleut ?",
                  plan?.restaurants?.[0]?.name?`Autre option que ${plan.restaurants[0].name}`:"Conseil restaurant ce soir",
                  "Optimise le budget"
                ].map(s=>(
                  <button key={s} onClick={()=>setChatIn(s)} style={{padding:"4px 8px",background:C.cream,border:"1px solid "+C.parch,borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",color:"#888"}}>{s}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder={"Chat avec Sofia"PH} disabled={chatLoad}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid "+C.parch,borderRadius:20,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.ink,outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad}
                  style={{padding:"9px 14px",background:chatIn.trim()&&!chatLoad?C.rust:"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatIn.trim()&&!chatLoad?"pointer":"not-allowed",fontSize:15,flexShrink:0}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
