function extractJSON(text) {
  const attempts = [
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,''),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { const j = JSON.parse(a.trim()); if (j && typeof j === 'object') return j; } catch {}
  }
  return null;
}

async function callClaude(system, messages, retries = 2) {
  for (let i = 0; i <= retries; i++) {
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
          max_tokens: 4000,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages
        })
      });
      const data = await res.json();
      if (res.status === 529 || data.error?.type === "overloaded_error") {
        if (i < retries) { await new Promise(r => setTimeout(r, 3000 * (i + 1))); continue; }
        throw new Error("OVERLOADED");
      }
      if (!res.ok) throw new Error(data.error?.message || "Erreur API");
      return data.content[0].text;
    } catch(e) {
      if (i < retries && e.message !== "OVERLOADED") { await new Promise(r => setTimeout(r, 2000)); continue; }
      throw e;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData, currentPlan } = req.body;

  const JSON_FORMAT = `{"intro":"Message chaleureux personnalisé (2 phrases)","days":[{"num":1,"title":"Titre évocateur","location":"Lieu précis avec adresse si possible","morning":"Description matin avec noms réels de lieux et adresses","afternoon":"Description après-midi","evening":"Restaurant réel avec adresse + soirée","tip":"Astuce pratique du jour"}],"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Grand Site de France/Parc National/Patrimoine mondial/etc","location":"Adresse précise","description":"Ce qu'on y voit et ressent","website":"URL officielle si connue","coords":[lat,lon]}],"accommodations":[{"name":"Nom exact","type":"Type","location":"Adresse précise","price":"Prix estimé/nuit","why":"Raison du choix","website":"Site officiel si connu","coords":[lat,lon]}],"restaurants":[{"name":"Nom exact","cuisine":"Type de cuisine","specialty":"Plat signature","price":"Fourchette €","tip":"Conseil pratique","address":"Adresse complète","website":"Site ou page si connu","coords":[lat,lon]}],"hikes":[{"name":"Nom officiel du sentier","distance":"X km","duration":"X h","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu'on voit","start_point":"Point de départ précis avec adresse","transport_from_center":"Comment y aller depuis le centre","coords_start":[lat,lon]}],"activities":[{"name":"Nom exact","duration":"Durée","price":"Prix","info":"Info pratique","address":"Adresse","website":"Site officiel","coords":[lat,lon]}],"agenda":[{"type":"positive","name":"Nom événement","date":"Date ou période","description":"Détails pratiques"},{"type":"negative","name":"Perturbation","date":"Date","description":"Impact sur le voyage"},{"type":"info","name":"Jour férié ou fermeture","date":"Date","description":"Ce qui est fermé/ouvert"}],"tips":["conseil1","conseil2","conseil3","conseil4","conseil5","conseil6"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total estimé pour la durée"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'identité","Visa si nécessaire","Assurance voyage","Réservations imprimées","Carte européenne assurance maladie"]},{"category":"Santé","items":["Crème solaire","Répulsifs anti-moustiques","Trousse pharmacie","Médicaments habituels"]},{"category":"Vêtements","items":["Adaptés météo locale","Chaussures de marche","Tenue de soirée","Imperméable"]},{"category":"Technologie","items":["Adaptateur électrique","Chargeurs","Batterie externe","Téléphone"]},{"category":"Divers","items":["Argent local","Carte bancaire","Cadenas","Sac à dos de jour"]}]}`;

  const systemForm = `Tu es Sofia, conseillère de voyage experte et passionnée pour "On The Road Again". Tu réponds TOUJOURS en français.
Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après, sans balises markdown.
Format JSON exact :
${JSON_FORMAT}
Règles :
- Génère exactement le bon nombre de jours selon les nuits
- Noms RÉELS et précis avec adresses quand possible
- Coordonnées GPS réelles [latitude, longitude] pour chaque lieu
- Agenda : inclure événements positifs (festivals, concerts, marchés) ET négatifs (grèves, travaux, fermetures) aux dates du voyage, plus jours fériés
- Si hébergement précis mentionné, le mettre en PREMIER dans accommodations puis proposer 2-3 alternatives
- Inclure les incontournables de la destination même si non demandés`;

  const systemChat = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français. Tu es chaleureuse et enthousiaste.
${currentPlan ? `Le client a un plan de voyage actuel :
Destination : ${currentPlan.destination || ''}
Plan complet : ${JSON.stringify(currentPlan)}

Si le client demande de MODIFIER ce plan (changer un jour, ajouter/supprimer une journée, modifier hébergement, ajouter activité, etc.), réponds avec le JSON COMPLET mis à jour au même format, sans texte avant ni après.
Si le client pose une question ou fait une conversation normale, réponds en français naturel.` : `Réponds en français naturel.`}
RÈGLE ABSOLUE : Ne jamais montrer de code JSON brut à l'utilisateur dans tes réponses texte. Signe — Sofia 🌍`;

  try {
    const isForm = !!formData;
    const system = isForm ? systemForm : systemChat;
    const allMessages = isForm ? [{
      role: "user",
      content: `Crée mon plan :
Destination : ${formData.destination}
Départ depuis : ${formData.depart || "Non précisé"}
Comment s'y rendre : ${formData.transport_to || "Non précisé"}${formData.transport_to_autre ? " — " + formData.transport_to_autre : ""}
Dates : ${formData.dateStart || "Flexibles"} → ${formData.dateEnd || "Flexibles"} (${formData.nuits} nuits)
Voyageurs : ${formData.voyageurs === "Autre" ? formData.voyageurs_autre : formData.voyageurs}
Budget : ${formData.budget === "Budget global" ? "Budget global : " + formData.budget_global : formData.budget}
Style : ${formData.styles?.join(", ") || "Varié"}${formData.style_autre ? ", " + formData.style_autre : ""}
Hébergement : ${formData.hebergement === "Autre" ? formData.hebergement_autre : formData.hebergement}
Transport sur place : ${formData.transport === "Autre" ? formData.transport_autre : formData.transport}
Besoins spéciaux : ${formData.special || "Aucun"}
Incontournables : ${formData.musts || "Propose les incontournables de la destination"}
À éviter : ${formData.avoid || "Rien"}
Notes : ${formData.notes || "Aucune"}
Génère le plan complet en JSON.`
    }] : messages;

    const text = await callClaude(system, allMessages);
    const json = extractJSON(text);
    if (json && (json.days || json.intro || json.accommodations)) {
      res.status(200).json({ type: "plan", data: json });
    } else {
      res.status(200).json({ type: "chat", reply: text });
    }
  } catch(e) {
    if (e.message === "OVERLOADED") {
      res.status(529).json({ error: "OVERLOADED" });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
}
