# Spending insights

A responsive React assessment dashboard based on [`CustomerSpendingInsightsEndpoints.md`](../CustomerSpendingInsightsEndpoints.md). All seven endpoints are implemented with a deterministic mock API. The original job description and assessment documents are preserved in the parent folder.

## Run locally

Requires Node.js 22.12+ (developed with Node 22) and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. The demo starts automatically; no account, database or environment file is needed. It requires localhost or HTTPS for the mock service worker.

```sh
npm run build       # TypeScript and production bundle
npm run preview     # Serve the production bundle
npm test            # Unit, API and component integration tests
npm run lint
npm run format:check
npx playwright install chromium
npm run test:e2e    # Desktop and mobile Chromium journeys
```

## User journey

1. Choose an overview period to update the spending summary, categories and transactions.
2. Inspect monthly trends, including exact figures via the accessible data table.
3. Select a category to filter transactions, then sort or paginate through payments.
4. Apply custom dates to categories and transactions. The summary retains its clearly labelled overview period.
5. Check current-month budgets, including warnings and overspending.

Applied period, custom dates, category, sorting, page and trend duration live in URL query parameters. Refresh and browser Back preserve the view. Category, date and sorting changes reset pagination. Changing the overview period also clears custom dates.

## Stack and architecture

React, TypeScript, Vite, TanStack Query, React Router, CSS Modules, Recharts and native Fetch. MSW supplies the mock API; Vitest/Testing Library and Playwright verify behaviour.

```text
src/
  components/          Shared query-state presentation and error boundary
  features/spending/   Dashboard sections, API types, query hooks and filter rules
  lib/                 HTTP boundary, date and currency helpers
  mocks/               Seeded transaction ledger, aggregate functions, MSW handlers
  test/                Test lifecycle setup
e2e/                   Browser journeys
```

Components compose focused sections rather than one large conditional view. Query hooks own server data; URL parameters own applied filters; component state owns draft date inputs. Query keys include the customer and request parameters, and the Fetch client consumes query cancellation signals. No duplicate server data is stored in local state.

The API is a thin typed boundary, not a repository framework. Independent queries allow a section to fail and recover without hiding the rest of the dashboard. Initial requests show skeletons; background requests show an updating indicator. Failed background refreshes explicitly label retained data. The app retries a transient failure once and does not automatically retry HTTP 4xx responses.

CSS variables define shared tokens; CSS Modules isolate feature styles. Semantic HTML, visible keyboard focus, reduced-motion support, labelled controls, text budget states and an expandable chart table support accessibility. Responsive transaction rows retain dates on small screens.

## API assumptions and demo data

- **Demo reference date:** 17 October 2026. The date is visible in the interface. Data uses a fixed seed and covers 760 days, enabling reproducible historical comparisons and 24-month trends.
- **Calendar:** inclusive calendar days in `Africa/Johannesburg`. The `1y` preset means a rolling 365 days. Date-only values are kept separate from timestamps.
- **Consistency:** monetary aggregation uses integer cents in the mock service. Summary, categories, trends and goals derive from the same ledger. API responses preserve the supplied number-based shape. The source document's illustrative numbers do not fully reconcile, so they are not returned verbatim.
- **Custom dates:** both dates are required. They replace `period` on category requests. Transactions receive explicit date boundaries because that endpoint has no period parameter.
- **Separate scopes:** trends have their own 6/12/24-month control; budgets remain current-month. The current trend month is partial and explicitly labelled.
- **Categories:** selecting a category filters transactions only. All category totals remain visible for context. Category options and preset labels come from `/filters`.
- **No-data comparison:** percentage change is `null` if the prior denominator is zero, a documented extension to avoid misleading infinity values.
- **Goals:** read-only because the supplied contract has no write endpoint. Progress visuals cap at 100%, while monetary overspending and accessible percentage text remain accurate. `exceeded` is a documented additional mock status.
- **Customer:** the assessment uses customer `12345`. Profile identity is illustrative, not an authenticated session.
- **Pagination:** eight rows per page; sorting and pagination happen in the mock API after filtering. Unknown category values yield an empty state; invalid periods, sort orders, pages and dates fall back safely.
- **No authentication or real banking data:** this is an explicitly labelled assessment concept, not an official banking application. No transfers, goal edits, accounts backend or credential storage are implemented.

## Connect a real backend

Copy `.env.example` to `.env.local` and configure:

```dotenv
VITE_ENABLE_MOCKS=false
VITE_API_BASE_URL=https://your-api.example
```

Restart Vite (or rebuild for deployment). The base URL is an origin; API paths start at `/api/customers/12345`. Configure CORS on the server. Authentication and runtime response-schema validation would need to be designed against the real backend contract before production use. Do not put secrets in `VITE_*` variables; they are bundled into client code.

MSW is dynamically loaded only when enabled. The app unregisters its own previously installed mock worker when switching to real mode. The static host must serve `index.html` for application routes, and the mock demonstration must be served on localhost or HTTPS.

## Verification strategy

Unit tests cover malformed URLs, calendar boundaries and atomic filter transitions. API tests verify ledger reconciliation, filtering, sorting, pagination, empty responses and monthly aggregation. Component tests check date validation and failed-request recovery. Browser tests exercise period changes, category selection, pagination reset, sorting, refresh, Back navigation and empty-range recovery on desktop and mobile.

No persistence or write APIs are invented. Dark mode, exports and editing budgets are intentionally outside this assessment scope.

## Verification status (20 October 2026)

- Production build and TypeScript checks: passed. Vite reports a non-blocking warning for the main JavaScript chunk exceeding 500 kB before gzip.
- Unit, API and component tests: all 12 passed. The currency assertion compares exact text, preserving the formatter's non-breaking spaces.
- ESLint and Prettier checks: passed.
- The npm lockfile and generated MSW worker are present. `npm ci` is the recommended installation command; a fresh installation has not been independently verified here.
- Browser tests and visual review: still outstanding. The Playwright run could not start its web server because the environment denied binding to `127.0.0.1:4173` (`EPERM`). This is an environment restriction, not a passing browser test. Install the matching Chromium browser and run `npm run test:e2e` outside the restricted environment before submitting.

Installation automatically generates `public/mockServiceWorker.js` through the `postinstall` script. The original assessment specification is in the parent folder; include it alongside the application or adjust that documentation link if submitting this repository on its own.
