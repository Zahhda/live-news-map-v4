// public/admin-users.js
function qs(s){ return document.querySelector(s); }
function fmtDate(s){ try { return new Date(s).toLocaleString(); } catch { return s; } }

// Lazy opener for the auth modal from auth.js (if present on page)
function openAuthModalSafely() {
  try { if (typeof openModal === 'function') openModal(); } catch {}
}

async function list() {
  const res = await fetch('/api/admin/users', {
    // IMPORTANT: ensure cookies (JWT) go with the request
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    // Try to parse structured error, else text
    let errMsg = '';
    try { errMsg = (await res.json()).error || ''; } catch { errMsg = await res.text(); }
    const msg = `Failed to load users. HTTP ${res.status}. ${errMsg}`;

    if (res.status === 401 || res.status === 403) {
      // Not logged in / not admin. Show a friendly prompt + open login modal if available.
      document.body.innerHTML =
        '<div style="padding:24px;color:#e66">Admin access required. Please login as an admin user.</div>';
      openAuthModalSafely();
      throw new Error('Admin auth required: ' + msg);
    }

    throw new Error(msg); // true 5xx shows here
  }

  const { users } = await res.json();
  const tbody = qs('#usersBody');
  if (!tbody) return; // avoid NPE if table not on page

  tbody.innerHTML = (users || []).map(u => `
    <tr class="user-row" data-id="${u.id || u._id}" style="transition:background-color 0.2s" onmouseover="this.style.backgroundColor='#1a1a1a'" onmouseout="this.style.backgroundColor='transparent'">
      <td style="padding:16px;border-top:1px solid #222">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:linear-gradient(135deg, #4d79ff, #6b8cff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff">
            ${(u.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="color:#fff;font-weight:500;font-size:14px">${u.name || '—'}</div>
          </div>
        </div>
      </td>
      <td style="padding:16px;border-top:1px solid #222;color:#ccc;font-size:14px">${u.email || '—'}</td>
      <td style="padding:16px;border-top:1px solid #222;color:#ccc;font-size:14px">${u.phone || '—'}</td>
      <td style="padding:16px;border-top:1px solid #222">
        <span style="padding:4px 12px;background:${u.role === 'admin' ? 'linear-gradient(135deg, #ff4d4d, #ff6b6b)' : 'linear-gradient(135deg, #4d79ff, #6b8cff)'};color:#fff;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase">
          ${u.role || '—'}
        </span>
      </td>
      <td style="padding:16px;border-top:1px solid #222;color:#888;font-size:14px">${fmtDate(u.createdAt) || '—'}</td>
      <td style="padding:16px;border-top:1px solid #222">
        <button class="btn manage-btn" data-user-id="${u.id || u._id}" data-user-name="${u.name || ''}" data-user-email="${u.email || ''}" style="padding:8px 16px;border:none;border-radius:8px;font-size:13px;font-weight:600;background:linear-gradient(135deg, #ff4d4d, #ff6b6b);color:#fff;cursor:pointer;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(255,77,77,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
          Manage
        </button>
      </td>
    </tr>
    <tr class="user-details" style="display:none;background:#0f0f0f">
      <td colspan="6" style="padding:10px;border-top:1px solid #222">
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
          <div><div style="color:#888;font-size:12px">ID</div><div>${u.id || u._id || ''}</div></div>
          <div><div style="color:#888;font-size:12px">Updated</div><div>${fmtDate(u.updatedAt)}</div></div>
        </div>
      </td>
    </tr>`).join('');

  // Toggle details on row click (but not on manage button)
  tbody.querySelectorAll('.user-row').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('.manage-btn')) return; // Don't toggle details when clicking manage button
      const next = tr.nextElementSibling;
      if (!next || !next.classList.contains('user-details')) return;
      next.style.display = next.style.display === 'none' ? '' : 'none';
    });
  });

  // Add manage button event listeners
  tbody.querySelectorAll('.manage-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userId = btn.getAttribute('data-user-id');
      const userName = btn.getAttribute('data-user-name');
      const userEmail = btn.getAttribute('data-user-email');
      openVisibilityModal(userId, userName, userEmail);
    });
  });
}

// Hook up modal open/close if elements exist
qs('#addUserBtn')?.addEventListener('click', () => { const m = qs('#modal'); if (m) m.style.display = 'flex'; });
qs('#closeModal')?.addEventListener('click', () => { const m = qs('#modal'); if (m) m.style.display = 'none'; });

// Create user
qs('#addForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch('/api/admin/users', {
    method: 'POST',
    credentials: 'same-origin', // send cookie
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const m = qs('#modal'); if (m) m.style.display = 'none';
    form.reset();
    await list();
  } else {
    const j = await res.json().catch(()=>({error:'Failed'}));
    const errEl = qs('#err'); if (errEl) errEl.textContent = j.error || 'Failed';
    if (res.status === 401 || res.status === 403) openAuthModalSafely();
  }
});

