import Head from "next/head";
import { useState, useRef, useEffect } from "react";

// ─── Config ────────────────────────────────────────────────
const TP_MARKER = "";
const UNSPLASH_KEY = "z33MKSymKePZB5EmPynqEyxjxQ5ujCrPD3Bn5-FxtYU";
const photoCache = {};

// ─── Design tokens ─────────────────────────────────────────
const C = {
  gold:"#B8972E",rust:"#C1440E",forest:"#2C4A3E",navy:"#1A3A5C",
  ink:"#1C1A14",cream:"#FAF6EE",parch:"#EDE0C4",mist:"#8A9E93"
};

function selBtn(active,color=C.navy){
  return{padding:"9px 12px",border:"1.5px solid",borderRadius:6,textAlign:"left",width:"100%",
    background:active?color+"18":"transparent",borderColor:active?color:C.parch,
    color:active?color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",
    fontWeight:active?600:400,transition:"all .15s"};
}
function pillBtn(active,color=C.navy){
  return{padding:"7px 13px",border:"1.5px solid",borderRadius:100,
    background:active?color+"18":"transparent",borderColor:active?color:C.parch,
    color:active?color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",
    fontWeight:active?600:400,transition:"all .15s"};
}

// ─── Constants ─────────────────────────────────────────────
const STYLES_LIST=["🏛️ Culture","🌿 Nature","🍷 Gastronomie","🏖️ Plages","⛰️ Montagne","🥾 Randonnées","🧗 Aventure","🎨 Art","📸 Photo","👨‍👩‍👧 Famille","🚴 Vélo","🏕️ Camping","🧘 Bien-être","🛍️ Shopping"];
const HEBERGEMENTS=["🏨 Hôtel","🏠 Airbnb / Location","⛺ Camping","🛏️ B&B / Chambre d'hôtes","💎 Hôtel de luxe","🏡 Gîte rural","🛖 Auberge de jeunesse","🏠 Je dors chez moi"];
const BUDGETS=["🌱 Économique (< 80€/j)","💼 Moyen (80-150€/j)","✨ Confort (150-250€/j)","💎 Luxe (250€+/j)"];
const TRANSPORTS_LOCAL=["🚗 Voiture de location","🚌 Transports en commun","🚲 Vélo","🚶 À pied","🛵 Scooter","🚐 Van / Camping-car"];
const TRANSPORT_TO=["✈️ Avion","🚄 Train","🚗 Ma voiture","🚗 Voiture louée","🚌 Bus","⛴️ Ferry","🚢 Croisière","🛺 Navette"];
const VOYAGEURS=["Solo","2 adultes","Famille (bébé 0-3 ans)","Famille (enfants 4-12 ans)","Famille (ados)","Groupe d'amis","Couple senior"];

const enc=s=>encodeURIComponent(s||"");
const enc2=s=>s?s.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""):"";

// ─── Languages ──────────────────────────────────────────────
const LANGS=[
  {code:"FR",flag:"🇫🇷",name:"Français"},
  {code:"EN",flag:"🇬🇧",name:"English"},
  {code:"NL",flag:"🇳🇱",name:"Nederlands"},
  {code:"DE",flag:"🇩🇪",name:"Deutsch"},
  {code:"IT",flag:"🇮🇹",name:"Italiano"},
  {code:"ES",flag:"🇪🇸",name:"Español"},
  {code:"PT",flag:"🇵🇹",name:"Português"},
  {code:"LU",flag:"🇱🇺",name:"Lëtzebuergesch"},
  {code:"PL",flag:"🇵🇱",name:"Polski"},
  {code:"RO",flag:"🇷🇴",name:"Română"},
  {code:"SV",flag:"🇸🇪",name:"Svenska"},
  {code:"DA",flag:"🇩🇰",name:"Dansk"},
];

