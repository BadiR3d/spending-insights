import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import s from '../features/spending/Dashboard.module.css';
export function QueryState<T>({
  query,
  label,
  children,
}: {
  query: UseQueryResult<T, Error>;
  label: string;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending)
    return (
      <div className={s.skeleton} role="status" aria-label={`Loading ${label}`}>
        <span />
        <span />
        <span />
        <span className={s.srOnly}>Loading {label}…</span>
      </div>
    );
  if (query.isError && query.data === undefined)
    return (
      <div className={s.errorState} role="alert">
        <strong>We couldn’t load {label}.</strong>
        <p>Please try again in a moment.</p>
        <button
          className={s.secondaryButton}
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {query.isFetching ? 'Retrying…' : `Retry ${label}`}
        </button>
      </div>
    );
  if (query.data === undefined) return null;
  return (
    <div aria-busy={query.isFetching}>
      {query.isFetching && (
        <p className={s.updateStatus} role="status">
          Updating {label}…
        </p>
      )}
      {query.isError && (
        <p className={s.inlineError} role="alert">
          Refresh failed. Showing the last loaded data.{' '}
          <button onClick={() => void query.refetch()}>Retry {label}</button>
        </p>
      )}
      {children(query.data)}
    </div>
  );
}
