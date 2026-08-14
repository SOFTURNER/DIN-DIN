import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, GripVertical, Send, Sparkles } from 'lucide-react'

import GlobeView from './components/GlobeView'
import { ACTORS } from './data/actors'
import { EVENTS } from './data/events'
import type { Actor } from './types'
import { KIND_META } from './lib/theme'
import { rankMatches, type Match } from './lib/filters'
import { cx } from './components/ui'
import './styles.css'

const USER_NAME = 'Lena Vos'
const LEFT_MIN = 28
const LEFT_MAX = 68
const LEFT_DEFAULT = 48

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string }

const STARTER: ChatMsg[] = [
  {
    id: 'a0',
    role: 'assistant',
    text: 'Hi — I can explain anything on the map or your matches. Try “Who can host a free pilot?” or “What’s near Nairobi?”',
  },
]

function replyTo(question: string, actors: Actor[]): string {
  const q = question.toLowerCase()
  const free = actors.filter((a) => a.pilotCost === 'free' || a.pilotCost === 'inKind')
  if (q.includes('free') || q.includes('no cash') || q.includes('cash')) {
    return `You have ${free.length} hosts/testbeds that don’t need cash from the venture (free or in-kind). Strong picks: ${free
      .slice(0, 3)
      .map((a) => a.name)
      .join(', ')}.`
  }
  if (q.includes('nairobi') || q.includes('kenya') || q.includes('africa')) {
    const hits = actors.filter((a) =>
      /kenya|nairobi|rwanda|nigeria|ghana|south africa/i.test(`${a.country} ${a.city}`),
    )
    return hits.length
      ? `In Africa I’m seeing ${hits.map((a) => `${a.name} (${a.city})`).join('; ')}.`
      : 'I don’t see African hosts in the current view.'
  }
  if (q.includes('event')) {
    return `There are ${EVENTS.length} upcoming events (virtual and in-person). Open calls and matchmaking days are the fastest path to a funded pilot.`
  }
  if (q.includes('match') || q.includes('connect')) {
    return 'Your top connections are ranked by sector fit and affordability. Click a card to fly the globe to that partner.'
  }
  return `You’re looking at ${actors.length} ecosystem actors on the globe. Ask about free pilots, a city, or a sector and I’ll narrow it down.`
}

