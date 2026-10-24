# DayOne — voice to website

Someone rings a number, talks for two minutes, and a website for their business
is live and texted to their phone.

This repo holds two halves:

- `src/` — React + Vite frontend with real ElevenLabs text/voice sessions.
- `server/` — Node 22 API, generated websites, and server-side provider access.

The browser uses the ElevenLabs React SDK and client tools. On Replit, the
connected account issues signed sessions through the server. On another host,
set ELEVENLABS_API_KEY server-side; it must never enter the frontend bundle.
Browser-agent authentication is enabled to prevent direct public agent-ID
connections. Session issuance ignores untrusted forwarded IP headers and has
an independent, persisted single-service budget: 6/hour and 20/day by default.
Use AGENT_SESSION_HOURLY_LIMIT and AGENT_SESSION_DAILY_LIMIT to change this
deliberately. Free-host storage resets also reset local budgets; configure
ElevenLabs account-side usage limits and alerts as an additional safeguard.
Use shared atomic budget storage before running multiple server instances.
Live telephone publishing additionally requires the deployed API URL, protected
webhook tools on the agent, working Vobiz SIP routing, and SMS configuration.
Do not treat a successful browser build as verification of the phone flow.

## How a call actually runs

```
caller ──▶ phone number (Vobiz)
             │
             ▼
        ElevenLabs agent  ── its own LLM, its own voice, DayOne's prompt
             │  calls three webhook tools as it talks
             ▼
        this server  /api/voice/tools/{save_brief, publish_site, send_link}
             │
             ├─▶ generator: brief ──▶ a finished one-page site
             ├─▶ store:     site saved under its own slug
             └─▶ sms:       the link goes to the caller's phone
                              │
                              ▼
                      https://your-app/s/their-business
```

The agent supplies the thinking. This server supplies the building, the
hosting and the guardrails. There is no second LLM in the loop, so you do not
need an Anthropic or OpenAI key to run it.

## Run it locally

```bash
node server/src/index.mjs          # no install step; nothing to fetch
open http://localhost:3000         # a chat that builds a real page
pnpm test:flow                    # offline backend flow checks
pnpm test:integrations            # browser tokens and provider payloads
```

## Deploy to Render

1. Use [Deploy free test on Render](https://render.com/deploy?repo=https://github.com/bimalkirti1/dayone/tree/setup/render-free-test).
   It selects the `setup/render-free-test` branch, not the old demo on `main`.
   If a service already exists, update its branch instead of creating duplicates.
2. Enter ELEVENLABS_API_KEY in Render's secure Blueprint form. Replit's
   ElevenLabs connection does not automatically transfer to Render.
3. Render generates TOOL_SECRET and SESSION_SECRET. Wait for the service to say Live.
4. Open `/admin/setup` on that service. Authenticate with username `owner`
   and its TOOL_SECRET from Render Environment as the password. This owner-only
   page is not linked from customer screens. Enter TOOL_SECRET in its setup
   form and click Connect. This configures both existing agents:
   browser client tools and telephone webhook tools.
5. This blueprint uses the free plan, no disk, and `SMS_PROVIDER=log`.
   It does not send real SMS until you configure Vobiz separately.

**Temporary testing only.** Generated sites and saved conversations are lost
on redeploy or restart. Free services also sleep when idle, which can delay
voice webhooks. For real clients, use an always-on paid service with a
persistent disk and set `DATA_DIR` to its mount path.

The built frontend is served at `/`; the backend chat console is at
`/console.html`. A frontend build failure now fails the deployment rather
than silently shipping without the frontend.

## Wire up the telephone agent

The protected setup page above is the recommended route. It preserves the
current voice and model and does not place calls. Browser client tools cannot
run during a SIP telephone call; keep the two agents separate.

For manual dashboard setup:

`GET /api/voice/agent-config` returns everything the dashboard needs, already
pointed at your deployment: the first message, the full prompt, and the three
tool schemas with the right URLs and headers.

```bash
curl -H "x-dayone-secret: $TOOL_SECRET" https://your-app.onrender.com/api/voice/agent-config
```

In ElevenLabs → Agents:

- **First message** and **System prompt**: paste from that response.
- **Tools**: add three webhook tools from the `tools` array. Each needs the
  header `x-dayone-secret` set to your `TOOL_SECRET`.
- **Phone number**: attach your Vobiz number (or Twilio) to the agent.

Then set `SMS_PROVIDER=vobiz`, `VOBIZ_AUTH_ID`, `VOBIZ_AUTH_TOKEN`, and
`VOBIZ_SENDER_ID` (a Vobiz messaging-enabled number) so the link gets sent.
Set these in Render's Environment settings; Replit Secrets do not
automatically transfer to Render. Do not paste credentials into chat.

## The guardrails

Two separate jobs, in `server/src/guardrail.mjs`:

**Staying on topic.** Coding, advice, politics, homework, chit-chat and
questions about which model it is are all refused with a short redirect, in
the agent prompt and again in the server. Prompt injection ("ignore previous
instructions") is caught and ignored without comment.

**Not publishing harm.** Gambling, adult services, drugs, weapons, fake
documents or reviews, and pages impersonating a real company or a government
service are refused at the brief, and again at publish — so a caller cannot
talk their way past one check and through the other.

Everything a caller says is escaped before it reaches a page. These pages are
served from your domain, so a caller's words are never trusted as markup.

## The six looks

A page is not one template recoloured. Each direction has its own palette,
typefaces, hero shape and one signature device, chosen from what the caller
says they do.

| Direction | For | What it looks like |
|---|---|---|
| **Hearth** | home kitchens, bakers, caterers | blush ground, mulberry and honey, photo-led with a jar-label wordmark, pie-crust dividers |
| **Studio** | yoga, therapy, salons | pale sage, a very light serif set large, centred, one thin arc |
| **Ledger** | tutors, clinics, consultants | white, ruled rows, an index rail, a fee table — a prospectus |
| **Market** | shops, kirana, florists | deep green panels under a yellow rule, prices as the main event |
| **Atelier** | mehendi, tailoring, photography | dark gallery, gold hairlines, images edge to edge |
| **Civic** | plumbers, electricians, movers | an unmissable blue call band, a checklist, plain rates |

Mood beats trade: a baker who asks for "elegant" gets Atelier, not Hearth.

Add one in `server/src/gen/directions.mjs`; the section renderers pick it up.

## API

| Route | Does |
|---|---|
| `GET /health` | status, which providers are live |
| `POST /api/chat` | the guardrailed text conversation; publishes when it has enough |
| `GET /s/:slug` | a published site |
| `POST /api/voice/tools/save_brief` | agent saves what it heard |
| `POST /api/voice/tools/publish_site` | agent builds and publishes |
| `POST /api/voice/tools/send_link` | agent texts the link |
| `GET /api/voice/agent-config` | prompt and tool schemas for the dashboard |
| `GET /api/sites` | everything published |
| `POST /api/sites` | publish a brief directly |

Tool routes need `x-dayone-secret`. Without `TOOL_SECRET` set they are open,
which is fine locally and wrong in production — `/health` tells you which.
