/**
 * utils/book.js
 * ─────────────────────────────────────────────────────────
 * Génère un flipbook magazine interactif dans un nouvel onglet.
 * generateBook(plan, form, destDisplay, photoCache) :
 *   - Couverture avec photo
 *   - Une page par jour (photo + matin/après-midi/soir)
 *   - Page itinéraire (étapes + sites incontournables)
 *   - Page hébergements + restaurants
 *   - Page budget + conseils
 *   - Page de fin
 * Utilise les photos déjà chargées depuis photoCache (Unsplash).
 * Animation CSS transitions — fiable sur tous navigateurs.
 */

import { enc } from "../lib/constants";

/* ─── Helpers ─── */
const esc = s => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const photo = (cache, query, fallback) => {
  if (!query) return fallback || "";
  const key = query.substring(0, 60);
  return cache[key] || fallback || `https://source.unsplash.com/340x200/?${enc(query)}`;
};

/* ─── CSS global du flipbook ─── */
function css() {
  return `
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Georgia',serif;background:#0D1B2A;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:28px 0 36px;gap:18px;min-height:100%}
.book{width:340px;height:500px;position:relative;flex-shrink:0}
.page{position:absolute;inset:0;border-radius:3px 10px 10px 3px;overflow:hidden;box-shadow:6px 6px 28px rgba(0,0,0,.4);display:none;will-change:transform,opacity;transform:perspective(1400px) rotateY(0deg);opacity:1}
.page.show{display:block}
.page.off-left{transform:perspective(1400px) rotateY(-88deg);opacity:0}
.page.anim{transition:transform .44s cubic-bezier(.4,0,.2,1),opacity .38s ease}
.ey{font-size:8px;letter-spacing:3px;color:#B8972E;text-transform:uppercase;font-family:monospace;margin-bottom:6px}
.ttl{font-size:19px;font-weight:700;color:#1A3A5C;line-height:1.2;margin-bottom:3px}
.stl{font-size:13px;font-weight:700;color:#1A3A5C;margin-bottom:3px}
.loc{font-size:9px;letter-spacing:2px;color:#B8972E;font-family:monospace}
.lbl{font-size:8px;letter-spacing:2px;color:#B8972E;text-transform:uppercase;font-family:monospace;margin-bottom:2px}
.txt{font-size:10.5px;color:#2a3040;line-height:1.65}
.hr{border:none;border-top:1px solid #DDE8F5;margin:8px 0}
.chip{display:inline-block;padding:2px 8px;background:#E6F0FA;color:#1A3A5C;font-size:8px;font-family:monospace;border-radius:10px;margin:2px 2px 2px 0;font-weight:600}
.tip{background:#EEF4FB;border-left:2.5px solid #1A3A5C;padding:7px 10px;font-size:10px;color:#1A3A5C;font-style:italic;border-radius:0 4px 4px 0;margin-top:8px}
.pn{position:absolute;bottom:9px;right:14px;font-size:8px;color:#bbb;font-family:monospace;letter-spacing:1px}
.tap{position:absolute;inset:0;cursor:pointer;z-index:20}
.fold{position:absolute;bottom:0;right:0;width:52px;height:52px;pointer-events:none}
.fold::after{content:'';position:absolute;bottom:0;right:0;border-style:solid;border-width:0 0 52px 52px;border-color:transparent transparent rgba(255,255,255,.14) transparent;transition:all .2s;border-radius:0 0 10px 0}
.page:hover .fold::after{border-width:0 0 72px 72px;border-color:transparent transparent rgba(255,255,255,.24) transparent}
.fold span{position:absolute;bottom:13px;right:13px;font-size:9px;color:rgba(255,255,255,.4);font-family:monospace}
.nav-bar{display:flex;align-items:center;gap:16px}
.nbtn{background:none;border:1.5px solid rgba(255,255,255,.3);color:rgba(255,255,255,.8);border-radius:100px;padding:7px 20px;font-size:12px;cursor:pointer;font-family:'Georgia',serif;transition:all .15s}
.nbtn:hover:not(:disabled){background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.6)}
.nbtn:disabled{opacity:.22;cursor:default}
.dots{display:flex;gap:5px;align-items:center}
.dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.25);cursor:pointer;transition:all .2s;border:none}
.dot.on{background:#B8972E;width:20px;border-radius:4px}
.hint{font-size:9px;color:rgba(255,255,255,.3);font-family:monospace;letter-spacing:1px}
`;
}

