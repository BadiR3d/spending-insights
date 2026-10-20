import { QueryState } from '../../components/QueryState';
import { money, number } from '../../lib/format';
import { periodRange, rangeLabel } from '../../lib/dates';
import { useSummary } from './queries';
import type { Period } from './types';
import s from './Dashboard.module.css';
export function Overview({ period }: { period: Period }) {
  const query = useSummary(period);
  return (
    <section aria-label="Spending overview" className={s.overview}>
      <QueryState query={query} label="spending summary">
        {(data) => (
          <div className={s.metricGrid}>
            <div className={s.primaryMetric}>
              <span className={s.metricLabel}>Your total spending</span>
              <strong data-testid="total-spending" className={s.totalAmount}>
                {money(data.totalSpent)}
              </strong>
              <div className={s.comparison}>
                {data.comparedToPrevious.spentChange === null ? (
                  'No previous period to compare'
                ) : (
                  <>
                    <span className={s.changeBadge}>
                      {data.comparedToPrevious.spentChange > 0
                        ? '↗'
                        : data.comparedToPrevious.spentChange < 0
                          ? '↘'
                          : '→'}{' '}
                      {Math.abs(data.comparedToPrevious.spentChange)}%
                    </span>
                    <span>
                      {data.comparedToPrevious.spentChange >= 0
                        ? 'more'
                        : 'less'}{' '}
                      than the previous period
                    </span>
                  </>
                )}
              </div>
              <span className={s.metricDate}>
                {rangeLabel(periodRange(period))}
              </span>
            </div>
            <div className={s.secondaryMetrics}>
              <div className={s.metric}>
                <span className={s.metricLabel}>Transactions</span>
                <strong>{number(data.transactionCount)}</strong>
                <span className={s.muted}>Payments in this period</span>
              </div>
              <div className={s.metric}>
                <span className={s.metricLabel}>Average payment</span>
                <strong>{money(data.averageTransaction)}</strong>
                <span className={s.muted}>Per transaction</span>
              </div>
              <div className={s.metric}>
                <span className={s.metricLabel}>Top category</span>
                <strong className={s.categoryMetric}>
                  {data.topCategory || 'No spending yet'}
                </strong>
                <span className={s.muted}>Your biggest spending category</span>
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </section>
  );
}
