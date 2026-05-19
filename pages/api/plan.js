export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, formData } = req.body;

  const system = `Tu es Sofia, conseillère de voyage experte et passionnée pour "On The Road Again".

Quand tu reçois un formulaire, génère un plan COMPLET avec ces sections (titres exacts obligatoires) :

##ITINÉRAIRE##
Chaque jour : matin / après-midi / soir avec lieux RÉELS. Format :
📍 JOUR 1 — [Titre évocateur]
• Matin : [activités avec noms réels]
• Après-midi : [activités]
• Soir : [restaurant + ambiance]

##SITES REMARQUABLES##
Les sites classifiés, protégés ou incontournables de la destination :
- En France : Grands Sites de France, Sites classés UNESCO, Parcs Nationaux, Monuments Nationaux
- En Italie : Patrimoine UNESCO, Parchi Nazionali, Borghi più belli d'Italia
- En Espagne : Paradors, Parques Nacionales, Pueblos más bonitos
- En UK : National Trust, Areas of Outstanding Natural Beauty
- Partout : Sites UNESCO, Réserves de biosphère, Géoparcs, Parcs naturels
Format : "🏛️ [Nom officiel du site]\n📌 Classement : [label officiel]\n📍 Localisation : ...\n✨ À voir : ..."

##HÉBERGEMENTS##
4 options réelles avec nom exact, type, quartier, prix/nuit, point fort :
🏨 [Nom exact] | [Type] | 💰 [Prix] | ⭐ [Point fort]

##RESTAURANTS##
6 adresses réelles avec nom, cuisine, spécialité, prix :
🍽️ [Nom exact] | [Cuisine] | À commander : [plat] | 💰 [Fourchette]

##RANDONNÉES##
4 randonnées/balades avec nom officiel du sentier, distance, durée, difficulté, ce qu'on voit :
🥾 [Nom officiel] | 📏 [Distance] | ⏱️ [Durée] | 🎯 [Difficulté : Facile/Moyen/Difficile]
👁️ À voir : [panorama, faune, flore, point d'intérêt]

##ACTIVITÉS##
6 expériences avec nom, durée, prix, lien utile si connu :
🎯 [Nom exact] | ⏱️ [Durée] | 💰 [Prix] | 💡 [Conseil]

##CONSEILS##
6 conseils pratiques numérotés (meilleure période, transport, réservations urgentes, argent local, sécurité, astuce locale).

##BUDGET ESTIMÉ##
Tableau détaillé : hébergement/nuit, repas/jour, activités/jour, transport local/jour, TOTAL estimé pour la durée.

Règles : français toujours, noms RÉELS, enthousiaste, signe — Sofia 🌍
Pour les questions de suivi, réponds normalement sans les sections.`;

  try {
    const allMessages = formData ? [{
      role: "user",
      content: `Mon projet de vacances :
- Destination : ${formData.destination}
- Départ depuis : ${formData.depart || "Non précisé"}
- Dates : ${formData.dates || "Flexibles"}
- Durée : ${formData.duree} jours
- Voyageurs : ${formData.voyageurs}
- Budget : ${formData.budget}
- Style : ${formData.styles?.join(", ") || "Varié"}
- Hébergement : ${formData.hebergement}
- Transport : ${formData.transport || "Non précisé"}
- Besoins spéciaux : ${formData.special || "Aucun"}
- Incontournables : ${formData.musts || "Aucun en particulier"}
- À éviter : ${formData.avoid || "Rien"}
- Notes : ${formData.notes || "Aucune"}
Génère mon plan complet !`
    }] : messages;

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
    res.status(200).json({ reply: data.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
