import { useEffect, useMemo, useState } from "react"
import {
  ARC_D,
  ArrowIcon,
  CALL_NUMBER,
  CALL_TEL,
  CheckIcon,
  CopyIcon,
  Logo,
  PhoneIcon,
  WhatsAppIcon,
} from "./brand"
import { CallView, Caption, In, MessagesView, Phone } from "./Phone"

const URL = "dayone.page/meeras-home-bakes"

export function CopyLink() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(`https://${URL}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <div className="flex items-center gap-2 rounded-full bg-paper p-1.5 pl-5">
      <span className="min-w-0 flex-1 truncate text-left text-[15px] font-medium">
        {URL}
      </span>
      <button
        onClick={copy}
        aria-live="polite"
        className={`btn h-10 w-[112px] flex-none text-[14px] transition-colors duration-300 ${
          copied ? "bg-cream" : "btn-white"
        }`}
      >
        {copied ? (
          <span key="y" className="morph flex items-center gap-1.5">
            Copied <CheckIcon className="size-3.5" />
          </span>
        ) : (
          <span key="n" className="morph flex items-center gap-1.5">
            <CopyIcon /> Copy
          </span>
        )}
      </button>
    </div>
  )
}

export function Celebration({
  onOpen,
  onHandoff,
  onClose,
}: {
  onOpen: () => void
  onHandoff: () => void
  onClose: () => void
}) {
  const [shared, setShared] = useState(false)
  const pieces = useMemo(
    () =>
      Array.from({ length: 64 }, (_, n) => ({
        x: Math.random() * 100,
        dur: 2.8 + Math.random() * 2.4,
        delay: 0.8 + Math.random() * 1.1,
        drift: (Math.random() - 0.5) * 180,
        rot: Math.random() * 720 - 360,
        c: ["#FFAA00", "#FFEFA0", "#FFFFFF", "#FFD36B"][n % 4],
        w: 6 + Math.random() * 6,
        round: Math.random() > 0.6,
      })),
    [],
  )
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    addEventListener("keydown", on)
    return () => removeEventListener("keydown", on)
  }, [onClose])
  return (
    <div
      className="screen fixed inset-0 z-50 overflow-hidden bg-paper/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Your page is online"
    >
      <div
        className="glow pointer-events-none absolute -bottom-[30%] left-1/2 h-[90vh] w-[160vw] -translate-x-1/2 opacity-0 [animation:screenIn_1s_ease_0.3s_forwards]"
        aria-hidden
      />
      <svg
        viewBox="0 0 10.6 10.1"
        className="pointer-events-none absolute -bottom-[6%] left-1/2 w-[min(980px,150vw)] -translate-x-1/2 overflow-visible"
        aria-hidden
      >
        <g className="rise" style={{ animationDelay: "0.3s" }}>
          <path d={ARC_D} fill="#FFAA00" opacity=".18" />
        </g>
        <g className="rise" style={{ animationDelay: "0.15s" }}>
          <path
            d={ARC_D}
            transform="translate(0 1.29)"
            fill="#FFAA00"
            opacity=".26"
          />
        </g>
        <g className="rise">
          <path
            d={ARC_D}
            transform="translate(0 2.607)"
            fill="#FFAA00"
            opacity=".5"
          />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {pieces.map((p, n) => (
          <span
            key={n}
            className="confetti"
            style={{
              left: `${p.x}%`,
              width: p.w,
              height: p.round ? p.w : p.w * 0.45,
              borderRadius: p.round ? 999 : 2,
              background: p.c,
              boxShadow:
                p.c === "#FFFFFF" ? "0 1px 3px rgba(83,76,67,.15)" : undefined,
              ["--dur" as string]: `${p.dur}s`,
              ["--delay" as string]: `${p.delay}s`,
              ["--drift" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rot}deg`,
            }}
          />
        ))}
      </div>
      <div className="relative grid h-full place-items-center overflow-y-auto p-5">
        <div
          className="card card-in w-full max-w-[460px] p-7 text-center md:p-9"
          style={{ animationDelay: "0.9s" }}
        >
          <h2 className="text-[26px]">
            Congratulations, Meera! Your business is online 🎉
          </h2>
          <p className="mt-3 text-[16px] text-grey">
            Here’s your link. It works on every phone, so share it anywhere.
          </p>
          <div className="mt-6">
            <CopyLink />
          </div>
          <div className="mt-6 grid gap-3">
            <button
              onClick={onOpen}
              className="btn btn-amber h-13 px-6 text-[16px]"
            >
              Open my page <ArrowIcon />
            </button>
            <button
              onClick={() => setShared(true)}
              className="btn btn-white h-13 px-6 text-[16px]"
            >
              <WhatsAppIcon className="size-5 text-[#25A244]" />{" "}
              {shared ? "Ready to send to your customers" : "Share on WhatsApp"}
            </button>
            <button
              onClick={onHandoff}
              className="btn btn-white h-13 px-6 text-[16px]"
            >
              <PhoneIcon className="size-5" /> Make changes by phone call
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-5 text-[14px] text-grey underline-offset-4 hover:underline"
          >
            Back to my page
          </button>
        </div>
      </div>
    </div>
  )
}

