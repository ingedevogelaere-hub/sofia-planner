function extractJSON(text) {
  const attempts = [
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,'').trim(),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    // Try direct parse
    try { const j = JSON.parse(a); if (j && typeof j === 'object') return j; } catch {}
    // Try fixing truncated JSON
    try {
      let f = a;
      if (f.match(/"[^"]*$/)) f += '"';
      const opens = (f.match(/\{/g)||[]).length - (f.match(/\}/g)||[]).length;
      const arrO = (f.match(/\[/g)||[]).length - (f.match(/\]/g)||[]).length;
      for(let i=0;i<arrO;i++) f += ']';
      for(let i=0;i<opens;i++) f += '}';
      const j = JSON.parse(f);
      if (j && typeof j === 'object') return j;
    } catch {}
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
          max_tokens: 7000,
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
  const { messages, formData, currentPlan, fileData, fileType } = req.body;

  const JSON_FORMAT = `{"intro":"Message chaleureux (2 phrases)","days":[{"num":1,"title":"Titre","location":"Lieu précis","morning":"Matin avec vrais lieux","afternoon":"Après-midi","evening":"Restaurant réel + soirée","tip":"Astuce"}],"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Grand Site/etc","location":"Adresse","description":"Description","website":"URL","coords":[lat,lon]}],"accommodations":[{"name":"Nom exact","type":"Type","location":"Adresse","price":"Prix/nuit","why":"Raison","website":"Site","coords":[lat,lon]}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat","price":"€","tip":"Conseil","address":"Adresse","website":"Site","coords":[lat,lon]}],"hikes":[{"name":"Nom sentier","distance":"X km","duration":"X h","difficulty":"Facile/Moyen/Difficile","highlights":"Vue","start_point":"Départ précis","transport_from_center":"Comment y aller","coords_start":[lat,lon]}],"activities":[{"name":"Nom","duration":"Durée","price":"Prix","info":"Info","address":"Adresse","website":"Site","coords":[lat,lon]}],"agenda":[{"type":"positive","name":"Événement","date":"Date","description":"Détails"},{"type":"negative","name":"Perturbation","date":"Date","description":"Impact"},{"type":"info","name":"Jour férié","date":"Date","description":"Impact"}],"tips":["conseil1","conseil2","conseil3","conseil4","conseil5"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'identité","Assurance voyage"]},{"category":"Santé","items":["Crème solaire","Trousse pharmacie"]},{"category":"Vêtements","items":["Adaptés météo","Chaussures marche"]},{"category":"Technologie","items":["Adaptateur","Chargeurs"]},{"category":"Divers","items":["Argent local","Carte bancaire"]}]}`;

  const systemForm = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français.
CRITICAL: Réponds UNIQUEMENT avec du JSON brut valide. JAMAIS de texte avant ou après. JAMAIS de balises backtick ou markdown. Commence DIRECTEMENT par { et termine par }.
Format JSON exact : ${JSON_FORMAT}
Règles :
- Génère exactement le bon nombre de jours selon les nuits
- Noms RÉELS et précis avec adresses
- Coordonnées GPS réelles [latitude, longitude]
- Agenda : événements positifs ET négatifs aux dates du voyage + jours fériés
- Si hébergement précis mentionné, le mettre EN PREMIER puis 2 alternatives
- Inclure les incontournables même si non demandés
- Si fichier/photo joint, en extraire toutes les informations utiles`;

  const systemChat = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français. Tu es chaleureuse.
${currentPlan ? `Plan actuel (destination: ${currentPlan.destination||''}) : ${JSON.stringify(currentPlan)}
Si modification demandée : réponds avec le JSON COMPLET mis à jour. Commence directement par { sans aucun texte avant.
Si question : réponds en français naturel.` : 'Réponds en français naturel.'}
Ne jamais montrer de JSON brut dans tes réponses texte. Signe — Sofia 🌍`;

  try {
    const isForm = !!(formData || fileData);
    const system = isForm ? systemForm : systemChat;
    let allMessages;

    if (isForm) {
      const content = [];
      if (fileData && fileType) {
        if (fileType.startsWith('image/')) {
          content.push({ type: "image", source: { type: "base64", media_type: fileType, data: fileData } });
        } else if (fileType === 'application/pdf') {
          content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData } });
        }
      }

      const hasForm = formData && (formData.destination || formData.budget);
      let textPrompt = (!hasForm && fileData)
        ? `Voici un document/photo avec mes souhaits de voyage. Analyse-le entièrement et crée un plan complet en JSON. Déduis la destination, les dates, le style, les activités souhaitées. Complète avec tes meilleures recommandations pour les infos manquantes. Réponds UNIQUEMENT avec du JSON brut, commence par {`
        : `Crée mon plan de vacances. Réponds UNIQUEMENT avec du JSON brut, commence par {
Destination : ${formData.destination}
Départ depuis : ${formData.depart || "Non précisé"}
Comment s'y rendre : ${Array.isArray(formData.transport_to) ? formData.transport_to.join(" + ") : formData.transport_to || "Non précisé"}${formData.transport_to_autre ? " (" + formData.transport_to_autre + ")" : ""}
Dates : ${formData.dateStart || "Flexibles"} → ${formData.dateStart ? new Date(new Date(formData.dateStart).getTime()+formData.nuits*86400000).toISOString().split("T")[0] : "Flexibles"} (${formData.nuits} nuits)
Voyageurs : ${formData.voyageurs === "Autre" ? formData.voyageurs_autre : formData.voyageurs || "Non précisé"}
Budget : ${formData.budget === "Budget global" ? "Budget global : " + formData.budget_global : formData.budget || "Non précisé"}
Style : ${(formData.styles||[]).join(", ") || "Varié"}${formData.style_autre ? ", " + formData.style_autre : ""}
Hébergement : ${formData.hebergement === "Autre" ? formData.hebergement_autre : formData.hebergement || "Non précisé"}
Transport sur place : ${formData.transport === "Autre" ? formData.transport_autre : formData.transport || "Non précisé"}
Besoins spéciaux : ${formData.special || "Aucun"}
Incontournables : ${formData.musts || "Propose les incontournables de la destination"}
À éviter : ${formData.avoid || "Rien"}
Notes : ${formData.notes || "Aucune"}
${fileData ? "Document/photo joint avec infos supplémentaires — intègre son contenu." : ""}`;

      content.push({ type: "text", text: textPrompt });
      allMessages = [{ role: "user", content }];
    } else {
      allMessages = messages;
    }

    const text = await callClaude(system, allMessages);
    const json = extractJSON(text);

    if (json && (json.days || json.intro || json.accommodations)) {
      res.status(200).json({ type: "plan", data: json });
    } else {
      // Last resort: return as chat so frontend can show proper error
      res.status(200).json({ type: "error", reply: "La génération a échoué. Réessaie — les serveurs peuvent être surchargés." });
    }
  } catch(e) {
    if (e.message === "OVERLOADED") {
      res.status(529).json({ error: "OVERLOADED" });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
}