const T={
  FR:{
    title:"Planifie tes vacances parfaites",
    sub:"Sofia crée ton plan complet avec itinéraire, incontournables, hébergements, restaurants, sorties et valise",
    dest:"Destination *",destPH:"Corse, Bruxelles, Kyoto…",dep:"Ville de départ",depPH:"Luxembourg, Paris, Bruxelles…",
    dates:"Dates du séjour",from:"DÉPART",to:"RETOUR",nights:"nuits",orNights:"Ou combien de nuits si dates inconnues ?",
    noDate:"Choisissez d'abord les dates pour voir le résumé",
    howGet:"Comment vous y rendre",multiStep:"Plusieurs étapes possibles — ex : 🚗 + ⛴️ Ferry",
    travelers:"Voyageurs",budget:"Budget *",globalBudget:"💵 Budget global à préciser",globalBudgetPH:"Ex: 3000€ pour 2 pers., 7 nuits…",
    style:"Style de voyage (plusieurs choix)",heberge:"Hébergement *",localT:"Transport sur place",
    wishes:"Tes envies & besoins",musts:"Incontournables / Rêves",mustsPH:"Calanques, plage Palombaggia…",
    avoid:"À éviter",avoidPH:"Pas trop touristique…",special:"Besoins spéciaux",specialPH:"Végétarien, allergie…",
    notes:"Autres informations",notesPH:"Passionné de plongée, fan de gastronomie…",
    btn:"Créer mon plan de vacances avec Sofia →",btnFile:"📎 Analyser mes notes et créer mon plan →",
    hint:"Destination, Budget et Hébergement sont nécessaires",hintFile:"Sofia analysera ton document pour créer un plan complet",
    other:"✏️ Autre",stayHome:"🏠 Je dors chez moi",
    addCat:"Ajouter dans",myStuff:"🧳 Mes affaires personnelles",myStuffPH:"Coussins, fromages, café, couteaux…",
    note:"Ajouter une note",noteClose:"Fermer",
    chat:"Chat avec Sofia",chatSub:"Demande un changement → plan mis à jour",chatPH:"Demande un changement à Sofia…",
    months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    days:["Lu","Ma","Me","Je","Ve","Sa","Di"],
    loading:"Sofia prépare ton aventure…",loadingFile:"Sofia lit tes notes et prépare ton aventure…",
    chatSug:["Ajoute une journée","Change le jour 2","Plus de randonnées","Hébergement moins cher","Version végétarienne","Optimise le budget"],
    new:"← Nouveau",overTitle:"Génération échouée",overSub:"Les serveurs sont surchargés. Attends 1-2 minutes et réessaie.",
    uploadTitle:"Partage tes notes ou idées à Sofia",uploadSub:"Photo d'un carnet, article, liste… Sofia lit tout et crée ton voyage.",
    uploadCTA:"Glisse ou clique pour importer",uploadFmt:"JPG, PNG, PDF, TXT — max 15 Mo",
    uploadLoaded:"FICHIER CHARGÉ",uploadHint:"Remplis le formulaire pour affiner, ou laisse Sofia tout déduire.",
    langPick:"Langue",
  },
  EN:{
    title:"Plan your perfect vacation",
    sub:"Sofia creates your complete plan with itinerary, must-sees, accommodations, restaurants, outings and packing list",
    dest:"Destination *",destPH:"Corsica, Brussels, Kyoto…",dep:"Departure city",depPH:"Luxembourg, Paris, Brussels…",
    dates:"Trip dates",from:"DEPARTURE",to:"RETURN",nights:"nights",orNights:"Or how many nights if dates unknown?",
    noDate:"Choose dates first to see the summary",
    howGet:"How to get there",multiStep:"Multiple legs possible — e.g. 🚗 + ⛴️ Ferry",
    travelers:"Travelers",budget:"Budget *",globalBudget:"💵 Total budget to specify",globalBudgetPH:"E.g. €3000 for 2 people, 7 nights…",
    style:"Travel style (multiple choices)",heberge:"Accommodation *",localT:"Local transport",
    wishes:"Your wishes & needs",musts:"Must-sees / Dreams",mustsPH:"Calanques, Palombaggia beach…",
    avoid:"To avoid",avoidPH:"Not too touristy…",special:"Special needs",specialPH:"Vegetarian, allergy…",
    notes:"Other information",notesPH:"Diving enthusiast, foodie…",
    btn:"Create my vacation plan with Sofia →",btnFile:"📎 Analyze my notes and create my plan →",
    hint:"Destination, Budget and Accommodation are required",hintFile:"Sofia will analyze your document to create a complete plan",
    other:"✏️ Other",stayHome:"🏠 Staying at home",
    addCat:"Add to",myStuff:"🧳 My personal items",myStuffPH:"Pillows, cheeses, coffee, knives…",
    note:"Add a note",noteClose:"Close",
    chat:"Chat with Sofia",chatSub:"Request a change → plan updated",chatPH:"Ask Sofia for a change…",
    months:["January","February","March","April","May","June","July","August","September","October","November","December"],
    days:["Mo","Tu","We","Th","Fr","Sa","Su"],
    loading:"Sofia is preparing your adventure…",loadingFile:"Sofia is reading your notes and preparing your adventure…",
    chatSug:["Add a day","Change day 2","More hikes","Cheaper accommodation","Vegetarian version","Optimize budget"],
    new:"← New",overTitle:"Generation failed",overSub:"Servers are overloaded. Wait 1-2 minutes and try again.",
    uploadTitle:"Share your notes or ideas with Sofia",uploadSub:"Photo of a notebook, article, list… Sofia reads it all and creates your trip.",
    uploadCTA:"Drag or click to import",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"FILE LOADED",uploadHint:"Fill in the form to refine, or let Sofia deduce everything.",
    langPick:"Language",
  },
  NL:{
    title:"Plan jouw perfecte vakantie",sub:"Sofia maakt jouw volledig plan met reisroute, bezienswaardigheden, verblijven, restaurants, uitjes en paklijst",
    dest:"Bestemming *",destPH:"Corsica, Brussel, Kyoto…",dep:"Vertrekstad",depPH:"Luxemburg, Parijs, Brussel…",
    dates:"Reisdata",from:"VERTREK",to:"TERUGKEER",nights:"nachten",orNights:"Of hoeveel nachten als data onbekend?",
    noDate:"Kies eerst data om het overzicht te zien",
    howGet:"Hoe kom je er",multiStep:"Meerdere etappes mogelijk — bijv. 🚗 + ⛴️ Veerboot",
    travelers:"Reizigers",budget:"Budget *",globalBudget:"💵 Totaalbudget opgeven",globalBudgetPH:"Bijv. €3000 voor 2 personen, 7 nachten…",
    style:"Reijsstijl (meerdere keuzes)",heberge:"Verblijf *",localT:"Lokaal vervoer",
    wishes:"Jouw wensen & behoeften",musts:"Hoogtepunten / Dromen",mustsPH:"Calanques, strand Palombaggia…",
    avoid:"Te vermijden",avoidPH:"Niet te toeristisch…",special:"Speciale behoeften",specialPH:"Vegetarisch, allergie…",
    notes:"Overige informatie",notesPH:"Duikliefhebber, fijnproever…",
    btn:"Maak mijn vakantieplan met Sofia →",btnFile:"📎 Analyseer mijn notities en maak mijn plan →",
    hint:"Bestemming, Budget en Verblijf zijn verplicht",hintFile:"Sofia analyseert jouw document voor een volledig plan",
    other:"✏️ Andere",stayHome:"🏠 Ik slaap thuis",
    addCat:"Toevoegen aan",myStuff:"🧳 Mijn persoonlijke spullen",myStuffPH:"Kussens, kazen, koffie, messen…",
    note:"Notitie toevoegen",noteClose:"Sluiten",
    chat:"Chat met Sofia",chatSub:"Vraag een wijziging → plan bijgewerkt",chatPH:"Vraag Sofia om een wijziging…",
    months:["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"],
    days:["Ma","Di","Wo","Do","Vr","Za","Zo"],
    loading:"Sofia bereidt jouw avontuur voor…",loadingFile:"Sofia leest jouw notities en bereidt jouw avontuur voor…",
    chatSug:["Dag toevoegen","Dag 2 wijzigen","Meer wandelingen","Goedkoper verblijf","Vegetarische versie","Budget optimaliseren"],
    new:"← Nieuw",overTitle:"Generatie mislukt",overSub:"Servers zijn overbelast. Wacht 1-2 minuten en probeer opnieuw.",
    uploadTitle:"Deel jouw notities of ideeën met Sofia",uploadSub:"Foto van een notitieboek, artikel, lijst… Sofia leest alles en maakt jouw reis.",
    uploadCTA:"Sleep of klik om te importeren",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"BESTAND GELADEN",uploadHint:"Vul het formulier in om te verfijnen, of laat Sofia alles afleiden.",
    langPick:"Taal",
  },
  DE:{
    title:"Plane deinen perfekten Urlaub",sub:"Sofia erstellt deinen kompletten Plan mit Reiseroute, Sehenswürdigkeiten, Unterkünften, Restaurants, Ausflügen und Packliste",
    dest:"Reiseziel *",destPH:"Korsika, Brüssel, Kyoto…",dep:"Abfahrtsstadt",depPH:"Luxemburg, Paris, Brüssel…",
    dates:"Reisedaten",from:"ABREISE",to:"RÜCKKEHR",nights:"Nächte",orNights:"Oder wie viele Nächte wenn Daten unbekannt?",
    noDate:"Wähle zuerst Daten aus",
    howGet:"Wie komme ich hin",multiStep:"Mehrere Etappen möglich — z.B. 🚗 + ⛴️ Fähre",
    travelers:"Reisende",budget:"Budget *",globalBudget:"💵 Gesamtbudget angeben",globalBudgetPH:"Z.B. 3000€ für 2 Personen, 7 Nächte…",
    style:"Reisestil (mehrere Auswahl)",heberge:"Unterkunft *",localT:"Lokaler Transport",
    wishes:"Deine Wünsche & Bedürfnisse",musts:"Must-Sees / Träume",mustsPH:"Calanques, Strand Palombaggia…",
    avoid:"Zu vermeiden",avoidPH:"Nicht zu touristisch…",special:"Besondere Bedürfnisse",specialPH:"Vegetarisch, Allergie…",
    notes:"Weitere Informationen",notesPH:"Tauchenthusiast, Feinschmecker…",
    btn:"Meinen Urlaubsplan mit Sofia erstellen →",btnFile:"📎 Meine Notizen analysieren und Plan erstellen →",
    hint:"Reiseziel, Budget und Unterkunft sind erforderlich",hintFile:"Sofia analysiert dein Dokument für einen vollständigen Plan",
    other:"✏️ Andere",stayHome:"🏠 Ich schlafe zuhause",
    addCat:"Hinzufügen zu",myStuff:"🧳 Meine persönlichen Sachen",myStuffPH:"Kissen, Käse, Kaffee, Messer…",
    note:"Notiz hinzufügen",noteClose:"Schließen",
    chat:"Chat mit Sofia",chatSub:"Änderung anfragen → Plan aktualisiert",chatPH:"Bitte Sofia um eine Änderung…",
    months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
    days:["Mo","Di","Mi","Do","Fr","Sa","So"],
    loading:"Sofia bereitet dein Abenteuer vor…",loadingFile:"Sofia liest deine Notizen und bereitet dein Abenteuer vor…",
    chatSug:["Tag hinzufügen","Tag 2 ändern","Mehr Wanderungen","Günstigere Unterkunft","Vegetarische Version","Budget optimieren"],
    new:"← Neu",overTitle:"Generierung fehlgeschlagen",overSub:"Server überlastet. Warte 1-2 Minuten und versuche es erneut.",
    uploadTitle:"Teile deine Notizen mit Sofia",uploadSub:"Foto eines Notizbuchs, Artikels, Liste… Sofia liest alles und erstellt deine Reise.",
    uploadCTA:"Ziehen oder klicken",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"DATEI GELADEN",uploadHint:"Fülle das Formular aus oder lass Sofia alles ableiten.",
    langPick:"Sprache",
  },
  IT:{
    title:"Pianifica le tue vacanze perfette",sub:"Sofia crea il tuo piano completo con itinerario, imperdibili, alloggi, ristoranti, escursioni e lista bagagli",
    dest:"Destinazione *",destPH:"Corsica, Bruxelles, Kyoto…",dep:"Città di partenza",depPH:"Lussemburgo, Parigi, Bruxelles…",
    dates:"Date del viaggio",from:"PARTENZA",to:"RITORNO",nights:"notti",orNights:"O quante notti se le date sono sconosciute?",
    noDate:"Scegli prima le date",
    howGet:"Come arrivare",multiStep:"Più tappe possibili — es. 🚗 + ⛴️ Traghetto",
    travelers:"Viaggiatori",budget:"Budget *",globalBudget:"💵 Budget totale da specificare",globalBudgetPH:"Es. 3000€ per 2 persone, 7 notti…",
    style:"Stile di viaggio (più scelte)",heberge:"Alloggio *",localT:"Trasporto locale",
    wishes:"I tuoi desideri & bisogni",musts:"Imperdibili / Sogni",mustsPH:"Calanques, spiaggia Palombaggia…",
    avoid:"Da evitare",avoidPH:"Non troppo turistico…",special:"Esigenze speciali",specialPH:"Vegetariano, allergia…",
    notes:"Altre informazioni",notesPH:"Appassionato di immersioni, buongustaio…",
    btn:"Crea il mio piano vacanze con Sofia →",btnFile:"📎 Analizza i miei appunti e crea il mio piano →",
    hint:"Destinazione, Budget e Alloggio sono obbligatori",hintFile:"Sofia analizzerà il tuo documento per creare un piano completo",
    other:"✏️ Altro",stayHome:"🏠 Dormo a casa mia",
    addCat:"Aggiungi a",myStuff:"🧳 I miei oggetti personali",myStuffPH:"Cuscini, formaggi, caffè, coltelli…",
    note:"Aggiungi una nota",noteClose:"Chiudi",
    chat:"Chat con Sofia",chatSub:"Richiedi una modifica → piano aggiornato",chatPH:"Chiedi una modifica a Sofia…",
    months:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
    days:["Lu","Ma","Me","Gi","Ve","Sa","Do"],
    loading:"Sofia sta preparando la tua avventura…",loadingFile:"Sofia legge i tuoi appunti e prepara la tua avventura…",
    chatSug:["Aggiungi un giorno","Cambia giorno 2","Più escursioni","Alloggio meno caro","Versione vegetariana","Ottimizza budget"],
    new:"← Nuovo",overTitle:"Generazione fallita",overSub:"Server sovraccarichi. Aspetta 1-2 minuti e riprova.",
    uploadTitle:"Condividi i tuoi appunti con Sofia",uploadSub:"Foto di un taccuino, articolo, lista… Sofia legge tutto e crea il tuo viaggio.",
    uploadCTA:"Trascina o clicca per importare",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"FILE CARICATO",uploadHint:"Compila il modulo per affinare, o lascia che Sofia deduca tutto.",
    langPick:"Lingua",
  },
  ES:{
    title:"Planifica tus vacaciones perfectas",sub:"Sofia crea tu plan completo con itinerario, imprescindibles, alojamientos, restaurantes, salidas y lista de equipaje",
    dest:"Destino *",destPH:"Córcega, Bruselas, Kioto…",dep:"Ciudad de salida",depPH:"Luxemburgo, París, Bruselas…",
    dates:"Fechas del viaje",from:"SALIDA",to:"REGRESO",nights:"noches",orNights:"¿O cuántas noches si las fechas son desconocidas?",
    noDate:"Elige primero las fechas",
    howGet:"Cómo llegar",multiStep:"Varias etapas posibles — ej. 🚗 + ⛴️ Ferry",
    travelers:"Viajeros",budget:"Presupuesto *",globalBudget:"💵 Presupuesto total a especificar",globalBudgetPH:"Ej. 3000€ para 2 personas, 7 noches…",
    style:"Estilo de viaje (varias opciones)",heberge:"Alojamiento *",localT:"Transporte local",
    wishes:"Tus deseos & necesidades",musts:"Imprescindibles / Sueños",mustsPH:"Calanques, playa Palombaggia…",
    avoid:"A evitar",avoidPH:"No demasiado turístico…",special:"Necesidades especiales",specialPH:"Vegetariano, alergia…",
    notes:"Otra información",notesPH:"Aficionado al buceo, gastrónomo…",
    btn:"Crear mi plan de vacaciones con Sofia →",btnFile:"📎 Analizar mis notas y crear mi plan →",
    hint:"Destino, Presupuesto y Alojamiento son obligatorios",hintFile:"Sofia analizará tu documento para crear un plan completo",
    other:"✏️ Otro",stayHome:"🏠 Duermo en casa",
    addCat:"Añadir a",myStuff:"🧳 Mis objetos personales",myStuffPH:"Almohadas, quesos, café, cuchillos…",
    note:"Añadir una nota",noteClose:"Cerrar",
    chat:"Chat con Sofia",chatSub:"Solicita un cambio → plan actualizado",chatPH:"Pide un cambio a Sofia…",
    months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
    days:["Lu","Ma","Mi","Ju","Vi","Sá","Do"],
    loading:"Sofia está preparando tu aventura…",loadingFile:"Sofia lee tus notas y prepara tu aventura…",
    chatSug:["Añade un día","Cambia el día 2","Más senderismo","Alojamiento más barato","Versión vegetariana","Optimiza presupuesto"],
    new:"← Nuevo",overTitle:"Generación fallida",overSub:"Servidores sobrecargados. Espera 1-2 minutos e inténtalo de nuevo.",
    uploadTitle:"Comparte tus notas con Sofia",uploadSub:"Foto de un cuaderno, artículo, lista… Sofia lo lee todo y crea tu viaje.",
    uploadCTA:"Arrastra o haz clic para importar",uploadFmt:"JPG, PNG, PDF, TXT — máx. 15 MB",
    uploadLoaded:"ARCHIVO CARGADO",uploadHint:"Rellena el formulario para afinar, o deja que Sofia lo deduzca todo.",
    langPick:"Idioma",
  },
  PT:{
    title:"Planeia as tuas férias perfeitas",sub:"Sofia cria o teu plano completo com itinerário, imperdíveis, alojamentos, restaurantes, saídas e lista de bagagem",
    dest:"Destino *",destPH:"Córsega, Bruxelas, Quioto…",dep:"Cidade de partida",depPH:"Luxemburgo, Paris, Bruxelas…",
    dates:"Datas da viagem",from:"PARTIDA",to:"REGRESSO",nights:"noites",orNights:"Ou quantas noites se as datas forem desconhecidas?",
    noDate:"Escolhe primeiro as datas",
    howGet:"Como chegar",multiStep:"Várias etapas possíveis — ex. 🚗 + ⛴️ Ferry",
    travelers:"Viajantes",budget:"Orçamento *",globalBudget:"💵 Orçamento total a especificar",globalBudgetPH:"Ex. 3000€ para 2 pessoas, 7 noites…",
    style:"Estilo de viagem (várias escolhas)",heberge:"Alojamento *",localT:"Transporte local",
    wishes:"Os teus desejos & necessidades",musts:"Imperdíveis / Sonhos",mustsPH:"Calanques, praia Palombaggia…",
    avoid:"A evitar",avoidPH:"Não muito turístico…",special:"Necessidades especiais",specialPH:"Vegetariano, alergia…",
    notes:"Outras informações",notesPH:"Apaixonado por mergulho, gastrónomo…",
    btn:"Criar o meu plano de férias com Sofia →",btnFile:"📎 Analisar as minhas notas e criar o meu plano →",
    hint:"Destino, Orçamento e Alojamento são obrigatórios",hintFile:"Sofia analisará o teu documento para criar um plano completo",
    other:"✏️ Outro",stayHome:"🏠 Durmo em casa",
    addCat:"Adicionar a",myStuff:"🧳 Os meus objetos pessoais",myStuffPH:"Almofadas, queijos, café, facas…",
    note:"Adicionar uma nota",noteClose:"Fechar",
    chat:"Chat com Sofia",chatSub:"Pede uma alteração → plano atualizado",chatPH:"Pede uma alteração a Sofia…",
    months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    days:["Se","Te","Qu","Qu","Se","Sá","Do"],
    loading:"Sofia está a preparar a tua aventura…",loadingFile:"Sofia lê as tuas notas e prepara a tua aventura…",
    chatSug:["Adiciona um dia","Muda o dia 2","Mais caminhadas","Alojamento mais barato","Versão vegetariana","Otimiza orçamento"],
    new:"← Novo",overTitle:"Geração falhada",overSub:"Servidores sobrecarregados. Aguarda 1-2 minutos e tenta novamente.",
    uploadTitle:"Partilha as tuas notas com Sofia",uploadSub:"Foto de um caderno, artigo, lista… Sofia lê tudo e cria a tua viagem.",
    uploadCTA:"Arrasta ou clica para importar",uploadFmt:"JPG, PNG, PDF, TXT — máx. 15 MB",
    uploadLoaded:"FICHEIRO CARREGADO",uploadHint:"Preenche o formulário para afinar, ou deixa Sofia deduzir tudo.",
    langPick:"Língua",
  },
  LU:{
    title:"Planéier déng perfekt Vakanz",sub:"Sofia erstellt däin komplette Plan mat Reesroute, Musseen, Ënnerkonft, Restauranten, Ausflüg a Packlëscht",
    dest:"Destinatioun *",destPH:"Korsika, Bréissel, Kyoto…",dep:"Offahrtsstad",depPH:"Lëtzebuerg, Paräis, Bréissel…",
    dates:"Reesdaten",from:"OFFAHRT",to:"RÉCKKÉIER",nights:"Nuechten",orNights:"Oder wéivill Nuechten wann Datumer onbekannt?",
    noDate:"Wiel éischt d'Datumer",
    howGet:"Wéi kënns du dohinner",multiStep:"Méi Etappen méiglech — z.B. 🚗 + ⛴️ Fähr",
    travelers:"Reesend",budget:"Budget *",globalBudget:"💵 Gesamtbudget uginn",globalBudgetPH:"Z.B. 3000€ fir 2 Persounen, 7 Nuechten…",
    style:"Reestil (méi Auswiel)",heberge:"Ënnerkonft *",localT:"Lokalen Transport",
    wishes:"Deng Wënsch & Besoinen",musts:"Muss-Gesinn / Dréim",mustsPH:"Calanques, Strand Palombaggia…",
    avoid:"Ze vermeiden",avoidPH:"Net ze touristesch…",special:"Speziell Besoinen",specialPH:"Vegetaresch, Allergie…",
    notes:"Aner Informatiounen",notesPH:"Tauchen, Gastronomie…",
    btn:"Mäi Vakanzplan mat Sofia erstellen →",btnFile:"📎 Meng Notizen analyséieren a mäi Plan erstellen →",
    hint:"Destinatioun, Budget an Ënnerkonft si néideg",hintFile:"Sofia analyséiert däin Dokument fir e komplette Plan",
    other:"✏️ Aner",stayHome:"🏠 Ech schlof doheem",
    addCat:"Dobäisetzen zu",myStuff:"🧳 Meng perséinlech Saachen",myStuffPH:"Kessen, Käse, Kaffi, Messer…",
    note:"Notiz derbäisetzen",noteClose:"Zoumaachen",
    chat:"Chat mat Sofia",chatSub:"Ännerung froen → Plan aktualiséiert",chatPH:"Freet Sofia eng Ännerung…",
    months:["Januar","Februar","Mäerz","Abrëll","Mee","Juni","Juli","August","September","Oktober","November","Dezember"],
    days:["Mo","Di","Mi","Do","Fr","Sa","So"],
    loading:"Sofia preparéiert däin Abenteuer…",loadingFile:"Sofia liest deng Notizen a preparéiert däin Abenteuer…",
    chatSug:["Dag derbäisetzen","Dag 2 änneren","Méi Wanderungen","Méi bëllege Logement","Vegetaresch Versioun","Budget optimiséieren"],
    new:"← Nei",overTitle:"Generéierung fehlgeschloen",overSub:"Server iwwerlaascht. Waart 1-2 Minutten a probéier nach eng Kéier.",
    uploadTitle:"Deel deng Notizen mat Sofia",uploadSub:"Foto vun engem Notizbuch, Artikel, Lëscht… Sofia liest alles a erstellt deng Rees.",
    uploadCTA:"Schleefen oder klicken",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"FICHIER GELUEDEN",uploadHint:"Fëll de Formulaire aus fir ze verfeineren, oder looss Sofia alles ofleeden.",
    langPick:"Sprooch",
  },
  PL:{
    title:"Zaplanuj idealne wakacje",sub:"Sofia tworzy kompletny plan z trasą, atrakcjami, noclegami, restauracjami, wycieczkami i listą pakowania",
    dest:"Cel podróży *",destPH:"Korsyka, Bruksela, Kioto…",dep:"Miasto wyjazdu",depPH:"Luksemburg, Paryż, Bruksela…",
    dates:"Daty podróży",from:"WYJAZD",to:"POWRÓT",nights:"nocy",orNights:"Lub ile nocy, jeśli daty są nieznane?",
    noDate:"Najpierw wybierz daty",
    howGet:"Jak tam dotrzeć",multiStep:"Możliwe kilka etapów — np. 🚗 + ⛴️ Prom",
    travelers:"Podróżnicy",budget:"Budżet *",globalBudget:"💵 Łączny budżet do podania",globalBudgetPH:"Np. 3000€ dla 2 osób, 7 nocy…",
    style:"Styl podróży (wiele wyborów)",heberge:"Zakwaterowanie *",localT:"Transport lokalny",
    wishes:"Twoje życzenia i potrzeby",musts:"Must-see / Marzenia",mustsPH:"Kalanki, plaża Palombaggia…",
    avoid:"Do uniknięcia",avoidPH:"Nie za bardzo turystycznie…",special:"Specjalne potrzeby",specialPH:"Wegetarianin, alergia…",
    notes:"Inne informacje",notesPH:"Pasjonat nurkowania, smakosz…",
    btn:"Utwórz mój plan wakacyjny z Sofią →",btnFile:"📎 Analizuj moje notatki i utwórz plan →",
    hint:"Cel, Budżet i Zakwaterowanie są wymagane",hintFile:"Sofia przeanalizuje Twój dokument i stworzy kompletny plan",
    other:"✏️ Inne",stayHome:"🏠 Śpię w domu",
    addCat:"Dodaj do",myStuff:"🧳 Moje osobiste rzeczy",myStuffPH:"Poduszki, sery, kawa, noże…",
    note:"Dodaj notatkę",noteClose:"Zamknij",
    chat:"Czat z Sofią",chatSub:"Poproś o zmianę → plan zaktualizowany",chatPH:"Poproś Sofię o zmianę…",
    months:["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"],
    days:["Pn","Wt","Śr","Cz","Pt","So","Nd"],
    loading:"Sofia przygotowuje Twoją przygodę…",loadingFile:"Sofia czyta Twoje notatki i przygotowuje przygodę…",
    chatSug:["Dodaj dzień","Zmień dzień 2","Więcej wędrówek","Tańsze zakwaterowanie","Wersja wegetariańska","Optymalizuj budżet"],
    new:"← Nowy",overTitle:"Generowanie nie powiodło się",overSub:"Serwery są przeciążone. Poczekaj 1-2 minuty i spróbuj ponownie.",
    uploadTitle:"Podziel się notatkami z Sofią",uploadSub:"Zdjęcie notesu, artykułu, listy… Sofia czyta wszystko i tworzy podróż.",
    uploadCTA:"Przeciągnij lub kliknij, aby zaimportować",uploadFmt:"JPG, PNG, PDF, TXT — maks. 15 MB",
    uploadLoaded:"PLIK ZAŁADOWANY",uploadHint:"Wypełnij formularz, aby doprecyzować, lub pozwól Sofii wywnioskować wszystko.",
    langPick:"Język",
  },
  RO:{
    title:"Planifică-ți vacanța perfectă",sub:"Sofia creează planul tău complet cu itinerar, obiective, cazări, restaurante, excursii și lista de bagaje",
    dest:"Destinație *",destPH:"Corsica, Bruxelles, Kyoto…",dep:"Orașul de plecare",depPH:"Luxemburg, Paris, Bruxelles…",
    dates:"Datele călătoriei",from:"PLECARE",to:"ÎNTOARCERE",nights:"nopți",orNights:"Sau câte nopți dacă datele sunt necunoscute?",
    noDate:"Alege mai întâi datele",
    howGet:"Cum să ajungi acolo",multiStep:"Mai multe etape posibile — ex. 🚗 + ⛴️ Feribot",
    travelers:"Călători",budget:"Buget *",globalBudget:"💵 Buget total de specificat",globalBudgetPH:"Ex. 3000€ pentru 2 persoane, 7 nopți…",
    style:"Stil de călătorie (mai multe alegeri)",heberge:"Cazare *",localT:"Transport local",
    wishes:"Dorințele și nevoile tale",musts:"Must-see / Vise",mustsPH:"Calanques, plaja Palombaggia…",
    avoid:"De evitat",avoidPH:"Nu prea turistic…",special:"Nevoi speciale",specialPH:"Vegetarian, alergie…",
    notes:"Alte informații",notesPH:"Pasionat de scufundări, gurmand…",
    btn:"Creează planul meu de vacanță cu Sofia →",btnFile:"📎 Analizează notele mele și creează planul →",
    hint:"Destinația, Bugetul și Cazarea sunt obligatorii",hintFile:"Sofia va analiza documentul tău pentru a crea un plan complet",
    other:"✏️ Altele",stayHome:"🏠 Dorm acasă",
    addCat:"Adaugă în",myStuff:"🧳 Obiectele mele personale",myStuffPH:"Perne, brânzeturi, cafea, cuțite…",
    note:"Adaugă o notă",noteClose:"Închide",
    chat:"Chat cu Sofia",chatSub:"Solicită o modificare → plan actualizat",chatPH:"Cere o modificare Sofiei…",
    months:["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"],
    days:["Lu","Ma","Mi","Jo","Vi","Sâ","Du"],
    loading:"Sofia îți pregătește aventura…",loadingFile:"Sofia citește notele tale și pregătește aventura…",
    chatSug:["Adaugă o zi","Schimbă ziua 2","Mai multe drumeții","Cazare mai ieftină","Versiune vegetariană","Optimizează bugetul"],
    new:"← Nou",overTitle:"Generare eșuată",overSub:"Serverele sunt suprasolicitate. Așteaptă 1-2 minute și încearcă din nou.",
    uploadTitle:"Împărtășește notele cu Sofia",uploadSub:"Fotografie a unui caiet, articol, listă… Sofia citește totul și creează călătoria ta.",
    uploadCTA:"Trage sau fă clic pentru a importa",uploadFmt:"JPG, PNG, PDF, TXT — max. 15 MB",
    uploadLoaded:"FIȘIER ÎNCĂRCAT",uploadHint:"Completează formularul pentru a rafina, sau lasă Sofia să deducă totul.",
    langPick:"Limbă",
  },
  SV:{
    title:"Planera din perfekta semester",sub:"Sofia skapar din kompletta plan med resväg, sevärdheter, boenden, restauranger, utflykter och packlista",
    dest:"Destination *",destPH:"Korsika, Bryssel, Kyoto…",dep:"Avresestad",depPH:"Luxemburg, Paris, Bryssel…",
    dates:"Resdatum",from:"AVRESA",to:"ÅTERKOMST",nights:"nätter",orNights:"Eller hur många nätter om datumen är okända?",
    noDate:"Välj datum först",
    howGet:"Hur tar man sig dit",multiStep:"Flera etapper möjliga — t.ex. 🚗 + ⛴️ Färja",
    travelers:"Resenärer",budget:"Budget *",globalBudget:"💵 Totalbudget att ange",globalBudgetPH:"T.ex. 3000€ för 2 personer, 7 nätter…",
    style:"Resestil (flera val)",heberge:"Boende *",localT:"Lokaltransport",
    wishes:"Dina önskemål och behov",musts:"Måsten / Drömmar",mustsPH:"Calanques, stranden Palombaggia…",
    avoid:"Att undvika",avoidPH:"Inte för turistigt…",special:"Särskilda behov",specialPH:"Vegetarisk, allergi…",
    notes:"Annan information",notesPH:"Dykarentusiast, matälskare…",
    btn:"Skapa min semesterplan med Sofia →",btnFile:"📎 Analysera mina anteckningar och skapa plan →",
    hint:"Destination, Budget och Boende krävs",hintFile:"Sofia analyserar ditt dokument och skapar en komplett plan",
    other:"✏️ Annat",stayHome:"🏠 Jag sover hemma",
    addCat:"Lägg till i",myStuff:"🧳 Mina personliga saker",myStuffPH:"Kuddar, ostar, kaffe, knivar…",
    note:"Lägg till en anteckning",noteClose:"Stäng",
    chat:"Chatta med Sofia",chatSub:"Begär en ändring → plan uppdaterad",chatPH:"Be Sofia om en ändring…",
    months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],
    days:["Mån","Tis","Ons","Tor","Fre","Lör","Sön"],
    loading:"Sofia förbereder ditt äventyr…",loadingFile:"Sofia läser dina anteckningar och förbereder äventyret…",
    chatSug:["Lägg till en dag","Ändra dag 2","Fler vandringar","Billigare boende","Vegetarisk version","Optimera budget"],
    new:"← Ny",overTitle:"Generering misslyckades",overSub:"Servrarna är överbelastade. Vänta 1-2 minuter och försök igen.",
    uploadTitle:"Dela dina anteckningar med Sofia",uploadSub:"Foto av anteckningsbok, artikel, lista… Sofia läser allt och skapar din resa.",
    uploadCTA:"Dra eller klicka för att importera",uploadFmt:"JPG, PNG, PDF, TXT — max 15 MB",
    uploadLoaded:"FIL LADDAD",uploadHint:"Fyll i formuläret för att förfina, eller låt Sofia dra slutsatser från ditt dokument.",
    langPick:"Språk",
  },
  DA:{
    title:"Planlæg din perfekte ferie",sub:"Sofia opretter din komplette plan med rejserute, seværdigheder, overnatninger, restauranter, udflugter og pakkeliste",
    dest:"Destination *",destPH:"Korsika, Bruxelles, Kyoto…",dep:"Afgangsby",depPH:"Luxembourg, Paris, Bruxelles…",
    dates:"Rejsedatoer",from:"AFREJSE",to:"HJEMKOMST",nights:"nætter",orNights:"Eller hvor mange nætter hvis datoerne er ukendte?",
    noDate:"Vælg datoer først",
    howGet:"Hvordan kommer man derhen",multiStep:"Flere etaper mulige — f.eks. 🚗 + ⛴️ Færge",
    travelers:"Rejsende",budget:"Budget *",globalBudget:"💵 Samlet budget at angive",globalBudgetPH:"F.eks. 3000€ for 2 personer, 7 nætter…",
    style:"Rejsestil (flere valg)",heberge:"Overnatning *",localT:"Lokal transport",
    wishes:"Dine ønsker og behov",musts:"Must-sees / Drømme",mustsPH:"Calanques, stranden Palombaggia…",
    avoid:"At undgå",avoidPH:"Ikke for turistet…",special:"Særlige behov",specialPH:"Vegetar, allergi…",
    notes:"Andre oplysninger",notesPH:"Dykkerentusiast, madelsker…",
    btn:"Opret min ferieplan med Sofia →",btnFile:"📎 Analysér mine noter og opret plan →",
    hint:"Destination, Budget og Overnatning er påkrævet",hintFile:"Sofia analyserer dit dokument og opretter en komplet plan",
    other:"✏️ Andet",stayHome:"🏠 Jeg sover hjemme",
    addCat:"Tilføj til",myStuff:"🧳 Mine personlige ting",myStuffPH:"Puder, oste, kaffe, knive…",
    note:"Tilføj en note",noteClose:"Luk",
    chat:"Chat med Sofia",chatSub:"Anmod om en ændring → plan opdateret",chatPH:"Bed Sofia om en ændring…",
    months:["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"],
    days:["Man","Tir","Ons","Tor","Fre","Lør","Søn"],
    loading:"Sofia forbereder dit eventyr…",loadingFile:"Sofia læser dine noter og forbereder eventyret…",
    chatSug:["Tilføj en dag","Skift dag 2","Flere vandreture","Billigere overnatning","Vegetarisk version","Optimer budget"],
    new:"← Ny",overTitle:"Generering mislykkedes",overSub:"Serverne er overbelastede. Vent 1-2 minutter og prøv igen.",
    uploadTitle:"Del dine noter med Sofia",uploadSub:"Foto af notesbog, artikel, liste… Sofia læser det hele og opretter din rejse.",
    uploadCTA:"Træk eller klik for at importere",uploadFmt:"JPG, PNG, PDF, TXT — maks. 15 MB",
    uploadLoaded:"FIL INDLÆST",uploadHint:"Udfyld formularen for at præcisere, eller lad Sofia udlede alt fra dit dokument.",
    langPick:"Sprog",
  },
};