/* ─── Pages HTML ─── */
function pageCover(plan, form, destDisplay, photoUrl, idx, N) {
  const nuits  = (plan.days?.length) || form.nuits || "?";
  const voy    = form.voyageurs === "Autre" ? form.voyageurs_autre : form.voyageurs;
  const dates  = form.dateStart ? `${form.dateStart.replace(/-/g,"/")} – ${(form.dateEnd||"").replace(/-/g,"/")}` : "";
  const fsize  = destDisplay.length > 14 ? "34" : destDisplay.length > 10 ? "40" : "48";
  return `
<div class="page show" id="p${idx}" style="z-index:${N-idx}">
  <div style="position:relative;height:100%">
    ${photoUrl?`<img src="${photoUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75" onerror="this.style.opacity='0'"/>`:""}
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,35,90,.93) 0%,rgba(10,35,90,.58) 42%,rgba(10,35,90,.07) 100%)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(to top right,rgba(184,151,46,.2) 0%,transparent 45%)"></div>
    <div style="position:absolute;top:0;left:0;right:0;padding:16px 22px;display:flex;justify-content:space-between">
      <div style="font-size:7px;letter-spacing:4px;color:rgba(255,255,255,.45);font-family:monospace;text-transform:uppercase">On The Road Again</div>
      <div style="font-size:7px;color:rgba(255,255,255,.3);font-family:monospace">01</div>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;padding:28px 26px 24px">
      <div style="font-size:8px;letter-spacing:4px;color:#C8A840;text-transform:uppercase;font-family:monospace;margin-bottom:14px">✦ &nbsp;Ton voyage &nbsp;✦</div>
      <div style="width:36px;height:1.5px;background:#B8972E;margin-bottom:14px"></div>
      <div style="font-size:${fsize}px;font-weight:700;color:#F0E4C8;line-height:.95;margin-bottom:12px;text-shadow:0 3px 20px rgba(0,0,0,.4)">${esc(destDisplay)}</div>
      <div style="font-size:10px;letter-spacing:3px;color:rgba(240,228,200,.65);text-transform:uppercase;font-family:monospace">${nuits} nuits${voy ? ` · ${esc(voy)}` : ""}</div>
      ${dates?`<div style="font-size:9px;letter-spacing:2px;color:#C8A840;font-family:monospace;margin-top:5px">${esc(dates)}</div>`:""}
      <div style="margin-top:20px;display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:1px;background:linear-gradient(to right,#B8972E66,transparent)"></div>
        <div style="font-size:8px;letter-spacing:2px;color:rgba(240,228,200,.45);font-family:monospace">Plan Sofia</div>
      </div>
    </div>
  </div>
  <div class="tap" onclick="go(cur+1)"></div>
  <div class="fold"><span>↩</span></div>
</div>`;
}

function pageDay(day, photoUrl, idx, N) {
  const pnum = String(idx+1).padStart(2,"0");
  return `
<div class="page" id="p${idx}" style="z-index:${N-idx}">
  <div style="height:100%;background:#FEFCF8;display:flex;flex-direction:column">
    <div style="position:relative;flex-shrink:0">
      <img src="${photoUrl}" style="width:100%;height:185px;object-fit:cover;display:block" onerror="this.style.minHeight='4px';this.style.maxHeight='4px'"/>
      <div style="position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(to top,#FEFCF8,transparent)"></div>
    </div>
    <div style="padding:11px 20px;flex:1;overflow:hidden">
      <div class="ey">Jour ${day.num}</div>
      <div class="ttl">${esc(day.title||"")}</div>
      ${day.location?`<div class="loc">📍 ${esc(day.location)}</div>`:""}
      <div class="hr"></div>
      ${day.morning?`<div style="margin-bottom:7px"><div class="lbl">🌅 Matin</div><div class="txt">${esc(day.morning)}</div></div>`:""}
      ${day.afternoon?`<div style="margin-bottom:7px"><div class="lbl">☀️ Après-midi</div><div class="txt">${esc(day.afternoon)}</div></div>`:""}
      ${day.evening?`<div style="margin-bottom:7px"><div class="lbl">🌙 Soir</div><div class="txt">${esc(day.evening)}</div></div>`:""}
      ${day.tip?`<div class="tip">💡 ${esc(day.tip)}</div>`:""}
    </div>
  </div>
  <div class="pn">${pnum}</div>
  <div class="tap" onclick="go(cur+1)"></div>
  <div class="fold"><span>↩</span></div>
</div>`;
}

