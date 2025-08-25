// public/app.js
let map;
let markers = new Map(); // regionId -> google.maps.Marker
let regions = [];
let byCountry = {};
let currentRegionId = null;
let aborter = null;
const cache = new Map(); // regionId -> { ts, payload }

const ICONS = {
  war: '/img/war.png',
  politics: '/img/politics.png',
  culture: '/img/culture.png',
  economy: '/img/economy.png',
  society: '/img/society.png',
  climate: '/img/climate.png',
  peace: '/img/peace.png',
  demise: '/img/demise.png',
  others: '/img/others.png'
};

const ICON_PX = 32;

// 🔹 NEW: always base map/badge on the newest (top) item shown in sidebar
function latestCategory(items = []) {
  return (items && items.length && (items[0].category || 'others')) || 'others';
}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src; s.async=true; s.onload=resolve; s.onerror=reject;
    document.head.appendChild(s);
  });
}

async function initMap(){
  const cfg = await (await fetch('/api/config')).json();
  if(!cfg.mapsKey){ alert('Server is missing GOOGLE_MAPS_API_KEY; set it in .env'); return; }
  await loadScript(`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(cfg.mapsKey)}&v=quarterly`);
  map = new google.maps.Map(document.getElementById('map'), {
    center:{lat:20,lng:0}, zoom:2, styles:[],
    mapTypeControl:false, streetViewControl:false, fullscreenControl:false
  });
}

async function fetchRegions(){
  regions = await (await fetch('/api/regions')).json();
  byCountry = {};
  for(const r of regions){ (byCountry[r.country] ||= []).push(r); }
  const countrySel = document.getElementById('countrySelect');
  const regionSel  = document.getElementById('regionSelect');
  countrySel.innerHTML = ''; regionSel.innerHTML = '';
  const countries = Object.keys(byCountry).sort();
  for(const c of countries){ const o=document.createElement('option'); o.value=c; o.textContent=c; countrySel.appendChild(o); }
  if(countries.length){ countrySel.value=countries[0]; populateRegions(countrySel.value); }
  renderAllRegionMarkers();
}

function populateRegions(country){
  const regionSel = document.getElementById('regionSelect');
  regionSel.innerHTML='';
  for(const r of (byCountry[country]||[])){
    const o=document.createElement('option'); o.value=r._id; o.textContent=r.name; regionSel.appendChild(o);
  }
  if(regionSel.options.length){ regionSel.value = regionSel.options[0].value; selectRegion(regionSel.value); }
}

function makeIcon(category){
  return { url: ICONS[category] || ICONS.others, scaledSize: new google.maps.Size(ICON_PX, ICON_PX) };
}

async function getRegionPayload(regionId, force=false){
  const now = Date.now();
  const c = cache.get(regionId);
  if(!force && c && now - c.ts < 120000) return c.payload;

  // ask server for a reasonable window of news, still honoring force cache-bypass
  const url = `/api/news/${regionId}?limit=30${force ? '&force=1' : ''}`;
  const res = await fetch(url).then(r=>r.json());
  cache.set(regionId, { ts: now, payload: res });
  return res;
}

async function renderAllRegionMarkers(force=false){
  for(const region of regions){
    try{
      const payload = await getRegionPayload(region._id, force);
      const cat = latestCategory(payload.items);     // ← use newest item’s category
      const iconObj = makeIcon(cat);
      let marker = markers.get(region._id);
      if(!marker){
        marker = new google.maps.Marker({
          position:{lat:region.lat,lng:region.lng}, map, icon: iconObj, title: `${region.name} • ${cat}`
        });
        marker.addListener('click', ()=>{
          document.getElementById('countrySelect').value = region.country;
          populateRegions(region.country);
          document.getElementById('regionSelect').value = region._id;
          selectRegion(region._id);
        });
        markers.set(region._id, marker);
      }else{
        marker.setIcon(iconObj);
        marker.setTitle(`${region.name} • ${cat}`);
      }
    }catch(e){ console.warn('Marker render failed for region', region._id, e); }
  }
}

async function selectRegion(regionId, force=false){
  currentRegionId = regionId;
  const region = regions.find(r=>r._id===regionId);
  if(!region) return;
  map.panTo({lat:region.lat,lng:region.lng}); map.setZoom(5);

  if(aborter) aborter.abort(); aborter = new AbortController();

  const payload = await getRegionPayload(regionId, force);
  const cat = latestCategory(payload.items);         // ← keep client/UI consistent
  renderRegion(region, payload, cat);

  const marker = markers.get(regionId);
  if(marker){
    marker.setIcon(makeIcon(cat));                   // ← marker matches sidebar top item
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(()=>marker.setAnimation(null),700);
  }
}

function renderRegion(region, payload, latestCat){
  const computed = latestCat || latestCategory(payload.items);
  document.getElementById('dominantBadge').textContent = `Latest: ${computed}`;

  const list = document.getElementById('newsList');
  list.innerHTML='';
  for(const it of payload.items){
    const el = document.createElement('div');
    el.className = 'news-item';
    el.innerHTML = `
      <img class="icon" src="${ICONS[it.category] || ICONS.others}" alt="${it.category}" />
      <div>
        <a href="${it.link}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>
        <div class="small">${it.source || ''} • ${it.isoDate ? new Date(it.isoDate).toLocaleString() : ''}</div>
      </div>`;
    list.appendChild(el);
  }
}

function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

async function translateVisible(){
  const links = Array.from(document.querySelectorAll('#newsList a'));
  if(!links.length) return;
  const texts = links.map(a=>a.textContent);
  const res = await fetch('/api/translate',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({texts,target:'en'})
  }).then(r=>r.json());
  if(Array.isArray(res.translations)) res.translations.forEach((t,i)=>{ links[i].textContent = t; });
  else alert(res.error || 'Translate failed');
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await initMap();
  await fetchRegions();
  document.getElementById('countrySelect').addEventListener('change', e => populateRegions(e.target.value));
  document.getElementById('regionSelect').addEventListener('change', e => selectRegion(e.target.value));
  document.getElementById('refreshBtn').addEventListener('click', async ()=>{
    const id = document.getElementById('regionSelect').value;
    await renderAllRegionMarkers(true); // force server refresh (?force=1)
    if(id) selectRegion(id, true);      // refresh selected panel too
  });
  document.getElementById('translateBtn').addEventListener('click', translateVisible);
});
