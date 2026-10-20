import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { DateFilter } from './DateFilter';
import { Overview } from './Overview';
import { server } from '../../mocks/server';
import { money } from '../../lib/format';
import { summary } from '../../mocks/data';
describe('user-facing interactions', () => {
  it('shows date errors and only applies a valid range', async () => {
    const user = userEvent.setup();
    const apply = vi.fn();
    render(
      <DateFilter startDate="" endDate="" onApply={apply} onClear={vi.fn()} />,
    );
    await user.click(screen.getByText('Custom date range'));
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a valid start and end date',
    );
    expect(apply).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Start date'), '2026-10-17');
    await user.type(screen.getByLabelText('End date'), '2026-10-01');
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));
    expect(screen.getByRole('alert')).toHaveTextContent('on or after');
    await user.clear(screen.getByLabelText('End date'));
    await user.type(screen.getByLabelText('End date'), '2026-10-17');
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));
    expect(apply).toHaveBeenCalledWith('2026-10-17', '2026-10-17');
  });
  it('recovers a failed summary request through its retry button', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        '*/api/customers/:id/spending/summary',
        () => HttpResponse.json({}, { status: 503 }),
        { once: true },
      ),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={client}>
        <Overview period="30d" />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'couldn’t load spending summary',
    );
    await user.click(
      screen.getByRole('button', { name: 'Retry spending summary' }),
    );
    expect((await screen.findByTestId('total-spending')).textContent).toBe(
      money(summary('30d').totalSpent),
    );
    client.clear();
  });
});
