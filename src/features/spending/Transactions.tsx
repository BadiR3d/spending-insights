import { QueryState } from '../../components/QueryState';
import { shortDate } from '../../lib/dates';
import { money, number } from '../../lib/format';
import { useTransactions } from './queries';
import type { Category, DashboardFilters } from './types';
import s from './Dashboard.module.css';
export function Transactions({
  filters,
  categories,
  filtersReady,
  onUpdate,
  onReset,
}: {
  filters: DashboardFilters;
  categories: Category[];
  filtersReady: boolean;
  onUpdate: (patch: Record<string, string | number | null>) => void;
  onReset: () => void;
}) {
  const query = useTransactions(filters);
  return (
    <section
      className={`${s.panel} ${s.transactionsPanel}`}
      aria-labelledby="transactions-heading"
      id="transactions"
    >
      <div className={s.sectionHead}>
        <div>
          <h3 id="transactions-heading">Your transactions</h3>
          <p>{filters.category || 'All categories'} · amounts in ZAR</p>
        </div>
        {filters.category && (
          <button
            className={s.textButton}
            onClick={() => onUpdate({ category: null })}
          >
            Clear category ×
          </button>
        )}
      </div>
      <div className={s.transactionFilters}>
        <label>
          <span>Category</span>
          <select
            aria-label="Transaction category"
            value={filters.category}
            disabled={!filtersReady}
            onChange={(event) => onUpdate({ category: event.target.value })}
          >
            <option value="">All categories</option>
            {filters.category &&
              !categories.some(
                (category) => category.name === filters.category,
              ) && <option value={filters.category}>{filters.category}</option>}
            {categories.map((category) => (
              <option key={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select
            aria-label="Sort transactions"
            value={filters.sortBy}
            onChange={(event) => onUpdate({ sort: event.target.value })}
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </label>
      </div>
      <QueryState query={query} label="transactions">
        {(data) => (
          <>
            {data.transactions.length ? (
              <div className={s.tableWrap}>
                <table className={s.transactionTable}>
                  <caption className={s.srOnly}>
                    Transactions for the selected date range and category
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Merchant</th>
                      <th scope="col">Date</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <div className={s.merchantCell}>
                            <span
                              className={s.merchantAvatar}
                              aria-hidden="true"
                            >
                              {transaction.merchant
                                .split(' ')
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                            <span>
                              <strong>{transaction.merchant}</strong>
                              <span className={s.transactionMeta}>
                                {transaction.category}{' '}
                                <span aria-hidden="true">·</span>{' '}
                                {transaction.paymentMethod}
                              </span>
                              <time
                                className={s.mobileDate}
                                dateTime={transaction.date}
                              >
                                {shortDate(transaction.date)}{' '}
                                {transaction.date.slice(0, 4)}
                              </time>
                            </span>
                          </div>
                        </td>
                        <td>
                          <time dateTime={transaction.date}>
                            {shortDate(transaction.date)}
                            <span className={s.year}>
                              {transaction.date.slice(0, 4)}
                            </span>
                          </time>
                        </td>
                        <td className={s.amountCell}>
                          {money(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={s.empty}>
                <strong>
                  {data.pagination.total > 0
                    ? 'There are no transactions on this page.'
                    : 'No transactions found.'}
                </strong>
                <p>
                  {data.pagination.total > 0
                    ? 'Return to the first page to see your payments.'
                    : 'Try another category or a wider date range.'}
                </p>
                <button
                  className={s.secondaryButton}
                  onClick={
                    data.pagination.total > 0
                      ? () => onUpdate({ page: 1 })
                      : onReset
                  }
                >
                  {data.pagination.total > 0
                    ? 'Go to first page'
                    : 'Reset filters'}
                </button>
              </div>
            )}
            <div className={s.pagination}>
              <p role="status">
                {data.transactions.length
                  ? `${number(data.pagination.offset + 1)}–${number(data.pagination.offset + data.transactions.length)} of ${number(data.pagination.total)} payments`
                  : `${number(data.pagination.total)} payments`}
              </p>
              <div>
                <button
                  className={s.pageButton}
                  disabled={filters.page <= 1}
                  aria-label="Previous page"
                  onClick={() => onUpdate({ page: filters.page - 1 })}
                >
                  ←
                </button>
                <span>Page {filters.page}</span>
                <button
                  className={s.pageButton}
                  disabled={!data.pagination.hasMore}
                  aria-label="Next page"
                  onClick={() => onUpdate({ page: filters.page + 1 })}
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </QueryState>
    </section>
  );
}
