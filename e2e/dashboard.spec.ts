import { test, expect } from '@playwright/test';
test('overview, category filters, pagination and history remain coherent', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('total-spending')).toBeVisible();
  const initial = await page.getByTestId('total-spending').textContent();
  await page.getByRole('button', { name: 'Last 90 days', exact: true }).click();
  await expect(page).toHaveURL(/period=90d/);
  await expect(page.getByTestId('total-spending')).not.toHaveText(initial!);
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await page
    .getByRole('button', { name: 'Filter transactions by Groceries' })
    .click();
  await expect(page).toHaveURL(/category=Groceries/);
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page.getByLabel('Transaction category')).toHaveValue(
    'Groceries',
  );
  await page.getByLabel('Sort transactions').selectOption('amount_desc');
  await expect(
    page.getByRole('table', {
      name: 'Transactions for the selected date range and category',
    }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Transaction category')).toHaveValue(
    'Groceries',
  );
  await expect(page.getByLabel('Sort transactions')).toHaveValue('amount_desc');
  await page.getByLabel('Transaction category').selectOption('Dining');
  await page.goBack();
  await expect(page.getByLabel('Transaction category')).toHaveValue(
    'Groceries',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test('custom dates show empty states without changing overview and can reset', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('total-spending')).toBeVisible();
  const total = await page.getByTestId('total-spending').textContent();
  await page.getByText('Custom date range', { exact: true }).click();
  await page.getByLabel('Start date').fill('2030-01-01');
  await page.getByLabel('End date').fill('2030-01-31');
  await page.getByRole('button', { name: 'Apply dates' }).click();
  await expect(page.getByText('No transactions found.')).toBeVisible();
  await expect(
    page.getByText('No spending in this date range. Try a different period.'),
  ).toBeVisible();
  await expect(page.getByTestId('total-spending')).toHaveText(total!);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(
    page.getByRole('table', {
      name: 'Transactions for the selected date range and category',
    }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/from=/);
});