// Visibility management variables
let currentUserId = null;
let allCountries = [];
let allRegions = [];
let userVisibilitySettings = {};

// Open visibility management modal
async function openVisibilityModal(userId, userName, userEmail) {
  currentUserId = userId;
  
  // Update modal header
  qs('#userName').textContent = userName;
  qs('#userEmail').textContent = userEmail;
  
  // Load user visibility settings
  await loadUserVisibilitySettings(userId);
  
  // Load all countries and regions
  await loadAllCountriesAndRegions();
  
  // Populate the modal
  populateVisibilityModal();
  
  // Show modal
  qs('#visibilityModal').style.display = 'flex';
}

// Load user's current visibility settings
async function loadUserVisibilitySettings(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/visibility`, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const data = await res.json();
      userVisibilitySettings = {
        visibleCountries: data.visibleCountries || [],
        visibleRegions: data.visibleRegions || [],
        hasVisibilityRestrictions: data.hasVisibilityRestrictions || false
      };
    } else {
      userVisibilitySettings = {
        visibleCountries: [],
        visibleRegions: [],
        hasVisibilityRestrictions: false
      };
    }
  } catch (error) {
    console.error('Failed to load user visibility settings:', error);
    userVisibilitySettings = {
      visibleCountries: [],
      visibleRegions: [],
      hasVisibilityRestrictions: false
    };
  }
}

// Load all countries and regions
async function loadAllCountriesAndRegions() {
  try {
    const [countriesRes, regionsRes] = await Promise.all([
      fetch('/api/regions', { credentials: 'same-origin' }),
      fetch('/api/regions', { credentials: 'same-origin' })
    ]);
    
    if (countriesRes.ok && regionsRes.ok) {
      const regions = await regionsRes.json();
      allRegions = regions;
      
      // Extract unique countries
      const countrySet = new Set();
      regions.forEach(region => {
        if (region.country) countrySet.add(region.country);
      });
      allCountries = Array.from(countrySet).sort();
    }
  } catch (error) {
    console.error('Failed to load countries and regions:', error);
    allCountries = [];
    allRegions = [];
  }
}

// Populate the visibility modal
function populateVisibilityModal() {
  // Populate countries
  const countriesList = qs('#countriesList');
  countriesList.innerHTML = allCountries.map(country => {
    const isVisible = userVisibilitySettings.visibleCountries.includes(country);
    return `
      <label style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;border-radius:4px;transition:background 0.2s" 
             onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" ${isVisible ? 'checked' : ''} 
               data-country="${country}" 
               style="margin:0" />
        <span style="color:#fff;font-size:14px">${country}</span>
      </label>
    `;
  }).join('');

  // Populate regions
  const regionsList = qs('#regionsList');
  regionsList.innerHTML = allRegions.map(region => {
    const isVisible = userVisibilitySettings.visibleRegions.includes(region._id);
    return `
      <label style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;border-radius:4px;transition:background 0.2s" 
             onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" ${isVisible ? 'checked' : ''} 
               data-region-id="${region._id}" 
               style="margin:0" />
        <span style="color:#fff;font-size:14px">${region.name} (${region.country})</span>
      </label>
    `;
  }).join('');
}

// Save visibility settings
async function saveVisibilitySettings() {
  if (!currentUserId) return;

  // Collect selected countries and regions
  const selectedCountries = Array.from(qs('#countriesList').querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.getAttribute('data-country'));
  
  const selectedRegions = Array.from(qs('#regionsList').querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.getAttribute('data-region-id'));

  try {
    const res = await fetch(`/api/admin/users/${currentUserId}/visibility`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        visibleCountries: selectedCountries,
        visibleRegions: selectedRegions,
        hasVisibilityRestrictions: selectedCountries.length > 0 || selectedRegions.length > 0
      })
    });

    if (res.ok) {
      qs('#visibilityModal').style.display = 'none';
      await list(); // Refresh the user list
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to save settings' }));
      qs('#visibilityErr').textContent = error.error || 'Failed to save settings';
    }
  } catch (error) {
    console.error('Failed to save visibility settings:', error);
    qs('#visibilityErr').textContent = 'Failed to save settings';
  }
}

// Hook up visibility modal events
qs('#closeVisibilityModal')?.addEventListener('click', () => { 
  qs('#visibilityModal').style.display = 'none'; 
});

qs('#cancelVisibility')?.addEventListener('click', () => { 
  qs('#visibilityModal').style.display = 'none'; 
});

qs('#saveVisibility')?.addEventListener('click', saveVisibilitySettings);

// Load pending requests
async function loadPendingRequests() {
  try {
    const res = await fetch('/api/region-requests/admin/pending', {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const { requests } = await res.json();
      displayPendingRequests(requests || []);
    } else {
      console.error('Failed to load pending requests:', res.status);
    }
  } catch (error) {
    console.error('Failed to load pending requests:', error);
  }
}

// Display pending requests
function displayPendingRequests(requests) {
  const section = document.getElementById('pendingRequestsSection');
  const body = document.getElementById('pendingRequestsBody');
  
  if (!requests.length) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  body.innerHTML = requests.map(req => `
    <div class="request-item" style="background:#111;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div>
          <div style="font-weight:600;color:#fff">${req.userId?.name || 'Unknown User'}</div>
          <div style="color:#888;font-size:12px">${req.userId?.email || ''}</div>
        </div>
        <div style="color:#888;font-size:12px">${fmtDate(req.createdAt)}</div>
      </div>
      
      <div style="margin-bottom:8px">
        <div style="color:#ff9999;font-size:13px;margin-bottom:4px">Requested Countries:</div>
        <div style="color:#ddd;font-size:14px">${req.requestedCountries.join(', ')}</div>
      </div>
      
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn approve-request" data-request-id="${req._id}" 
                style="padding:6px 12px;border:1px solid #00b37e;border-radius:6px;font-size:12px;background:transparent;color:#00b37e">
          ✓ Approve
        </button>
        <button class="btn deny-request" data-request-id="${req._id}" 
                style="padding:6px 12px;border:1px solid #e10600;border-radius:6px;font-size:12px;background:transparent;color:#e10600">
          ✗ Deny
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners for approve/deny buttons
  body.querySelectorAll('.approve-request').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const requestId = e.target.getAttribute('data-request-id');
      approveRequest(requestId);
    });
  });
  
  body.querySelectorAll('.deny-request').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const requestId = e.target.getAttribute('data-request-id');
      denyRequest(requestId);
    });
  });
}

