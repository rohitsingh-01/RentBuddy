'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

const messages: Record<string, string> = {
  Configuration:  'Server configuration error — check NEXTAUTH_SECRET and MONGODB_URI in .env.local.',
  AccessDenied:   'You do not have permission to sign in.',
  Verification:   'The sign-in link has expired. Please request a new one.',
  OAuthCallback:  'OAuth sign-in failed — check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.',
  Default:        'An error occurred during sign-in.',
}

function ErrorContent() {
  const params  = useSearchParams()
  const error   = params.get('error') || 'Default'
  const message = messages[error] || messages.Default

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-coral-400/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={24} className="text-coral-600" />
        </div>
        <h1 className="font-display text-2xl text-forest-900 mb-2">Sign-in error</h1>
        <p className="text-sm text-forest-500 leading-relaxed mb-2">{message}</p>
        <p className="text-xs font-mono text-forest-300 mb-8">error: {error}</p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signin" className="btn-primary justify-center">Try again</Link>
          <Link href="/" className="btn-ghost justify-center"><ArrowLeft size={14} /> Back to home</Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <ErrorContent />
    </Suspense>
  )
}
