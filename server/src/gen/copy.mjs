/**
 * Copy. Written from the caller's own words, because a page full of
 * "Welcome to our website — we deliver excellence" is as much a tell as a
 * stock gradient. Everything here is deterministic, so the same brief always
 * produces the same page; the optional LLM pass only polishes afterwards.
 */
import { CATEGORIES, DEFAULT_CATEGORY } from '../brief.mjs'
import { clean } from '../guardrail.mjs'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Languages and proper nouns people type in lower case. */
const PROPER = {
  english: 'English', hindi: 'Hindi', kannada: 'Kannada', tamil: 'Tamil', telugu: 'Telugu',
  marathi: 'Marathi', bengali: 'Bengali', malayalam: 'Malayalam', urdu: 'Urdu',
  gujarati: 'Gujarati', punjabi: 'Punjabi', sanskrit: 'Sanskrit', french: 'French',
  german: 'German', spanish: 'Spanish', japanese: 'Japanese', arabic: 'Arabic',
  bharatanatyam: 'Bharatanatyam', kathak: 'Kathak', carnatic: 'Carnatic', hindustani: 'Hindustani',
  ayurveda: 'Ayurveda', mehendi: 'Mehendi', diwali: 'Diwali', ramzan: 'Ramzan', eid: 'Eid',
  neet: 'NEET', jee: 'JEE', cbse: 'CBSE', icse: 'ICSE', ielts: 'IELTS', gst: 'GST', ac: 'AC',
}

const fixProper = (s) =>
  String(s || '').replace(/\b[a-z]+\b/g, (w) => PROPER[w] || w)

const LEAD = /^(hi|hello|hey)[,!. ]+/i
const PRONOUN = /^(i|we)\s+(am|are)\s+(a|an|the)?\s*/i
const VERB = /^(i|we)\s+(also\s+)?(do|does|make|run|own|sell|offer|provide|bake|teach|repair|cook|fix|serve|deal in|work on|specialise in|specialize in)\s+/i
const MINE = /^(my|our)\s+(business|shop|work|company|studio|kitchen)\s+(is|does)\s+/i

/**
 * Turn what someone said into the thing their page is about.
 * People rarely answer in one clean clause: "I am a plumber, I do leak
 * repairs and bathroom fittings" has the useful part in the second half, so
 * we take every clause and keep the most descriptive one.
 */
