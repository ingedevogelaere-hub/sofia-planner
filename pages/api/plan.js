export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, formData } = req.body;

  const system = `Tu es Sofia, une conseillère de voyage française experte, chaleureuse et enthousiaste.
Tu travailles pour "On The Road Again".

Quand tu reçois les données du formulaire, génère un plan de vacances COMPLET et DÉTAILLÉ structuré ainsi :

🗺️ ITINÉRAIRE JOUR PAR JOUR
Pour chaque jour :
📍 Jour X — [Titre évocateur]
• Matin : activités avec noms réels de lieux
• Après-midi : activités
• Soir : restaurant recommandé avec spécialité

🏨 HÉBERGEMENTS RECOMMANDÉS
3 options selon le budget avec prix approximatifs

🥾 RANDONNÉES & NATURE
Les meilleures balades avec niveau de difficulté et durée

🍽️ RESTAURANTS INCONTOURNABLES  
5-8 restaurants avec spécialités et fourchette de prix

🎯 ACTIVITÉS & EXPÉRIENCES
Musées, visites, expériences locales à ne pas manquer

💡 CONSEILS PRATIQUES
Transport, météo, budget, réservations à anticiper

Règles :
- Répondre TOUJOURS en français
- Donner des noms RÉELS et précis
- Être enthousiaste et personnelle
- Pour les questions de suivi, adapter et compléter l'itinéraire
- Signer avec — Sofia 🌍`;

  try {
    const allMessages = formData
      ? [{ role: "user", content: `Voici ma demande de voyage :\n- Destination : ${formData.destination}\n- Dates : ${formData.dates}\n- Durée : ${formData.duree} jours\n- Voyageurs : ${formData.voyageurs}\n- Budget : ${formData.budget}\n- Style : ${formData.styles.join(", ")}\n- Hébergement : ${formData.hebergement}\n- Envies particulières : ${formData.notes || "Aucune"}\n\nGénère mon plan de vacances complet !` }]
      : messages;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
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
