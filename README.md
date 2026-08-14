# DIN — Digital Impact Network

Static marketing site plus the **Mapping** React feature.

## Run locally

```bash
npm install
npm run dev
```

- Home: http://localhost:5173/
- Mapping: http://localhost:5173/mapping.html

## Structure

```
index.html, leaders.html, …   ← site pages
styles.css, script.js
mapping.html                  ← Mapping section (site chrome + React mount)
mapping/                      ← Mapping feature module (globe, filters, events)
src/main.tsx                  ← mounts MappingPage into #root
```

## Menu

**Mapping** sits between Startups and AI Matching in the main nav.
