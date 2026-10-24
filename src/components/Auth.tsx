import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Arcs,
  ArrowIcon,
  BackIcon,
  CheckIcon,
  CloseIcon,
  GoogleIcon,
  MailIcon,
  Mic,
  PhoneIcon,
} from "./brand"

type Step = "choose" | "phone" | "otp" | "name" | "google" | "email" | "emailSent" | "success"

function OtpBoxes({ onComplete }: { onComplete: () => void }) {
  const [code, setCode] = useState("")
  const [auto, setAuto] = useState(false)
  const complete = useRef(onComplete)
  complete.current = onComplete
  useEffect(() => {
    const t = setTimeout(() => setAuto(true), 1300)
    return () => clearTimeout(t)
  }, [])
  // Demo: the code "arrives" by SMS and fills itself in.
  useEffect(() => {
    if (!auto) return
    let n = 0
    const iv = setInterval(() => {
      n++
      setCode("482913".slice(0, n))
      if (n >= 6) clearInterval(iv)
    }, 110)
    return () => clearInterval(iv)
  }, [auto])
  useEffect(() => {
    if (code.length !== 6) return
    const t = setTimeout(() => complete.current(), 500)
    return () => clearTimeout(t)
  }, [code])
  return (
    <label className="relative mt-7 block">
      <span className="sr-only">6-digit code</span>
      <input
        value={code}
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        onChange={(e) => {
          setAuto(false)
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }}
        className="absolute inset-0 z-10 opacity-0"
      />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, n) => (
          <span
            key={n}
            className={`grid h-14 place-items-center rounded-[12px] bg-white text-[22px] font-medium tabular-nums transition-shadow duration-200 ${
              n === code.length ? "shadow-[inset_0_0_0_2px_#FFAA00]" : "hair"
            }`}
          >
            {code[n] && <span className="morph">{code[n]}</span>}
          </span>
        ))}
      </div>
      <p className="mt-3 h-5 text-[13px] text-grey">
        {auto ? "Filled in from your messages" : ""}
      </p>
    </label>
  )
}

function Option({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="btn btn-white h-12 w-full text-[16px]">
      {icon}
      {children}
    </button>
  )
}

function Field({
  label,
  prefix,
  value,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string
  prefix?: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputMode?: "numeric" | "email" | "text"
}) {
  return (
    <label className="mt-6 block text-left">
      <span className="text-[14px] font-medium text-ink">{label}</span>
      <span className="hair mt-2 flex h-12 items-center gap-2 rounded-[12px] bg-white px-4 focus-within:shadow-[inset_0_0_0_2px_#FFAA00]">
        {prefix && <span className="text-[16px] text-grey">{prefix}</span>}
        <input
          autoFocus
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none"
        />
      </span>
    </label>
  )
}

