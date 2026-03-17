'use client'

import { SupabaseAuthProvider, useSession } from './SupabaseAuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const redirected = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (redirected.current) return

    // Pages that skip onboarding check
    const skipPaths = ['/', '/demo', '/pitch', '/checklist', '/auth', '/onboarding', '/api', '/research', '/sitemap']
    if (skipPaths.some((p) => pathname.startsWith(p))) return

    const onboardingComplete = (session?.user as any)?.onboardingComplete
    if (onboardingComplete === false) {
      redirected.current = true
      router.replace('/onboarding')
    }
  }, [status, session, pathname, router])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <OnboardingGuard>
        {children}
      </OnboardingGuard>
    </SupabaseAuthProvider>
  )
}
