// public/admin.js
const tokenKey = "lnm_admin_token";
let regionsCache = []; // keep full list for filtering
let isVerified = false; // gate state

// ---------- Toast ----------
function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;

  const border = { success: "#00b37e", error: "#e10600", info: "#3ea6ff" }[type] || "#3ea6ff";
  el.style.borderLeftColor = border;
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
  el.style.pointerEvents = "auto";

  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    el.style.pointerEvents = "none";
  }, 1800);
}

// ---------- Token helpers ----------
function getToken() { return localStorage.getItem(tokenKey) || ""; }
function setToken(t) { localStorage.setItem(tokenKey, t || ""); renderTokenStatus(); }
function renderTokenStatus() {
  const t = getToken();
  const badge = document.getElementById("tokenStatus");
  if (!badge) return;

  if (!isVerified) {
    // Not verified (gray)
    badge.textContent = "Not verified";
    badge.style.background = "#111";
    badge.style.border = "1px solid var(--border)";
    badge.style.color = "var(--muted)";
  } else {
    // Verified (green capsule with check)
    badge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">
                         <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#00b37e;"></span>
                         Verified admin
                       </span>`;
    badge.style.background = "rgba(0,179,126,0.12)";
    badge.style.border = "1px solid rgba(0,179,126,0.35)";
    badge.style.color = "#9AF0D3";
  }
}

// ---------- API wrapper (adds token header) ----------
async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers["x-admin-token"] = token;
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || res.statusText);
  }
  return res.json();
}

// ---------- Gate logic ----------
async function verifyTokenAndUnlock() {
  const token = getToken().trim();
  if (!token) {
    isVerified = false;
    renderTokenStatus();
    showToast("Enter a token first", "info");
    return;
  }

  try {
    // Hit a protected endpoint to verify
    await api("/api/admin/regions"); // GET is enough to validate
    isVerified = true;
    renderTokenStatus();

    // Show admin layout; hide gate notice
    document.getElementById("adminLayout").style.display = "flex";
    document.getElementById("gateNotice").style.display = "none";

    showToast("Token verified", "success");
    await loadRegions();
  } catch (e) {
    isVerified = false;
    renderTokenStatus();
    document.getElementById("adminLayout").style.display = "none";
    document.getElementById("gateNotice").style.display = "block";
    showToast(e.message || "Invalid token", "error");
  }
}

// ---------- Feeds UI ----------
function feedRow(url = "", category = "others") {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gridTemplateColumns = "1fr 140px auto";
  wrap.style.gap = "6px";
  wrap.style.marginBottom = "6px";
  wrap.innerHTML = `
    <input class="feed-url" placeholder="Feed URL" value="${url}" />
    <select class="feed-cat">
      <option value="war" ${category === "war" ? "selected" : ""}>war</option>
      <option value="politics" ${category === "politics" ? "selected" : ""}>politics</option>
      <option value="culture" ${category === "culture" ? "selected" : ""}>culture</option>
      <option value="economy" ${category === "economy" ? "selected" : ""}>economy</option>
      <option value="society" ${category === "society" ? "selected" : ""}>society</option>
      <option value="climate" ${category === "climate" ? "selected" : ""}>climate</option>
      <option value="peace" ${category === "peace" ? "selected" : ""}>peace</option>
      <option value="demise" ${category === "demise" ? "selected" : ""}>demise</option>
      <option value="others" ${category === "others" ? "selected" : ""}>others</option>
    </select>
    <button type="button" class="remove">Remove</button>
  `;
  wrap.querySelector(".remove").addEventListener("click", () => wrap.remove());
  return wrap;
}

// ---------- Regions (list, filter, CRUD) ----------
async function loadRegions() {
  if (!isVerified) return; // safety
  const list = document.getElementById("regionsList");
  list.innerHTML = "Loading...";

  try {
    const regions = await api("/api/admin/regions");
    regionsCache = regions.slice(); // store for filtering
    renderCountryFilter(regionsCache);
    renderRegionsList(regionsCache);
  } catch (e) {
    list.textContent = "Error: " + e.message;
  }
}

function renderCountryFilter(regions) {
  const sel = document.getElementById("countryFilter");
  if (!sel) return;

  const countries = Array.from(new Set(regions.map((r) => r.country))).sort();
  const current = sel.value || "__ALL__";
  sel.innerHTML = `<option value="__ALL__">All countries</option>`;
  for (const c of countries) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  }
  sel.value = countries.includes(current) ? current : "__ALL__";
  sel.onchange = () => filterRegions();
}

function filterRegions() {
  const sel = document.getElementById("countryFilter");
  const val = sel.value;
  if (!val || val === "__ALL__") renderRegionsList(regionsCache);
  else renderRegionsList(regionsCache.filter((r) => r.country === val));
}

function renderRegionsList(regions) {
  const list = document.getElementById("regionsList");
  list.innerHTML = "";

  if (!regions.length) {
    list.innerHTML = `<div class="small" style="color:var(--muted);">No regions yet.</div>`;
    return;
  }

  for (const r of regions) {
    const row = document.createElement("div");
    row.style.border = "1px solid var(--border)";
    row.style.borderRadius = "10px";
    row.style.padding = "8px";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <div style="font-weight:600">${r.name}</div>
        <div class="small" style="color:var(--muted);">${r.country}</div>
        <div class="small" style="color:var(--muted);">(${r.lat}, ${r.lng})</div>
        <div class="small" style="color:var(--muted);">${(r.feeds || []).length} feeds</div>
        <div style="margin-left:auto;display:flex;gap:6px;">
          <button class="edit">Edit</button>
          <button class="del">Delete</button>
        </div>
      </div>
    `;
    row.querySelector(".edit").addEventListener("click", () => fillForm(r));
    row.querySelector(".del").addEventListener("click", async () => {
      if (!confirm("Delete region?")) return;
      try {
        await api("/api/admin/regions/" + r._id, { method: "DELETE" });
        showToast("Region deleted", "success");
        await loadRegions();
      } catch (err) {
        showToast(err.message || "Delete failed", "error");
      }
    });
    list.appendChild(row);
  }
}

