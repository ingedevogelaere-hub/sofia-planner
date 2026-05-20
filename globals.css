function extractJSON(text) {
  const clean = text.trim();
  const attempts = [
    clean,
    clean.replace(/^```json\s*/,'').replace(/\s*```$/,''),
    clean.replace(/```json/g,'').replace(/```/g,''),
    (clean.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { return JSON.parse(a.trim()); } catch {}
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData, updatePlan } = req.body;

  const systemBase = `Tu es Sofia, conseillère de voyage experte et chaleureuse pour "On The Road Again". Tu réponds TOUJOURS en français.`;

  const systemForm = systemBase + `
Quand tu reçois un formulaire de voyage, réponds UNIQUEMENT avec du JSON valide sans aucun texte avant ou après, sans balises markdown.
JSON exact à retourner :
{"intro":"Message chaleureux personnalisé (2 phrases)","days":[{"num":1,"title":"Titre évocateur","location":"Ville principale","morning":"Description matin avec vrais noms de lieux","afternoon":"Description après-midi","evening":"Restaurant réel + ambiance soirée","tip":"Astuce du jour"}],"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Grand Site de France/Parc National/etc","location":"Localisation","description":"Ce qu'on y voit","website":"URL si connue"}],"accommodations":[{"name":"Nom exact","type":"Type","location":"Quartier","price":"Prix/nuit","why":"Pourquoi le choisir"}],"restaurants":[{"name":"Nom exact","cuisine":"Cuisine","specialty":"Plat signature","price":"Fourchette","tip":"Conseil"}],"hikes":[{"name":"Nom officiel sentier","distance":"X km","duration":"X h","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu'on voit"}],"activities":[{"name":"Nom exact","duration":"Durée","price":"Prix","info":"Info pratique"}],"tips":["conseil 1","conseil 2","conseil 3","conseil 4","conseil 5","conseil 6"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total estimé"},"packing_essentials":[{"category":"Documents","items":["Passeport","..."]},{"category":"Santé","items":["..."]},{"category":"Vêtements","items":["..."]},{"category":"Technologie","items":["..."]},{"category":"Divers","items":["..."]}]}
Génère exactement le bon nombre de jours. Noms RÉELS et précis.`;

  const systemChat = systemBase + `
Tu es en mode conversation. Réponds normalement en français.
Si l'utilisateur demande de MODIFIER le plan de voyage (changer un jour, ajouter une activité, modifier un hébergement, etc.), réponds avec le JSON complet mis à jour (même format que précédemment), sans texte avant ni après.
Si l'utilisateur pose une question, demande un conseil ou fait une conversation, réponds en texte français normal.
Signe toujours — Sofia 🌍`;

  try {
    const isForm = !!formData;
    const isUpdate = !!updatePlan;
    const system = isForm ? systemForm : systemChat;

    let allMessages;
    if (isForm) {
      allMessages = [{
        role: "user",
        content: `Projet de vacances :
Destination: ${formData.destination}
Départ depuis: ${formData.depart||"Non précisé"}
Comment s'y rendre: ${formData.transport_to||"Non précisé"}
Du: ${formData.dateStart||"Flexible"} au: ${formData.dateEnd||"Flexible"} (${formData.duree} jours)
Voyageurs: ${formData.voyageurs}${formData.voyageurs_autre?" - "+formData.voyageurs_autre:""}
Budget: ${formData.budget}${formData.budget_global?" - Budget global: "+formData.budget_global:""}
Style: ${formData.styles?.join(", ")||"Varié"}${formData.style_autre?" + "+formData.style_autre:""}
Hébergement: ${formData.hebergement}${formData.hebergement_autre?" - "+formData.hebergement_autre:""}
Transport sur place: ${formData.transport}${formData.transport_autre?" - "+formData.transport_autre:""}
Besoins spéciaux: ${formData.special||"Aucun"}
Incontournables: ${formData.musts||"Aucun"}
À éviter: ${formData.avoid||"Rien"}
Notes: ${formData.notes||"Aucune"}
Génère le plan complet en JSON.`
      }];
    } else {
      allMessages = messages;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system,
        messages: allMessages
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Erreur API");
    const text = data.content[0].text;
    const json = extractJSON(text);

    if (json && (json.days || json.intro)) {
      res.status(200).json({ type:"plan", data:json });
    } else {
      res.status(200).json({ type:"chat", reply:text });
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
