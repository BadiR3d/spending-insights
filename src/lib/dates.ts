import type { DateRange, Period } from '../features/spending/types';
export const DEMO_TODAY = '2026-10-17';
export const MOCKS_ENABLED = import.meta.env.VITE_ENABLE_MOCKS !== 'false';
const calendarFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Johannesburg',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const shortFormatter = new Intl.DateTimeFormat('en-ZA', {
  timeZone: 'Africa/Johannesburg',
  day: 'numeric',
  month: 'short',
});
export const today = () =>
  MOCKS_ENABLED ? DEMO_TODAY : calendarFormatter.format(new Date());
export function isDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function shiftDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function periodRange(period: Period, endDate = today()): DateRange {
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period];
  return { startDate: shiftDays(endDate, 1 - days), endDate };
}
export function localDate(iso: string): string {
  return calendarFormatter.format(new Date(iso));
}
export function shortDate(value: string): string {
  return shortFormatter.format(
    new Date(value.length === 10 ? `${value}T12:00:00Z` : value),
  );
}
export function rangeLabel(range: DateRange): string {
  return `${shortDate(range.startDate)} ${range.startDate.slice(0, 4)} – ${shortDate(range.endDate)} ${range.endDate.slice(0, 4)}`;
}