// ---------- Form ----------
function fillForm(r) {
  document.getElementById("regionId").value = r._id || "";
  document.getElementById("name").value = r.name || "";
  document.getElementById("country").value = r.country || "";
  document.getElementById("lat").value = r.lat ?? "";
  document.getElementById("lng").value = r.lng ?? "";
  const wrap = document.getElementById("feedsWrap");
  wrap.innerHTML = "";
  for (const f of r.feeds || []) wrap.appendChild(feedRow(f.url, f.category || "others"));
  showToast("Loaded for edit: " + (r.name || "Region"), "info");
}

function emptyForm() {
  fillForm({ name: "", country: "", lat: "", lng: "", feeds: [] });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderTokenStatus();

  // Hide layout until verified
  document.getElementById("adminLayout").style.display = "none";
  document.getElementById("gateNotice").style.display = "block";

  // Try auto-verify if a token was previously saved
  if (getToken()) {
    verifyTokenAndUnlock();
  }

  document.getElementById("saveTokenBtn").addEventListener("click", async () => {
    const t = document.getElementById("tokenInput").value.trim();
    setToken(t);
    showToast("Admin token saved", "info");
    await verifyTokenAndUnlock();
  });

  document.getElementById("addFeedBtn").addEventListener("click", () => {
    document.getElementById("feedsWrap").appendChild(feedRow());
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    emptyForm();
    showToast("Form reset", "info");
  });

  document.getElementById("regionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isVerified) return;

    const id = document.getElementById("regionId").value.trim();
    const payload = {
      name: document.getElementById("name").value.trim(),
      country: document.getElementById("country").value.trim(),
      lat: parseFloat(document.getElementById("lat").value),
      lng: parseFloat(document.getElementById("lng").value),
      feeds: Array.from(document.querySelectorAll("#feedsWrap > div"))
        .map((row) => ({
          url: row.querySelector(".feed-url").value.trim(),
          category: row.querySelector(".feed-cat").value,
        }))
        .filter((f) => f.url),
    };

    try {
      if (id) {
        await api("/api/admin/regions/" + id, { method: "PUT", body: JSON.stringify(payload) });
        showToast("Region updated", "success");
      } else {
        await api("/api/admin/regions", { method: "POST", body: JSON.stringify(payload) });
        showToast("Region created", "success");
      }
      emptyForm();
      await loadRegions();
    } catch (e2) {
      showToast(e2.message || "Save failed", "error");
    }
  });
});
