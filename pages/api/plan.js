export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

function extractJSON(text) {
  const attempts = [
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,'').trim(),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { const j = JSON.parse(a); if (j && typeof j === 'object') return j; } catch {}
    try {
      let f = a;
      if (f.match(/"[^"]*$/)) f += '"';
      const o=(f.match(/\{/g)||[]).length-(f.match(/\}/g)||[]).length;
      const ar=(f.match(/\[/g)||[]).length-(f.match(/\]/g)||[]).length;
      for(let i=0;i<ar;i++) f+=']';
      for(let i=0;i<o;i++) f+='}';
      const j = JSON.parse(f);
      if (j && typeof j === 'object') return j;
    } catch {}
  }
  return null;
}

function planSummary(plan) {
  if (!plan) return '';
  // Send a clean summary - not truncated JSON
  return JSON.stringify({
    destination: plan.destination,
    intro: plan.intro,
    days: plan.days,
    accommodations: (plan.accommodations||[]).map(h=>({name:h.name,type:h.type,location:h.location,price:h.price})),
    restaurants: (plan.restaurants||[]).map(r=>({name:r.name,cuisine:r.cuisine,address:r.address})),
    hikes: (plan.hikes||[]).map(h=>({name:h.name,distance:h.distance,difficulty:h.difficulty})),
    activities: (plan.activities||[]).map(a=>({name:a.name,duration:a.duration})),
    remarkable_sites: (plan.remarkable_sites||[]).map(s=>({name:s.name,location:s.location})),
    budget: plan.budget,
    tips: plan.tips,
  });
}

async function callClaude(system, messages, retries=2) {
  for (let i=0; i<=retries; i++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "prompt-caching-2024-07-31"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 7000,
          system: [{ type:"text", text:system, cache_control:{ type:"ephemeral" } }],
          messages
        })
      });
      const data = await res.json();
      if (res.status===529 || data.error?.type==="overloaded_error") {
        if (i<retries) { await new Promise(r=>setTimeout(r,3000*(i+1))); continue; }
        throw new Error("OVERLOADED");
      }
      if (!res.ok) throw new Error(data.error?.message||"Erreur API");
      return data.content[0].text;
    } catch(e) {
      if (i<retries && e.message!=="OVERLOADED") { await new Promise(r=>setTimeout(r,2000)); continue; }
      throw e;
    }
  }
}