// Module-level tr fallback (used during SSR initialization)
const tr_default = T.FR;

// ─── Date Range Picker ─────────────────────────────────────
function DateRangePicker({dateStart,dateEnd,nuits,onDateStart,onDateEnd,onNuits,lang}){
  const tr=(T&&T[lang])?T[lang]:T.FR;
  const [curMonth,setCurMonth]=useState(()=>{
    const d=dateStart?new Date(dateStart):new Date();
    return new Date(d.getFullYear(),d.getMonth(),1);
  });
  const [hovered,setHovered]=useState(null);
  const today=new Date();today.setHours(0,0,0,0);
  const start=dateStart?new Date(dateStart):null;
  const end=dateEnd?new Date(dateEnd):null;
  if(start) start.setHours(0,0,0,0);
  if(end) end.setHours(0,0,0,0);
  const daysInMonth=new Date(curMonth.getFullYear(),curMonth.getMonth()+1,0).getDate();
  const firstDay=curMonth.getDay();
  const startOffset=(firstDay+6)%7; // Mon=0
  const handleDay=(day)=>{
    const clicked=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
    clicked.setHours(0,0,0,0);
    if(clicked<today) return;
    if(!start||(start&&end)){
      onDateStart(clicked.toISOString().split("T")[0]);
      onDateEnd("");
    } else {
      if(clicked<=start){
        onDateStart(clicked.toISOString().split("T")[0]);
        onDateEnd("");
      } else {
        const endStr=clicked.toISOString().split("T")[0];
        onDateEnd(endStr);
        const nights=Math.round((clicked-start)/(1000*60*60*24));
        onNuits(nights);
        setHovered(null);
      }
    }
  };
  const isStart=d=>start&&d.getTime()===start.getTime();
  const isEnd=d=>end&&d.getTime()===end.getTime();
  const inRange=d=>{
    const effEnd=end||(hovered?new Date(hovered):null);
    if(effEnd) effEnd.setHours?effEnd.setHours(0,0,0,0):null;
    return start&&effEnd&&d>start&&d<effEnd;
  };
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const navBtn=(dir)=>{
    setCurMonth(m=>new Date(m.getFullYear(),m.getMonth()+dir,1));
  };
  const fmt=d=>d?d.toLocaleDateString(lang==="EN"?"en-GB":lang==="NL"?"nl-NL":lang==="DE"?"de-DE":lang==="IT"?"it-IT":lang==="ES"?"es-ES":lang==="PT"?"pt-PT":lang==="LU"?"de-LU":"fr-FR",{day:"numeric",month:"long"}):"?";
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"16px",userSelect:"none"}}>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>navBtn(-1)} style={{background:"none",border:"1px solid "+C.parch,borderRadius:4,cursor:"pointer",padding:"4px 10px",fontSize:16,color:C.gold,lineHeight:1}}>‹</button>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>
          {tr.months[curMonth.getMonth()]} {curMonth.getFullYear()}
        </div>
        <button onClick={()=>navBtn(1)} style={{background:"none",border:"1px solid "+C.parch,borderRadius:4,cursor:"pointer",padding:"4px 10px",fontSize:16,color:C.gold,lineHeight:1}}>›</button>
      </div>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {tr.days.map(d=><div key={d} style={{textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:9,color:C.mist,padding:"4px 0"}}>{d}</div>)}
      </div>
      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const d=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);
          d.setHours(0,0,0,0);
          const iS=isStart(d);const iE=isEnd(d);const iR=inRange(d);
          const isPast=d<today;
          const isToday=d.getTime()===today.getTime();
          return(
            <button key={i}
              onClick={()=>handleDay(day)}
              onMouseEnter={()=>{if(start&&!end&&!isPast){const hd=new Date(curMonth.getFullYear(),curMonth.getMonth(),day);setHovered(hd.toISOString());}}}
              onMouseLeave={()=>setHovered(null)}
              style={{
                padding:"7px 0",textAlign:"center",border:"none",
                borderRadius:iS?"50% 0 0 50%":iE?"0 50% 50% 0":"4px",
                background:iS||iE?C.rust:iR?"#fde8e4":"transparent",
                color:iS||iE?"#fff":isPast?"#ccc":isToday?C.gold:C.ink,
                fontFamily:"'DM Sans',sans-serif",fontSize:12,
                cursor:isPast?"default":"pointer",
                fontWeight:iS||iE?700:isToday?600:400,
                outline:isToday&&!iS&&!iE?"2px solid "+C.gold:"none",
                outlineOffset:"1px",
              }}>
              {day}
            </button>
          );
        })}
      </div>
      {/* Summary */}
      <div style={{marginTop:12,padding:"10px 14px",background:C.cream,borderRadius:6,fontSize:13}}>
        {dateStart&&dateEnd?(
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{color:C.mist,fontSize:11}}>📅</span>
            <span style={{color:C.ink}}>{fmt(start)} → {fmt(end)}</span>
            <span style={{marginLeft:"auto",fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.gold,whiteSpace:"nowrap"}}>🌙 {nuits} {tr.nights}</span>
          </div>
        ):dateStart?(
          <div style={{color:C.mist,fontSize:12}}>📅 {fmt(start)} → <em style={{color:C.gold}}>{lang==="EN"?"Click return date":"Cliquez la date de retour"}</em></div>
        ):(
          <div style={{color:C.mist,fontSize:12,fontStyle:"italic"}}>{lang==="EN"?"Click departure date to start":"Cliquez la date de départ pour commencer"}</div>
        )}
      </div>
      {/* Manual nights fallback */}
      {!dateStart&&(
        <div style={{marginTop:10}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.mist,marginBottom:6}}>{tr.orNights}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>onNuits(Math.max(1,nuits-1))} style={{width:34,height:34,border:"1.5px solid "+C.parch,borderRadius:4,background:"#fff",fontSize:18,cursor:"pointer"}}>−</button>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.gold,minWidth:40,textAlign:"center"}}>{nuits}</span>
            <button onClick={()=>onNuits(Math.min(90,nuits+1))} style={{width:34,height:34,border:"1.5px solid "+C.parch,borderRadius:4,background:"#fff",fontSize:18,cursor:"pointer"}}>+</button>
            <span style={{fontSize:13,color:C.mist}}>{tr.nights}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getAdults(v,a){const val=v==="Autre"?(a||""):(v||"");if(val==="Solo")return 1;if(val.includes("2 adultes")||val.includes("Couple"))return 2;if(val.includes("Groupe"))return 4;return 2;}

