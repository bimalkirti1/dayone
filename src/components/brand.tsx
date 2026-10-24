import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

/* ---------- hooks ---------- */
export function useInView<T extends Element>(threshold = 0.2, once = true) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])
  return [ref, inView] as const
}

export function useCountUp(target: number, ms = 1000) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

export const i = (n: number) => ({ "--i": n }) as CSSProperties

export function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2)
  return (
    <div
      id={id}
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ---------- brand ---------- */
export const ARC_D = "M10.6 7.49H0V5.3A5.3 5.3 0 0 1 10.6 5.3Z"

export function Logo({ className = "h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 11"
      className={className}
      role="img"
      aria-label="DayOne"
    >
      <path
        d="M42.9277 6.78984H43.5729C43.3044 7.83987 42.5186 8.45256 41.449 8.45256C40.0786 8.45256 39.1585 7.43934 39.1585 5.92818C39.1585 4.42567 40.0678 3.41895 41.4252 3.41895C42.7112 3.41895 43.5924 4.35422 43.5924 5.84591C43.5924 5.94333 43.5902 6.04292 43.5794 6.15767H39.8101C39.8838 7.20552 40.5138 7.86585 41.4642 7.86585C42.1743 7.86585 42.6701 7.49563 42.9277 6.78984ZM39.821 5.59477H42.9364C42.8541 4.58804 42.2804 4.00566 41.4274 4.00566C40.5332 4.00566 39.9292 4.61402 39.821 5.59477Z"
        fill="#534C43"
      />
      <path
        d="M35.2244 5.73333V8.32266H34.5792V3.54885H35.2244V4.96692C35.4604 4.01865 36.1532 3.41895 37.0733 3.41895C38.171 3.41895 38.8508 4.26979 38.8508 5.62508V8.32266H38.2056V5.62508C38.2056 4.58371 37.7141 4.00566 36.82 4.00566C35.8544 4.00566 35.2244 4.68114 35.2244 5.73333Z"
        fill="#534C43"
      />
      <path
        d="M28.4485 5.22673C28.4485 3.30638 29.6089 2.00089 31.3128 2.00089C33.0188 2.00089 34.1792 3.30854 34.1792 5.22673C34.1792 7.14492 33.0188 8.45257 31.3128 8.45257C29.6089 8.45257 28.4485 7.14492 28.4485 5.22673ZM29.1153 5.22673C29.1153 6.8245 29.964 7.83122 31.3128 7.83122C32.6616 7.83122 33.5124 6.8245 33.5124 5.22673C33.5124 3.62896 32.6616 2.62224 31.3128 2.62224C29.964 2.62224 29.1153 3.62896 29.1153 5.22673Z"
        fill="#534C43"
      />
      <path
        d="M27.6593 3.54886H28.3174L26.1892 8.74701C25.8082 9.69312 25.2453 10.0936 24.3273 10.0936C24.1931 10.0936 24.0589 10.085 23.9203 10.0677V9.49827C24.0762 9.51775 24.2061 9.52858 24.3252 9.52858C24.9184 9.52858 25.2626 9.30125 25.4943 8.7232L25.6177 8.41794L23.6605 3.54886H24.3338L25.9836 7.73813L27.6593 3.54886Z"
        fill="#534C43"
      />
      <path
        d="M19.4972 5.14012C19.4972 4.09443 20.3199 3.42111 21.608 3.42111C22.9893 3.42111 23.8207 4.19618 23.8207 5.49301V8.32266H23.1755V6.99119C22.9395 7.86152 22.0995 8.45256 21.0538 8.45256C20.0298 8.45256 19.3564 7.88967 19.3564 7.03666C19.3564 6.18148 20.0363 5.69652 21.2465 5.69652H23.1755V5.49301C23.1755 4.56856 22.5801 4.00783 21.5972 4.00783C20.6468 4.00783 20.1423 4.45598 20.1423 5.14012H19.4972ZM23.1755 6.24427H21.2422C20.4043 6.24427 19.993 6.49974 19.993 7.01934C19.993 7.56492 20.4433 7.88533 21.2162 7.88533C22.3052 7.88533 23.1755 7.25099 23.1755 6.4586V6.24427Z"
        fill="#534C43"
      />
      <path
        d="M14.0659 8.32267V2.13078H15.9884C17.9001 2.13078 19.1688 3.36483 19.1688 5.22673C19.1688 7.08646 17.9001 8.32267 15.9884 8.32267H14.0659ZM14.7197 7.70132H15.9906C17.5342 7.70132 18.502 6.74872 18.502 5.22673C18.502 3.70257 17.5342 2.75214 15.9906 2.75214H14.7197V7.70132Z"
        fill="#534C43"
      />
      <path opacity="0.32" d={ARC_D} fill="#FFAA00" />
      <path
        opacity="0.32"
        d={ARC_D}
        transform="translate(0 1.29)"
        fill="#FFAA00"
      />
      <path d={ARC_D} transform="translate(0 2.607)" fill="#FFAA00" />
    </svg>
  )
}

export function Arcs({
  className = "",
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 10.6 10.1"
      className={className}
      style={style}
      aria-hidden
    >
      <path d={ARC_D} fill="#FFAA00" opacity=".32" />
      <path
        d={ARC_D}
        transform="translate(0 1.29)"
        fill="#FFAA00"
        opacity=".32"
      />
      <path d={ARC_D} transform="translate(0 2.607)" fill="#FFAA00" />
    </svg>
  )
}

export type MicState = "idle" | "listening" | "speaking" | "thinking"

/** Placeholder DayOne call line (Vobiz). Swap for the real number in one place. */
export const CALL_NUMBER = "+91 80 4718 2290"
export const CALL_TEL = "tel:+918047182290"

export function Mic({
  state = "idle",
  size = 160,
  onClick,
  label,
  decorative = false,
}: {
  state?: MicState
  size?: number
  onClick?: () => void
  label: string
  decorative?: boolean
}) {
  const [presses, setPresses] = useState<number[]>([])
  const Tag = decorative ? "span" : "button"
  return (
    <Tag
      {...(decorative
        ? { "aria-hidden": true }
        : { type: "button" as const, "aria-label": label })}
      className="mic"
      data-state={state}
      style={{ width: size, height: size }}
      onClick={() => {
        if (decorative) return
        setPresses((p) => [...p, Date.now()])
        onClick?.()
      }}
    >
      <span className="ring" />
      <span className="ring ring-2" />
      {presses.map((k) => (
        <span
          key={k}
          className="press"
          onAnimationEnd={() => setPresses((p) => p.filter((x) => x !== k))}
        />
      ))}
      <svg className="loader" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#FFAA00"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="52 250"
        />
      </svg>
      <svg className="arcs" viewBox="-0.6 -1.6 11.8 12.4" aria-hidden>
        <g className="arc arc-b arc-b2">
          <path d={ARC_D} fill="#FFAA00" />
        </g>
        <g className="arc arc-b arc-b1">
          <path d={ARC_D} transform="translate(0 1.29)" fill="#FFAA00" />
        </g>
        <g className="arc arc-f">
          <path d={ARC_D} transform="translate(0 2.607)" fill="#FFAA00" />
        </g>
      </svg>
    </Tag>
  )
}

export function TypingDots() {
  return (
    <span className="dots" role="status" aria-label="DayOne is typing">
      {[0, 1, 2].map((n) => (
        <svg
          key={n}
          viewBox="0 0 10.6 7.5"
          style={{ animationDelay: `${n * 0.15}s` }}
          aria-hidden
        >
          <path d={ARC_D} fill="#FFAA00" />
        </svg>
      ))}
    </span>
  )
}

/* ---------- icons ---------- */
type IP = { className?: string }
export const WhatsAppIcon = ({ className = "size-5" }: IP) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 5 5 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.2Z" />
  </svg>
)
export const CheckIcon = ({ className = "size-4" }: IP) => (
  <svg
    viewBox="0 0 16 16"
    className={`check ${className}`}
    fill="none"
    aria-hidden
  >
    <path
      d="M3.5 8.5 6.5 11.5 12.5 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
export const CopyIcon = ({ className = "size-4" }: IP) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden
  >
    <rect x="5" y="5" width="8.5" height="8.5" rx="2.2" />
    <path d="M3 10.5V4.2C3 3.5 3.5 3 4.2 3h6.3" strokeLinecap="round" />
  </svg>
)
export const ArrowIcon = ({ className = "size-4" }: IP) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const
export const PhoneIcon = ({ className = "size-4" }: IP) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      {...line}
      d="M5 4h3.5l1.6 4-2.1 1.3a11 11 0 0 0 6.7 6.7l1.3-2.1 4 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 3.4 5.7 1.6 1.6 0 0 1 5 4Z"
    />
  </svg>
)
export const MailIcon = ({ className = "size-5" }: IP) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <rect {...line} x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path {...line} d="m4 7 8 6 8-6" />
  </svg>
)
export const CloseIcon = ({ className = "size-5" }: IP) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path {...line} d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const BackIcon = ({ className = "size-5" }: IP) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path {...line} d="M19 12H5m6-6-6 6 6 6" />
  </svg>
)
export const GoogleIcon = ({ className = "size-5" }: IP) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      fill="#4285F4"
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9Z"
    />
  </svg>
)

