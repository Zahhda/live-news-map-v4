// public/app.js

// --- Toast (self-contained: injects styles + root) ---
(function(){
  if (window.toast) return;
  function ensureToastStyles(){
    if (document.getElementById('toastStyle')) return;
    const css = `
      #toastRoot{position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-8px);z-index:9999;pointer-events:none}
      .toast{min-width:260px;max-width:86vw;margin:0 auto;background:#0b0b0b;border:1px solid #333;color:#ddd;padding:10px 14px;border-radius:12px;box-shadow:0 6px 30px rgba(0,0,0,.45);font-size:14px;line-height:1.35;display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(-8px);transition:opacity .14s ease,transform .14s ease,border-color .14s ease;pointer-events:auto}
      .toast.show{opacity:1;transform:translateY(0)}
      .toast .dot{width:10px;height:10px;border-radius:50%}
      .toast.info{border-color:#3ea6ff}.toast.info .dot{background:#3ea6ff}
      .toast.success{border-color:#00b37e}.toast.success .dot{background:#00b37e}
      .toast.error{border-color:#e10600}.toast.error .dot{background:#e10600}
    `;
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = css;
    document.head.appendChild(s);
  }
  function ensureRoot(){
    let root = document.getElementById('toastRoot');
    if (!root){ root = document.createElement('div'); root.id = 'toastRoot'; document.body.appendChild(root); }
    return root;
  }
  window.toast = function(message, type='info', ttl=1800){
    ensureToastStyles();
    const root = ensureRoot();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${message}</span>`;
    root.appendChild(el);
    requestAnimationFrame(()=> el.classList.add('show'));
    const t = setTimeout(()=>{
      el.classList.remove('show');
      setTimeout(()=> el.remove(), 180);
    }, Math.max(800, ttl));
    el.addEventListener('click', ()=>{ clearTimeout(t); el.classList.remove('show'); setTimeout(()=> el.remove(), 180); });
  };
})();

// -----------------------------------------------------

let map;
let markers = new Map(); // regionId -> google.maps.Marker
let regions = [];
let byCountry = {};
let currentRegionId = null;
let aborter = null;
const cache = new Map(); // regionId -> { ts, payload }

// Language state
let currentLanguage = 'en'; // 'en' or 'it'
let originalContent = new Map(); // Store original content for each element

// User visibility state
let userVisibilitySettings = {
  visibleRegions: [],
  visibleCountries: [],
  hasVisibilityRestrictions: false
};

// Region request state
let allAvailableCountries = [];
let allAvailableRegions = [];
let selectedCountries = [];
let requestCooldownTimer = null;

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

// ---------- NEW: detail + saved state ----------
let newsListCache = [];   // last fetched list for the selected region
let showingDetail = null; // when non-null, sidebar is in "single story" mode

// helpers for auth (so we can open modal if not logged in)
async function me() {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!r.ok) return null;
    const j = await r.json();
    return j.user || null;
  } catch { return null; }
}
function openAuthModalSafely(){ try{ if (typeof openModal==='function') openModal(); }catch{} }

// Load user visibility settings
async function loadUserVisibilitySettings() {
  try {
    const r = await fetch('/api/auth/me/visibility', { credentials: 'same-origin' });
    if (r.ok) {
      const settings = await r.json();
      userVisibilitySettings = settings;
    }
  } catch (error) {
    console.error('Failed to load user visibility settings:', error);
  }
}

// Show visibility warning if user has restrictions
function showVisibilityWarning() {
  if (!userVisibilitySettings.hasVisibilityRestrictions) return;
  
  // Remove existing warning
  const existingWarning = document.getElementById('visibilityWarning');
  if (existingWarning) existingWarning.remove();
  
  // Create warning element
  const warning = document.createElement('div');
  warning.id = 'visibilityWarning';
  warning.className = 'visibility-warning';
  warning.innerHTML = `
    <span>Your access is limited to specific regions and countries.</span>
    <button id="requestAccessBtn" class="btn" style="padding:6px 12px;border:1px solid #ff4d4d;border-radius:6px;font-size:12px;background:transparent;color:#ff4d4d;margin-left:8px">
      Request Access
    </button>
  `;
  
  // Insert warning after the topbar
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.insertAdjacentElement('afterend', warning);
  }
  
  // Add event listener for request button
  const requestBtn = document.getElementById('requestAccessBtn');
  if (requestBtn) {
    requestBtn.addEventListener('click', openRegionRequestModal);
  }
}

// ---------- Refresh System ----------

// Enhanced refresh function with animations
async function refreshData() {
  const refreshBtn = document.getElementById('refreshBtn');
  const originalText = refreshBtn.textContent;
  
  // Add loading state
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = '<span class="refresh-loading"></span> Refreshing...';
  
  try {
    // Run all refresh operations in parallel for speed
    const refreshPromises = [
      loadUserVisibilitySettings(),
      renderAllRegionMarkers(true),
      refreshNewsData()
      // Note: Removed checkRequestStatusUpdates() - real-time notifications handle this
    ];
    
    // Wait for all operations to complete
    await Promise.all(refreshPromises);
    
    // Refresh current region if selected (this needs to be after regions are loaded)
    const currentId = document.getElementById('regionSelect').value;
    if (currentId) {
      await selectRegion(currentId, true);
    }
    
    // Success animation
    refreshBtn.classList.add('refresh-success');
    refreshBtn.innerHTML = '✓ Refreshed';
    
    setTimeout(() => {
      refreshBtn.classList.remove('refresh-success');
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }, 1500); // Reduced from 2000ms to 1500ms
    
  } catch (error) {
    console.error('Refresh failed:', error);
    
    // Error animation
    refreshBtn.classList.add('refresh-error');
    refreshBtn.innerHTML = '✗ Failed';
    
    setTimeout(() => {
      refreshBtn.classList.remove('refresh-error');
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }, 1500); // Reduced from 2000ms to 1500ms
  }
}

// Refresh news data
async function refreshNewsData() {
  try {
    // Get current region
    const currentRegionId = document.getElementById('regionSelect').value;
    if (currentRegionId) {
      // Fetch fresh news for current region
      const res = await fetch(`/api/news/${currentRegionId}`, {
        credentials: 'same-origin'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          // Update news list
          renderNewsList(data.news);
          
          // Update news count
          const newsCountEl = document.getElementById('newsCount');
          if (newsCountEl) {
            newsCountEl.textContent = data.news.length;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

// Real-time notification system
let eventSource = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Initialize real-time notifications
function initRealTimeNotifications() {
  if (eventSource) {
    eventSource.close();
  }
  
  eventSource = new EventSource('/api/notifications/stream', {
    withCredentials: true
  });
  
  eventSource.onopen = () => {
    console.log('Real-time notifications connected');
    reconnectAttempts = 0;
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleRealTimeNotification(data);
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    eventSource.close();
    
    // Attempt to reconnect
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      setTimeout(initRealTimeNotifications, 2000 * reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };
}

// Handle real-time notifications
function handleRealTimeNotification(data) {
  console.log('Received real-time notification:', data);
  
  switch (data.type) {
    case 'connected':
      console.log('Real-time notifications enabled');
      break;
      
    case 'request_approved':
      showNotification(data.message, 'success', true);
      // Refresh user visibility settings
      loadUserVisibilitySettings();
      break;
      
    case 'request_denied':
      showNotification(data.message, 'error', true);
      break;
      
    default:
      console.log('Unknown notification type:', data.type);
  }
}

// Cleanup function
function cleanupRealTimeNotifications() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

// Location sharing functionality
function initLocationSharing() {
  const locationIcon = document.getElementById('locationIcon');
  if (!locationIcon) return;

  locationIcon.addEventListener('click', async () => {
    try {
      // Show loading state
      locationIcon.style.background = 'linear-gradient(135deg, #555, #777)';
      locationIcon.querySelector('span').textContent = '⏳';
      
      // Get current location
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Send location to server
      await sendLocationToServer(latitude, longitude);
      
      // Show success state
      locationIcon.style.background = 'linear-gradient(135deg, #2d5a2d, #4a7c4a)';
      locationIcon.querySelector('span').textContent = '✓';
      
      showNotification('Location shared successfully', 'success');
      
      // Reset after 2 seconds
      setTimeout(() => {
        locationIcon.style.background = 'linear-gradient(135deg, #333, #555)';
        locationIcon.querySelector('span').textContent = '📍';
      }, 2000);
      
    } catch (error) {
      console.error('Location sharing error:', error);
      
      // Show error state
      locationIcon.style.background = 'linear-gradient(135deg, #5a2d2d, #7c4a4a)';
      locationIcon.querySelector('span').textContent = '✗';
      
      showNotification('Failed to share location: ' + error.message, 'error');
      
      // Reset after 2 seconds
      setTimeout(() => {
        locationIcon.style.background = 'linear-gradient(135deg, #333, #555)';
        locationIcon.querySelector('span').textContent = '📍';
      }, 2000);
    }
  });
}

// Get current position with better error handling and accuracy
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 60000 // 1 minute - shorter cache time for better accuracy
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Validate position accuracy
        if (position.coords.accuracy > 100) {
          console.warn('Location accuracy is low:', position.coords.accuracy, 'meters');
        }
        resolve(position);
      },
      (error) => {
        let errorMessage = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

// Send location to server
async function sendLocationToServer(latitude, longitude) {
  const response = await fetch('/api/location/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to share location');
  }

  return response.json();
}

// Note: Old notification tracking removed - real-time notifications handle deduplication

// ---------- Region Access Request System ----------

// Open region request modal
async function openRegionRequestModal() {
  // Check if user can make a request
  const canRequest = await checkRequestEligibility();
  if (!canRequest.eligible) {
    showNotification(canRequest.message, 'error');
    return;
  }

  // Load all available countries and regions
  await loadAllAvailableData();
  
  // Reset selection
  selectedCountries = [];
  
  // Populate modal
  populateCountrySelection();
  updateRegionPreview();
  updateSubmitButton();
  
  // Show modal
  document.getElementById('regionRequestModal').style.display = 'flex';
}

// Check if user can make a request
async function checkRequestEligibility() {
  try {
    const res = await fetch('/api/region-requests/eligibility', {
      credentials: 'same-origin'
    });
    
    if (res.ok) {
      const data = await res.json();
      return {
        eligible: data.canMakeRequest,
        message: data.message || 'You can make a request',
        cooldownEnds: data.cooldownEnds
      };
    } else {
      return {
        eligible: false,
        message: 'Unable to check request eligibility'
      };
    }
  } catch (error) {
    console.error('Error checking request eligibility:', error);
    return {
      eligible: false,
      message: 'Error checking request eligibility'
    };
  }
}

// Load all available countries and regions
async function loadAllAvailableData() {
  try {
    const res = await fetch('/api/regions', { credentials: 'same-origin' });
    if (res.ok) {
      const regions = await res.json();
      allAvailableRegions = regions;
      
      // Extract unique countries
      const countrySet = new Set();
      regions.forEach(region => {
        if (region.country) countrySet.add(region.country);
      });
      allAvailableCountries = Array.from(countrySet).sort();
      
      console.log('Loaded regions:', allAvailableRegions.length);
      console.log('Available countries:', allAvailableCountries);
    } else {
      console.error('Failed to load regions:', res.status);
    }
  } catch (error) {
    console.error('Failed to load available data:', error);
    allAvailableCountries = [];
    allAvailableRegions = [];
  }
}

// Populate country selection
function populateCountrySelection() {
  const container = document.getElementById('countrySelection');
  container.innerHTML = allAvailableCountries.map(country => {
    const regions = allAvailableRegions.filter(r => r.country === country);
    return `
      <label style="display:flex;align-items:center;gap:8px;padding:8px;cursor:pointer;border-radius:4px;transition:background 0.2s" 
             onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" data-country="${country}" 
               style="margin:0" onchange="handleCountrySelection('${country}')" />
        <span style="color:#fff;font-size:14px">${country}</span>
        <span style="color:#888;font-size:12px">(${regions.length} regions)</span>
      </label>
    `;
  }).join('');
  
  // Add event listeners after populating
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const country = e.target.getAttribute('data-country');
      handleCountrySelection(country);
    });
  });
}

// Handle country selection
function handleCountrySelection(country) {
  const checkbox = document.querySelector(`input[data-country="${country}"]`);
  const isChecked = checkbox.checked;
  
  if (isChecked) {
    if (selectedCountries.length >= 3) {
      checkbox.checked = false;
      showNotification('Maximum 3 countries allowed', 'error');
      return;
    }
    selectedCountries.push(country);
  } else {
    selectedCountries = selectedCountries.filter(c => c !== country);
  }
  
  updateRegionPreview();
  updateSubmitButton();
  updateSelectedCount();
}

// Update region preview
function updateRegionPreview() {
  const preview = document.getElementById('regionPreview');
  
  if (selectedCountries.length === 0) {
    preview.innerHTML = 'Select countries to see available regions';
    return;
  }
  
  const regionsByCountry = selectedCountries.map(country => {
    const regions = allAvailableRegions
      .filter(r => r.country === country)
      .slice(0, 2) // Limit to 2 regions per country
      .map(r => r.name);
    
    return `<div style="margin-bottom:4px"><strong>${country}:</strong> ${regions.length > 0 ? regions.join(', ') : 'No regions available'}</div>`;
  }).join('');
  
  preview.innerHTML = regionsByCountry || 'No regions available for selected countries';
}

// Update submit button state
function updateSubmitButton() {
  const submitBtn = document.getElementById('submitRegionRequest');
  submitBtn.disabled = selectedCountries.length === 0;
}

// Update selected count
function updateSelectedCount() {
  const countEl = document.getElementById('selectedCount');
  countEl.textContent = `Selected: ${selectedCountries.length}/3`;
}

// Submit region request
async function submitRegionRequest() {
  if (selectedCountries.length === 0) return;
  
  const submitBtn = document.getElementById('submitRegionRequest');
  const errorEl = document.getElementById('regionRequestErr');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  errorEl.textContent = '';
  
  try {
    console.log('=== REQUEST SUBMISSION DEBUG ===');
    console.log('Selected countries:', selectedCountries);
    console.log('Available regions count:', allAvailableRegions.length);
    
    // Get regions for selected countries (2 per country)
    const requestedRegions = [];
    selectedCountries.forEach(country => {
      const regions = allAvailableRegions
        .filter(r => r.country === country)
        .slice(0, 2);
      console.log(`Regions for ${country}:`, regions.map(r => ({ name: r.name, id: r._id })));
      requestedRegions.push(...regions.map(r => r._id));
    });
    
    const requestData = {
      requestedCountries: selectedCountries,
      requestedRegions: requestedRegions
    };
    
    console.log('Final request data:', requestData);
    console.log('Request data JSON:', JSON.stringify(requestData));
    
    const res = await fetch('/api/region-requests', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (res.ok) {
      const result = await res.json();
      console.log('Request result:', result);
      showNotification('Request submitted successfully! Admin will review your request.', 'success');
      document.getElementById('regionRequestModal').style.display = 'none';
      
      // Start cooldown timer
      startCooldownTimer();
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to submit request' }));
      console.error('Request error:', error);
      console.error('Error details:', {
        status: res.status,
        statusText: res.statusText,
        error: error
      });
      errorEl.textContent = error.error || 'Failed to submit request';
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    console.error('Error stack:', error.stack);
    errorEl.textContent = 'Failed to submit request';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Request';
  }
}

// Start cooldown timer
function startCooldownTimer() {
  const cooldownEnds = Date.now() + (5 * 1000); // 5 seconds
  
  function updateTimer() {
    const now = Date.now();
    const remaining = cooldownEnds - now;
    
    if (remaining <= 0) {
      clearInterval(requestCooldownTimer);
      requestCooldownTimer = null;
      const requestBtn = document.getElementById('requestAccessBtn');
      if (requestBtn) {
        requestBtn.textContent = 'Request Access';
        requestBtn.disabled = false;
      }
      return;
    }
    
    const seconds = Math.ceil(remaining / 1000);
    
    const requestBtn = document.getElementById('requestAccessBtn');
    if (requestBtn) {
      requestBtn.textContent = `Request Access (${seconds}s)`;
      requestBtn.disabled = true;
    }
  }
  
  updateTimer();
  requestCooldownTimer = setInterval(updateTimer, 1000); // Update every second
}

// Show notification
function showNotification(message, type = 'info', persistent = false) {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  
  const colors = {
    success: '#00b37e',
    error: '#e10600',
    info: '#3ea6ff',
    warning: '#ffc107'
  };
  
  const icons = {
    success: '●',
    error: '●',
    info: '●',
    warning: '●'
  };
  
  notification.style.cssText = `
    background: #0b0b0b;
    border: 2px solid ${colors[type] || colors.info};
    color: #ddd;
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    pointer-events: auto;
    animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 400px;
    position: relative;
    overflow: hidden;
  `;
  
  // Add glow effect for important notifications
  if (type === 'success' || type === 'error') {
    notification.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${colors[type]}40`;
  }
  
  notification.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="width:8px;height:8px;border-radius:50%;background:${colors[type] || colors.info};margin-top:6px;flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-weight:600;margin-bottom:4px;color:#fff">${type === 'success' ? 'Request Approved' : type === 'error' ? 'Request Denied' : 'Notification'}</div>
        <div style="font-size:14px;line-height:1.4">${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#999;cursor:pointer;font-size:16px;padding:4px;border-radius:4px;transition:background 0.2s;width:24px;height:24px;display:flex;align-items:center;justify-content:center" onmouseover="this.style.background='#333'" onmouseout="this.style.background='transparent'">×</button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Auto remove after 8 seconds for non-persistent notifications
  if (!persistent) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutToRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 8000);
  }
}

