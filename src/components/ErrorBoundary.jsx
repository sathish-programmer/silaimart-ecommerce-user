import React from 'react';
import { analytics } from '../services/analyticsService';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Log to analytics/error service
    analytics.track('app_error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Attempt to flush analytics immediately
    analytics.flush();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Something went wrong</h1>
            <p className="text-gray-500 text-sm">
              The SilaiMart engine encountered an unexpected error. Don't worry, our artisans are notified.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all"
            >
              Reload Application
            </button>
            <a href="/" className="block text-[10px] font-black text-primary-600 uppercase tracking-widest">
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
