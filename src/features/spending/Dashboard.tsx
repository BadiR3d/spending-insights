import { useSearchParams } from 'react-router';
import { parseFilters, updateParams } from './filters';
import { useFilters, useProfile } from './queries';
import { MOCKS_ENABLED, periodRange, rangeLabel, today } from '../../lib/dates';
import { Overview } from './Overview';
import { Trends } from './Trends';
import { Goals } from './Goals';
import { Categories } from './Categories';
import { Transactions } from './Transactions';
import { DateFilter } from './DateFilter';
import s from './Dashboard.module.css';
export function Dashboard() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const profile = useProfile();
  const options = useFilters();
  const update = (patch: Record<string, string | number | null>) =>
    setParams((current) => updateParams(current, patch), {
      preventScrollReset: true,
    });
  const reset = () =>
    update({ from: null, to: null, category: null, sort: null, page: null });
  const range = filters.startDate
    ? { startDate: filters.startDate, endDate: filters.endDate }
    : periodRange(filters.period);
  const name = profile.data?.name.split(' ')[0];
  return (
    <>
      <a className={s.skipLink} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <div className={s.headerInner}>
          <a
            className={s.brand}
            href="#main"
            aria-label="Spending insights home"
          >
            <span className={s.brandMark} aria-hidden="true">
              c
            </span>
            <span>
              capitec<span className={s.brandSub}>ASSESSMENT CONCEPT</span>
            </span>
          </a>
          <nav aria-label="Dashboard sections">
            <a className={s.activeNav} href="#main">
              Overview
            </a>
            <a href="#explorer">Spending</a>
            <a href="#budgets">Budgets</a>
          </nav>
          <div className={s.profile}>
            <span className={s.profileAvatar} aria-hidden="true">
              {profile.data?.name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('') || 'JD'}
            </span>
            <span>
              {profile.data?.name || 'Your account'}
              <small>
                {profile.data?.accountType
                  ? `${profile.data.accountType} account`
                  : 'Spending insights'}
              </small>
            </span>
          </div>
        </div>
      </header>
      <main id="main" className={s.main}>
        <div className={s.pageIntro}>
          <div>
            <p className={s.eyebrow}>
              {name
                ? `A clearer picture, ${name}.`
                : 'A clearer picture of your money.'}
            </p>
            <h1>Make sense of your spending.</h1>
            <p>See where your money goes. Make room for what matters.</p>
          </div>
          <div className={s.demoLabel}>
            <span className={s.demoDot} />
            {MOCKS_ENABLED ? 'Demo account' : 'Your spending'}
            <small>
              As at{' '}
              {new Intl.DateTimeFormat('en-ZA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(`${today()}T12:00:00Z`))}
            </small>
          </div>
        </div>
        {profile.isError && (
          <p className={s.inlineError} role="alert">
            Account details couldn’t load.{' '}
            <button onClick={() => void profile.refetch()}>
              Retry profile
            </button>
          </p>
        )}
        <div className={s.overviewHeading}>
          <h2>Your overview</h2>
          <div
            className={s.periodGroup}
            role="group"
            aria-label="Overview period"
          >
            {(
              options.data?.dateRangePresets || [
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'Last 90 days', value: '90d' },
                { label: 'Last year', value: '1y' },
              ]
            ).map((option) => (
              <button
                key={option.value}
                aria-pressed={filters.period === option.value}
                onClick={() => update({ period: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <Overview period={filters.period} />
        <div className={s.insightsGrid}>
          <Trends
            months={filters.months}
            onMonthsChange={(months) => update({ months })}
          />
          <Goals />
        </div>
        <section
          id="explorer"
          className={s.explorer}
          aria-labelledby="explorer-heading"
        >
          <div className={s.explorerHeading}>
            <div>
              <p className={s.eyebrow}>THE DETAILS THAT ADD UP</p>
              <h2 id="explorer-heading">Explore your spending</h2>
              <p>
                {rangeLabel(range)}{' '}
                <span className={s.scopeTag}>
                  {filters.startDate ? 'Custom range' : 'Overview period'}
                </span>
              </p>
            </div>
            <div className={s.explorerActions}>
              {filters.startDate && (
                <button
                  className={s.textButton}
                  onClick={() => update({ from: null, to: null })}
                >
                  Clear dates
                </button>
              )}
              <DateFilter
                key={`${filters.startDate}-${filters.endDate}-${filters.period}`}
                startDate={filters.startDate}
                endDate={filters.endDate}
                onApply={(from, to) => update({ from, to })}
                onClear={() => update({ from: null, to: null })}
              />
            </div>
          </div>
          {filters.startDate && (
            <p className={s.scopeNote}>
              Custom dates apply to categories and transactions. Your overview,
              monthly trend and budgets keep their own periods.
            </p>
          )}
          {options.isError && (
            <p className={s.inlineError} role="alert">
              Category options couldn’t load.{' '}
              <button onClick={() => void options.refetch()}>
                Retry filters
              </button>
            </p>
          )}
          <div className={s.explorerGrid}>
            <Categories
              filters={filters}
              onCategoryChange={(category) => update({ category })}
            />
            <Transactions
              filters={filters}
              categories={options.data?.categories || []}
              filtersReady={!!options.data}
              onUpdate={update}
              onReset={reset}
            />
          </div>
        </section>
        <footer className={s.footer}>
          <span>Small insights. More possibilities.</span>
          <span>
            {MOCKS_ENABLED
              ? 'Assessment demonstration · Sample data only'
              : 'Spending insights'}
            <br />
            Amounts in South African rand · Dates in Johannesburg time
          </span>
        </footer>
      </main>
    </>
  );
}