export default async function handler(req, res) {
  if (req.method!=="POST") return res.status(405).end();
  const { messages, formData, currentPlan, fileData, fileType } = req.body;

  const FMT = `{"intro":"Message chaleureux","days":[{"num":1,"title":"Titre","location":"Nom du quartier ou lieu principal UNIQUEMENT (ex: Centre historique, Sablon, Montmartre)","morning":"Matin","afternoon":"Après-midi","evening":"Soirée + restaurant","tip":"Astuce"}],"remarkable_sites":[{"name":"Nom","label":"Label","location":"Adresse courte","description":"Desc","website":"URL officielle","coords":[lat,lon]}],"accommodations":[{"name":"Nom","type":"Type","location":"Adresse","price":"Prix/nuit","why":"Raison","website":"Site","coords":[lat,lon]}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat","price":"€","tip":"Conseil","address":"Adresse","website":"Site","coords":[lat,lon]}],"hikes":[{"name":"Nom","distance":"Xkm","duration":"Xh","difficulty":"Facile/Moyen/Difficile","highlights":"Vue","start_point":"Départ","transport_from_center":"Accès","coords_start":[lat,lon]}],"activities":[{"name":"Nom","duration":"Durée","price":"Prix","info":"Info","address":"Adresse","website":"Site","coords":[lat,lon]}],"agenda":[{"type":"positive","name":"Événement","date":"Date","description":"Détails"},{"type":"negative","name":"Perturbation","date":"Date","description":"Impact"},{"type":"info","name":"Férié","date":"Date","description":"Impact"}],"tourism_office":{"name":"Nom office tourisme","website":"URL OFFICIELLE de l'office de tourisme (ex: visitbrussels.be)","address":"Adresse","phone":"Téléphone si connu"},"tips":["conseil1","conseil2","conseil3","conseil4","conseil5"],"budget":{"accommodation":"X€/nuit","meals":"X€/j","activities":"X€/j","transport":"X€/j","total":"Total"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'identité","Assurance"]},{"category":"Santé","items":["Crème solaire","Pharmacie"]},{"category":"Vêtements","items":["Adaptés météo","Chaussures marche"]},{"category":"Technologie","items":["Adaptateur","Chargeurs"]},{"category":"Divers","items":["Argent local","Carte bancaire"]}]}`;

  const sysForm = `Tu es Sofia, conseillère de voyage pour "On The Road Again". Réponds TOUJOURS en français.
CRITICAL: Réponds UNIQUEMENT avec du JSON brut valide. PAS de texte. PAS de backticks. Commence par { et termine par }.
IMPORTANT pour le champ "location" des jours: mettre UNIQUEMENT le nom du quartier ou lieu principal, PAS une liste de plusieurs endroits. Exemple correct: "Sablon", "Centre historique", "Montmartre". Exemple INCORRECT: "Sablon, Cathédrale, quartier Art Nouveau".
Format JSON: ${FMT}
Règles: noms RÉELS, adresses précises, coords GPS, agenda avec événements aux dates, incontournables inclus, hébergement précis EN PREMIER, office de tourisme avec vraie URL officielle.`;

  const sysChat = `Tu es Sofia, conseillère de voyage pour "On The Road Again". Réponds TOUJOURS en français. Tu es chaleureuse et enthousiaste.
${currentPlan ? `Voici le plan de voyage actuel pour ${currentPlan.destination||'la destination'}:
${planSummary(currentPlan)}

Si l'utilisateur demande de MODIFIER le plan (ajouter/supprimer une journée, changer activité, modifier hébergement, etc.):
→ Réponds avec le JSON COMPLET mis à jour au même format, commence directement par {, sans aucun texte avant.

Si l'utilisateur pose une QUESTION ou fait une conversation normale:
→ Réponds en français naturel, sois utile et chaleureuse.` : 'Réponds en français naturel.'}
Ne jamais afficher de JSON brut dans une réponse texte. Signe — Sofia 🌍`;

  try {
    const isForm = !!(formData||fileData);
    const system = isForm ? sysForm : sysChat;
    let allMessages;

    if (isForm) {
      const content = [];
      if (fileData && fileType) {
        if (fileType.startsWith('image/')) content.push({type:"image",source:{type:"base64",media_type:fileType,data:fileData}});
        else if (fileType==='application/pdf') content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:fileData}});
      }
      const hasForm = formData && (formData.destination||formData.budget);
      const endDate = formData?.dateStart
        ? new Date(new Date(formData.dateStart).getTime()+formData.nuits*86400000).toISOString().split("T")[0]
        : "Flexibles";
      const prompt = (!hasForm&&fileData)
        ? `Analyse cette image/photo. Extrais toutes les infos de voyage visibles. Complète avec tes recommandations. JSON brut seulement, commence par {`
        : `Crée mon plan de vacances. JSON brut seulement, commence par {
Destination: ${formData.destination}
Départ depuis: ${formData.depart||"Non précisé"}
Transport aller: ${Array.isArray(formData.transport_to)?formData.transport_to.join("+"):formData.transport_to||"Non précisé"}${formData.transport_to_autre?" ("+formData.transport_to_autre+")":""}
Dates: ${formData.dateStart||"Flexibles"} → ${formData.dateEnd||endDate} (${formData.nuits} nuits)
Voyageurs: ${formData.voyageurs==="Autre"?formData.voyageurs_autre:formData.voyageurs||"Non précisé"}
Budget: ${formData.budget==="Budget global"?formData.budget_global:formData.budget||"Non précisé"}
Style: ${(formData.styles||[]).join(", ")||"Varié"}${formData.style_autre?", "+formData.style_autre:""}
Hébergement: ${formData.hebergement==="Autre"?formData.hebergement_autre:formData.hebergement||"Non précisé"}
Transport sur place: ${formData.transport==="Autre"?formData.transport_autre:formData.transport||"Non précisé"}
Besoins: ${formData.special||"Aucun"}
Incontournables: ${formData.musts||"Propose les incontournables"}
À éviter: ${formData.avoid||"Rien"}
Notes: ${formData.notes||"Aucune"}${fileData?" + image jointe":""}`;
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
      // Form generation failed
      res.status(200).json({type:"error"});
    } else {
      // Chat conversation - Sofia responded in natural language
      res.status(200).json({type:"chat",reply:text});
    }
  } catch(e) {
    if (e.message==="OVERLOADED") res.status(529).json({error:"OVERLOADED"});
    else res.status(500).json({error:e.message});
  }
}
