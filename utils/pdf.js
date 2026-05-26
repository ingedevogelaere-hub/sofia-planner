import { photoCache } from "../hooks/usePhoto";
import { buildMapUrl } from "../lib/links";
import { enc } from "../lib/constants";

async function toBase64(url) {
  if (!url) return null;
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) return null;
    const b = await r.blob();
    return await new Promise(res => {
      const fr = new FileReader();
      fr.onloadend = () => res(fr.result);
      fr.readAsDataURL(b);
    });
  } catch { return null; }
}

export async function generatePDF(plan, form, destDisplay) {
  const heroQ = (destDisplay + " landmark famous tourism travel").substring(0, 60);
  const heroUrl = photoCache[heroQ] || photoCache[(destDisplay + " ville paysage panoramique").substring(0, 60)];
  const heroB64 = heroUrl ? await toBase64(heroUrl) : null;

  const dayPhotos = {};
  for (const d of (plan?.days || [])) {
    const q = (d.unsplash_query || d.location || destDisplay || "travel").substring(0, 60);
    const url = photoCache[q] || photoCache[(d.location || destDisplay).substring(0, 60)];
    if (url) dayPhotos[d.num] = await toBase64(url) || null;
  }

  const nuits = (plan?.days?.length) || form.nuits;
  const rows = (arr, fn) => (arr || []).map(fn).join("");

  const dayH = rows(plan?.days, d => `
    <div class="day-card">
      ${dayPhotos[d.num] ? `<img src="${dayPhotos[d.num]}" class="day-photo"/>` : `<div class="day-photo-placeholder"></div>`}
      <div class="day-header">
        <div class="day-num">Jour ${d.num}</div>
        <div class="day-title">${d.title || ""}${d.location ? `<span class="day-loc">📍 ${d.location}</span>` : ""}</div>
      </div>
      <div class="day-body">
        ${d.morning   ? `<div class="moment"><span class="moment-lbl">🌅 Matin</span>${d.morning}</div>`     : ""}
        ${d.afternoon ? `<div class="moment"><span class="moment-lbl">☀️ Après-midi</span>${d.afternoon}</div>` : ""}
        ${d.evening   ? `<div class="moment"><span class="moment-lbl">🌙 Soir</span>${d.evening}</div>`      : ""}
        ${d.tip       ? `<div class="tip">💡 ${d.tip}</div>` : ""}
      </div>
    </div>`);

  const siteH   = rows(plan?.remarkable_sites, s => `<div class="list-item"><div class="list-item-title">${s.name}${s.label ? ` <span class="badge">${s.label}</span>` : ""}</div><div class="list-item-loc">📍 ${s.location || ""}</div><div class="list-item-desc">${s.description || ""}</div>${s.website ? `<a href="${s.website}" class="link-btn">🌐 Site officiel</a>` : ""}</div>`);
  const hotelH  = rows(plan?.accommodations,   h => `<div class="list-item"><div class="list-item-title">${h.name} <span class="badge">${h.type || ""}</span> <span class="price">${h.price || ""}</span></div><div class="list-item-loc">📍 ${h.location || ""}</div><div class="list-item-desc">${h.why || ""}</div>${h.website ? `<a href="${h.website}" class="link-btn">🌐 Réserver</a>` : ""}</div>`);
  const restoH  = rows(plan?.restaurants,      r => `<div class="list-item"><div class="list-item-title">${r.name} <span class="badge">${r.cuisine || ""}</span> <span class="price">${r.price || ""}</span></div><div class="list-item-loc">📍 ${r.address || ""}</div><div class="list-item-desc">⭐ ${r.specialty || ""}</div></div>`);
  const outingH = rows(plan?.outings,          o => `<div class="list-item"><div class="list-item-title">${o.type === "randonnée" ? "🥾" : "🎯"} ${o.name}${o.difficulty ? ` <span class="badge">${o.difficulty}</span>` : ""}${o.distance ? ` <span class="badge">${o.distance}</span>` : ""}</div>${o.start_point ? `<div class="list-item-loc">🚩 ${o.start_point}</div>` : ""}${o.highlights ? `<div class="list-item-desc">${o.highlights}</div>` : ""}</div>`);
  const agendaH = rows(plan?.agenda,           ev => `<div class="agenda-item agenda-${ev.type}"><strong>${ev.type === "positive" ? "🎉" : ev.type === "negative" ? "⚠️" : "ℹ️"} ${ev.name}</strong>${ev.date ? ` <span class="badge">${ev.date}</span>` : ""}<br/>${ev.description || ""}</div>`);
  const tipsH   = (plan?.tips || []).map((t, i) => `<div class="tip-item"><span class="tip-num">${i + 1}</span>${t}</div>`).join("");

  const b = plan?.budget || {};
  const budH = `<div class="budget-grid">${[["🏨 Hébergement", b.accommodation], ["🍽️ Repas", b.meals], ["🎯 Activités", b.activities], ["🚗 Transport", b.transport]].filter(([, v]) => v).map(([l, v]) => `<div class="budget-row"><span>${l}</span><strong>${v}</strong></div>`).join("")}</div><div class="budget-total">Total estimé : <strong>${b.total || "—"}</strong></div>`;

  const sec = (icon, title, content) => content ? `<div class="section"><h2 class="section-title">${icon} ${title}</h2>${content}</div>` : "";

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${destDisplay} — Sofia Planner</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Lato',sans-serif;color:#1C1A14;background:#fff;font-size:13px;line-height:1.6}
a{color:#B8972E;text-decoration:none}
.cover{page-break-after:always;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#1C1A14}
.cover-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45}
.cover-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.7))}
.cover-content{position:relative;z-index:2;text-align:center;color:#fff;padding:40px}
.cover-eyebrow{font-family:'Lato',sans-serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#B8972E;margin-bottom:20px}
.cover-title{font-family:'Playfair Display',serif;font-size:72px;font-weight:900;line-height:1;margin-bottom:16px;text-shadow:0 4px 20px rgba(0,0,0,.5)}
.cover-sub{font-family:'Lato',sans-serif;font-size:16px;font-weight:300;letter-spacing:4px;color:rgba(255,255,255,.8);text-transform:uppercase;margin-bottom:12px}
.cover-dates{font-size:13px;color:rgba(255,255,255,.6);letter-spacing:2px}
.cover-intro{max-width:600px;margin:30px auto 0;font-style:italic;font-size:15px;color:rgba(255,255,255,.85);line-height:1.8}
.cover-footer{position:absolute;bottom:30px;left:0;right:0;text-align:center;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4)}
.section{page-break-inside:avoid;margin-bottom:40px}
.section-title{font-family:'Playfair Display',serif;font-size:22px;color:#1C1A14;border-bottom:2px solid #B8972E;padding-bottom:8px;margin-bottom:20px}
.day-card{margin-bottom:30px;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);page-break-inside:avoid}
.day-photo{width:100%;height:220px;object-fit:cover;display:block}
.day-photo-placeholder{width:100%;height:160px;background:linear-gradient(135deg,#EDE0C4,#FAF6EE);display:block}
.day-header{background:#1C1A14;padding:14px 20px;display:flex;align-items:baseline;gap:16}
.day-num{font-family:'Lato',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8972E;flex-shrink:0}
.day-title{font-family:'Playfair Display',serif;font-size:18px;color:#fff;font-weight:700}
.day-loc{font-size:12px;color:#999;margin-left:10px;font-family:'Lato',sans-serif;font-weight:300}
.day-body{padding:20px 24px;background:#fff}
.moment{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #FAF6EE}
.moment:last-of-type{border-bottom:none}
.moment-lbl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B8972E;font-family:'Lato',sans-serif;font-weight:700;margin-bottom:4px}
.tip{background:#FAF6EE;border-left:3px solid #B8972E;padding:10px 14px;font-style:italic;color:#8A9E93;font-size:12px;border-radius:0 4px 4px 0;margin-top:12px}
.list-item{padding:14px 0;border-bottom:1px solid #EDE0C4;display:flex;flex-direction:column;gap:4}
.list-item:last-child{border-bottom:none}
.list-item-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8;flex-wrap:wrap}
.list-item-loc{font-size:12px;color:#B8972E}
.list-item-desc{font-size:12px;color:#555;line-height:1.6}
.link-btn{display:inline-block;margin-top:6px;padding:4px 10px;background:#1C1A14;color:#B8972E!important;border-radius:3px;font-size:10px;letter-spacing:1px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;background:#EDE0C4;color:#666;font-size:10px;font-family:'Lato',sans-serif;font-weight:700;letter-spacing:1px}
.price{display:inline-block;padding:2px 8px;border-radius:10px;background:#FAF6EE;color:#B8972E;font-size:11px;font-weight:700}
.agenda-item{padding:12px 16px;border-radius:6px;margin-bottom:10px;font-size:12px;line-height:1.6}
.agenda-positive{background:#e8f5e9;border-left:4px solid #2e7d32}
.agenda-negative{background:#fce4ec;border-left:4px solid #c62828}
.agenda-info{background:#e3f2fd;border-left:4px solid #1565c0}
.budget-grid{border:1px solid #EDE0C4;border-radius:6px;overflow:hidden}
.budget-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #EDE0C4;font-size:13px}
.budget-row:last-child{border-bottom:none}
.budget-total{margin-top:12px;text-align:right;font-size:16px;color:#C1440E}
.tip-item{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #FAF6EE;font-size:13px;line-height:1.7}
.tip-num{width:26px;height:26px;border-radius:50%;background:#B8972E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}
.maps-bar{text-align:center;margin:20px 0}
.maps-btn{display:inline-block;padding:10px 24px;background:#4285F4;color:#fff!important;border-radius:6px;font-size:12px;letter-spacing:1px}
.cover-bg-gradient{position:absolute;inset:0;background:linear-gradient(135deg,#1C1A14 0%,#2C4A3E 50%,#1A3A5C 100%)}
.page-content{padding:40px 50px}
@media print{body{margin:0;padding:0}.cover{height:100vh}}
</style>
</head><body>
<div class="cover">
  ${heroB64 ? `<img src="${heroB64}" class="cover-bg"/>` : `<div class="cover-bg-gradient"></div>`}
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-eyebrow">✦ On The Road Again ✦</div>
    <div class="cover-title">${destDisplay}</div>
    <div class="cover-sub">${nuits} nuits${form.voyageurs && form.voyageurs !== "Autre" ? " · " + form.voyageurs.toUpperCase() : ""}</div>
    ${form.dateStart ? `<div class="cover-dates">${form.dateStart} → ${form.dateEnd || ""}</div>` : ""}
    ${plan?.intro ? `<div class="cover-intro">${plan.intro}</div>` : ""}
  </div>
  <div class="cover-footer">Sofia Planner · On The Road Again · ${new Date().toLocaleDateString("fr-FR")}</div>
</div>
<div class="page-content">
  <div class="maps-bar"><a href="${buildMapUrl(plan, destDisplay)}" target="_blank" class="maps-btn">🗺️ Voir l'itinéraire complet sur Google Maps</a></div>
  ${sec("🗺️", "Itinéraire", dayH)}
  ${plan?.agenda?.length ? sec("📅", "À noter pour ton séjour", agendaH) : ""}
  ${sec("⭐", "Incontournables", siteH)}
  ${sec("🏨", "Hébergements", hotelH)}
  ${sec("🍽️", "Restaurants", restoH)}
  ${sec("🎯", "Sorties & Activités", outingH)}
  ${plan?.tips?.length ? sec("💡", "Conseils pratiques", tipsH) : ""}
  ${plan?.budget ? sec("💰", "Budget estimé", budH) : ""}
</div>
<script>
window.onload=function(){
  var imgs=document.querySelectorAll('img');
  var count=imgs.length;if(!count){window.print();return;}
  var done=0;
  imgs.forEach(function(img){
    if(img.complete){done++;if(done===count)window.print();}
    else{img.onload=img.onerror=function(){done++;if(done===count)window.print();};}
  });
  setTimeout(function(){window.print();},5000);
};
</script>
</body></html>`);
  win.document.close();
}
