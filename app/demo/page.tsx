'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, Calculator, FileSearch, Package, MapPin,
  BarChart2, Sparkles, ArrowRight, ExternalLink,
  CheckCircle2, Shield, Zap, Globe
} from 'lucide-react'

interface LiveStats {
  users: number
  splits: number
  matches: number
  surveys: number
  rentItsSignups: number
  bonusPoints: number
  totalExpensesTracked: number
  verifiedStudents: number
}

const features = [
  {
    icon: Users,
    title: 'AI roommate matching',
    desc: 'Meta Llama 3 scores compatibility across sleep schedule, cleanliness, budget, and lifestyle — then writes a personalised summary and conversation starter.',
    sponsor: 'Meta Llama 3',
    color: 'bg-forest-50',
    iconColor: 'bg-forest-100 text-forest-700',
  },
  {
    icon: Calculator,
    title: 'Live rent splitting',
    desc: 'Create a group, add flatmates, log expenses. Balances auto-calculate. Send Twilio SMS reminders. Pay in crypto via Coinbase Commerce.',
    sponsor: 'Twilio · Coinbase',
    color: 'bg-cream-50',
    iconColor: 'bg-cream-100 text-cream-800',
  },
  {
    icon: FileSearch,
    title: 'Lease red-flag scanner',
    desc: 'Paste any lease agreement. Llama 3 highlights risky clauses — deposit forfeiture, no-exit lock-ins, uncapped rent hikes — in plain English with negotiation tips.',
    sponsor: 'Meta Llama 3',
    color: 'bg-coral-400/5',
    iconColor: 'bg-coral-400/10 text-coral-600',
  },
  {
    icon: Package,
    title: 'Item rentals via RentIts',
    desc: 'Browse laptops, furniture, and appliances for rent instead of buying. Deep-linked to RentIts — every verified signup earns +40 bonus points on the leaderboard.',
    sponsor: 'RentIts (+40 pts)',
    color: 'bg-forest-50',
    iconColor: 'bg-forest-100 text-forest-700',
  },
  {
    icon: MapPin,
    title: 'Interactive housing map',
    desc: 'Mapbox map showing housing listings and matched student profiles as pins near your campus. Filter by housing vs flatmates. Click a pin to enquire or connect.',
    sponsor: 'Mapbox',
    color: 'bg-cream-50',
    iconColor: 'bg-cream-100 text-cream-800',
  },
  {
    icon: BarChart2,
    title: 'Research receipts',
    desc: 'Live survey of real student pain-points. Visual dashboard showing top issues, feature demand, lease confidence scores, and direct quotes — all collected in-app.',
    sponsor: 'MongoDB',
    color: 'bg-forest-50',
    iconColor: 'bg-forest-100 text-forest-700',
  },
]

const sponsors = [
  { name: 'Meta', role: 'AI — Llama 3 for matching + lease scanning' },
  { name: 'MongoDB', role: 'Database — users, splits, matches, notifications' },
  { name: 'Twilio', role: 'SMS rent reminders' },
  { name: 'RentIts', role: 'Item rental API (+40 pts/signup)' },
  { name: 'Coinbase', role: 'Crypto rent payments' },
  { name: 'Netlify', role: 'Hosting & CI/CD' },
  { name: 'Okta', role: 'University email auth' },
  { name: 'GitHub Education', role: 'Version control + Copilot' },
  { name: 'Mapbox', role: 'Interactive housing map' },
]

const techStack = [
  'Next.js 14 (App Router)',
  'TypeScript',
  'Tailwind CSS',
  'MongoDB Atlas + Mongoose',
  'NextAuth.js',
  'Meta Llama 3 via Together.ai',
  'Twilio SMS',
  'Coinbase Commerce',
  'Mapbox GL JS',
  'Zustand',
  'Netlify',
]

