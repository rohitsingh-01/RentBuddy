'use client'

import { useSession, useSupabase } from '@/components/layout/SupabaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Chrome, Terminal } from 'lucide-react'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const supabase = useSupabase()
  const [email, setEmail] = useState('demo@iitb.ac.in')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const isDev = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-6 h-6 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
      </div>
    )
  }

  // ── Dev login (using Magic Link) ───────────────────────────────────────────
  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
      setEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'Dev login failed.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  // ── Magic link ────────────────────────────────────────────────────────────
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
      setEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'Magic link failed.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-forest-600" />
          </div>
          <h1 className="font-display text-2xl text-forest-900 mb-2">Check your email</h1>
          <p className="text-sm text-forest-500 mb-4">
            Magic link sent to <strong>{email}</strong>. In development, check the terminal — the link is printed there too.
          </p>
          <button onClick={() => setEmailSent(false)} className="text-xs text-forest-500 underline underline-offset-2">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center">
            <span className="text-cream-100 font-display font-bold">R</span>
          </div>
          <span className="font-display text-xl text-cream-100">RentBuddy</span>
        </div>
        <div className="relative">
          <blockquote className="font-display text-3xl text-cream-100 leading-snug mb-6">
            "Found my perfect flatmates in under 10 minutes. The AI just <em>got</em> my vibe."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center text-cream-100 font-medium text-sm">AP</div>
            <div>
              <div className="text-cream-200 text-sm font-medium">Ananya Patel</div>
              <div className="text-forest-400 text-xs">IIT Bombay, 3rd year</div>
            </div>
          </div>
        </div>
        <div className="relative flex gap-3 flex-wrap">
          {['Match', 'Split', 'Scan', 'Rent'].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full border border-forest-600 text-forest-300 text-xs">{tag}</span>
          ))}
        </div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-forest-500 hover:text-forest-800 mb-8 transition-colors">
            <ArrowLeft size={12} /> Back to home
          </Link>

          <h1 className="font-display text-3xl text-forest-900 mb-1">Welcome back</h1>
          <p className="text-sm text-forest-500 mb-2">Sign in to continue to RentBuddy.</p>
          <div className="p-3 bg-forest-100 rounded-xl mb-6 text-sm text-forest-800 font-medium text-center">
             💡 For Judges: Use <strong className="text-forest-950">demo@iitb.ac.in</strong> for testing!
          </div>

          {/* ── DEV LOGIN (local only) ── */}
          {isDev && (
            <div className="mb-5 p-4 rounded-2xl border-2 border-forest-300 bg-forest-50">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-forest-700" />
                <span className="text-xs font-medium text-forest-700 uppercase tracking-wide">Dev login — local only</span>
              </div>
              <form onSubmit={handleDevLogin} className="space-y-3">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@iitb.ac.in"
                    required
                  />
                  <p className="text-xs text-forest-400 mt-1">
                    Enter any email. Account created automatically.
                  </p>
                </div>
                {error && (
                  <p className="text-xs text-coral-600 bg-coral-400/5 px-3 py-2 rounded-lg border border-coral-400/20">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-2.5 rounded-xl disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-cream-300 border-t-cream-100 rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    'Sign in instantly'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-forest-100" />
            <span className="text-xs text-forest-400">or</span>
            <div className="flex-1 h-px bg-forest-100" />
          </div>

          {/* ── Google ── */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-forest-200 text-forest-800 py-3 rounded-xl text-sm font-medium hover:bg-forest-50 transition-colors duration-150 mb-3 disabled:opacity-60"
          >
            <Chrome size={16} />
            Continue with Google
            {!process.env.GOOGLE_CLIENT_ID && (
              <span className="text-xs text-forest-400 ml-auto">needs setup</span>
            )}
          </button>

          {/* ── Magic link ── */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <label className="label">Or send a magic link</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@university.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-forest-400 mt-1">
                Use a .edu or .ac.in email to get verified automatically.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-forest-200 text-forest-700 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-50 transition-colors disabled:opacity-60"
            >
              <Mail size={14} />
              Send magic link
            </button>
          </form>

          <p className="text-xs text-forest-400 mt-6 text-center">
            By signing in you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
