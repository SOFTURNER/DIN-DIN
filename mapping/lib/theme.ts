import type { ActorKind, EventMode, PilotCost } from '../types'

/** Saturated enough to hold up as dots on the light positron basemap. */
export const KIND_META: Record<ActorKind, { label: string; plural: string; color: string; blurb: string }> = {
  founder: {
    label: 'Impact founder',
    plural: 'Impact founders',
    color: '#db2777',
    blurb: 'Ventures looking for a pilot',
  },
  pilotHost: {
    label: 'Pilot host',
    plural: 'Pilot hosts',
    color: '#059669',
    blurb: 'Corporates, cities and utilities that will host a pilot',
  },
  testbed: {
    label: 'Testbed',
    plural: 'Testbeds',
    color: '#0284c7',
    blurb: 'Living labs, demo sites and shared facilities',
  },
  funder: {
    label: 'Funder',
    plural: 'Funders',
    color: '#d97706',
    blurb: 'Grants and catalytic capital for pilot costs',
  },
  enabler: {
    label: 'Enabler',
    plural: 'Enablers',
    color: '#7c3aed',
    blurb: 'Accelerators, hubs and cluster organisations',
  },
}

export const PILOT_COST_META: Record<PilotCost, { label: string; short: string; tone: string }> = {
  free: {
    label: 'No cost to the founder',
    short: 'Free',
    tone: 'bg-green-50 text-green-700 ring-green-600/20',
  },
  inKind: {
    label: 'In-kind: site, data or staff time',
    short: 'In-kind',
    tone: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  },
  revenueShare: {
    label: 'Revenue share on success',
    short: 'Rev-share',
    tone: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  paid: {
    label: 'Host pays the venture',
    short: 'Host pays',
    tone: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  },
}

/** The two terms a founder with no cash can actually accept. */
export const NO_CASH_COSTS: PilotCost[] = ['free', 'inKind']

export const EVENT_MODE_META: Record<EventMode, { label: string; color: string }> = {
  virtual: { label: 'Virtual', color: '#9333ea' },
  physical: { label: 'In person', color: '#ea580c' },
  hybrid: { label: 'Hybrid', color: '#0891b2' },
}