// Approve request
async function approveRequest(requestId) {
  if (!confirm('Are you sure you want to approve this request?')) return;
  
  try {
    const res = await fetch(`/api/region-requests/admin/${requestId}/approve`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: 'Approved by admin' })
    });
    
    if (res.ok) {
      showNotification('Request approved successfully! User will be notified.', 'success');
      await loadPendingRequests();
      await list(); // Refresh user list
      
      // Show success animation on the request item
      const requestItem = document.querySelector(`[data-request-id="${requestId}"]`).closest('.request-item');
      if (requestItem) {
        requestItem.style.background = 'rgba(0, 179, 126, 0.1)';
        requestItem.style.borderColor = '#00b37e';
        requestItem.style.animation = 'bounce 0.6s ease-in-out';
      }
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to approve request' }));
      showNotification(error.error || 'Failed to approve request', 'error');
    }
  } catch (error) {
    console.error('Error approving request:', error);
    showNotification('Failed to approve request', 'error');
  }
}

// Deny request
async function denyRequest(requestId) {
  const reason = prompt('Please provide a reason for denial (optional):');
  if (reason === null) return; // User cancelled
  
  try {
    const res = await fetch(`/api/region-requests/admin/${requestId}/deny`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: reason || 'Denied by admin' })
    });
    
    if (res.ok) {
      showNotification('Request denied. User will be notified with reason.', 'error');
      await loadPendingRequests();
      
      // Show error animation on the request item
      const requestItem = document.querySelector(`[data-request-id="${requestId}"]`).closest('.request-item');
      if (requestItem) {
        requestItem.style.background = 'rgba(225, 6, 0, 0.1)';
        requestItem.style.borderColor = '#e10600';
        requestItem.style.animation = 'bounce 0.6s ease-in-out';
      }
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to deny request' }));
      showNotification(error.error || 'Failed to deny request', 'error');
    }
  } catch (error) {
    console.error('Error denying request:', error);
    showNotification('Failed to deny request', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  
  const colors = {
    success: '#00b37e',
    error: '#e10600',
    info: '#3ea6ff'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0b0b0b;
    border: 2px solid ${colors[type] || colors.info};
    color: #ddd;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 9999;
    max-width: 400px;
    animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  // Add glow effect for important notifications
  if (type === 'success' || type === 'error') {
    notification.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${colors[type]}40`;
  }
  
  notification.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="width:8px;height:8px;border-radius:50%;background:${colors[type] || colors.info};margin-top:6px;flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-weight:600;margin-bottom:4px;color:#fff">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}</div>
        <div style="font-size:14px;line-height:1.4">${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#999;cursor:pointer;font-size:16px;padding:4px;border-radius:4px;transition:background 0.2s;width:24px;height:24px;display:flex;align-items:center;justify-content:center" onmouseover="this.style.background='#333'" onmouseout="this.style.background='transparent'">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 8 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutToRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }
  }, 8000);
}

// Tab functionality
function initTabs() {
  const usersTab = document.getElementById('usersTab');
  const locationsTab = document.getElementById('locationsTab');
  const usersTabContent = document.getElementById('usersTabContent');
  const locationsTabContent = document.getElementById('locationsTabContent');

  if (!usersTab || !locationsTab || !usersTabContent || !locationsTabContent) return;

  usersTab.addEventListener('click', () => {
    // Update tab buttons
    usersTab.classList.add('active');
    usersTab.style.background = '#111';
    usersTab.style.borderBottom = '2px solid #ff4d4d';
    usersTab.style.color = '#fff';
    
    locationsTab.classList.remove('active');
    locationsTab.style.background = 'transparent';
    locationsTab.style.borderBottom = '2px solid transparent';
    locationsTab.style.color = '#888';

    // Update tab content
    usersTabContent.style.display = 'block';
    locationsTabContent.style.display = 'none';
  });

  locationsTab.addEventListener('click', () => {
    // Update tab buttons
    locationsTab.classList.add('active');
    locationsTab.style.background = '#111';
    locationsTab.style.borderBottom = '2px solid #ff4d4d';
    locationsTab.style.color = '#fff';
    
    usersTab.classList.remove('active');
    usersTab.style.background = 'transparent';
    usersTab.style.borderBottom = '2px solid transparent';
    usersTab.style.color = '#888';

    // Update tab content
    locationsTabContent.style.display = 'block';
    usersTabContent.style.display = 'none';
  });
}

// Load user locations
async function loadLocations() {
  try {
    const res = await fetch('/api/location/admin/all', {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to load locations: ${res.status}`);
    }

    const { locations } = await res.json();
    displayLocations(locations);

  } catch (error) {
    console.error('Error loading locations:', error);
    showNotification('Failed to load locations: ' + error.message, 'error');
  }
}

