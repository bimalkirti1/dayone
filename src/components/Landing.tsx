import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type SVGProps,
} from "react"
import {
  Arcs,
  ArrowIcon,
  CALL_NUMBER,
  CALL_TEL,
  CheckIcon,
  CopyIcon,
  IllCake,
  Logo,
  Mic,
  PhoneIcon,
  Reveal,
  useInView,
} from "./brand"
import {
  CallView,
  Caption,
  In,
  MessagesView,
  Phone,
} from "./Phone"
import { Pricing } from "./Pricing"
import { PHOTOS, photo, type PhotoKey } from "./photos"

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)
    return { pre: "☀️", text: "Good morning, early riser", post: "" }
  if (h >= 12 && h < 17) return { pre: "", text: "Good afternoon", post: "👋" }
  return { pre: "🌙", text: "Good evening, night owl", post: "" }
}

function GreetingChip() {
  const [g] = useState(getGreeting)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= g.text.length) return
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 350 : 42)
    return () => clearTimeout(t)
  }, [n, g.text.length])
  const done = n >= g.text.length
  return (
    <p
      className="hair inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-medium"
      aria-label={`${g.pre} ${g.text} ${g.post}`}
    >
      {g.pre && <span className={done ? "wave" : ""}>{g.pre}</span>}
      <span aria-hidden>
        {g.text.slice(0, n)}
        {!done && <span className="caret !h-[0.9em]" />}
      </span>
      {g.post && (
        <span
          className={`transition-opacity duration-300 ${
            done ? "wave opacity-100" : "opacity-0"
          }`}
        >
          {g.post}
        </span>
      )}
    </p>
  )
}

