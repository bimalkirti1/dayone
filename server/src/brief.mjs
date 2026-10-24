/**
 * A brief is everything we need to build someone a site. It is deliberately
 * small: six facts a person can give in a two-minute phone call.
 */

/**
 * Business categories. Each one carries the vocabulary we listen for, the art
 * direction that suits the trade, and sensible defaults so a half-finished
 * brief still produces a site worth looking at.
 */
export const CATEGORIES = {
  food: {
    label: 'home kitchen',
    direction: 'hearth',
    photo: 'cake',
    words: ['bake', 'baker', 'bakery', 'cake', 'cookie', 'brownie', 'dessert', 'sweet', 'mithai',
      'tiffin', 'lunch', 'dabba', 'catering', 'caterer', 'cloud kitchen', 'kitchen', 'chef',
      'pickle', 'masala', 'snack', 'chaat', 'biryani', 'meal', 'food', 'cook', 'cafe', 'juice'],
    offerings: ['Birthday cakes', 'Cookie boxes', 'Party orders'],
    unit: 'per kg',
    cta: 'Order on WhatsApp',
  },
  wellness: {
    label: 'wellness studio',
    direction: 'studio',
    photo: 'yoga',
    words: ['yoga', 'pilates', 'meditation', 'wellness', 'therapy', 'therapist', 'counsel',
      'massage', 'spa', 'salon', 'beauty', 'hair', 'skin', 'nutrition', 'dietician', 'fitness',
      'trainer', 'gym', 'zumba', 'physio', 'ayurveda'],
    offerings: ['Morning batch', 'Private sessions', 'Beginner course'],
    unit: 'per month',
    cta: 'Book a class',
  },
  teaching: {
    label: 'teaching practice',
    direction: 'ledger',
    photo: 'tutor',
    words: ['tutor', 'tuition', 'teach', 'teacher', 'class', 'coaching', 'school', 'maths',
      'math', 'science', 'physics', 'chemistry', 'spoken english', 'music', 'guitar', 'piano',
      'dance', 'exam', 'neet', 'jee', 'student', 'lesson', 'academy', 'learning'],
    offerings: ['Group batches', 'One-to-one lessons', 'Exam preparation'],
    unit: 'per month',
    cta: 'Book a trial class',
  },
  craft: {
    label: 'craft studio',
    direction: 'atelier',
    photo: 'henna',
    words: ['mehendi', 'henna', 'tailor', 'tailoring', 'stitch', 'boutique', 'saree', 'jewellery',
      'jewelry', 'handicraft', 'craft', 'pottery', 'art', 'artist', 'paint', 'photograph',
      'photographer', 'photo', 'video', 'wedding', 'bridal', 'makeup', 'design', 'embroidery'],
    offerings: ['Bridal work', 'Festive bookings', 'Custom orders'],
    unit: 'per booking',
    cta: 'Check my dates',
  },
  shop: {
    label: 'neighbourhood shop',
    direction: 'market',
    photo: 'shop',
    words: ['shop', 'store', 'kirana', 'grocery', 'general store', 'stationery', 'hardware',
      'mobile', 'repair shop', 'electronics', 'shoe', 'footwear', 'clothes', 'garment', 'retail',
      'flower', 'florist', 'nursery', 'plants', 'pharmacy', 'medical', 'supermarket'],
    offerings: ['In store today', 'Home delivery', 'Bulk orders'],
    unit: '',
    cta: 'Call the shop',
  },
  services: {
    label: 'local service',
    direction: 'civic',
    photo: 'tailor',
    words: ['plumber', 'plumbing', 'electrician', 'carpenter', 'painter', 'cleaning', 'cleaner',
      'pest', 'mover', 'packers', 'driver', 'taxi', 'cab', 'courier', 'delivery', 'mechanic',
      'service', 'repair', 'ac repair', 'appliance', 'construction', 'contractor', 'security',
      'laundry', 'ironing'],
    offerings: ['Same-day callouts', 'Repairs', 'Annual maintenance'],
    unit: 'per visit',
    cta: 'Call now',
  },
}

export const DEFAULT_CATEGORY = 'services'

/** Pick the category whose vocabulary the person actually used. */
export function detectCategory(...texts) {
  const hay = texts.filter(Boolean).join(' ').toLowerCase()
  if (!hay.trim()) return DEFAULT_CATEGORY
  let best = { key: DEFAULT_CATEGORY, score: 0 }
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    let score = 0
    for (const w of cat.words) {
      if (!hay.includes(w)) continue
      // Longer, more specific words are stronger evidence than short ones.
      score += w.includes(' ') ? 4 : w.length > 6 ? 3 : 2
    }
    if (score > best.score) best = { key, score }
  }
  return best.score > 0 ? best.key : DEFAULT_CATEGORY
}

/** The mood words people actually say, mapped onto our art directions. */
const MOODS = {
  warm: ['warm', 'homely', 'homey', 'cosy', 'cozy', 'friendly', 'family', 'inviting', 'soft'],
  calm: ['calm', 'clean', 'simple', 'minimal', 'quiet', 'peaceful', 'airy', 'light', 'serene'],
  trusted: ['trusted', 'professional', 'serious', 'formal', 'reliable', 'classic', 'credible'],
  bold: ['bold', 'fun', 'bright', 'loud', 'colourful', 'colorful', 'energetic', 'playful', 'vibrant'],
  luxe: ['elegant', 'premium', 'luxury', 'luxe', 'classy', 'sophisticated', 'refined', 'rich'],
}

