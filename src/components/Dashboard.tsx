import { useEffect, useState } from "react"
import { listMySites, type DashboardSite } from "../lib/dashboard-api"
import { Logo } from "./brand"

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-[18px]">
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path d="M11 4h5v5m-.5-4.5L9 11m2-5H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SiteCard({ site }: { site: DashboardSite }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = (() => {
    try {
      return new URL(site.url, window.location.origin).toString()
    } catch {
      return site.url
    }
  })()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="group rounded-[22px] border border-[#e8e0d2] bg-[#fffdf8] p-5 shadow-[0_5px_20px_rgba(83,76,67,.035)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-[62px] flex-none place-items-center rounded-[18px] bg-[#fff0bd] text-[#554525]">
          <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="size-7">
            <path d="M5.5 5.5h17v17h-17zM5.5 10h17M11 10v12.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 7.8h.1m2.2 0h.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12px] text-[#777168]">{site.slug}</p>
          <h2 className="mt-1 truncate text-[21px] font-medium tracking-[-0.035em] text-[#2b2621]">
            {site.name}
          </h2>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-[14px] text-[#66552f] underline decoration-[#d7c48e] underline-offset-4 transition-colors hover:text-[#2b2621]"
          >
            <span className="truncate">{site.url}</span>
            <ExternalIcon />
          </a>
        </div>
        <div className="flex flex-none items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => void copy()}
            className="btn btn-white h-10 px-4 text-[14px]"
            aria-label={`Copy link for ${site.name}`}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-amber h-10 gap-2 px-4 text-[14px]"
          >
            Open <ExternalIcon />
          </a>
        </div>
      </div>
      <div className="mt-5 border-t border-[#eee8de] pt-3 text-[12px] text-[#777168]">
        Created {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(site.createdAt))}
      </div>
    </article>
  )
}

export function Dashboard({
  email,
  onNewWebsite,
  onSignOut,
}: {
  email: string
  onNewWebsite: () => void
  onSignOut: () => void
}) {
  const [sites, setSites] = useState<DashboardSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(undefined)
    listMySites(controller.signal)
      .then(setSites)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Your websites could not be loaded.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [attempt])

  return (
    <div className="min-h-[100dvh] bg-[#f6f0e5] text-[#2b2621]">
      <header className="border-b border-[#e8e0d2] bg-[#fbf8f2]/90">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-5">
          <a href="/" aria-label="DayOne dashboard home" className="flex-none">
            <Logo className="h-7" />
          </a>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#898276]">Signed in as</p>
              <p className="max-w-[230px] truncate text-[13px] font-medium text-[#4a443c]">{email}</p>
            </div>
            <button type="button" onClick={onSignOut} className="btn btn-white h-10 px-4 text-[14px]">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
        <div className="relative overflow-hidden rounded-[28px] border border-[#eadfca] bg-[#fff0bd] px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-8 -top-16 size-64 rounded-full border border-[#dfc878]/50 sm:size-80" />
          <div className="pointer-events-none absolute -right-1 top-0 size-48 rounded-full border border-[#dfc878]/50 sm:size-64" />
          <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[.13em] text-[#6d5d32]">Your DayOne</p>
              <h1 className="mt-3 max-w-[18ch] text-[36px] font-medium leading-[1.04] tracking-[-.055em] text-[#2b2621] sm:text-[48px]">
                Your websites, all in one place.
              </h1>
              <p className="mt-3 max-w-[52ch] text-[16px] leading-6 text-[#625a49]">
                Open a site you’ve made, share its link, or start a fresh conversation.
              </p>
            </div>
            <button type="button" onClick={onNewWebsite} className="btn btn-amber h-12 gap-2 px-5 text-[15px]">
              Start a new website <ArrowIcon />
            </button>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="sites-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.13em] text-[#847b6d]">Your work</p>
              <h2 id="sites-heading" className="mt-1 text-[25px] font-medium tracking-[-.04em]">Websites</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Loading your websites" aria-busy="true">
              {[0, 1].map((item) => (
                <div key={item} className="flex animate-pulse items-center gap-5 rounded-[22px] border border-[#e8e0d2] bg-[#fffdf8] p-6">
                  <div className="size-[62px] rounded-[18px] bg-[#eee7db]" />
                  <div className="flex-1">
                    <div className="h-3 w-28 rounded bg-[#eee7db]" />
                    <div className="mt-3 h-5 w-52 max-w-full rounded bg-[#eee7db]" />
                    <div className="mt-3 h-3 w-40 rounded bg-[#f1ecdf]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-[22px] border border-[#e0b5a4] bg-[#fff7f2] p-6 sm:p-8">
              <p className="text-[17px] font-medium text-[#633d30]">We couldn’t reach your websites.</p>
              <p className="mt-1 text-[14px] text-[#795e53]">{error}</p>
              <button type="button" onClick={() => setAttempt((value) => value + 1)} className="btn btn-white mt-5 h-10 px-4 text-[14px]">
                Try again
              </button>
            </div>
          ) : sites.length === 0 ? (
            <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[#d8cbb6] bg-[#fbf8f2]/80 px-6 py-12 text-center sm:py-16">
              <div className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[#fff0bd] text-[#62552f]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-5 text-[23px] font-medium tracking-[-.04em]">Your first website starts here.</h3>
              <p className="mx-auto mt-2 max-w-[48ch] text-[15px] leading-6 text-[#70695f]">
                There aren’t any websites saved to this account yet. Start a new build and your newly created site will appear here.
              </p>
              <button type="button" onClick={onNewWebsite} className="btn btn-amber mt-6 h-11 px-5 text-[14px]">
                Start building <ArrowIcon />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map((site) => <SiteCard key={site.slug} site={site} />)}
            </div>
          )}
        </section>

        <div className="mt-12 flex flex-col gap-2 border-t border-[#e5dccd] pt-5 text-[12px] text-[#81796e] sm:flex-row sm:items-center sm:justify-between">
          <span>{email}</span>
          <span>Only websites saved to this account are shown here.</span>
        </div>
      </main>
    </div>
  )
}
