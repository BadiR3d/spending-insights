export type Period = '7d' | '30d' | '90d' | '1y';
export type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
export interface DateRange {
  startDate: string;
  endDate: string;
}
export interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  joinDate: string;
  accountType: string;
  totalSpent: number;
  currency: string;
}
export interface SpendingSummary {
  period: Period;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  comparedToPrevious: {
    spentChange: number | null;
    transactionChange: number | null;
  };
}
export interface Category {
  name: string;
  color: string;
  icon: string;
}
export interface CategorySpending extends Category {
  amount: number;
  percentage: number;
  transactionCount: number;
}
export interface CategoriesResponse {
  dateRange: DateRange;
  totalAmount: number;
  categories: CategorySpending[];
}
export interface Trend {
  month: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
}
export interface TrendsResponse {
  trends: Trend[];
}
export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  icon: string;
  categoryColor: string;
}
export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
export interface Goal {
  id: string;
  category: string;
  monthlyBudget: number;
  currentSpent: number;
  percentageUsed: number;
  daysRemaining: number;
  status: 'on_track' | 'warning' | 'exceeded';
}
export interface GoalsResponse {
  goals: Goal[];
}
export interface FiltersResponse {
  categories: Category[];
  dateRangePresets: { label: string; value: Period }[];
}
export interface DashboardFilters {
  period: Period;
  startDate: string;
  endDate: string;
  category: string;
  sortBy: SortOrder;
  page: number;
  months: number;
}
