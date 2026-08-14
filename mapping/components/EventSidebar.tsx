import { Calendar, Clock, MapPin, Search, Video, X } from 'lucide-react'

import { SECTORS, type EventMode, type ImpactEvent, type Sector } from '../types'
import { EVENT_MODE_META } from '../lib/theme'
import { EMPTY_EVENT_FILTERS, daysUntil, formatDate, type EventFilters } from '../lib/filters'
import { Badge, Chip, EmptyState, SectionLabel, Toggle, cx } from './ui'

const MODES: EventMode[] = ['physical', 'virtual', 'hybrid']

interface Props {
  filters: EventFilters
  onChange: (next: EventFilters) => void
  results: ImpactEvent[]
  selectedId: string | null
  onSelect: (event: ImpactEvent) => void
  today: Date
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** Groups events by calendar month so the list reads like a schedule. */
function byMonth(events: ImpactEvent[]) {
  const groups = new Map<string, ImpactEvent[]>()
  for (const e of events) {
    const key = new Date(e.startDate).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })
    const bucket = groups.get(key)
    if (bucket) bucket.push(e)
    else groups.set(key, [e])
  }
  return [...groups.entries()]
}

function DeadlinePill({ deadline, today }: { deadline: string; today: Date }) {
  const days = daysUntil(deadline, today)
  if (days < 0) return <Badge>Closed</Badge>
  if (days <= 14)
    return (
      <Badge className="bg-rose-50 text-rose-700 ring-rose-600/20">
        {days === 0 ? 'Closes today' : `${days}d left`}
      </Badge>
    )
  return <Badge>{days}d left</Badge>
}

export default function EventSidebar({
  filters,
  onChange,
  results,
  selectedId,
  onSelect,
  today,
}: Props) {
  const set = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) =>
    onChange({ ...filters, [key]: value })

  const activeCount =
    filters.modes.length +
    filters.sectors.length +
    (filters.freeOnly ? 1 : 0) +
    (filters.openOnly ? 1 : 0)

  const months = byMonth(results)
  const virtualCount = results.filter((e) => e.mode !== 'physical').length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-200 px-4 pt-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="Search events, hosts or cities"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set('query', '')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <Toggle
            checked={filters.freeOnly}
            onChange={(v) => set('freeOnly', v)}
            label="Free to attend"
            hint="No ticket cost for the venture"
          />
          <Toggle
            checked={filters.openOnly}
            onChange={(v) => set('openOnly', v)}
            label="Still open"
            hint="Deadline or date has not passed"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <SectionLabel
          action={
            activeCount > 0 ? (
              <button
                type="button"
                onClick={() => onChange({ ...EMPTY_EVENT_FILTERS, query: filters.query })}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
              >
                Reset {activeCount}
              </button>
            ) : undefined
          }
        >
          Format
        </SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((mode) => (
            <Chip
              key={mode}
              active={filters.modes.includes(mode)}
              onClick={() => set('modes', toggleIn<EventMode>(filters.modes, mode))}
              dotColor={EVENT_MODE_META[mode].color}
            >
              {EVENT_MODE_META[mode].label}
            </Chip>
          ))}
        </div>

        <div className="mt-5">
          <SectionLabel>Sector</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((sector) => (
              <Chip
                key={sector}
                active={filters.sectors.includes(sector)}
                onClick={() => set('sectors', toggleIn<Sector>(filters.sectors, sector))}
              >
                {sector}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <SectionLabel
            action={
              <span className="text-[10px] font-medium text-slate-400">
                {results.length} events · {virtualCount} remote
              </span>
            }
          >
            Schedule
          </SectionLabel>

          {results.length === 0 ? (
            <EmptyState
              title="No events match"
              hint="Widen the sector list or turn off “Still open”."
            />
          ) : (
            <div className="space-y-5">
              {months.map(([month, list]) => (
                <div key={month}>
                  <p className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {month}
                  </p>
                  <ul className="space-y-1.5">
                    {list.map((event) => (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(event)}
                          className={cx(
                            'w-full rounded-xl border px-3 py-2.5 text-left transition',
                            selectedId === event.id
                              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 text-xs leading-snug font-bold text-slate-900">
                              {event.title}
                            </p>
                            {event.deadline && (
                              <DeadlinePill deadline={event.deadline} today={today} />
                            )}
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-2.5" />
                              {formatDate(event.startDate)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: EVENT_MODE_META[event.mode].color }}
                            >
                              {event.mode === 'virtual' ? (
                                <Video className="size-2.5" />
                              ) : (
                                <MapPin className="size-2.5" />
                              )}
                              {event.city ?? EVENT_MODE_META[event.mode].label}
                            </span>
                            {event.free && <span className="text-brand-600">Free</span>}
                          </div>

                          <p className="mt-1.5 flex items-start gap-1 text-[10px] leading-snug text-slate-500">
                            <Clock className="mt-0.5 size-2.5 shrink-0 text-slate-400" />
                            {event.payoff}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
