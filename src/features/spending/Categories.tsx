import type { CSSProperties } from 'react';
import { QueryState } from '../../components/QueryState';
import { money } from '../../lib/format';
import { rangeLabel } from '../../lib/dates';
import { useCategories } from './queries';
import type { DashboardFilters } from './types';
import s from './Dashboard.module.css';
export function Categories({
  filters,
  onCategoryChange,
}: {
  filters: DashboardFilters;
  onCategoryChange: (category: string) => void;
}) {
  const query = useCategories(filters);
  return (
    <section
      className={`${s.panel} ${s.categoriesPanel}`}
      aria-labelledby="categories-heading"
    >
      <div className={s.sectionHead}>
        <div>
          <h3 id="categories-heading">Where it’s going</h3>
          <p>Select a category to explore its payments</p>
        </div>
      </div>
      <QueryState query={query} label="categories">
        {(data) => (
          <>
            <div className={s.categoryTotal}>
              <strong>{money(data.totalAmount)}</strong>
              <span>{rangeLabel(data.dateRange)}</span>
            </div>
            {data.totalAmount > 0 ? (
              <div className={s.categories}>
                {data.categories.map((category) => (
                  <button
                    key={category.name}
                    className={`${s.categoryRow} ${filters.category === category.name ? s.categorySelected : ''}`}
                    onClick={() =>
                      onCategoryChange(
                        filters.category === category.name ? '' : category.name,
                      )
                    }
                    aria-pressed={filters.category === category.name}
                    aria-label={`Filter transactions by ${category.name}`}
                    style={
                      { '--category-color': category.color } as CSSProperties
                    }
                  >
                    <span className={s.categoryRowTop}>
                      <span>{category.name}</span>
                      <strong>{money(category.amount)}</strong>
                    </span>
                    <span className={s.barTrack} aria-hidden="true">
                      <span
                        style={{
                          width: `${Math.min(100, category.percentage)}%`,
                        }}
                      />
                    </span>
                    <span className={s.categoryRowBottom}>
                      <span>{category.transactionCount} payments</span>
                      <span>{category.percentage}%</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className={s.empty}>
                No spending in this date range. Try a different period.
              </p>
            )}
            <p className={s.panelNote}>
              All categories stay visible while you filter transactions.
            </p>
          </>
        )}
      </QueryState>
    </section>
  );
}
