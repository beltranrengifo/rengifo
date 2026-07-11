# Handoff: Beltrán Rengifo — Personal Resume Site

## Overview
A single-page personal resume/portfolio site for Beltrán Rengifo, a Madrid-based senior software engineer (full-stack, frontend-deep) recently available after 4 years at Mews. Goal: land a senior/staff frontend-leaning full-stack role. Tone: elegant, Nordic, professional with a wink of humour ("freshly available", "or, if you prefer gmail"). Fully bilingual (EN/ES) with a language toggle, and a "Download PDF" action that prints the page.

## About the Design Files
`Beltran Resume v2.dc.html` is a **design reference created in HTML** using a proprietary streaming component format (the `<x-dc>` wrapper and `support.js` script are runtime scaffolding — ignore them). It is NOT production code to copy verbatim.

**Task: recreate this design as a lightweight static website** — plain HTML/CSS with a small amount of vanilla JS is the ideal target (the user explicitly wants a lightweight static page; no framework needed). If a framework is already chosen in the target repo, follow its conventions instead.

The HTML file is the **source of truth for all copy** (both languages), all inline styles (exact values), and document order. Read it directly rather than trusting memory.

## Fidelity
**High-fidelity.** Recreate pixel-perfectly: colors, typography, spacing and interactions are final. All styles are inline in the reference file — treat them as the spec.

