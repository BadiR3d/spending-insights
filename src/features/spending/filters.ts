import type { DashboardFilters, Period, SortOrder } from './types';
import { isDate } from '../../lib/dates';
export const periods: Period[] = ['7d', '30d', '90d', '1y'];
export const sorts: SortOrder[] = [
  'date_desc',
  'date_asc',
  'amount_desc',
  'amount_asc',
];
export const PAGE_SIZE = 8;
export function parseFilters(params: URLSearchParams): DashboardFilters {
  const period = params.get('period') as Period;
  const sortBy = params.get('sort') as SortOrder;
  const start = params.get('from') || '';
  const end = params.get('to') || '';
  const validRange = isDate(start) && isDate(end) && start <= end;
  const page = Number(params.get('page') || 1);
  const months = Number(params.get('months') || 6);
  return {
    period: periods.includes(period) ? period : '30d',
    sortBy: sorts.includes(sortBy) ? sortBy : 'date_desc',
    startDate: validRange ? start : '',
    endDate: validRange ? end : '',
    category: (params.get('category') || '').slice(0, 100),
    page: Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1,
    months: [6, 12, 24].includes(months) ? months : 6,
  };
}
export function updateParams(
  current: URLSearchParams,
  patch: Record<string, string | number | null>,
): URLSearchParams {
  const next = new URLSearchParams(current);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === '') next.delete(key);
    else next.set(key, String(value));
  });
  if (['period', 'from', 'to', 'category', 'sort'].some((key) => key in patch))
    next.delete('page');
  if ('period' in patch) {
    next.delete('from');
    next.delete('to');
  }
  return next;
}
