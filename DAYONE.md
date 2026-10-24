# DayOne — voice to website

Someone rings a number, talks for two minutes, and a website for their business
is live and texted to their phone.

This repo holds two halves:

- `src/` — the React + Vite frontend and anonymous browser builder. The
  builder sends real answers to `/api/chat` and displays the generated site.
- `server/` — the service that does the work. **No dependencies.** Plain Node 22.

The browser flow does not require phone-service credentials. Microphone input,
where the browser supports it, transcribes answers; it is not an ElevenLabs call.
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
node server/test/flow.mjs          # 43 end-to-end checks
```

## Deploy to Render

1. Push this repo to GitHub.
2. Render → **New → Blueprint**, pick the repo. `render.yaml` is read automatically.
3. Render generates `TOOL_SECRET`. Copy it — the agent needs it.
4. This blueprint uses the free plan, no disk, and `SMS_PROVIDER=log`.
   It does not send real SMS until you configure Vobiz separately.

**Temporary testing only.** Generated sites and saved conversations are lost
on redeploy or restart. Free services also sleep when idle, which can delay
voice webhooks. For real clients, use an always-on paid service with a
persistent disk and set `DATA_DIR` to its mount path.

The built frontend is served at `/`; the backend chat console is at
`/console.html`. A frontend build failure now fails the deployment rather
than silently shipping without the frontend.

## Wire up the voice agent

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
