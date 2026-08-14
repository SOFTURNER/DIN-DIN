export const SECTORS = [
  'Energy',
  'Mobility',
  'Circular',
  'Water',
  'Agrifood',
  'Health',
  'Built environment',
] as const
export type Sector = (typeof SECTORS)[number]

/**
 * Where a venture sits on the prototype -> revenue path. The gap DIN targets
 * is `pilot`: a working prototype, no cash, and no reference customer yet.
 */
export const STAGES = ['Prototype', 'Pilot', 'First sales', 'Scaling'] as const
export type Stage = (typeof STAGES)[number]

export const ACTOR_KINDS = ['founder', 'pilotHost', 'testbed', 'funder', 'enabler'] as const
export type ActorKind = (typeof ACTOR_KINDS)[number]

/**
 * What a host actually asks from a founder to run a pilot. `free` and `inKind`
 * are the two that a founder between prototype and first sales can afford.
 */
export type PilotCost = 'free' | 'inKind' | 'revenueShare' | 'paid'

export interface Actor {
  id: string
  name: string
  kind: ActorKind
  /** [longitude, latitude] — GeoJSON order. */
  coordinates: [number, number]
  city: string
  country: string
  sectors: Sector[]
  /** Stages this actor is set up to work with. */
  stages: Stage[]
  summary: string
  /** Only meaningful for hosts, testbeds and funders. */
  pilotCost?: PilotCost
  /** What the actor puts on the table, e.g. "Rooftop + 12 months of meter data". */
  offers: string[]
  /** ISO date for the next open call or intake deadline. */
  openUntil?: string
  /** Typical time from first contact to a signed pilot, in weeks. */
  timeToPilotWeeks?: number
  url?: string
}

export type EventMode = 'virtual' | 'physical' | 'hybrid'

export const EVENT_KINDS = [
  'Open call',
  'Pitch',
  'Demo day',
  'Matchmaking',
  'Conference',
  'Hackathon',
] as const
export type EventKind = (typeof EVENT_KINDS)[number]

export interface ImpactEvent {
  id: string
  title: string
  kind: EventKind
  mode: EventMode
  /** ISO date. Virtual-only events still carry a date for sorting. */
  startDate: string
  endDate?: string
  /** Absent for purely virtual events. */
  coordinates?: [number, number]
  city?: string
  country?: string
  host: string
  sectors: Sector[]
  stages: Stage[]
  free: boolean
  /** Application or registration cut-off, ISO date. */
  deadline?: string
  /** Why this event matters for a cash-strapped founder. */
  payoff: string
  url?: string
}
