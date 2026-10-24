/**
 * The conversation that builds the page.
 *
 * Six questions, asked in the order a person would ask them, each one
 * answering a slot in the brief. The agent on the phone has its own model and
 * its own prompt; this engine is what the web chat uses, and what a call falls
 * back to. Either way the guardrail runs first.
 */
import { checkInput } from './guardrail.mjs'
import { normaliseBrief, missingFields, isBuildable, detectMood, normalisePhone } from './brief.mjs'

/** One question per slot, with a couple of phrasings so it does not drone. */
const ASK = {
  what: ["Tell me what you do, and I'll build your page while we talk.", 'What does your business do?'],
  businessName: ['What is it called?', 'What name should go at the top of the page?'],
  action: [
    "When someone lands on your page, what's the one thing you'd like them to do?",
    'How should people reach you — WhatsApp, a call, or email?',
  ],
  place: ['Which area are you in?', 'Where should I say you are based?'],
  who: ['Who usually buys from you?', 'Who are your customers, mostly?'],
  mood: [
    'How should it feel? Warm and homely, clean and simple, or bold and bright?',
    'What look do you want — calm, bold, or something more elegant?',
  ],
}

const CONFIRM = {
  what: 'Got it.',
  businessName: 'Lovely.',
  action: 'Noted.',
  place: 'Good.',
  who: 'That helps.',
  mood: 'Perfect.',
}

export function openingLine() {
  return ASK.what[0]
}

/** Map a free-text answer onto whichever slot we just asked about. */
function absorb(brief, field, text) {
  const patch = {}
  switch (field) {
    case 'what':
      patch.what = text
      break
    case 'businessName':
      patch.businessName = text.replace(/^(it'?s |its |called |we are |i am |name is )/i, '').trim()
      break
    case 'action':
      patch.action = text
      break
    case 'place':
      patch.place = text.replace(/^(in |at |near |around )/i, '').trim()
      break
    case 'who':
      patch.who = text
      break
    case 'mood':
      patch.mood = detectMood(text) || text
      break
    default:
      break
  }
  // People volunteer their number at any point in the conversation.
  const phone = normalisePhone((text.match(/[+\d][\d\s-]{8,}/) || [])[0])
  if (phone) patch.phone = phone
  return normaliseBrief(patch, brief)
}

const pick = (list, n) => list[Math.min(n, list.length - 1)]

/**
 * Advance the conversation by one turn.
 * Returns the reply, the updated session, and whether the page is ready.
 */
export function respond(session, message) {
  const turn = session.turn || 0
  const verdict = checkInput(message, { turn })

  if (!verdict.allow) {
    const next = { ...session }
    next.blocked = (next.blocked || 0) + 1
    // Repeated attempts to steer us off are logged but the tone stays level.
    next.lastBlock = { tag: verdict.tag, at: new Date().toISOString() }
    if (verdict.hard) next.refused = true
    return { reply: verdict.reply, session: next, ready: false, blocked: true, tag: verdict.tag }
  }

  const asking = session.asking || 'what'
  const brief = absorb(session.brief || {}, asking, String(message).trim())

  const remaining = missingFields(brief)
  const next = {
    ...session,
    brief,
    turn: turn + 1,
    asking: remaining[0] || null,
    history: [...(session.history || []).slice(-12), { role: 'user', text: String(message).slice(0, 500) }],
  }

  if (!remaining.length || (turn >= 5 && isBuildable(brief))) {
    const reply = "That's everything I need. Give me a moment and your page is ready."
    next.history.push({ role: 'dayone', text: reply })
    return { reply, session: next, ready: true }
  }

  const field = remaining[0]
  const reply = `${CONFIRM[asking] || ''} ${pick(ASK[field], Math.floor(turn / 3))}`.trim()
  next.history.push({ role: 'dayone', text: reply })
  return { reply, session: next, ready: false }
}

export default { respond, openingLine, ASK }