export function detectMood(...texts) {
  const hay = texts.filter(Boolean).join(' ').toLowerCase()
  for (const [mood, words] of Object.entries(MOODS)) {
    if (words.some((w) => hay.includes(w))) return mood
  }
  return ''
}

export function slugify(s, fallback = 'my-site') {
  const base = String(s || '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/&/g, ' and ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
  return base || fallback
}

/** Indian mobile numbers, forgiving about how people say them. */
export function normalisePhone(raw) {
  if (!raw) return ''
  let d = String(raw).replace(/[^\d+]/g, '')
  if (d.startsWith('+')) return d.length >= 11 ? d : ''
  d = d.replace(/\D/g, '')
  if (d.length === 10) return `+91${d}`
  if (d.length === 11 && d.startsWith('0')) return `+91${d.slice(1)}`
  if (d.length === 12 && d.startsWith('91')) return `+${d}`
  if (d.length > 12) return `+${d}`
  return ''
}

export const BRIEF_FIELDS = ['businessName', 'what', 'who', 'action', 'place', 'mood']

/** What we still need, in the order a conversation would naturally ask it. */
export function missingFields(b = {}) {
  const need = []
  if (!b.what) need.push('what')
  if (!b.businessName) need.push('businessName')
  if (!b.action) need.push('action')
  if (!b.place) need.push('place')
  if (!b.who) need.push('who')
  if (!b.mood) need.push('mood')
  return need
}

/** Enough to build something real, even if a couple of niceties are missing. */
export function isBuildable(b = {}) {
  return !!(b.what && b.businessName)
}

export function normaliseBrief(input = {}, previous = {}) {
  const b = { ...previous }
  const str = (v, max = 400) =>
    typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : undefined

  const set = (k, v, max) => {
    const s = str(v, max)
    if (s) b[k] = s
  }

  set('businessName', input.businessName ?? input.name, 80)
  set('what', input.what ?? input.description ?? input.business, 400)
  set('who', input.who ?? input.customers ?? input.audience, 300)
  set('action', input.action ?? input.goal ?? input.cta, 160)
  set('place', input.place ?? input.location ?? input.area, 120)
  set('ownerName', input.ownerName ?? input.owner, 80)
  set('email', input.email, 160)

  const mood = str(input.mood ?? input.feel ?? input.style, 120)
  if (mood) b.mood = detectMood(mood) || mood.toLowerCase()

  const phone = normalisePhone(input.phone ?? input.whatsapp ?? input.mobile)
  if (phone) b.phone = phone

  if (Array.isArray(input.offerings)) {
    const o = input.offerings.map((x) => str(x, 90)).filter(Boolean).slice(0, 6)
    if (o.length) b.offerings = o
  }
  if (Array.isArray(input.prices)) {
    const p = input.prices
      .map((x) => ({
        label: str(x?.label ?? x?.name, 60),
        amount: Number.isFinite(Number(x?.amount)) ? Math.round(Number(x.amount)) : undefined,
        note: str(x?.note ?? x?.unit, 40),
      }))
      .filter((x) => x.label && x.amount != null)
      .slice(0, 6)
    if (p.length) b.prices = p
  }
  if (Array.isArray(input.testimonials)) {
    const t = input.testimonials
      .map((x) => ({ quote: str(x?.quote ?? x?.text, 240), by: str(x?.by ?? x?.name, 60) }))
      .filter((x) => x.quote)
      .slice(0, 4)
    if (t.length) b.testimonials = t
  }
  if (input.hours) set('hours', input.hours, 120)

  // Category and direction follow from what the person said, unless pinned.
  b.category = CATEGORIES[input.category] ? input.category : detectCategory(b.what, b.businessName, b.who)
  const cat = CATEGORIES[b.category]
  b.direction = input.direction || directionFor(b.category, b.mood)
  b.cta = str(input.ctaLabel, 40) || ctaFor(b)
  b.unit = cat.unit
  b.slug = slugify(input.slug || b.businessName || b.what, 'my-site')
  return b
}

/** Mood overrides trade when someone states one, because they asked for it. */
export function directionFor(category, mood) {
  const byMood = { warm: 'hearth', calm: 'studio', trusted: 'ledger', bold: 'market', luxe: 'atelier' }
  if (mood && byMood[mood]) return byMood[mood]
  return (CATEGORIES[category] || CATEGORIES[DEFAULT_CATEGORY]).direction
}

function ctaFor(b) {
  const cat = CATEGORIES[b.category] || CATEGORIES[DEFAULT_CATEGORY]
  const a = (b.action || '').toLowerCase()
  if (a.includes('whatsapp')) return 'Order on WhatsApp'
  if (a.includes('call') || a.includes('phone') || a.includes('ring')) return 'Call now'
  if (a.includes('book') || a.includes('appoint') || a.includes('slot')) return 'Book a time'
  if (a.includes('visit') || a.includes('come') || a.includes('direction')) return 'Get directions'
  if (a.includes('order') || a.includes('buy')) return 'Place an order'
  if (a.includes('enquir') || a.includes('inquir') || a.includes('message') || a.includes('email'))
    return 'Send an enquiry'
  return cat.cta
}

export default { CATEGORIES, detectCategory, detectMood, normaliseBrief, slugify, normalisePhone, missingFields, isBuildable, directionFor }
