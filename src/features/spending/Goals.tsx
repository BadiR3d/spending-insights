import { QueryState } from '../../components/QueryState';
import { money } from '../../lib/format';
import { today } from '../../lib/dates';
import { useGoals } from './queries';
import s from './Dashboard.module.css';
export function Goals() {
  const query = useGoals();
  const month = new Intl.DateTimeFormat('en-ZA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${today()}T12:00:00Z`));
  return (
    <section className={s.panel} id="budgets" aria-labelledby="budgets-heading">
      <div className={s.sectionHead}>
        <div>
          <h2 id="budgets-heading">A little room to breathe</h2>
          <p>Your monthly budgets · {month}</p>
        </div>
        <span className={s.sectionTag}>Budgets</span>
      </div>
      <QueryState query={query} label="budgets">
        {(data) =>
          data.goals.length ? (
            <div className={s.goals}>
              {data.goals.map((goal) => {
                const over = goal.currentSpent > goal.monthlyBudget;
                const state = over ? 'exceeded' : goal.status;
                return (
                  <div className={s.goal} key={goal.id}>
                    <div className={s.goalHeading}>
                      <h3>{goal.category}</h3>
                      <span
                        className={`${s.statusBadge} ${state === 'on_track' ? s.good : state === 'warning' ? s.warning : s.exceeded}`}
                      >
                        {state === 'on_track'
                          ? 'On track'
                          : state === 'warning'
                            ? 'Nearly there'
                            : 'Over budget'}
                      </span>
                    </div>
                    <div className={s.goalAmounts}>
                      <strong>{money(goal.currentSpent)}</strong>
                      <span>of {money(goal.monthlyBudget)}</span>
                    </div>
                    <progress
                      className={
                        state === 'on_track'
                          ? s.goodProgress
                          : state === 'warning'
                            ? s.warningProgress
                            : s.overProgress
                      }
                      max={100}
                      value={Math.max(0, Math.min(100, goal.percentageUsed))}
                      aria-label={`${goal.category} budget used`}
                      aria-valuetext={`${goal.percentageUsed}% of budget used`}
                    />
                    <div className={s.goalFoot}>
                      <span>
                        {money(
                          Math.abs(goal.monthlyBudget - goal.currentSpent),
                        )}{' '}
                        {over ? 'over budget' : 'left to spend'}
                      </span>
                      <span>{goal.daysRemaining} days left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={s.empty}>You don’t have any monthly budgets yet.</p>
          )
        }
      </QueryState>
    </section>
  );
}
