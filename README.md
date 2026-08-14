# DIN — Digital Impact Network

Local workspace for the **Mapping** and **Event finder** features.

## Structure

```
mapping/          ← self-contained feature (merge this into main)
  index.ts        ← export: MappingPage
  MappingPage.tsx
  components/
  data/
  lib/
  assets/
  styles.css
src/              ← thin Vite shell for local preview only
  main.tsx
```

## Preview locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Link into the main DIN site

1. Copy/merge the `mapping/` folder into the main repo.
2. Install peers if missing: `react-globe.gl`, `three`, `lucide-react` (+ Tailwind).
3. Mount as a route or tab:

```tsx
import MappingPage from './mapping'

<Route path="/mapping" element={<div className="h-screen"><MappingPage /></div>} />
```

Styles ship with `MappingPage` — no separate CSS import needed.