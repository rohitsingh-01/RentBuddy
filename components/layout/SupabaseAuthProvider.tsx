'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextType {
  data: {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      id?: string | null
    }
  } | null
  status: AuthStatus
  supabase: ReturnType<typeof createClient>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setStatus(session ? 'authenticated' : 'unauthenticated')
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    data: session ? {
      user: {
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
        email: session.user.email || null,
        image: session.user.user_metadata?.avatar_url || null,
        id: session.user.id,
      }
    } : null,
    status,
    supabase,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SupabaseAuthProvider')
  }
  return { data: context.data, status: context.status }
}

export const useSupabase = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseAuthProvider')
  }
  return context.supabase
}
