import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Arcs,
  ArrowIcon,
  CALL_NUMBER,
  CALL_TEL,
  CheckIcon,
  IllSunrise,
  Logo,
  Mic,
  PhoneIcon,
  TypingDots,
  type MicState,
} from "./brand"
import { NO_SECTIONS, Site, type SecKey, type Sections } from "./Site"
import { Celebration } from "./Finale"

type Action = SecKey | "warm" | "refine" | "ready"
type Step = { who: "dayone" | "meera"; text: string; do?: Action[] }
type Msg = {
  id: number
  who: "dayone" | "meera"
  text: string
  shown: number
  ready?: boolean
}

const SCRIPT: Step[] = [
  {
    who: "dayone",
    text: "Hi! I'm DayOne. Tell me what you do, and I'll build your page while we talk.",
  },
  {
    who: "meera",
    text: "I bake custom cakes and cookies from home in Indiranagar.",
    do: ["hero"],
  },
  {
    who: "dayone",
    text: "Oh, that sounds lovely 🍰 Who usually orders from you?",
  },
  {
    who: "meera",
    text: "Mostly families for birthdays, and some offices.",
    do: ["features"],
  },
  {
    who: "dayone",
    text: "When someone visits your page, what's the one thing you'd love them to do?",
  },
  {
    who: "meera",
    text: "Message me on WhatsApp to order.",
    do: ["testimonials"],
  },
  {
    who: "dayone",
    text: "Perfect. Watch the right side, your page is coming together ✨",
    do: ["contact"],
  },
  {
    who: "dayone",
    text: "How should it feel? Warm and homely, clean and simple, or bold and fun?",
  },
  { who: "meera", text: "Warm and homely.", do: ["warm"] },
  {
    who: "dayone",
    text: "Lovely. It feels a bit like your kitchen now 🌅 Anything you’d like to change?",
  },
  {
    who: "meera",
    text: "Can you add my prices and make the headline shorter?",
    do: ["refine"],
  },
  {
    who: "dayone",
    text: "Done! Your prices are in and the headline is shorter. Your page is ready whenever you are.",
    do: ["ready"],
  },
]

const STEPS = ["Getting to know you", "Building your page", "Ready to share"]

