function qs(s){ return document.querySelector(s); }
function qsa(s){ return Array.from(document.querySelectorAll(s)); }
function fmtDate(s){ try { return s ? new Date(s).toLocaleString() : '—'; } catch { return s || '—'; } }
function dash(v){ return (v === null || v === undefined || String(v).trim() === '') ? '—' : v; }

// Lazy opener for the auth modal from auth.js (if present on page)
function openAuthModalSafely() {
  try { if (typeof openModal === 'function') openModal(); } catch {}
}

function toast(msg, ok=true) {
  const el = qs('#toast'); if(!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.borderColor = ok ? '#2f2f2f' : '#553';
  el.style.color = ok ? 'inherit' : '#f66';
  setTimeout(()=>{ el.style.display = 'none'; }, 2500);
}

function onlyDefined(obj){
  const out = {};
  for (const [k,v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') out[k] = v;
  }
  return out;
}

async function list() {
  const res = await fetch('/api/admin/users', {
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    let errMsg = '';
    try { errMsg = (await res.json()).error || ''; } catch { errMsg = await res.text(); }
    const msg = `Failed to load users. HTTP ${res.status}. ${errMsg}`;

    if (res.status === 401 || res.status === 403) {
      document.body.innerHTML =
        '<div style="padding:24px;color:#e66">Admin access required. Please login as an admin user.</div>';
      openAuthModalSafely();
      throw new Error('Admin auth required: ' + msg);
    }
    throw new Error(msg);
  }

  const { users } = await res.json();
  const tbody = qs('#usersBody');
  if (!tbody) return;

  tbody.innerHTML = (users || []).map(u => {
    const id = u.id || u._id || '';
    const phone = dash(u.phone);
    const role = dash(u.role);
    const created = fmtDate(u.createdAt);

    // Build details rows conditionally (omit empty fields altogether)
    const details = [];
    if (id) details.push(`
      <div>
        <div class="muted" style="font-size:12px">ID</div>
        <div>${id}</div>
      </div>`);
    if (u.updatedAt) details.push(`
      <div>
        <div class="muted" style="font-size:12px">Updated</div>
        <div>${fmtDate(u.updatedAt)}</div>
      </div>`);

    return `
    <tr class="user-row" data-id="${id}">
      <td style="padding:10px;border-top:1px solid #222">${dash(u.name)}</td>
      <td style="padding:10px;border-top:1px solid #222">${dash(u.email)}</td>
      <td style="padding:10px;border-top:1px solid #222">${phone}</td>
      <td style="padding:10px;border-top:1px solid #222">${role}</td>
      <td style="padding:10px;border-top:1px solid #222">${created}</td>
      <td style="padding:10px;border-top:1px solid #222">
        <div class="actions">
          <button class="linklike js-notify" data-id="${id}">Notify</button>
          <button class="linklike danger js-remove" data-id="${id}">Remove</button>
        </div>
      </td>
    </tr>
    <tr class="user-details" style="display:none;background:#0f0f0f">
      <td colspan="6" style="padding:10px;border-top:1px solid #222">
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
          ${details.join('')}
        </div>
      </td>
    </tr>`;
  }).join('');

  // Toggle details on row click (ignore clicks on action buttons)
  tbody.querySelectorAll('.user-row').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('.actions')) return; // don't toggle when clicking actions
      const next = tr.nextElementSibling;
      if (!next || !next.classList.contains('user-details')) return;
      next.style.display = next.style.display === 'none' ? '' : 'none';
    });
  });

  // Wire up actions (event delegation)
  tbody.querySelectorAll('.js-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm('Remove this user? This cannot be undone.')) return;
      const ok = await removeUser(id);
      if (ok) { toast('User removed'); await list(); }
    });
  });

  tbody.querySelectorAll('.js-notify').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      openNotifyModal(id);
    });
  });
}

// Hook up modal open/close if elements exist
qs('#addUserBtn')?.addEventListener('click', () => { const m = qs('#modal'); if (m) m.style.display = 'flex'; });
qs('#closeModal')?.addEventListener('click', () => { const m = qs('#modal'); if (m) m.style.display = 'none'; });

// Add user — trim inputs and prevent accidental empty strings
qs('#addForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  const raw = Object.fromEntries(new FormData(form).entries());
  // Trim and enforce requireds
  const data = {
    name: (raw.name || '').trim(),
    email: (raw.email || '').trim(),
    phone: (raw.phone || '').trim(),
    password: (raw.password || '').trim(),
    role: (raw.role || 'user').trim()
  };
  if (!data.name || !data.email || !data.password) {
    const errEl = qs('#err'); if (errEl) errEl.textContent = 'Name, Email and Password are required.';
    return;
  }

  const res = await fetch('/api/admin/users', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(onlyDefined(data)),
  });

  if (res.ok) {
    const m = qs('#modal'); if (m) m.style.display = 'none';
    form.reset();
    toast('User created');
    await list();
  } else {
    const j = await res.json().catch(()=>({error:'Failed'}));
    const errEl = qs('#err'); if (errEl) errEl.textContent = j.error || 'Failed';
    if (res.status === 401 || res.status === 403) openAuthModalSafely();
  }
});

/* Notify modal + API */
function openNotifyModal(userId){
  const m = qs('#notifyModal'); if(!m) return;
  m.style.display = 'flex';
  const f = qs('#notifyForm');
  f.userId.value = userId || '';
  qs('#notifyErr').textContent = '';
}
qs('#closeNotify')?.addEventListener('click', () => { const m = qs('#notifyModal'); if (m) m.style.display = 'none'; });

qs('#notifyForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const userId = form.userId.value;
  const title = (form.title.value || '').trim();
  const message = (form.message.value || '').trim();
  if (!userId || !title || !message) {
    qs('#notifyErr').textContent = 'All fields are required.';
    return;
  }
  const ok = await notifyUser(userId, { title, message });
  if (ok) {
    const m = qs('#notifyModal'); if (m) m.style.display = 'none';
    form.reset();
    toast('Notification sent');
  }
});

async function notifyUser(id, payload){
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}/notify`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 401 || res.status === 403) openAuthModalSafely();
    if (!res.ok) {
      const j = await res.json().catch(()=>({error:'Failed'}));
      toast(j.error || 'Failed to send notification', false);
      return false;
    }
    return true;
  } catch (e){
    console.error(e);
    toast('Network error', false);
    return false;
  }
}

async function removeUser(id){
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    if (res.status === 401 || res.status === 403) openAuthModalSafely();
    if (!res.ok) {
      const j = await res.json().catch(()=>({error:'Failed'}));
      toast(j.error || 'Failed to remove user', false);
      return false;
    }
    return true;
  } catch (e){
    console.error(e);
    toast('Network error', false);
    return false;
  }
}

// Initial load
list().catch(err => {
  console.error(err);
  toast('Failed to load users', false);
});