export function subjectOf(what = '') {
  const base = clean(what, 240).replace(LEAD, '')
  const clauses = base
    .split(/\s*[,;]\s*|\s+and then\s+/i)
    .map((c) =>
      c
        .replace(PRONOUN, '')
        .replace(VERB, '')
        .replace(MINE, '')
        .replace(/^(a|an|the)\s+/i, '')
        .replace(/\s+from home\b/i, '')
        .replace(/\s+(in|at|near|around)\s+[A-Za-z' -]+$/i, '')
        .replace(/[.!]+$/, '')
        .trim()
    )
    .filter((c) => c.length > 2)

  if (!clauses.length) return ''
  // A trade name on its own ("plumber") tells a visitor less than the list of
  // jobs that follows it, so prefer the clause that carries more detail.
  const best = clauses.reduce((a, b) => (b.split(' ').length > a.split(' ').length ? b : a), clauses[0])
  return fixProper(best)
}

/** Headlines have to fit on a phone, so the subject gets clamped for them. */
export function subjectShort(subject = '', max = 46) {
  const s = clean(subject, 160)
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const at = Math.max(cut.lastIndexOf(' and '), cut.lastIndexOf(','), cut.lastIndexOf(' '))
  return (at > 12 ? cut.slice(0, at) : cut).replace(/[\s,]+$/, '')
}

/** Headlines per trade. Each takes the real subject and the real place. */
const HEADLINES = {
  food: ({ subject, place, name }) => [
    place && subject ? `${cap(subject)}, made fresh in ${place}` : null,
    place ? `Baked to order in ${place}` : null,
    subject ? `${cap(subject)}, made to order` : null,
    `${name} — made by hand`,
  ],
  wellness: ({ subject, place }) => [
    subject ? `${cap(subject)}, at your own pace` : null,
    place ? `A quieter hour, in ${place}` : null,
    'Room to breathe',
  ],
  teaching: ({ subject, place }) => [
    subject ? `${cap(subject)}, taught properly` : null,
    place ? `Small batches in ${place}` : null,
    'Lessons that stick',
  ],
  craft: ({ subject, place }) => [
    subject ? `${cap(subject)}, made for you` : null,
    place ? `Made by hand in ${place}` : null,
    'Work made to order',
  ],
  shop: ({ subject, place, name }) => [
    place && subject ? `${cap(subject)} in ${place}` : null,
    subject ? `${cap(subject)}, on the shelf today` : null,
    `${name}, open today`,
  ],
  services: ({ subject, place }) => [
    subject && place ? `${cap(subject)} across ${place}` : null,
    subject ? `${cap(subject)}, done the same day` : null,
    place ? `Your local team in ${place}` : null,
    'Fixed properly, first time',
  ],
}

const SUBHEADS = {
  food: ({ who }) => (who ? `Orders for ${who.toLowerCase()}.` : 'Order a day ahead and collect, or have it delivered.'),
  wellness: ({ who }) => (who ? `Sessions for ${who.toLowerCase()}.` : 'Small groups and one-to-one sessions through the week.'),
  teaching: ({ who }) => (who ? `Teaching ${who.toLowerCase()}.` : 'Small batches, regular practice and steady progress.'),
  craft: ({ who }) => (who ? `Commissions for ${who.toLowerCase()}.` : 'Every piece made to order, start to finish.'),
  shop: ({ who }) => (who ? `Serving ${who.toLowerCase()}.` : 'Come in and have a look, or ring ahead and we will keep it aside.'),
  services: ({ who }) => (who ? `Working with ${who.toLowerCase()}.` : 'Ring in the morning and we will usually be there the same day.'),
}

/** Section headings, in the trade's own vernacular. */
const HEADINGS = {
  food: { offerings: 'What I make', prices: 'Prices', words: 'What people say', about: 'About the kitchen', contact: 'Place an order' },
  wellness: { offerings: 'Sessions', prices: 'Rates', words: 'From the studio', about: 'About me', contact: 'Book a session' },
  teaching: { offerings: 'What I teach', prices: 'Fees', words: 'Parents and students', about: 'About the practice', contact: 'Arrange a trial' },
  craft: { offerings: 'The work', prices: 'Commissions', words: 'Clients', about: 'About the studio', contact: 'Start a commission' },
  shop: { offerings: 'In the shop', prices: 'Today’s prices', words: 'Regulars', about: 'About the shop', contact: 'Find us' },
  services: { offerings: 'What we do', prices: 'Call-out rates', words: 'Customers', about: 'About us', contact: 'Get it booked' },
}

/** Fallback testimonials are never invented as if real: they are labelled. */
export function buildCopy(brief = {}) {
  const cat = CATEGORIES[brief.category] || CATEGORIES[DEFAULT_CATEGORY]
  const key = CATEGORIES[brief.category] ? brief.category : DEFAULT_CATEGORY
  const name = clean(brief.businessName, 80) || 'My business'
  const place = clean(brief.place, 80)
  const subject = subjectOf(brief.what)
  const brief_subject = subjectShort(subject)
  const who = clean(brief.who, 160)

  const headline =
    (HEADLINES[key] || HEADLINES.services)({ subject: brief_subject, place, name, who }).find(Boolean) || name
  const headlineShort = shorten(headline)
  const subhead = (SUBHEADS[key] || SUBHEADS.services)({ who, subject, place })

  const offerings =
    brief.offerings?.length
      ? brief.offerings.map((t) => ({ title: clean(t, 70), body: '' }))
      : cat.offerings.map((t) => ({ title: t, body: '' }))

  // Give each offering a line of its own so the grid is not three bare labels.
  const bodies = offeringBodies(key, { place, who })
  offerings.forEach((o, n) => {
    if (!o.body) o.body = bodies[n % bodies.length]
  })

  return {
    name,
    headline,
    headlineShort,
    subhead,
    place,
    subject,
    who,
    headings: HEADINGS[key] || HEADINGS.services,
    offerings: offerings.slice(0, 6),
    about: aboutText(key, { name, place, subject, who }),
    contactLine: contactLine(key, { place }),
    unit: cat.unit,
  }
}

function offeringBodies(key, { place, who }) {
  const here = place ? `in ${place}` : 'locally'
  return ({
    food: [
      'Made to order with your flavours and your theme.',
      'Boxed and ready for gifting, or for a full table.',
      `Fresh the same morning, ${here}.`,
    ],
    wellness: [
      'Early sessions before the day starts.',
      'One-to-one, paced to where you are now.',
      'A six-week course for complete beginners.',
    ],
    teaching: [
      'Four to six students, so nobody sits quietly at the back.',
      'One-to-one, built around the gaps we find.',
      'Past papers, timed practice and honest feedback.',
    ],
    craft: [
      'Booked well ahead for wedding season.',
      'Festive dates fill first, so ask early.',
      'Brought to your own design, or mine.',
    ],
    shop: [
      'On the shelf now — come and have a look.',
      `Dropped to your door ${here}.`,
      'Better rates on larger quantities.',
    ],
    services: [
      'Ring in the morning, sorted by evening.',
      'Parts carried on the van, so one visit is usually enough.',
      'A yearly check that catches the small things early.',
    ],
  }[key] || [
    'Ask and we will sort it out.',
    'Straightforward work, fairly priced.',
    'Regulars get first call on busy days.',
  ])
}

function aboutText(key, { name, place, subject, who }) {
  const where = place ? ` in ${place}` : ''
  const whom = who ? ` Most of my work comes from ${who.toLowerCase()}.` : ''
  const what = subject ? ` ${name} is ${subject.startsWith('a ') ? subject : `about ${subject}`}` : ` ${name}`
  return ({
    food: `Everything is made in my own kitchen${where}, in small batches, the day before it is needed.${whom}`,
    wellness: `A small practice${where}. Classes stay small on purpose, so nobody is left copying the person in front.${whom}`,
    teaching: `I have been teaching${where} for years, and I still think the quiet student with the right question learns fastest.${whom}`,
    craft: `A one-person studio${where}. Each piece is made start to finish by the same pair of hands.${whom}`,
    shop: `We have been on the same street${where} for years, and most of our customers we know by name.${whom}`,
    services: `A small local team${where}. We turn up when we say we will, and we tell you the price before we start.${whom}`,
  }[key] || `${what.trim()}${where}.${whom}`)
}

function contactLine(key, { place }) {
  const where = place ? ` We cover ${place} and around.` : ''
  return ({
    food: 'Message with the date and roughly how many people, and I will tell you what is possible.',
    wellness: 'Send a message and I will let you know which batches have room.',
    teaching: 'Get in touch and we will set up a free first lesson before you decide.',
    craft: 'Tell me the date and the look you have in mind, and I will check my diary.',
    shop: 'Ring ahead and we will keep it aside for you.',
    services: `Tell us what has gone wrong and we will give you a price.${where}`,
  }[key] || 'Get in touch and we will take it from there.')
}

/**
 * The "make the headline shorter" edit, done properly. Truncating at a word
 * count leaves things like "Yoga, at your own", so we drop whole clauses and
 * then refuse to end on a word that needs the next one.
 */
const DANGLING = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'from',
  'by', 'your', 'our', 'my', 'their', 'its', 'own', 'that', 'this', 'as', 'into', 'per',
  'made', 'taught', 'done', 'across', 'near', 'around',
])

const trimDangling = (s) => {
  let w = s.replace(/[\s,;:–—-]+$/, '').split(' ')
  while (w.length > 1 && DANGLING.has(w[w.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) w.pop()
  return w.join(' ').replace(/[\s,;:–—-]+$/, '')
}

export function shorten(headline = '') {
  const s = clean(headline, 120)
  if (s.length <= 26) return s

  // Prefer dropping the trailing clause: "X, made fresh in Y" -> "X".
  const comma = s.indexOf(',')
  if (comma >= 12) {
    const head = trimDangling(s.slice(0, comma))
    if (head.length >= 12) return head
  }

  // Then drop a trailing place phrase: "X across Whitefield" -> "X".
  const stripped = trimDangling(s.replace(/\s+(in|at|near|across|around|for)\s+[^,]+$/i, ''))
  if (stripped.length >= 12 && stripped.length < s.length) return stripped

  const words = s.split(' ')
  if (words.length <= 4) return s
  const cut = trimDangling(words.slice(0, 4).join(' '))
  return cut.length >= 12 ? cut : trimDangling(words.slice(0, 5).join(' '))
}

export default { buildCopy, subjectOf, subjectShort, shorten }
