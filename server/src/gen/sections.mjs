/**
 * Section renderers. Every string that came from a caller goes through esc()
 * before it reaches the page, because these pages are served from our domain.
 */
import { esc, safeUrl } from '../guardrail.mjs'
import { CATEGORIES, DEFAULT_CATEGORY } from '../brief.mjs'

/* ---------- Imagery ---------- */

/** Photographs, keyed by trade. Cropped and compressed at the CDN. */
const PHOTO = {
  cake: { id: 'photo-1627247359162-4645d9f8543b', alt: 'A homemade birthday cake with berries and a gold topper' },
  yoga: { id: 'photo-1758797315487-b3b225dff7d8', alt: 'A yoga class stretching together on a garden lawn' },
  tutor: { id: 'photo-1522661067900-ab829854a57f', alt: 'A student writing sums on a classroom chalkboard' },
  henna: { id: 'photo-1762162089047-97e09435984d', alt: 'Bridal mehendi on hands with gold bangles and a silk sari' },
  tailor: { id: 'photo-1780504863007-44f229d4d33f', alt: 'A tailor at work on his sewing machine' },
  flowers: { id: 'photo-1779518088115-9dff01e01920', alt: 'A flower seller with a cart of fresh jasmine and roses' },
  shop: { id: 'photo-1759334928681-dc7ad674138e', alt: 'A shop owner standing in his handicrafts store' },
  shoes: { id: 'photo-1681657628355-bfdf41c08909', alt: 'A smiling shopkeeper in front of a wall of shoes' },
}

export const photoUrl = (key, w = 900) => {
  const p = PHOTO[key] || PHOTO.shop
  return `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=75`
}
export const photoAlt = (key) => (PHOTO[key] || PHOTO.shop).alt

export function heroImage(brief, w = 1000) {
  const custom = safeUrl(brief.photoUrl)
  if (custom) return { src: custom, alt: esc(brief.photoAlt || brief.businessName || 'Photograph of the work') }
  const cat = CATEGORIES[brief.category] || CATEGORIES[DEFAULT_CATEGORY]
  const key = brief.photo || cat.photo
  return { src: photoUrl(key, w), alt: esc(photoAlt(key)) }
}

const img = ({ src, alt }, { loading = 'lazy', sizes = '' } = {}) =>
  `<img src="${esc(src)}" alt="${alt}"${loading === 'eager' ? ' fetchpriority="high"' : ` loading="${loading}" decoding="async"`}${sizes ? ` sizes="${sizes}"` : ''}>`

/* ---------- Icons ---------- */

const ICON = {
  whatsapp: '<svg class="i" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.94-1.16-4.78-4.2-4.92-4.4-.14-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36l.54.01c.17 0 .41-.07.63.48.24.58.8 1.98.87 2.12.07.15.12.32.02.51-.1.2-.15.32-.29.49l-.44.5c-.14.15-.29.3-.13.59.17.29.73 1.2 1.56 1.95 1.07.95 1.97 1.25 2.26 1.39.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38Z"/></svg>',
  phone: '<svg class="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.6 2.6a1.6 1.6 0 0 1 1.5 1l1 2.4a1.6 1.6 0 0 1-.4 1.8L7.5 9a11.6 11.6 0 0 0 5.5 5.5l1.2-1.2a1.6 1.6 0 0 1 1.8-.4l2.4 1a1.6 1.6 0 0 1 1 1.5v2.1a1.6 1.6 0 0 1-1.8 1.6C11.2 18.6 5.4 12.8 4.5 6.1A1.6 1.6 0 0 1 6.1 4.3Z"/></svg>',
  mail: '<svg class="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
  pin: '<svg class="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  clock: '<svg class="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
  check: '<svg class="check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>',
  arc: '<svg class="arc" viewBox="0 0 220 60" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 58C2 26.7 50.3 2 110 2s108 24.7 108 56"/></svg>',
}

/* ---------- Contact actions ---------- */

