# DayOne — voice to website

Someone rings a number, talks for two minutes, and a website for their business
is live and texted to their phone.

This repo holds two halves:

- `src/` — the marketing front end (React + Vite, from Figma Make). Unchanged.
- `server/` — the service that does the work. **No dependencies.** Plain Node 22.

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
4. Add the secrets marked `sync: false` in the dashboard when you have them.

**On persistence.** `render.yaml` mounts a 1 GB disk so published sites
survive deploys and restarts, which is why it asks for the `starter` plan —
free instances cannot mount a disk. If you ever switch to `free`, delete the
`disk:` block and set `DATA_DIR=./server/data`, and know that every deploy
wipes the sites and links you have already texted stop working.

## Wire up the voice agent

`GET /api/voice/agent-config` returns everything the dashboard needs, already
pointed at your deployment: the first message, the full prompt, and the three
tool schemas with the right URLs and headers.

```bash
curl https://your-app.onrender.com/api/voice/agent-config
```

In ElevenLabs → Agents:

- **First message** and **System prompt**: paste from that response.
- **Tools**: add three webhook tools from the `tools` array. Each needs the
  header `x-dayone-secret` set to your `TOOL_SECRET`.
- **Phone number**: attach your Vobiz number (or Twilio) to the agent.

Then set `SMS_PROVIDER=vobiz` and `VOBIZ_API_KEY` so the link gets sent.

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