// ─── Unsplash photo hook ────────────────────────────────────
function usePhoto(query){
  const fallback=`https://picsum.photos/seed/${enc2(query||"travel")}/800/400`;
  const [src,setSrc]=useState(fallback);
  useEffect(()=>{
    if(!query||!UNSPLASH_KEY) return;
    const cacheKey=query.substring(0,60);
    if(photoCache[cacheKey]){setSrc(photoCache[cacheKey]);return;}
    fetch(`https://api.unsplash.com/photos/random?query=${enc(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`)
      .then(r=>r.json())
      .then(d=>{if(d?.urls?.small){photoCache[cacheKey]=d.urls.small;setSrc(d.urls.small);}})
      .catch(()=>{});
  },[query]);
  return src;
}

function Photo({query,h=140}){
  const src=usePhoto(query);
  return(
    <div style={{height:h,overflow:"hidden",background:C.parch,flexShrink:0}}>
      <img src={src} alt={query||""} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
    </div>
  );
}

// HeroPhoto: separate component so usePhoto hook is called correctly (never conditionally)
function HeroPhoto({query}){
  const src=usePhoto(query);
  return(
    <img src={src} alt="" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:.55}} loading="lazy"/>
  );
}

// ─── Link builders ──────────────────────────────────────────
function buildLinks(type,dest,dateStart,dateEnd,voy,voyA,itemName=""){
  const adults=getAdults(voy,voyA);
  const cin=dateStart||"";const cout=dateEnd||"";
  const aid=TP_MARKER?`&aid=${TP_MARKER}`:"";
  const d=enc(dest);const it=enc(itemName||dest);
  switch(type){
    case "accommodations":return[
      {l:"Booking",c:"#003580",u:`https://www.booking.com/search.html?ss=${it}&checkin=${cin}&checkout=${cout}&group_adults=${adults}${aid}`},
      {l:"Airbnb",c:"#FF5A5F",u:`https://www.airbnb.fr/s/${enc(dest)}/homes?checkin=${cin}&checkout=${cout}&adults=${adults}&locale=fr`},
      {l:"Hotels.com",c:"#C00",u:`https://fr.hotels.com/search.do?q-destination=${it}&q-check-in=${cin}&q-check-out=${cout}&q-room-0-adults=${adults}`},
    ];
    case "restaurants":return[
      {l:"TripAdvisor",c:"#00AA6C",u:`https://www.tripadvisor.fr/Search?q=${enc(itemName||"restaurants")}+${d}`},
      {l:"TheFork",c:"#00B551",u:`https://www.thefork.fr/recherche?q=${it}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||"restaurant")}+${d}`},
    ];
    case "outings":return[
      {l:"AllTrails",c:"#3D6B35",u:`https://www.alltrails.com/explore?q=${it}&ref=header_search`},
      {l:"Visorando",c:"#5D8B3C",u:`https://www.visorando.com/recherche/?q=${it}`},
      {l:"GetYourGuide",c:"#FF6B35",u:`https://www.getyourguide.fr/s/?q=${it}&date_from=${cin}`},
      {l:"Viator",c:"#142A51",u:`https://www.viator.com/searchResults/all?text=${it}&startDate=${cin}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/${enc(itemName||"activité")}+${d}`},
    ];
    case "remarkable_sites":return[
      {l:"Office Tourisme",c:"#E84D3D",u:`https://www.google.com/search?q=office+tourisme+officiel+${d}`},
      {l:"Patrimoine UNESCO",c:"#009EDB",u:`https://www.google.com/search?q=UNESCO+patrimoine+mondial+${d}`},
      {l:"Google Maps",c:"#4285F4",u:`https://www.google.com/maps/search/sites+touristiques+${d}`},
    ];
    default:return[];
  }
}

