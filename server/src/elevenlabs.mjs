import { ReplitConnectors } from '@replit/connectors-sdk'
import config from './config.mjs'
import { AGENT_PROMPT, FIRST_MESSAGE, toolDefinitions } from './agent.mjs'

const connectors = new ReplitConnectors()

/** API keys stay on the server. Replit's connection is used only on Replit. */
export async function elevenlabsRequest(path, options = {}) {
  const init = {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(20000),
  }
  let response
  if (config.elevenlabs.apiKey) {
    response = await fetch(`https://api.elevenlabs.io${path}`, {
      ...init, headers: { ...init.headers, 'xi-api-key': config.elevenlabs.apiKey },
    })
  } else if (process.env.REPL_ID) {
    response = await connectors.proxy('elevenlabs', path, init)
  } else {
    const err = new Error('Set ELEVENLABS_API_KEY in this host’s Environment settings to enable the agent.')
    err.status = 503
    throw err
  }
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(response.status === 401 || response.status === 403
      ? 'ElevenLabs access was rejected. Check the connection or API key and agent permissions.'
      : `ElevenLabs returned ${response.status}. Check agent access, account credits, and provider status.`)
    err.status = response.status === 429 ? 429 : 502
    throw err
  }
  return data
}

export function browserToolDefinitions() {
  return toolDefinitions('https://unused.invalid', '').filter(t => t.name !== 'send_link').map(tool => {
    const { conversation_id, ...properties } = tool.api_schema.request_body_schema.properties
    return {
      type: 'client', name: tool.name, description: tool.description,
      expects_response: true, response_timeout_secs: 30,
      parameters: { type: 'object', properties, required: [] },
    }
  })
}

export const BROWSER_PROMPT = `${AGENT_PROMPT}

# Browser channel
You are talking in the website browser, using either text chat or microphone audio.
Use save_brief and publish_site client tools to save the actual business and build the site.
The returned live URL will also appear in the browser preview. Tell the user to open or copy that link.
send_link is not available in this channel. Do not promise SMS, pretend to send it, or claim account login.
After publishing, offer to answer questions about the generated page. Ask them to start a new session to build a different business.`

/** Setup is explicitly triggered by an owner; it never starts paid calls. */
export async function configureDayOneAgents(origin) {
  if (!config.toolSecret || !origin.startsWith('https://')) {
    const err = new Error('A public HTTPS URL and TOOL_SECRET are required before configuring telephone webhooks.')
    err.status = 503
    throw err
  }
  const existing = await elevenlabsRequest('/v1/convai/tools?page_size=100')
  const available = existing.tools || []
  const results = []
  for (const channel of ['browser', 'phone']) {
    const definitions = channel === 'browser' ? browserToolDefinitions() : toolDefinitions(origin, config.toolSecret)
    const ids = []
    for (const definition of definitions) {
      const match = available.find(item => {
        const t = item.tool_config
        return t?.name === definition.name && t.type === definition.type && t.description === definition.description &&
          (channel === 'browser' || (t.api_schema?.url === definition.api_schema.url &&
            t.api_schema?.request_headers?.['x-dayone-secret'] === config.toolSecret))
      })
      const tool = match || await elevenlabsRequest('/v1/convai/tools', {
        method: 'POST', body: JSON.stringify({ tool_config: definition }),
      })
      ids.push(tool.id)
    }
    const agentId = channel === 'browser' ? config.elevenlabs.browserAgentId : config.elevenlabs.agentId
    const current = await elevenlabsRequest(`/v1/convai/agents/${encodeURIComponent(agentId)}`)
    const prompt = {
      ...current.conversation_config.agent.prompt,
      prompt: channel === 'browser' ? BROWSER_PROMPT : AGENT_PROMPT,
      tool_ids: ids,
    }
    delete prompt.tools
    await elevenlabsRequest(`/v1/convai/agents/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(channel === 'browser' ? {
          platform_settings: { auth: { ...current.platform_settings?.auth, enable_auth: true } },
        } : {}),
        conversation_config: {
          agent: {
            ...current.conversation_config.agent,
            first_message: FIRST_MESSAGE,
            prompt,
          },
        },
      }),
    })
    results.push({ channel, agentId, tools: definitions.map(t => t.name) })
  }
  return results
}
