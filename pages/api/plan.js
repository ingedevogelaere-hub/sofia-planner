/**
 * pages/api/plan.js
 * ─────────────────────────────────────────────────────────
 * Route API Next.js — point d'entrée unique vers Claude (Anthropic).
 * Deux modes selon le payload reçu :
 *   - "form" : génère un plan JSON complet depuis le formulaire
 *              (destination, dates, budget, style, fichier joint…)
 *   - "chat" : répond à un message utilisateur, peut retourner
 *              un plan mis à jour (JSON) ou une réponse texte.
 * Modèle utilisé : claude-haiku-4-5. Retry automatique si surchargé.
 */
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
  if (!plan) return 'Aucun plan actuel.';
  try {
    return JSON.stringify({
      destination: plan.destination,
      days: (plan.days||[]).map(d=>({num:d.num,title:d.title,location:d.location,morning:d.morning,afternoon:d.afternoon,evening:d.evening})),
      accommodations: (plan.accommodations||[]).map(h=>({name:h.name,type:h.type,location:h.location,price:h.price,website:h.website})),
      restaurants: (plan.restaurants||[]).map(r=>({name:r.name,cuisine:r.cuisine,address:r.address,specialty:r.specialty})),
      outings: (plan.outings||[]).map(o=>({name:o.name,type:o.type,day_num:o.day_num,duration:o.duration,difficulty:o.difficulty})),
      remarkable_sites: (plan.remarkable_sites||[]).map(s=>({name:s.name,location:s.location})),
      tourism_office: plan.tourism_office,
      budget: plan.budget,
      tips: plan.tips,
      agenda: plan.agenda,
      packing_essentials: plan.packing_essentials,
    });
  } catch { return `Destination: ${plan.destination||'inconnue'}`; }
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

  const FMT = `{"intro":"Message chaleureux","days":[{"num":1,"title":"Titre","location":"Nom court (1-3 mots Maps-compatible)","morning":"Matin","afternoon":"Après-midi","evening":"Soirée + restaurant","tip":"Astuce","unsplash_query":"mots-clés photo précis"}],"remarkable_sites":[{"name":"Nom","label":"Label","location":"Adresse","description":"Desc","website":"URL","coords":[lat,lon],"unsplash_query":"mots-clés"}],"accommodations":[{"name":"Nom","type":"Type","location":"Adresse","price":"Prix/nuit","why":"Raison","website":"Site","coords":[lat,lon],"unsplash_query":"mots-clés"}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat","price":"€","tip":"Conseil","address":"Adresse","website":"Site","coords":[lat,lon]}],"outings":[{"name":"Nom","type":"randonnée|activité","subtype":"détail","day_num":1,"distance":"Xkm","duration":"Durée","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu'on voit","start_point":"Départ","transport_from_center":"Accès","price":"Prix","address":"Adresse","website":"Site","coords":[lat,lon],"unsplash_query":"mots-clés"}],"agenda":[{"type":"positive|negative|info","name":"Nom","date":"Date","description":"Détails"}],"tourism_office":{"name":"Nom complet","website":"URL officielle","address":"Adresse","phone":"Tel"},"tips":["conseil1","conseil2","conseil3","conseil4","conseil5"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total"},"packing_essentials":[{"category":"Documents","items":["item1"]},{"category":"Santé","items":["item1"]},{"category":"Vêtements","items":["item1"]},{"category":"Technologie","items":["item1"]},{"category":"Divers","items":["item1"]}]}`;

  const sysForm = `Tu es Sofia, conseillère de voyage experte. Réponds TOUJOURS en français.
CRITICAL: Réponds UNIQUEMENT avec du JSON brut. PAS de texte avant/après. PAS de backticks. Commence par { et termine par }.
RÈGLE location: NOM COURT uniquement (1-3 mots reconnaissables par Google Maps). Ex: "Cap Corse", "Piana", "Sablon". JAMAIS de descriptions.
Format JSON: ${FMT}
Règles: noms réels, coords GPS, agenda avec événements aux dates, hébergement mentionné EN PREMIER, incontournables inclus, day_num dans outings.
${req.body.formData?.pmr ? 'CONTRAINTE PMR: tout doit être accessible fauteuil roulant (hébergements, restos, activités, transports).' : ''}`;

  const sysChat = `Tu es Sofia, IA conseillère de voyage intégrée dans l'application "On The Road Again". Réponds TOUJOURS en français.

${currentPlan && currentPlan.destination ? `
=== PLAN ACTUEL ===
${planSummary(currentPlan)}
=== FIN DU PLAN ===

INSTRUCTIONS IMPORTANTES:
1. Si l'utilisateur demande une MODIFICATION du plan (ajouter/supprimer une journée, changer un hôtel, modifier une activité, adapter le budget, version végétarienne, etc.):
   → Réponds avec le JSON COMPLET mis à jour au MÊME FORMAT que le plan actuel
   → Commence DIRECTEMENT par { sans aucun texte avant
   → Inclus TOUS les champs (jours, hébergements, restaurants, sorties, agenda, conseils, budget, valise)
   
2. Si l'utilisateur pose une QUESTION sur le voyage ou veut des infos:
   → Réponds en français naturel, sois utile et précise
   → Tu PEUX modifier le plan si c'est implicitement demandé

3. Tu es une IA capable de TOUT faire dans cette application. Ne dis JAMAIS de contacter une équipe ou un service. Tu gères tout toi-même.
` : `
Réponds en français naturel. Tu es une conseillère de voyage IA intégrée dans l'app.
Ne dis jamais de contacter une équipe externe. Tu gères tout toi-même.
`}
Signe toujours: — Sofia 🌍`;

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
      const styleVal = (formData.styles||[]).includes("__sofia__")
        ? "Sofia doit recommander le style idéal pour cette destination"
        : (formData.styles||[]).filter(s=>s!=="__sofia__").join(", ")||"Varié";
      const hebergVal = formData.hebergement==="sofia"
        ? "Sofia doit recommander le meilleur hébergement selon destination et budget"
        : formData.hebergement==="Autre" ? formData.hebergement_autre : formData.hebergement||"Non précisé";
      const transportVal = formData.transport==="sofia"
        ? "Sofia doit recommander le meilleur transport local selon la destination"
        : formData.transport==="Autre" ? formData.transport_autre : formData.transport||"Non précisé";

      const prompt = (!hasForm&&fileData)
        ? `Analyse cette image/photo. Extrais toutes les infos de voyage visibles. Complète avec tes meilleures recommandations. JSON brut seulement, commence par {`
        : `Crée mon plan de vacances. JSON brut seulement, commence par {
Destination: ${formData.destination}
Départ depuis: ${formData.depart||"Non précisé"}
Transport aller: ${Array.isArray(formData.transport_to)?formData.transport_to.join("+"):formData.transport_to||"Non précisé"}${formData.transport_to_autre?" ("+formData.transport_to_autre+")":""}
Dates: ${formData.dateStart||"Flexibles"} → ${formData.dateEnd||endDate} (${formData.nuits} nuits)
Voyageurs: ${formData.voyageurs==="Autre"?formData.voyageurs_autre:formData.voyageurs||"Non précisé"}
Budget: ${formData.budget==="Budget global"?formData.budget_global:formData.budget||"Non précisé"}
Style: ${styleVal}${formData.style_autre?", "+formData.style_autre:""}
Hébergement: ${hebergVal}
Transport sur place: ${transportVal}
Besoins: ${formData.special||"Aucun"}${formData.pmr?" + ACCESSIBILITÉ PMR REQUISE":""}
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
