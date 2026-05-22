export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
  maxDuration: 60,
};

function extractJSON(text) {
  const attempts = [
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,'').trim(),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { const j=JSON.parse(a); if(j&&typeof j==='object') return j; } catch {}
    try {
      let f=a;
      if(f.match(/"[^"]*$/)) f+='"';
      const o=(f.match(/\{/g)||[]).length-(f.match(/\}/g)||[]).length;
      const ar=(f.match(/\[/g)||[]).length-(f.match(/\]/g)||[]).length;
      for(let i=0;i<ar;i++) f+=']';
      for(let i=0;i<o;i++) f+='}';
      const j=JSON.parse(f); if(j&&typeof j==='object') return j;
    } catch {}
  }
  return null;
}

async function callAPI(model, system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31"
    },
    body: JSON.stringify({
      model,
      max_tokens: 5500,
      system: [{ type:"text", text:system, cache_control:{ type:"ephemeral" } }],
      messages
    })
  });
  return res;
}

async function callClaude(system, messages) {
  // Try primary model first, then fallback
  const models = [
    "claude-haiku-4-5-20251001",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
  ];

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
        const res = await callAPI(model, system, messages);
        const data = await res.json();

        if (res.status === 529 || data.error?.type === "overloaded_error") {
          // Try next attempt or next model
          if (attempt === 0) continue; // retry same model once
          break; // move to next model
        }
        if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
        return data.content[0].text;
      } catch(e) {
        if (attempt === 0) continue;
        if (mi < models.length - 1) break; // try next model
        throw new Error("OVERLOADED");
      }
    }
  }
  throw new Error("OVERLOADED");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData, currentPlan, fileData, fileType } = req.body;

  const FMT = `{"intro":"Message chaleureux","days":[{"num":1,"title":"Titre","location":"Lieu court Maps-compatible","morning":"Matin","afternoon":"Après-midi","evening":"Soirée + restaurant","tip":"Astuce","day_num":1}],"remarkable_sites":[{"name":"Nom","label":"Label","location":"Adresse","description":"Desc","website":"URL","coords":[lat,lon],"unsplash_query":"mots précis pour photo"}],"accommodations":[{"name":"Nom","type":"Type","location":"Adresse","price":"Prix/nuit","why":"Raison","website":"Site","coords":[lat,lon],"unsplash_query":"mots photo"}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat","price":"€","tip":"Conseil","address":"Adresse","website":"Site","coords":[lat,lon]}],"outings":[{"name":"Nom","type":"randonnée|activité","subtype":"desc","day_num":1,"distance":"Xkm","duration":"Xh","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu on voit","start_point":"Départ","transport_from_center":"Accès","price":"Prix","address":"Adresse","website":"Site","coords":[lat,lon],"unsplash_query":"mots photo"}],"agenda":[{"type":"positive","name":"Événement","date":"Date","description":"Détails"}],"tourism_office":{"name":"Nom","website":"URL officielle","address":"Adresse","phone":"Tel"},"tips":["conseil1","conseil2","conseil3","conseil4","conseil5"],"budget":{"accommodation":"X€/nuit","meals":"X€/j","activities":"X€/j","transport":"X€/j","total":"Total"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'identité"]},{"category":"Santé","items":["Crème solaire","Pharmacie"]},{"category":"Vêtements","items":["Adaptés météo","Chaussures"]},{"category":"Technologie","items":["Adaptateur","Chargeurs"]},{"category":"Divers","items":["Argent local","Carte bancaire"]}]}`;

  const sysForm = `Tu es Sofia, conseillère voyage pour "On The Road Again". Réponds TOUJOURS en français.
CRITICAL: JSON brut uniquement. PAS de texte. PAS de backticks. Commence par { termine par }.
Le champ "location" des jours: NOM COURT uniquement (1-3 mots, Google Maps compatible). Ex: "Cap Corse", "Piana", "Bruxelles Centre". JAMAIS de descriptions longues.
Format: ${FMT}
Règles: noms réels, coords GPS, agenda aux dates du voyage, hébergement précis EN PREMIER, incontournables inclus.${formData?.pmr?'\nCONTRAINTE PMR: tout doit être accessible fauteuil roulant. Hébergements PMR, restaurants plain-pied, activités adaptées, transports accessibles.':''}`;

  const sysChat = `Tu es Sofia, conseillère voyage pour "On The Road Again". Réponds TOUJOURS en français.
${currentPlan?`Plan actuel (${currentPlan.destination||''}): ${JSON.stringify({destination:currentPlan.destination,days:currentPlan.days,accommodations:(currentPlan.accommodations||[]).slice(0,3),restaurants:(currentPlan.restaurants||[]).slice(0,3),outings:(currentPlan.outings||[]).slice(0,3),budget:currentPlan.budget})}
Modification → JSON COMPLET mis à jour, commence par {. Question → français naturel.`:'Réponds en français naturel.'}
Ne jamais afficher de JSON brut. — Sofia 🌍`;

  try {
    const isForm = !!(formData || fileData);
    const system = isForm ? sysForm : sysChat;
    let allMessages;

    if (isForm) {
      const content = [];
      if (fileData && fileType) {
        if (fileType.startsWith('image/')) content.push({type:"image",source:{type:"base64",media_type:fileType,data:fileData}});
        else if (fileType==='application/pdf') content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:fileData}});
      }
      const hasForm = formData && (formData.destination || formData.budget);
      const endDate = formData?.dateStart
        ? new Date(new Date(formData.dateStart).getTime()+formData.nuits*86400000).toISOString().split("T")[0]
        : "Flexibles";
      const transport = formData?.transport==='sofia'
        ? 'Sofia recommande le meilleur selon la destination et le style'
        : formData?.transport==='Autre' ? formData.transport_autre : formData?.transport || 'Non précisé';

      const prompt = (!hasForm && fileData)
        ? `Analyse cette image/document. Extrais toutes les infos de voyage. Complète avec tes recommandations. JSON brut seulement, commence par {`
        : `Plan de vacances. JSON brut seulement, commence par {
Destination: ${formData.destination}
Départ depuis: ${formData.depart||"Non précisé"}
Transport aller: ${Array.isArray(formData.transport_to)?formData.transport_to.join("+"):formData.transport_to||"Non précisé"}${formData.transport_to_autre?" ("+formData.transport_to_autre+")":""}
Dates: ${formData.dateStart||"Flexibles"} → ${formData.dateEnd||endDate} (${formData.nuits} nuits)
Voyageurs: ${formData.voyageurs==="Autre"?formData.voyageurs_autre:formData.voyageurs||"Non précisé"}
Budget: ${formData.budget==="Budget global"?formData.budget_global:formData.budget||"Non précisé"}
Style: ${(formData.styles||[]).join(", ")||"Varié"}${formData.style_autre?", "+formData.style_autre:""}
Hébergement: ${formData.hebergement==="sofia"?"Sofia recommande le meilleur":formData.hebergement==="Autre"?formData.hebergement_autre:formData.hebergement||"Non précisé"}
Transport sur place: ${transport}
Besoins: ${formData.special||"Aucun"}
Incontournables: ${formData.musts||"Propose les incontournables"}
À éviter: ${formData.avoid||"Rien"}
Notes: ${formData.notes||"Aucune"}${fileData?" + document joint":""}`;

      content.push({type:"text",text:prompt});
      allMessages = [{role:"user",content}];
    } else {
      allMessages = messages;
    }

    const text = await callClaude(system, allMessages);
    const json = extractJSON(text);

    if (json && (json.days||json.intro||json.accommodations)) {
      res.status(200).json({type:"plan",data:json});
    } else if (isForm) {
      res.status(200).json({type:"error"});
    } else {
      res.status(200).json({type:"chat",reply:text});
    }
  } catch(e) {
    if (e.message==="OVERLOADED") res.status(529).json({error:"OVERLOADED"});
    else res.status(500).json({error:e.message});
  }
}