export default function MappingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>(STARTER)
  const [draft, setDraft] = useState('')
  const [matchOpen, setMatchOpen] = useState(false)
  const [leftPct, setLeftPct] = useState(LEFT_DEFAULT)
  const [dragging, setDragging] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)
  const dashRef = useRef<HTMLDivElement>(null)

  const focusFounder = useMemo(() => ACTORS.find((a) => a.kind === 'founder') ?? null, [])

  const connections = useMemo<Match[]>(() => {
    if (!focusFounder) return []
    return rankMatches(focusFounder, ACTORS, 5)
  }, [focusFounder])

  const selectedActor = useMemo(
    () => ACTORS.find((a) => a.id === selectedId) ?? null,
    [selectedId],
  )

  const mapMatches = useMemo(() => {
    if (!selectedId) return connections
    const hit = connections.find((c) => c.actor.id === selectedId)
    return hit ? [hit] : connections
  }, [connections, selectedId])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      const box = dashRef.current?.getBoundingClientRect()
      if (!box) return
      const pct = ((e.clientX - box.left) / box.width) * 100
      setLeftPct(Math.min(LEFT_MAX, Math.max(LEFT_MIN, pct)))
    }
    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text }])
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: 'assistant', text: replyTo(text, ACTORS) },
      ])
    }, 420)
  }

  return (
    <div className="din-shell">
      <header className="din-glass din-header">
        <a href="index.html" className="din-header__brand" aria-label="Digital Impact Network home">
          <span className="din-dash__mark">DIN</span>
          <span className="din-header__name">Digital Impact Network</span>
        </a>

        <nav className="din-header__nav" aria-label="Primary">
          <a href="index.html">About us</a>
          <a href="mapping.html" aria-current="page">
            Mapping
          </a>
        </nav>

        <a href="contact.html" className="din-header__cta">
          Request Access
        </a>
      </header>

      <div
        ref={dashRef}
        className={cx('din-dash', dragging && 'din-dash--dragging')}
        style={{ gridTemplateColumns: `minmax(280px, ${leftPct}%) 6px 1fr` }}
      >
        <aside className={cx('din-dash__left', matchOpen && 'din-dash__left--match-open')}>
          <section
            className={cx(
              'din-dash__panel din-dash__match',
              matchOpen ? 'din-dash__match--open' : 'din-dash__match--closed',
            )}
          >
            <header className="din-dash__greet">
              <div>
                <p className="din-dash__hello">
                  Hi, <strong>{USER_NAME}</strong>
                </p>
                <p className="din-dash__sub">Here are your potential connections</p>
              </div>
            </header>

            <button
              type="button"
              className="din-dash__match-toggle"
              aria-expanded={matchOpen}
              onClick={() => setMatchOpen((v) => !v)}
            >
              <span className="din-dash__match-toggle-main">
                <Sparkles size={14} color="#16a34a" />
                <span>AI Matching</span>
                {focusFounder && <span className="din-dash__for">for {focusFounder.name}</span>}
              </span>
              <ChevronDown
                size={16}
                className={cx('din-dash__chevron', matchOpen && 'din-dash__chevron--open')}
              />
            </button>

            {matchOpen && (
              <ul className="din-dash__cards">
                {connections.map(({ actor, score, reasons }) => (
                  <li key={actor.id}>
                    <button
                      type="button"
                      className={cx(
                        'din-dash__card',
                        selectedId === actor.id && 'din-dash__card--active',
                      )}
                      onClick={() => setSelectedId(actor.id)}
                    >
                      <span
                        className="din-dash__dot"
                        style={{ background: KIND_META[actor.kind].color }}
                      />
                      <span className="din-dash__card-body">
                        <span className="din-dash__card-title">{actor.name}</span>
                        <span className="din-dash__card-meta">
                          {KIND_META[actor.kind].label} · {actor.city}
                        </span>
                        <span className="din-dash__card-why">{reasons[0]}</span>
                      </span>
                      <span className="din-dash__score">{score}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="din-dash__panel din-dash__chat">
            <header className="din-dash__chat-head">
              <span className="din-dash__chat-title">AI Chat</span>
              <span className="din-dash__chat-hint">Ask about the map & matches</span>
            </header>

            <div className="din-dash__thread" role="log" aria-live="polite">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cx(
                    'din-dash__bubble',
                    msg.role === 'user' ? 'din-dash__bubble--user' : 'din-dash__bubble--ai',
                  )}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            <form
              className="din-dash__composer"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask DIN anything…"
                aria-label="Message"
              />
              <button type="submit" aria-label="Send" className="din-dash__send">
                <Send size={16} />
              </button>
            </form>
          </section>
        </aside>

        <div
          className="din-dash__splitter"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          aria-valuemin={LEFT_MIN}
          aria-valuemax={LEFT_MAX}
          aria-valuenow={Math.round(leftPct)}
          onPointerDown={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
        >
          <GripVertical size={14} />
        </div>

        <section className="din-dash__map" aria-label="Network map">
          <div className="din-dash__map-label">Map</div>
          <GlobeView
            actors={ACTORS}
            events={EVENTS}
            matches={mapMatches}
            selectedId={selectedId}
            selectedCoordinates={selectedActor?.coordinates ?? null}
            matchOrigin={focusFounder}
            showEvents={false}
            fitToken={0}
            onSelectActor={(a) => setSelectedId(a.id)}
            onSelectEvent={() => undefined}
          />
        </section>
      </div>

      <footer className="din-glass din-footer">
        <p className="din-footer__copy">
          © {new Date().getFullYear()} Digital Impact Network
        </p>
        <nav className="din-footer__links" aria-label="Footer">
          <a href="index.html">About us</a>
          <a href="mapping.html">Mapping</a>
          <a href="contact.html">Contact</a>
          <a href="mailto:hello@digitalimpactnetwork.com">hello@digitalimpactnetwork.com</a>
        </nav>
        <p className="din-footer__tag">Built for connection, capital, and momentum.</p>
      </footer>
    </div>
  )
}
