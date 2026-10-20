import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QueryState } from '../../components/QueryState';
import { compactMoney, money } from '../../lib/format';
import { useTrends } from './queries';
import s from './Dashboard.module.css';
const monthLabel = (month: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`));
export function Trends({
  months,
  onMonthsChange,
}: {
  months: number;
  onMonthsChange: (months: number) => void;
}) {
  const query = useTrends(months);
  return (
    <section className={s.panel} aria-labelledby="trends-heading">
      <div className={s.sectionHead}>
        <div>
          <h2 id="trends-heading">The bigger picture</h2>
          <p>Monthly spending · current month is in progress</p>
        </div>
        <label className={s.selectLabel}>
          <span className={s.srOnly}>Trend period</span>
          <select
            value={months}
            onChange={(event) => onMonthsChange(Number(event.target.value))}
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
          </select>
        </label>
      </div>
      <QueryState query={query} label="spending trends">
        {(data) =>
          data.trends.length ? (
            <>
              <div
                className={s.chart}
                aria-label={`Spending over ${months} months. Exact values are available below.`}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart
                    accessibilityLayer
                    data={data.trends}
                    margin={{ top: 16, right: 14, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="spending-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#087c9a"
                          stopOpacity={0.17}
                        />
                        <stop
                          offset="100%"
                          stopColor="#087c9a"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 5"
                      vertical={false}
                      stroke="#e4eaed"
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={monthLabel}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#66757d' }}
                      minTickGap={30}
                      dy={8}
                    />
                    <YAxis
                      tickFormatter={compactMoney}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#66757d' }}
                      width={56}
                    />
                    <Tooltip
                      labelFormatter={(label) => monthLabel(String(label))}
                      formatter={(value) => [
                        money(Number(value)),
                        'Total spent',
                      ]}
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #dce5e9',
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalSpent"
                      stroke="#087c9a"
                      strokeWidth={2.5}
                      fill="url(#spending-fill)"
                      isAnimationActive={false}
                      dot={{
                        r: 3,
                        fill: '#087c9a',
                        stroke: 'white',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <details className={s.chartDetails}>
                <summary>View monthly figures</summary>
                <table className={s.dataTable}>
                  <caption className={s.srOnly}>
                    Monthly spending totals
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Month</th>
                      <th scope="col">Transactions</th>
                      <th scope="col">Total spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trends.map((item) => (
                      <tr key={item.month}>
                        <th scope="row">{monthLabel(item.month)}</th>
                        <td>{item.transactionCount}</td>
                        <td>{money(item.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <p className={s.empty}>No spending history is available yet.</p>
          )
        }
      </QueryState>
    </section>
  );
}