// ---------- NEW: detail styles (injected once) ----------
function ensureDetailStyles() {
  if (document.getElementById('detail-styles')) return;
  const s = document.createElement('style');
  s.id = 'detail-styles';
  s.textContent = `
    .news-item { display:grid; grid-template-columns:28px 1fr auto; gap:10px; align-items:start; padding:8px 0; }
    .news-item .icon { width:20px; height:20px; opacity:.9; margin-top:2px; }
    .news-detail img.hero { width:100%; height:auto; border-radius:10px; border:1px solid var(--border); margin-bottom:10px }
    @media (max-width: 720px){
      .news-item { grid-template-columns:24px 1fr auto; }
      .news-detail img.hero { max-height:40vh; object-fit:cover; }
    }
  `;
  document.head.appendChild(s);
}

// ---------- existing severity UI ----------
function severityFromCategory(cat = '') {
  const c = String(cat || '').toLowerCase();
  if (c === 'war' || c === 'climate') return 'red';
  if (c === 'culture' || c === 'society'|| c === 'demise') return 'yellow';
  return 'green';
}
function ensureSignalStyles() {
  if (document.getElementById('severity-signal-styles')) return;
  const style = document.createElement('style');
  style.id = 'severity-signal-styles';
  style.textContent = `
    .signalbar { display:inline-flex; align-items:center; gap:6px; margin-left:8px; }
    .signalbar .light { width:14px; height:14px; border-radius:50%; background:#d1d5db; transition:background 120ms ease; }
    .signalbar .light.red.on { background:#fa0004; }
    .signalbar .light.yellow.on { background:#ffee02; }
    .signalbar .light.green.on { background:#2faf00; }
  `;
  document.head.appendChild(style);
}
function ensureSignalBar() {
  if (document.getElementById('severitySignalBar')) return;
  const badge = document.getElementById('dominantBadge');
  if (!badge || !badge.parentElement) return;
  const bar = document.createElement('div');
  bar.className = 'signalbar';
  bar.id = 'severitySignalBar';
  bar.setAttribute('aria-label', 'Severity signal');
  bar.setAttribute('role', 'group');
  bar.innerHTML = `
    <span class="light red" title="Red: war/climate"></span>
    <span class="light yellow" title="Yellow: culture/society"></span>
    <span class="light green" title="Green: other"></span>
  `;
  badge.insertAdjacentElement('afterend', bar);
}
function updateSignalBar(severity) {
  const bar = document.getElementById('severitySignalBar');
  if (!bar) return;
  ['red', 'yellow', 'green'].forEach(color => {
    const el = bar.querySelector(`.light.${color}`);
    if (el) el.classList.toggle('on', color === severity);
  });
}
function latestCategory(items = []) {
  return (items && items.length && (items[0].category || 'others')) || 'others';
}

