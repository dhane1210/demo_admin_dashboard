import { format } from 'date-fns'

/**
 * Format a date string to a human-readable format.
 * Returns '—' for null/undefined/invalid dates.
 */
export function fmtDate(d: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!d) return '—'
  try {
    return format(new Date(d), fmt)
  } catch {
    return d
  }
}

/**
 * Format a date string with time included.
 */
export function fmtDateTime(d: string | null | undefined): string {
  return fmtDate(d, 'dd MMM yyyy HH:mm')
}