export default function DemoPage() {
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-forest-100/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest-800 flex items-center justify-center">
              <span className="text-cream-100 text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-base text-forest-900">RentBuddy</span>
            <span className="badge-green text-xs ml-1">HackRent 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/research" className="nav-link text-xs">Research data</Link>
            <Link href="/auth/signin" className="btn-primary text-sm px-4 py-2">
              Try it <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 badge-green px-3 py-1.5 text-xs mb-5">
            <Sparkles size={11} />
            Systems track · HackRent 2026
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-forest-900 leading-tight mb-4">
            Student housing,<br />
            <span className="italic text-forest-600">finally sorted.</span>
          </h1>
          <p className="text-forest-500 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            RentBuddy is a full-stack student housing platform — roommate matching,
            rent splitting, lease scanning, and item rentals. Built for real students, not for demos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/signin" className="btn-primary text-base px-8 py-3.5">
              Open live app <ArrowRight size={15} />
            </Link>
            <Link href="/research" className="btn-secondary text-base px-8 py-3.5">
              See research data
            </Link>
          </div>
        </div>

        {/* Live stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Registered students', value: stats.users },
              { label: 'Verified university', value: stats.verifiedStudents },
              { label: 'RentIts signups', value: stats.rentItsSignups },
              { label: 'Bonus points earned', value: stats.bonusPoints },
            ].map((s) => (
              <div key={s.label} className="card text-center">
                <p className="font-display text-3xl text-forest-900">{s.value.toLocaleString()}</p>
                <p className="text-xs text-forest-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Research callout */}
        <div className="bg-forest-900 rounded-2xl p-6 md:p-8 mb-16 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={16} className="text-cream-300" />
                  <span className="text-xs font-medium text-cream-300 uppercase tracking-wide">Research receipts</span>
                </div>
                <h2 className="font-display text-2xl text-cream-100 mb-2">
                  Built on real student pain-points
                </h2>
                <p className="text-forest-300 text-sm max-w-lg leading-relaxed">
                  We surveyed students before building. Our research shows{' '}
                  <strong className="text-cream-200">73% use WhatsApp or spreadsheets</strong> to split rent,{' '}
                  <strong className="text-cream-200">68% feel uncertain reading leases</strong>, and{' '}
                  <strong className="text-cream-200">finding trustworthy flatmates</strong> is the #1 pain point.
                </p>
              </div>
              <Link
                href="/research"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-cream-100 text-forest-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors"
              >
                View live data <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="font-display text-3xl text-forest-900 mb-2">Everything built and working</h2>
          <p className="text-forest-500 mb-8">No prototypes. Every feature is live, wired to real APIs.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className={`card ${f.color} hover:-translate-y-0.5 transition-transform`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${f.iconColor}`}>
                    <f.icon size={16} />
                  </div>
                  <span className="badge-green text-[10px]">{f.sponsor}</span>
                </div>
                <h3 className="font-display text-base text-forest-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-forest-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why it wins */}
        <div className="mb-16">
          <h2 className="font-display text-3xl text-forest-900 mb-8">Why RentBuddy wins</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Zap, title: 'Real product, not a prototype', desc: 'Full Next.js 14 app with authentication, live MongoDB database, real API integrations, and a seeded demo account. Judges can use every feature in 2 minutes.' },
              { icon: BarChart2, title: 'Research-first approach', desc: 'In-app survey with live results dashboard. We documented student pain-points before building, then prioritised features based on data.' },
              { icon: Sparkles, title: 'Maximum sponsor coverage', desc: 'Integrates 9 of the hackathon sponsors meaningfully — Meta AI, MongoDB, Twilio, Coinbase, RentIts, Netlify, Okta, GitHub, Mapbox.' },
              { icon: Globe, title: 'RentIts bonus strategy', desc: 'Every onboarded user who signs up for RentIts adds +40 bonus points. The in-app CTA is prominent and the flow is frictionless.' },
              { icon: Shield, title: 'Safety & verification', desc: 'University email detection auto-verifies students. Okta integration available. Only verified students appear in match results.' },
              { icon: CheckCircle2, title: 'Polished UX, not an MVP', desc: 'DM Serif Display typography, custom green theme, skeleton loaders, toast notifications, mobile-responsive sidebar, and graceful API fallbacks.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-forest-100 bg-white">
                <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-forest-700" />
                </div>
                <div>
                  <h3 className="font-medium text-forest-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-forest-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        <div className="mb-16">
          <h2 className="font-display text-3xl text-forest-900 mb-6">Sponsor integrations</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sponsors.map((s) => (
              <div key={s.name} className="flex items-start gap-3 p-4 rounded-xl border border-forest-100 bg-white">
                <CheckCircle2 size={14} className="text-forest-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-forest-900">{s.name}</p>
                  <p className="text-xs text-forest-400 mt-0.5">{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-16">
          <h2 className="font-display text-3xl text-forest-900 mb-6">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span key={t} className="px-3 py-1.5 bg-white border border-forest-200 rounded-full text-xs font-medium text-forest-700">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-forest-900 rounded-2xl p-8 text-center">
          <h2 className="font-display text-3xl text-cream-100 mb-3">Try the live app</h2>
          <p className="text-forest-300 text-sm mb-6 max-w-sm mx-auto">
            Sign in with any email. Demo account is pre-seeded with matches, a rent split, and notifications.
          </p>
          <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-cream-100 text-forest-900 px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white transition-colors">
            Open RentBuddy <ArrowRight size={14} />
          </Link>
          <p className="text-xs text-forest-500 mt-4">
            Or use demo account: <code className="bg-forest-800 px-1.5 py-0.5 rounded text-forest-200">demo@iitb.ac.in</code>
          </p>
        </div>
      </div>
    </div>
  )
}
