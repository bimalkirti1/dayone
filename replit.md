# DayOne

Keep the React/Vite frontend and existing Node API handlers/file storage.
Express wraps the handlers for Clerk's canonical authentication middleware.
The user requires an actual working product, not a scripted demo. Primary
builder interactions must use the backend and real generated site links;
do not present simulated login, phone calls, publishing, or SMS as working.
Customer-facing pages must never show or link to provider credentials and
owner setup instructions. Owner settings belong behind authentication.
The user chose email-based accounts for dashboard access.
Only websites created by an authenticated account appear in its dashboard.
Do not silently claim legacy anonymous or telephone-created websites.

## Commands
- Install dependencies using the existing pnpm lockfile.
- `pnpm run build` builds the frontend into `dist/`.
- `node server/src/index.mjs` serves frontend, API, and generated sites.
- `node server/test/flow.mjs` tests backend flows without sending messages.
- `pnpm test:integrations` checks provider payloads and browser-tool isolation.
- `pnpm test:dashboard-live` uses disposable development accounts to check
  real cookie authentication, two-account isolation, mobile layout, and logout.
- `RUN_LIVE_AGENT_TEST=1 pnpm test:agent-live` explicitly uses provider credits.
- Primary browser sessions use the ElevenLabs SDK and signed session endpoint.
- Browser agent sessions require account authentication; published pages stay public.
- `/api/chat` remains a separate deterministic fallback, not an AI chat service.
- Browser client tools never receive TOOL_SECRET or permission to send SMS.

## Deployment scope
The user selected Render's free plan for temporary testing only.
Use no persistent disk; generated sites and conversations are ephemeral.
Keep SMS in log mode until Vobiz credentials and sender are configured.
The user authorized configuring both existing DayOne ElevenLabs agents.
Do not claim live integration is complete until a real Render URL and
authenticated webhook configuration have been verified.

Use the authenticated Git transport for the linked GitHub repository;
the generic connector may report unavailable even when Git works.
