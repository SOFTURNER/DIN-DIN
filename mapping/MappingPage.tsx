import { useMemo, useState } from 'react'
import { Calendar, Layers, Map as MapIcon, RotateCcw } from 'lucide-react'

import GlobeView from './components/GlobeView'
import MapSidebar from './components/MapSidebar'
import EventSidebar from './components/EventSidebar'
import DetailPanel from './components/DetailPanel'
import { cx } from './components/ui'
import './styles.css'

import { ACTORS } from './data/actors'
import { EVENTS } from './data/events'
import { ACTOR_KINDS, type Actor, type ImpactEvent } from './types'
import { KIND_META } from './lib/theme'
import {
  EMPTY_EVENT_FILTERS,
  EMPTY_FILTERS,
  filterActors,
  filterEvents,
  rankMatches,
  type EventFilters,
  type Filters,
} from './lib/filters'

type Tab = 'map' | 'events'

const TABS = [
  { id: 'map', label: 'Pilot map', icon: MapIcon },
  { id: 'events', label: 'Event finder', icon: Calendar },
] as const

export default function MappingPage() {
  const today = useMemo(() => new Date(), [])

  const [tab, setTab] = useState<Tab>('map')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [eventFilters, setEventFilters] = useState<EventFilters>(EMPTY_EVENT_FILTERS)
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showEventsOnMap, setShowEventsOnMap] = useState(false)
  const [fitToken, setFitToken] = useState(0)

  const visibleActors = useMemo(() => filterActors(ACTORS, filters, today), [filters, today])
  const visibleEvents = useMemo(
    () => filterEvents(EVENTS, eventFilters, today),
    [eventFilters, today],
  )

  const selectedActor = useMemo(
    () => visibleActors.find((a) => a.id === selectedActorId) ?? null,
    [visibleActors, selectedActorId],
  )
  const selectedEvent = useMemo(
    () => visibleEvents.find((e) => e.id === selectedEventId) ?? null,
    [visibleEvents, selectedEventId],
  )

  const matches = useMemo(
    () => (selectedActor?.kind === 'founder' ? rankMatches(selectedActor, visibleActors) : []),
    [selectedActor, visibleActors],
  )

  const eventsOnMap = tab === 'events' || showEventsOnMap

  const selectActor = (actor: Actor) => {
    setSelectedEventId(null)
    setSelectedActorId(actor.id)
  }
  const selectEvent = (event: ImpactEvent) => {
    setSelectedActorId(null)
    setSelectedEventId(event.id)
  }
  const clearSelection = () => {
    setSelectedActorId(null)
    setSelectedEventId(null)
  }

  const selectedCoordinates = selectedActor?.coordinates ?? selectedEvent?.coordinates ?? null
  const selectedId = selectedActor?.id ?? selectedEvent?.id ?? null

  const noCashCount = visibleActors.filter(
    (a) => a.pilotCost === 'free' || a.pilotCost === 'inKind',
  ).length

  return (
    <div className="din-map flex h-full w-full flex-col bg-white">
      {/* Tool strip under the site nav — brand lives in the site topbar */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.1)] px-4 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.08em] text-[#16a34a] uppercase">
            Mapping
          </p>
          <p className="truncate text-xs font-medium text-[#6b7280]">
            Pilot without cash, between prototype and first sales
          </p>
        </div>

        <nav className="flex items-center gap-1 rounded-full bg-[#f3f4f6] p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                tab === id
                  ? 'bg-white text-[#1f2937] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1f2937]',
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Stat value={visibleActors.length} label="on map" />
          <Stat value={noCashCount} label="no cash needed" accent />
          <Stat value={visibleEvents.length} label="events" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="z-20 flex w-[320px] shrink-0 flex-col border-r border-[rgba(0,0,0,0.1)] bg-white sm:w-[340px]">
          {tab === 'map' ? (
            <MapSidebar
              filters={filters}
              onChange={setFilters}
              results={visibleActors}
              selectedId={selectedActorId}
              onSelect={selectActor}
            />
          ) : (
            <EventSidebar
              filters={eventFilters}
              onChange={setEventFilters}
              results={visibleEvents}
              selectedId={selectedEventId}
              onSelect={selectEvent}
              today={today}
            />
          )}
        </div>

        <main className="relative min-w-0 flex-1 bg-[#f3f4f6]">
          <GlobeView
            actors={visibleActors}
            events={visibleEvents}
            matches={matches}
            selectedId={selectedId}
            selectedCoordinates={selectedCoordinates}
            matchOrigin={selectedActor?.kind === 'founder' ? selectedActor : null}
            showEvents={eventsOnMap}
            fitToken={fitToken}
            onSelectActor={selectActor}
            onSelectEvent={selectEvent}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
            <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[rgba(0,0,0,0.1)] bg-white/95 p-1 shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur">
              <SegButton
                active={false}
                onClick={() => setFitToken((n) => n + 1)}
                icon={RotateCcw}
                label="Reset view"
              />
              {tab === 'map' && (
                <>
                  <span className="mx-1 h-4 w-px bg-[rgba(0,0,0,0.1)]" />
                  <SegButton
                    active={showEventsOnMap}
                    onClick={() => setShowEventsOnMap((v) => !v)}
                    icon={Layers}
                    label="Events"
                  />
                </>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white/95 px-3 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">
              Legend
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {ACTOR_KINDS.map((kind) => (
                <span
                  key={kind}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1f2937]"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: KIND_META[kind].color }}
                  />
                  {KIND_META[kind].label}
                </span>
              ))}
              {eventsOnMap && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1f2937]">
                  <span className="size-1.5 rounded-full ring-[1.5px] ring-[#ea580c]" />
                  Event
                </span>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute top-4 right-4 bottom-4 z-10 flex">
            <DetailPanel
              actor={selectedActor}
              event={selectedEvent}
              matches={matches}
              today={today}
              onClose={clearSelection}
              onSelectActor={selectActor}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <p
        className={cx(
          'text-base leading-none font-extrabold',
          accent ? 'text-[#16a34a]' : 'text-[#1f2937]',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-none font-medium text-[#6b7280]">{label}</p>
    </div>
  )
}

function SegButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof RotateCcw
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition',
        active
          ? 'bg-[#16a34a] text-white'
          : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}
