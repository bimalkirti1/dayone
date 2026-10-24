import { useEffect, useRef, useState, type FormEvent } from "react"
import { Arcs, ArrowIcon, Logo, Mic, TypingDots, type MicState } from "./brand"

type ChatReply = {
  sessionId?: string
  reply?: string
  ready?: boolean
  blocked?: boolean | string
  refused?: boolean
  brief?: unknown
  url?: string
  slug?: string
}

type Message = { id: number; role: "assistant" | "user"; text: string }

type SpeechRecognitionResult = { transcript: string }
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResult>> }
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function siteHref(data: ChatReply) {
  if (data.url) return data.url
  if (data.slug) return `/s/${encodeURIComponent(data.slug)}`
  return undefined
}

function readableError(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const data = body as Record<string, unknown>
    if (typeof data.error === "string") return data.error
    if (typeof data.message === "string") return data.message
  }
  return fallback
}

export function Builder({
  opening,
  onHome,
  onNewWebsite,
}: {
  opening?: string
  onHome: () => void
  onNewWebsite: () => void
}) {
  const [sessionId, setSessionId] = useState<string>()
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [ready, setReady] = useState(false)
  const [siteUrl, setSiteUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [blocked, setBlocked] = useState(false)
  const [micState, setMicState] = useState<MicState>("thinking")
  const [voiceMessage, setVoiceMessage] = useState("")
  const [voiceAvailable, setVoiceAvailable] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const startedOpening = useRef(false)
  const nextId = useRef(1)

  const request = async (payload: { sessionId?: string; message?: string }) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    let data: ChatReply = {}
    try {
      data = (await response.json()) as ChatReply
    } catch {
      // Use the HTTP status message below if the server response isn't JSON.
    }
    if (!response.ok) {
      throw new Error(readableError(data, `The request failed (${response.status}). Please try again.`))
    }
    return data
  }

  const applyReply = (data: ChatReply) => {
    if (data.sessionId) setSessionId(data.sessionId)
    if (data.reply) setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: data.reply! }])
    if (data.blocked) {
      setBlocked(Boolean(data.refused))
      if (!data.reply && typeof data.blocked === "string") {
        setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: data.blocked as string }])
      }
    }
    if (data.ready) {
      setReady(true)
      setSiteUrl(siteHref(data))
    }
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    request({})
      .then((data) => {
        if (!alive) return
        if (!data.sessionId) throw new Error("The server did not open a builder session. Please retry.")
        applyReply(data)
        setError(undefined)
        setMicState("idle")
      })
      .catch((cause: unknown) => {
        if (!alive) return
        setError(cause instanceof Error ? cause.message : "Could not open a builder session.")
        setMicState("idle")
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
      recognitionRef.current?.stop()
    }
  }, [sessionAttempt])

  useEffect(() => {
    if (sessionId && opening?.trim() && !startedOpening.current && !ready && !blocked) {
      startedOpening.current = true
      void sendMessage(opening.trim())
    }
  }, [sessionId, opening, ready, blocked])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, sending, loading, error])

  useEffect(() => {
    const speech = window as SpeechWindow
    setVoiceAvailable(Boolean(speech.SpeechRecognition || speech.webkitSpeechRecognition))
    return () => recognitionRef.current?.stop()
  }, [])

  async function sendMessage(text: string) {
    if (!sessionId || sending || ready || blocked) return
    setSending(true)
    setError(undefined)
    setMicState("thinking")
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text }])
    try {
      const data = await request({ sessionId, message: text })
      if (!data.sessionId) throw new Error("The builder did not return a session ID. Please try again.")
      applyReply(data)
      if (!data.blocked) setAnswered((count) => Math.min(6, count + 1))
    } catch (cause) {
      setDraft(text)
      setError(cause instanceof Error ? cause.message : "Your answer could not be sent.")
    } finally {
      setSending(false)
      setMicState("idle")
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !sessionId || sending || ready || blocked) return
    setDraft("")
    void sendMessage(text)
  }

  const startVoice = () => {
    const speech = window as SpeechWindow
    const Recognition = speech.SpeechRecognition || speech.webkitSpeechRecognition
    if (!Recognition) {
      setVoiceMessage("Speech input is not supported in this browser. You can type your answer instead.")
      return
    }
    setVoiceMessage("Allow microphone access when your browser asks. Nothing is recorded until you start listening.")
    const recognition = new Recognition()
    recognition.lang = navigator.language || "en-IN"
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0]?.transcript?.trim()
      if (result) {
        setDraft((current) => current ? `${current} ${result}` : result)
        setVoiceMessage("Speech added to your draft. Review it, then send when ready.")
      }
    }
    recognition.onerror = (event) => {
      const message = event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access was denied. Check your browser permissions or type your answer."
        : event.error === "no-speech"
          ? "No speech was detected. Try again or type your answer."
          : `Speech input stopped (${event.error}). You can type your answer instead.`
      setVoiceMessage(message)
      setMicState("idle")
    }
    recognition.onend = () => setMicState("idle")
    recognitionRef.current?.stop()
    recognitionRef.current = recognition
    try {
      recognition.start()
      setMicState("listening")
    } catch {
      setMicState("idle")
      setVoiceMessage("Could not start microphone input. Check browser permissions or type your answer.")
    }
  }

  const step = answered
  const progress = ready ? 100 : Math.min(92, (step / 6) * 100)

  return (
    <div className="screen flex min-h-[100dvh] flex-col">
      <header className="z-20 flex items-center gap-4 bg-paper px-5 py-3 shadow-[0_1px_0_#F1EADB] md:px-8">
        <button onClick={onHome} aria-label="Back to DayOne home" className="flex-none">
          <Logo className="h-6 md:h-7" />
        </button>
        <div className="mx-auto w-full max-w-[560px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-label={`${step} of 6 answers`}>
            <div className="progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-grey">
            <span>Tell us about your business</span>
            <span>{ready ? "Published" : `${step} of 6 answers`}</span>
          </div>
        </div>
        <div className="hidden w-[180px] flex-none justify-end lg:flex">
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-amber h-10 px-4 text-[14px]">
              Open your site
            </a>
          )}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,40%)_minmax(0,60%)]">
        <section className="flex min-h-[calc(100dvh-70px)] flex-col lg:min-h-0 lg:shadow-[1px_0_0_#F1EADB]" aria-label="Website builder conversation">
          <div className="flex flex-none flex-col items-center gap-2 pb-3 pt-5">
            <Mic size={76} state={micState} label={micState === "listening" ? "Listening to your speech" : "Speech input"} onClick={startVoice} />
            <p className="text-[13px] font-medium text-grey" aria-live="polite">
              {micState === "listening" ? "Listening. Speak now." : micState === "thinking" ? "DayOne is responding…" : "Type your answer, or use speech input"}
            </p>
            {!voiceAvailable && <p className="text-[11px] text-grey/80">Speech input is unavailable here; typing always works.</p>}
          </div>

          <div ref={listRef} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-5 pb-5 md:px-8">
            {loading && (
              <div className="space-y-3" aria-label="Opening a builder session">
                <div className="h-14 w-[72%] animate-pulse rounded-[20px] rounded-bl-[8px] bg-white shadow-soft" />
                <div className="h-10 w-[48%] animate-pulse rounded-[20px] bg-white/70" />
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
            {sending && (
              <div className="bubble flex items-end gap-2.5">
                <span className="grid size-8 flex-none place-items-center" aria-hidden><Arcs className="h-4 w-[18px]" /></span>
                <span className="rounded-[20px] rounded-bl-[8px] bg-white px-4 py-3.5 shadow-soft"><TypingDots /></span>
              </div>
            )}
            {error && (
              <div role="alert" className="rounded-[18px] border border-[#D8A08B] bg-[#FFF5F0] p-4 text-[14px] text-[#773D2A]">
                <p>{error}</p>
                <p className="mt-1 text-[13px]">{sessionId ? "Your answer is back in the composer. Review it, then send it again." : "A builder session could not be opened."}</p>
                {!sessionId && (
                  <button type="button" onClick={() => { setError(undefined); setLoading(true); setSessionAttempt((attempt) => attempt + 1) }} className="btn btn-white mt-3 h-9 px-4 text-[13px]">Retry connection</button>
                )}
              </div>
            )}
            {blocked && (
              <div className="rounded-[18px] border border-line bg-white p-4 text-[14px] text-grey">
                This chat cannot continue. You can start a new website conversation.
                <button onClick={onNewWebsite} className="btn btn-white mt-3 h-10 px-4 text-[14px]">Start a new website</button>
              </div>
            )}
            {ready && (
              <div className="card bubble mt-4 p-5">
                <p className="text-[17px] font-semibold">Your website is published.</p>
                {siteUrl ? (
                  <>
                    <p className="mt-1 text-[14px] text-grey">This is the real link returned by the website builder.</p>
                    <a href={siteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-[14px] font-medium text-brown underline underline-offset-4">{siteUrl}</a>
                  </>
                ) : (
                  <p className="mt-1 text-[14px] text-grey">The server marked this conversation ready, but did not return a site URL or slug.</p>
                )}
                <p className="mt-3 text-[13px] text-grey">This chat does not support edits after publishing. Start a new website to create another one.</p>
                <button onClick={onNewWebsite} className="btn btn-white mt-4 h-10 px-4 text-[14px]">Start a new website</button>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex-none px-5 pb-6 pt-2 md:px-8 lg:pb-8">
            {voiceMessage && <p className="mb-2 px-4 text-[12px] text-grey" role="status">{voiceMessage}</p>}
            <label className="flex min-h-[52px] items-center gap-2 rounded-full bg-white pl-5 pr-1.5 shadow-soft focus-within:shadow-[0_0_0_3px_#FFEFA0,0_8px_24px_rgba(83,76,67,0.08)]">
              <span className="sr-only">Your answer</span>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={ready ? "This conversation is complete" : "Type your answer…"}
                disabled={!sessionId || loading || sending || ready || blocked}
                autoComplete="off"
                enterKeyHint="send"
                className="h-full min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-grey/70 disabled:opacity-60"
              />
              <button type="submit" aria-label="Send answer" disabled={!draft.trim() || !sessionId || loading || sending || ready || blocked} className="btn btn-amber grid size-10 place-items-center rounded-full disabled:opacity-50">
                <ArrowIcon />
              </button>
            </label>
            <p className="mt-2 px-4 text-[11px] text-grey/75">Anonymous builder. No account or sign-in is required.</p>
          </form>
        </section>

        <section className={`fixed inset-x-0 bottom-0 z-30 flex h-[82dvh] flex-col rounded-t-[26px] bg-paper shadow-[0_-12px_40px_rgba(83,76,67,0.14)] transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:translate-y-0 lg:rounded-none lg:bg-[#FBF7EC] lg:p-6 lg:shadow-none ${previewOpen ? "translate-y-0" : "translate-y-[calc(100%-52px)]"}`} aria-label="Published site preview">
          <div className="flex flex-none items-center justify-between px-5 py-3 lg:hidden">
            <span className="text-[14px] font-semibold">Website preview</span>
            <button onClick={() => setPreviewOpen((open) => !open)} className="btn btn-white h-9 px-4 text-[13px]">{previewOpen ? "Back to chat" : "Show preview"}</button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white shadow-soft lg:rounded-[20px]">
            <div className="flex flex-none items-center gap-3 px-4 py-3 shadow-[0_1px_0_#F1EADB]">
              <div className="hidden gap-1.5 sm:flex" aria-hidden>{[0, 1, 2].map((n) => <span key={n} className="size-2.5 rounded-full bg-line" />)}</div>
              <span className="mx-auto truncate rounded-full bg-paper px-4 py-1 text-[12px] text-grey">{siteUrl || "Your published site will appear here"}</span>
              <span className="chip hidden px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex"><span className={`size-1.5 rounded-full ${siteUrl ? "bg-[#25A244]" : "bg-amber"}`} />{siteUrl ? "Published" : "Waiting"}</span>
            </div>
            {siteUrl ? (
              <iframe title="Your published website" src={siteUrl} className="min-h-0 flex-1 border-0 bg-white" />
            ) : (
              <div className="grid min-h-0 flex-1 place-items-center bg-[#FFF9EA] p-8 text-center">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-white shadow-soft"><Arcs className="h-7 w-8" /></div>
                  <p className="mt-5 text-[16px] font-medium text-ink">Your real site preview will appear here.</p>
                  <p className="mt-2 max-w-[34ch] text-[14px] text-grey">Answer the builder’s questions. When it is published, the server’s site URL will load in this panel.</p>
                </div>
              </div>
            )}
          </div>
        </section>
        {!previewOpen && (
          <button onClick={() => setPreviewOpen(true)} className="fixed bottom-[82px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-brown shadow-soft lg:hidden">
            {siteUrl ? "View published site" : "Preview panel"}
          </button>
        )}
      </main>
    </div>
  )
}
