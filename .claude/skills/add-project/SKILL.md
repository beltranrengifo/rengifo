---
name: add-project
description: Add a new project to the portfolio site — its own case study page (or a plain link), English and Spanish copy, a place on the board, the search embeddings and a PR. Use when the user says they have a new project to upload, publish, add or show on the site.
---

# Add a project to the portfolio

A project touches five places. Do them all in one branch and one PR.

## 1. Gather the facts first

- Ask only for what the code cannot tell you: the repo (GitHub URL or local path), a live link if any, and the story the user wants told. Let them talk; take notes; do not write copy until they are done.
- Read the repo before writing a line. For a private GitHub repo use `gh api repos/<owner>/<repo>/contents/<path> -H "Accept: application/vnd.github.raw"`. Start with `README.md`, `CLAUDE.md`/`AGENTS.md`, `docs/` (history, infra, deploy, design specs) and the package manifests. Save large files to the scratchpad and grep them.
- Date span: first and last commit (`gh api --paginate 'repos/<owner>/<repo>/commits?per_page=100' --jq '.[].commit.author.date' | sort`), as `YYYY-MM`.
- Facts drift: a doc can say "not started" for something already live. Cross-check claims against code, env tables and the latest history entries before writing them.
- Pick the integrations and highlights yourself from the repo; the user expects that. Leave out anything private to the household (family members, a baby tracker, addresses, device IPs, the people on an allow-list).

## 2. Data: `src/data/caseStudies.ts`

- A page of its own (`CaseStudy`) when there are real decisions worth explaining; a plain link (`page: false`, `href`) for small work.
- Fields: `slug`, `name` (brand, not translated), `rowKey`, `taglineKey`, `introKey`, `stack` (short labels joined with ` · `), `notes` (heading + body keys), `screenshots`, `code` (`{ href }` or `'private'`), `href` when there is somewhere live and public to look.
- `accessKey` only for gated work that has a live `href` (it renders next to the live link).
- The list is ordered by how much of the stack each project proves, not by date.

### Screenshots

- Every project page carries screenshots (3–4), public sites too. Never mockups: real screens only.
- Take them yourself with Playwright, using Google Chrome via `require('playwright')` from a repo that has it (e.g. `~/Development/tablux/web`). Use one browser, one shot at a time, closed after.
  - Sites: 1440×900 at deviceScaleFactor 2, `locale: 'es-ES'`, scrolled or clicked to each section.
  - Apps with a fixtures or demo mode (Tablux's layout matrix): their iPad landscape size, 1180×820 @2x.
  - Every shot of one project at the same size.
- Gated apps whose screens hold real people's data (students, clients): don't log in and shoot; ask the user for shots from a demo account.
- RAM: never run several builds, embeds or browsers at once (the Mac ran out of memory once). Check `memory_pressure` before heavy steps.
- Look at every image before using it. Remove what is private or reads badly out of context: third parties' names, addresses, appointments, odd voice transcriptions. Blur a region or crop; never retouch text into something it did not say. Pillow is not installed; use `sharp` from the repo's `node_modules` (`extract` + `blur` + `composite`, or `extract` to crop). Tell the user what was blurred or cropped.
- Save as `src/assets/work/<slug>-<what>.png`, import them at the top of `caseStudies.ts`, keys `cs_<slug>_shotN_alt` (what is on screen) and `cs_<slug>_shotN_cap` (one line on what it shows about the work).

## 3. Copy: `src/i18n/messages/en.json` and `es.json`

Keys, in this order: `proj_<slug>_desc` (after the previous `proj_*_desc`), `cs_<slug>_tagline`, `cs_<slug>_intro`, `cs_<slug>_n1_h` / `_n1_b` … (after the previous `cs_*` block). Insert with a script that keeps key order, then run Prettier; the diff must only add lines.

Rules (also in `bd memories`; re-read them):
- Brushstrokes, not explanations: one short clause per achievement, concrete, no mechanism lessons, no generic filler.
- State facts plainly; never try to prove things ("the site I built"), never echo the user's instructions back as copy.
- No commit or PR counts anywhere.
- Spanish must read as natural Spanish, not a calque of the English. Write each language on its own terms.
- A tagline is a few words and must fit the whole project, not one part of it (Tablux reaches tablets and phones, so a wall-only tagline was wrong). The intro says what it is and for whom; each note is one paragraph telling one part of the story, in the order it happened.
- Write the English first. Then hand the English (as JSON, every key) to a subagent briefed as a senior Spain-Spanish translator and copy editor: it writes the Spanish on its own terms from the English and these rules, keeps product names and phrases already in Spanish as they are, and returns JSON plus what was wrong. Review its output against the facts before applying it. The user has rejected first-draft Spanish; do not skip this pass.
- If the project uses AI in a meaningful way, add a line to "Built by me" in `src/data/ai.ts` (`ai_built_<slug>`, with `href` only if something public exists).

## 4. Board: `src/data/board.ts`

- `projectSpans`: `<slug>: ['YYYY-MM', 'YYYY-MM']`. The tests fail if a visible project has no span.
- Add `<slug>: 1` to the `uses` of every tech it really uses (side projects weigh 1).
- A new tech node only for a real skill the board lacks (e.g. "Embedded Linux"). Software and practice only: no hardware or vendor brands, no links to vendor sites.

## 5. Search embeddings

`npm run embed` builds the site and rewrites `src/data/board-embeddings.json`. Run it after the copy and the board are final; check the node count went up.

## 6. Gates, branch and PR

- Branch `content/<slug>` from an up-to-date `main`.
- `npm run lint`, `npm run check`, `npm test`, `npm run build` (the embed step already builds). Grep `dist/work/<slug>/index.html` and `dist/es/work/<slug>/index.html` for the tagline to confirm both pages render.
- Never start the dev server; point the user to `/work/<slug>/` and `/es/work/<slug>/`.
- One commit, no AI co-author trailer. PR with `.github/pull_request_template.md`, no "Generated with" line; leave "Copy reviewed in both English and Spanish" unchecked for the user. Give the PR link. The user merges; merging deploys and regenerates the résumé PDF.
- Track the work in beads (`bd create`, `bd close`).
