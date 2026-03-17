'use client'

import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // If already onboarded, skip to dashboard
    if (session && (session.user as any)?.onboardingComplete) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