export function actions(brief) {
  const out = []
  const digits = String(brief.phone || '').replace(/\D/g, '')
  const label = brief.cta || 'Get in touch'
  const wantsWhatsapp = /whatsapp/i.test(brief.action || '') || /whatsapp/i.test(label)

  if (digits && wantsWhatsapp)
    out.push({ href: `https://wa.me/${digits}`, label, icon: ICON.whatsapp, kind: 'primary' })
  if (brief.phone)
    out.push({
      href: `tel:${brief.phone}`,
      label: wantsWhatsapp ? 'Call instead' : label,
      icon: ICON.phone,
      kind: out.length ? 'quiet' : 'primary',
    })
  if (brief.email)
    out.push({ href: `mailto:${brief.email}`, label: 'Send an email', icon: ICON.mail, kind: out.length ? 'quiet' : 'primary' })
  if (!out.length) out.push({ href: '#contact', label, icon: '', kind: 'primary' })
  return out
}

const btn = (a, extra = '') => {
  const cls = ['cta', a.kind === 'quiet' ? 'cta-quiet' : '', extra].filter(Boolean).join(' ')
  return `<a class="${cls}" href="${esc(a.href)}">${a.icon}${esc(a.label)}</a>`
}

export const ctaRow = (brief, { max = 2, loud = false } = {}) =>
  `<div class="cta-row">${actions(brief)
    .slice(0, max)
    .map((a, n) => btn(a, loud && n === 0 ? 'cta-loud' : ''))
    .join('')}</div>`

/* ---------- Meta strip ---------- */

export function metaBits(brief, copy) {
  const bits = []
  if (copy.place) bits.push(`<span class="strip-bit">${ICON.pin}<span>${esc(copy.place)}</span></span>`)
  if (brief.hours) bits.push(`<span class="strip-bit">${ICON.clock}<span>${esc(brief.hours)}</span></span>`)
  return bits
}

/* ---------- Heroes, one per direction ---------- */

export function hero(brief, copy, d) {
  const pic = heroImage(brief)
  const head = esc(brief.headlineOverride || copy.headline)
  const lede = esc(copy.subhead)
  const name = esc(copy.name)

  switch (d.hero) {
    /* Hearth: the name on a honey jar label, over the photograph. */
    case 'label':
      return `
<section class="hero band-tight">
  <div class="wrap hero-split">
    <div class="stack-lg rise rise-1">
      ${copy.place ? `<span class="tag">${ICON.pin}${esc(copy.place)}</span>` : ''}
      <h1 class="display">${head}</h1>
      <p class="lede">${lede}</p>
      ${ctaRow(brief)}
    </div>
    <div class="hero-art hero-tint rise rise-2">
      ${img(pic, { loading: 'eager', sizes: '(min-width: 880px) 46vw, 100vw' })}
      <div class="label">
        <div class="label-name">${name}</div>
        ${copy.place ? `<div class="label-note">${esc(copy.place)}</div>` : ''}
      </div>
    </div>
  </div>
</section>
<div class="scallop" aria-hidden="true"></div>`

    /* Studio: centred, airy, one arc and a round portrait. */
    case 'centred':
      return `
<section class="hero band">
  <div class="wrap hero-centre">
    ${ICON.arc}
    <h1 class="display rise rise-1">${head}</h1>
    <p class="lede rise rise-2">${lede}</p>
    ${ctaRow(brief, { max: 1 })}
    <div class="portrait rise rise-3">${img(pic, { loading: 'eager' })}</div>
  </div>
</section>`

    /* Ledger: a prospectus opening, ruled, with an index of what is inside. */
    case 'ruled':
      return `
<section class="hero band-tight">
  <div class="wrap">
    <div class="with-rail">
      <ul class="index">
        ${[
          ['#offerings', copy.headings.offerings],
          ...(brief.prices?.length ? [['#prices', copy.headings.prices]] : []),
          ...(brief.testimonials?.length ? [['#words', copy.headings.words]] : []),
          ['#about', copy.headings.about],
          ['#contact', copy.headings.contact],
        ]
          .map(
            ([href, label], n) =>
              `<li class="index-item"><span class="index-num">${n + 1}</span><a class="index-link" href="${href}">${esc(label)}</a></li>`
          )
          .join('')}
      </ul>
      <div class="stack-lg ruled rise rise-1">
        <h1 class="display">${head}</h1>
        <p class="lede">${lede}</p>
        ${metaBits(brief, copy).length ? `<div class="strip">${metaBits(brief, copy).join('')}</div>` : ''}
        ${ctaRow(brief)}
      </div>
    </div>
    <div class="hero-art rise rise-2" style="aspect-ratio:16/7;margin-top:clamp(26px,4vw,44px)">
      ${img(pic, { loading: 'eager', sizes: '100vw' })}
    </div>
  </div>
</section>`

    /* Market: a painted panel, prices front and centre. */
    case 'panel':
      return `
<section class="hero panel band-tight">
  <div class="wrap hero-split">
    <div class="stack-lg rise rise-1">
      <h1 class="display">${head}</h1>
      <p class="lede">${lede}</p>
      ${ctaRow(brief, { loud: true })}
    </div>
    <div class="hero-art rise rise-2">${img(pic, { loading: 'eager', sizes: '(min-width: 880px) 46vw, 100vw' })}</div>
  </div>
</section>`

    /* Atelier: the work first, type small and quiet underneath. */
    case 'gallery':
      return `
<section class="hero">
  <div class="wrap band-tight">
    <div class="hero-split">
      <div class="stack-lg rise rise-1">
        <h1 class="display">${head}</h1>
        <hr class="hr-gold">
        <p class="lede">${lede}</p>
        ${ctaRow(brief, { max: 1 })}
      </div>
      <div class="hero-art frame rise rise-2">${img(pic, { loading: 'eager', sizes: '(min-width: 880px) 46vw, 100vw' })}</div>
    </div>
  </div>
</section>`

    /* Civic: the phone number is the page. */
    default:
      return `
<section class="hero action-band band-tight">
  <div class="wrap stack-lg">
    <h1 class="display rise rise-1">${head}</h1>
    <p class="lede rise rise-2">${lede}</p>
    <div class="cta-row rise rise-3">
      ${brief.phone
        ? `<a class="call" href="tel:${esc(brief.phone)}">${ICON.phone}${esc(brief.phone)}</a>`
        : ctaRow(brief, { max: 1 })}
    </div>
    ${metaBits(brief, copy).length ? `<div class="strip">${metaBits(brief, copy).join('')}</div>` : ''}
  </div>
</section>`
  }
}