function buildMapUrl(plan,dest){
  if(!plan||!dest||dest==="Voyage") return `https://www.google.com/maps/search/${enc(dest||"voyage")}`;
  const clean=loc=>{
    if(!loc) return null;
    const main=loc.split(',')[0].trim();
    if(!main||main.toLowerCase()==="voyage") return null;
    const d=dest.split(',')[0].trim();
    return main.toLowerCase().includes(d.toLowerCase())?main:`${main}, ${d}`;
  };
  const locs=(plan.days||[]).map(d=>clean(d.location)).filter(Boolean);
  if(!locs.length) return `https://www.google.com/maps/search/${enc(dest)}`;
  if(locs.length===1) return `https://www.google.com/maps/search/${enc(locs[0])}`;
  return `https://www.google.com/maps/dir/${locs.map(l=>enc(l)).join("/")}`;
}

// ─── Small UI components ────────────────────────────────────
function LinkBar({type,dest,dateStart,dateEnd,voy,voyA,itemName,itemWebsite}){
  const links=buildLinks(type,dest,dateStart,dateEnd,voy,voyA,itemName);
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
      {itemWebsite&&<a href={itemWebsite} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:C.ink,color:C.gold,borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🌐 Site officiel</a>}
      {links.map(l=><a key={l.l} href={l.u} target="_blank" rel="noopener noreferrer" style={{padding:"4px 10px",background:l.c,color:"#fff",borderRadius:3,fontSize:10,fontFamily:"'DM Mono',monospace"}}>🔗 {l.l}</a>)}
    </div>
  );
}

function NoteField({id}){
  const [open,setOpen]=useState(false);const [val,setVal]=useState("");
  return(
    <div style={{marginTop:8}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.mist}}>
        📝 {open?"Fermer":"Ajouter une note"}
      </button>
      {open&&<textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Tes notes…" style={{width:"100%",padding:"8px 10px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,resize:"none",outline:"none",minHeight:56,marginTop:4,boxSizing:"border-box"}}/>}
      {!open&&val&&<div style={{fontSize:11,color:C.mist,fontStyle:"italic",marginTop:4}}>📌 {val}</div>}
    </div>
  );
}

