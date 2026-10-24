/**
 * The stylesheet for a generated site.
 *
 * One system, six identities. Shared structure keeps every page accessible and
 * responsive; the direction supplies palette, type, rhythm and its own
 * signature device. Selectors stay at one class deep so nothing cancels out.
 */

export function stylesheet(d) {
  const c = d.color
  const t = d.type
  const s = d.shape
  const dark = !!d.dark

  return `
:root {
  --ground: ${c.ground};
  --ink: ${c.ink};
  --muted: ${c.muted};
  --accent: ${c.accent};
  --accent-ink: ${c.accentInk};
  --highlight: ${c.highlight};
  --highlight-ink: ${c.highlightInk};
  --soft: ${c.soft};
  --line: ${c.line};
  --card: ${c.card};
  --panel: ${c.panel || c.accent};
  --panel-ink: ${c.panelInk || c.accentInk};

  --display: ${d.fonts.display};
  --body: ${d.fonts.body};
  --radius: ${s.radius};
  --radius-lg: ${s.radiusLg};
  --pill: ${s.pill};

  --measure: 64ch;
  --gutter: clamp(20px, 5vw, 64px);
  --band: clamp(44px, 6.4vw, 86px);
  --shadow: 0 1px 2px ${dark ? 'rgba(0,0,0,.5)' : 'rgba(16,18,22,.04)'}, 0 12px 32px -12px ${dark ? 'rgba(0,0,0,.6)' : 'rgba(16,18,22,.10)'};
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font-family: var(--body);
  font-size: ${t.bodySize};
  line-height: ${t.bodyLeading};
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

img, svg { display: block; max-width: 100%; }
img { height: auto; }

a { color: inherit; }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
${dark ? ':focus-visible { outline-color: var(--highlight); }' : ''}

.wrap {
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.band { padding-block: var(--band); }
.band-tight { padding-block: calc(var(--band) * 0.62); }

/* ---------- Type ---------- */

.display {
  margin: 0;
  font-family: var(--display);
  font-weight: ${t.displayWeight};
  letter-spacing: ${t.displayTrack};
  line-height: ${t.displayLeading};
  font-size: clamp(2.3rem, 7.2vw, 4.4rem);
  text-wrap: balance;
}

.h2 {
  margin: 0;
  font-family: var(--display);
  font-weight: ${t.displayWeight};
  letter-spacing: ${t.displayTrack};
  line-height: 1.12;
  font-size: clamp(1.6rem, 3.6vw, 2.3rem);
  text-wrap: balance;
}

.h3 {
  margin: 0;
  font-family: var(--body);
  font-weight: 600;
  font-size: 1.0625rem;
  letter-spacing: -0.005em;
}

.lede {
  margin: 0;
  max-width: 44ch;
  color: var(--muted);
  font-size: clamp(1.0625rem, 2.2vw, 1.25rem);
  line-height: 1.55;
}

.p { margin: 0; max-width: var(--measure); color: var(--muted); }
.p-ink { color: var(--ink); }

/* ---------- Header ---------- */

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 20px;
}

.wordmark {
  font-family: var(--display);
  font-weight: ${Math.min(700, t.displayWeight + 100)};
  font-size: 1.1875rem;
  letter-spacing: -0.015em;
  text-decoration: none;
}

/* ---------- Actions ---------- */

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  padding: 14px 26px;
  border: 0;
  border-radius: var(--pill);
  background: var(--accent);
  color: var(--accent-ink);
  font-family: var(--body);
  font-size: 1.0625rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: transform 160ms ease, filter 160ms ease;
}
.cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
.cta:active { transform: translateY(0); }

.cta-quiet {
  background: transparent;
  color: var(--ink);
  box-shadow: inset 0 0 0 1.5px var(--line);
}
.cta-quiet:hover { background: var(--soft); filter: none; }

.cta-loud { background: var(--highlight); color: var(--highlight-ink); }

.cta-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-self: start; }

/* ---------- Cards and lists ---------- */

.grid { display: grid; gap: clamp(14px, 2vw, 22px); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(min(100%, 248px), 1fr)); }
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); }

.card {
  padding: clamp(18px, 2.4vw, 26px);
  border-radius: var(--radius-lg);
  background: var(--card);
  box-shadow: var(--shadow);
}
${dark ? '.card { box-shadow: inset 0 0 0 1px var(--line); }' : ''}

.card-art {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--soft);
}
.card-art img { width: 100%; height: 100%; object-fit: cover; }

.stack { display: grid; gap: 10px; }
.stack-lg { display: grid; gap: clamp(16px, 2.1vw, 26px); }

.rows { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
/* Name and price hold the same line; the note drops underneath on a phone. */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 4px 18px;
  padding-block: 18px;
  border-top: 1px solid var(--line);
}
.row-note { grid-column: 1 / -1; }
@media (min-width: 640px) {
  .row { grid-template-columns: minmax(12ch, auto) 1fr auto; }
  .row-note { grid-column: auto; }
}
.row:last-child { border-bottom: 1px solid var(--line); }
.row-name { font-weight: 600; }
.row-note { color: var(--muted); font-size: 0.9375rem; }

.price {
  font-family: var(--display);
  font-weight: ${t.displayWeight};
  font-size: 1.375rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.price-from { margin-right: 4px; color: var(--muted); font-family: var(--body); font-size: 0.875rem; font-weight: 400; }

.quote { margin: 0; }
.quote-text { margin: 0; font-family: var(--display); font-size: clamp(1.125rem, 2.3vw, 1.4rem); line-height: 1.4; }
.quote-by { margin: 12px 0 0; color: var(--muted); font-size: 0.9375rem; }

.tag {
  display: inline-flex;
  justify-self: start;
  width: fit-content;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: var(--pill);
  background: var(--soft);
  color: var(--ink);
  font-size: 0.9375rem;
}

.meta { color: var(--muted); font-size: 0.9375rem; }

.strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  padding: 14px 20px;
  border-radius: var(--radius);
  background: var(--soft);
  color: var(--ink);
  font-size: 0.9375rem;
}
.strip-bit { display: inline-flex; align-items: center; gap: 8px; }

/* A quote with no card still needs an edge to sit against. */
.quote-bare { padding-left: 20px; border-left: 3px solid var(--accent); }

/* ---------- Hero shells ---------- */

.hero { position: relative; }
.hero .display { max-width: 20ch; }
.hero-centre .display { max-width: 22ch; }

.hero-split {
  display: grid;
  gap: clamp(26px, 4vw, 52px);
  align-items: center;
}
@media (min-width: 880px) {
  .hero-split { grid-template-columns: 1.05fr 0.95fr; }
}

.hero-art {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--soft);
  aspect-ratio: 4 / 5;
}
.hero-art img { width: 100%; height: 100%; object-fit: cover; }

@media (min-width: 880px) {
  .hero-art { aspect-ratio: 4 / 4.4; }
}

.hero-centre { text-align: center; display: grid; justify-items: center; gap: 26px; }
.hero-centre .lede { max-width: 38ch; }
/* A centred hero centres everything in it, including things that align to
   the start elsewhere on the page. */
.hero-centre .cta-row,
.hero-centre .tag,
.hero-centre .strip { justify-self: center; }

.footer {
  padding-block: 40px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.9375rem;
}
.footer-grid { display: flex; flex-wrap: wrap; gap: 10px 28px; justify-content: space-between; align-items: baseline; }

.sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}

.skip {
  position: absolute; left: 12px; top: -48px; z-index: 20;
  padding: 10px 16px; border-radius: var(--pill);
  background: var(--accent); color: var(--accent-ink);
  text-decoration: none; transition: top 140ms ease;
}
.skip:focus { top: 12px; }

/* One orchestrated entrance, on load only, and only if motion is welcome. */
@media (prefers-reduced-motion: no-preference) {
  .rise { animation: rise 620ms cubic-bezier(.22,1,.36,1) both; }
  .rise-1 { animation-delay: 60ms; }
  .rise-2 { animation-delay: 140ms; }
  .rise-3 { animation-delay: 220ms; }
  @keyframes rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
}

${signature(d)}

@media print {
  .cta, .skip { display: none; }
  body { background: #fff; color: #000; }
}
`.trim()
}

