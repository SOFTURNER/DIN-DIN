import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  Calendar,
  Clock,
  ExternalLink,
  Handshake,
  MapPin,
  Sparkles,
  Video,
  X,
} from 'lucide-react'

import type { Actor, ImpactEvent } from '../types'
import { EVENT_MODE_META, KIND_META, PILOT_COST_META } from '../lib/theme'
import { daysUntil, formatDate, type Match } from '../lib/filters'
import { Badge, cx } from './ui'

interface Props {
  actor: Actor | null
  event: ImpactEvent | null
  matches: Match[]
  today: Date
  onClose: () => void
  onSelectActor: (actor: Actor) => void
}

function Shell({
  accent,
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
}: {
  accent: string
  eyebrow: string
  title: string
  subtitle: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <aside className="pointer-events-auto flex h-full w-[368px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-15px_rgba(15,23,42,0.25)]">
      <header className="relative shrink-0 border-b border-slate-100 px-5 pt-5 pb-4">
        <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-3.5" />
        </button>
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: accent }}>
          {eyebrow}
        </p>
        <h2 className="mt-1 pr-8 text-base leading-tight font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
        {label}
      </p>
      {children}
    </div>
  )
}

function ActorDetail({
  actor,
  matches,
  today,
  onClose,
  onSelectActor,
}: {
  actor: Actor
  matches: Match[]
  today: Date
  onClose: () => void
  onSelectActor: (a: Actor) => void
}) {
  const meta = KIND_META[actor.kind]
  const cost = actor.pilotCost ? PILOT_COST_META[actor.pilotCost] : null
  const isFounder = actor.kind === 'founder'

  return (
    <Shell
      accent={meta.color}
      eyebrow={meta.label}
      title={actor.name}
      subtitle={`${actor.city}, ${actor.country}`}
      onClose={onClose}
    >
      <p className="text-sm leading-relaxed text-slate-600">{actor.summary}</p>

      {cost && (
        <div className={cx('flex items-start gap-2.5 rounded-xl px-3 py-2.5 ring-1', cost.tone)}>
          <Handshake className="mt-0.5 size-4 shrink-0 opacity-70" />
          <div>
            <p className="text-xs font-bold">{cost.short}</p>
            <p className="text-[11px] opacity-80">{cost.label}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {actor.timeToPilotWeeks && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-xl font-extrabold text-slate-900">{actor.timeToPilotWeeks}</p>
            <p className="text-[10px] font-medium text-slate-500">weeks to signed pilot</p>
          </div>
        )}
        {actor.openUntil && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p
              className={cx(
                'text-xl font-extrabold',
                daysUntil(actor.openUntil, today) <= 14 ? 'text-rose-600' : 'text-slate-900',
              )}
            >
              {Math.max(daysUntil(actor.openUntil, today), 0)}
            </p>
            <p className="text-[10px] font-medium text-slate-500">days to apply</p>
          </div>
        )}
      </div>

      <Field label={isFounder ? 'Looking for' : 'What they put on the table'}>
        <ul className="space-y-1.5">
          {actor.offers.map((offer) => (
            <li key={offer} className="flex items-start gap-2 text-xs text-slate-700">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              {offer}
            </li>
          ))}
        </ul>
      </Field>

      <div className="flex flex-wrap gap-1.5">
        {actor.sectors.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
        {actor.stages.map((s) => (
          <Badge key={s} className="bg-brand-50 text-brand-700 ring-brand-600/20">
            {s}
          </Badge>
        ))}
      </div>

      {isFounder && matches.length > 0 && (
        <Field label="Suggested pilot routes">
          <p className="mb-2.5 -mt-0.5 flex items-start gap-1.5 text-[11px] leading-snug text-slate-500">
            <Sparkles className="mt-0.5 size-3 shrink-0 text-pink-500" />
            Ranked by affordability first, then sector fit and distance. Shown as arcs on the map.
          </p>
          <ul className="space-y-1.5">
            {matches.map(({ actor: target, score, reasons }) => (
              <li key={target.id}>
                <button
                  type="button"
                  onClick={() => onSelectActor(target)}
                  className="group w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: KIND_META[target.kind].color }}
                    />
                    <p className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                      {target.name}
                    </p>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {score}
                    </span>
                    <ArrowUpRight className="size-3 shrink-0 text-slate-400 transition group-hover:text-slate-700" />
                  </div>
                  <p className="mt-1 pl-3.5 text-[10px] leading-snug text-slate-500">
                    {reasons.slice(0, 2).join(' · ')}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Field>
      )}

      {actor.url && (
        <a
          href={actor.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          Visit site <ExternalLink className="size-3" />
        </a>
      )}
    </Shell>
  )
}

function EventDetail({
  event,
  today,
  onClose,
}: {
  event: ImpactEvent
  today: Date
  onClose: () => void
}) {
  const mode = EVENT_MODE_META[event.mode]
  const where = event.city ? `${event.city}, ${event.country}` : 'Online from anywhere'

  return (
    <Shell
      accent={mode.color}
      eyebrow={`${mode.label} · ${event.kind}`}
      title={event.title}
      subtitle={where}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
            <Calendar className="size-2.5" /> Date
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-900">
            {formatDate(event.startDate)}
            {event.endDate && ` – ${formatDate(event.endDate)}`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
            <Clock className="size-2.5" /> Deadline
          </p>
          <p
            className={cx(
              'mt-0.5 text-xs font-bold',
              event.deadline && daysUntil(event.deadline, today) <= 14
                ? 'text-rose-600'
                : 'text-slate-900',
            )}
          >
            {event.deadline ? formatDate(event.deadline) : 'No cut-off'}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-brand-50 px-3 py-2.5 ring-1 ring-brand-600/20">
        {event.mode === 'virtual' ? (
          <Video className="mt-0.5 size-4 shrink-0 text-brand-600" />
        ) : (
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
        )}
        <div>
          <p className="text-xs font-bold text-slate-900">Why it is worth your time</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{event.payoff}</p>
        </div>
      </div>

      <Field label="Host">
        <p className="text-xs text-slate-700">{event.host}</p>
      </Field>

      <div className="flex flex-wrap gap-1.5">
        {event.free && (
          <Badge className="bg-brand-50 text-brand-700 ring-brand-600/20">Free to attend</Badge>
        )}
        {event.sectors.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
        {event.stages.map((s) => (
          <Badge key={s} className="bg-brand-50 text-brand-700 ring-brand-600/20">
            {s}
          </Badge>
        ))}
      </div>

      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          Event page <ExternalLink className="size-3" />
        </a>
      )}
    </Shell>
  )
}

export default function DetailPanel({
  actor,
  event,
  matches,
  today,
  onClose,
  onSelectActor,
}: Props) {
  if (actor)
    return (
      <ActorDetail
        actor={actor}
        matches={matches}
        today={today}
        onClose={onClose}
        onSelectActor={onSelectActor}
      />
    )
  if (event) return <EventDetail event={event} today={today} onClose={onClose} />
  return null
}
