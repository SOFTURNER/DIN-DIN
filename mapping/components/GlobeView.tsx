import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'

import type { Actor, ImpactEvent } from '../types'
import { EVENT_MODE_META, KIND_META, PILOT_COST_META } from '../lib/theme'
import type { Match } from '../lib/filters'
import earthDark from '../assets/earth-dark.jpg'
import earthTopology from '../assets/earth-topology.png'

interface Props {
  actors: Actor[]
  events: ImpactEvent[]
  matches: Match[]
  selectedId: string | null
  selectedCoordinates: [number, number] | null
  matchOrigin: Actor | null
  showEvents: boolean
  fitToken: number
  onSelectActor: (actor: Actor) => void
  onSelectEvent: (event: ImpactEvent) => void
}

type Marker =
  | {
      id: string
      kind: 'actor'
      actor: Actor
      lat: number
      lng: number
      color: string
      size: number
      label: string
    }
  | {
      id: string
      kind: 'event'
      event: ImpactEvent
      lat: number
      lng: number
      color: string
      size: number
      label: string
    }

type Arc = {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c)

export default function GlobeView({
  actors,
  events,
  matches,
  selectedId,
  selectedCoordinates,
  matchOrigin,
  showEvents,
  fitToken,
  onSelectActor,
  onSelectEvent,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Measure the flex panel so the WebGL canvas fills it (same class of bug MapLibre hit).
  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const apply = () => {
      const { width, height } = node.getBoundingClientRect()
      setSize({ w: Math.max(1, Math.floor(width)), h: Math.max(1, Math.floor(height)) })
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    g.controls().autoRotate = true
    g.controls().autoRotateSpeed = 0.35
    g.controls().enableDamping = true
    g.pointOfView({ lat: 18, lng: 12, altitude: 2.15 }, 0)
  }, [size.w, size.h])

  useEffect(() => {
    if (!selectedCoordinates || !globeRef.current) return
    const [lng, lat] = selectedCoordinates
    globeRef.current.pointOfView({ lat, lng, altitude: 1.55 }, 900)
  }, [selectedCoordinates])

  useEffect(() => {
    if (fitToken === 0 || !globeRef.current) return
    globeRef.current.pointOfView({ lat: 18, lng: 12, altitude: 2.15 }, 900)
  }, [fitToken])

  const markers = useMemo<Marker[]>(() => {
    const actorMarks: Marker[] = actors.map((actor) => ({
      id: actor.id,
      kind: 'actor',
      actor,
      lat: actor.coordinates[1],
      lng: actor.coordinates[0],
      color: KIND_META[actor.kind].color,
      size: actor.id === selectedId ? 0.9 : actor.kind === 'founder' ? 0.55 : 0.68,
      label: actor.name,
    }))

    if (!showEvents) return actorMarks

    const eventMarks: Marker[] = events
      .filter((e): e is ImpactEvent & { coordinates: [number, number] } => Boolean(e.coordinates))
      .map((event) => ({
        id: event.id,
        kind: 'event',
        event,
        lat: event.coordinates[1],
        lng: event.coordinates[0],
        color: EVENT_MODE_META[event.mode].color,
        size: event.id === selectedId ? 0.85 : 0.55,
        label: event.title,
      }))

    return [...actorMarks, ...eventMarks]
  }, [actors, events, showEvents, selectedId])

  const arcs = useMemo<Arc[]>(() => {
    if (!matchOrigin) return []
    return matches.map((m) => ({
      startLat: matchOrigin.coordinates[1],
      startLng: matchOrigin.coordinates[0],
      endLat: m.actor.coordinates[1],
      endLng: m.actor.coordinates[0],
      color: KIND_META[m.actor.kind].color,
    }))
  }, [matchOrigin, matches])

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-[#f3f4f6]">
      {/* Soft floor shadow under the globe — Enerdrais-style floating look */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] left-1/2 h-16 w-[42%] -translate-x-1/2 rounded-[100%] bg-black/10 blur-2xl"
      />

      {size.w > 0 && size.h > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={earthDark}
          bumpImageUrl={earthTopology}
          atmosphereColor="#8aa4c4"
          atmosphereAltitude={0.18}
          showAtmosphere
          pointsData={markers}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.01}
          pointRadius="size"
          pointColor="color"
          pointLabel={(d) => {
            const m = d as Marker
            if (m.kind === 'actor') {
              const a = m.actor
              const cost = a.pilotCost ? PILOT_COST_META[a.pilotCost].label : ''
              return `<div style="font-family:Inter,sans-serif;padding:2px 0">
                <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${KIND_META[a.kind].color}">${esc(KIND_META[a.kind].label)}</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a">${esc(a.name)}</div>
                <div style="font-size:11px;color:#64748b">${esc(a.city)}, ${esc(a.country)}</div>
                ${cost ? `<div style="margin-top:4px;font-size:11px;font-weight:600;color:#15803d">${esc(cost)}</div>` : ''}
              </div>`
            }
            const e = m.event
            return `<div style="font-family:Inter,sans-serif;padding:2px 0">
              <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${EVENT_MODE_META[e.mode].color}">${esc(EVENT_MODE_META[e.mode].label)} · ${esc(e.kind)}</div>
              <div style="font-size:13px;font-weight:700;color:#0f172a">${esc(e.title)}</div>
              <div style="font-size:11px;color:#64748b">${esc(e.city ?? 'Online')}</div>
            </div>`
          }}
          onPointClick={(d) => {
            const m = d as Marker
            if (m.kind === 'actor') onSelectActor(m.actor)
            else onSelectEvent(m.event)
          }}
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2800}
          arcStroke={0.6}
          arcAltitude={0.22}
        />
      )}
    </div>
  )
}
