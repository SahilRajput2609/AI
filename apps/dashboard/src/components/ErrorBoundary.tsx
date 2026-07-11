import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Rendered instead of the default panel when an error is caught */
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#000000] min-h-[240px]">
          <div className="max-w-md w-full rounded-2xl border border-[#EF4444]/20 bg-[#0F0F0F] p-6 text-center animate-scale-in">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-[#EF4444]" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Something went wrong</h2>
            <p className="text-xs text-[#6E6E6E] mb-4 break-words">
              {this.state.error.message || 'An unexpected error occurred while rendering this view.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
              >
                <RotateCcw size={12} />
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg border border-[#333] text-[#A1A1AA] text-xs font-medium hover:text-white hover:border-[#4a4a4a] transition-colors"
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
