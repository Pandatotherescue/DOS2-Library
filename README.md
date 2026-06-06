# Rivellon Crafting Codex

A searchable crafting library for **Divinity: Original Sin 2 — Definitive Edition**.

- **Search by reagent** — type any ingredient (e.g. `Source Orb`, `Empty Bottle`) or click any reagent chip to see *every recipe that uses it* plus *every way to craft it*.
- **Search by recipe** — type a result name (e.g. `Fireball Skillbook`, `Firestorm Grenade`) to see exactly what it needs.
- **Browse everything** — with the search empty, the full codex (713 recipes) is listed, grouped by category.
- **Filters** — narrow by category, and toggle the **Crafter's Kit** and **Herb Gardens** gift-bag mod recipes on/off.

Reagent data is compiled from Mellarius' [*Complete crafting tables (700+ positions)*](https://steamcommunity.com/sharedfiles/filedetails/?id=1137514488) Steam guide.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell + all styling |
| `recipes.js` | The full recipe dataset (713 recipes) |
| `app.js`     | Search engine, reagent index, themed-icon renderer |
| `vercel.json`| Static-hosting config |

No build step, no dependencies — it's a pure static site.

## Deploy to Vercel

**Option A — drag & drop**
1. Go to [vercel.com/new](https://vercel.com/new).
2. Drag this whole folder in. Framework preset: **Other**. Click **Deploy**.

**Option B — Git**
1. Push this folder to a GitHub/GitLab repo.
2. Import it at [vercel.com/new](https://vercel.com/new). No settings needed — Vercel serves the static files directly.

**Option C — CLI**
```bash
npm i -g vercel
cd dos2-crafting
vercel        # preview
vercel --prod # production
```

## Run locally
Just open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

---

*Divinity: Original Sin 2 is © Larian Studios. This is an unofficial fan reference. The reagent icons are original stylised SVGs, not extracted game assets.*
