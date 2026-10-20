import { DEMO_TODAY, localDate, periodRange, shiftDays } from '../lib/dates';
import type {
  Category,
  CategorySpending,
  Goal,
  Period,
  Transaction,
} from '../features/spending/types';
export const categories: Category[] = [
  { name: 'Groceries', color: '#087c9a', icon: 'shopping-cart' },
  { name: 'Shopping', color: '#6e67ae', icon: 'shopping-bag' },
  { name: 'Transportation', color: '#cd7a42', icon: 'car' },
  { name: 'Dining', color: '#b65e7c', icon: 'utensils' },
  { name: 'Utilities', color: '#597eaa', icon: 'zap' },
  { name: 'Entertainment', color: '#53806a', icon: 'film' },
];
const merchants = [
  ['Woolworths Food', 'Pick n Pay', 'Checkers', 'SPAR'],
  ['Takealot', 'Mr Price', 'Clicks', 'H&M'],
  ['Uber', 'Shell', 'Gautrain', 'Engen'],
  ['Seattle Coffee Co.', 'Nando’s', 'Bootlegger Coffee', 'The Whippet'],
  ['City Power', 'Vodacom', 'Rain', 'Municipal services'],
  ['Netflix', 'Spotify', 'Ster-Kinekor', 'Exclusive Books'],
];
const baseCents = [32000, 39000, 18000, 12500, 42000, 11000];
let seed = 42;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
// A fixed seed and date make the assessment reproducible. All aggregations use cents.
export const transactions: Transaction[] = [];
for (let day = 0; day < 760; day++) {
  const date = shiftDays(DEMO_TODAY, -day);
  const count = random() > 0.7 ? 3 : random() > 0.4 ? 2 : 1;
  for (let n = 0; n < count; n++) {
    const index = Math.floor(random() * categories.length);
    const category = categories[index];
    const merchant = merchants[index][Math.floor(random() * 4)];
    const cents = Math.round(baseCents[index] * (0.3 + random() * 1.1));
    transactions.push({
      id: `txn_${day}_${n}`,
      date: `${date}T${String(8 + n * 4).padStart(2, '0')}:30:00+02:00`,
      merchant,
      category: category.name,
      amount: cents / 100,
      description: `${category.name} purchase at ${merchant}`,
      paymentMethod:
        index === 4 || merchant === 'Netflix' || merchant === 'Spotify'
          ? 'Debit order'
          : 'Debit card',
      icon: category.icon,
      categoryColor: category.color,
    });
  }
}
export const sumCents = (items: Transaction[]) =>
  items.reduce((sum, item) => sum + Math.round(item.amount * 100), 0);
export function inRange(startDate: string, endDate: string) {
  // Dates are interpreted as inclusive calendar days in Johannesburg.
  return transactions.filter((item) => {
    const date = localDate(item.date);
    return date >= startDate && date <= endDate;
  });
}
export function categoryTotals(items: Transaction[]): CategorySpending[] {
  const total = sumCents(items);
  return categories
    .map((category) => {
      const rows = items.filter((item) => item.category === category.name);
      const cents = sumCents(rows);
      return {
        ...category,
        amount: cents / 100,
        transactionCount: rows.length,
        percentage: total ? Math.round((cents / total) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
export function summary(period: Period) {
  const range = periodRange(period, DEMO_TODAY);
  const days =
    Math.round(
      (Date.parse(range.endDate) - Date.parse(range.startDate)) / 86400000,
    ) + 1;
  const current = inRange(range.startDate, range.endDate);
  const previous = inRange(
    shiftDays(range.startDate, -days),
    shiftDays(range.startDate, -1),
  );
  const total = sumCents(current);
  const previousTotal = sumCents(previous);
  const change = (now: number, before: number) =>
    before ? Math.round(((now - before) / before) * 1000) / 10 : null;
  return {
    period,
    totalSpent: total / 100,
    transactionCount: current.length,
    averageTransaction: current.length
      ? Math.round(total / current.length) / 100
      : 0,
    topCategory: categoryTotals(current)[0]?.name || '',
    comparedToPrevious: {
      spentChange: change(total, previousTotal),
      transactionChange: change(current.length, previous.length),
    },
  };
}
export function trends(months: number) {
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(`${DEMO_TODAY}T12:00:00Z`);
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - (months - 1 - i));
    const month = date.toISOString().slice(0, 7);
    const items = transactions.filter((item) =>
      localDate(item.date).startsWith(month),
    );
    const cents = sumCents(items);
    return {
      month,
      totalSpent: cents / 100,
      transactionCount: items.length,
      averageTransaction: items.length
        ? Math.round(cents / items.length) / 100
        : 0,
    };
  });
}
export function goals(): Goal[] {
  const items = inRange(`${DEMO_TODAY.slice(0, 7)}-01`, DEMO_TODAY);
  const totals = categoryTotals(items);
  return [
    { category: 'Groceries', budget: 3500 },
    { category: 'Dining', budget: 600 },
    { category: 'Entertainment', budget: 1000 },
  ].map((entry, i) => {
    const currentSpent = totals.find(
      (item) => item.name === entry.category,
    )!.amount;
    const percentageUsed =
      Math.round((currentSpent / entry.budget) * 10000) / 100;
    return {
      id: `goal_${i}`,
      category: entry.category,
      monthlyBudget: entry.budget,
      currentSpent,
      percentageUsed,
      daysRemaining: 14,
      status:
        percentageUsed > 100
          ? 'exceeded'
          : percentageUsed >= 80
            ? 'warning'
            : 'on_track',
    };
  });
}
