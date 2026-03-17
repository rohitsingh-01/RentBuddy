import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <p className="font-display text-8xl text-forest-200 mb-4 leading-none">404</p>
        <h1 className="font-display text-2xl text-forest-900 mb-2">Page not found</h1>
        <p className="text-sm text-forest-500 leading-relaxed mb-8">
          This page doesn't exist or has been moved. Head back to your dashboard.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/dashboard" className="btn-primary">
            Go to dashboard
          </Link>
          <Link href="/" className="btn-ghost">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
