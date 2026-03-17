import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center mx-auto mb-5">
          <Mail size={24} className="text-forest-600" />
        </div>
        <h1 className="font-display text-2xl text-forest-900 mb-2">Check your email</h1>
        <p className="text-sm text-forest-500 leading-relaxed mb-3">
          A sign-in link was sent. Click it to continue.
        </p>
        <p className="text-xs text-forest-400 mb-6 p-3 rounded-xl bg-forest-50 border border-forest-100">
          Running locally? Check your <strong>terminal</strong> — Next.js prints the magic link URL there in development mode.
        </p>
        <Link href="/auth/signin" className="btn-secondary justify-center">
          Back to sign-in
        </Link>
      </div>
    </div>
  )
}
