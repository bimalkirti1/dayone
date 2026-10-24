import { useState, type ReactNode } from 'react'
import { ArrowIcon, CheckIcon, Reveal } from './brand'

type Option<K extends string> = { id: K; name: string; price: number; blurb: string; feats: string[] }
type SiteId = 'page' | 'store'
type CareId = 'care' | 'grow' | 'shop'

const SITES: Option<SiteId>[] = [
  {
    id: 'page',
    name: 'Landing page',
    price: 1699,
    blurb: 'One beautiful page for your business.',
    feats: ['Made by just talking, in about 2 minutes', 'Call and WhatsApp order buttons', 'Your photos, prices and timings', 'Looks lovely on every phone', 'Free changes for your first 30 days'],
  },
  {
    id: 'store',
    name: 'Small online shop',
    price: 3599,
    blurb: 'Let customers browse, order and pay.',
    feats: ['Everything in Landing page', 'Up to 5 pages', 'Up to 50 products with photos', 'UPI and card payments', 'Order alerts by SMS'],
  },
]

const CARE: Option<CareId>[] = [
  {
    id: 'care',
    name: 'Care',
    price: 1299,
    blurb: 'Online, safe and working.',
    feats: ['Hosting, always on', 'Your dayone.page link', 'Safe and secure (https)', '5 changes a month, just call us', 'Phone support, Monday to Saturday'],
  },
  {
    id: 'grow',
    name: 'Grow',
    price: 2199,
    blurb: 'Get found by more people.',
    feats: ['Everything in Care', 'Your own name, like meerasbakes.in', 'Unlimited changes by call', 'Festival offers set up for you', 'Show up on Google Maps', 'A simple monthly visitors report'],
  },
  {
    id: 'shop',
    name: 'Shop',
    price: 3499,
    blurb: 'For shops taking orders daily.',
    feats: ['Everything in Grow', 'Shop hosting for up to 200 products', 'Stock and price updates by call', 'Help with payments and orders', 'Priority support, same day'],
  },
]

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

