import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/react"
import { publishableKeyFromHost } from "@clerk/react/internal"
import { shadcn } from "@clerk/themes"
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter"
import { Builder } from "./components/Builder"
import { Dashboard } from "./components/Dashboard"
import { Landing } from "./components/Landing"
import { Logo } from "./components/brand"

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
)
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "")

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file")
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#e9a900",
    colorForeground: "#2b2621",
    colorMutedForeground: "#625d55",
    colorDanger: "#a1422a",
    colorBackground: "#fbf8f2",
    colorInput: "#fffdf8",
    colorInputForeground: "#2b2621",
    colorNeutral: "#d8d0c3",
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.8rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#fbf8f2] rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#2b2621] font-semibold",
    headerSubtitle: "text-[#625d55]",
    socialButtonsBlockButtonText: "text-[#2b2621] font-medium",
    formFieldLabel: "text-[#2b2621] font-medium",
    footerActionLink: "text-[#624915] font-semibold",
    footerActionText: "text-[#625d55]",
    dividerText: "text-[#625d55]",
    identityPreviewEditButton: "text-[#624915]",
    formFieldSuccessText: "text-[#27613d]",
    alertText: "text-[#7c3524]",
    logoBox: "mb-2",
    logoImage: "max-h-8",
    socialButtonsBlockButton: "border-[#d8d0c3] bg-[#fffdf8] hover:bg-[#fff7df]",
    formButtonPrimary: "bg-[#e9a900] text-[#2b2621] hover:bg-[#f0b815]",
    formFieldInput: "border-[#d8d0c3] bg-[#fffdf8] text-[#2b2621]",
    footerAction: "text-[#625d55]",
    dividerLine: "bg-[#d8d0c3]",
    alert: "border-[#d8a08b] bg-[#fff5f0]",
    otpCodeFieldInput: "border-[#d8d0c3] bg-[#fffdf8] text-[#2b2621]",
    formFieldRow: "text-[#2b2621]",
    main: "text-[#2b2621]",
  },
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const [, setLocation] = useLocation()
  if (!isLoaded) {
    return (
      <main className="min-h-[100dvh] bg-[#fbf8f2] px-5 py-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-7 w-24 rounded bg-[#eee7db]" />
          <div className="mx-auto mt-28 h-14 max-w-2xl rounded-xl bg-[#eee7db]" />
          <div className="mx-auto mt-5 h-5 max-w-md rounded bg-[#f1ecdf]" />
        </div>
      </main>
    )
  }
  if (isSignedIn) return <Redirect to="/dashboard" />

  const begin = (text?: string) => {
    const opening = text?.trim()
    if (opening) sessionStorage.setItem("dayone.pending-opening", opening)
    setLocation(`/sign-up?redirect_url=${encodeURIComponent(`${basePath}/build`)}`)
  }
  return <Landing onStart={begin} onLogin={() => setLocation("/sign-in")} user={null} />
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) {
    return (
      <main className="min-h-[100dvh] px-5 py-16">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-[#eee7db]" />
          <div className="mt-8 h-48 rounded-[24px] bg-[#f1ecdf]" />
        </div>
      </main>
    )
  }
  return isSignedIn ? <>{children}</> : <Redirect to="/" />
}

function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { isSignedIn } = useAuth()
  const hasBuildIntent =
    new URLSearchParams(window.location.search).has("redirect_url") ||
    Boolean(sessionStorage.getItem("dayone.pending-opening"))
  const redirectPath = `${basePath}${hasBuildIntent ? "/build" : "/dashboard"}`
  if (isSignedIn) return <Redirect to={hasBuildIntent ? "/build" : "/dashboard"} />
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#f6f0e5] px-4 py-12">
      <div className="pointer-events-none absolute -left-36 top-1/4 size-[390px] rounded-full bg-[#fff0bc]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-[#e9e2d5]/60 blur-3xl" />
      <div className="relative w-full max-w-[520px]">
        <a href={`${basePath || ""}/`} aria-label="DayOne home" className="mb-8 inline-flex">
          <Logo className="h-8" />
        </a>
        <div className="rounded-[28px] border border-[#e9e1d3] bg-[#fbf8f2]/90 p-2 shadow-[0_24px_70px_rgba(83,76,67,.10)]">
          {mode === "sign-in" ? (
            <SignIn
              routing="path"
              path={`${basePath}/sign-in`}
              signUpUrl={`${basePath}/sign-up`}
              forceRedirectUrl={redirectPath}
            />
          ) : (
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              forceRedirectUrl={redirectPath}
            />
          )}
        </div>
        <p className="mt-6 text-center text-[13px] text-[#625d55]">
          Your business, ready for its first website.
        </p>
      </div>
    </main>
  )
}

function BuildRoute() {
  const [, setLocation] = useLocation()
  const { userId } = useAuth()
  const [builderKey, setBuilderKey] = useState(0)
  const opening = sessionStorage.getItem("dayone.pending-opening") || undefined
  const onSessionStart = () => sessionStorage.removeItem("dayone.pending-opening")
  return (
    <PrivateRoute>
      <Builder
        key={`${userId || "signed-out"}-${builderKey}`}
        opening={opening}
        onHome={() => setLocation("/dashboard")}
        onNewWebsite={() => {
          sessionStorage.removeItem("dayone.pending-opening")
          setBuilderKey((key) => key + 1)
        }}
        onSessionStart={onSessionStart}
      />
    </PrivateRoute>
  )
}

function ClerkAccountChangeListener() {
  const { addListener } = useClerk()
  const previousUserId = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const nextId = user?.id ?? null
      if (previousUserId.current && previousUserId.current !== nextId) {
        sessionStorage.removeItem("dayone.pending-opening")
      }
      previousUserId.current = nextId
    })
    return unsubscribe
  }, [addListener])
  return null
}

function LegacyHashRedirect() {
  const [, setLocation] = useLocation()
  useEffect(() => {
    const legacy = window.location.hash
    if (legacy === "#/build") setLocation("/build", { replace: true })
    if (legacy === "#/dashboard") setLocation("/dashboard", { replace: true })
  }, [setLocation])
  return null
}

function Routes() {
  const [, setLocation] = useLocation()
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  useEffect(() => {
    document.title = "DayOne · Your first website, made by just talking"
  }, [])
  return (
    <>
      <LegacyHashRedirect />
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
        <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
        <Route path="/dashboard">
          {isLoaded && isSignedIn ? (
            <Dashboard
              key={user?.id}
              email={user?.primaryEmailAddress?.emailAddress || "Account"}
              onNewWebsite={() => setLocation("/build")}
              onSignOut={() => {
                sessionStorage.removeItem("dayone.pending-opening")
                void signOut({ redirectUrl: basePath || "/" })
              }}
            />
          ) : isLoaded ? <Redirect to="/" /> : <div className="min-h-[100dvh] animate-pulse bg-[#f6f0e5]" />}
        </Route>
        <Route path="/build">
          <BuildRoute />
        </Route>
        <Route>
          <Redirect to={isSignedIn ? "/dashboard" : "/"} />
        </Route>
      </Switch>
    </>
  )
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation()
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to find your websites and keep building.",
          },
        },
        signUp: {
          start: {
            title: "Start with DayOne",
            subtitle: "Create your account, then make your first website.",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkAccountChangeListener />
      <Routes />
    </ClerkProvider>
  )
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  )
}