/* ---------- illustrations (flat, brand colours) ---------- */
export const IllShop = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="92" rx="48" ry="4" fill="#F1EADB" />
    <rect x="22" y="34" width="76" height="56" rx="6" fill="#fff" />
    <rect x="16" y="26" width="88" height="16" rx="8" fill="#FFAA00" />
    {[0, 1, 2, 3].map((n) => (
      <rect
        key={n}
        x={27 + n * 20}
        y="26"
        width="10"
        height="16"
        fill="#FFEFA0"
        opacity=".9"
      />
    ))}
    <rect x="28" y="52" width="22" height="18" rx="4" fill="#FFEFA0" />
    <rect x="70" y="52" width="22" height="18" rx="4" fill="#FFEFA0" />
    <rect
      x="52"
      y="56"
      width="16"
      height="34"
      rx="4"
      fill="#534C43"
      opacity=".85"
    />
    <circle cx="64" cy="74" r="1.4" fill="#FFEFA0" />
    <rect x="40" y="8" width="40" height="13" rx="6.5" fill="#fff" />
    <path d={ARC_D} transform="translate(54.7 10.2) scale(.8)" fill="#FFAA00" />
  </svg>
)
export const IllPhone = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="92" rx="40" ry="4" fill="#F1EADB" />
    <rect x="38" y="8" width="44" height="82" rx="10" fill="#534C43" />
    <rect x="42" y="14" width="36" height="70" rx="6" fill="#FFFCF4" />
    <rect x="47" y="24" width="22" height="9" rx="4.5" fill="#fff" />
    <rect x="52" y="38" width="22" height="9" rx="4.5" fill="#FFEFA0" />
    <rect x="47" y="52" width="18" height="9" rx="4.5" fill="#fff" />
    <path
      d="M90 36a14 14 0 0 1 0 22M96 30a22 22 0 0 1 0 34"
      fill="none"
      stroke="#FFAA00"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M30 40a10 10 0 0 0 0 14"
      fill="none"
      stroke="#FFAA00"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity=".45"
    />
  </svg>
)
export const IllPage = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="92" rx="48" ry="4" fill="#F1EADB" />
    <rect x="14" y="12" width="92" height="76" rx="10" fill="#fff" />
    <rect x="14" y="12" width="92" height="14" rx="7" fill="#FFEFA0" />
    <circle cx="23" cy="19" r="2" fill="#FFAA00" />
    <circle cx="30" cy="19" r="2" fill="#fff" />
    <circle cx="37" cy="19" r="2" fill="#fff" />
    <rect
      x="24"
      y="36"
      width="40"
      height="7"
      rx="3.5"
      fill="#534C43"
      opacity=".85"
    />
    <rect
      x="24"
      y="48"
      width="30"
      height="5"
      rx="2.5"
      fill="#73706B"
      opacity=".4"
    />
    <rect x="24" y="60" width="26" height="10" rx="5" fill="#FFAA00" />
    <rect x="70" y="34" width="26" height="38" rx="6" fill="#FFF6CC" />
    <g transform="translate(76 46) scale(1.4)">
      <path d={ARC_D} fill="#FFAA00" opacity=".4" />
      <path d={ARC_D} transform="translate(0 2.6)" fill="#FFAA00" />
    </g>
    <path d="M100 6l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFAA00" />
  </svg>
)
export const IllChai = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="58" cy="86" rx="36" ry="6" fill="#FFEFA0" />
    <path d="M32 42h52l-5 36a8 8 0 0 1-8 7H45a8 8 0 0 1-8-7z" fill="#fff" />
    <path d="M33 48h50" stroke="#F1EADB" strokeWidth="3" />
    <rect x="36" y="38" width="44" height="7" rx="3.5" fill="#FFAA00" />
    <path
      d="M84 50h4a9 9 0 0 1 0 18h-6"
      fill="none"
      stroke="#fff"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M48 30c-4-5 4-8 0-14M60 30c-4-5 4-8 0-14M72 30c-4-5 4-8 0-14"
      fill="none"
      stroke="#73706B"
      strokeOpacity=".35"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)