function pageRoute(plan, destDisplay, idx, N) {
  const days  = plan.days || [];
  const sites = (plan.remarkable_sites || []).slice(0, 4);
  const stops = days.map((d,i) => `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:9px">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
        <div style="width:22px;height:22px;border-radius:50%;background:#1A3A5C;color:#F5D890;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;font-family:monospace">${d.num}</div>
        ${i<days.length-1?'<div style="width:1.5px;height:12px;background:#1A3A5C33;margin:2px 0 0 10px"></div>':""}
      </div>
      <div style="flex:1;padding-top:3px">
        <div style="font-size:11px;font-weight:700;color:#1A3A5C;font-family:Georgia,serif">${esc(d.title||"")}</div>
        ${d.location?`<div style="font-size:8px;color:#B8972E;font-family:monospace;letter-spacing:1px">📍 ${esc(d.location)}</div>`:""}
      </div>
    </div>`).join("");

  const siteList = sites.map(s => `
    <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">
      <div style="width:5px;height:5px;border-radius:50%;background:#B8972E;flex-shrink:0;margin-top:4px"></div>
      <div>
        <div style="font-size:10px;font-weight:700;color:#1A3A5C;font-family:Georgia,serif">${esc(s.name||"")}</div>
        ${s.location?`<div style="font-size:8px;color:#7A6A40;font-family:monospace">📍 ${esc(s.location)}</div>`:""}
      </div>
    </div>`).join("");

  const pnum = String(idx+1).padStart(2,"0");
  return `
<div class="page" id="p${idx}" style="z-index:${N-idx}">
  <div style="height:100%;display:flex;flex-direction:column;background:#F2E8D0">
    <div style="background:linear-gradient(135deg,#0F2D4A,#1A3A5C);padding:14px 22px 11px">
      <div class="ey" style="color:rgba(184,151,46,.8)">Itinéraire complet</div>
      <div style="font-size:17px;font-weight:700;color:#fff">${esc(destDisplay)} · ${days.length} jours</div>
    </div>
    <div style="flex:1;overflow:auto;padding:14px 20px">
      <div class="ey" style="margin-bottom:10px">Étapes du voyage</div>
      ${stops}
      ${sites.length?`
      <div style="margin-top:6px;padding-top:10px;border-top:1px solid #DDD0A8">
        <div class="ey" style="margin-bottom:8px">Sites incontournables</div>
        ${siteList}
      </div>`:""}
    </div>
  </div>
  <div class="pn" style="color:#9A8060">${pnum}</div>
  <div class="tap" onclick="go(cur+1)"></div>
  <div class="fold"><span style="color:rgba(0,0,0,.3)">↩</span></div>
</div>`;
}

function pageHotels(plan, photoUrl, idx, N) {
  const hotels = (plan.accommodations||[]).slice(0,2);
  const restos = (plan.restaurants||[]).slice(0,3);
  const pnum   = String(idx+1).padStart(2,"0");
  return `
<div class="page" id="p${idx}" style="z-index:${N-idx}">
  <div style="height:100%;background:#FEFCF8;display:flex;flex-direction:column">
    ${photoUrl?`<img src="${photoUrl}" style="width:100%;height:145px;object-fit:cover;display:block;flex-shrink:0" onerror="this.style.minHeight='4px';this.style.maxHeight='4px'"/>`:"<div style='height:8px;background:linear-gradient(135deg,#0F2D4A,#1A3A5C)'></div>"}
    <div style="padding:13px 20px;flex:1;overflow:hidden">
      <div class="ey">Hébergements</div>
      ${hotels.map((h,i)=>`
        ${i>0?'<div class="hr"></div>':""}
        <div class="stl">${esc(h.name||"")}</div>
        <div style="margin:2px 0 4px">
          ${h.type?`<span class="chip">${esc(h.type)}</span>`:""}
          ${h.price?`<span class="chip">${esc(h.price)}</span>`:""}
        </div>
        ${(h.why||h.description)?`<div class="txt" style="font-size:10px">${esc((h.why||h.description||"").substring(0,80))}…</div>`:""}
      `).join("")}
      ${restos.length?`
      <div class="hr"></div>
      <div class="ey" style="margin-bottom:7px">Restaurants</div>
      ${restos.map(r=>`
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">
          <div style="font-size:12px;flex-shrink:0">🍽️</div>
          <div>
            <div style="font-size:10.5px;font-weight:700;color:#1A3A5C">${esc(r.name||"")}</div>
            <div style="font-size:9px;color:#7A6A40">
              ${r.cuisine?esc(r.cuisine):""}
              ${r.address?` · ${esc(r.address.split(",")[0])}`:""}
            </div>
          </div>
        </div>`).join("")}`:""}
    </div>
  </div>
  <div class="pn">${pnum}</div>
  <div class="tap" onclick="go(cur+1)"></div>
  <div class="fold"><span>↩</span></div>
</div>`;
}

