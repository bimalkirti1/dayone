import type { ReactNode } from "react"
import {
  Arcs,
  CALL_NUMBER,
  IllCake,
  Mic,
  TypingDots,
  type MicState,
} from "./brand"

export function Phone({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative mx-auto w-[300px] rounded-[46px] bg-ink p-2.5 shadow-[0_30px_70px_rgba(43,38,33,0.22)] ${className}`}
    >
      <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-paper">
        <span
          className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden
        />
        {children}
      </div>
    </div>
  )
}

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

/** In-call screen for the DayOne phone line. */
export function CallView({
  status,
  seconds = 0,
  mic = "idle",
  children,
}: {
  status: "calling" | "live" | "ended"
  seconds?: number
  mic?: MicState
  children?: ReactNode
}) {
  return (
    <div className="flex h-full flex-col bg-ink px-5 pb-8 pt-14 text-white">
      <div className="text-center">
        <p className="text-[24px] font-medium tracking-[-0.02em]">DayOne</p>
        <p className="mt-1 font-mono text-[12px] tracking-wide text-white/55">
          {CALL_NUMBER}
        </p>
        <p className="mt-2 text-[14px] tabular-nums text-white/70">
          {status === "calling"
            ? "Calling…"
            : status === "ended"
              ? "Call ended"
              : mmss(seconds)}
        </p>
      </div>
      <div className="mt-8 grid place-items-center">
        <Mic
          decorative
          size={104}
          state={status === "calling" ? "thinking" : mic}
          label=""
        />
      </div>
      <div className="mt-6 flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden">
        {children}
      </div>
      <div className="mt-6 flex items-center justify-center gap-5">
        {[
          "M5 10v4M9 6v12M13 9v6M17 4v16",
          "M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6",
        ].map((d) => (
          <span
            key={d}
            className="grid size-12 place-items-center rounded-full bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={d} />
            </svg>
          </span>
        ))}
        <span
          className={`grid size-14 place-items-center rounded-full transition-colors duration-300 ${
            status === "ended" ? "bg-white/15" : "bg-[#E5484D]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6 rotate-[135deg]"
            fill="currentColor"
            aria-hidden
          >
            <path d="M5 4h3.5l1.6 4-2.1 1.3a11 11 0 0 0 6.7 6.7l1.3-2.1 4 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 3.4 5.7 1.6 1.6 0 0 1 5 4Z" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export function Caption({
  who,
  children,
}: {
  who: "dayone" | "you"
  children: ReactNode
}) {
  return (
    <div
      className={`bubble max-w-[90%] rounded-[14px] px-3 py-2 text-[14px] leading-snug ${
        who === "dayone"
          ? "mr-auto bg-white/10"
          : "ml-auto bg-amber/90 text-ink"
      }`}
    >
      {children}
    </div>
  )
}

/** Plain SMS thread from DayOne. */
export function MessagesView({
  children,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center gap-1 bg-white px-4 pb-3 pt-11 shadow-[0_1px_0_#ECE5D8]">
        <Arcs className="h-5 w-6" />
        <p className="text-[13px] font-medium">DayOne</p>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
        {children}
      </div>
      {footer}
    </div>
  )
}

export function In({ children }: { children: ReactNode }) {
  return (
    <div className="bubble mr-auto max-w-[85%] rounded-[18px] rounded-bl-[6px] bg-white px-3.5 py-2.5 text-[14px] shadow-[0_1px_2px_rgba(43,38,33,0.06)]">
      {children}
    </div>
  )
}

export function Out({ children }: { children: ReactNode }) {
  return (
    <div className="bubble ml-auto max-w-[82%] rounded-[18px] rounded-br-[6px] bg-cream px-3.5 py-2.5 text-[14px]">
      {children}
    </div>
  )
}

export function Typing() {
  return (
    <In>
      <TypingDots />
    </In>
  )
}

export function LinkPreview() {
  return (
    <div className="mt-2 overflow-hidden rounded-[12px] bg-paper">
      <div className="grid h-24 place-items-center bg-[#FCE6CC]">
        <IllCake className="h-16" />
      </div>
      <div className="px-3 py-2">
        <p className="text-[13px] font-medium">Meera's Home Bakes</p>
        <p className="text-[12px] text-grey">dayone.page/meeras-home-bakes</p>
      </div>
    </div>
  )
}
