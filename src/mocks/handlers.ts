import { delay, http, HttpResponse } from 'msw';
import {
  categories,
  categoryTotals,
  goals,
  inRange,
  sumCents,
  summary,
  transactions,
  trends,
} from './data';
import { DEMO_TODAY, isDate, periodRange } from '../lib/dates';
import { periods, sorts } from '../features/spending/filters';
import type { Period, SortOrder } from '../features/spending/types';
const root = '*/api/customers/:customerId';
const presets = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
];
const getPeriod = (url: URL): Period =>
  periods.includes(url.searchParams.get('period') as Period)
    ? (url.searchParams.get('period') as Period)
    : '30d';
function getRange(url: URL) {
  const startDate = url.searchParams.get('startDate') || '';
  const endDate = url.searchParams.get('endDate') || '';
  if (startDate || endDate) {
    if (!isDate(startDate) || !isDate(endDate) || startDate > endDate)
      return null;
    return { startDate, endDate };
  }
  return periodRange(getPeriod(url), DEMO_TODAY);
}
async function respond(data: Record<string, unknown>) {
  await delay(180);
  return HttpResponse.json(data);
}
export const handlers = [
  http.get(`${root}/profile`, () =>
    respond({
      customerId: '12345',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2023-01-15',
      accountType: 'premium',
      totalSpent: sumCents(transactions) / 100,
      currency: 'ZAR',
    }),
  ),
  http.get(`${root}/spending/summary`, ({ request }) =>
    respond(summary(getPeriod(new URL(request.url)))),
  ),
  http.get(`${root}/spending/categories`, ({ request }) => {
    const range = getRange(new URL(request.url));
    if (!range)
      return HttpResponse.json(
        { message: 'Invalid date range' },
        { status: 400 },
      );
    const items = inRange(range.startDate, range.endDate);
    return respond({
      dateRange: range,
      totalAmount: sumCents(items) / 100,
      categories: categoryTotals(items),
    });
  }),
  http.get(`${root}/spending/trends`, ({ request }) => {
    const raw = Number(new URL(request.url).searchParams.get('months') || 12);
    const months = Number.isInteger(raw) ? Math.max(1, Math.min(24, raw)) : 12;
    return respond({ trends: trends(months) });
  }),
  http.get(`${root}/transactions`, ({ request }) => {
    const url = new URL(request.url);
    const range = getRange(url);
    if (!range)
      return HttpResponse.json(
        { message: 'Invalid date range' },
        { status: 400 },
      );
    const category = url.searchParams.get('category');
    const rawLimit = Number(url.searchParams.get('limit') || 20);
    const rawOffset = Number(url.searchParams.get('offset') || 0);
    const limit = Number.isInteger(rawLimit)
      ? Math.max(1, Math.min(100, rawLimit))
      : 20;
    const offset = Number.isInteger(rawOffset) ? Math.max(0, rawOffset) : 0;
    const requestedSort = url.searchParams.get('sortBy') as SortOrder;
    const sortBy = sorts.includes(requestedSort) ? requestedSort : 'date_desc';
    // Without date filters the transaction endpoint returns all available history.
    let items =
      url.searchParams.has('startDate') || url.searchParams.has('endDate')
        ? inRange(range.startDate, range.endDate)
        : [...transactions];
    if (category) items = items.filter((item) => item.category === category);
    items.sort((a, b) => {
      const difference = sortBy.startsWith('amount')
        ? a.amount - b.amount
        : Date.parse(a.date) - Date.parse(b.date);
      return (
        (sortBy.endsWith('desc') ? -difference : difference) ||
        a.id.localeCompare(b.id)
      );
    });
    return respond({
      transactions: items.slice(offset, offset + limit),
      pagination: {
        total: items.length,
        limit,
        offset,
        hasMore: offset + limit < items.length,
      },
    });
  }),
  http.get(`${root}/goals`, () => respond({ goals: goals() })),
  http.get(`${root}/filters`, () =>
    respond({ categories, dateRangePresets: presets }),
  ),
];
