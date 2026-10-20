import { useQuery } from '@tanstack/react-query';
import { getJson } from '../../lib/api';
import { periodRange } from '../../lib/dates';
import { PAGE_SIZE } from './filters';
import type {
  CategoriesResponse,
  CustomerProfile,
  DashboardFilters,
  FiltersResponse,
  GoalsResponse,
  Period,
  SpendingSummary,
  TransactionsResponse,
  TrendsResponse,
} from './types';
const customerId = '12345';
const root = `/api/customers/${customerId}`;
function useCustomerQuery<T>(
  resource: string,
  params: Record<string, string | number | undefined> = {},
) {
  return useQuery({
    queryKey: ['customer', customerId, resource, params],
    queryFn: ({ signal }) => getJson<T>(`${root}/${resource}`, params, signal),
  });
}
export const useProfile = () => useCustomerQuery<CustomerProfile>('profile');
export const useSummary = (period: Period) =>
  useCustomerQuery<SpendingSummary>('spending/summary', { period });
export const useFilters = () => useCustomerQuery<FiltersResponse>('filters');
export const useGoals = () => useCustomerQuery<GoalsResponse>('goals');
export const useTrends = (months: number) =>
  useCustomerQuery<TrendsResponse>('spending/trends', { months });
export function useCategories(filters: DashboardFilters) {
  return useCustomerQuery<CategoriesResponse>(
    'spending/categories',
    filters.startDate
      ? { startDate: filters.startDate, endDate: filters.endDate }
      : { period: filters.period },
  );
}
export function useTransactions(filters: DashboardFilters) {
  const range = filters.startDate
    ? { startDate: filters.startDate, endDate: filters.endDate }
    : periodRange(filters.period);
  return useCustomerQuery<TransactionsResponse>('transactions', {
    ...range,
    category: filters.category,
    sortBy: filters.sortBy,
    limit: PAGE_SIZE,
    offset: (filters.page - 1) * PAGE_SIZE,
  });
}