/* ---------- Offerings ---------- */

export function offerings(brief, copy, d) {
  if (!copy.offerings?.length) return ''
  const heading = esc(copy.headings.offerings)

  if (d.hero === 'gallery') {
    const pic = heroImage(brief, 700)
    const cells = copy.offerings
      .slice(0, 3)
      .map(
        (o, n) =>
          `<figure class="gallery-cell ${n === 0 ? 'gallery-cell-wide' : ''}" style="margin:0">
             ${img({ src: photoUrl((CATEGORIES[brief.category] || CATEGORIES[DEFAULT_CATEGORY]).photo, 700), alt: esc(o.title) })}
           </figure>`
      )
      .join('')
    return `
<section class="band" id="work">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <div class="gallery">${cells}</div>
    <div class="grid grid-3">
      ${copy.offerings
        .map((o) => `<div class="stack"><h3 class="h3 gold">${esc(o.title)}</h3><p class="p">${esc(o.body)}</p></div>`)
        .join('')}
    </div>
  </div>
</section>`
  }

  if (d.divider === 'rule') {
    return `
<section class="band" id="offerings">
  <div class="wrap with-rail">
    <h2 class="h2">${heading}</h2>
    <ul class="rows">
      ${copy.offerings
        .map(
          (o) =>
            `<li class="row"><span class="row-name">${esc(o.title)}</span><span class="row-note">${esc(o.body)}</span></li>`
        )
        .join('')}
    </ul>
  </div>
</section>`
  }

  const cat = CATEGORIES[brief.category] || CATEGORIES[DEFAULT_CATEGORY]
  return `
<section class="band" id="offerings">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <div class="grid grid-3">
      ${copy.offerings
        .map(
          (o, n) => `<article class="card">
        <div class="card-art">${img({ src: photoUrl(cat.photo, 600), alt: esc(o.title) })}</div>
        <h3 class="h3">${esc(o.title)}</h3>
        <p class="p" style="margin-top:6px">${esc(o.body)}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`
}

/* ---------- Prices ---------- */

export function prices(brief, copy, d) {
  const list = brief.prices || []
  if (!list.length) return ''
  const heading = esc(copy.headings.prices)
  const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`

  if (d.priceStyle === 'tiles') {
    return `
<section class="band" id="prices">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <div class="grid grid-3">
      ${list
        .map(
          (p) => `<div class="tile">
        <span class="tile-price">${money(p.amount)}</span>
        <span class="tile-name">${esc(p.label)}</span>
        ${p.note ? `<span class="tile-note">${esc(p.note)}</span>` : ''}
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`
  }

  if (d.priceStyle === 'table') {
    return `
<section class="band" id="prices">
  <div class="wrap with-rail">
    <h2 class="h2">${heading}</h2>
    <table class="table">
      <thead><tr><th scope="col">What</th><th scope="col">Fee</th></tr></thead>
      <tbody>
        ${list
          .map(
            (p) =>
              `<tr><td><strong>${esc(p.label)}</strong>${p.note ? `<br><span class="meta">${esc(p.note)}</span>` : ''}</td><td><span class="price">${money(p.amount)}</span></td></tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</section>`
  }

  if (d.priceStyle === 'cards') {
    return `
<section class="band" id="prices">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <div class="grid grid-3">
      ${list
        .map(
          (p) => `<div class="card stack">
        <h3 class="h3">${esc(p.label)}</h3>
        <span class="price"><span class="price-from">from</span>${money(p.amount)}</span>
        ${p.note ? `<span class="meta">${esc(p.note)}</span>` : ''}
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`
  }

  // list and rows
  return `
<section class="band" id="prices">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <ul class="rows">
      ${list
        .map(
          (p) => `<li class="row">
        <span class="row-name">${esc(p.label)}</span>
        ${p.note ? `<span class="row-note">${esc(p.note)}</span>` : '<span class="row-note"></span>'}
        <span class="price">${money(p.amount)}</span>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`
}

/* ---------- What people say ---------- */

export function words(brief, copy, d) {
  const list = brief.testimonials || []
  if (!list.length) return ''
  const heading = esc(copy.headings.words)
  return `
<section class="band-tight" id="words">
  <div class="wrap stack-lg">
    <h2 class="h2">${heading}</h2>
    <div class="grid grid-2">
      ${list
        .map(
          (t) => `<blockquote class="quote ${d.dark || d.divider === 'band' ? 'quote-bare' : 'card'}">
        <p class="quote-text">${esc(t.quote)}</p>
        ${t.by ? `<p class="quote-by">${esc(t.by)}</p>` : ''}
      </blockquote>`
        )
        .join('')}
    </div>
  </div>
</section>`
}

/* ---------- About ---------- */

export function about(brief, copy, d) {
  if (!copy.about) return ''
  const checks =
    d.divider === 'none'
      ? `<ul class="checks">${['We quote before we start', 'Parts carried with us', 'Work guaranteed']
          .map((c) => `<li class="check">${ICON.check}<span>${esc(c)}</span></li>`)
          .join('')}</ul>`
      : ''
  return `
<section class="band-tight" id="about">
  <div class="wrap stack-lg">
    <h2 class="h2">${esc(copy.headings.about)}</h2>
    <p class="p p-ink" style="font-size:1.0625rem">${esc(copy.about)}</p>
    ${checks}
  </div>
</section>`
}

/* ---------- Contact ---------- */

export function contact(brief, copy, d) {
  const bits = metaBits(brief, copy)
  const inPanel = d.divider === 'band'
  return `
<section class="band ${inPanel ? 'panel' : ''}" id="contact">
  <div class="wrap stack-lg">
    <h2 class="h2">${esc(copy.headings.contact)}</h2>
    <p class="lede">${esc(copy.contactLine)}</p>
    ${ctaRow(brief, { max: 3, loud: inPanel })}
    ${bits.length ? `<div class="strip">${bits.join('')}</div>` : ''}
  </div>
</section>`
}

export function footer(brief, copy) {
  const year = new Date().getFullYear()
  return `
<footer class="footer">
  <div class="wrap footer-grid">
    <span>© ${year} ${esc(copy.name)}${copy.place ? `, ${esc(copy.place)}` : ''}</span>
    <span>Built by talking, on <a href="/">DayOne</a></span>
  </div>
</footer>`
}

export function nav(brief, copy) {
  const a = actions(brief)[0]
  return `
<header class="wrap nav">
  <a class="wordmark" href="#top">${esc(copy.name)}</a>
  <a class="cta" href="${esc(a.href)}" style="min-height:44px;padding:10px 20px;font-size:1rem">${a.icon}${esc(a.label)}</a>
</header>`
}

export default { hero, offerings, prices, words, about, contact, footer, nav, actions, ctaRow, heroImage }
