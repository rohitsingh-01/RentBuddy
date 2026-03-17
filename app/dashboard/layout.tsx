'use client'

import { useSession, useSupabase } from '@/components/layout/SupabaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calculator, FileSearch,
  Package, LogOut, CheckCircle2, AlertCircle,
  UserCircle, MapPin, Menu, X, Bell as BellIcon, BarChart2, Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'
import { NotificationBell } from '@/components/ui/NotificationBell'

const navItems = [
  { href: '/dashboard',      label: 'Overview',        icon: LayoutDashboard },
  { href: '/match',          label: 'Roommate match',  icon: Users },
  { href: '/splits',         label: 'Rent splits',     icon: Calculator },
  { href: '/lease',          label: 'Lease scanner',   icon: FileSearch },
  { href: '/rentals',        label: 'Item rentals',    icon: Package },
  { href: '/map',            label: 'Housing map',     icon: MapPin },
  { href: '/notifications',  label: 'Notifications',   icon: BellIcon },
  { href: '/research',       label: 'Research data',   icon: BarChart2 },
  { href: '/pitch',          label: 'Submission pitch', icon: Sparkles },
  { href: '/checklist',      label: 'Checklist',        icon: CheckCircle2 },
  { href: '/profile',        label: 'My profile',      icon: UserCircle },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { data: session } = useSession()
  const supabase = useSupabase()
  const pathname = usePathname()

  const initials =
    session?.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'ST'

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-between px-5 border-b border-forest-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center">
            <span className="text-cream-100 text-xs font-display font-bold">R</span>
          </div>
          <span className="font-display text-lg text-forest-900">RentBuddy</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-forest-400 hover:text-forest-700 hover:bg-forest-50 lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-forest-900 text-cream-100'
                  : 'text-forest-600 hover:bg-forest-50 hover:text-forest-900'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Unverified warning */}
      {session && !(session.user as any)?.isVerified && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-cream-100 border border-cream-300">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-cream-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-cream-800">Unverified</p>
              <p className="text-xs text-cream-700 mt-0.5">Use a .edu email to unlock all features.</p>
            </div>
          </div>
        </div>
      )}

      {/* User row */}
      <div className="border-t border-forest-100 p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-forest-900 truncate">{session?.user?.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {(session?.user as any)?.isVerified
                ? <CheckCircle2 size={10} className="text-forest-500" />
                : <AlertCircle size={10} className="text-cream-600" />}
              <span className="text-xs text-forest-400 truncate">
                {(session?.user as any)?.universityName || 'Student'}
              </span>
            </div>
          </div>
          <NotificationBell />
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="p-1.5 rounded-lg text-forest-400 hover:text-forest-700 hover:bg-forest-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-6 h-6 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-forest-100 flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-forest-100 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-forest-600 hover:bg-forest-50 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest-800 flex items-center justify-center">
              <span className="text-cream-100 text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-base text-forest-900">RentBuddy</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
