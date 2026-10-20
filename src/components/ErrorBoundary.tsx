import { Component, type ErrorInfo, type ReactNode } from 'react';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info.componentStack);
  }
  render() {
    if (this.state.hasError)
      return (
        <main style={{ maxWidth: 640, margin: '15vh auto', padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>
            Your dashboard couldn’t be displayed. Reload the page to try again.
          </p>
          <button onClick={() => window.location.reload()}>
            Reload dashboard
          </button>
        </main>
      );
    return this.props.children;
  }
}
