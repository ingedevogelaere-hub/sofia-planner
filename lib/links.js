import { enc, getAdults, TP_MARKER } from "./constants";

export function buildLinks(type, dest, dateStart, dateEnd, voy, voyA, itemName = "") {
  const adults = getAdults(voy, voyA);
  const cin = dateStart || "";
  const cout = dateEnd || "";
  const aid = TP_MARKER ? `&aid=${TP_MARKER}` : "";
  const d = enc(dest);
  const it = enc(itemName || dest);

  switch (type) {
    case "accommodations":
      return [
        { l: "Booking",   c: "#003580", u: `https://www.booking.com/search.html?ss=${it}&checkin=${cin}&checkout=${cout}&group_adults=${adults}${aid}` },
        { l: "Airbnb",    c: "#FF5A5F", u: `https://www.airbnb.fr/s/${enc(dest)}/homes?checkin=${cin}&checkout=${cout}&adults=${adults}&locale=fr` },
        { l: "Hotels.com",c: "#C00",    u: `https://fr.hotels.com/search.do?q-destination=${it}&q-check-in=${cin}&q-check-out=${cout}&q-room-0-adults=${adults}` },
      ];
    case "restaurants":
      return [
        { l: "TripAdvisor", c: "#00AA6C", u: `https://www.tripadvisor.fr/Search?q=${enc(itemName || "restaurants")}+${d}` },
        { l: "TheFork",     c: "#00B551", u: `https://www.thefork.fr/recherche?q=${it}` },
        { l: "Google Maps", c: "#4285F4", u: `https://www.google.com/maps/search/${enc(itemName || "restaurant")}+${d}` },
      ];
    case "outings":
      return [
        { l: "AllTrails",   c: "#3D6B35", u: `https://www.alltrails.com/explore?q=${it}` },
        { l: "Visorando",   c: "#5D8B3C", u: `https://www.visorando.com/recherche/?q=${it}` },
        { l: "GetYourGuide",c: "#FF6B35", u: `https://www.getyourguide.fr/s/?q=${it}&date_from=${cin}` },
        { l: "Viator",      c: "#142A51", u: `https://www.viator.com/searchResults/all?text=${it}&startDate=${cin}` },
        { l: "Google Maps", c: "#4285F4", u: `https://www.google.com/maps/search/${enc(itemName || "activité")}+${d}` },
      ];
    case "remarkable_sites":
      return [
        { l: "Office Tourisme",   c: "#E84D3D", u: `https://www.google.com/search?q=office+tourisme+officiel+${d}` },
        { l: "Patrimoine UNESCO", c: "#009EDB", u: `https://www.google.com/search?q=UNESCO+patrimoine+mondial+${d}` },
        { l: "Google Maps",       c: "#4285F4", u: `https://www.google.com/maps/search/sites+touristiques+${d}` },
      ];
    default:
      return [];
  }
}

export function buildMapUrl(plan, dest) {
  if (!plan || !dest || dest === "Voyage")
    return `https://www.google.com/maps/search/${enc(dest || "")}`;

  const clean = loc => {
    if (!loc) return null;
    const main = loc.split(",")[0].trim();
    if (!main || main.toLowerCase() === "voyage") return null;
    const d = dest.split(",")[0].trim();
    return main.toLowerCase().includes(d.toLowerCase()) ? main : `${main}, ${d}`;
  };

  const locs = (plan.days || []).map(d => clean(d.location)).filter(Boolean);
  if (!locs.length) return `https://www.google.com/maps/search/${enc(dest)}`;
  if (locs.length === 1) return `https://www.google.com/maps/search/${enc(locs[0])}`;
  return `https://www.google.com/maps/dir/${locs.map(l => enc(l)).join("/")}`;
}