## Page Structure (single page, top to bottom)
1. **Sticky header** — logo mark left (SVG, `assets/logo.svg`, rendered inline at 18×24 with `fill: currentColor`); right: language toggle ("ESPAÑOL"/"ENGLISH" text button) + "PDF" outlined button (triggers `window.print()`). Background `rgba(246,245,242,0.88)` + `backdrop-filter: blur(12px)`, bottom hairline.
2. **Hero** — uppercase kicker line (name, title, city) → large statement H1 ("I build software end to end — with *a frontend heart*.") with the italic phrase in Newsreader serif → supporting paragraph ("full-stack engineer with 14+ years…") → availability row (accent dot + line, above a hairline) → contact links row (email, LinkedIn, ES·EN·IT). Two decorative accent-tinted radial-gradient orbs drift slowly behind (see Motion).
3. **01 Experience** — numbered section header (hairline top border in ink, "01" + uppercase title). Rows in a `minmax(140px,220px) 1fr` grid: left column = date range + company in italic serif; right column = role H3 + blurb. Mews (2022–2026) and Minsait (2018–2021) group multiple roles in one row (inner `display:grid; gap` stack, each sub-role with its own uppercase date line). Chronological order, newest first, ending with the "previous life" film/TV sound engineer row.
4. **02 Selected side projects** — same grid rows: project name in italic serif 20px left, one-liner right. Projects: Ensayadero.studio, Tartaytantas, Carabanchel Creativa, Triscaideca, PaellaLab. **All descriptions are still placeholders** (`[ one-liner pending … ]`) — keep as placeholders unless real copy is provided.
5. **03 Capabilities** — italic serif intro line ("Depth in frontend and UI engineering; working range across the whole stack.") then 4 columns (auto-fit, minmax 210px): "Frontend — the depth", "Across the stack", "UI & UX", "Practice". Plain text lists, no chips.
6. **04 Education** — two-column (auto-fit, minmax 300px) list of course — provider rows with year right-aligned, hairline under each.
7. **Contact footer** — dark ink background (#16181A), logo mark in off-white, large italic serif headline ("Need an engineer who ships end to end — and still sweats the pixels? Let's talk."), link row: `beltran@rengifo.es`, italic aside "or, if you prefer gmail," + `merloc@gmail.com`, LinkedIn, Download PDF button. Small legal line at bottom.

## Design Tokens
- Background: `#F6F5F2` (cool off-white) · Ink: `#16181A` · Body text: `#3A3E42` · Muted: `#5C6166` · Faint: `#8A8E93`
- Accent: CSS variable `--accent`, default `#2F5D8A` (muted slate blue). Alternates offered: `#16181A`, `#6B705C`, `#8C4A3B`. Used for: availability dot, hover tints (`color-mix(in srgb, var(--accent) 4%, transparent)`), glow orbs, link hover, selection background.
- Hairlines: `rgba(22,24,26,0.12)` (rows), `rgba(22,24,26,0.1)` (education), solid ink `#16181A` for section-header top borders.
- Type: **Schibsted Grotesk** (Google Fonts; 400/500/600) for everything; **Newsreader** (300/400 + italics) for italic serif accents. No monospace.
- Type scale: H1 `clamp(40px, 5.6vw, 76px)` w500 ls-0.03em; footer H2 `clamp(34px, 5vw, 56px)` Newsreader italic 300; section labels 13–15px uppercase ls 0.14–0.2em; role H3 19px w600; body 15–16px, line-height 1.6–1.65.
- Radius: 2px on buttons/rows (near-square, Nordic). Max content width 1080px, 40px side padding.

## Interactions & Behavior
- **Language toggle**: every piece of copy exists twice, `<span data-en>` and `<span data-es>`; a `data-l="en|es"` attribute on the page wrapper + CSS (`[data-l="en"] [data-es]{display:none}` and vice versa) switches languages instantly. Default: EN. Recreate with the same attribute/CSS mechanism — it's simple and robust.
- **PDF button**: `window.print()`. `@media print` hides header, buttons, orbs, cursor glow (`[data-no-print]`), forces white background, and forces all reveal elements visible.
- **Links**: ink-colored, 1px underline offset 4px at 30% opacity; hover → accent color.
- **Row hovers**: experience/project rows get `background: color-mix(in srgb, var(--accent) 4%, transparent)` with `transition: background 0.45s ease` (rows have 24px negative-margin side padding so the tint extends past the text).
- **Buttons**: outlined, on hover invert to filled ink (header) / off-white (footer), `transition: all 0.25s ease`.

## Motion (all gated on `prefers-reduced-motion`)
- **Hero load**: staggered `fadeUp` (opacity 0 + translateY(16px) → visible), 0.8s `cubic-bezier(0.2,0.6,0.2,1)`, delays 0 / 0.08s / 0.16s / 0.24s / 0.3s.
- **Scroll reveals**: elements marked `data-reveal` start hidden (opacity 0, translateY(18px)) and fade up via IntersectionObserver (threshold 0.1); elements already in the top 90% of the viewport on load are skipped (never hide above-the-fold content).
- **Hero glow orbs**: two absolutely-positioned radial-gradient circles behind the hero (`z-index:-1`, hero has `position:relative; isolation:isolate` — the isolation is required or they paint behind the page background). Big one top-right (62vw, max 820px, accent at 26%→transparent 66%), small one bottom-left (40vw, accent 15%). Animation `drift`: translate(-10%, 8%) scale(1.18), 38s / 46s, `ease-in-out infinite alternate`. Body needs `overflow-x: clip` to prevent horizontal scroll.
- **Availability dot**: `breathe` keyframe — box-shadow ring expanding 0→9px and fading, 3.2s infinite.
- **Cursor glow**: a fixed 460px radial-gradient circle (accent 14%→transparent 65%, `z-index:-1`, `pointer-events:none`) trails the mouse with lerp easing (`pos += (target-pos)*0.045` in a rAF loop). Fades in on first mousemove, fades out on `mouseleave` (0.6s opacity transition). Only on `(pointer: fine)` devices.

## State Management
Minimal: current language (string, default `'en'`), cursor-glow position (rAF loop). No data fetching. Keep it vanilla JS.

## Assets
- `assets/logo.svg` — personal "b" logomark (user-provided, single-color paths, no fill attribute → inherits color). Inline it wherever it must match text color (`fill: currentColor`).
- Google Fonts: Schibsted Grotesk, Newsreader (preconnect + single stylesheet link).

## Known Gaps / TODO for the user
- Side-project one-liners are placeholders (5 projects).
- Docline start date is an estimate ("2020 — 2021"); verify.
- No photo, no analytics, no meta/OG tags yet — add OG title/description + favicon (use the logomark) when building for real.

## Files
- `Beltran Resume v2.dc.html` — the full design reference (all copy in both languages, all styles inline, logic at the bottom in the `data-dc-script` block).
- `assets/logo.svg` — logomark.
