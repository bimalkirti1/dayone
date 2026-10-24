import { useCallback, useEffect, useState } from "react"
import { Landing } from "./components/Landing"
import { Builder } from "./components/Builder"
import { Handoff } from "./components/Finale"
import { PublishedPage } from "./components/Site"
import { AuthModal } from "./components/Auth"

type Screen = "landing" | "build" | "handoff" | "site"
const HASH: Record<Screen, string> = {
  landing: "#/",
  build: "#/build",
  handoff: "#/call",
  site: "#/meeras-home-bakes",
}
const fromHash = (): Screen =>
  Object.entries(HASH).find(([, h]) => h === location.hash)?.[0] as Screen ??
  "landing"

export default function App() {
  const [screen, setScreen] = useState<Screen>(fromHash)
  const [speed, setSpeed] = useState(1)
  const [run, setRun] = useState(0)
  // Demo-only session: kept in memory, never sent anywhere.
  const [user, setUser] = useState<string | null>(null)
  // What the visitor typed on the landing page, used as their first message in the builder.
  const [opening, setOpening] = useState<string | undefined>()
  const [auth, setAuth] = useState<{
    mode: "login" | "signup"
    thenBuild: boolean
  } | null>(null)

  useEffect(() => {
    if (
      location.hash !== HASH[screen] &&
      !(screen === "landing" && !location.hash)
    )
      history.pushState(null, "", HASH[screen])
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    document.title =
      screen === "site"
        ? "Meera's Home Bakes"
        : "DayOne · Your first website, made by just talking"
  }, [screen])

  useEffect(() => {
    const on = () => setScreen(fromHash())
    addEventListener("popstate", on)
    return () => removeEventListener("popstate", on)
  }, [])

  const restart = () => {
    setRun((r) => r + 1)
    setUser(null)
    setAuth(null)
    setOpening(undefined)
    setScreen("landing")
  }

  const start = (text?: string) => {
    setOpening(text?.trim() || undefined)
    if (user) setScreen("build")
    else setAuth({ mode: "signup", thenBuild: true })
  }
  const closeAuth = useCallback(() => setAuth(null), [])
  const signedIn = (name: string) => {
    setUser(name)
    if (auth?.thenBuild) setScreen("build")
    setAuth(null)
  }

  return (
    <>
      {screen === "landing" && (
        <Landing
          key={run}
          user={user}
          onStart={start}
          onLogin={() => setAuth({ mode: "login", thenBuild: false })}
        />
      )}
      {screen === "build" && (
        <Builder
          key={run}
          speed={speed}
          opening={opening}
          onHome={() => setScreen("landing")}
          onHandoff={() => setScreen("handoff")}
          onOpenSite={() => setScreen("site")}
        />
      )}
      {screen === "handoff" && (
        <Handoff
          onSite={() => setScreen("site")}
          onHome={() => setScreen("landing")}
        />
      )}
      {screen === "site" && (
        <PublishedPage onHome={() => setScreen("landing")} />
      )}
      {auth && (
        <AuthModal
          key={auth.mode}
          initial={auth.mode}
          onClose={closeAuth}
          onDone={signedIn}
        />
      )}

      <div className="fixed bottom-2 left-3 z-[60] flex items-center gap-2 text-[11px] text-grey opacity-30 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={restart}
          className="underline-offset-2 hover:underline"
        >
          Restart demo
        </button>
        <span aria-hidden>·</span>
        <div
          role="group"
          aria-label="Conversation speed"
          className="flex rounded-full bg-white/90 p-0.5 shadow-soft"
        >
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                speed === s ? "bg-cream text-brown" : ""
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
