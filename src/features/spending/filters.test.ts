import { describe, expect, it } from 'vitest';
import { parseFilters, updateParams } from './filters';
import { isDate, localDate, periodRange } from '../../lib/dates';
describe('filter contract', () => {
  it('falls back safely for invalid URL parameters', () => {
    expect(
      parseFilters(
        new URLSearchParams(
          'period=bad&sort=bad&page=-2&months=99&from=2026-02-30&to=2026-03-01',
        ),
      ),
    ).toEqual({
      period: '30d',
      sortBy: 'date_desc',
      page: 1,
      months: 6,
      startDate: '',
      endDate: '',
      category: '',
    });
  });
  it('resets pagination atomically when category or sorting changes', () => {
    const current = new URLSearchParams('page=4&period=90d&category=Dining');
    const next = updateParams(current, { category: 'Groceries' });
    expect(next.get('page')).toBeNull();
    expect(next.get('category')).toBe('Groceries');
    expect(next.get('period')).toBe('90d');
    expect(current.get('page')).toBe('4');
  });
  it('clears custom dates when changing overview period', () => {
    const next = updateParams(
      new URLSearchParams('from=2026-01-01&to=2026-01-31&page=3'),
      { period: '7d' },
    );
    expect(next.toString()).toBe('period=7d');
  });
  it('retains the other filters on pagination', () => {
    expect(
      updateParams(new URLSearchParams('category=Dining&sort=amount_asc'), {
        page: 2,
      }).toString(),
    ).toBe('category=Dining&sort=amount_asc&page=2');
  });
  it('rejects reversed and partial date ranges', () => {
    expect(
      parseFilters(new URLSearchParams('from=2026-05-02&to=2026-05-01'))
        .startDate,
    ).toBe('');
    expect(parseFilters(new URLSearchParams('from=2026-05-02')).startDate).toBe(
      '',
    );
    expect(isDate('2026-02-29')).toBe(false);
    expect(isDate('2024-02-29')).toBe(true);
  });
  it('uses inclusive Johannesburg days, including timezone boundaries', () => {
    expect(periodRange('7d', '2026-10-17')).toEqual({
      startDate: '2026-10-11',
      endDate: '2026-10-17',
    });
    expect(localDate('2026-10-16T23:30:00Z')).toBe('2026-10-17');
  });
});