export function AuthModal({
  initial,
  onClose,
  onDone,
}: {
  initial: "login" | "signup"
  onClose: () => void
  onDone: (name: string) => void
}) {
  const [mode, setMode] = useState(initial)
  const [step, setStep] = useState<Step>("choose")
  const [phone, setPhone] = useState("98450 12345")
  const [email, setEmail] = useState("meera@homebakes.in")
  const [name, setName] = useState("Meera")
  const [biz, setBiz] = useState("Meera's Home Bakes")
  const signup = mode === "signup"
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    addEventListener("keydown", on)
    return () => removeEventListener("keydown", on)
  }, [onClose])

  useEffect(() => {
    if (step === "google") {
      const t = setTimeout(() => setStep(signup ? "name" : "success"), 1500)
      return () => clearTimeout(t)
    }
    if (step === "success") {
      const t = setTimeout(() => done.current(name.trim() || "Meera"), 1300)
      return () => clearTimeout(t)
    }
  }, [step, signup, name])

  const back = {
    phone: "choose",
    otp: "phone",
    email: "choose",
    emailSent: "email",
    name: "choose",
  } as Partial<Record<Step, Step>>
  const digits = phone.replace(/\D/g, "")

  return (
    <div
      className="screen fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/25 p-4 backdrop-blur-[6px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={signup ? "Create your account" : "Log in"}
    >
      <div className="card-in relative w-full max-w-[440px] rounded-[24px] bg-paper px-6 pb-7 pt-12 text-center shadow-[0_30px_80px_rgba(43,38,33,0.2)] sm:px-9">
        {back[step] && (
          <button
            onClick={() => setStep(back[step]!)}
            aria-label="Back"
            className="absolute left-4 top-4 grid size-9 place-items-center rounded-full text-grey transition-colors hover:bg-white hover:text-ink"
          >
            <BackIcon />
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-grey transition-colors hover:bg-white hover:text-ink"
        >
          <CloseIcon />
        </button>

        <div key={step} className="bubble">
          {step === "choose" && (
            <>
              <Arcs className="mx-auto h-9 w-10" />
              <h2 className="mt-5 text-[28px]">
                {signup ? "Make your first website" : "Log in to DayOne"}
              </h2>
              <p className="mt-2 text-[16px] text-grey">
                {signup
                  ? "Create a free account. It takes a few seconds."
                  : "Good to see you again."}
              </p>
              <div className="mt-7 space-y-3">
                <Option
                  icon={<PhoneIcon className="size-5" />}
                  onClick={() => setStep("phone")}
                >
                  Continue with phone number
                </Option>
                <Option icon={<GoogleIcon />} onClick={() => setStep("google")}>
                  Continue with Google
                </Option>
                <Option icon={<MailIcon />} onClick={() => setStep("email")}>
                  Continue with email
                </Option>
              </div>
              <div className="mt-7 border-t border-line pt-5 text-[15px] text-grey">
                {signup ? "Already have an account? " : "New to DayOne? "}
                <button
                  onClick={() => setMode(signup ? "login" : "signup")}
                  className="font-medium text-ink underline decoration-amber decoration-2 underline-offset-4"
                >
                  {signup ? "Log in" : "Create account"}
                </button>
              </div>
              <p className="mt-4 text-[12px] text-grey/80">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </>
          )}

          {step === "phone" && (
            <>
              <h2 className="text-[28px]">What’s your phone number?</h2>
              <p className="mt-2 text-[16px] text-grey">
                We’ll send you a 6-digit code by SMS.
              </p>
              <Field
                label="Mobile number"
                prefix="+91"
                value={phone}
                onChange={setPhone}
                type="tel"
                inputMode="numeric"
              />
              <button
                disabled={digits.length < 10}
                onClick={() => setStep("otp")}
                className="btn btn-amber mt-6 h-12 w-full text-[16px] disabled:opacity-50"
              >
                Send code <ArrowIcon />
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-[28px]">Enter the code</h2>
              <p className="mt-2 text-[16px] text-grey">
                Sent to +91 {phone} ·{" "}
                <button
                  onClick={() => setStep("phone")}
                  className="font-medium text-ink underline decoration-amber decoration-2 underline-offset-4"
                >
                  Change
                </button>
              </p>
              <OtpBoxes
                onComplete={() => setStep(signup ? "name" : "success")}
              />
            </>
          )}

          {step === "google" && (
            <div className="py-6">
              <Mic decorative size={76} state="thinking" label="" />
              <p className="mt-6 text-[16px] text-grey">
                Connecting to your Google account…
              </p>
            </div>
          )}

          {step === "email" && (
            <>
              <h2 className="text-[28px]">What’s your email?</h2>
              <p className="mt-2 text-[16px] text-grey">
                We’ll send you a link. No password to remember.
              </p>
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
              />
              <button
                disabled={!email.includes("@")}
                onClick={() => setStep("emailSent")}
                className="btn btn-amber mt-6 h-12 w-full text-[16px] disabled:opacity-50"
              >
                Send me a link <ArrowIcon />
              </button>
            </>
          )}

          {step === "emailSent" && (
            <>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-cream text-ink">
                <MailIcon className="size-6" />
              </span>
              <h2 className="mt-5 text-[28px]">Check your inbox</h2>
              <p className="mt-2 text-[16px] text-grey">
                We sent a link to {email}. Tap it to carry on.
              </p>
              <button
                onClick={() => setStep(signup ? "name" : "success")}
                className="btn btn-white mt-7 h-12 w-full text-[16px]"
              >
                Open the link (demo)
              </button>
            </>
          )}

          {step === "name" && (
            <>
              <h2 className="text-[28px]">Nice to meet you</h2>
              <p className="mt-2 text-[16px] text-grey">
                Just two small things, then we’ll start.
              </p>
              <Field
                label="What should we call you?"
                value={name}
                onChange={setName}
              />
              <label className="mt-4 block text-left">
                <span className="text-[14px] font-medium text-ink">
                  Your business name
                </span>
                <span className="hair mt-2 flex h-12 items-center rounded-[12px] bg-white px-4 focus-within:shadow-[inset_0_0_0_2px_#FFAA00]">
                  <input
                    value={biz}
                    onChange={(e) => setBiz(e.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none"
                  />
                </span>
              </label>
              <button
                disabled={!name.trim()}
                onClick={() => setStep("success")}
                className="btn btn-amber mt-6 h-12 w-full text-[16px] disabled:opacity-50"
              >
                Continue <ArrowIcon />
              </button>
            </>
          )}

          {step === "success" && (
            <div className="py-6">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber text-ink">
                <CheckIcon className="size-7" />
              </span>
              <h2 className="mt-6 text-[28px]">
                Welcome, {name.trim() || "Meera"}
              </h2>
              <p className="mt-2 text-[16px] text-grey">
                Let’s make your first website.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