const MEERA_PHONE = "+91 98450 12345"

export function Handoff({
  onSite,
  onHome,
}: {
  onSite: () => void
  onHome: () => void
}) {
  // 0 SMS arrives · 1 ringing · 2 recognised · 3 request · 4 working · 5 done
  const [stage, setStage] = useState(0)
  const [secs, setSecs] = useState(0)
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)
  const onCall = stage >= 2
  useEffect(() => {
    const t = [1900, 3400, 5600, 7300, 8600].map((ms, n) =>
      setTimeout(() => setStage(n + 1), ms),
    )
    return () => t.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    if (!onCall) return
    const iv = setInterval(() => setSecs((x) => x + 1), 1000)
    return () => clearInterval(iv)
  }, [onCall])
  return (
    <div className="screen min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-5">
        <button onClick={onHome} aria-label="DayOne home">
          <Logo className="h-7" />
        </button>
      </header>
      <main className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
        <div
          className="glow pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] max-w-full -translate-y-1/2"
          aria-hidden
        />
        <div className="relative">
          <p className="eyebrow">Keep editing</p>
          <h1 className="display mt-4 text-[40px] md:text-[60px]">
            Want a change? Just give us a call.
          </h1>
          <p className="mt-5 max-w-lg text-[18px] text-grey">
            Save DayOne’s number. When you call from{" "}
            <span className="font-medium text-ink">{MEERA_PHONE}</span>, we’ll
            know it’s you, so only you can change your page.
          </p>
          <div className="hair mt-8 flex max-w-md flex-col gap-4 rounded-[20px] bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="grid size-11 flex-none place-items-center rounded-full bg-cream text-ink">
                <PhoneIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] text-grey">DayOne phone line</p>
                <p className="text-[24px] font-medium tabular-nums tracking-[-0.02em] text-ink">
                  {CALL_NUMBER}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={CALL_TEL} className="btn btn-amber h-11 text-[15px]">
                <PhoneIcon /> Call now
              </a>
              <button
                onClick={() => setSaved(true)}
                aria-live="polite"
                className={`btn h-11 text-[15px] ${
                  saved ? "bg-cream text-ink" : "btn-white"
                }`}
              >
                {saved ? (
                  <span key="y" className="morph flex items-center gap-1.5">
                    <CheckIcon className="size-3.5" /> Saved
                  </span>
                ) : (
                  <span key="n" className="morph">
                    Save contact
                  </span>
                )}
              </button>
            </div>
          </div>
          <ul className="mt-7 space-y-2.5 text-[16px]">
            {[
              "“Add my Diwali offer”",
              "“Change my phone number”",
              "“Make the photos bigger”",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckIcon className="size-4 text-amber" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={onSite}
              className="btn btn-dark h-12 px-6 text-[16px]"
            >
              See my live page <ArrowIcon />
            </button>
            <button
              onClick={() => {
                navigator.clipboard
                  ?.writeText("https://dayone.page/meeras-home-bakes")
                  .catch(() => {})
                setShared(true)
              }}
              className="btn btn-white h-12 px-5 text-[16px]"
            >
              <WhatsAppIcon className="size-5 text-[#25A244]" />{" "}
              {shared ? "Link copied for WhatsApp" : "Share with customers"}
            </button>
          </div>
          <p className="mt-6 text-[13px] text-grey/80">
            Calls powered by Vobiz · Demo number
          </p>
        </div>
        <div className="relative">
          <Phone>
            {stage === 0 ? (
              <MessagesView>
                <In>
                  Your page is online. Save this number and call anytime you’d
                  like a change: {CALL_NUMBER}
                </In>
              </MessagesView>
            ) : (
              <CallView
                status={stage === 1 ? "calling" : "live"}
                seconds={secs}
                mic={
                  stage === 3
                    ? "listening"
                    : stage === 4
                      ? "thinking"
                      : "speaking"
                }
              >
                {stage >= 2 && (
                  <Caption who="dayone">
                    Hi Meera, welcome back! I can see it’s you. What would you
                    like to change?
                  </Caption>
                )}
                {stage >= 3 && (
                  <Caption who="you">
                    Please add my Diwali offer. 10% off all cakes.
                  </Caption>
                )}
                {stage >= 5 && (
                  <Caption who="dayone">
                    Done! Your Diwali offer is on your page now. Anything else?
                  </Caption>
                )}
              </CallView>
            )}
          </Phone>
        </div>
      </main>
    </div>
  )
}
