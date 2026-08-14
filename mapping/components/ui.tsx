import type { ReactNode } from 'react'

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export function Chip({
  active,
  onClick,
  children,
  dotColor,
  title,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  dotColor?: string
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40',
        active
          ? 'bg-[#16a34a] text-white'
          : 'bg-white text-[#6b7280] ring-1 ring-[rgba(0,0,0,0.1)] hover:bg-[#f9fafb] hover:text-[#1f2937]',
      )}
    >
      {dotColor && (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : dotColor }}
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#f9fafb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-[#1f2937]">{label}</span>
        {hint && <span className="block text-[10px] leading-tight text-[#6b7280]">{hint}</span>}
      </span>
      <span
        className={cx(
          'relative h-4.5 w-8 shrink-0 rounded-full transition',
          checked ? 'bg-[#16a34a]' : 'bg-[#d1d5db]',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-4' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[10px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">
        {children}
      </h3>
      {action}
    </div>
  )
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1',
        className ?? 'bg-[#f9fafb] text-[#6b7280] ring-[rgba(0,0,0,0.1)]',
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(0,0,0,0.1)] bg-[#f9fafb] px-4 py-8 text-center">
      <p className="text-sm font-semibold text-[#1f2937]">{title}</p>
      <p className="mt-1 text-xs text-[#6b7280]">{hint}</p>
    </div>
  )
}
