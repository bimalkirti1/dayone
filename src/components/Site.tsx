import type { ReactNode } from 'react'
import { i, useCountUp, WhatsAppIcon, IllCake, IllCookies, IllBox, IllMap, Arcs } from './brand'

export type SecKey = 'hero' | 'features' | 'pricing' | 'testimonials' | 'contact'
export type SecState = 'hidden' | 'skeleton' | 'ready'
export type Sections = Record<SecKey, SecState>
export const NO_SECTIONS: Sections = { hero: 'hidden', features: 'hidden', pricing: 'hidden', testimonials: 'hidden', contact: 'hidden' }
export const ALL_SECTIONS: Sections = { hero: 'ready', features: 'ready', pricing: 'ready', testimonials: 'ready', contact: 'ready' }

function Block({ k, state, skel, children }: { k: SecKey; state: SecState; skel: ReactNode; children: ReactNode }) {
  return (
    <div data-sec={k} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-soft ${state === 'hidden' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
      <div className="min-h-0 overflow-hidden">{state === 'skeleton' ? skel : state === 'ready' ? children : null}</div>
    </div>
  )
}

function Skel({ rows }: { rows: string[] }) {
  return (
    <div className="px-6 py-10 @2xl:px-12 space-y-3" aria-label="Building this section">
      {rows.map((c, n) => (
        <div key={n} className={`skel ${c}`} />
      ))}
    </div>
  )
}

function H({ warm, className, children, as = 'h2' }: { warm: boolean; className: string; children: ReactNode; as?: 'h1' | 'h2' }) {
  const Tag = as
  // Keyed on theme so headings softly cross-fade when the font changes.
  return (
    <Tag key={warm ? 'w' : 'c'} className={`s-head st ${className}`}>
      {children}
    </Tag>
  )
}

function Price({ value, from }: { value: number; from?: boolean }) {
  const v = useCountUp(value, 1100)
  return (
    <span className="s-head text-[22px] tabular-nums">
      {from && <span className="s-muted mr-1 font-sans text-[15px] font-normal">from</span>}₹{v.toLocaleString('en-IN')}
    </span>
  )
}

export function Site({ s, warm, short, editKey = 0, published = false }: { s: Sections; warm: boolean; short: boolean; editKey?: number; published?: boolean }) {
  const headline = short ? 'Homemade cakes, made with love' : 'Baked with love in Indiranagar'
  return (
    <div className={`site @container ${warm ? 'warm' : ''} ${published ? 'min-h-screen' : 'min-h-full'}`}>
      <Block k="hero" state={s.hero} skel={<Skel rows={['h-6 w-40', 'h-4 w-28 !mt-10', 'h-10 w-4/5', 'h-4 w-3/5', 'h-11 w-48 rounded-full !mt-6', 'h-48 w-full !mt-8']} />}>
        <section className="px-6 pb-12 pt-4 @2xl:px-12 @2xl:pb-16">
          <nav className="st flex items-center justify-between py-3" style={i(0)}>
            <span className="s-head text-[17px]">Meera's Home Bakes</span>
            <span className="s-chip rounded-full px-3.5 py-1.5 text-[14px] font-medium">Order</span>
          </nav>
          <div className="mt-8 grid items-center gap-8 @2xl:mt-12 @2xl:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="st s-chip inline-flex rounded-full px-3 py-1 text-[14px]" style={i(1)}>
                Indiranagar, Bengaluru
              </p>
              <H warm={warm} as="h1" className="mt-4 text-[34px] leading-[1.08] @2xl:text-[46px]">
                <span key={headline} className={short ? 'morph sweep' : ''}>
                  {headline}
                </span>
              </H>
              <p className="st s-muted mt-4 text-[17px]" style={i(3)}>
                Custom cakes & cookies for every celebration
              </p>
              <span className="st btn s-btn mt-7 h-12 px-6 text-[15px]" style={i(4)}>
                <WhatsAppIcon /> Order on WhatsApp
              </span>
            </div>
            <div className="st s-soft grid aspect-[4/3] place-items-center overflow-hidden rounded-[20px]" style={i(5)}>
              <IllCake className="blurup w-3/5" />
            </div>
          </div>
        </section>
      </Block>

      <Block k="features" state={s.features} skel={<Skel rows={['h-7 w-40', 'h-36 w-full !mt-6', 'h-36 w-full']} />}>
        <section className="px-6 py-12 @2xl:px-12">
          <H warm={warm} className="text-[28px] @2xl:text-[32px]">
            What I bake
          </H>
          <div className="mt-6 grid gap-4 @2xl:grid-cols-3">
            {[
              { t: 'Birthday cakes', d: 'Made to order, with your theme and favourite flavours.', I: IllCake },
              { t: 'Cookie boxes', d: 'Buttery, chewy and lovely for gifting.', I: IllCookies },
              { t: 'Office treats', d: 'Fresh boxes for team meetings and farewells.', I: IllBox },
            ].map((it, n) => (
              <div key={it.t} className="st s-card rounded-[20px] p-5 shadow-soft" style={i(n + 1)}>
                <div className="s-soft grid h-28 place-items-center overflow-hidden rounded-[14px]">
                  <it.I className="blurup h-20" />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold">{it.t}</h3>
                <p className="s-muted mt-1 text-[15px]">{it.d}</p>
              </div>
            ))}
          </div>
        </section>
      </Block>

      <Block k="pricing" state={s.pricing} skel={<Skel rows={['h-7 w-32', 'h-16 w-full !mt-6', 'h-16 w-full', 'h-16 w-full']} />}>
        <section key={editKey} className={`px-6 py-12 @2xl:px-12 ${editKey && !published ? 'sweep-block' : ''}`}>
          <H warm={warm} className="text-[28px] @2xl:text-[32px]">
            Simple prices
          </H>
          <div className="s-card mt-6 divide-y divide-[color:var(--s-soft)] rounded-[20px] px-5 shadow-soft">
            {[
              { t: 'Cupcakes', d: 'Each, minimum 6', v: 60 },
              { t: 'Cookie box', d: 'Box of 12', v: 450 },
              { t: 'Custom cakes', d: 'Per kg, any theme', v: 1200, from: true },
            ].map((p, n) => (
              <div key={p.t} className="st flex items-center justify-between gap-4 py-4" style={i(n + 1)}>
                <div>
                  <p className="text-[16px] font-semibold">{p.t}</p>
                  <p className="s-muted text-[15px]">{p.d}</p>
                </div>
                <Price value={p.v} from={p.from} />
              </div>
            ))}
          </div>
        </section>
      </Block>

      <Block k="testimonials" state={s.testimonials} skel={<Skel rows={['h-7 w-48', 'h-32 w-full !mt-6', 'h-32 w-full']} />}>
        <section className="px-6 py-12 @2xl:px-12">
          <H warm={warm} className="text-[28px] @2xl:text-[32px]">
            Kind words
          </H>
          <div className="mt-6 grid gap-4 @2xl:grid-cols-2">
            {[
              { q: 'The unicorn cake made my daughter’s whole birthday. It tasted even better than it looked.', n: 'Priya, Koramangala' },
              { q: 'Our office orders a cookie box every Friday now. Meera always remembers our favourites.', n: 'Arjun, HSR Layout' },
            ].map((t, n) => (
              <figure key={t.n} className="st s-card rounded-[20px] p-6 shadow-soft" style={i(n + 1)}>
                <blockquote className="text-[16px]">“{t.q}”</blockquote>
                <figcaption className="s-muted mt-3 text-[15px]">{t.n}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </Block>

      <Block k="contact" state={s.contact} skel={<Skel rows={['h-7 w-52', 'h-4 w-2/3', 'h-11 w-56 rounded-full !mt-6', 'h-40 w-full !mt-6']} />}>
        <section className="px-6 py-12 @2xl:px-12 @2xl:pb-16">
          <div className="grid items-center gap-6 @2xl:grid-cols-2">
            <div>
              <H warm={warm} className="text-[28px] @2xl:text-[32px]">
                Order in one message
              </H>
              <p className="st s-muted mt-3 text-[16px]" style={i(1)}>
                Tell me the date, flavour and size. I usually reply within the hour.
              </p>
              <span className="st btn s-btn mt-6 h-12 px-6 text-[15px]" style={i(2)}>
                <WhatsAppIcon /> Message me on WhatsApp
              </span>
            </div>
            <div className="st s-card overflow-hidden rounded-[20px] shadow-soft" style={i(3)}>
              <IllMap className="blurup h-36 w-full" />
              <div className="px-5 py-4">
                <p className="text-[16px] font-semibold">12th Main, Indiranagar</p>
                <p className="s-muted text-[15px]">Pickup 10am to 8pm, delivery nearby</p>
              </div>
            </div>
          </div>
        </section>
      </Block>

      {published && (
        <footer className="s-muted flex flex-col items-center gap-1 px-6 pb-24 pt-6 text-center text-[14px]">
          <p>Meera's Home Bakes · Indiranagar, Bengaluru</p>
          <p>Baked fresh, every order.</p>
        </footer>
      )}
    </div>
  )
}

export function PublishedPage({ onHome }: { onHome: () => void }) {
  return (
    <div className="screen">
      <Site s={ALL_SECTIONS} warm short published />
      <button onClick={onHome} className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium text-grey shadow-soft backdrop-blur transition-transform hover:-translate-y-0.5">
        <Arcs className="h-3 w-3.5" /> Made with DayOne
      </button>
    </div>
  )
}
