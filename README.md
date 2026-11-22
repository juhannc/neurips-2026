# NeurIPS 2026 Sydney Guide

Offline-first, no-framework PWA for `https://neurips-2026.chrstnsn.de/`.

## Deployment

The repository root contains the static app and `CNAME` for `neurips-2026.chrstnsn.de`.

1. Push the files to `main` in `juhannc/neurips-2026`.
2. In **Settings → Pages**, select **GitHub Actions** as the build/deployment source.
3. Confirm `neurips-2026.chrstnsn.de` as the custom domain; DNS CNAME must target `juhannc.github.io`.
4. Verify HTTPS is enabled after DNS/Pages validation finishes.
5. Open `https://neurips-2026.chrstnsn.de/` in iPhone Safari → Share → Add to Home Screen.

The `pages.yml` workflow checks JavaScript and guide data, then deploys the static site on each push to `main`. The app does not require Node dependencies or a build step. There is no analytics, backend, or client account.

## Calendar export

**Download all events (.ics)** is available on the dashboard, in Schedule, and in Settings. Each schedule row and event detail has its own **.ics** download. The generated RFC 5545 files declare `TZID:Australia/Sydney`, including AEDT/AEST transitions. Events without a confirmed start/end time export as *transparent, tentative all-day reminders*, explicitly stating that their times are unknown. Proposed and optional events can conflict; an export does not indicate registration.

There are also three previously curated static .ics calendars (master, focus, posters) available in the interface.

## Content and safety

- `guide.json` is a dated planning snapshot, not a live NeurIPS feed.
- WRL: Friday December 11; TAE: Saturday December 12. Exact individual TAE poster assignment unconfirmed.
- Optiver × NVIDIA × Anthropic Research Exchange: Tuesday December 8, 18:00–22:00; Intel rooftop Tuesday 18:00–21:00; NVIDIA celebration Thursday 18:00–22:00.
- Local notes, tasks and checkmarks are stored in `localStorage` and can be backed up as JSON.
- A service worker caches the guide for offline access. Subsequent deployments update the cache.
- Never put private invitation codes or personal contact information directly in the public `guide.json`.

## Local development

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765` in a browser. The service worker works on HTTPS and localhost.
