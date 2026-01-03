# Learn AWS — Beginner Site

Small static site with beginner-friendly AWS tutorials and affiliate CTAs.

## What I added
- `index.html`: homepage with Hero, Services, Benefits, and *Latest Tutorials* section.
- `posts/sample-post.html`: a sample tutorial that links to the AWS Free Tier.
- `script.js`: client-side tracking for CTA and affiliate clicks (stored in `localStorage`), plus a debug view.

## Track clicks (development)
- Click events are stored in `localStorage` under the key `aws_tracking_events`.
- To view tracked events open the site and press **Ctrl+Shift+T** (it logs events to the console and shows a quick toast).
- To export tracked events as JSON, press **Ctrl+Shift+E** (this downloads the collected events file).

## A/B CTA testing
- The site assigns visitors to one of two CTA variants (A or B) and records which variant was shown. This is saved in `localStorage` under `cta_variant`.
- Track clicks and variant assignments in `localStorage` for development; integrate an analytics provider for production tracking.

## Analytics integration
- Add `data-analytics-id="G-XXXXXXXX"` (your GA4 Measurement ID) to the `<body>` tag to enable Google Analytics 4. Example: `<body data-analytics-id="G-XXXXXXX">`.
- The site will dynamically load the `gtag` script only when `data-analytics-id` is set, and `trackEvent()` will call `gtag('event', ...)` for events.
- Alternatively, set `data-analytics-endpoint="https://your-endpoint/collect"` to have the site use `navigator.sendBeacon` to send events to your server.

### Quick steps to enable GA4
1. Create a Google Analytics 4 property and obtain your Measurement ID (starts with `G-`).
2. Add it to the `<body>` tag in `index.html`: `<body data-analytics-id="G-XXXXXXX">` (or set via server config).
3. Deploy the site. Events will appear in GA4 DebugView if you enable debug mode or use the GA4 realtime/engagement reports.

### Privacy & compliance
- Ensure your privacy policy and any required cookie consent banners meet local legal requirements before collecting analytics from visitors.

---

## Final testing & readiness checklist ✅
- [ ] Open `index.html` and confirm the hero CTA opens the AWS Free Tier in a new tab and shows a toast.
- [ ] Press **Ctrl+Shift+T** to verify tracked events appear in the console and toast.
- [ ] Press **Ctrl+Shift+E** to export tracked events as a JSON file.
- [ ] If enabling GA4, set `data-analytics-id` on `<body>` and confirm events appear in GA4 DebugView.
- [ ] Review `privacy.html` and ensure it meets your legal requirements before enabling analytics in production.

When all checks pass, you can push to GitHub and the included GitHub Actions workflow will publish to GitHub Pages on pushes to `main`.
## Deploy suggestions
- GitHub Pages: push this repo and enable Pages from the `main` branch root. A sample GitHub Actions workflow is included at `.github/workflows/deploy.yml` to deploy on push to `main`.
- Netlify / Vercel: drag-and-drop the site folder or connect the repo for continuous deploys.

## Notes
- Replace the simple `trackEvent` with a proper analytics provider (Google Analytics, Plausible, etc.) when ready.
- Ensure any affiliate links follow provider terms and add required disclosures (disclosure included on pages).
