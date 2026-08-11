import { recordAnalyticsEvent, recordSecurityEvent } from './database';

let currentSessionId = null;
let deviceInfo = null;
let geoInfo = { country: 'México', city: 'Monterrey', ip: '187.190.44.12' };

function getSessionId() {
  if (currentSessionId) return currentSessionId;
  let saved = sessionStorage.getItem('gpl_session_id');
  if (!saved) {
    saved = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    sessionStorage.setItem('gpl_session_id', saved);
  }
  currentSessionId = saved;
  return currentSessionId;
}

function detectDevice() {
  if (deviceInfo) return deviceInfo;
  const ua = navigator.userAgent || '';
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  deviceInfo = { device, browser };
  return deviceInfo;
}

// Fetch IP and Geo silently
async function initGeo() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      geoInfo = {
        country: data.country_name || 'México',
        city: data.city || 'Monterrey',
        ip: data.ip || '187.190.44.12'
      };
    }
  } catch (e) {
    // Silent fallback
  }
}

let isInitialized = false;

export function initTracker() {
  if (isInitialized) return;
  isInitialized = true;
  getSessionId();
  detectDevice();
  initGeo();

  // Initial session start
  trackEvent('session_start', {
    referrer: document.referrer || 'Directo',
    screenResolution: `${window.innerWidth}x${window.innerHeight}`
  });

  // Track global clicks on buttons
  window.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a, input[type="submit"]');
    if (btn) {
      const label = btn.innerText || btn.ariaLabel || btn.name || btn.id || btn.tagName;
      trackClick(label.trim().substring(0, 50), {
        id: btn.id || null,
        className: btn.className || null
      });
    }
  }, { passive: true });
}

export function trackEvent(eventType, eventData = {}) {
  const { device, browser } = detectDevice();
  const sessionId = getSessionId();

  return recordAnalyticsEvent({
    sessionId,
    eventType,
    eventData,
    ipAddress: geoInfo.ip,
    country: geoInfo.country,
    city: geoInfo.city,
    device,
    browser,
    referrer: document.referrer || 'Directo'
  });
}

export function trackPageView(pageName) {
  return trackEvent('pageview', { page: pageName, timestamp: new Date().toISOString() });
}

export function trackClick(buttonName, details = {}) {
  return trackEvent('click', { target: buttonName, ...details });
}

export function trackFormSubmit(formName, formData = {}) {
  return trackEvent('form_submit', { form: formName, data: formData });
}

export function trackSecurityIncident(type, details = {}, severity = 'medium') {
  return recordSecurityEvent({
    eventType: type,
    ipAddress: geoInfo.ip,
    details: { ...details, userAgent: navigator.userAgent, session: getSessionId() },
    severity
  });
}
