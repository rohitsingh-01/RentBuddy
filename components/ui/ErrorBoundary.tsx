'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-coral-400/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={22} className="text-coral-600" />
          </div>
          <h2 className="font-display text-xl text-forest-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-forest-500 max-w-xs leading-relaxed mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary"
            >
              <RefreshCw size={14} /> Try again
            </button>
            <Link href="/dashboard" className="btn-secondary">
              Go to dashboard
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Lightweight inline error display for API failures
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-coral-400/5 border border-coral-400/20">
      <AlertTriangle size={16} className="text-coral-600 flex-shrink-0" />
      <p className="text-sm text-coral-700 flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-coral-600 hover:text-coral-800 underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  )
}