function Progress({ p }: { p: number }) {
  const current = p >= 1 ? 3 : p >= 0.4 ? 1 : 0
  const mobileIdx = Math.min(current, 2)
  return (
    <div className="w-full">
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="progress-fill h-full rounded-full"
          style={{ width: `${p * 100}%` }}
        />
      </div>
      <ol className="mt-2.5 grid grid-cols-1 text-[13px] sm:grid-cols-3">
        {STEPS.map((s, n) => {
          const done = n < current
          const active = n === current
          return (
            <li
              key={s}
              className={`items-center gap-2 sm:flex ${
                n === 1 ? "sm:justify-center" : n === 2 ? "sm:justify-end" : ""
              } ${n === mobileIdx ? "flex justify-center" : "hidden"} ${
                done || active ? "font-medium text-brown" : "text-grey/70"
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full transition-colors duration-300 ${
                  done ? "bg-amber text-brown" : active ? "bg-cream" : "bg-line"
                }`}
              >
                {done ? (
                  <CheckIcon key="c" className="size-3" />
                ) : active ? (
                  <span className="size-1.5 rounded-full bg-amber" />
                ) : null}
              </span>
              {s}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Bubble({ m }: { m: Msg }) {
  if (m.who === "dayone")
    return (
      <div className="bubble flex items-end gap-2.5">
        <span className="grid size-8 flex-none place-items-center" aria-hidden>
          <Arcs className="h-4 w-[18px]" />
        </span>
        <p className="max-w-[85%] rounded-[20px] rounded-bl-[8px] bg-white px-4 py-3 text-[16px] shadow-soft">
          {m.text}
        </p>
      </div>
    )
  const words = m.text.split(" ")
  const live = m.shown < words.length
  return (
    <div className="bubble flex justify-end">
      <p className="max-w-[85%] rounded-[20px] rounded-br-[8px] bg-cream px-4 py-3 text-[16px]">
        {words.slice(0, Math.max(1, m.shown)).join(" ")}
        {live && <span className="caret" />}
      </p>
    </div>
  )
}

export function Builder({
  speed,
  opening: initialOpening,
  onHome,
  onHandoff,
  onOpenSite,
}: {
  speed: number
  opening?: string
  onHome: () => void
  onHandoff: () => void
  onOpenSite: () => void
}) {
  // Text typed on the landing page (or in the intro card) replaces the first spoken answer.
  const [opening, setOpening] = useState(initialOpening)
  const [phase, setPhase] = useState<"intro" | "chat">(
    initialOpening ? "chat" : "intro",
  )
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [mic, setMic] = useState<MicState>("idle")
  const [sec, setSec] = useState<Sections>(NO_SECTIONS)
  const [warm, setWarm] = useState(false)
  const [short, setShort] = useState(false)
  const [editKey, setEditKey] = useState(0)
  const [progress, setProgress] = useState(initialOpening ? 0.18 : 0.1)
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [published, setPublished] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [draft, setDraft] = useState("")
  const [introDraft, setIntroDraft] = useState("")
  const speedRef = useRef(speed)
  speedRef.current = speed
  const timers = useRef<number[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(100)

  const later = (fn: () => void, ms: number, scaled = true) => {
    timers.current.push(
      window.setTimeout(fn, scaled ? ms / speedRef.current : ms),
    )
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const scrollPreviewTo = (k: SecKey) => {
    requestAnimationFrame(() => {
      const root = previewRef.current
      const el = root?.querySelector<HTMLElement>(`[data-sec="${k}"]`)
      if (root && el)
        root.scrollTo({
          top: Math.max(0, el.offsetTop - 24),
          behavior: "smooth",
        })
    })
  }

  const build = (k: SecKey) => {
    setSec((s) => ({ ...s, [k]: "skeleton" }))
    setPulse((p) => p + 1)
    later(() => scrollPreviewTo(k), 120)
    later(() => setSec((s) => ({ ...s, [k]: "ready" })), 1100)
  }

  const apply = (a: Action) => {
    if (a === "warm") return setWarm(true)
    if (a === "refine") {
      setShort(true)
      setEditKey((n) => n + 1)
      later(() => scrollPreviewTo("hero"), 50)
      later(() => build("pricing"), 900)
      later(() => {
        setToast("Updated ✨ You can change anything, anytime.")
        later(() => setToast(null), 3400, false)
      }, 1200)
      return
    }
    if (a === "ready") {
      setReady(true)
      setProgress(1)
      return
    }
    build(a)
    if (a === "hero") setProgress(0.45)
    if (a === "testimonials") setProgress(0.6)
    if (a === "contact") setProgress(0.72)
  }

  // Scripted conversation: each line waits for a natural pause, scaled by the speed toggle.
  useEffect(() => {
    if (phase !== "chat") return
    let alive = true
    const wait = (ms: number) =>
      new Promise<void>((res) =>
        timers.current.push(window.setTimeout(res, ms / speedRef.current)),
      )
    const run = async () => {
      await wait(600)
      const script = opening
        ? SCRIPT.map((s, n) =>
            n === 1
              ? { ...s, text: opening, typed: true }
              : n === 2
                ? { ...s, text: "Oh, that sounds lovely. Who usually comes to you?" }
                : s,
          )
        : SCRIPT
      for (const [idx, step] of script.entries()) {
        if (!alive) return
        if (step.who === "dayone") {
          setMic("thinking")
          setTyping(true)
          await wait(700 + Math.min(step.text.length * 6, 500))
          if (!alive) return
          setTyping(false)
          setMic("speaking")
          setMsgs((m) => [
            ...m,
            { id: idx, who: "dayone", text: step.text, shown: 999 },
          ])
          step.do?.forEach(apply)
          await wait(600 + step.text.length * 13)
          if (!alive) return
          setMic("idle")
        } else if ("typed" in step) {
          setMsgs((m) => [
            ...m,
            { id: idx, who: "meera", text: step.text, shown: 999 },
          ])
          await wait(500)
          if (!alive) return
          setMic("thinking")
          await wait(450)
          if (!alive) return
          step.do?.forEach(apply)
        } else {
          setMic("listening")
          const words = step.text.split(" ")
          setMsgs((m) => [
            ...m,
            { id: idx, who: "meera", text: step.text, shown: 1 },
          ])
          for (let w = 2; w <= words.length; w++) {
            await wait(140 + Math.random() * 90)
            if (!alive) return
            setMsgs((m) =>
              m.map((x) => (x.id === idx ? { ...x, shown: w } : x)),
            )
          }
          await wait(400)
          if (!alive) return
          setMic("thinking")
          await wait(450)
          if (!alive) return
          step.do?.forEach(apply)
        }
        await wait(800 + Math.random() * 700)
      }
      if (alive) setMic("idle")
    }
    run()
    return () => {
      alive = false
    }
  }, [phase])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [msgs, typing, ready])

  const start = (text?: string) => {
    if (text) setOpening(text)
    setPhase("chat")
    setProgress(0.18)
  }

  const startTyped = (e: FormEvent) => {
    e.preventDefault()
    const text = introDraft.trim()
    if (text) start(text)
  }

  const send = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft("")
    const id = nextId.current++
    setMsgs((m) => [...m, { id, who: "meera", text, shown: 999 }])
    later(
      () =>
        setMsgs((m) => [
          ...m,
          {
            id: id + 0.5,
            who: "dayone",
            text: "Got it, thank you! I’ve added that to your notes ✨",
            shown: 999,
          },
        ]),
      900,
    )
  }

  const publish = () => {
    setDrawer(false)
    setCelebrate(true)
    setPublished(true)
  }

  const micLabel = {
    idle: ready ? "All done for now" : "Tap to talk",
    listening: "Listening…",
    speaking: "DayOne is talking",
    thinking: "Thinking…",
  }[mic]
  const hasPage = sec.hero !== "hidden"

  return (
    <div className="screen flex h-dvh flex-col overflow-hidden">
      <header className="z-20 flex flex-none items-center gap-4 bg-paper px-5 py-3 shadow-[0_1px_0_#F1EADB] md:gap-8 md:px-8">
        <button
          onClick={onHome}
          aria-label="Back to DayOne home"
          className="flex-none"
        >
          <Logo className="h-6 md:h-7" />
        </button>
        <div className="mx-auto w-full max-w-[560px]">
          <Progress p={progress} />
        </div>
        <div className="hidden w-[210px] flex-none justify-end lg:flex">
          {ready && (
            <button
              onClick={publish}
              className="btn btn-amber bubble h-11 px-5 text-[15px]"
            >
              {published ? "Share my page" : "Put my page online"}
            </button>
          )}
        </div>
      </header>

      {phase === "intro" ? (
        <main className="relative grid flex-1 place-items-center overflow-y-auto px-5 py-10">
          <div
            className="glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[760px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          />
          <div className="card card-in relative w-full max-w-[480px] rounded-[24px] px-7 py-10 text-center md:px-10">
            <IllSunrise className="mx-auto h-28" />
            <h1 className="mt-6 text-[26px]">There are no wrong answers.</h1>
            <p className="mt-3 text-[18px] text-grey">
              Just talk naturally, and you can always change things later.
            </p>
            <button
              onClick={() => start()}
              className="btn btn-amber mt-8 h-12 w-full px-7 text-[16px] sm:w-auto"
            >
              I’m ready to talk
            </button>
            <div className="mt-6 flex items-center gap-3 text-[13px] text-grey">
              <span className="h-px flex-1 bg-line" aria-hidden />
              or type it
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
            <form onSubmit={startTyped} className="chatbar mt-4">
              <label htmlFor="intro-chat" className="sr-only">
                Tell us about your business
              </label>
              <input
                id="intro-chat"
                value={introDraft}
                onChange={(e) => setIntroDraft(e.target.value)}
                placeholder="I run a small…"
                autoComplete="off"
                enterKeyHint="send"
                className="chatbar-input"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!introDraft.trim()}
                className="btn btn-amber chatbar-send"
              >
                <ArrowIcon />
              </button>
            </form>
            <a
              href={CALL_TEL}
              className="mt-6 inline-flex items-center gap-2 text-[15px] text-grey transition-colors hover:text-ink"
            >
              <PhoneIcon /> Or call us on {CALL_NUMBER}
            </a>
          </div>
        </main>
      ) : (
        <main className="relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[40%_60%] lg:grid-rows-[minmax(0,1fr)]">
          {/* Conversation */}
          <section
            className="flex min-h-0 flex-1 flex-col lg:shadow-[1px_0_0_#F1EADB]"
            aria-label="Conversation"
          >
            <div className="flex flex-none flex-col items-center gap-3 pb-4 pt-7">
              <Mic size={92} state={mic} label={micLabel} />
              <p
                className="h-5 text-[14px] font-medium text-grey"
                aria-live="polite"
              >
                {micLabel}
              </p>
            </div>
            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-6 md:px-8"
            >
              {msgs.map((m) => (
                <Bubble key={m.id} m={m} />
              ))}
              {typing && (
                <div className="bubble flex items-end gap-2.5">
                  <span
                    className="grid size-8 flex-none place-items-center"
                    aria-hidden
                  >
                    <Arcs className="h-4 w-[18px]" />
                  </span>
                  <span className="rounded-[20px] rounded-bl-[8px] bg-white px-4 py-3.5 shadow-soft">
                    <TypingDots />
                  </span>
                </div>
              )}
              {ready && (
                <div className="card bubble mt-4 p-5 text-center">
                  <p className="text-[16px] font-semibold">
                    Your page is ready to share 🌅
                  </p>
                  <p className="mt-1 text-[15px] text-grey">
                    Have a look. Put it online whenever it feels right.
                  </p>
                  <button
                    onClick={publish}
                    className="btn btn-amber mt-4 h-12 w-full px-6 text-[16px]"
                  >
                    {published ? "Share my page" : "Put my page online"}
                  </button>
                </div>
              )}
            </div>
            <form
              onSubmit={send}
              className="flex-none px-5 pb-8 pt-2 md:px-8 lg:pb-9"
            >
              <label className="flex h-13 items-center gap-2 rounded-full bg-white pl-5 pr-1.5 shadow-soft focus-within:shadow-[0_0_0_3px_#FFEFA0,0_8px_24px_rgba(83,76,67,0.08)]">
                <span className="sr-only">Type instead</span>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type instead…"
                  className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-grey/70"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className={`grid size-10 place-items-center rounded-full transition-colors duration-200 ${
                    draft ? "bg-amber text-brown" : "bg-paper text-grey"
                  }`}
                >
                  <ArrowIcon />
                </button>
              </label>
            </form>
          </section>

          {/* Live preview: side panel on desktop, bottom drawer on mobile */}
          <section
            className={`fixed inset-x-0 bottom-0 z-40 flex h-[88dvh] flex-col rounded-t-[28px] bg-paper shadow-[0_-12px_40px_rgba(83,76,67,0.14)] transition-transform duration-500 ease-soft lg:static lg:z-auto lg:h-auto lg:min-h-0 lg:translate-y-0 lg:rounded-none lg:bg-[#FBF7EC] lg:p-6 lg:shadow-none ${
              drawer ? "translate-y-0" : "translate-y-full"
            }`}
            aria-label="Your page preview"
          >
            <div className="flex flex-none items-center justify-between px-5 pb-3 pt-3 lg:hidden">
              <span className="text-[15px] font-semibold">Your page</span>
              <button
                onClick={() => setDrawer(false)}
                className="btn btn-white h-9 px-4 text-[14px]"
              >
                Back to chat
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white shadow-soft lg:rounded-[20px]">
              <div className="flex flex-none items-center gap-3 px-4 py-3 shadow-[0_1px_0_#F1EADB]">
                <div className="hidden gap-1.5 sm:flex">
                  {[0, 1, 2].map((n) => (
                    <span key={n} className="size-2.5 rounded-full bg-line" />
                  ))}
                </div>
                <span className="mx-auto truncate rounded-full bg-paper px-4 py-1 text-[13px] text-grey">
                  dayone.page/meeras-home-bakes
                </span>
                <span className="chip hidden px-2.5 py-0.5 text-[12px] font-medium sm:inline-flex">
                  <span
                    className={`size-1.5 rounded-full ${
                      published ? "bg-[#25A244]" : "bg-amber"
                    }`}
                  />{" "}
                  {published ? "Online" : "Live preview"}
                </span>
              </div>
              <div
                ref={previewRef}
                className="relative min-h-0 flex-1 overflow-y-auto"
              >
                {!hasPage && (
                  <div className="absolute inset-0 grid place-items-center p-8 text-center">
                    <div>
                      <div className="mx-auto w-fit">
                        <Mic decorative size={72} label="" />
                      </div>
                      <p className="mt-5 text-[16px] text-grey">
                        Your page will appear here as we talk.
                      </p>
                    </div>
                  </div>
                )}
                <Site s={sec} warm={warm} short={short} editKey={editKey} />
              </div>
            </div>
          </section>

          {/* Mobile: pill to open preview */}
          {hasPage && !drawer && (
            <button
              key={pulse}
              onClick={() => setDrawer(true)}
              className="btn btn-white bubble fixed bottom-[104px] left-1/2 z-30 h-11 -translate-x-1/2 px-5 text-[15px] lg:hidden"
            >
              See your page ✨
            </button>
          )}
        </main>
      )}

      {toast && (
        <div
          role="status"
          className="toast fixed bottom-28 left-1/2 z-50 rounded-full bg-brown px-5 py-3 text-[15px] font-medium text-white shadow-soft lg:bottom-10 lg:left-[70%]"
        >
          {toast}
        </div>
      )}

      {celebrate && (
        <Celebration
          onClose={() => setCelebrate(false)}
          onOpen={onOpenSite}
          onHandoff={onHandoff}
        />
      )}
    </div>
  )
}
