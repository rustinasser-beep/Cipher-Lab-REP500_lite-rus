import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root Error Boundary ensures cross-browser stability.
 * Prevents blank screens if any unexpected runtime exception occurs during mount.
 */
class RootErrorBoundary extends (React.Component as {
  new (props: ErrorBoundaryProps): {
    props: ErrorBoundaryProps;
    state: ErrorBoundaryState;
    setState(state: Partial<ErrorBoundaryState>): void;
    render(): React.ReactNode;
  };
}) {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Cipher Lab] Critical root initialization error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] flex items-center justify-center p-4 selection:bg-amber-500/30">
          <div className="max-w-md w-full bg-[#0f1424] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              حدث خطأ أثناء تهيئة التطبيق
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected initialization error occurred.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all shadow-md shadow-amber-500/20 min-h-[44px]"
              >
                <span>إعادة تحميل الصفحة (Reload)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function initializeApp() {
  const container = document.getElementById('root');
  if (!container) {
    console.error('[Cipher Lab] Mount target "#root" element not found in DOM.');
    return;
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}

// Suppress non-critical Vite HMR WebSocket disconnect messages in embedded iframe/preview
if (typeof window !== 'undefined') {
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const msg = String(event.reason?.message || event.reason || '');
      if (
        msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('vite') ||
        msg.includes('closed without opened')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );

  window.addEventListener(
    'error',
    (event) => {
      const msg = String(event.message || '');
      if (
        msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('vite') ||
        msg.includes('closed without opened')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
}

// Ensure DOM is fully ready across various browsers & embed environments
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
