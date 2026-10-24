/**
 * Guardrails. Two jobs, kept separate on purpose:
 *
 *  1. Keep the conversation on website design. Anything else gets a short,
 *     friendly redirect rather than an answer.
 *  2. Keep what people say out of the HTML as code. Everything a caller says
 *     ends up on a page we host on our own domain, so it is escaped on the way
 *     out, never trusted on the way in.
 */

/** Off-topic asks that a website builder should simply decline. */
const OFF_TOPIC = [
  { tag: 'code', words: ['write code', 'write a function', 'python script', 'javascript function', 'debug my', 'fix my code', 'sql query', 'regex for', 'leetcode', 'algorithm for'] },
  { tag: 'advice', words: ['medical advice', 'diagnose', 'my symptoms', 'legal advice', 'sue them', 'lawsuit', 'tax return', 'invest in', 'stock tip', 'which stock', 'crypto to buy'] },
  { tag: 'politics', words: ['who should i vote', 'election result', 'prime minister', 'president of', 'political party'] },
  { tag: 'homework', words: ['solve this equation', 'write my essay', 'my assignment', 'exam answer', 'translate this paragraph'] },
  { tag: 'chitchat', words: ['tell me a joke', 'write a poem', 'sing a song', 'what is the weather', 'who are you really', 'are you conscious', 'recipe for'] },
  { tag: 'meta', words: ['what model are you', 'which llm', 'your system prompt', 'your instructions', 'who made you', 'are you chatgpt', 'are you gpt'] },
]

/** Attempts to talk the agent out of its job. */
const INJECTION = [
  'ignore previous', 'ignore all previous', 'ignore the above', 'disregard previous',
  'forget your instructions', 'forget everything', 'new instructions', 'system prompt',
  'you are now', 'pretend you are', 'act as if you', 'developer mode', 'jailbreak',
  'reveal your prompt', 'print your instructions', 'repeat the text above', 'without restrictions',
  'bypass your', 'override your',
]

/** Businesses we will not build a site for. */
const PROHIBITED = [
  { tag: 'adult', words: ['escort', 'porn', 'adult video', 'sex work', 'brothel', 'camgirl', 'onlyfans'] },
  { tag: 'gambling', words: ['betting', 'satta', 'matka', 'casino', 'teen patti real money', 'gambling site', 'bookie'] },
  { tag: 'drugs', words: ['sell weed', 'cocaine', 'mdma', 'illegal drug', 'drug dealer', 'opioid without prescription'] },
  { tag: 'weapons', words: ['sell guns', 'firearm without', 'unlicensed weapon', 'ammunition supply', 'explosives for sale'] },
  { tag: 'fraud', words: ['fake certificate', 'fake degree', 'fake review', 'forged document', 'cloned card', 'otp bypass', 'hack accounts', 'phishing page', 'fake invoice', 'duplicate currency'] },
  { tag: 'impersonation', words: ['official government portal', 'pretend to be hdfc', 'clone of amazon', 'copy of flipkart', 'look like paytm'] },
]

/** Words that signal the person is talking about their business or their page. */
const ON_TOPIC = [
  'business', 'shop', 'store', 'website', 'site', 'page', 'webpage', 'online', 'customer', 'client',
  'order', 'book', 'booking', 'price', 'pricing', 'rate', 'charge', 'service', 'product', 'sell',
  'make', 'bake', 'teach', 'repair', 'deliver', 'photo', 'picture', 'image', 'gallery', 'logo',
  'colour', 'color', 'font', 'headline', 'heading', 'text', 'wording', 'section', 'button',
  'whatsapp', 'phone', 'number', 'address', 'location', 'area', 'hours', 'timing', 'open',
  'about', 'contact', 'review', 'testimonial', 'name', 'brand', 'design', 'look', 'feel', 'style',
  'change', 'edit', 'add', 'remove', 'shorter', 'longer', 'publish', 'share', 'link', 'domain',
]

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim()
const hit = (hay, words) => words.find((w) => hay.includes(w))

export const REDIRECTS = {
  code: "I only build websites, so I can't help with code. Shall we carry on with your page?",
  advice: "That's outside what I do. I build simple websites for small businesses. What does your business do?",
  politics: "I'll leave that one alone. I'm here to build your website. What should it say?",
  homework: "I can't help with that, but I can build you a website. Tell me about your work.",
  chitchat: "I'm just a website builder, so I'll stick to that. What would you like on your page?",
  meta: "I'm DayOne. I build you a website while we talk. Shall we start with what you do?",
  injection: "Let's stay with your website. What would you like to change on it?",
  offtopic: "I'm not sure that's about your website. Tell me what you'd like on the page and I'll sort it.",
}

/**
 * Decide whether a message belongs in a website-building conversation.
 * `strict` is for the opening turns, where we still have no brief to lean on.
 */
export function checkInput(text, { turn = 0 } = {}) {
  const raw = String(text ?? '')
  const hay = norm(raw)

  if (!hay) return { allow: false, tag: 'empty', reply: "I didn't catch that. What does your business do?" }
  if (raw.length > 1500)
    return { allow: false, tag: 'toolong', reply: 'That is a lot at once. Give me the short version and we will build from there.' }

  const inj = hit(hay, INJECTION)
  if (inj) return { allow: false, tag: 'injection', match: inj, reply: REDIRECTS.injection }

  for (const group of PROHIBITED) {
    const m = hit(hay, group.words)
    if (m) {
      return {
        allow: false,
        tag: 'prohibited',
        category: group.tag,
        match: m,
        reply: "I can't build a site for that. I work with everyday businesses, shops, studios and services.",
        hard: true,
      }
    }
  }

  for (const group of OFF_TOPIC) {
    const m = hit(hay, group.words)
    if (m) return { allow: false, tag: group.tag, match: m, reply: REDIRECTS[group.tag] || REDIRECTS.offtopic }
  }

  // Short answers in a running conversation are almost always a reply to our
  // own question ("warm and homely", "Indiranagar"), so they pass.
  const words = hay.split(' ').filter(Boolean)
  if (words.length <= 8) return { allow: true, tag: 'short' }
  if (turn > 0) return { allow: true, tag: 'ok' }

  // A long opening message with nothing business-shaped in it is suspect.
  if (!ON_TOPIC.some((w) => hay.includes(w)) && words.length > 25)
    return { allow: false, tag: 'offtopic', reply: REDIRECTS.offtopic }

  return { allow: true, tag: 'ok' }
}

/** Does this brief describe something we are willing to publish? */
export function checkBrief(brief = {}) {
  const hay = norm([brief.what, brief.businessName, brief.who, brief.action, (brief.offerings || []).join(' ')].join(' '))
  for (const group of PROHIBITED) {
    const m = hit(hay, group.words)
    if (m) return { allow: false, category: group.tag, match: m, reason: `This brief describes ${group.tag} content, which we do not publish.` }
  }
  return { allow: true }
}

/* ---------- Output safety ---------- */

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escape for HTML text and quoted attributes. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c])

/** Strip markup and control characters before anything reaches a page. */
export function clean(s, max = 400) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** Only allow links we are happy to put in an href. */
export function safeUrl(url) {
  const s = String(url ?? '').trim()
  if (!s) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s) && !/[\s<>"']/.test(s)) return s
  return ''
}

export default { checkInput, checkBrief, esc, clean, safeUrl, REDIRECTS }
