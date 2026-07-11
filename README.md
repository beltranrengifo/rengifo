# rengifo.es

My personal résumé site — a single, elegant page telling the story from film-and-TV
sound engineer to senior frontend / design-systems engineer. Bilingual (EN/ES),
static, fast, and print-to-PDF friendly.

**Live:** [rengifo.es](https://rengifo.es) · **Author:** Beltrán Rengifo

---

## Highlights

- **Bilingual (EN / ES)** via [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) — one language per prerendered route (`/` and `/es/`), type-safe messages, instant language switch as a link.
- **Static & fast** — Astro ships zero JS by default; the only client script drives scroll reveals, the cursor glow, and print.
- **Token-driven design system** — the palette, type scale and radii live in a Tailwind v4 `@theme` block; components consume semantic tokens (`bg-canvas`, `text-ink`, `font-serif`…).
- **Motion, done responsibly** — staggered hero reveals, drifting glow orbs, a cursor-following glow, and hover states — all gated on `prefers-reduced-motion`.
- **Print / PDF** — a dedicated `@media print` layout strips the chrome and prints cleanly (including the dark contact footer).
- **A pure-CSS cat** 🐈 salvaged from the previous rengifo.es — hover it in the footer.

## Tech stack

| Area      | Choice                                                                 |
| --------- | ---------------------------------------------------------------------- |
| Framework | [Astro](https://astro.build) 7 (static output)                         |
| Styling   | [Tailwind CSS](https://tailwindcss.com) v4 (CSS-first `@theme` tokens) |
| i18n      | [Paraglide JS](https://inlang.com) (inlang message format)             |
| Language  | TypeScript (strict)                                                    |
| Fonts     | Schibsted Grotesk + Newsreader (Google Fonts)                          |
| Tooling   | ESLint · Prettier · `astro check`                                      |
| Hosting   | [Vercel](https://vercel.com)                                           |

## Getting started

Requires **Node 22+**.

```bash
npm install
npm run dev        # → http://localhost:4321
```

### Scripts

| Script            | Does                                            |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the dev server                            |
| `npm run build`   | Build the static site to `dist/`                |
| `npm run preview` | Preview the production build                    |
| `npm run check`   | Type-check with `astro check`                   |
| `npm run lint`    | Lint with ESLint (`lint:fix` to autofix)        |
| `npm run format`  | Format with Prettier (`format:check` to verify) |

## Project structure

```text
src/
├── components/        # Hero, Experience, SideProjects, Capabilities, Education,
│                      # ContactFooter, Header, Cat, SectionHeader, Logo
├── data/              # Typed content: experience, projects, capabilities, education
├── i18n/
│   └── messages/      # en.json + es.json — ALL copy lives here
├── lib/i18n.ts        # t() helper, locale resolution, contact details
├── layouts/Layout.astro
├── pages/
│   ├── index.astro    # English (/)
│   └── es/index.astro # Spanish (/es/)
├── scripts/resume.ts  # print · scroll reveals · cursor glow
└── styles/global.css  # @theme tokens · keyframes · print rules
```

## Editing content

- **Copy** (both languages) lives in `src/i18n/messages/{en,es}.json`. Keys are
  self-describing (`exp_mews_techlead_blurb`, `proj_ensayadero_desc`, …). Edit the
  JSON — the Paraglide Vite plugin recompiles on the next dev/build.
- **Structure** (roles, dates, links, ordering, tech tags) lives as typed data in
  `src/data/*.ts`, referencing the message keys.
- **Design tokens** (colours, fonts, radii) live in the `@theme` block at the top of
  `src/styles/global.css`.

> `src/paraglide/` is generated from the message files at build time and is
> git-ignored — never edit it by hand.

## Deployment

Hosted on **Vercel**. It auto-detects Astro; the defaults are correct
(`astro build` → `dist/`), no adapter or environment variables required. Every push
to `main` triggers a deploy.

## Credits

- Design reference and the CSS cat are adapted from earlier iterations of rengifo.es.
- Built with [Claude Code](https://claude.com/claude-code).
