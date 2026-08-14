import type { Actor, ActorKind, ImpactEvent, EventMode, Sector, Stage } from '../types'
import { NO_CASH_COSTS } from './theme'
import { haversineKm } from './geo'

export interface Filters {
  query: string
  kinds: ActorKind[]
  sectors: Sector[]
  stages: Stage[]
  /** Show only actors a founder without a budget can realistically work with. */
  noCashOnly: boolean
  /** Hide open calls whose deadline has already passed. */
  openOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  kinds: [],
  sectors: [],
  stages: [],
  noCashOnly: false,
  openOnly: false,
}

export interface EventFilters {
  query: string
  modes: EventMode[]
  sectors: Sector[]
  freeOnly: boolean
  /** Only events whose application deadline has not passed. */
  openOnly: boolean
}

export const EMPTY_EVENT_FILTERS: EventFilters = {
  query: '',
  modes: [],
  sectors: [],
  freeOnly: false,
  openOnly: false,
}

const overlaps = <T,>(selected: T[], values: T[]) =>
  selected.length === 0 || values.some((v) => selected.includes(v))

export function filterActors(actors: Actor[], f: Filters, today: Date): Actor[] {
  const q = f.query.trim().toLowerCase()
  return actors.filter((a) => {
    if (f.kinds.length && !f.kinds.includes(a.kind)) return false
    if (!overlaps(f.sectors, a.sectors)) return false
    if (!overlaps(f.stages, a.stages)) return false
    // Founders are peers on the map, not offers, so cost filters don't apply.
    if (f.noCashOnly && a.kind !== 'founder') {
      if (!a.pilotCost || !NO_CASH_COSTS.includes(a.pilotCost)) return false
    }
    if (f.openOnly && a.openUntil && new Date(a.openUntil) < today) return false
    if (q) {
      const haystack = [a.name, a.city, a.country, a.summary, ...a.sectors, ...a.offers]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function filterEvents(events: ImpactEvent[], f: EventFilters, today: Date): ImpactEvent[] {
  const q = f.query.trim().toLowerCase()
  return events
    .filter((e) => {
      if (f.modes.length && !f.modes.includes(e.mode)) return false
      if (!overlaps(f.sectors, e.sectors)) return false
      if (f.freeOnly && !e.free) return false
      if (f.openOnly) {
        const cutoff = new Date(e.deadline ?? e.endDate ?? e.startDate)
        if (cutoff < today) return false
      }
      if (q) {
        const haystack = [e.title, e.host, e.city ?? '', e.country ?? '', e.payoff, ...e.sectors]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export interface Match {
  actor: Actor
  score: number
  reasons: string[]
}

/**
 * Ranks opportunities against a founder. Weighted so that affordability beats
 * proximity: a free pilot on another continent is worth more to a venture with
 * no cash than a paid one down the road.
 */
export function rankMatches(founder: Actor, candidates: Actor[], limit = 6): Match[] {
  const scored = candidates
    .filter((c) => c.kind !== 'founder' && c.id !== founder.id)
    .map((actor) => {
      const reasons: string[] = []
      let score = 0

      const sharedSectors = actor.sectors.filter((s) => founder.sectors.includes(s))
      if (sharedSectors.length) {
        score += sharedSectors.length * 30
        reasons.push(`Works in ${sharedSectors.join(' and ')}`)
      }

      const sharedStages = actor.stages.filter((s) => founder.stages.includes(s))
      if (sharedStages.length) {
        score += sharedStages.length * 15
        reasons.push(`Supports ${sharedStages.join(' and ')} stage`)
      }

      if (actor.pilotCost && NO_CASH_COSTS.includes(actor.pilotCost)) {
        score += 35
        reasons.push('No cash required from the venture')
      } else if (actor.pilotCost === 'paid') {
        score += 40
        reasons.push('Host funds the pilot')
      }

      if (actor.timeToPilotWeeks && actor.timeToPilotWeeks <= 12) {
        score += 12
        reasons.push(`Roughly ${actor.timeToPilotWeeks} weeks to a signed pilot`)
      }

      const km = haversineKm(founder.coordinates, actor.coordinates)
      if (km < 500) {
        score += 20
        reasons.push('In the same region')
      } else if (km < 3000) {
        score += 8
      }

      return { actor, score, reasons }
    })
    .filter((m) => m.score > 0)

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function daysUntil(iso: string, today: Date): number {
  const ms = new Date(iso).getTime() - today.getTime()
  return Math.ceil(ms / 86_400_000)
}