function Choice<K extends string>({ o, selected, unit, badge, onSelect }: { o: Option<K>; selected: boolean; unit: string; badge?: string; onSelect: () => void }) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-[16px] px-4 py-4 text-left transition-[background-color,box-shadow] duration-200 md:px-5 ${selected ? 'bg-[#FFFBEB] shadow-[inset_0_0_0_1.5px_#FFAA00]' : 'hair bg-white hover:bg-[#FFFDF6]'}`}
    >
      <span className={`grid size-5 flex-none place-items-center rounded-full transition-colors ${selected ? 'bg-amber' : 'shadow-[inset_0_0_0_1.5px_#D9D0BF]'}`} aria-hidden>
        {selected && <span className="size-2 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[17px] font-medium text-ink">{o.name}</span>
          {badge && <span className="chip px-2 py-0.5 text-[12px] font-medium">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-[14px] text-grey">{o.blurb}</span>
      </span>
      <span className="flex-none text-right">
        <span className="block text-[20px] font-medium tabular-nums tracking-[-0.02em] text-ink">{rupees(o.price)}</span>
        <span className="block text-[12px] text-grey">{unit}</span>
      </span>
    </button>
  )
}

function Included({ title, feats }: { title: string; feats: string[] }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="text-[14px] font-medium text-ink">{title}</p>
      <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {feats.map((f) => (
          <li key={f} className="bubble flex gap-2.5 text-[15px]">
            <CheckIcon className="mt-[3px] size-4 flex-none text-amber" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Panel({ step, title, tag, sub, children }: { step: string; title: string; tag: string; sub: string; children: ReactNode }) {
  return (
    <div className="hair flex h-full flex-col rounded-[28px] bg-white p-5 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-8 flex-none place-items-center rounded-full bg-ink text-[14px] font-medium text-white">{step}</span>
        <h3 className="text-[22px] tracking-[-0.02em]">{title}</h3>
        <span className="ml-auto hidden whitespace-nowrap rounded-full bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-brown shadow-[inset_0_0_0_1px_#ECE5D8] sm:inline-block">{tag}</span>
      </div>
      <p className="mt-3 text-[15px] text-grey">{sub}</p>
      {children}
    </div>
  )
}

export function Pricing({ onStart }: { onStart: () => void }) {
  const [site, setSite] = useState<SiteId>('page')
  const [care, setCare] = useState<CareId>('grow')
  const s = SITES.find((o) => o.id === site)!
  const c = CARE.find((o) => o.id === care)!
  const badgeFor = (id: CareId) => (site === 'store' ? (id === 'shop' ? 'Best for shops' : undefined) : id === 'grow' ? 'Most popular' : undefined)

  return (
    <section id="pricing" className="scroll-mt-20 px-5 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pricing</p>
          <h2 className="display mt-4 text-balance text-[40px] md:text-[56px]">Simple pricing, in two parts.</h2>
          <p className="mt-4 text-[18px] text-grey">Pay once to make your website. Then a small monthly plan keeps it online and looked after. Trying it is free.</p>
        </Reveal>

        <Reveal className="relative mt-14 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Panel step="1" title="Make your website" tag="Pay once" sub="A one-time payment. No monthly fee for the build itself.">
            <div role="radiogroup" aria-label="Choose your website" className="mt-6 space-y-2.5">
              {SITES.map((o) => (
                <Choice key={o.id} o={o} selected={site === o.id} unit="one-time" onSelect={() => setSite(o.id)} />
              ))}
            </div>
            <Included key={s.id} title={`Included in ${s.name}`} feats={s.feats} />
          </Panel>

          <span className="z-10 mx-auto -my-6 grid size-12 place-items-center rounded-full bg-paper text-[24px] font-light text-grey shadow-[inset_0_0_0_1px_#ECE5D8] lg:absolute lg:left-1/2 lg:top-1/2 lg:m-0 lg:-translate-x-1/2 lg:-translate-y-1/2" aria-hidden>
            +
          </span>

          <Panel step="2" title="Keep it running" tag="Every month" sub="Hosting, safety and changes, done for you. Stop anytime.">
            <div role="radiogroup" aria-label="Choose a care plan" className="mt-6 space-y-2.5">
              {CARE.map((o) => (
                <Choice key={o.id} o={o} selected={care === o.id} unit="per month" badge={badgeFor(o.id)} onSelect={() => setCare(o.id)} />
              ))}
            </div>
            <Included key={c.id} title={`Included in ${c.name}`} feats={c.feats} />
          </Panel>
        </Reveal>

        <Reveal className="mt-4 lg:mt-6">
          <div className="flex flex-col gap-6 rounded-[28px] bg-cream/60 p-6 shadow-[inset_0_0_0_1px_#FFE58A] md:flex-row md:items-center md:gap-10 md:p-8">
            <div className="min-w-0 md:flex-1">
              <p className="eyebrow !text-brown">Your plan</p>
              <p className="mt-2 text-[20px] font-medium tracking-[-0.02em] text-ink">
                {s.name} + {c.name} care
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 md:flex md:gap-10">
              <div>
                <p className="text-[13px] text-brown">Pay once</p>
                <p className="mt-1 text-[24px] font-medium tabular-nums tracking-[-0.03em] text-ink md:text-[28px]">{rupees(s.price)}</p>
              </div>
              <div>
                <p className="text-[13px] text-brown">Then every month</p>
                <p className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.03em] text-ink md:text-[28px]">
                  {rupees(c.price)}
                  <span className="text-[15px] font-normal text-grey"> /month</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <button onClick={onStart} className="btn btn-amber h-12 px-6 text-[16px]">
                Start for free <ArrowIcon />
              </button>
              <p className="text-[13px] text-brown">Pay only when your page goes online.</p>
            </div>
          </div>
          <p className="mt-5 text-center text-[14px] text-grey">All prices in Indian rupees. Your care plan starts the day your website goes online.</p>
        </Reveal>
      </div>
    </section>
  )
}
