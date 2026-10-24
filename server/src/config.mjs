/**
 * Every setting comes from the environment so nothing secret lives in the repo.
 * Each value has a safe default, so the service boots with zero configuration.
 */
const env = process.env

const bool = (v, d = false) =>
  v == null ? d : /^(1|true|yes|on)$/i.test(String(v).trim())

export const config = {
  port: parseInt(env.PORT || '3000', 10),
  host: env.HOST || '0.0.0.0',

  /** Public origin of this service. Used to build the link we text to people. */
  publicUrl: (env.PUBLIC_URL || env.RENDER_EXTERNAL_URL || '').replace(/\/$/, ''),

  /** Where published sites and briefs are written. */
  dataDir: env.DATA_DIR || new URL('../data/', import.meta.url).pathname,

  /** Shared secret ElevenLabs sends on every tool call. */
  toolSecret: env.TOOL_SECRET || '',

  /** Treat requests as authenticated when no secret is configured (local dev). */
  get openTools() {
    return !this.toolSecret
  },

  elevenlabs: {
    apiKey: env.ELEVENLABS_API_KEY || '',
    agentId: env.ELEVENLABS_AGENT_ID || '',
  },

  /** Link delivery. 'log' just records it, which is what tests use. */
  sms: {
    provider: (env.SMS_PROVIDER || 'log').toLowerCase(),
    from: env.SMS_FROM || 'DayOne',
    vobiz: {
      apiKey: env.VOBIZ_API_KEY || '',
      baseUrl: (env.VOBIZ_BASE_URL || 'https://api.vobiz.ai').replace(/\/$/, ''),
      senderId: env.VOBIZ_SENDER_ID || '',
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID || '',
      authToken: env.TWILIO_AUTH_TOKEN || '',
      from: env.TWILIO_FROM || '',
    },
  },

  /**
   * Optional copy polish. Any OpenAI-compatible endpoint works, so you can
   * point this at Replit's AI gateway, OpenRouter, Groq or OpenAI itself.
   * Left empty, the generator writes copy deterministically and still works.
   */
  llm: {
    baseUrl: (env.LLM_BASE_URL || '').replace(/\/$/, ''),
    apiKey: env.LLM_API_KEY || '',
    model: env.LLM_MODEL || 'gpt-4o-mini',
    enabled: bool(env.LLM_ENABLED, true),
  },

  get llmReady() {
    return this.llm.enabled && !!this.llm.baseUrl && !!this.llm.apiKey
  },
}

export default config
