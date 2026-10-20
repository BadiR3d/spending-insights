import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './features/spending/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApiError } from './lib/api';
import { MOCKS_ENABLED } from './lib/dates';
import './styles.css';
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && count < 1,
    },
  },
});
async function bootstrap() {
  if (MOCKS_ENABLED) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  } else if ('serviceWorker' in navigator) {
    // Retire this app's demo worker when switching an existing browser to the real API.
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter(
          (registration) =>
            registration.active?.scriptURL ===
            new URL('/mockServiceWorker.js', location.origin).href,
        )
        .map((registration) => registration.unregister()),
    );
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={client}>
          <BrowserRouter>
            <Dashboard />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
void bootstrap().catch((error) => {
  console.error('Could not start dashboard', error);
  const root = document.getElementById('root')!;
  root.innerHTML =
    '<main style="padding:48px;max-width:640px;margin:auto"><h1>The dashboard couldn’t start</h1><p>Please reload this page. The demo requires service workers, available on localhost or HTTPS.</p><button type="button">Reload dashboard</button></main>';
  root
    .querySelector('button')
    ?.addEventListener('click', () => location.reload());
});
