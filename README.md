# Ignite — Where Signal Meets Capital

Project Ignite is a concept product for early-stage venture discovery. It turns cold startup discovery into warm, high-signal deal flow through E-Cell verification, live proof-of-traction, a quantified warmth graph, pitch analytics, an AI copilot and secure deal rooms.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build
npm run preview   # serve the production build
```

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Landing narrative: noise → trust → proof → warmth → match → action |
| `/explore` | Startup discovery with filters, plus a radial warmth map |
| `/startup/:id` | Startup profile — `nova`, `forge-ai`, `orbit`, `layer`, `cinder`, `atlas-labs`, `kiln`, `parallax` |
| `/investor` | Investor dashboard |
| `/copilot` | Copilot: investor matching, pitch scan, investor-update drafts (accepts `?q=`) |
| `/deal-room` | Deal room with data room permissions, cap table and SAFE modelling |
| `/pitch/:id` | Slide-level pitch analytics |

Press `Ctrl K` / `⌘K` anywhere in the product to open the command menu.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Motion · React Router 8 · Lucide · Geist

## Structure

```
src/
  components/
    brand/     logo mark and wordmark
    charts/    hand-built SVG charts (area, sparkline, contribution grid, rings)
    graph/     network model and the canvas renderer behind the landing story
    layout/    navbar, footer, app shell, command menu
    product/   product surfaces shared by the landing page and the app
    ui/        buttons, reveals, counters, segmented control, primitives
  sections/    landing-page sections
  pages/       routes
  data/        fictional startups, investors, decks, deal room, copilot content
  hooks/  lib/  styles/
```

## Notes

- Every startup, investor, institution, person and metric is fictional demo data. Integrations such as GitHub, analytics and billing are simulated in the frontend.
- The landing hero is a Canvas renderer (`src/components/graph/storyEngine.ts`) driven by scroll progress. It pauses when offscreen and respects `prefers-reduced-motion`.
- Vite's PostCSS config is set inline in `vite.config.ts` so a `postcss.config.js` in a parent directory is never picked up.
