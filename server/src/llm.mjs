/**
 * Optional copy polish.
 *
 * The generator writes a complete page on its own. If an OpenAI-compatible
 * endpoint is configured, we ask it to improve a few short strings and we
 * accept the result only if it comes back in the right shape. Anything odd,
 * and we keep what we already had. The page never depends on this.
 */
import config from './config.mjs'
import { clean } from './guardrail.mjs'

const SYSTEM = `You write short copy for a small business's one-page website.
Rules: British English. Plain words. No marketing cliches, no exclamation marks,
no "welcome to", no "we deliver excellence". Keep the owner's own voice.
Reply with JSON only, matching the schema you are given. Never add fields.`

export async function polish({ brief, copy }) {
  if (!config.llmReady) return { used: false, copy }

  const prompt = {
    business: brief.businessName,
    does: brief.what,
    customers: brief.who || null,
    place: brief.place || null,
    current: { headline: copy.headline, subhead: copy.subhead, about: copy.about },
    schema: { headline: 'string, max 60 chars', subhead: 'string, max 110 chars', about: 'string, max 260 chars' },
  }

  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 12000)
  try {
    const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${config.llm.apiKey}` },
      body: JSON.stringify({
        model: config.llm.model,
        temperature: 0.6,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: JSON.stringify(prompt) },
        ],
      }),
      signal: ctl.signal,
    })
    if (!res.ok) return { used: false, copy, error: `LLM ${res.status}` }
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) return { used: false, copy }

    const out = JSON.parse(raw)
    const next = { ...copy }
    if (typeof out.headline === 'string' && out.headline.trim().length > 6)
      next.headline = clean(out.headline, 72)
    if (typeof out.subhead === 'string' && out.subhead.trim().length > 6)
      next.subhead = clean(out.subhead, 130)
    if (typeof out.about === 'string' && out.about.trim().length > 20)
      next.about = clean(out.about, 300)
    return { used: true, copy: next }
  } catch (err) {
    return { used: false, copy, error: String(err.message || err).slice(0, 200) }
  } finally {
    clearTimeout(timer)
  }
}

export default { polish }
