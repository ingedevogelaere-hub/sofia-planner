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
    btn:"Crée mon plan vacances avec Sofia →",btnFile:"📎 Analyse mes notes et crée mon plan →",
    hint:"Destination, Budget et Hébergement sont nécessaires",hintFile:"Sofia analysera ton document pour créer un plan complet",
    other:"✏️ Autre",stayHome:"🏠 Je dors chez moi",
    addCat:"Ajouter dans",myStuff:"🧳 Mes affaires personnelles",myStuffPH:"Coussins, fromages, café, couteaux…",
    note:"Ajouter une note",noteClose:"Fermer",
    chat:"Chat avec Sofia",chatSub:"Demande un changement → plan mis à jour",chatPH:"Demande une modification à Sofia…",
    months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    days:["Lu","Ma","Me","Je","Ve","Sa","Di"],
    loading:"Sofia prépare ton aventure…",loadingFile:"Sofia lit tes notes et prépare ton aventure…",
    chatSug:["Ajouter un jour","Modifier le jour 2","Plus de randonnées","Hébergement moins cher","Version végétarienne","Optimiser le budget"],
    new:"← Nouveau",overTitle:"Génération échouée",overSub:"Les serveurs sont surchargés. Attends 1-2 minutes et réessaie.",
    uploadTitle:"Partage tes notes ou idées avec Sofia",uploadSub:"Photo d'un carnet, article, liste… Sofia lit tout et crée ton voyage.",
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