function pageBudget(plan, idx, N) {
  const b    = plan.budget || {};
  const tips = (plan.tips||[]).slice(0,4);
  const rows = [["🏨 Hébergement",b.accommodation],["🍽️ Repas",b.meals],["🎯 Activités",b.activities],["🚗 Transport",b.transport]].filter(([,v])=>v);
  const pnum = String(idx+1).padStart(2,"0");
  return `
<div class="page" id="p${idx}" style="z-index:${N-idx}">
  <div style="height:100%;background:#FEFCF8;display:flex;flex-direction:column">
    <div style="background:linear-gradient(135deg,#0F2D4A,#1A3A5C);padding:18px 22px 15px">
      <div class="ey" style="color:rgba(184,151,46,.8)">Budget estimé</div>
      <div style="font-size:20px;font-weight:700;color:#fff">Ce que ça coûte</div>
    </div>
    <div style="padding:14px 22px;flex:1">
      ${rows.length?`
      <div style="border:1px solid #E0ECF8;border-radius:8px;overflow:hidden;margin-bottom:14px">
        ${rows.map(([l,v],i)=>`
          <div style="display:flex;justify-content:space-between;padding:10px 14px;${i<rows.length-1?"border-bottom:1px solid #E0ECF8;":""}${i%2===0?"background:#F6FAFF":""}">
            <span style="font-size:11px;color:#3a4555">${l}</span>
            <span style="font-size:11px;font-family:monospace;font-weight:700;color:#B8972E">${esc(v)}</span>
          </div>`).join("")}
      </div>`:""}
      ${b.total?`
      <div style="background:linear-gradient(135deg,#0F2D4A,#1A3A5C);border-radius:8px;padding:13px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <span style="font-size:9px;color:rgba(255,255,255,.55);font-family:monospace;letter-spacing:2px">TOTAL</span>
        <span style="font-size:24px;font-weight:700;color:#F5D890;font-family:Georgia,serif">${esc(b.total)}</span>
      </div>`:""}
      ${tips.length?`
      <div class="ey" style="margin-bottom:8px">Conseils</div>
      ${tips.map((t,i)=>`
        <div style="display:flex;gap:8px;margin-bottom:7px">
          <div style="font-size:8px;font-family:monospace;color:#B8972E;margin-top:1px;flex-shrink:0">${i+1}.</div>
          <div style="font-size:10px;color:#2a3040;line-height:1.6">${esc(t.substring(0,90))}${t.length>90?"…":""}</div>
        </div>`).join("")}`:""}
    </div>
  </div>
  <div class="pn">${pnum}</div>
  <div class="tap" onclick="go(cur+1)"></div>
  <div class="fold"><span>↩</span></div>
</div>`;
}

function pageEnd(destDisplay, idx, N) {
  return `
<div class="page" id="p${idx}" style="z-index:${N-idx}">
  <div style="height:100%;background:linear-gradient(145deg,#0D2340,#1A3A5C,#0F2D4A);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px">
    <div style="font-size:46px;margin-bottom:18px">🌍</div>
    <div style="font-size:26px;font-weight:700;color:#F5D890;font-family:Georgia,serif;margin-bottom:6px">Bon voyage !</div>
    <div style="width:44px;height:1.5px;background:linear-gradient(to right,transparent,#B8972E,transparent);margin:14px auto"></div>
    <div style="font-size:9px;letter-spacing:4px;color:rgba(255,255,255,.45);text-transform:uppercase;font-family:monospace">Sofia Planner</div>
    <div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,.3);font-family:monospace;margin-top:4px">On The Road Again</div>
    <div style="margin-top:28px;font-size:11px;color:rgba(255,255,255,.5);font-style:italic;line-height:1.9">${esc(destDisplay)} t'attend.<br/>Profite de chaque instant.</div>
  </div>
  <div class="tap" onclick="go(cur+1)"></div>
</div>`;
}

