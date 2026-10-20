export function money(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}
export const compactMoney = (value: number) =>
  `R${new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
export const number = (value: number) =>
  new Intl.NumberFormat('en-ZA').format(value);