export const IllSunrise = ({ className = "" }: IP) => (
  <svg viewBox="0 0 160 110" className={className} aria-hidden>
    <ellipse cx="80" cy="100" rx="70" ry="5" fill="#F1EADB" />
    {[-60, -35, -12, 12, 35, 60].map((a) => (
      <rect
        key={a}
        x="78"
        y="4"
        width="4"
        height="12"
        rx="2"
        fill="#FFAA00"
        opacity=".45"
        transform={`rotate(${a} 80 84)`}
      />
    ))}
    <g transform="translate(40 28) scale(7.6)">
      <path d={ARC_D} fill="#FFAA00" opacity=".25" />
      <path
        d={ARC_D}
        transform="translate(0 1.29)"
        fill="#FFAA00"
        opacity=".4"
      />
      <path d={ARC_D} transform="translate(0 2.607)" fill="#FFAA00" />
    </g>
    <rect x="6" y="92" width="148" height="8" rx="4" fill="#FFFCF4" />
  </svg>
)
export const IllCake = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="91" rx="46" ry="5" fill="#000" opacity=".06" />
    <rect x="20" y="58" width="80" height="30" rx="9" fill="#FFAA00" />
    <path
      d="M20 66c5 0 5 8 10 8s5-8 10-8 5 8 10 8 5-8 10-8 5 8 10 8 5-8 10-8 5 8 10 8 5-8 10-8"
      fill="none"
      stroke="#FFEFA0"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <rect x="32" y="34" width="56" height="28" rx="8" fill="#FFEFA0" />
    <rect x="32" y="34" width="56" height="9" rx="4.5" fill="#fff" />
    <circle cx="44" cy="51" r="3" fill="#E0584A" opacity=".8" />
    <circle cx="60" cy="51" r="3" fill="#E0584A" opacity=".8" />
    <circle cx="76" cy="51" r="3" fill="#E0584A" opacity=".8" />
    <rect x="58" y="18" width="4" height="17" rx="2" fill="#fff" />
    <path d="M60 6c4 4 4.5 8.5 0 11-4.5-2.5-4-7 0-11z" fill="#FFAA00" />
  </svg>
)
export const IllCookies = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="80" rx="46" ry="10" fill="#fff" />
    {[
      [40, 62, 17],
      [78, 62, 17],
      [59, 46, 18],
    ].map(([x, y, r]) => (
      <g key={x}>
        <circle cx={x} cy={y} r={r} fill="#F2B54C" />
        <circle cx={x - 6} cy={y - 4} r="2.4" fill="#534C43" opacity=".8" />
        <circle cx={x + 5} cy={y - 6} r="2" fill="#534C43" opacity=".8" />
        <circle cx={x + 2} cy={y + 5} r="2.4" fill="#534C43" opacity=".8" />
      </g>
    ))}
  </svg>
)
export const IllBox = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <ellipse cx="60" cy="90" rx="40" ry="4" fill="#000" opacity=".06" />
    <rect x="28" y="44" width="64" height="44" rx="6" fill="#FFEFA0" />
    <rect x="24" y="34" width="72" height="14" rx="5" fill="#FFAA00" />
    <rect x="56" y="34" width="8" height="54" fill="#fff" opacity=".85" />
    <path
      d="M60 34c-8-14-22-8-14 0M60 34c8-14 22-8 14 0"
      fill="none"
      stroke="#fff"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
)
export const IllMap = ({ className = "" }: IP) => (
  <svg
    viewBox="0 0 200 130"
    className={className}
    preserveAspectRatio="xMidYMid slice"
    aria-hidden
  >
    <rect width="200" height="130" fill="#FFF4D6" />
    <path
      d="M-10 92C40 80 70 104 120 86s70-20 90-14"
      stroke="#fff"
      strokeWidth="10"
      fill="none"
    />
    <path
      d="M60-10c8 40-6 70 10 150"
      stroke="#fff"
      strokeWidth="8"
      fill="none"
    />
    <path
      d="M140-10c-6 30 10 60 0 150"
      stroke="#fff"
      strokeWidth="6"
      fill="none"
    />
    <rect x="14" y="16" width="34" height="26" rx="6" fill="#DDEBC8" />
    <rect x="152" y="98" width="38" height="24" rx="6" fill="#DDEBC8" />
    <circle cx="100" cy="56" r="20" fill="#FFAA00" opacity=".18" />
    <path
      d="M100 32a13 13 0 0 1 13 13c0 10-13 23-13 23S87 55 87 45a13 13 0 0 1 13-13z"
      fill="#FFAA00"
    />
    <circle cx="100" cy="45" r="4.5" fill="#fff" />
  </svg>
)
export const IllYoga = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <circle cx="60" cy="30" r="9" fill="#534C43" opacity=".85" />
    <path
      d="M60 40v22M40 52l20-6 20 6M42 80l18-18 18 18"
      stroke="#534C43"
      strokeOpacity=".85"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect x="24" y="82" width="72" height="6" rx="3" fill="#FFAA00" />
  </svg>
)
export const IllMaths = ({ className = "" }: IP) => (
  <svg viewBox="0 0 120 100" className={className} aria-hidden>
    <rect
      x="20"
      y="20"
      width="80"
      height="58"
      rx="8"
      fill="#534C43"
      opacity=".85"
    />
    <path
      d="M36 38h12M42 32v12M62 38h12M36 60l10-8M36 52l10 8M62 56h12M62 62h12"
      stroke="#FFEFA0"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <rect x="44" y="80" width="32" height="6" rx="3" fill="#FFAA00" />
  </svg>
)