/* ─── Script JS flipbook ─── */
function script(N) {
  return `<script>
const N=${N};let cur=0,busy=false;
const pages=Array.from({length:N},(_,i)=>document.getElementById('p'+i));
const dots=[...document.querySelectorAll('.dot')];
function nav(){
  document.getElementById('bP').disabled=cur===0;
  document.getElementById('bN').disabled=cur===N-1;
  dots.forEach((d,i)=>d.classList.toggle('on',i===cur));
}
function go(next){
  if(busy||next===cur||next<0||next>=N)return;
  busy=true;
  if(next>cur){
    pages[next].classList.add('show');
    pages[cur].classList.add('anim','off-left');
    setTimeout(()=>{pages[cur].classList.remove('show','anim','off-left');cur=next;nav();busy=false;},460);
  }else{
    pages[next].classList.add('show','off-left');
    pages[next].getBoundingClientRect();
    pages[next].classList.add('anim');
    pages[next].classList.remove('off-left');
    setTimeout(()=>{pages[next].classList.remove('anim');pages[cur].classList.remove('show');cur=next;nav();busy=false;},460);
  }
}
dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
nav();
<\/script>`;
}

/* ─── Nav HTML ─── */
function navHTML(N) {
  const dotItems = Array.from({length:N},(_,i)=>`<button class="dot${i===0?" on":""}" onclick="go(${i})" aria-label="Page ${i+1}"></button>`).join("");
  return `
<div class="nav-bar">
  <button class="nbtn" id="bP" onclick="go(cur-1)" disabled>← Retour</button>
  <div class="dots">${dotItems}</div>
  <button class="nbtn" id="bN" onclick="go(cur+1)">Suivant →</button>
</div>
<div class="hint">Clique sur la page · coin ↩ · ou boutons</div>`;
}

/* ─── Export principal ─── */
export function generateBook(plan, form, destDisplay, cache = {}) {
  const days = plan.days || [];

  // Construire toutes les pages
  const pageFns = [];

  // 1. Couverture
  const coverQ  = `${destDisplay} landmark famous tourism travel`;
  const coverUrl = cache[coverQ.substring(0,60)] || cache[`${destDisplay} ville paysage panoramique`.substring(0,60)] || `https://source.unsplash.com/340x500/?${enc(destDisplay)},travel`;
  pageFns.push((idx, N) => pageCover(plan, form, destDisplay, coverUrl, idx, N));

  // 2. Une page par jour (max 10 pour lisibilité)
  for (const day of days.slice(0,10)) {
    const q    = (day.unsplash_query || day.location || destDisplay || "travel").substring(0,60);
    const url  = cache[q] || `https://source.unsplash.com/340x195/?${enc(day.location||destDisplay)},travel`;
    pageFns.push((idx, N) => pageDay(day, url, idx, N));
  }

  // 3. Itinéraire
  pageFns.push((idx, N) => pageRoute(plan, destDisplay, idx, N));

  // 4. Hébergements + restaurants
  const hotelQ   = (plan.accommodations?.[0]?.unsplash_query || `${destDisplay} hotel`).substring(0,60);
  const hotelUrl = cache[hotelQ] || null;
  pageFns.push((idx, N) => pageHotels(plan, hotelUrl, idx, N));

  // 5. Budget + conseils
  pageFns.push((idx, N) => pageBudget(plan, idx, N));

  // 6. Page de fin
  pageFns.push((idx, N) => pageEnd(destDisplay, idx, N));

  const N = pageFns.length;
  const pagesHTML = pageFns.map((fn, i) => fn(i, N)).join("\n");

  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(destDisplay)} — Sofia Planner</title>
<style>${css()}</style>
</head><body>
<div class="book" id="book">${pagesHTML}</div>
${navHTML(N)}
${script(N)}
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}
