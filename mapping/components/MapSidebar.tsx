import { Search, X } from 'lucide-react'

import { ACTOR_KINDS, SECTORS, STAGES, type Actor, type ActorKind, type Sector, type Stage } from '../types'
import { KIND_META, PILOT_COST_META } from '../lib/theme'
import { EMPTY_FILTERS, type Filters } from '../lib/filters'
import { Chip, EmptyState, SectionLabel, Toggle, cx } from './ui'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  results: Actor[]
  selectedId: string | null
  onSelect: (actor: Actor) => void
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function MapSidebar({ filters, onChange, results, selectedId, onSelect }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const activeCount =
    filters.kinds.length +
    filters.sectors.length +
    filters.stages.length +
    (filters.noCashOnly ? 1 : 0) +
    (filters.openOnly ? 1 : 0)

  const grouped = ACTOR_KINDS.map((kind) => ({
    kind,
    count: results.filter((r) => r.kind === kind).length,
  })).filter((g) => g.count > 0)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-200 px-4 pt-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="Search city, sector or organisation"
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
            checked={filters.noCashOnly}
            onChange={(v) => set('noCashOnly', v)}
            label="No cash required"
            hint="Only free, in-kind or host-funded pilots"
          />
          <Toggle
            checked={filters.openOnly}
            onChange={(v) => set('openOnly', v)}
            label="Open right now"
            hint="Hide calls whose deadline has passed"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <SectionLabel
          action={
            activeCount > 0 ? (
              <button
                type="button"
                onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
              >
                Reset {activeCount}
              </button>
            ) : undefined
          }
        >
          Who
        </SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {ACTOR_KINDS.map((kind) => (
            <Chip
              key={kind}
              active={filters.kinds.includes(kind)}
              onClick={() => set('kinds', toggleIn<ActorKind>(filters.kinds, kind))}
              dotColor={KIND_META[kind].color}
              title={KIND_META[kind].blurb}
            >
              {KIND_META[kind].plural}
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

        <div className="mt-5">
          <SectionLabel>Stage</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((stage) => (
              <Chip
                key={stage}
                active={filters.stages.includes(stage)}
                onClick={() => set('stages', toggleIn<Stage>(filters.stages, stage))}
              >
                {stage}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <SectionLabel
            action={
              <span className="text-[10px] font-medium text-slate-400">
                {results.length} on the map
              </span>
            }
          >
            Results
          </SectionLabel>

          {grouped.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
              {grouped.map(({ kind, count }) => (
                <span
                  key={kind}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: KIND_META[kind].color }}
                  />
                  {count} {KIND_META[kind].plural.toLowerCase()}
                </span>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              hint="Try clearing a sector or turning off “No cash required”."
            />
          ) : (
            <ul className="space-y-1.5">
              {results.map((actor) => (
                <li key={actor.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(actor)}
                    className={cx(
                      'w-full rounded-xl border px-3 py-2.5 text-left transition',
                      selectedId === actor.id
                        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: KIND_META[actor.kind].color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">{actor.name}</p>
                        <p className="truncate text-[10px] text-slate-500">
                          {actor.city}, {actor.country}
                        </p>
                        {actor.pilotCost && (
                          <span
                            className={cx(
                              'mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ring-1',
                              PILOT_COST_META[actor.pilotCost].tone,
                            )}
                          >
                            {PILOT_COST_META[actor.pilotCost].short}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
