/* ── Navigation ────────────────────────────────── */

import {
  FiGrid, FiPackage, FiSearch, FiCalendar,
  FiDollarSign, FiBell, FiUsers, FiMail,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

export interface NavItem {
  label: string
  icon: IconType
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: FiGrid, path: '/' },
  { label: 'Shipments', icon: FiPackage, path: '/shipments' },
  { label: 'Search', icon: FiSearch, path: '/search' },
  { label: 'Calendar', icon: FiCalendar, path: '/calendar' },
  { label: 'Pricing', icon: FiDollarSign, path: '/pricing' },
  { label: 'Alerts', icon: FiBell, path: '/alerts' },
  { label: 'Users', icon: FiUsers, path: '/users' },
  { label: 'Mail', icon: FiMail, path: '/mail' },
]

/* ── Page Title Mapping ───────────────────────── */

export const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/shipments': 'Shipments',
  '/search': 'Search',
  '/calendar': 'Calendar',
  '/pricing': 'Pricing',
  '/alerts': 'Alerts',
  '/users': 'Users',
}

/* ── Calendar Event-Type Colors ───────────────── */

export const CALENDAR_EVENT_COLORS: Record<string, string> = {
  ETD: '#6366f1',
  ETA: '#60a5fa',
  CUTOFF: '#f87171',
  DELIVERY: '#4ade80',
  CUSTOM: '#818cf8',
  SHIPMENT_ETD: '#6366f1',
  SHIPMENT_ETA: '#60a5fa',
  SHIPMENT_ATA: '#4ade80',
}

/* ── Calendar ─────────────────────────────────── */

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/* ── Auth ──────────────────────────────────────── */

export const AUTH_TOKEN_KEY = 'auth_token'
