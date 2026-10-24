/**
 * Art directions.
 *
 * Six complete identities, not one template with the colours swapped. Each
 * owns its palette, its typefaces, its hero shape and one signature device
 * drawn from the trade it serves. A baker and a plumber should not get the
 * same page with a different hex value.
 */

export const DIRECTIONS = {
  /* A home kitchen. The world of jar labels and recipe cards: blush ground,
     mulberry as the voice, honey as the highlight. Photo-led, asymmetric. */
  hearth: {
    name: 'Hearth',
    note: 'Home kitchens and anything baked, cooked or packed by hand.',
    fonts: {
      google: 'family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Karla:wght@400;500;600',
      display: "'Fraunces', 'Georgia', serif",
      body: "'Karla', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#FFF9F6', ink: '#2A1720', muted: '#6E5560',
      accent: '#7B2D4E', accentInk: '#FFFFFF',
      highlight: '#F0B429', highlightInk: '#2A1720',
      soft: '#FDEBE2', line: '#F0DCD3', card: '#FFFFFF',
    },
    type: { displayWeight: 600, displayTrack: '-0.02em', displayLeading: '1.04', bodySize: '17px', bodyLeading: '1.6' },
    shape: { radius: '18px', radiusLg: '26px', pill: '999px' },
    hero: 'label',        // name sits on a honey label over the photograph
    divider: 'scallop',   // a pie-crust edge between bands
    priceStyle: 'cards',
    accentOnDark: false,
  },

  /* A wellness studio. Built out of space rather than ornament: pale sage,
     a very light serif set large, everything centred, one thin arc. */
  studio: {
    name: 'Studio',
    note: 'Yoga, movement, therapy, salons and slower wellness work.',
    fonts: {
      google: 'family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500',
      display: "'Cormorant Garamond', 'Georgia', serif",
      body: "'Jost', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#EEF2EE', ink: '#1F2B26', muted: '#5E6E66',
      accent: '#2E6049', accentInk: '#FFFFFF',
      highlight: '#CBD9C2', highlightInk: '#1F2B26',
      soft: '#F7F9F6', line: '#DAE2D8', card: '#FFFFFF',
    },
    type: { displayWeight: 300, displayTrack: '-0.01em', displayLeading: '1.08', bodySize: '17px', bodyLeading: '1.75' },
    shape: { radius: '0px', radiusLg: '0px', pill: '999px' },
    hero: 'centred',
    divider: 'arc',
    priceStyle: 'list',
    accentOnDark: false,
  },

  /* A teaching practice. A prospectus: white, ruled, two columns, an index
     rail. Credibility comes from structure, so nothing is decorative. */
  ledger: {
    name: 'Ledger',
    note: 'Tutors, clinics, consultants and anyone selling expertise.',
    fonts: {
      google: 'family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Public+Sans:wght@400;500;600',
      display: "'Newsreader', 'Georgia', serif",
      body: "'Public Sans', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#FFFFFF', ink: '#10171F', muted: '#566070',
      accent: '#0E4C5A', accentInk: '#FFFFFF',
      highlight: '#E8B33D', highlightInk: '#10171F',
      soft: '#F3F5F7', line: '#DDE3E9', card: '#FFFFFF',
    },
    type: { displayWeight: 500, displayTrack: '-0.015em', displayLeading: '1.1', bodySize: '16.5px', bodyLeading: '1.65' },
    shape: { radius: '6px', radiusLg: '8px', pill: '4px' },
    hero: 'ruled',
    divider: 'rule',
    priceStyle: 'table',
    accentOnDark: false,
  },

  /* A neighbourhood shop. Painted signage: one heavy grotesk at two weights,
     saturated panels, and the prices treated as the main event. */
  market: {
    name: 'Market',
    note: 'Shops, kirana, hardware, florists and counter trade.',
    fonts: {
      google: 'family=Archivo:wght@400;500;700;800',
      display: "'Archivo', ui-sans-serif, system-ui, sans-serif",
      body: "'Archivo', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#FBF6E9', ink: '#14281D', muted: '#4C5B50',
      accent: '#E8471F', accentInk: '#FFFFFF',
      highlight: '#FFC700', highlightInk: '#14281D',
      soft: '#F4EDDA', line: '#E4D9BE', card: '#FFFFFF',
      panel: '#0F3A2A', panelInk: '#F7F2E3',
    },
    type: { displayWeight: 800, displayTrack: '-0.035em', displayLeading: '0.98', bodySize: '17px', bodyLeading: '1.55' },
    shape: { radius: '10px', radiusLg: '14px', pill: '999px' },
    hero: 'panel',
    divider: 'band',
    priceStyle: 'tiles',
    accentOnDark: true,
  },

  /* A craft studio. A dark gallery hung with gold hairlines: the work is the
     content, type stays quiet and small, images run edge to edge. */
  atelier: {
    name: 'Atelier',
    note: 'Mehendi, tailoring, jewellery, photography and made-to-order craft.',
    fonts: {
      google: 'family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter+Tight:wght@300;400;500',
      display: "'Bodoni Moda', 'Didot', 'Georgia', serif",
      body: "'Inter Tight', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#141110', ink: '#F4EDE4', muted: '#A3978B',
      accent: '#C9A227', accentInk: '#141110',
      highlight: '#C9A227', highlightInk: '#141110',
      soft: '#211C1A', line: '#342C27', card: '#1B1614',
    },
    type: { displayWeight: 400, displayTrack: '-0.01em', displayLeading: '1.05', bodySize: '16px', bodyLeading: '1.7' },
    shape: { radius: '2px', radiusLg: '2px', pill: '999px' },
    hero: 'gallery',
    divider: 'hairline',
    priceStyle: 'list',
    accentOnDark: true,
    dark: true,
  },

  /* A local service. A utility, read at arm's length on a cracked phone in
     sunlight: one unmissable call band, a checklist, plain prices. */
  civic: {
    name: 'Civic',
    note: 'Plumbers, electricians, movers, repairs and callout work.',
    fonts: {
      google: 'family=Barlow:wght@400;500;600;700',
      display: "'Barlow', ui-sans-serif, system-ui, sans-serif",
      body: "'Barlow', ui-sans-serif, system-ui, sans-serif",
    },
    color: {
      ground: '#FFFFFF', ink: '#15202B', muted: '#4F5D6B',
      accent: '#0B5BD3', accentInk: '#FFFFFF',
      highlight: '#FFB703', highlightInk: '#15202B',
      soft: '#EFF4FA', line: '#D7E1EC', card: '#FFFFFF',
    },
    type: { displayWeight: 700, displayTrack: '-0.025em', displayLeading: '1.02', bodySize: '17px', bodyLeading: '1.6' },
    shape: { radius: '12px', radiusLg: '16px', pill: '999px' },
    hero: 'action',
    divider: 'none',
    priceStyle: 'rows',
    accentOnDark: true,
  },
}

export const DEFAULT_DIRECTION = 'civic'

export function getDirection(key) {
  return DIRECTIONS[key] || DIRECTIONS[DEFAULT_DIRECTION]
}

export const directionKeys = () => Object.keys(DIRECTIONS)

export default { DIRECTIONS, getDirection, directionKeys, DEFAULT_DIRECTION }
