function extractJSON(text) {
  const attempts = [function extractJSON(text) {
  const attempts = [
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,''),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { return JSON.parse(a.trim()); } catch {}
  }
  return null;
}

async function callClaude(system, messages, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
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
          messages
        })
      });
      const data = await response.json();
      if (response.status === 529 || data.error?.type === "overloaded_error") {
        if (i < retries) { await new Promise(r => setTimeout(r, 3000)); continue; }
        throw new Error("OVERLOADED");
      }
      if (!response.ok) throw new Error(data.error?.message || "Erreur API");
      return data.content[0].text;
    } catch(e) {
      if (i < retries && e.message !== "OVERLOADED") { await new Promise(r => setTimeout(r, 2000)); continue; }
      throw e;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData } = req.body;

  const systemForm = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français.
Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après, sans balises markdown.
Format JSON exact :
{"intro":"Message chaleureux (2 phrases)","days":[{"num":1,"title":"Titre","location":"Ville","morning":"Matin avec vrais lieux","afternoon":"Après-midi","evening":"Soirée + restaurant réel","tip":"Astuce"}],"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Grand Site/Parc National/etc","location":"Localisation","description":"Description","website":"URL si connue"}],"accommodations":[{"name":"Nom exact","type":"Type","location":"Quartier","price":"Prix/nuit","why":"Raison"}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat signature","price":"Fourchette","tip":"Conseil"}],"hikes":[{"name":"Nom sentier","distance":"X km","duration":"X h","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu'on voit"}],"activities":[{"name":"Nom","duration":"Durée","price":"Prix","info":"Info"}],"tips":["conseil1","conseil2","conseil3","conseil4","conseil5","conseil6"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total estimé"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'identité","Visa si nécessaire","Assurance voyage","Réservations imprimées"]},{"category":"Santé","items":["Crème solaire","Répulsifs anti-moustiques","Trousse pharmacie","Médicaments habituels"]},{"category":"Vêtements","items":["Adaptés à la météo locale","Chaussures de marche","Tenue de soirée","Imperméable"]},{"category":"Technologie","items":["Adaptateur électrique","Chargeurs","Batterie externe","Téléphone"]},{"category":"Divers","items":["Argent local","Carte bancaire","Cadenas","Sac à dos léger"]}]}
Génère exactement le bon nombre de jours selon les nuits. Noms RÉELS et précis.`;

  const systemChat = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français.
Si l'utilisateur demande de MODIFIER le plan (changer un jour, ajouter activité, modifier hébergement, etc.), réponds avec le JSON complet mis à jour (même format), sans texte avant ni après.
Si l'utilisateur pose une question, réponds en français naturel.
Signe toujours — Sofia 🌍`;

  try {
    const isForm = !!formData;
    const system = isForm ? systemForm : systemChat;
    const allMes
    text.trim(),
    text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,''),
    text.trim().replace(/```json/g,'').replace(/```/g,''),
    (text.match(/\{[\s\S]*\}/)||[])[0],
  ];
  for (const a of attempts) {
    if (!a) continue;
    try { return JSON.parse(a.trim()); } catch {}
  }
  return null;
}

async function callClaude(system, messages, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
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
          messages
        })
      });
      const data = await response.json();
      if (response.status === 529 || data.error?.type === "overloaded_error") {
        if (i < retries) { await new Promise(r => setTimeout(r, 3000)); continue; }
        throw new Error("OVERLOADED");
      }
      if (!response.ok) throw new Error(data.error?.message || "Erreur API");
      return data.content[0].text;
    } catch(e) {
      if (i < retries && e.message !== "OVERLOADED") { await new Promise(r => setTimeout(r, 2000)); continue; }
      throw e;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData } = req.body;

  const systemForm = `Tu es Sofia, conseillère de voyage experte pour "On The Road Again". Tu réponds TOUJOURS en français.
Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après, sans balises markdown.
Format JSON exact :
{"intro":"Message chaleureux (2 phrases)","days":[{"num":1,"title":"Titre","location":"Ville","morning":"Matin avec vrais lieux","afternoon":"Après-midi","evening":"Soirée + restaurant réel","tip":"Astuce"}],"remarkable_sites":[{"name":"Nom officiel","label":"UNESCO/Grand Site/Parc National/etc","location":"Localisation","description":"Description","website":"URL si connue"}],"accommodations":[{"name":"Nom exact","type":"Type","location":"Quartier","price":"Prix/nuit","why":"Raison"}],"restaurants":[{"name":"Nom","cuisine":"Cuisine","specialty":"Plat signature","price":"Fourchette","tip":"Conseil"}],"hikes":[{"name":"Nom sentier","distance":"X km","duration":"X h","difficulty":"Facile/Moyen/Difficile","highlights":"Ce qu'on voit"}],"activities":[{"name":"Nom","duration":"Durée","price":"Prix","info":"Info"}],"tips":["conseil1","conseil2","conseil3","conseil4","conseil5","conseil6"],"budget":{"accommodation":"X€/nuit","meals":"X€/jour","activities":"X€/jour","transport":"X€/jour","total":"Total estimé"},"packing_essentials":[{"category":"Documents","items":["Passeport","Carte d'id
