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
  return JSON.stringify({
    destination: plan.destination,
    intro: plan.intro,
    days: plan.days,
    accommodations: (plan.accommodations||[]).map(h=>({name:h.name,type:h.type,location:h.location,price:h.price})),
    restaurants: (plan.restaurants||[]).map(r=>({name:r.name,cuisine:r.cuisine,address:r.address})),
    outings: (plan.outings||[]).map(o=>({name:o.name,type:o.type,duration:o.duration})),
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

  const FMT = `{
"intro":"Message chaleureux personnalisé",
"days":[{"num":1,"title":"Titre évocateur","location":"NOM COURT uniquement — 1 à 3 mots reconnaissables par Google Maps (ex: Cap Corse, Piana, Porto-Vecchio, Bonifacio). JAMAIS de description longue.","morning":"Activités du matin avec lieux précis","afternoon":"Après-midi","evening":"Soirée et dîner avec nom du restaurant","tip":"Astuce locale"}],
"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Réserve/Parc National/Grand Site","location":"Adresse courte","description":"Ce qu'on y voit","website":"URL officielle si connue","coords":[lat,lon],"unsplash_query":"mots-clés précis pour trouver une photo (ex: Calanques de Piana Corse falaises rouges)"}],
"accommodations":[{"name":"Nom exact de l'hôtel/gîte","type":"Type","location":"Adresse","price":"Prix/nuit","why":"Pourquoi ce choix","website":"Site officiel","coords":[lat,lon],"unsplash_query":"mots-clés photo (ex: hôtel Porto Vecchio Corse mer)"}],
"restaurants":[{"name":"Nom exact","cuisine":"Type","specialty":"Plat signature","price":"€","tip":"Conseil","address":"Adresse complète","website":"Site si connu","coords":[lat,lon]}],
"outings":[{"name":"Nom de l'activité ou randonnée","type":"randonnée|activité|excursion|sport","subtype":"description courte du type (ex: sentier côtier, plongée, kayak, visite guidée)","distance":"X km si randonnée","duration":"Durée","difficulty":"Facile/Moyen/Difficile si randonnée","highlights":"Ce qu'on voit/vit","start_point":"Point de départ précis","transport_from_center":"Comment y aller depuis le centre","price":"Prix si activité payante","address":"Adresse si lieu fixe","website":"Site ou lien réservation","coords":[lat,lon],"unsplash_query":"mots-clés photo précis (ex: randonnée Cap Corse sentier littoral)"}],
"agenda":[{"type":"positive","name":"Événement","date":"Date exacte","description":"Détails pratiques"},{"type":"negative","name":"Perturbation","date":"Dates","description":"Impact sur le voyage"},{"type":"info","name":"Info pratique","date":"Période","description":"Ce qu'il faut savoir"}],
"tourism_office":{"name":"Nom complet de l'office","website":"URL OFFICIELLE (ex: visit-corsica.com, corsica-isula.fr)","address":"Adresse","phone":"Téléphone"},
"tips":["conseil1","conseil2","conseil3","conseil4","conseil5"],
"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total estimé"},
"packing_essentials":[
{"category":"Documents","items":["Passeport ou Carte d'identité","Assurance voyage","Réservations imprimées ou sur téléphone","Permis de conduire international si hors UE"]},
{"category":"Santé","items":["Crème solaire SPF 50+","Crème après-soleil","Trousse pharmacie de base","Médicaments personnels","Répulsif anti-moustiques"]},
{"category":"Vêtements","items":["Vêtements adaptés à la météo locale","Chaussures de randonnée confortables","Maillot de bain","Chapeau ou casquette","Pull léger pour les soirées","Imperméable léger"]},
{"category":"Technologie","items":["Chargeur téléphone","Adaptateur électrique si nécessaire","Batterie externe","Appareil photo","Lunettes de soleil"]},
{"category":"Divers","items":["Argent liquide local","Carte bancaire internationale","Sac à dos de jour","Gourde réutilisable","Guide ou carte locale"]}
]}`;

  const sysForm = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Réponds TOUJOURS en français.
CRITICAL: Réponds UNIQUEMENT avec du JSON brut valide. PAS de texte. PAS de backticks. Commence par { et termine par }.

RÈGLE CRITIQUE pour le champ "location" des jours d'itinéraire:
→ Mettre UNIQUEMENT le nom géographique court (1-3 mots) que Google Maps peut trouver immédiatement.
→ CORRECT: "Cap Corse", "Piana", "Porto-Vecchio", "Bonifacio", "Calvi", "Corte"
→ INCORRECT: "Cap Corse, Croisière Promenades en Mer, villages", "Riana Porto, Voyage en Méditerranée"
→ Jamais de descriptions, jamais de virgules multiples, jamais de mots comme "Voyage"

RÈGLE pour le champ "unsplash_query": mettre des mots-clés précis et visuels pour trouver une belle photo pertinente.

Format JSON: ${FMT}
Règles additionnelles:
- "outings" = fusion des randonnées ET activités en une seule liste (type: randonnée ou activité)
- Génère le bon nombre de jours selon les nuits
- Coordonnées GPS réelles
- Agenda avec événements réels aux dates du voyage
- Hébergement précis mentionné → EN PREMIER dans accommodations
- Inclure les incontournables même si non demandés
- Si image/document joint → extraire toutes les infos visibles`;

  const sysChat = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Réponds TOUJOURS en français. Tu es chaleureuse.
${currentPlan ? `Plan actuel pour ${currentPlan.destination||'la destination'}:
${planSummary(currentPlan)}

Si modification demandée (ajouter/supprimer jour, changer activité, modifier hébergement, etc.):
→ Réponds avec le JSON COMPLET mis à jour au même format, commence directement par {, sans aucun texte avant.
Si question ou conversation normale:
→ Réponds en français naturel et utile.` : 'Réponds en français naturel.'}
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
        ? `Analyse cette image/photo de notes de voyage. Extrais toutes les informations visibles (destination, dates, lieux, activités, hébergements souhaités). Complète avec tes meilleures recommandations pour les infos manquantes. Respecte strictement les règles du format JSON, notamment pour le champ location. JSON brut seulement, commence par {`
        : `Crée mon plan de vacances complet. JSON brut seulement, commence par {
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
Incontournables: ${formData.musts||"Propose les incontournables de la destination"}
À éviter: ${formData.avoid||"Rien"}
Notes: ${formData.notes||"Aucune"}${fileData?" + document joint avec infos supplémentaires":""}`;
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