// ---------- maps ----------
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
  
  // Filter regions based on user visibility settings
  if (userVisibilitySettings.hasVisibilityRestrictions) {
    regions = regions.filter(region => {
      // If user has country restrictions, check if country is allowed
      if (userVisibilitySettings.visibleCountries.length > 0) {
        if (!userVisibilitySettings.visibleCountries.includes(region.country)) {
          return false;
        }
      }
      // If user has region restrictions, check if specific region is allowed
      if (userVisibilitySettings.visibleRegions.length > 0) {
        if (!userVisibilitySettings.visibleRegions.includes(region._id)) {
          return false;
        }
      }
      return true;
    });
  }
  
  byCountry = {};
  for(const r of regions){ (byCountry[r.country] ||= []).push(r); }
  const countrySel = document.getElementById('countrySelect');
  const regionSel  = document.getElementById('regionSelect');
  countrySel.innerHTML = ''; regionSel.innerHTML = '';
  const countries = Object.keys(byCountry).sort();
  for(const c of countries){ 
    const o=document.createElement('option'); 
    o.value=c; 
    o.textContent=c; 
    countrySel.appendChild(o); 
  }
  if(countries.length){ countrySel.value=countries[0]; populateRegions(countrySel.value); }
  renderAllRegionMarkers();
  
  // Show visibility warning if user has restrictions
  showVisibilityWarning();
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

  const url = `/api/news/${regionId}?limit=30${force ? '&force=1' : ''}`;
  const res = await fetch(url).then(r=>r.json());
  cache.set(regionId, { ts: now, payload: res });
  return res;
}
async function renderAllRegionMarkers(force=false){
  for(const region of regions){
    try{
      const payload = await getRegionPayload(region._id, force);
      const cat = latestCategory(payload.items);
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
  const cat = latestCategory(payload.items);
  renderRegion(region, payload, cat);

  const marker = markers.get(regionId);
  if(marker){
    marker.setIcon(makeIcon(cat));
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(()=>marker.setAnimation(null),700);
  }
}

// ---------- NEW: list/detail rendering ----------
function newsRow(it) {
  const li = document.createElement('div');
  li.className = 'news-item';
  
  // Use translated content if available, otherwise use original
  const displayTitle = it.translatedTitle || it.title;
  const displaySummary = it.translatedSummary || it.summary;
  
  li.innerHTML = `
    <img class="icon" src="${ICONS[it.category] || ICONS.others}" alt="${it.category}" />
    <div>
      <div class="title" style="font-weight:600;line-height:1.3" data-original="${escapeHtml(displayTitle)}">${escapeHtml(displayTitle)}</div>
      <div class="small" style="color:var(--muted)" data-original="${escapeHtml(it.source || '')} • ${it.isoDate ? new Date(it.isoDate).toLocaleString() : ''}">${escapeHtml(it.source || '')} • ${it.isoDate ? new Date(it.isoDate).toLocaleString() : ''}</div>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-ghost read-later" title="Read later">☆</button>
    </div>
  `;
  // click → detail
  li.addEventListener('click', (e) => {
    if (e.target.closest('.read-later')) return;
    showNewsDetail(it);
  });
  // read later
  li.querySelector('.read-later').addEventListener('click', async (e) => {
    e.stopPropagation();
    await saveReadLater(it);
  });
  return li;
}
function renderNewsList(items = []) {
  showingDetail = null;
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = `<div class="small" style="color:var(--muted);padding:8px 0">No recent items.</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const it of items) frag.appendChild(newsRow(it));
  list.appendChild(frag);
  
  // If currently in Italian, translate the new content
  if (currentLanguage === 'it') {
    setTimeout(() => translateAllContent('it'), 100);
  }
}
function showNewsDetail(it) {
  showingDetail = it;
  const wrap = document.getElementById('newsList');
  if (!wrap) return;

  // Use translated content if available, otherwise use original
  const displayTitle = it.translatedTitle || it.title;
  const displaySummary = it.translatedSummary || it.summary;

  const imgHtml = it.image ? `<img src="${it.image}" alt="" class="hero" />` : '';

  wrap.innerHTML = `
    <div class="news-detail">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
        <button id="backToList" class="btn">← Back to news</button>
        <a class="btn btn-white" href="${it.link}" target="_blank" rel="noopener">Go to source</a>
        <button id="detailSave" class="btn btn-white">☆ Read later</button>
      </div>
      ${imgHtml}
      <div style="display:flex;gap:8px;align-items:center;margin:6px 0;">
        <img class="icon" src="${ICONS[it.category] || ICONS.others}" alt="${it.category}" style="width:18px;height:18px;opacity:.9" />
        <div class="small" style="color:var(--muted)" data-original="${escapeHtml(it.source || '')} • ${it.isoDate ? new Date(it.isoDate).toLocaleString() : ''}">${escapeHtml(it.source || '')} • ${it.isoDate ? new Date(it.isoDate).toLocaleString() : ''}</div>
      </div>
      <h3 style="margin:6px 0 8px" data-original="${escapeHtml(displayTitle)}">${escapeHtml(displayTitle)}</h3>
      <p style="white-space:pre-wrap;line-height:1.5" data-original="${escapeHtml(displaySummary || '')}">${escapeHtml(displaySummary || '')}</p>
    </div>
  `;

  document.getElementById('backToList').addEventListener('click', () => renderNewsList(newsListCache));
  document.getElementById('detailSave').addEventListener('click', async () => {
    await saveReadLater(it);
  });
  
  // If currently in Italian, translate the detail content
  if (currentLanguage === 'it') {
    setTimeout(() => translateAllContent('it'), 100);
  }
}
async function saveReadLater(it) {
  const u = await me();
  if (!u) { openAuthModalSafely(); toast('Please log in to save articles', 'info'); return; }
  const payload = {
    title: it.title, summary: it.summary, link: it.link,
    isoDate: it.isoDate, image: it.image, source: it.source, category: it.category
  };
  const r = await fetch('/api/account/readlater', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const j = await r.json().catch(()=>({error:'Failed'}));
    toast(j.error || 'Failed to save', 'error');
  } else {
    toast('Added to Read later', 'success');
  }
}

// ---------- existing region renderer (now uses new list/detail) ----------
function renderRegion(region, payload, latestCat){
  const computed = latestCat || latestCategory(payload.items);
  document.getElementById('dominantBadge').textContent = ` ${computed}`;

  ensureSignalStyles();
  ensureSignalBar();
  updateSignalBar(severityFromCategory(computed));
  ensureDetailStyles();

  // keep list cache and render as list (click → detail)
  newsListCache = payload.items || [];
  const list = document.getElementById('newsList');
  if (!list) return;
  renderNewsList(newsListCache);
}

// ---------- utils ----------
function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
// Store original content for translation
function storeOriginalContent() {
  const elements = document.querySelectorAll('#newsList .title, #newsList .small, .news-detail h3, .news-detail p');
  elements.forEach(el => {
    const originalText = el.getAttribute('data-original') || el.textContent.trim();
    if (originalText && !originalContent.has(originalText)) {
      originalContent.set(originalText, originalText);
    }
  });
}

// Translate all visible content
async function translateAllContent(targetLang) {
  const elements = document.querySelectorAll('#newsList .title, #newsList .small, .news-detail h3, .news-detail p');
  if (!elements.length) return;

  // Store original content if not already stored
  storeOriginalContent();

  // Get unique texts to translate (use data-original if available)
  const textsToTranslate = new Set();
  const elementTextMap = new Map();
  
  elements.forEach(el => {
    const originalText = el.getAttribute('data-original') || el.textContent.trim();
    if (originalText) {
      textsToTranslate.add(originalText);
      elementTextMap.set(el, originalText);
    }
  });

  const texts = Array.from(textsToTranslate);
  if (!texts.length) return;

  try {
    // Add translating class for visual feedback
    document.body.classList.add('translating');
    
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target: targetLang })
    });
    
    const data = await res.json();
    if (Array.isArray(data.translations)) {
      const translationMap = new Map();
      texts.forEach((text, i) => {
        if (data.translations[i]) {
          translationMap.set(text, data.translations[i]);
        }
      });

      // Apply translations
      elements.forEach(el => {
        const originalText = elementTextMap.get(el);
        if (originalText && translationMap.has(originalText)) {
          el.textContent = translationMap.get(originalText);
          el.classList.add('translated-content');
        }
      });
    } else {
      toast(data.error || 'Translation failed', 'error');
    }
  } catch (error) {
    console.error('Translation error:', error);
    toast('Translation failed', 'error');
  } finally {
    document.body.classList.remove('translating');
  }
}

// Restore original content
function restoreOriginalContent() {
  const elements = document.querySelectorAll('#newsList .title, #newsList .small, .news-detail h3, .news-detail p');
  elements.forEach(el => {
    const originalText = el.getAttribute('data-original');
    if (originalText) {
      el.textContent = originalText;
      el.classList.remove('translated-content');
    }
  });
}

// Toggle language and translate content
async function toggleLanguage() {
  const newLang = currentLanguage === 'en' ? 'it' : 'en';
  currentLanguage = newLang;
  
  // Update UI state
  updateLanguageUI();
  
  // If switching back to English, restore original content
  if (newLang === 'en') {
    restoreOriginalContent();
  } else {
    // Translate to Italian
    await translateAllContent(newLang);
  }
}

// Update language toggle UI
function updateLanguageUI() {
  const toggle = document.getElementById('languageToggle');
  const switchInput = document.getElementById('languageSwitch');
  
  if (toggle) {
    toggle.setAttribute('data-current-lang', currentLanguage);
  }
  
  if (switchInput) {
    switchInput.checked = currentLanguage === 'it';
  }
}

// ---------- boot ----------
document.addEventListener('DOMContentLoaded', async ()=>{
  await initMap();
  await loadUserVisibilitySettings();
  await fetchRegions();

  ensureSignalStyles();
  ensureSignalBar();
  ensureDetailStyles();

  document.getElementById('countrySelect').addEventListener('change', e => populateRegions(e.target.value));
  document.getElementById('regionSelect').addEventListener('change', e => selectRegion(e.target.value));
  document.getElementById('refreshBtn').addEventListener('click', async ()=>{
    await refreshData();
  });
  
  // Language toggle functionality
  const languageSwitch = document.getElementById('languageSwitch');
  const languageToggle = document.getElementById('languageToggle');
  
  if (languageSwitch) {
    languageSwitch.addEventListener('change', toggleLanguage);
  }
  
  if (languageToggle) {
    // Click on language labels to toggle
    const langLabels = languageToggle.querySelectorAll('.lang-label');
    langLabels.forEach(label => {
      label.addEventListener('click', () => {
        const targetLang = label.getAttribute('data-lang');
        if (targetLang !== currentLanguage) {
          toggleLanguage();
        }
      });
    });
  }
  
  // Initialize language UI
  updateLanguageUI();

  // Real-time notifications handle all status updates
  
// Initialize real-time notifications
initRealTimeNotifications();

// Initialize location sharing
initLocationSharing();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanupRealTimeNotifications);

  // Region request modal event listeners
  document.getElementById('closeRegionRequestModal')?.addEventListener('click', () => {
    document.getElementById('regionRequestModal').style.display = 'none';
  });
  
  document.getElementById('cancelRegionRequest')?.addEventListener('click', () => {
    document.getElementById('regionRequestModal').style.display = 'none';
  });
  
  document.getElementById('submitRegionRequest')?.addEventListener('click', submitRegionRequest);

  // If Account page set a "deep link" to open a story on landing:
  try {
    const raw = localStorage.getItem('lnm_open_item');
    if (raw) {
      localStorage.removeItem('lnm_open_item');
      const it = JSON.parse(raw);
      setTimeout(() => showNewsDetail(it), 250);
    }
  } catch {}
});
