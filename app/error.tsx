'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-coral-400/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-coral-600" />
        </div>
        <h1 className="font-display text-2xl text-forest-900 mb-2">Something broke</h1>
        <p className="text-sm text-forest-500 leading-relaxed mb-2">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-xs text-forest-300 mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col gap-3 items-center">
          <button onClick={reset} className="btn-primary">
            <RefreshCw size={14} /> Try again
          </button>
          <Link href="/dashboard" className="btn-ghost">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
