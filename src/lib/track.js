// src/lib/track.js
//
// Minimal, fire-and-forget analytics tracker for the public site. Every call
// is wrapped so a network failure (or the backend not existing yet) never
// affects the page. Session id is a random string persisted in
// sessionStorage, so it survives route changes within one tab but not a new
// tab/session.
const SESSION_KEY = 'kivistone_session_id';

function getSessionId() {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function detectDeviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser() {
  const ua = navigator.userAgent || '';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/')) return 'Safari';
  return 'Other';
}

function detectOS() {
  const ua = navigator.userAgent || '';
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'GNU/Linux';
  return 'Other';
}

function utmParam(name) {
  try {
    return new URLSearchParams(window.location.search).get(name) || null;
  } catch {
    return null;
  }
}

// Sends a pageview and returns the row id (needed for the follow-up duration
// beacon), or null on any failure.
export async function trackPageview(pagePath) {
  try {
    const body = {
      session_id: getSessionId(),
      page_path: pagePath,
      device_type: detectDeviceType(),
      browser: detectBrowser(),
      os: detectOS(),
      screen_size: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      referrer: document.referrer || null,
      utm_source: utmParam('utm_source'),
      utm_medium: utmParam('utm_medium'),
      utm_campaign: utmParam('utm_campaign'),
    };
    const res = await fetch('/api/track/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.id ?? null;
  } catch {
    return null;
  }
}

// Fire-and-forget: reports how long the visitor spent on the page whose
// pageview id was returned by trackPageview(). Uses sendBeacon so it can
// fire reliably during unload/route-away without blocking navigation.
export function trackDuration(id, timeOnPageSeconds) {
  if (!id) return;
  try {
    const body = JSON.stringify({ id, time_on_page: Math.round(timeOnPageSeconds) });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/track/duration', blob);
    } else {
      fetch('/api/track/duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // never let tracking break the page
  }
}
