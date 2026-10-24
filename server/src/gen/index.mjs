/**
 * Brief in, finished page out.
 *
 * The page is a single self-contained HTML file: inlined CSS, no build step,
 * no JavaScript needed to read it. One stylesheet request for the typefaces
 * and the photographs come from a CDN; everything else is in the file.
 */
import { getDirection } from './directions.mjs'
import { stylesheet } from './css.mjs'
import { buildCopy } from './copy.mjs'
import * as S from './sections.mjs'
import { esc, clean, checkBrief } from '../guardrail.mjs'
import { normaliseBrief } from '../brief.mjs'

export function generateSite(rawBrief = {}, { origin = '' } = {}) {
  const brief = rawBrief.slug ? rawBrief : normaliseBrief(rawBrief)

  const verdict = checkBrief(brief)
  if (!verdict.allow) {
    const err = new Error(verdict.reason)
    err.code = 'BRIEF_REJECTED'
    err.detail = verdict
    throw err
  }

  const d = getDirection(brief.direction)
  const copy = buildCopy(brief)
  const title = `${copy.name}${copy.place ? ` · ${copy.place}` : ''}`
  const description = clean(`${copy.headline}. ${copy.subhead}`, 155)
  const pic = S.heroImage(brief, 1200)
  const canonical = origin && brief.slug ? `${origin}/s/${brief.slug}` : ''

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="${d.color.ground}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(pic.src)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${d.fonts.google}&display=swap">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon(d, copy.name))}">
<style>${stylesheet(d)}</style>
</head>
<body id="top">
<a class="skip" href="#main">Skip to content</a>
${S.nav(brief, copy)}
<main id="main">
${S.hero(brief, copy, d)}
${S.offerings(brief, copy, d)}
${S.prices(brief, copy, d)}
${S.words(brief, copy, d)}
${S.about(brief, copy, d)}
${S.contact(brief, copy, d)}
</main>
${S.footer(brief, copy)}
<script type="application/ld+json">${jsonLd(brief, copy, canonical, pic.src)}</script>
</body>
</html>`

  return {
    html,
    meta: {
      slug: brief.slug,
      title,
      description,
      direction: brief.direction,
      directionName: d.name,
      category: brief.category,
      headline: copy.headline,
      bytes: Buffer.byteLength(html, 'utf8'),
    },
    brief,
    copy,
  }
}

/** A letter mark in the direction's own colours, so the tab looks deliberate. */
function favicon(d, name) {
  const letter = esc((name || 'D').trim().charAt(0).toUpperCase())
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${d.color.accent}"/><text x="32" y="44" font-family="Georgia,serif" font-size="36" font-weight="600" text-anchor="middle" fill="${d.color.accentInk}">${letter}</text></svg>`
}

/** Structured data, so the page can actually be found. */
function jsonLd(brief, copy, canonical, image) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: copy.name,
    description: copy.subhead,
    ...(canonical ? { url: canonical } : {}),
    ...(image ? { image } : {}),
    ...(brief.phone ? { telephone: brief.phone } : {}),
    ...(brief.email ? { email: brief.email } : {}),
    ...(copy.place
      ? { address: { '@type': 'PostalAddress', addressLocality: copy.place, addressCountry: 'IN' } }
      : {}),
    ...(brief.hours ? { openingHours: brief.hours } : {}),
    ...(brief.prices?.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: copy.headings.prices,
            itemListElement: brief.prices.map((p) => ({
              '@type': 'Offer',
              name: p.label,
              price: p.amount,
              priceCurrency: 'INR',
            })),
          },
        }
      : {}),
  }
  // Escaped so a closing tag inside a string cannot break out of the script.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export { getDirection }
export default { generateSite }