// Display locations in table
function displayLocations(locations) {
  const tbody = document.getElementById('locationsBody');
  if (!tbody) return;

  if (!locations || locations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding:40px;text-align:center;color:#888;font-style:italic">
          No location data available
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = locations.map(location => `
    <tr style="transition:background-color 0.2s" onmouseover="this.style.backgroundColor='#1a1a1a'" onmouseout="this.style.backgroundColor='transparent'">
      <td style="padding:16px;border-top:1px solid #222">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:linear-gradient(135deg, #ff4d4d, #ff6b6b);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff">
            📍
          </div>
          <div>
            <div style="color:#fff;font-weight:500;font-size:14px">${location.userName || '—'}</div>
          </div>
        </div>
      </td>
      <td style="padding:16px;border-top:1px solid #222;color:#ccc;font-size:14px">${location.userEmail || '—'}</td>
      <td style="padding:16px;border-top:1px solid #222;color:#ccc;font-size:14px">
        <div style="font-family:monospace;background:#1a1a1a;padding:4px 8px;border-radius:4px;border:1px solid #333">
          ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
        </div>
      </td>
      <td style="padding:16px;border-top:1px solid #222;color:#888;font-size:14px">${formatDate(location.timestamp)}</td>
      <td style="padding:16px;border-top:1px solid #222">
        <div style="display:flex;gap:8px">
          <button onclick="openGoogleMaps(${location.latitude}, ${location.longitude})" style="padding:6px 12px;background:linear-gradient(135deg, #4d79ff, #6b8cff);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(77,121,255,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
            View Map
          </button>
          <button onclick="deleteLocation('${location._id}')" style="padding:6px 12px;background:linear-gradient(135deg, #ff4d4d, #ff6b6b);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(255,77,77,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Open Google Maps with coordinates
function openGoogleMaps(latitude, longitude) {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  window.open(url, '_blank');
}

// Delete location
async function deleteLocation(locationId) {
  if (!confirm('Are you sure you want to delete this location?')) return;

  try {
    const res = await fetch(`/api/location/admin/${locationId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to delete location: ${res.status}`);
    }

    showNotification('Location deleted successfully', 'success');
    loadLocations(); // Refresh the list

  } catch (error) {
    console.error('Error deleting location:', error);
    showNotification('Failed to delete location: ' + error.message, 'error');
  }
}

// Format date for display
function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

// Initial load
list().catch(err => {
  console.error(err);
});

// Load pending requests
loadPendingRequests();

// Initialize tab functionality
initTabs();

// Load locations on page load
loadLocations();

// Add refresh button event listener
document.getElementById('refreshLocationsBtn')?.addEventListener('click', () => {
  loadLocations();
});