function Chip({label,bg=C.parch,color=C.ink}){
  return<span style={{display:"inline-block",padding:"3px 9px",borderRadius:100,background:bg,color,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>{label}</span>;
}

function DayCard({d,form,plan,setTab}){
  const photoQuery=d.unsplash_query||(d.location?`${d.location} ${form.destination} paysage`:form.destination+" paysage");
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQuery} h={160}/>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.ink,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,flexShrink:0}}>{d.num}</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{d.title}</div>
            {d.location&&<a href={`https://www.google.com/maps/search/${enc(d.location+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold,textTransform:"uppercase",marginTop:2,display:"block"}}>📍 {d.location} ↗</a>}
          </div>
        </div>
        {[["🌅 Matin",d.morning],["☀️ Après-midi",d.afternoon],["🌙 Soir",d.evening]].map(([lbl,val])=>val&&(
          <div key={lbl} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+C.cream}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:4}}>{lbl}</div>
            <div style={{fontSize:13,lineHeight:1.7,color:"#3a3830"}}>{val}</div>
          </div>
        ))}
        {d.tip&&<div style={{background:C.cream,border:"1px solid "+C.parch,borderRadius:4,padding:"8px 12px",fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:10}}>💡 {d.tip}</div>}
        {/* Link to relevant outings */}
        {plan?.outings?.length>0&&(
          <button onClick={()=>setTab("outings")} style={{background:"none",border:"1px solid "+C.forest,borderRadius:4,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:9,color:C.forest,letterSpacing:1}}>
            🎯 Voir les sorties & randonnées
          </button>
        )}
        <NoteField id={`day-${d.num}`}/>
      </div>
    </div>
  );
}

function OutingCard({item,i,form}){
  const isHike=item.type==="randonnée";
  const photoQuery=item.unsplash_query||(item.name?`${item.name} ${form.destination}`:`${form.destination} ${isHike?"randonnée":"activité"}`);
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQuery} h={120}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:18}}>{isHike?"🥾":"🎯"}</span>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>{item.name}</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {item.subtype&&<Chip label={item.subtype} bg={isHike?"#e8f5e9":"#e3f2fd"} color={isHike?"#2e7d32":"#1565c0"}/>}
          {item.difficulty&&<Chip label={item.difficulty} bg={item.difficulty==="Facile"?"#e8f5e9":item.difficulty==="Difficile"?"#fce4ec":"#fff3e0"} color={item.difficulty==="Facile"?"#2e7d32":item.difficulty==="Difficile"?"#c62828":"#e65100"}/>}
          {item.distance&&<Chip label={`📏 ${item.distance}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.duration&&<Chip label={`⏱️ ${item.duration}`} bg="#f2f7f2" color="#3D5A3E"/>}
          {item.price&&<Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist}/>}
        </div>
        {item.highlights&&<div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>👁️ {item.highlights}</div>}
        {item.start_point&&<div style={{fontSize:12,color:C.forest,marginBottom:3,fontWeight:600}}>🚩 Départ : {item.start_point}</div>}
        {item.transport_from_center&&<div style={{fontSize:12,color:C.forest,marginBottom:6}}>🚌 Accès : {item.transport_from_center}</div>}
        {(item.address)&&<a href={`https://www.google.com/maps/search/${enc(item.address+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:C.gold,marginBottom:6}}>📍 {item.address} ↗</a>}
        {item.info&&<div style={{fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:6}}>💡 {item.info}</div>}
        <LinkBar type="outings" dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website}/>
        <NoteField id={`outing-${i}`}/>
      </div>
    </div>
  );
}

function ItemCard({item,type,i,form}){
  const photoQuery=item.unsplash_query||(item.name?`${item.name} ${form.destination}`:`${form.destination} ${type==="accommodations"?"hôtel":type==="restaurants"?"restaurant":"tourisme"}`);
  const coordUrl=item.coords?`https://www.google.com/maps/search/?api=1&query=${item.coords[0]},${item.coords[1]}`:null;
  return(
    <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
      <Photo query={photoQuery} h={110}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:8}}>{item.name}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {item.label&&<Chip label={item.label} bg="#004A8F22" color="#004A8F"/>}
          {item.type&&<Chip label={item.type}/>}
          {item.cuisine&&<Chip label={item.cuisine} bg="#fff5f0" color="#8B2500"/>}
          {item.price&&<Chip label={`💰 ${item.price}`} bg={C.cream} color={C.mist}/>}
        </div>
        {(item.address||item.location)&&<a href={coordUrl||`https://www.google.com/maps/search/${enc((item.address||item.location)+", "+form.destination)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:12,color:C.gold,marginBottom:6}}>📍 {item.address||item.location} ↗</a>}
        {(item.why||item.description||item.specialty||item.info)&&<div style={{fontSize:13,lineHeight:1.65,color:"#4a4640",marginBottom:6}}>{item.why||item.description||item.specialty||item.info}</div>}
        {item.tip&&<div style={{fontSize:12,color:C.mist,fontStyle:"italic",marginBottom:6}}>💡 {item.tip}</div>}
        <LinkBar type={type} dest={form.destination} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre} itemName={item.name} itemWebsite={item.website}/>
        <NoteField id={`${type}-${i}`}/>
      </div>
    </div>
  );
}

function AgendaSection({agenda}){
  if(!agenda?.length) return<div style={{textAlign:"center",padding:40,color:C.mist,fontStyle:"italic"}}>Aucune info particulière aux dates de votre voyage.</div>;
  const cols={positive:{bg:"#e8f5e9",border:"#2e7d32",icon:"🎉"},negative:{bg:"#fce4ec",border:"#c62828",icon:"⚠️"},info:{bg:"#e3f2fd",border:"#1565c0",icon:"ℹ️"}};
  return(
    <div>
      {agenda.map((ev,i)=>{
        const col=cols[ev.type]||cols.info;
        return(
          <div key={i} style={{background:col.bg,border:`1.5px solid ${col.border}`,borderRadius:8,padding:"14px 16px",marginBottom:12,display:"flex",gap:12}}>
            <div style={{fontSize:20,flexShrink:0}}>{col.icon}</div>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700}}>{ev.name}</div>
                {ev.date&&<Chip label={ev.date} bg="rgba(0,0,0,.07)" color="#333"/>}
              </div>
              <div style={{fontSize:13,lineHeight:1.6,color:"#3a3830"}}>{ev.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Ma Valise with per-category custom items ───────────────
function PackingSection({packing}){
  const [catExtras,setCatExtras]=useState({});
  const [catInputs,setCatInputs]=useState({});
  const [myItems,setMyItems]=useState([]);
  const [newItem,setNewItem]=useState("");
  const [checked,setChecked]=useState({});
  const toggle=k=>setChecked(c=>({...c,[k]:!c[k]}));
  const addToCat=catName=>{
    const val=(catInputs[catName]||"").trim();
    if(!val) return;
    setCatExtras(prev=>({...prev,[catName]:[...(prev[catName]||[]),val]}));
    setCatInputs(prev=>({...prev,[catName]:""}));
  };
  const addMy=()=>{if(newItem.trim()){setMyItems(m=>[...m,newItem.trim()]);setNewItem("");}};
  const icons={"Documents":"📄","Santé":"💊","Vêtements":"👕","Technologie":"🔌","Divers":"📦"};

  return(
    <div>
      {(packing||[]).map((cat,ci)=>(
        <div key={ci} style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12}}>{icons[cat.category]||"📦"} {cat.category}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
            {(cat.items||[]).map((item,ii)=>{const k=`c${ci}-${ii}`;return(
              <label key={ii} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
                <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
              </label>
            );})}
            {(catExtras[cat.category]||[]).map((item,ei)=>{const k=`ce${ci}-${ei}`;return(
              <label key={`e${ei}`} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
                <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
              </label>
            );})}
          </div>
          {/* Per-category add */}
          <div style={{display:"flex",gap:6}}>
            <input value={catInputs[cat.category]||""} onChange={e=>setCatInputs(prev=>({...prev,[cat.category]:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&addToCat(cat.category)}
              placeholder={`Ajouter dans ${cat.category}…`}
              style={{flex:1,padding:"6px 10px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
            <button onClick={()=>addToCat(cat.category)} style={{padding:"6px 12px",background:C.parch,color:C.ink,border:"none",borderRadius:4,cursor:"pointer",fontSize:14,fontWeight:700}}>+</button>
          </div>
        </div>
      ))}
      {/* Personal items */}
      <div style={{background:"#fff",border:"1.5px solid "+C.gold,borderRadius:8,padding:"16px 18px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:12,color:C.gold}}>🧳 Mes affaires personnelles</div>
        {myItems.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {myItems.map((item,i)=>{const k=`my-${i}`;return(
            <label key={i} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0"}}>
              <input type="checkbox" checked={!!checked[k]} onChange={()=>toggle(k)} style={{width:16,height:16,accentColor:C.gold,flexShrink:0}}/>
              <span style={{fontSize:13,color:checked[k]?"#aaa":"#3a3830",textDecoration:checked[k]?"line-through":"none"}}>{item}</span>
            </label>
          );})}
        </div>}
        <div style={{display:"flex",gap:8}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMy()}
            placeholder="Coussins, fromages, café, couteaux, plaid…"
            style={{flex:1,padding:"8px 12px",border:"1.5px solid "+C.parch,borderRadius:4,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
          <button onClick={addMy} style={{padding:"8px 16px",background:C.gold,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── File Upload ────────────────────────────────────────────
function FileUpload({file,onFile,onClear}){
  const ref=useRef();const [drag,setDrag]=useState(false);
  const process=f=>{
    if(!f) return;
    const ok=['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain'];
    if(!ok.includes(f.type)){alert("Format non supporté. JPG, PNG, PDF ou TXT.");return;}
    if(f.size>15*1024*1024){alert("Fichier trop grand (max 15 Mo).");return;}
    if(f.type.startsWith('image/')){
      const img=new Image();const url=URL.createObjectURL(f);
      img.onload=()=>{
        const canvas=document.createElement('canvas');const MAX=1200;
        let w=img.width,h=img.height;
        if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
        canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        const comp=canvas.toDataURL('image/jpeg',0.85);
        onFile({name:f.name,type:'image/jpeg',data:comp.split(',')[1],preview:comp});
        URL.revokeObjectURL(url);
      };img.src=url;
    }else{
      const r=new FileReader();
      r.onload=e=>onFile({name:f.name,type:f.type,data:e.target.result.split(',')[1],preview:null});
      r.readAsDataURL(f);
    }
  };
  return(
    <div style={{marginBottom:28,paddingBottom:28,borderBottom:"1px solid "+C.parch}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:6}}>📎 Partage tes notes ou idées à Sofia</div>
      <div style={{fontSize:13,color:C.mist,marginBottom:12}}>Photo d'un carnet, d'un article, d'une liste… Sofia lit tout et crée ton voyage.</div>
      {!file?(
        <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files[0]);}}
          style={{border:`2px dashed ${drag?C.gold:C.parch}`,borderRadius:8,padding:"24px 20px",textAlign:"center",cursor:"pointer",background:drag?"#FDF8ED":C.cream}}>
          <div style={{fontSize:32,marginBottom:6}}>📸</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:4}}>Glisse ou clique pour importer</div>
          <div style={{fontSize:12,color:C.mist}}>JPG, PNG, PDF, TXT — max 15 Mo</div>
          <input ref={ref} type="file" accept="image/*,.pdf,.txt" style={{display:"none"}} onChange={e=>process(e.target.files[0])}/>
        </div>
      ):(
        <div style={{border:"1.5px solid "+C.gold,borderRadius:8,padding:"14px 16px",background:"#FDF8ED",display:"flex",gap:12,alignItems:"center"}}>
          {file.preview?<img src={file.preview} alt="preview" style={{width:56,height:56,objectFit:"cover",borderRadius:4,flexShrink:0}}/>
            :<div style={{width:56,height:56,background:C.parch,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📄</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,marginBottom:3}}>✅ FICHIER CHARGÉ</div>
            <div style={{fontSize:13,color:C.ink,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</div>
          </div>
          <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#aaa",flexShrink:0}}>×</button>
        </div>
      )}
      {file&&<div style={{marginTop:10,padding:"8px 14px",background:"#e3f2fd",border:"1px solid #1565c0",borderRadius:6,fontSize:12,color:"#1565c0"}}>ℹ️ <strong>Remplis le formulaire ci-dessous</strong> pour affiner, ou laisse Sofia tout déduire depuis ton document.</div>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function SofiaPlanner(){
  const [phase,setPhase]=useState("form");
  const [plan,setPlan]=useState(null);
  const [errors,setErrors]=useState({});
  const [msgs,setMsgs]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [tab,setTab]=useState("days");
  const [showMap,setShowMap]=useState(false);
  const [overloaded,setOverloaded]=useState(false);
  const [uploadedFile,setUploadedFile]=useState(null);
  const [lang,setLang]=useState("FR");
  const tr=(typeof T !== 'undefined' && T[lang]) ? T[lang] : T.FR;
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const [form,setForm]=useState({
    destination:"",depart:"",dateStart:"",dateEnd:"",nuits:7,
    voyageurs:"",voyageurs_autre:"",budget:"",budget_global:"",
    styles:[],style_autre:"",hebergement:"",hebergement_autre:"",
    transport:"",transport_autre:"",transport_to:[],transport_to_autre:"",
    special:"",musts:"",avoid:"",notes:""
  });
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleArr=(k,v)=>setF(k,form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const handleDate=(k,v)=>{
    setF(k,v);
    const start=k==="dateStart"?v:form.dateStart;
    const end=k==="dateEnd"?v:form.dateEnd;
    if(start&&end){
      const diff=Math.round((new Date(end)-new Date(start))/(1000*60*60*24));
      if(diff>0){setF("nuits",diff);setErrors(e=>({...e,dateEnd:undefined}));}
      else setErrors(e=>({...e,dateEnd:"La date de retour doit être après le départ"}));
    }
  };

  const validate=()=>{
    const e={};
    if(!uploadedFile&&!form.destination.trim()) e.destination="Destination obligatoire";
    if(!uploadedFile&&!form.budget) e.budget="Budget obligatoire";
    if(!uploadedFile&&!form.hebergement) e.hebergement="Hébergement obligatoire";
    if(form.dateStart&&form.dateEnd&&new Date(form.dateEnd)<=new Date(form.dateStart)) e.dateEnd="La date de retour doit être après le départ";
    setErrors(e);
    if(Object.keys(e).length>0) document.getElementById("field-"+Object.keys(e)[0])?.scrollIntoView({behavior:"smooth",block:"center"});
    return Object.keys(e).length===0;
  };

  const generate=async()=>{
    if(!validate()) return;
    setPhase("loading");setOverloaded(false);
    try{
      const body={formData:form.destination||form.budget?form:null,lang};
      if(uploadedFile){body.fileData=uploadedFile.data;body.fileType=uploadedFile.type;}
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(res.status===529||data.error==="OVERLOADED"){setPhase("form");setOverloaded(true);return;}
      if(!res.ok) throw new Error(data.error||"Erreur");
      if(data.type==="plan"){
        const p={...data.data,destination:form.destination||data.data.destination||"Voyage"};
        setPlan(p);setMsgs([{role:"assistant",content:data.data.intro||"Votre plan est prêt !"}]);setPhase("result");
      }else{setPhase("form");setOverloaded(true);}
    }catch(err){setPhase("form");setOverloaded(true);}
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad) return;
    const userMsg={role:"user",content:chatIn.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setChatIn("");setChatLoad(true);
    try{
      const res=await fetch("/api/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),currentPlan:plan,lang})});
      const data=await res.json();
      if(data.type==="plan"&&data.data?.days){
        setPlan({...data.data,destination:plan?.destination||form.destination||"Voyage"});
        setMsgs([...newMsgs,{role:"assistant",content:"✅ Plan mis à jour ! Consulte les onglets pour voir les changements. — Sofia 🌍"}]);
      }else if(data.type==="chat"&&data.reply){
        setMsgs([...newMsgs,{role:"assistant",content:data.reply}]);
      }else{
        setMsgs([...newMsgs,{role:"assistant",content:"Désolée, les serveurs sont surchargés en ce moment. Réessaie dans 1 minute ! — Sofia 🌍"}]);
      }
    }catch{setMsgs([...newMsgs,{role:"assistant",content:"Désolée, erreur de connexion. Réessaie ! — Sofia 🌍"}]);}
    setChatLoad(false);
  };

  const destDisplay=plan?.destination||form.destination||"";

  // Transport placeholder dynamique
  const transportPlaceholder=(()=>{
    const dest=form.destination||"la destination";
    const dep=form.depart||"Luxembourg";
    if((form.transport_to||[]).includes("⛴️ Ferry")) return `ex: ferry depuis ${dep.includes("uxembourg")||dep.includes("aris")?"Nice ou Toulon":dep} vers ${dest}`;
    if((form.transport_to||[]).includes("✈️ Avion")) return `ex: vol depuis ${dep}, escale éventuelle`;
    if((form.transport_to||[]).includes("🚄 Train")) return `ex: départ gare de ${dep}, correspondances`;
    if((form.transport_to||[]).includes("🚗 Ma voiture")) return `ex: itinéraire autoroute depuis ${dep}, durée estimée`;
    return "Précise les détails de ton trajet…";
  })();

  const openPDF=()=>{
    const win=window.open("","_blank");
    const dest=destDisplay;
    const rows=(arr,fn)=>(arr||[]).map(fn).join("");
    const heroQ=enc(dest+" city tourism");
    const dayH=rows(plan?.days,d=>`<div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #ddd;border-radius:8px;overflow:hidden"><img src="https://api.unsplash.com/photos/random?query=${enc((d.unsplash_query||d.location||dest)+" paysage")}&orientation=landscape&client_id=${UNSPLASH_KEY}" style="width:100%;height:160px;object-fit:cover;display:block" onerror="this.style.display='none'"/><div style="background:#1C1A14;color:#B8972E;padding:12px 16px;font-family:Georgia,serif;font-size:15px;font-weight:700">Jour ${d.num} — ${d.title||""}${d.location?` <span style='font-size:11px;color:#aaa'>📍 ${d.location}</span>`:""}</div><div style="padding:14px;font-size:12px;line-height:1.7;color:#333">${d.morning?`<p style="margin-bottom:6px"><b>🌅 Matin :</b> ${d.morning}</p>`:""}${d.afternoon?`<p style="margin-bottom:6px"><b>☀️ Après-midi :</b> ${d.afternoon}</p>`:""}${d.evening?`<p style="margin-bottom:6px"><b>🌙 Soir :</b> ${d.evening}</p>`:""}${d.tip?`<p style="color:#8A9E93;font-style:italic;margin-top:8px">💡 ${d.tip}</p>`:""}</div></div>`);
    const siteH=rows(plan?.remarkable_sites,s=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${s.name}</b>${s.label?` [${s.label}]`:""}<br><small style="color:#B8972E">📍 ${s.location||""}</small><br>${s.description||""}</div>`);
    const hotelH=rows(plan?.accommodations,h=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${h.name}</b> — ${h.type||""} — 📍 ${h.location||""} — 💰 ${h.price||""}<br><i>${h.why||""}</i>${h.website?`<br><a href="${h.website}">${h.website}</a>`:""}</div>`);
    const restoH=rows(plan?.restaurants,r=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${r.name}</b> — ${r.cuisine||""} — 💰 ${r.price||""}<br>📍 ${r.address||""}<br>⭐ ${r.specialty||""}</div>`);
    const outingH=rows(plan?.outings,o=>`<div style="margin-bottom:10px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>${o.type==="randonnée"?"🥾":"🎯"} ${o.name}</b> — ${o.subtype||""} — ⏱️${o.duration||""}${o.distance?" — 📏"+o.distance:""}<br>🚩 ${o.start_point||""}<br>${o.highlights||""}</div>`);
    const agendaH=rows(plan?.agenda,ev=>`<div style="margin-bottom:8px;padding:8px;border-left:3px solid ${ev.type==="positive"?"#2e7d32":ev.type==="negative"?"#c62828":"#1565c0"};background:${ev.type==="positive"?"#e8f5e9":ev.type==="negative"?"#fce4ec":"#e3f2fd"}"><b>${ev.type==="positive"?"🎉":ev.type==="negative"?"⚠️":"ℹ️"} ${ev.name}</b>${ev.date?" — "+ev.date:""}<br>${ev.description||""}</div>`);
    const tipsH=(plan?.tips||[]).map((t,i)=>`<p style="margin-bottom:6px"><b>${i+1}.</b> ${t}</p>`).join("");
    const b=plan?.budget||{};
    const budH=`<table style="width:100%;font-size:12px">${[["🏨 Hébergement",b.accommodation],["🍽️ Repas",b.meals],["🎯 Activités",b.activities],["🚗 Transport",b.transport]].map(([l,v])=>v?`<tr><td>${l}</td><td style="text-align:right;font-weight:600">${v}</td></tr>`:"").join("")}<tr style="font-weight:700;color:#C1440E"><td>TOTAL ESTIMÉ</td><td style="text-align:right">${b.total||"—"}</td></tr></table>`;
    const sec=(t,h)=>h?`<div style="page-break-before:always;padding:20px 0"><h2 style="font-family:Georgia,serif;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">${t}</h2>${h}</div>`:"";
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sofia — ${dest}</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#333}img{max-width:100%}@media print{body{margin:0;padding:20px}.np{display:none}}</style></head><body>
<div style="position:relative;background:#1C1A14;border-radius:8px;margin-bottom:24px;overflow:hidden;min-height:140px">
  <img src="https://api.unsplash.com/photos/random?query=${heroQ}&orientation=landscape&client_id=${UNSPLASH_KEY}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.4" onerror="this.style.display='none'"/>
  <div style="position:relative;z-index:1;padding:32px;text-align:center;color:#fff">
    <div style="font-size:10px;letter-spacing:4px;color:#B8972E">✦ ON THE ROAD AGAIN ✦</div>
    <h1 style="font-family:Georgia,serif;font-size:32px;margin:8px 0">${dest}</h1>
    <div style="font-size:11px;color:#aaa">${form.nuits} NUITS${form.dateStart?" · "+form.dateStart+" → "+form.dateEnd:""}</div>
  </div>
</div>
${plan?.intro?`<div style="background:#f0f7f4;border-left:4px solid #2C4A3E;padding:14px;margin-bottom:20px;font-style:italic;color:#2C4A3E">${plan.intro}</div>`:""}
${plan?.tourism_office?.website?`<div style="border:1.5px solid #B8972E;border-radius:6px;padding:12px 16px;margin-bottom:16px"><b>🏛️ ${plan.tourism_office.name||"Office de Tourisme"}</b>${plan.tourism_office.address?" — 📍 "+plan.tourism_office.address:""}<br><a href="${plan.tourism_office.website}" style="color:#B8972E">${plan.tourism_office.website}</a></div>`:""}
<div class="np" style="text-align:center;margin-bottom:20px"><a href="${buildMapUrl(plan,dest)}" target="_blank" style="display:inline-block;padding:10px 20px;background:#4285F4;color:#fff;border-radius:4px;text-decoration:none">🗺️ Voir l'itinéraire sur Google Maps</a></div>
<h2 style="font-family:Georgia,serif;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:16px">🗺️ Itinéraire</h2>${dayH}
${plan?.agenda?.length?sec("📅 À noter pour ton séjour",agendaH):""}
${sec("⭐ Incontournables",siteH)}${sec("🏨 Hébergements",hotelH)}${sec("🍽️ Restaurants",restoH)}${sec("🎯 Sorties & Activités",outingH)}
${plan?.tips?.length?sec("💡 Conseils pratiques",tipsH):""}${plan?.budget?sec("💰 Budget estimé",budH):""}
<div style="text-align:center;margin-top:32px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:16px">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString("fr-FR")}${TP_MARKER?" · Liens partenaires":""}</div>
<script>
window.onload=function(){
  var imgs=document.querySelectorAll('img');
  var loaded=0;
  if(!imgs.length){window.print();return;}
  imgs.forEach(function(img){
    if(img.complete){loaded++;if(loaded===imgs.length)window.print();}
    else{img.onload=img.onerror=function(){loaded++;if(loaded===imgs.length)window.print();};}
  });
  setTimeout(function(){window.print();},4000);
};
</script>
</body></html>`);
    win.document.close();
  };

  const TABS=[
    {k:"days",l:"🗺️ Itinéraire",n:plan?.days?.length},
    {k:"agenda",l:"📅 À noter",n:plan?.agenda?.length},
    {k:"sites",l:"⭐ Incontournables",n:plan?.remarkable_sites?.length},
    {k:"hotels",l:"🏨 Hébergements",n:plan?.accommodations?.length},
    {k:"restos",l:"🍽️ Restaurants",n:plan?.restaurants?.length},
    {k:"outings",l:"🎯 Sorties & Activités",n:plan?.outings?.length},
    {k:"tips",l:"💡 Conseils",n:plan?.tips?.length},
    {k:"budget",l:"💰 Budget",n:null},
    {k:"packing",l:"🧳 Ma Valise",n:null},
  ];

  const inp={width:"100%",padding:"11px 14px",border:"none",background:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.ink,outline:"none",boxSizing:"border-box"};
  const inpBox={border:"1.5px solid "+C.parch,borderRadius:6,background:C.cream,overflow:"hidden"};
  const lbl={display:"block",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:7};
  const secT=t=><div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:14}}>{t}</div>;

  return(
    <>
      <Head><title>Sofia Planner · On The Road Again</title></Head>
      <style>{`
        *{box-sizing:border-box}
        body{font-family:'DM Sans',sans-serif;background:#FAF6EE;color:#1C1A14;margin:0}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#FAF6EE}::-webkit-scrollbar-thumb{background:#EDE0C4;border-radius:2px}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fade{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes d{0%,80%,100%{opacity:.2}40%{opacity:1}}
        .date-box{display:flex;align-items:stretch;border:1.5px solid #EDE0C4;border-radius:6px;background:#FAF6EE;overflow:hidden}
        .date-box input[type=date]{flex:1;padding:4px 14px 10px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#1C1A14;outline:none;cursor:pointer;min-width:0}
        .date-box input[type=date]:focus{background:#FDF8ED}
        .date-sep{width:1px;background:#EDE0C4;flex-shrink:0}
        @media(max-width:768px){
          .result-layout{flex-direction:column!important;height:auto!important}
          .chat-panel{width:100%!important;height:360px!important;border-left:none!important;border-top:1px solid #EDE0C4!important}
          .fg2{grid-template-columns:1fr!important}
          .fg4{grid-template-columns:1fr 1fr!important}
        }
        @media print{.np{display:none!important}body{background:#fff!important}}
      `}</style>

      {/* HEADER */}
      <div className="np" style={{background:C.ink,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌍</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#FAF6EE"}}>Sofia <em style={{color:C.gold}}>Planner</em></div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#555"}}>On The Road Again</div>
        </div>
        {/* Language selector */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",margin:"0 8px"}}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>setLang(l.code)}
              title={l.name}
              style={{padding:"3px 6px",border:"1.5px solid",borderRadius:4,background:lang===l.code?C.gold:"transparent",borderColor:lang===l.code?C.gold:"#333",color:"#fff",fontSize:13,cursor:"pointer",lineHeight:1}}>
              {l.flag}
            </button>
          ))}
        </div>
        {phase==="result"&&(
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={openPDF} style={{padding:"8px 12px",background:C.gold,color:"#fff",border:"none",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>📄 PDF</button>
            <button onClick={()=>setShowMap(m=>!m)} style={{padding:"8px 12px",background:showMap?C.rust:"transparent",color:showMap?"#fff":"#888",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer"}}>🗺️ Carte</button>
            <button onClick={()=>{setPhase("form");setPlan(null);setMsgs([]);}} style={{padding:"8px 12px",background:"transparent",color:"#666",border:"1px solid #333",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer"}}>← Nouveau</button>
          </div>
        )}
      </div>

      {/* ══ FORM ══ */}
      {phase==="form"&&(
        <div style={{maxWidth:760,margin:"0 auto",padding:"24px 16px 80px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:44,marginBottom:10}}>🌍</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,5vw,44px)",fontWeight:900,lineHeight:1.1}}>Planifie tes <em style={{color:C.rust}}>vacances parfaites</em></h1>
            <p style={{color:C.mist,fontSize:14,marginTop:10,maxWidth:480,margin:"10px auto 0"}}>Sofia crée ton plan complet avec itinéraire, incontournables, hébergements, restaurants, sorties et valise</p>
          </div>

          {overloaded&&(
            <div style={{background:"#fff3cd",border:"1.5px solid "+C.gold,borderRadius:6,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20,flexShrink:0}}>⏳</span>
              <div style={{flex:1}}><div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,marginBottom:2}}>Génération échouée</div><div style={{fontSize:13,color:"#666"}}>Les serveurs sont surchargés. Attends 1-2 minutes et réessaie.</div></div>
              <button onClick={()=>setOverloaded(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#aaa"}}>×</button>
            </div>
          )}

          <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"24px 20px",boxShadow:"5px 5px 0 "+C.parch}}>
            <FileUpload file={uploadedFile} onFile={setUploadedFile} onClear={()=>setUploadedFile(null)}/>

            {/* Destination & dates */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("📍 Destination & dates")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div id="field-destination">
                  <span style={lbl}>Destination {!uploadedFile&&"*"}</span>
                  <div style={{...inpBox,borderColor:errors.destination?"#C1440E":C.parch}}><input style={inp} value={form.destination} onChange={e=>setF("destination",e.target.value)} placeholder="Corse, Bruxelles, Kyoto…"/></div>
                  {errors.destination&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.destination}</div>}
                </div>
                <div><span style={lbl}>Ville de départ</span><div style={inpBox}><input style={inp} value={form.depart} onChange={e=>setF("depart",e.target.value)} placeholder="Luxembourg, Paris, Bruxelles…"/></div></div>
              </div>
              {/* Date Range Picker */}
              <div>
                <span style={lbl}>📅 {tr.dates}</span>
                <DateRangePicker
                  dateStart={form.dateStart} dateEnd={form.dateEnd} nuits={form.nuits}
                  onDateStart={v=>handleDate("dateStart",v)}
                  onDateEnd={v=>handleDate("dateEnd",v)}
                  onNuits={v=>setF("nuits",v)}
                  lang={lang}
                />
                {errors.dateEnd&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.dateEnd}</div>}
              </div>
            </div>

            {/* Transport aller - multi-select */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("✈️ Comment vous y rendre")}
              <div style={{fontSize:12,color:C.mist,marginBottom:10}}>Plusieurs étapes possibles — ex : 🚗 + ⛴️ Ferry</div>
              <div className="fg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:8}}>
                {TRANSPORT_TO.map(t=><button key={t} onClick={()=>toggleArr("transport_to",t)} style={{...pillBtn(form.transport_to.includes(t),C.navy),borderRadius:4,textAlign:"center",padding:"9px 6px",fontSize:11}}>{t}</button>)}
              </div>
              {form.transport_to.length>0&&<div style={{padding:"8px 12px",background:C.navy+"11",border:"1px solid "+C.navy,borderRadius:4,marginBottom:8,fontSize:12,color:C.navy,fontWeight:600}}>🛣️ {form.transport_to.join(" → ")}</div>}
              <div style={inpBox}><input style={inp} value={form.transport_to_autre} onChange={e=>setF("transport_to_autre",e.target.value)} placeholder={transportPlaceholder}/></div>
            </div>

            {/* Voyageurs & budget */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("👥 Voyageurs & budget")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-voyageurs">
                  <span style={lbl}>Voyageurs</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOYAGEURS.map(v=><button key={v} onClick={()=>setF("voyageurs",v)} style={selBtn(form.voyageurs===v,"#3D5A3E")}>{v}</button>)}
                    {form.voyageurs==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.voyageurs_autre} onChange={e=>setF("voyageurs_autre",e.target.value)} placeholder="Ex: 3 adultes + 2 enfants…"/></div>
                    :<button onClick={()=>setF("voyageurs","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
                <div id="field-budget">
                  <span style={lbl}>Budget {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {BUDGETS.map(b=><button key={b} onClick={()=>setF("budget",b)} style={{...selBtn(form.budget===b,"#8B2500"),borderColor:form.budget===b?"#8B2500":errors.budget?"#C1440E":C.parch}}>{b}</button>)}
                    {form.budget==="Budget global"?<div style={inpBox}><input autoFocus style={inp} value={form.budget_global} onChange={e=>setF("budget_global",e.target.value)} placeholder="Ex: 3000€ pour 2 pers., 7 nuits…"/></div>
                    :<button onClick={()=>setF("budget","Budget global")} style={{...selBtn(false),borderColor:errors.budget?"#C1440E":C.parch}}>💵 Budget global à préciser</button>}
                  </div>
                  {errors.budget&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.budget}</div>}
                </div>
              </div>
            </div>

            {/* Style & hébergement */}
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+C.parch}}>
              {secT("🎯 Style & hébergement")}
              <div style={{marginBottom:14}}>
                <span style={lbl}>Style de voyage (plusieurs choix)</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {STYLES_LIST.map(s=><button key={s} onClick={()=>toggleArr("styles",s)} style={pillBtn(form.styles.includes(s),"#4A3560")}>{s}</button>)}
                  {form.styles.includes("Autre")?<div style={{...inpBox,flex:1,minWidth:160}}><input autoFocus style={{...inp,padding:"7px 12px"}} value={form.style_autre} onChange={e=>setF("style_autre",e.target.value)} placeholder="Précise…"/></div>
                  :<button onClick={()=>toggleArr("styles","Autre")} style={pillBtn(false)}>✏️ Autre</button>}
                </div>
              </div>
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div id="field-hebergement">
                  <span style={lbl}>Hébergement {!uploadedFile&&"*"}</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {HEBERGEMENTS.map(h=><button key={h} onClick={()=>setF("hebergement",h)} style={{...selBtn(form.hebergement===h,C.forest),borderColor:form.hebergement===h?C.forest:errors.hebergement?"#C1440E":C.parch}}>{h}</button>)}
                    {form.hebergement==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.hebergement_autre} onChange={e=>setF("hebergement_autre",e.target.value)} placeholder="Précise…"/></div>
                    :<button onClick={()=>setF("hebergement","Autre")} style={{...selBtn(false),borderColor:errors.hebergement?"#C1440E":C.parch}}>✏️ Autre</button>}
                  </div>
                  {errors.hebergement&&<div style={{fontSize:11,color:C.rust,marginTop:4}}>⚠️ {errors.hebergement}</div>}
                </div>
                <div>
                  <span style={lbl}>Transport sur place</span>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {TRANSPORTS_LOCAL.map(t=><button key={t} onClick={()=>setF("transport",t)} style={selBtn(form.transport===t,C.navy)}>{t}</button>)}
                    {form.transport==="Autre"?<div style={inpBox}><input autoFocus style={inp} value={form.transport_autre} onChange={e=>setF("transport_autre",e.target.value)} placeholder="Précise…"/></div>
                    :<button onClick={()=>setF("transport","Autre")} style={selBtn(false)}>✏️ Autre</button>}
                  </div>
                </div>
              </div>
            </div>

            {/* Envies */}
            <div style={{marginBottom:24}}>
              {secT("✨ Tes envies & besoins")}
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><span style={lbl}>Incontournables / Rêves</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.musts} onChange={e=>setF("musts",e.target.value)} placeholder="Calanques, Sentier du Douanier, plage Palombaggia…"/></div></div>
                <div><span style={lbl}>À éviter</span><div style={inpBox}><textarea style={{...inp,height:80,resize:"none",padding:"10px 14px"}} value={form.avoid} onChange={e=>setF("avoid",e.target.value)} placeholder="Pas trop touristique, éviter la haute saison…"/></div></div>
                <div><span style={lbl}>Besoins spéciaux</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.special} onChange={e=>setF("special",e.target.value)} placeholder="Végétarien, allergie, mobilité réduite, bébé…"/></div></div>
                <div><span style={lbl}>Autres informations</span><div style={inpBox}><textarea style={{...inp,height:70,resize:"none",padding:"10px 14px"}} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Passionné de plongée, fan de gastronomie locale…"/></div></div>
              </div>
            </div>

            <button onClick={generate} style={{width:"100%",padding:"16px",background:C.rust,color:"#fff",border:"none",borderRadius:6,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:19,cursor:"pointer"}}>
              {uploadedFile?tr.btnFile:tr.btn}
            </button>
            <div style={{textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#bbb",letterSpacing:1}}>
              ⓘ {uploadedFile?tr.hintFile:tr.hint}
            </div>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading"&&(
        <div style={{textAlign:"center",padding:"100px 24px"}}>
          <div style={{fontSize:52,display:"inline-block",animation:"sp 2s linear infinite"}}>🧭</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",marginTop:18}}>
            {uploadedFile?tr.loadingFile:tr.loading}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {["🗺️ Itinéraire","📅 Agenda","⭐ Incontournables","🏨 Hébergements","🍽️ Restos","🎯 Sorties","🧳 Valise"].map((t,i)=>(
              <span key={t} style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,color:C.gold,animation:`fade 2s ${i*0.2}s infinite`}}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result"&&plan&&(
        <div className="result-layout" style={{display:"flex",height:"calc(100vh - 60px)"}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>

            {/* Hero */}
            <div style={{position:"relative",height:200,overflow:"hidden",background:C.ink,flexShrink:0}}>
              <HeroPhoto query={destDisplay ? `${destDisplay} ville paysage panoramique` : "travel landscape"}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:4,color:C.gold,marginBottom:8}}>✦ On The Road Again ✦</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,40px)",fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.6)"}}>{destDisplay}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,color:"#EDE0C4",marginTop:10}}>
                  {form.nuits} NUITS{form.voyageurs?` · ${(form.voyageurs==="Autre"?form.voyageurs_autre:form.voyageurs).toUpperCase()}`:""}
                </div>
                {form.dateStart&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)",marginTop:4}}>{form.dateStart} → {form.dateEnd}</div>}
              </div>
            </div>

            {/* Map */}
            {showMap&&(
              <div style={{flexShrink:0,borderBottom:"1px solid "+C.parch}}>
                <div style={{background:C.ink,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold}}>🗺️ {destDisplay}</span>
                  <a href={buildMapUrl(plan,destDisplay)} target="_blank" rel="noopener noreferrer"
                    style={{padding:"4px 10px",background:"#4285F4",color:"#fff",borderRadius:3,fontFamily:"'DM Mono',monospace",fontSize:8}}>
                    Ouvrir dans Maps ↗
                  </a>
                </div>
                <iframe src={`https://maps.google.com/maps?q=${enc(destDisplay)}&output=embed&z=12`} width="100%" height="260" style={{border:"none",display:"block"}} loading="lazy" title="Carte"/>
              </div>
            )}

            {plan.intro&&(
              <div style={{padding:"14px 18px",background:"#f0f7f4",borderBottom:"1px solid "+C.parch,display:"flex",gap:10,flexShrink:0}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div style={{fontSize:13,lineHeight:1.65,color:C.forest,fontStyle:"italic"}}>{plan.intro}</div>
              </div>
            )}

            {/* Tabs */}
            <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid "+C.parch,background:"#fff",flexShrink:0}}>
              {TABS.map(t=>(
                <button key={t.k} onClick={()=>setTab(t.k)}
                  style={{padding:"10px 10px",border:"none",borderBottom:`2px solid ${tab===t.k?C.rust:"transparent"}`,background:"transparent",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:tab===t.k?C.rust:"#888",whiteSpace:"nowrap",flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
                  {t.l}{t.n>0&&<span style={{background:C.parch,color:"#888",borderRadius:10,padding:"1px 5px",fontSize:8}}>{t.n}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              <div style={{maxWidth:720,margin:"0 auto"}}>
                {tab==="days"&&(plan.days||[]).map((d,i)=><DayCard key={i} d={d} form={{...form,destination:destDisplay}} plan={plan} setTab={setTab}/>)}
                {tab==="agenda"&&<AgendaSection agenda={plan.agenda}/>}
                {tab==="sites"&&(<>
                  {plan.tourism_office?.website&&(
                    <div style={{background:"#fff",border:"1.5px solid "+C.gold,borderRadius:8,padding:"16px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{fontSize:28,flexShrink:0}}>🏛️</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:4}}>Office de Tourisme officiel</div>
                        <div style={{fontSize:13,color:"#4a4640",marginBottom:6}}>{plan.tourism_office.name}</div>
                        {plan.tourism_office.address&&<div style={{fontSize:12,color:C.mist,marginBottom:4}}>📍 {plan.tourism_office.address}</div>}
                        {plan.tourism_office.phone&&<div style={{fontSize:12,color:C.mist,marginBottom:6}}>📞 {plan.tourism_office.phone}</div>}
                        <a href={plan.tourism_office.website} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"7px 14px",background:C.gold,color:"#fff",borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1}}>🌐 Site officiel</a>
                      </div>
                    </div>
                  )}
                  <LinkBar type="remarkable_sites" dest={destDisplay} dateStart={form.dateStart} dateEnd={form.dateEnd} voy={form.voyageurs} voyA={form.voyageurs_autre}/>
                  <div style={{height:12}}/>
                  {(plan.remarkable_sites||[]).map((s,i)=><ItemCard key={i} item={s} type="remarkable_sites" i={i} form={{...form,destination:destDisplay}}/>)}
                </>)}
                {tab==="hotels"&&(plan.accommodations||[]).map((h,i)=><ItemCard key={i} item={h} type="accommodations" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="restos"&&(plan.restaurants||[]).map((r,i)=><ItemCard key={i} item={r} type="restaurants" i={i} form={{...form,destination:destDisplay}}/>)}
                {tab==="outings"&&(
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                      {["Tout","🥾 Randonnées","🎯 Activités"].map(f=>(
                        <button key={f} style={{padding:"6px 14px",border:"1.5px solid "+C.parch,borderRadius:100,background:"#fff",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer",color:C.ink}}>{f}</button>
                      ))}
                    </div>
                    {(plan.outings||[]).map((o,i)=><OutingCard key={i} item={o} i={i} form={{...form,destination:destDisplay}}/>)}
                  </>
                )}
                {tab==="tips"&&(
                  <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💡 Conseils pratiques</div>
                    {(plan.tips||[]).map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(plan.tips||[]).length-1?"1px solid "+C.parch:"none"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:C.gold,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:13,lineHeight:1.7,color:"#4a4640"}}>{t}</div>
                      </div>
                    ))}
                  </div>
                )}
                {tab==="budget"&&plan.budget&&(
                  <div style={{background:"#fff",border:"1.5px solid "+C.parch,borderRadius:8,padding:"20px 24px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:16}}>💰 Budget estimé</div>
                    {[["🏨 Hébergement",plan.budget.accommodation],["🍽️ Repas",plan.budget.meals],["🎯 Activités",plan.budget.activities],["🚗 Transport",plan.budget.transport]].map(([l,v])=>v&&(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+C.parch}}>
                        <span style={{fontSize:14,color:"#4a4640"}}>{l}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0"}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>TOTAL ESTIMÉ</span>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:C.rust}}>{plan.budget.total}</span>
                    </div>
                    <NoteField id="budget-note"/>
                  </div>
                )}
                {tab==="packing"&&<PackingSection packing={plan.packing_essentials}/>}
              </div>
            </div>

            <div style={{textAlign:"center",padding:10,borderTop:"1px solid "+C.parch,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#aaa",flexShrink:0}}>
              Sofia Planner · On The Road Again{TP_MARKER?" · Liens partenaires":""}
            </div>
          </div>

          {/* CHAT */}
          <div className="chat-panel" style={{width:320,display:"flex",flexDirection:"column",background:"#fff",borderLeft:"1px solid "+C.parch,flexShrink:0}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid "+C.parch,background:C.cream,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🌍</div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:C.gold}}>Chat avec Sofia</div>
                  <div style={{fontSize:10,color:"#aaa",marginTop:1}}>Demande un changement → plan mis à jour</div>
                </div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginRight:7,flexShrink:0,marginTop:2}}>🌍</div>}
                    <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?C.rust:C.cream,color:m.role==="user"?"#fff":C.ink,fontSize:12,lineHeight:1.6,border:m.role==="assistant"?"1px solid "+C.parch:"none"}}>
                      {m.content.split("\n").map((l,j)=><span key={j}>{l}{j<m.content.split("\n").length-1&&<br/>}</span>)}
                    </div>
                  </div>
                ))}
                {chatLoad&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#B8972E,#C1440E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🌍</div>
                    <div style={{padding:"9px 14px",background:C.cream,border:"1px solid "+C.parch,borderRadius:"14px 14px 14px 3px"}}>
                      {[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:C.gold,margin:"0 2px",animation:`d 1.2s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>
            <div style={{borderTop:"1px solid "+C.parch,padding:"10px 12px",flexShrink:0}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {tr.chatSug.map(s=>(
                  <button key={s} onClick={()=>setChatIn(s)} style={{padding:"4px 8px",background:C.cream,border:"1px solid "+C.parch,borderRadius:12,fontFamily:"'DM Mono',monospace",fontSize:8,cursor:"pointer",color:"#888"}}>{s}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder={tr.chatPH} disabled={chatLoad}
                  style={{flex:1,padding:"9px 13px",border:"1.5px solid "+C.parch,borderRadius:20,background:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.ink,outline:"none"}}/>
                <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad}
                  style={{padding:"9px 14px",background:chatIn.trim()&&!chatLoad?C.rust:"#ccc",color:"#fff",border:"none",borderRadius:20,cursor:chatIn.trim()&&!chatLoad?"pointer":"not-allowed",fontSize:15,flexShrink:0}}>➤</button>
              </div>
              <div style={{textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:7,color:"#ccc",letterSpacing:2}}>SOFIA · ON THE ROAD AGAIN</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