function Headline({ lines, className }: { lines: string[]; className: string }) {
  let k = 0
  return (
    <h1 className={className} aria-label={lines.join(" ")}>
      {lines.map((l, li) => (
        <span key={li} className="block" aria-hidden>
          {l.split(" ").map((w) => {
            const n = k++
            return (
              <span key={n}>
                <span
                  className="word"
                  style={{ animationDelay: `${250 + n * 40}ms` }}
                >
                  {w}
                </span>{" "}
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

function SectionHead({
  title,
  sub,
  align = "center",
}: {
  title: string
  sub?: string
  align?: "center" | "left"
}) {
  return (
    <Reveal
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      <h2 className="display text-balance text-[40px] md:text-[56px]">{title}</h2>
      {sub && <p className="mt-4 text-[18px] text-grey">{sub}</p>}
    </Reveal>
  )
}

const jump = (id: string) => (e: MouseEvent) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView()
}

/* ---------- Hero: chat-style prompt ---------- */
const HINTS = [
  "I bake custom cakes from home…",
  "I teach yoga in the park…",
  "I run a small tailoring shop…",
  "I sell fresh flowers at the market…",
]
const IDEAS: [string, string][] = [
  ["Home baker", "I bake custom cakes and cookies from home"],
  ["Tutor", "I teach maths to school kids after school"],
  ["Tailor", "I run a small tailoring shop"],
  ["Mehendi artist", "I do bridal mehendi at home and at venues"],
]

function HeroChat({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("")
  const [hint, setHint] = useState(0)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (text) return
    const t = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 3200)
    return () => clearInterval(t)
  }, [text])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (t) onSend(t)
    else ref.current?.focus()
  }
  return (
    <div className="w-full max-w-[560px]">
      <form onSubmit={submit} className="chatbar">
        <label htmlFor="hero-chat" className="sr-only">
          Tell us about your business
        </label>
        <input
          id="hero-chat"
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={HINTS[hint]}
          autoComplete="off"
          enterKeyHint="send"
          className="chatbar-input"
        />
        <button
          type="submit"
          aria-label="Send and start"
          disabled={!text.trim()}
          className="btn btn-amber chatbar-send"
        >
          <ArrowIcon />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[13px] text-grey">Try</span>
        {IDEAS.map(([label, line]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setText(line)
              ref.current?.focus()
            }}
            className="hair h-8 rounded-full bg-white/70 px-3 text-[13px] text-brown transition-colors duration-200 hover:bg-[#FFF8DB]"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Who it's for: photo strip + plain facts ---------- */
const PEOPLE: [PhotoKey, string][] = [
  ["tailor", "Tailors"],
  ["henna", "Mehendi artists"],
  ["flowers", "Flower sellers"],
  ["yoga", "Yoga teachers"],
  ["shoes", "Shoe shops"],
  ["cake", "Home bakers"],
  ["shop", "Handicraft stores"],
  ["tutor", "Tuition classes"],
]

function People() {
  return (
    <section aria-labelledby="people-title" className="overflow-hidden pb-24 md:pb-32">
      <Reveal className="mx-auto max-w-3xl px-5 text-center">
        <p className="eyebrow">Who it’s for</p>
        <h2 id="people-title" className="display mt-4 text-[36px] md:text-[52px]">
          For the people who keep every neighbourhood going.
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[18px] text-grey">
          You’re great at what you do. DayOne gives you a proper home online, so
          the next customer can find you, trust you and reach you.
        </p>
      </Reveal>
      <div className="mt-12 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="marquee flex w-max gap-4">
          {[...PEOPLE, ...PEOPLE].map(([p, label], n) => {
            const copy = n >= PEOPLE.length
            return (
              <li
                key={n}
                aria-hidden={copy || undefined}
                className="relative h-[300px] w-[230px] flex-none overflow-hidden rounded-[22px] bg-line md:h-[380px] md:w-[290px]"
              >
                <img
                  src={photo(PHOTOS[p].id, 600)}
                  alt={copy ? "" : PHOTOS[p].alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-medium text-ink backdrop-blur">
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <Reveal className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-y-8 px-5 md:grid-cols-4">
        {[
          ["2 min", "to make your page, just by talking"],
          ["₹0", "to try it, pay only when you go online"],
          ["4", "languages you can talk to us in"],
          ["6 answers", "to publish a real website"],
        ].map(([big, small]) => (
          <div key={big} className="px-4 text-center md:border-l md:border-line md:first:border-l-0">
            <p className="text-[40px] font-medium tabular-nums tracking-[-0.04em] text-ink md:text-[48px]">
              {big}
            </p>
            <p className="mx-auto mt-1 max-w-[20ch] text-[15px] text-grey">{small}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/* ---------- Features: what you get ---------- */
type Ico = (p: SVGProps<SVGSVGElement>) => ReactNode
const icon =
  (d: string): Ico =>
  (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      <path d={d} />
    </svg>
  )
const FEATURES: { I: Ico; t: string; b: string }[] = [
  {
    I: icon("M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM4 9h16M9.5 9v11"),
    t: "A page that looks professional",
    b: "Your words, photos, prices and timings, laid out beautifully. Looks lovely on every phone.",
  },
  {
    I: icon("M5 4h3.5l1.8 4.4-2.3 1.4a11 11 0 0 0 6.2 6.2l1.4-2.3L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"),
    t: "Customers reach you in one tap",
    b: "Big Call and WhatsApp order buttons, so someone looking turns into someone buying.",
  },
  {
    I: icon("M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"),
    t: "Your own link",
    b: "Start with dayone.page/your-name, or use your own name like meerasbakes.in.",
  },
  {
    I: icon("M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21ZM12 12.3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"),
    t: "Easy to find nearby",
    b: "We help you show up on Google Maps, so people around you can find you.",
  },
  {
    I: icon("M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4V5.5ZM8.5 9h7M8.5 12h4"),
    t: "Talk in your language",
    b: "Hindi, English, Kannada or Tamil. Mix them if you like. Your page can be in more than one.",
  },
  {
    I: icon("M12 3.5 19 6.5v5.2c0 4.3-2.9 7.5-7 8.8-4.1-1.3-7-4.5-7-8.8V6.5l7-3ZM9 12l2 2 4-4"),
    t: "Looked after, always",
    b: "Start a new website conversation when you need a separate site. Phone support availability is not confirmed.",
  },
]

function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-5 py-24 md:py-32">
      <SectionHead
        title="Everything you need to be found"
        sub="Not just a page. DayOne gives you the whole kit to bring in customers, and keeps it running for you."
      />
      <Reveal className="mx-auto mt-14 grid max-w-6xl gap-px overflow-hidden rounded-[28px] bg-line shadow-[inset_0_0_0_1px_#ECE5D8] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ I, t, b }) => (
          <div key={t} className="bg-white p-7 md:p-9">
            <span className="grid size-11 place-items-center rounded-[14px] bg-cream text-ink">
              <I className="size-[22px]" />
            </span>
            <h3 className="mt-6 text-[20px] tracking-[-0.02em]">{t}</h3>
            <p className="mt-2 text-[16px] text-grey">{b}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/* ---------- Why it matters: photo + outcomes ---------- */
function WhyOnline({ onStart }: { onStart: () => void }) {
  return (
    <section className="bg-[#F5F1E9] px-5 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-16">
        <Reveal className="relative pb-8 md:pb-0">
          <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-line md:aspect-[5/6]">
            <img
              src={photo(PHOTOS.sana.id, 1000)}
              alt={PHOTOS.sana.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[50%_30%]"
            />
          </div>
          <div className="absolute -bottom-2 right-3 w-[250px] rounded-[20px] bg-white p-4 shadow-[0_24px_50px_-18px_rgba(43,38,33,0.35)] md:-right-8 md:bottom-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-grey">dayone.page/sana-stores</span>
              <span className="chip px-2 py-0.5 text-[11px]">Example</span>
            </div>
            <p className="mt-3 text-[18px] font-medium tracking-[-0.02em] text-ink">Sana General Store</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-grey">
              <span className="size-1.5 rounded-full bg-amber" aria-hidden /> Open now · until 9 pm
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
              <span className="rounded-[10px] bg-ink py-2 text-center text-white">Call</span>
              <span className="hair rounded-[10px] py-2 text-center text-ink">Directions</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow">Why it matters</p>
          <h2 className="display mt-4 text-[40px] md:text-[52px]">
            When people can find you, they come to you.
          </h2>
          <p className="mt-5 max-w-[48ch] text-[18px] text-grey">
            More and more people look up a business on their phone before they
            visit or order. A simple page lets them see what you offer, when
            you’re open and how to reach you, right away.
          </p>
          <ul className="mt-9 space-y-6">
            {[
              ["Look trusted", "A proper page tells new customers you’re the real deal."],
              ["Win more orders", "Share one link on your WhatsApp status, Instagram and visiting cards."],
              ["Get your time back", "Fewer “Are you open?” and “What’s the price?” calls all day."],
            ].map(([t, b], n) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-8 flex-none place-items-center rounded-full bg-cream font-mono text-[12px] text-brown">
                  {n + 1}
                </span>
                <span>
                  <span className="block text-[18px] font-medium text-ink">{t}</span>
                  <span className="mt-0.5 block text-[16px] text-grey">{b}</span>
                </span>
              </li>
            ))}
          </ul>
          <button onClick={onStart} className="btn btn-amber mt-10 h-12 px-6 text-[16px]">
            Make yours now <ArrowIcon />
          </button>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- How it works: bento ---------- */
function Bento({
  tone,
  eyebrow,
  title,
  body,
  children,
}: {
  tone: string
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex h-full min-h-[400px] flex-col overflow-hidden rounded-[24px] p-7 md:p-9 ${tone}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-3 max-w-[16ch] text-[30px] tracking-[-0.03em]">
        {title}
      </h3>
      <p className="mt-3 max-w-[38ch] text-[16px] text-grey">{body}</p>
      <div className="mt-8 flex flex-1 items-end">{children}</div>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 px-5 py-24 md:py-32">
      <SectionHead
        title="How it works"
        sub="Three small steps. Most people are done before their chai gets cold."
      />
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal>
          <Bento
            tone="bg-[#FFF3C4]"
            eyebrow="01 · Talk"
            title="Tell us about your business"
            body="Talk like you would to a friend. What you make, and who it’s for."
          >
            <div className="w-full max-w-[360px] space-y-2.5">
              <div className="flex items-end gap-2">
                <Arcs className="mb-2 h-3.5 w-4 flex-none" />
                <p className="rounded-[16px] rounded-bl-[6px] bg-white px-4 py-2.5 text-[15px]">
                  Who usually orders from you?
                </p>
              </div>
              <p className="ml-auto w-fit rounded-[16px] rounded-br-[6px] bg-amber px-4 py-2.5 text-[15px] text-ink">
                Mostly families, for birthdays.
              </p>
              <div className="flex items-end gap-2">
                <Arcs className="mb-2 h-3.5 w-4 flex-none" />
                <p className="rounded-[16px] rounded-bl-[6px] bg-white px-4 py-2.5 text-[15px]">
                  Lovely. I’ll add that to your page.
                </p>
              </div>
            </div>
          </Bento>
        </Reveal>
        <Reveal delay={100}>
          <Bento
            tone="bg-white hair"
            eyebrow="02 · Watch"
            title="See your page come to life"
            body="It builds itself while you talk. Words, pictures, prices, the lot."
          >
            <div className="hair w-full overflow-hidden rounded-[16px] bg-paper">
              <div className="flex items-center gap-1.5 px-3 py-2.5">
                {[0, 1, 2].map((n) => (
                  <span key={n} className="size-2 rounded-full bg-line" />
                ))}
              </div>
              <div className="grid grid-cols-[1.2fr_1fr] items-center gap-4 bg-[#FFF5E9] p-5">
                <div>
                  <p className="font-serif text-[24px] leading-[1.05] text-[#5A3B28]">
                    Homemade cakes, made with love
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-[#C96F2D] px-3 py-1 text-[12px] font-medium text-white">
                    Order on WhatsApp
                  </span>
                </div>
                <IllCake className="h-20" />
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="skel h-12" />
                <div className="skel h-12" />
                <div className="skel h-12" />
              </div>
            </div>
          </Bento>
        </Reveal>
        <Reveal>
          <Bento
            tone="bg-[#FFE7B8]"
            eyebrow="03 · Share"
            title="Share it with your customers"
            body="Get your own link. Send it on WhatsApp, Instagram or anywhere you like."
          >
            <div className="w-full max-w-[380px]">
              <div className="flex items-center gap-2 rounded-[14px] bg-white p-1.5 pl-4">
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                  dayone.page/meeras-home-bakes
                </span>
                <span className="hair flex h-9 items-center gap-1.5 rounded-[10px] bg-white px-3 text-[13px]">
                  <CopyIcon className="size-3.5" /> Copy
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {["WhatsApp", "Instagram", "SMS"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/70 px-3.5 py-1.5 text-[13px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Bento>
        </Reveal>
        <Reveal delay={100}>
          <Bento
            tone="bg-white hair"
            eyebrow="Anytime"
            title="Make another website when you need one"
            body="The builder creates a site from six answers. After publishing, start a new conversation to make another site."
          >
            <div className="w-full max-w-[380px] space-y-3">
              <p className="ml-auto w-fit rounded-[16px] rounded-br-[6px] bg-amber px-4 py-2.5 text-[15px] text-ink">
                Start a new website
              </p>
              <div className="rounded-[16px] bg-[#FFF5E9] p-4">
                <p className="text-[14px] text-grey/70 line-through">
                  Your first business website
                </p>
                <p className="mt-1 font-serif text-[24px] leading-tight text-[#5A3B28]">
                  A fresh conversation, a new website
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-[13px] text-grey">
                <CheckIcon className="size-3.5 text-amber" /> New website flow
              </p>
            </div>
          </Bento>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Examples: template grid ---------- */
const EXAMPLES: {
  cat: string
  name: string
  place: string
  p: PhotoKey
  bg: string
  ink: string
  title: string
  cta: string
  url: string
  serif?: boolean
}[] = [
  {
    cat: "Food",
    name: "Meera’s Home Bakes",
    place: "Indiranagar",
    p: "cake",
    bg: "#FCE6CC",
    ink: "#5A3B28",
    title: "Homemade cakes, made with love.",
    cta: "Order on WhatsApp",
    url: "meeras-home-bakes",
    serif: true,
  },
  {
    cat: "Wellness",
    name: "Breathe with Ananya",
    place: "Jayanagar",
    p: "yoga",
    bg: "#E7EEDF",
    ink: "#3F5232",
    title: "Slow mornings. Strong backs.",
    cta: "Book a class",
    url: "breathe-with-ananya",
  },
  {
    cat: "Classes",
    name: "Maths with Priya Ma’am",
    place: "Whitefield",
    p: "tutor",
    bg: "#E4ECF1",
    ink: "#23425A",
    title: "Maths, minus the fear.",
    cta: "Book a free class",
    url: "maths-with-priya",
  },
  {
    cat: "Beauty",
    name: "Kavya Mehendi Studio",
    place: "Malleshwaram",
    p: "henna",
    bg: "#FFE7B8",
    ink: "#2B2621",
    title: "Bridal mehendi, done with love.",
    cta: "Check dates",
    url: "kavya-mehendi",
    serif: true,
  },
  {
    cat: "Shops",
    name: "Ramesh Tailors",
    place: "Shivajinagar",
    p: "tailor",
    bg: "#ECE6F2",
    ink: "#43335A",
    title: "The perfect fit, every time.",
    cta: "Call to book",
    url: "ramesh-tailors",
  },
  {
    cat: "Shops",
    name: "Imran Footwear",
    place: "Commercial Street",
    p: "shoes",
    bg: "#F3E3DA",
    ink: "#5B2E1E",
    title: "Good shoes for the whole family.",
    cta: "Get directions",
    url: "imran-footwear",
  },
]

function ExampleCard({ e }: { e: typeof EXAMPLES[number] }) {
  return (
    <div className="group bubble">
      <div className="hair overflow-hidden rounded-[22px] bg-white transition-[transform,box-shadow] duration-300 ease-soft group-hover:-translate-y-1 group-hover:shadow-[0_22px_44px_-18px_rgba(43,38,33,0.28)]">
        <div className="aspect-[4/3] overflow-hidden bg-line">
          <img
            src={photo(PHOTOS[e.p].id, 720)}
            alt={PHOTOS[e.p].alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
          />
        </div>
        <div className="p-5" style={{ background: e.bg, color: e.ink }}>
          <p className="truncate font-mono text-[11px] opacity-70">
            dayone.page/{e.url}
          </p>
          <p
            className={`mt-2 ${
              e.serif
                ? "font-serif text-[28px] leading-[1.05]"
                : "text-[24px] font-medium leading-[1.1] tracking-[-0.03em]"
            }`}
          >
            {e.title}
          </p>
          <span
            className="mt-4 inline-block rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: e.ink, color: e.bg }}
          >
            {e.cta}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[15px] font-medium text-ink">{e.name}</p>
      <p className="text-[14px] text-grey">
        {e.cat} · {e.place}
      </p>
    </div>
  )
}

function Examples() {
  const [cat, setCat] = useState("All")
  const cats = ["All", "Food", "Classes", "Wellness", "Beauty", "Shops"]
  const list = EXAMPLES.filter((e) => cat === "All" || e.cat === cat)
  return (
    <section
      id="examples"
      className="scroll-mt-20 bg-[#F5F1E9] px-5 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="display text-[40px] md:text-[56px]">
              See what yours could look like
            </h2>
            <p className="mt-4 text-[18px] text-grey">
              A few example pages. Each one takes a single short conversation.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter examples"
          >
            {cats.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`h-9 rounded-full px-4 text-[14px] transition-colors duration-200 ${
                  cat === c
                    ? "bg-ink text-white"
                    : "hair bg-white text-brown hover:bg-[#FFF8DB]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <ExampleCard key={`${cat}-${e.name}`} e={e} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Call section (Vobiz line) ---------- */
function CallDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3, false)
  const [step, setStep] = useState(0)
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!inView) return
    const seq = [1500, 2000, 2300, 2600, 1400, 3600]
    const t = setTimeout(() => setStep((s) => (s + 1) % seq.length), seq[step])
    return () => clearTimeout(t)
  }, [inView, step])
  useEffect(() => {
    if (step === 0) setSecs(0)
    if (step < 1 || step > 3) return
    const iv = setInterval(() => setSecs((x) => x + 1), 1000)
    return () => clearInterval(iv)
  }, [step])
  return (
    <section id="call" className="scroll-mt-20 px-5 py-24 md:py-32">
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[1.1fr_1fr]"
      >
        <Reveal>
          <p className="eyebrow">No app needed</p>
          <h2 className="display mt-4 text-[40px] md:text-[56px]">
            Rather talk on the phone? Just call.
          </h2>
          <p className="mt-5 max-w-lg text-[18px] text-grey">
            A phone contact number is configured below, but phone service
            availability has not been confirmed. You can start your website
            anonymously in the builder above.
          </p>
          <div className="hair mt-8 inline-flex flex-col gap-4 rounded-[20px] bg-white p-5 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <p className="text-[13px] text-grey">Configured contact number</p>
              <p className="mt-0.5 text-[26px] font-medium tabular-nums tracking-[-0.02em] text-ink">
                {CALL_NUMBER}
              </p>
            </div>
            <a href={CALL_TEL} className="btn btn-amber h-11 px-5 text-[15px]">
              <PhoneIcon /> Dial number
            </a>
          </div>
          <ul className="mt-8 space-y-3 text-[16px]">
            {[
              "Phone service availability is not confirmed",
              "No account or sign-in is required to use the website builder",
              "Start here in the browser to create your website",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckIcon className="size-4 text-amber" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] text-grey/80">
            Contact number: {CALL_NUMBER}. Service activation is not confirmed.
          </p>
        </Reveal>
        <Reveal delay={150} className="relative">
          <p className="mb-3 text-center text-[12px] text-grey md:text-left">
            Illustrative phone example only; service availability is not confirmed.
          </p>
          <img
            src={photo(PHOTOS.call.id, 800)}
            alt={PHOTOS.call.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-y-12 right-0 hidden w-[58%] rounded-[28px] object-cover object-[50%_35%] md:block"
          />
          <Phone className="relative md:ml-0">
            {step <= 3 ? (
              <CallView
                status={step === 0 ? "calling" : "live"}
                seconds={secs}
                mic={step === 2 ? "listening" : "speaking"}
              >
                {step >= 1 && (
                  <Caption who="dayone">Illustrative example: what does your business do?</Caption>
                )}
                {step >= 2 && (
                  <Caption who="you">I bake custom cakes from home.</Caption>
                )}
                {step >= 3 && (
                  <Caption who="dayone">A real builder conversation uses six answers to publish your site.</Caption>
                )}
              </CallView>
            ) : (
              <MessagesView>
                <In>This is an illustrative phone flow. Phone availability is not confirmed.</In>
                {step >= 5 && (
                  <In>For a new website, use the anonymous browser builder.</In>
                )}
              </MessagesView>
            )}
          </Phone>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left text-[18px] font-medium text-ink"
      >
        {q}
        <span
          className={`grid size-8 flex-none place-items-center rounded-full text-[22px] font-light text-grey transition-transform duration-300 ease-soft ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-400 ease-soft ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[60ch] pb-6 text-[17px] text-grey">{a}</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
const FOOTER: [string, [string, string][]][] = [
  [
    "Product",
    [
      ["How it works", "#how"],
      ["Features", "#features"],
      ["Examples", "#examples"],
      ["Pricing", "#pricing"],
    ],
  ],
  [
    "Help",
    [
      ["FAQ", "#faq"],
      ["Configured number (availability unconfirmed)", CALL_TEL],
      ["Phone line", "#call"],
    ],
  ],
  [
    "Company",
    [
      ["About", "#how"],
      ["Terms", "#faq"],
      ["Privacy", "#faq"],
    ],
  ],
]

export function Landing({
  onStart,
  onLogin,
  user,
}: {
  onStart: (text?: string) => void
  onLogin: () => void
  user: string | null
}) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8)
    addEventListener("scroll", on, { passive: true })
    return () => removeEventListener("scroll", on)
  }, [])
  const go = () => onStart()
  const startFromMic = () => setTimeout(go, 320)
  const links: [string, string][] = [
    ["how", "How it works"],
    ["features", "Features"],
    ["examples", "Examples"],
    ["pricing", "Pricing"],
    ["faq", "FAQ"],
  ]
  return (
    <div className="screen">
      <header
        className={`sticky top-0 z-30 transition-[background-color,box-shadow] duration-300 ${
          scrolled ? "bg-paper/85 shadow-[0_1px_0_#ECE5D8] backdrop-blur" : ""
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-5">
          <a href="#/" aria-label="DayOne home" className="flex-none">
            <Logo className="h-7" />
          </a>
          <div className="hidden items-center gap-7 text-[15px] text-brown md:flex">
            {links.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={jump(id)}
                className="transition-colors hover:text-ink"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <span className="hidden items-center gap-2 pr-2 text-[15px] sm:flex">
                <span className="grid size-8 place-items-center rounded-full bg-cream text-[14px] font-medium">
                  {user[0]}
                </span>
                {user}
              </span>
            ) : (
              <button
                onClick={onLogin}
                className="btn btn-white h-10 px-4 text-[15px]"
              >
                Open builder
              </button>
            )}
            <button
              onClick={go}
              className="btn btn-amber h-10 px-4 text-[15px]"
            >
              Start talking
            </button>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden px-5 pb-24 pt-14 md:pb-32 md:pt-24">
        <div
          className="glow pointer-events-none absolute left-1/2 top-[58%] h-[560px] w-[960px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <GreetingChip />
          <Headline
            lines={["Your first website,", "made by just talking."]}
            className="display mt-7 text-[46px] sm:text-[64px] md:text-[84px]"
          />
          <p
            className="word mt-6 max-w-[52ch] text-[18px] text-grey"
            style={{ animationDelay: "520ms" }}
          >
            Tell us about your business like you’d tell a friend. We’ll turn it
            into a beautiful page you can share today.
          </p>
          <div
            className="word mt-10 flex flex-col items-center"
            style={{ animationDelay: "680ms" }}
          >
            <Mic
              size={136}
              onClick={startFromMic}
              label="Tap and tell us what you do"
            />
            <p className="mt-4 text-[16px] font-medium text-ink">
              Tap and tell us what you do
            </p>
          </div>
          <div
            className="word mt-7 flex w-full flex-col items-center"
            style={{ animationDelay: "780ms" }}
          >
            <div className="mb-4 flex w-full max-w-[320px] items-center gap-3 text-[13px] text-grey">
              <span className="h-px flex-1 bg-line" aria-hidden />
              or type it
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
            <HeroChat onSend={onStart} />
          </div>
          <div
            className="word mt-9 flex flex-col items-center gap-x-6 gap-y-3 text-[14px] text-grey md:flex-row"
            style={{ animationDelay: "880ms" }}
          >
            <a
              href="#call"
              onClick={jump("call")}
              className="inline-flex items-center gap-2 text-brown underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              <PhoneIcon /> Phone contact: {CALL_NUMBER} · availability unconfirmed
            </a>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["No tech skills needed", "Create a new site in six answers"].map((c) => (
                <li key={c} className="flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-amber" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <People />
      <HowItWorks />
      <Features />
      <WhyOnline onStart={go} />
      <Examples />
      <CallDemo />
      <Pricing onStart={go} />

      <section
        id="faq"
        className="scroll-mt-20 bg-[#F5F1E9] px-5 py-24 md:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <SectionHead
            align="left"
            title="Questions you might have"
            sub="The anonymous browser builder is ready to use. Phone service availability is not confirmed."
          />
          <Reveal className="border-t border-line">
            <Faq
              q="Do I need to know anything about websites?"
              a="Not at all. If you can describe your business to a friend, you can do this. We take care of the rest."
            />
            <Faq
              q="What if I don’t like something?"
              a="The builder publishes a website after six answers. Post-publish edits are not supported in this builder; start a new website conversation instead."
            />
            <Faq
              q="Can I just call instead of using the app?"
              a={`Phone service availability is not confirmed for ${CALL_NUMBER}. Use the anonymous browser builder to create your website.`}
            />
            <Faq
              q="What does a care plan cover?"
              a="Care plan details and phone support availability have not been confirmed in this builder."
            />
            <Faq
              q="Why is there a one-time price and a monthly plan?"
              a="Pricing and care plan terms are shown for reference. Confirm current terms before purchasing."
            />
            <Faq
              q="Can I talk in Hindi, Kannada or Tamil?"
              a="Yes. Talk in whichever language feels easiest, and mix them if you like. Your page can be in more than one language too."
            />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 md:py-40">
        <div
          className="glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[860px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />
        <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <Arcs className="h-10 w-11" />
          <h2 className="display mt-8 text-[44px] md:text-[68px]">
            Your business deserves to be online.
          </h2>
          <p className="mt-5 text-[18px] text-grey">
            Let’s do it together. Make your page for free, and pay only when
            you’re ready to put it online.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={go}
              className="btn btn-amber h-12 px-6 text-[16px]"
            >
              Start talking <ArrowIcon />
            </button>
            <a href={CALL_TEL} className="btn btn-white h-12 px-6 text-[16px]">
              <PhoneIcon /> Dial configured number
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line px-5 pb-12 pt-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-7" />
            <p className="mt-4 max-w-[30ch] text-[15px] text-grey">
              Your first website, made by just talking. Made with care in
              Bengaluru.
            </p>
          </div>
          {FOOTER.map(([h, items]) => (
            <div key={h}>
              <p className="eyebrow">{h}</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-brown">
                {items.map(([t, href]) => (
                  <li key={t}>
                    <a
                      href={href}
                      onClick={
                        href.startsWith("#") ? jump(href.slice(1)) : undefined
                      }
                      className="transition-colors hover:text-ink"
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col justify-between gap-2 text-[13px] text-grey sm:flex-row">
          <p>© 2025 DayOne</p>
          <p>Calls powered by Vobiz</p>
        </div>
      </footer>
    </div>
  )
}
