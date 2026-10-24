import { useEffect, useState } from "react"
import { Landing } from "./components/Landing"
import { Builder } from "./components/Builder"

type Screen = "landing" | "build"
const HASH: Record<Screen, string> = {
  landing: "#/",
  build: "#/build",
}
const fromHash = (): Screen =>
  Object.entries(HASH).find(([, h]) => h === location.hash)?.[0] as Screen ??
  "landing"

export default function App() {
  const [screen, setScreen] = useState<Screen>(fromHash)
  const [opening, setOpening] = useState<string | undefined>()
  const [builderKey, setBuilderKey] = useState(0)

  useEffect(() => {
    if (
      location.hash !== HASH[screen] &&
      !(screen === "landing" && !location.hash)
    )
      history.pushState(null, "", HASH[screen])
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    document.title = "DayOne · Your first website, made by just talking"
  }, [screen])

  useEffect(() => {
    const on = () => setScreen(fromHash())
    addEventListener("popstate", on)
    return () => removeEventListener("popstate", on)
  }, [])

  const start = (text?: string) => {
    setOpening(text?.trim() || undefined)
    setScreen("build")
  }
  const newWebsite = () => {
    setOpening(undefined)
    setBuilderKey((key) => key + 1)
  }

  return (
    <>
      {screen === "landing" && (
        <Landing
          user={null}
          onStart={start}
          onLogin={() => start()}
        />
      )}
      {screen === "build" && (
        <Builder
          key={builderKey}
          opening={opening}
          onHome={() => setScreen("landing")}
          onNewWebsite={newWebsite}
        />
      )}
    </>
  )
}
