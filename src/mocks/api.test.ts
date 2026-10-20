import { describe, expect, it } from 'vitest';
import { getJson, ApiError } from '../lib/api';
import { DEMO_TODAY, periodRange } from '../lib/dates';
import type {
  CategoriesResponse,
  SpendingSummary,
  TransactionsResponse,
  TrendsResponse,
} from '../features/spending/types';
import { categoryTotals, inRange, sumCents } from './data';
const root = '/api/customers/12345';
describe('mock API consistency and contract', () => {
  it('reconciles category totals, counts and summary against the ledger', async () => {
    const range = periodRange('30d', DEMO_TODAY);
    const ledger = inRange(range.startDate, range.endDate);
    const [summary, categories] = await Promise.all([
      getJson<SpendingSummary>(`${root}/spending/summary`, { period: '30d' }),
      getJson<CategoriesResponse>(`${root}/spending/categories`, {
        period: '30d',
      }),
    ]);
    expect(Math.round(summary.totalSpent * 100)).toBe(sumCents(ledger));
    expect(summary.transactionCount).toBe(ledger.length);
    expect(
      categories.categories.reduce(
        (sum, item) => sum + Math.round(item.amount * 100),
        0,
      ),
    ).toBe(sumCents(ledger));
    expect(
      categories.categories.reduce(
        (sum, item) => sum + item.transactionCount,
        0,
      ),
    ).toBe(ledger.length);
  });
  it('filters, sorts and paginates before returning transactions', async () => {
    const filters = {
      ...periodRange('90d', DEMO_TODAY),
      category: 'Groceries',
      sortBy: 'amount_desc',
      limit: 3,
    };
    const first = await getJson<TransactionsResponse>(
      `${root}/transactions`,
      filters,
    );
    const second = await getJson<TransactionsResponse>(`${root}/transactions`, {
      ...filters,
      offset: 3,
    });
    expect(first.transactions).toHaveLength(3);
    expect(
      first.transactions.every((item) => item.category === 'Groceries'),
    ).toBe(true);
    expect(first.transactions[0].amount).toBeGreaterThanOrEqual(
      first.transactions[1].amount,
    );
    expect(first.transactions[2].amount).toBeGreaterThanOrEqual(
      second.transactions[0].amount,
    );
    expect(
      new Set(
        [...first.transactions, ...second.transactions].map((item) => item.id),
      ).size,
    ).toBe(6);
    expect(second.pagination.offset).toBe(3);
  });
  it('returns empty results for a range without data and rejects invalid dates', async () => {
    const result = await getJson<TransactionsResponse>(`${root}/transactions`, {
      startDate: '2030-01-01',
      endDate: '2030-01-31',
    });
    expect(result.transactions).toEqual([]);
    expect(result.pagination.total).toBe(0);
    await expect(
      getJson(`${root}/transactions`, {
        startDate: '2026-02-30',
        endDate: '2026-03-01',
      }),
    ).rejects.toEqual(new ApiError(400));
  });
  it('returns the requested number of months and reconciles current month', async () => {
    const result = await getJson<TrendsResponse>(`${root}/spending/trends`, {
      months: 24,
    });
    expect(result.trends).toHaveLength(24);
    expect(result.trends.at(-1)?.totalSpent).toBe(
      sumCents(inRange('2026-10-01', DEMO_TODAY)) / 100,
    );
    expect(categoryTotals([]).every((item) => item.percentage === 0)).toBe(
      true,
    );
  });
});
