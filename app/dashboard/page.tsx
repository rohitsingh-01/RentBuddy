'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import Link from 'next/link'
import {
  ArrowRight, Users, Calculator, FileSearch,
  Package, Sparkles, Loader2, TrendingUp,
  MapPin, BarChart2, CheckCircle2,
} from 'lucide-react'

const quickActions = [
  { href: '/match',    icon: Users,      title: 'Find a roommate',  desc: 'AI-powered compatibility matching',  color: 'bg-forest-50 border-forest-200 hover:bg-forest-100',      iconBg: 'bg-forest-100 text-forest-700' },
  { href: '/splits',   icon: Calculator, title: 'Rent splits',       desc: 'Track shared flat expenses',         color: 'bg-cream-50 border-cream-200 hover:bg-cream-100',          iconBg: 'bg-cream-100 text-cream-800' },
  { href: '/lease',    icon: FileSearch, title: 'Scan your lease',   desc: 'AI flags risky clauses instantly',   color: 'bg-coral-400/5 border-coral-400/20 hover:bg-coral-400/10', iconBg: 'bg-coral-400/10 text-coral-600' },
  { href: '/rentals',  icon: Package,    title: 'Item rentals',      desc: 'Laptops, furniture via RentIts',     color: 'bg-forest-50 border-forest-200 hover:bg-forest-100',      iconBg: 'bg-forest-100 text-forest-700' },
  { href: '/map',      icon: MapPin,     title: 'Housing map',       desc: 'Find housing near your campus',      color: 'bg-cream-50 border-cream-200 hover:bg-cream-100',          iconBg: 'bg-cream-100 text-cream-800' },
  { href: '/research', icon: BarChart2,  title: 'Research survey',   desc: 'Help us improve RentBuddy',         color: 'bg-forest-50 border-forest-200 hover:bg-forest-100',      iconBg: 'bg-forest-100 text-forest-700' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [splitsCount, setSplitsCount]     = useState<number | null>(null)
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/splits')
        if (res.ok) {
          const { splits } = await res.json()
          setSplitsCount(splits?.length ?? 0)
          setTotalExpenses(splits?.reduce((s: number, sp: any) => s + (sp.totalExpenses || 0), 0) ?? 0)
        }
      } catch {
        // non-fatal — dashboard still renders
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const checklistItems = [
    { done: true,                                   label: 'Create your account' },
    { done: !!(session?.user as any)?.isVerified,   label: 'Verify your university email',   href: '/profile' },
    { done: !!(session?.user as any)?.rentItsSignedUp, label: 'Sign up for RentIts (+40 bonus points)', href: '/rentals' },
    { done: (splitsCount ?? 0) > 0,                 label: 'Create a rent split group',      href: '/splits' },
    { done: false,                                  label: 'Get your first roommate match',  href: '/match' },
    { done: false,                                  label: 'Scan your lease agreement',      href: '/lease' },
  ]
  const donePct = Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100)

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-forest-400 mb-0.5">{greeting}</p>
        <h1 className="font-display text-3xl text-forest-900 mb-3">
          {firstName}, what are we sorting today?
        </h1>

        {/* Quick stats */}
        {!loading && (
          <div className="flex flex-wrap gap-5 mb-4 text-sm">
            <span>
              <span className="font-display text-lg text-forest-900">{splitsCount ?? 0}</span>
              <span className="text-forest-400 ml-1.5">split groups</span>
            </span>
            <span>
              <span className="font-display text-lg text-forest-900">
                {totalExpenses ? `₹${totalExpenses.toLocaleString()}` : '₹0'}
              </span>
              <span className="text-forest-400 ml-1.5">tracked</span>
            </span>
            <span>
              <span className="font-display text-lg text-forest-900">{donePct}%</span>
              <span className="text-forest-400 ml-1.5">profile done</span>
            </span>
          </div>
        )}

        {/* RentIts CTA */}
        {!(session?.user as any)?.rentItsSignedUp && (
          <div className="inline-flex items-center gap-2 bg-forest-900 text-cream-100 px-4 py-2 rounded-full text-xs font-medium">
            <Sparkles size={12} className="text-cream-300" />
            Sign up for RentIts — earn +40 bonus points per signup
            <Link href="/rentals" className="underline underline-offset-2 text-cream-300 hover:text-cream-100 ml-1">
              Do it now →
            </Link>
          </div>
        )}
        {(session?.user as any)?.rentItsSignedUp && (
          <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-xs font-medium">
            <TrendingUp size={12} />
            RentIts connected · +40 bonus points earned
          </div>
        )}
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-150 group ${a.color}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
              <a.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-forest-900 text-sm">{a.title}</h3>
                <ArrowRight size={13} className="text-forest-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </div>
              <p className="text-xs text-forest-500 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Checklist */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-forest-900">Getting started</h2>
          <span className="text-xs text-forest-400">
            {checklistItems.filter((i) => i.done).length}/{checklistItems.length}
          </span>
        </div>
        <div className="h-1 bg-forest-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-forest-600 rounded-full transition-all duration-700"
            style={{ width: `${donePct}%` }}
          />
        </div>
        <div className="space-y-2.5">
          {checklistItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                item.done ? 'bg-forest-600 border-forest-600' : 'border-forest-200'
              }`}>
                {item.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 ${item.done ? 'text-forest-400 line-through' : 'text-forest-700'}`}>
                {item.label}
              </span>
              {!item.done && (item as any).href && (
                <Link href={(item as any).href} className="text-xs text-forest-600 hover:text-forest-900 underline underline-offset-2 flex-shrink-0">
                  Do it
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
