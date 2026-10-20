import { useState, type FormEvent } from 'react';
import { isDate } from '../../lib/dates';
import s from './Dashboard.module.css';
export function DateFilter({
  startDate,
  endDate,
  onApply,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
}) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isDate(start) || !isDate(end)) {
      setError('Choose a valid start and end date.');
      return;
    }
    if (start > end) {
      setError('The end date must be on or after the start date.');
      return;
    }
    setError('');
    onApply(start, end);
  }
  return (
    <details className={s.dateDetails}>
      <summary className={s.secondaryButton}>
        {startDate ? 'Edit date range' : 'Custom date range'}{' '}
        <span aria-hidden="true">⌄</span>
      </summary>
      <form className={s.dateForm} onSubmit={submit} noValidate>
        <div>
          <label htmlFor="start-date">Start date</label>
          <input
            id="start-date"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'date-error' : undefined}
          />
        </div>
        <div>
          <label htmlFor="end-date">End date</label>
          <input
            id="end-date"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'date-error' : undefined}
          />
        </div>
        <button className={s.primaryButton} type="submit">
          Apply dates
        </button>
        {startDate && (
          <button className={s.textButton} type="button" onClick={onClear}>
            Use overview period
          </button>
        )}
        {error && (
          <p id="date-error" className={s.inlineError} role="alert">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