/** The one device each direction owns. Spend the boldness in a single place. */
function signature(d) {
  switch (d.divider) {
    /* A pie-crust edge, and the wordmark on a honey label over the photo. */
    case 'scallop':
      return `
.scallop {
  height: 22px;
  background:
    radial-gradient(circle at 11px 0, transparent 10px, var(--ground) 10.5px) 0 0 / 22px 22px repeat-x;
  background-color: var(--soft);
}
.label {
  position: absolute;
  left: clamp(14px, 4%, 28px);
  bottom: clamp(14px, 4%, 28px);
  max-width: calc(100% - 2 * clamp(14px, 4%, 28px));
  padding: 14px 20px;
  border-radius: 999px 999px 999px 999px / 60px 60px 60px 60px;
  background: var(--highlight);
  color: var(--highlight-ink);
  box-shadow: 0 10px 28px -10px rgba(42,23,32,.45);
}
.label-name { font-family: var(--display); font-weight: 600; font-size: 1.0625rem; line-height: 1.2; }
.label-note { font-size: 0.875rem; opacity: .78; }
.hero-tint { background: var(--soft); }`

    /* A single thin arc, like a drawn breath. */
    case 'arc':
      return `
.arc { display: block; width: clamp(120px, 26vw, 220px); height: auto; color: var(--accent); opacity: .5; }
.portrait {
  width: clamp(190px, 44vw, 320px);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 999px;
  background: var(--soft);
}
.portrait img { width: 100%; height: 100%; object-fit: cover; }
.hero-centre .display { max-width: 22ch; }
.rule-soft { height: 1px; background: var(--line); border: 0; margin: 0; }`

    /* Ruled rows and an index rail, like a prospectus. */
    case 'rule':
      return `
.ruled { border-top: 2px solid var(--ink); padding-top: 26px; }
.index { display: grid; align-content: start; gap: 14px; margin: 0; padding: 0; list-style: none; }
.index-item { display: flex; gap: 12px; align-items: baseline; font-size: 0.9375rem; }
.index-link { color: var(--muted); text-decoration: none; }
.index-link:hover { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
.index-num { font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 600; }
@media (min-width: 900px) {
  .with-rail { display: grid; grid-template-columns: 200px 1fr; gap: clamp(28px, 4vw, 60px); }
}
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 15px 10px; text-align: left; border-bottom: 1px solid var(--line); }
.table th { font-weight: 600; font-size: 0.875rem; color: var(--muted); }
.table td:last-child, .table th:last-child { text-align: right; }`

    /* Painted signage: deep panels with a yellow rule under them. */
    case 'band':
      return `
.panel {
  background: var(--panel);
  color: var(--panel-ink);
  border-bottom: 6px solid var(--highlight);
}
.panel .lede, .panel .p, .panel .meta { color: color-mix(in srgb, var(--panel-ink) 76%, transparent); }
.panel .strip { background: color-mix(in srgb, var(--panel-ink) 12%, transparent); color: var(--panel-ink); }
.panel .quote-bare { border-left-color: var(--highlight); }
.panel .cta-quiet { color: var(--panel-ink); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--panel-ink) 40%, transparent); }
.tile {
  display: grid;
  gap: 4px;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: inset 0 0 0 1px var(--line);
}
.tile-price { font-family: var(--display); font-weight: 800; font-size: clamp(1.5rem, 4vw, 2rem); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.tile-name { font-weight: 600; }
.tile-note { color: var(--muted); font-size: 0.875rem; }
.hero-art { aspect-ratio: 16 / 11; }`

    /* A gold hairline frame around a dark gallery. */
    case 'hairline':
      return `
.frame { box-shadow: inset 0 0 0 1px var(--line); }
.gallery { display: grid; gap: 2px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); }
.gallery-cell { position: relative; aspect-ratio: 3 / 4; overflow: hidden; background: var(--soft); }
.gallery-cell img { width: 100%; height: 100%; object-fit: cover; }
.gallery-cell-wide { grid-column: span 2; aspect-ratio: 3 / 2; }
@media (max-width: 520px) { .gallery-cell-wide { grid-column: span 1; aspect-ratio: 3 / 4; } }
.gold { color: var(--accent); }
.hr-gold { height: 1px; border: 0; margin: 0; background: linear-gradient(90deg, var(--accent), transparent); }
.hero-art { aspect-ratio: 3 / 4; border-radius: 2px; }`

    /* A solid action band, unmissable on a phone in sunlight. */
    default:
      return `
.action-band {
  background: var(--accent);
  color: var(--accent-ink);
}
.action-band .lede { color: color-mix(in srgb, var(--accent-ink) 82%, transparent); }
.action-band .display { color: var(--accent-ink); }
.call {
  display: inline-flex; align-items: center; gap: 12px;
  min-height: 60px; padding: 16px 30px;
  border-radius: var(--pill);
  background: var(--highlight); color: var(--highlight-ink);
  font-size: 1.1875rem; font-weight: 700; text-decoration: none;
}
.call:hover { filter: brightness(1.06); }
.checks { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.check { display: flex; gap: 12px; align-items: flex-start; }
.check-mark { flex: 0 0 auto; width: 22px; height: 22px; color: var(--accent); }
.strip {
  display: flex; flex-wrap: wrap; gap: 8px 24px;
  padding: 16px 20px; border-radius: var(--radius);
  background: var(--soft); font-size: 0.9375rem;
}`
  }
}

export default { stylesheet }
