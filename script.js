/*
  script.js
  - Client-side event tracking saved to localStorage for development.
  - A/B CTA variant assignment to test which CTA copy converts better.
  - Analytics placeholder hook (set data-analytics-id on <body> to enable).
  - Mobile nav toggle, smooth scroll, toast UI, and debug shortcuts.
*/

// Utility: Show a small toast message to the user
function showToast(message, timeout = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => (toast.style.display = 'none'), 300);
  }, timeout);
}

// Simple client-side event tracker (stores events in localStorage)
function trackEvent(name, data = {}) {
  try {
    // Attach the assigned CTA variant (if any) to all events
    const variant = localStorage.getItem('cta_variant');
    if (variant) data.variant = variant;

    const key = 'aws_tracking_events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.push({name, data, ts: new Date().toISOString()});
    localStorage.setItem(key, JSON.stringify(events));

    // Optionally send to a remote analytics endpoint if configured on the page
    const analyticsId = document.body.dataset.analyticsId || '';
    if (analyticsId) {
      sendToAnalytics(name, data);
    }

    console.log('Tracked event:', name, data);
  } catch (err) {
    console.warn('Tracking failed', err);
  }
}

// Placeholder to send events to a real analytics provider
function sendToAnalytics(eventName, payload) {
  try {
    // Prefer gtag when loaded/configured for GA4
    if (window.gtag && typeof window.gtag === 'function') {
      // GA4 expects the event name and parameters; we pass payload directly
      try { window.gtag('event', eventName, payload || {}); }
      catch (e) { console.warn('gtag send failed', e); }
      return;
    }

    // Fallback: send to a configured analytics endpoint using sendBeacon
    const endpoint = document.body.dataset.analyticsEndpoint || '';
    if (endpoint && navigator.sendBeacon) {
      const b = new Blob([JSON.stringify({event: eventName, payload})], {type: 'application/json'});
      navigator.sendBeacon(endpoint, b);
    }
  } catch (err) {
    // ignore send errors in client-side placeholder
    console.warn('sendToAnalytics failed', err);
  }
}

// Assign or read an A/B test variant for CTA copy and apply it
function assignCTAVariant() {
  let variant = localStorage.getItem('cta_variant');
  if (!variant) {
    // Randomly pick A or B and persist for the user
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('cta_variant', variant);
    trackEvent('cta_variant_assigned', {variant});
  }

  // Map variant to actual button copy
  const copyA = 'Start AWS Free Tier';
  const copyB = 'Try AWS Free Tier Today';
  const text = variant === 'A' ? copyA : copyB;
  document.querySelectorAll('#cta-btn, #cta-btn-2').forEach(btn => {
    // Keep original data-url and aria-label but change visible text
    btn.textContent = text;
    btn.setAttribute('aria-label', text);
  });
}

// Utility: download tracked events as a JSON file
function exportTrackedEvents() {
  try {
    const key = 'aws_tracking_events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    const blob = new Blob([JSON.stringify(events, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aws-tracking-events-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('Export failed', err);
  }
}

// CTA button behavior: open AWS Free Tier in a new tab and record the click
function handleCTAClick(e) {
  const url = e.currentTarget.getAttribute('data-url');
  if (!url) return;

  // Track the CTA click including which variant was shown
  trackEvent('cta_click', {url});

  // Give the user feedback and open the link
  showToast('Opening AWS Free Tier...');
  window.open(url, '_blank', 'noopener');
}

// Attach to native affiliate links marked with data-affiliate
function bindAffiliateLinks() {
  document.querySelectorAll('a[data-affiliate]').forEach(a => {
    a.addEventListener('click', (e) => {
      const url = a.href;
      const affiliate = a.getAttribute('data-affiliate');
      trackEvent('affiliate_click', {affiliate, url});
      // make link safe for external navigation
      a.setAttribute('rel', 'nofollow noopener');
    });
  });
}

// Debug: show tracked events in console and a toast (Ctrl+Shift+T)
function viewTrackedEvents() {
  try {
    const key = 'aws_tracking_events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    console.table(events);
    showToast(`${events.length} tracked events`);
  } catch (err) {
    console.warn('Unable to read tracked events', err);
  }
}

// Mobile nav toggle logic
function setupMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when focus moves away or a link is clicked (improves accessibility)
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll for internal anchor links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      // If the href is just '#', ignore
      const href = link.getAttribute('href');
      if (href === '#') return;

      // Default behavior: smooth scroll to the element
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });
}

// Set current year in footer
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Attach event listeners to CTA buttons
function bindCTAs() {
  document.querySelectorAll('#cta-btn, #cta-btn-2').forEach(btn => {
    btn.addEventListener('click', handleCTAClick);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupSmoothScroll();
  assignCTAVariant();
  bindCTAs();
  bindAffiliateLinks();
  setYear();

  // Track that the site has initialized for internal diagnostics
  trackEvent('site_initialized', {version: '1.0.0'});

  // Keyboard shortcut to view tracked events: Ctrl+Shift+T
  // Export events: Ctrl+Shift+E
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
      viewTrackedEvents();
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
      exportTrackedEvents();
      showToast('Exported events file');
    }
  });
});
