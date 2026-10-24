import { useEffect, useRef, useState, type FormEvent } from "react"
import { ConversationProvider, useConversation } from "@elevenlabs/react"
import { Arcs, ArrowIcon, Logo, Mic, TypingDots, type MicState } from "./brand"

type Message = { id: number; role: "assistant" | "user"; text: string }
type SessionResponse = { signedUrl?: string; sessionToken?: string; error?: string }
type PublishedResult = { ok?: boolean; url?: string; slug?: string; say?: string; error?: string }

function displayError(value: unknown, fallback: string) {
  if (value instanceof Error && value.message) return value.message
  if (typeof value === "string" && value) return value
  return fallback
}

function BuilderConversation({
  opening,
  onHome,
  onNewWebsite,
  onSessionStart,
}: {
  opening?: string
  onHome: () => void
  onNewWebsite: () => void
  onSessionStart: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [sessionAttempt, setSessionAttempt] = useState(false)
  const [selectedMode, setSelectedMode] = useState<"text" | "voice">("text")
  const [error, setError] = useState<string>()
  const [toolError, setToolError] = useState<string>()
  const [siteUrl, setSiteUrl] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [startBusy, setStartBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const tokenRef = useRef<string | undefined>(undefined)
  const startedOpening = useRef(false)
  const nextId = useRef(1)
  const sendMessageRef = useRef<(text: string) => void>(() => undefined)
  const endSessionRef = useRef<() => void>(() => undefined)
  const openingRef = useRef(opening?.trim())
  const intentionalEnd = useRef(false)
  openingRef.current = opening?.trim()

  const { startSession, status, mode, endSession, sendUserMessage } = useConversation({
    onConnect: () => {
      setError(undefined)
      if (openingRef.current && !startedOpening.current) {
        startedOpening.current = true
        sendMessageRef.current(openingRef.current)
      }
    },
    onDisconnect: () => {
      setSending(false)
      tokenRef.current = undefined
      if (!intentionalEnd.current) setError("The agent disconnected. Start a fresh session to continue.")
    },
    onError: (cause) => setError(displayError(cause, "The agent connection ended unexpectedly.")),
    onMessage: (payload) => {
      const role = payload.role === "user" || payload.source === "user" ? "user" : "assistant"
      if (!payload.message?.trim()) return
      setSending(false)
      setMessages((current) => [...current, { id: nextId.current++, role, text: payload.message }])
    },
    clientTools: {
      save_brief: async (params) => {
        setToolError(undefined)
        try {
          const response = await fetch("/api/agent/tools/save_brief", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-dayone-session": tokenRef.current || "" },
            body: JSON.stringify(params),
          })
          const data: unknown = await response.json()
          if (!response.ok) {
            const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
              ? data.error
              : `Saving the brief failed (${response.status}).`
            setToolError(message)
          }
          return JSON.stringify(data)
        } catch (cause) {
          const message = displayError(cause, "Could not reach the brief service.")
          setToolError(`${message} Please check the builder setup.`)
          throw cause
        }
      },
      publish_site: async (params) => {
        setToolError(undefined)
        try {
          const response = await fetch("/api/agent/tools/publish_site", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-dayone-session": tokenRef.current || "" },
            body: JSON.stringify(params),
          })
          const data = await response.json() as PublishedResult
          if (!response.ok || data.ok !== true) {
            setToolError(data.error || "The site was not published. The builder did not confirm a successful publish.")
            return JSON.stringify(data)
          }
          const url = data.url || (data.slug ? `/s/${encodeURIComponent(data.slug)}` : undefined)
          if (url) setSiteUrl(url)
          else setToolError("The site service reported success but returned no public URL.")
          return JSON.stringify(data)
        } catch (cause) {
          const message = displayError(cause, "Could not reach the publishing service.")
          setToolError(`${message} The site was not confirmed as published.`)
          throw cause
        }
      },
    },
  })
  sendMessageRef.current = sendUserMessage
  endSessionRef.current = endSession

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, sending, error, toolError])

  useEffect(() => () => {
    intentionalEnd.current = true
    endSessionRef.current()
  }, [])

  const connected = status === "connected"
  const complete = Boolean(siteUrl)
  const micState: MicState = !connected
    ? status === "connecting" || startBusy ? "thinking" : "idle"
    : mode === "speaking" ? "speaking" : "listening"

  async function start(modeChoice: "text" | "voice") {
    if (startBusy || connected || complete) return
    onSessionStart()
    setSelectedMode(modeChoice)
    setStartBusy(true)
    setSessionAttempt(true)
    setError(undefined)
    setToolError(undefined)
    intentionalEnd.current = false
    startedOpening.current = false
    setMessages([])
    try {
      const response = await fetch("/api/agent/session", { method: "POST" })
      let data: SessionResponse = {}
      try {
        data = await response.json() as SessionResponse
      } catch {
        // Render a setup-oriented error below for malformed responses.
      }
      if (!response.ok || !data.signedUrl || !data.sessionToken) {
        throw new Error(data.error || "Could not prepare the ElevenLabs agent session. Check the builder setup.")
      }
      tokenRef.current = data.sessionToken
      startSession({
        signedUrl: data.signedUrl,
        connectionType: "websocket",
        textOnly: modeChoice === "text",
      })
    } catch (cause) {
      tokenRef.current = undefined
      setError(displayError(cause, "Could not start the ElevenLabs agent session."))
    } finally {
      setStartBusy(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !connected) return
    setDraft("")
    setSending(true)
    sendUserMessage(text)
  }

  function stop() {
    intentionalEnd.current = true
    endSession()
    tokenRef.current = undefined
    setSending(false)
  }

  async function copyLink() {
    if (!siteUrl) return
    try {
      await navigator.clipboard.writeText(new URL(siteUrl, window.location.origin).toString())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setToolError("Could not copy the public link. Select and copy it from the link above.")
    }
  }

  const retry = () => {
    setError(undefined)
    setStartBusy(false)
    setSessionAttempt(false)
  }

  return (
    <div className="screen flex min-h-[100dvh] flex-col">
      <header className="z-20 flex items-center gap-4 bg-paper px-5 py-3 shadow-[0_1px_0_#F1EADB] md:px-8">
        <button onClick={onHome} aria-label="Back to DayOne home" className="flex-none"><Logo className="h-6 md:h-7" /></button>
        <div className="mx-auto w-full max-w-[560px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-label={complete ? "Website published" : connected ? "Agent connected" : "Builder not started"}>
            <div className="progress-fill h-full" style={{ width: complete ? "100%" : connected ? "32%" : "0%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-grey">
            <span>Talk naturally about your business</span>
            <span>{complete ? "Published" : connected ? "Agent connected" : "Ready when you are"}</span>
          </div>
        </div>
        <div className="hidden w-[180px] flex-none justify-end lg:flex">
          {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-amber h-10 px-4 text-[14px]">Open your site</a>}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,40%)_minmax(0,60%)]">
        <section className="flex min-h-[calc(100dvh-70px)] flex-col lg:min-h-0 lg:shadow-[1px_0_0_#F1EADB]" aria-label="Website builder conversation">
          <div className="flex flex-none flex-col items-center gap-2 pb-3 pt-5">
            <Mic size={76} state={micState} label={connected ? mode === "speaking" ? "Agent speaking" : "Connected and listening" : "Agent not started"} />
            <p className="text-[13px] font-medium text-grey" aria-live="polite">
              {status === "connecting" || startBusy ? "Connecting to your agent…" : connected ? mode === "speaking" ? "Your agent is speaking." : selectedMode === "text" ? "Text chat is connected." : "Listening for your voice." : complete ? "Your website is published." : "Choose how you want to talk."}
            </p>
            {!connected && !complete && (
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <button type="button" disabled={startBusy || status === "connecting"} onClick={() => void start("text")} className="btn btn-amber h-10 px-4 text-[13px] disabled:opacity-60">
                  {startBusy && selectedMode === "text" ? "Starting…" : "Start text chat"}
                </button>
                <button type="button" disabled={startBusy || status === "connecting"} onClick={() => void start("voice")} className="btn btn-white h-10 px-4 text-[13px] disabled:opacity-60">
                  {startBusy && selectedMode === "voice" ? "Starting…" : "Start voice"}
                </button>
              </div>
            )}
            {connected && <button type="button" onClick={stop} className="btn btn-white h-9 px-4 text-[13px]">Stop session</button>}
          </div>

          <div ref={listRef} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-5 pb-5 md:px-8">
            {!sessionAttempt && !messages.length && (
              <div className="mx-auto mt-3 max-w-[340px] rounded-[20px] border border-line bg-white/75 p-5 text-center">
                <p className="text-[16px] font-semibold text-ink">A real conversation. A real website.</p>
                <p className="mt-2 text-[13px] leading-5 text-grey">Choose text or voice to connect to the DayOne agent. Starting a session may incur ElevenLabs usage charges.</p>
              </div>
            )}
            {messages.map((message) => message.role === "assistant" ? (
              <div key={message.id} className="bubble flex items-end gap-2.5">
                <span className="grid size-8 flex-none place-items-center" aria-hidden><Arcs className="h-4 w-[18px]" /></span>
                <p className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-bl-[8px] bg-white px-4 py-3 text-[15px] shadow-soft">{message.text}</p>
              </div>
            ) : (
              <div key={message.id} className="bubble flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-[8px] bg-cream px-4 py-3 text-[15px]">{message.text}</p>
              </div>
            ))}
            {sending && <div className="bubble flex items-end gap-2.5"><span className="grid size-8 flex-none place-items-center" aria-hidden><Arcs className="h-4 w-[18px]" /></span><span className="rounded-[20px] rounded-bl-[8px] bg-white px-4 py-3.5 shadow-soft"><TypingDots /></span></div>}
            {(error || toolError) && (
              <div role="alert" className="rounded-[18px] border border-[#D8A08B] bg-[#FFF5F0] p-4 text-[14px] text-[#773D2A]">
                <p>{error || toolError}</p>
                <p className="mt-1 text-[13px]">Please try again later if the agent is unavailable.</p>
                {error && !connected && <button type="button" onClick={retry} className="btn btn-white ml-3 mt-3 h-9 px-4 text-[13px]">Try again</button>}
              </div>
            )}
            {complete && (
              <div className="card bubble mt-4 p-5">
                <p className="text-[17px] font-semibold">Your website is published.</p>
                <p className="mt-1 text-[14px] text-grey">This is the public link returned by the publishing service.</p>
                <a href={siteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-[14px] font-medium text-brown underline underline-offset-4">{siteUrl}</a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void copyLink()} className="btn btn-white h-9 px-4 text-[13px]">{copied ? "Copied" : "Copy link"}</button>
                  <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-amber h-9 px-4 text-[13px]">Open public site</a>
                </div>
                <p className="mt-3 text-[13px] text-grey">The website is ready. Start a new website to create another one.</p>
                <button type="button" onClick={onNewWebsite} className="btn btn-white mt-4 h-10 px-4 text-[14px]">Start a new website</button>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex-none px-5 pb-6 pt-2 md:px-8 lg:pb-8">
            <label className="flex min-h-[52px] items-center gap-2 rounded-full bg-white pl-5 pr-1.5 shadow-soft focus-within:shadow-[0_0_0_3px_#FFEFA0,0_8px_24px_rgba(83,76,67,0.08)]">
              <span className="sr-only">Your message</span>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={!connected ? "Start a session to chat" : complete ? "Ask about your website…" : "Type a message…"} disabled={!connected} autoComplete="off" enterKeyHint="send" className="h-full min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-grey/70 disabled:opacity-60" />
              <button type="submit" aria-label="Send message" disabled={!draft.trim() || !connected} className="btn btn-amber grid size-10 place-items-center rounded-full disabled:opacity-50"><ArrowIcon /></button>
            </label>
            <p className="mt-2 px-4 text-[11px] text-grey/75">Text chat works without microphone access. Voice uses ElevenLabs audio through your browser.</p>
            <p className="mt-1 px-4 text-[11px] text-grey/75">Telephone calls and SMS link delivery require Vobiz and phone-provider setup.</p>
          </form>
        </section>

        <section className={`fixed inset-x-0 bottom-0 z-30 flex h-[82dvh] flex-col rounded-t-[26px] bg-paper shadow-[0_-12px_40px_rgba(83,76,67,0.14)] transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:translate-y-0 lg:rounded-none lg:bg-[#FBF7EC] lg:p-6 lg:shadow-none ${previewOpen ? "translate-y-0" : "translate-y-[calc(100%-52px)]"}`} aria-label="Published site preview">
          <div className="flex flex-none items-center justify-between px-5 py-3 lg:hidden">
            <span className="text-[14px] font-semibold">Website preview</span>
            <button type="button" onClick={() => setPreviewOpen((open) => !open)} className="btn btn-white h-9 px-4 text-[13px]">{previewOpen ? "Back to chat" : "Show preview"}</button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white shadow-soft lg:rounded-[20px]">
            <div className="flex flex-none items-center gap-3 px-4 py-3 shadow-[0_1px_0_#F1EADB]">
              <div className="hidden gap-1.5 sm:flex" aria-hidden>{[0, 1, 2].map((n) => <span key={n} className="size-2.5 rounded-full bg-line" />)}</div>
              <span className="mx-auto truncate rounded-full bg-paper px-4 py-1 text-[12px] text-grey">{siteUrl || "Your public website will appear here"}</span>
              <span className="chip hidden px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex"><span className={`size-1.5 rounded-full ${siteUrl ? "bg-[#25A244]" : "bg-amber"}`} />{siteUrl ? "Published" : "Waiting"}</span>
            </div>
            {siteUrl ? <iframe title="Your published website" src={siteUrl} className="min-h-0 flex-1 border-0 bg-white" /> : (
              <div className="grid min-h-0 flex-1 place-items-center bg-[#FFF9EA] p-8 text-center">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-white shadow-soft"><Arcs className="h-7 w-8" /></div>
                  <p className="mt-5 text-[16px] font-medium text-ink">Your real site preview will appear here.</p>
                  <p className="mt-2 max-w-[34ch] text-[14px] text-grey">When the agent successfully publishes your site, its public URL will load in this panel.</p>
                </div>
              </div>
            )}
          </div>
        </section>
        {!previewOpen && <button type="button" onClick={() => setPreviewOpen(true)} className="fixed bottom-[82px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-brown shadow-soft lg:hidden">{siteUrl ? "View published site" : "Preview panel"}</button>}
      </main>
    </div>
  )
}

export function Builder(props: { opening?: string; onHome: () => void; onNewWebsite: () => void; onSessionStart: () => void }) {
  return <ConversationProvider><BuilderConversation {...props} /></ConversationProvider>
}
