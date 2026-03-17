'use client'

import Link from 'next/link'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { ArrowRight, Shield, Users, Calculator, FileSearch, Package } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Roommate matching',
    desc: 'AI-powered compatibility scoring based on lifestyle, schedule, and budget.',
    color: 'bg-forest-100 text-forest-700',
  },
  {
    icon: Calculator,
    title: 'Rent splitting',
    desc: 'Track expenses, calculate fair shares, send payment reminders via SMS.',
    color: 'bg-cream-100 text-cream-800',
  },
  {
    icon: FileSearch,
    title: 'Lease scanner',
    desc: 'Paste your lease and get plain-English red flags flagged by AI instantly.',
    color: 'bg-coral-400/10 text-coral-600',
  },
  {
    icon: Package,
    title: 'Item rentals',
    desc: 'Rent laptops, furniture, and appliances instead of buying. Powered by RentIts.',
    color: 'bg-forest-100 text-forest-700',
  },
  {
    icon: Shield,
    title: 'Verified students only',
    desc: 'University email verification keeps the community safe and trusted.',
    color: 'bg-cream-100 text-cream-800',
  },
]

const stats = [
  { value: '2 min', label: 'average match time' },
  { value: '100%', label: 'student-verified' },
  { value: '₹0', label: 'platform fee' },
]

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-forest-100/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center">
              <span className="text-cream-100 text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-lg text-forest-900">RentBuddy</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How it works</Link>
            <Link href="/rentals" className="nav-link">Browse rentals</Link>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-ghost">Sign in</Link>
                <Link href="/auth/signin" className="btn-primary">
                  Get started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-forest-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-cream-200/80 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 badge-green mb-6 px-3 py-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
              Built for HackRent 2026 · Systems track
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-forest-900 leading-[1.05] mb-6">
              Student housing,{' '}
              <span className="italic text-forest-600">finally</span>{' '}
              sorted.
            </h1>

            <p className="text-forest-600 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
              Find your ideal roommate, split rent without the spreadsheet drama,
              scan your lease for red flags — and rent everything else from RentIts.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth/signin" className="btn-primary text-base px-8 py-4">
                Get your free account <ArrowRight size={16} />
              </Link>
              <Link href="/rentals" className="btn-secondary text-base px-8 py-4">
                Browse item rentals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-forest-100">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl text-forest-900">{s.value}</div>
                  <div className="text-xs text-forest-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <h2 className="section-heading mb-3">Everything you need,<br />nothing you don't.</h2>
            <p className="text-forest-500 text-lg max-w-lg">
              Four tools that solve the four biggest headaches of student housing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card hover:-translate-y-1 transition-transform duration-200 cursor-default"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={18} />
                </div>
                <h3 className="font-display text-lg text-forest-900 mb-2">{f.title}</h3>
                <p className="text-sm text-forest-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-cream-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading mb-12">Up and running<br />in three steps.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Verify your student email', desc: "Sign up with your university email. We confirm you're a student — no strangers." },
              { step: '02', title: 'Complete your profile', desc: "Tell us your budget, lifestyle, schedule, and what you're looking for." },
              { step: '03', title: 'Get matched instantly', desc: "Our AI surfaces compatible roommates and relevant item rentals within seconds." },
            ].map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="font-display text-5xl text-forest-200 leading-none flex-shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-medium text-forest-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-forest-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-display text-4xl md:text-5xl text-cream-100 mb-4">
            Ready to find your place?
          </h2>
          <p className="text-forest-300 text-lg mb-8">
            Join thousands of students already using RentBuddy to simplify their housing.
          </p>
          <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-cream-100 text-forest-900 px-8 py-4 rounded-full font-medium hover:bg-white transition-colors duration-200">
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-forest-950 text-forest-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest-700 flex items-center justify-center">
              <span className="text-cream-100 text-xs font-display">R</span>
            </div>
            <span className="text-sm font-display text-forest-300">RentBuddy</span>
          </div>
          <p className="text-xs">Built for HackRent 2026 · Powered by RentIts, Meta, Twilio, Coinbase & MongoDB</p>
        </div>
      </footer>
    </div>
  )
}
