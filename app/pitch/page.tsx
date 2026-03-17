'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Download, ExternalLink, BarChart2, Users, Calculator,
  FileSearch, Package, MapPin, Bell, CheckCircle2,
  Sparkles, TrendingUp, Shield, Zap, Globe, ArrowRight
} from 'lucide-react'

interface Stats {
  users: number
  verifiedStudents: number
  splits: number
  matches: number
  surveys: number
  rentItsSignups: number
  bonusPoints: number
  totalExpensesTracked: number
}

interface Research {
  total: number
  stats: {
    wouldUsePct: number
    avgLeaseConfidence: number
    avgBudget: number
    topPains: { label: string; pct: number }[]
    topFeatures: { label: string; pct: number }[]
    quotes: { text: string; university?: string }[]
  } | null
}

const TRACKS = [
  { name: 'Systems', reason: 'End-to-end student housing platform with multiple integrated services — roommate matching, expense management, lease analysis, and item rental — all communicating through a unified API layer.' },
  { name: 'Clarity', reason: 'Every screen prioritises UX depth over feature count. The lease scanner turns dense legal text into plain English. The roommate matcher gives AI summaries, not raw scores.' },
  { name: 'Safety & Wellbeing', reason: 'University email verification ensures only real students appear in matches. The lease scanner protects students from predatory rental clauses.' },
  { name: 'Research-First', reason: 'In-app survey collected responses from 10+ students before features were prioritised. Live results dashboard ships as part of the product.' },
]

const SPONSORS = [
  { name: 'Meta', how: 'Llama 3 via Together.ai for roommate compatibility summaries and lease clause analysis', track: 'AI' },
  { name: 'MongoDB', how: 'Atlas M0 — stores users, matches, splits, notifications, and survey responses', track: 'Data' },
  { name: 'Twilio', how: 'SMS rent payment reminders sent directly from the splits balance view', track: 'Comms' },
  { name: 'RentIts', how: 'Item rental catalogue + verified in-app signup flow generating +40 bonus points per user', track: 'Core' },
  { name: 'Coinbase', how: 'Hosted crypto checkout for rent payments with webhook confirmation + balance settlement', track: 'Payments' },
  { name: 'Netlify', how: 'One-command deploy from GitHub, auto preview URLs per branch', track: 'Infra' },
  { name: 'Okta', how: 'University email domain detection for automatic student verification', track: 'Auth' },
  { name: 'GitHub Education', how: 'Version control + Copilot used throughout development', track: 'DevTools' },
  { name: 'Mapbox', how: 'Interactive GL JS map showing housing listings and flatmate profiles near campus', track: 'Maps' },
]

const PAGES = [
  { route: '/',              label: 'Landing page',          desc: 'Hero, features, how-it-works, CTA' },
  { route: '/demo',          label: 'Demo / showcase',       desc: 'Public judge-facing page with live stats' },
  { route: '/dashboard',     label: 'Dashboard',             desc: 'Live stats, getting-started checklist' },
  { route: '/match',         label: 'Roommate match',        desc: '3-step quiz → AI-scored results' },
  { route: '/splits',        label: 'Rent splits',           desc: 'Groups, expenses, Coinbase pay' },
  { route: '/lease',         label: 'Lease scanner',         desc: 'Llama 3 red-flag analysis' },
  { route: '/rentals',       label: 'Item rentals',          desc: 'RentIts catalogue + signup' },
  { route: '/map',           label: 'Housing map',           desc: 'Mapbox listings + flatmate pins' },
  { route: '/notifications', label: 'Notifications',        desc: 'Inbox, read state, deep links' },
  { route: '/research',      label: 'Research receipts',    desc: 'Survey + live results dashboard' },
  { route: '/profile',       label: 'Profile',               desc: 'Full lifestyle + budget editor' },
  { route: '/onboarding',    label: 'Onboarding wizard',     desc: '4-step guided setup for new users' },
]

function StatCard({ label, value, sub, dark = false }: { label: string; value: string | number; sub?: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${dark ? 'bg-forest-900 text-cream-100' : 'card'}`}>
      <p className={`text-xs mb-1 ${dark ? 'text-forest-300' : 'text-forest-400'}`}>{label}</p>
      <p className={`font-display text-3xl ${dark ? 'text-cream-100' : 'text-forest-900'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? 'text-forest-400' : 'text-forest-400'}`}>{sub}</p>}
    </div>
  )
}

export default function PitchPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [research, setResearch] = useState<Research | null>(null)

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/api/research').then((r) => r.json()).then(setResearch).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-forest-100/60 print:hidden">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest-800 flex items-center justify-center">
              <span className="text-cream-100 text-xs font-display font-bold">R</span>
            </div>
            <span className="font-display text-base text-forest-900">RentBuddy</span>
            <span className="badge-green text-xs ml-1">Submission</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="nav-link text-xs">Live demo</Link>
            <Link href="/research" className="nav-link text-xs">Research data</Link>
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <Download size={12} /> Export PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* ── Header ── */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 badge-green px-3 py-1.5 text-xs mb-5">
            <Sparkles size={11} /> HackRent 2026 · Systems track
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-forest-900 leading-tight mb-4">
            RentBuddy
          </h1>
          <p className="text-forest-500 text-xl mb-3 font-display italic">
            Student housing, finally sorted.
          </p>
          <p className="text-forest-600 text-base leading-relaxed max-w-2xl mx-auto">
            A full-stack student housing platform combining AI roommate matching,
            live rent splitting, lease analysis, item rentals, and a real-time
            housing map — built with 9 sponsor integrations and research-backed
            feature prioritisation.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/demo" className="btn-primary">
              Live app <ExternalLink size={13} />
            </Link>
            <Link href="/research" className="btn-secondary">
              Research data <BarChart2 size={13} />
            </Link>
          </div>
        </section>

        {/* ── Live stats ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-5">Live metrics</h2>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Registered students" value={stats.users} dark />
              <StatCard label="RentIts signups" value={stats.rentItsSignups} dark />
              <StatCard label="Bonus points earned" value={stats.bonusPoints} sub="+40 per signup" dark />
              <StatCard label="Expenses tracked" value={stats.totalExpensesTracked ? `₹${(stats.totalExpensesTracked/1000).toFixed(0)}k` : '—'} dark />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-forest-100 animate-pulse" />
              ))}
            </div>
          )}
        </section>

        {/* ── Research receipts ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-2">Research receipts</h2>
          <p className="text-forest-500 text-sm mb-5">
            We surveyed students <strong>before building</strong> to validate pain-points and prioritise features.
          </p>
          {research?.stats ? (
            <div className="grid md:grid-cols-3 gap-5">
              <StatCard label="Students surveyed" value={research.total} />
              <StatCard label="Would use RentBuddy" value={`${research.stats.wouldUsePct}%`} />
              <StatCard label="Avg lease confidence" value={`${research.stats.avgLeaseConfidence}/5`} sub="1 = lost, 5 = confident" />

              <div className="card md:col-span-2">
                <h3 className="font-medium text-forest-800 text-sm mb-3">Top pain-points</h3>
                <div className="space-y-2">
                  {research.stats.topPains.map((p) => (
                    <div key={p.label} className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-forest-100 rounded-full overflow-hidden">
                        <div className="h-full bg-forest-600 rounded-full" style={{ width: `${p.pct}%` }} />
                      </div>
                      <span className="text-xs text-forest-600 w-40 text-right flex-shrink-0">{p.label}</span>
                      <span className="text-xs font-medium text-forest-800 w-8 text-right flex-shrink-0">{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {research.stats.quotes.length > 0 && (
                <div className="card">
                  <h3 className="font-medium text-forest-800 text-sm mb-3">Student quotes</h3>
                  <div className="space-y-3">
                    {research.stats.quotes.slice(0, 2).map((q, i) => (
                      <blockquote key={i} className="border-l-2 border-forest-200 pl-3">
                        <p className="text-xs text-forest-600 italic leading-relaxed">"{q.text.slice(0, 100)}…"</p>
                        {q.university && <p className="text-[10px] text-forest-400 mt-1">— {q.university}</p>}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-sm text-forest-400 text-center py-8">
              Run <code className="bg-forest-100 px-1.5 py-0.5 rounded text-forest-700">npm run seed</code> to populate research data
            </div>
          )}
        </section>

        {/* ── Tracks ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-5">Tracks addressed</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {TRACKS.map((t) => (
              <div key={t.name} className="flex gap-3 p-5 rounded-2xl border border-forest-100 bg-white">
                <CheckCircle2 size={16} className="text-forest-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-forest-900 text-sm mb-1">{t.name}</p>
                  <p className="text-xs text-forest-500 leading-relaxed">{t.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pages built ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-5">
            What's built — {PAGES.length} pages, {19} API routes
          </h2>
          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-forest-50">
              {PAGES.map((p) => (
                <div key={p.route} className="flex items-center gap-4 px-5 py-3 hover:bg-forest-50 transition-colors">
                  <code className="text-xs font-mono text-forest-600 w-40 flex-shrink-0">{p.route}</code>
                  <span className="text-sm font-medium text-forest-800 w-40 flex-shrink-0">{p.label}</span>
                  <span className="text-xs text-forest-400">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sponsors ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-5">
            Sponsor integrations — {SPONSORS.length} of 9
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {SPONSORS.map((s) => (
              <div key={s.name} className="p-4 rounded-xl border border-forest-100 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-forest-900 text-sm">{s.name}</p>
                  <span className="badge-green text-xs">{s.track}</span>
                </div>
                <p className="text-xs text-forest-500 leading-relaxed">{s.how}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RentIts bonus strategy ── */}
        <section className="bg-forest-900 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-cream-200" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-cream-100 mb-2">RentIts bonus strategy</h2>
              <p className="text-forest-300 text-sm leading-relaxed mb-4">
                Every verified RentIts signup = <strong className="text-cream-200">+40 bonus points</strong>. 
                The signup CTA appears on the dashboard, rentals page, and demo page. 
                The onboarding wizard mentions RentIts benefits. Each signup is tracked in MongoDB 
                and the aggregate is exposed via <code className="bg-forest-800 px-1 rounded text-cream-300">/api/stats</code>.
              </p>
              {stats && (
                <div className="flex gap-6">
                  <div>
                    <p className="font-display text-3xl text-cream-100">{stats.rentItsSignups}</p>
                    <p className="text-xs text-forest-400">signups</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl text-cream-100">{stats.bonusPoints}</p>
                    <p className="text-xs text-forest-400">bonus points earned</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Tech stack ── */}
        <section>
          <h2 className="font-display text-2xl text-forest-900 mb-5">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Next.js 14', 'TypeScript', 'Tailwind CSS', 'MongoDB Atlas',
              'Mongoose', 'NextAuth.js', 'Meta Llama 3', 'Together.ai',
              'Twilio', 'Coinbase Commerce', 'Mapbox GL JS',
              'Zustand', 'Netlify', 'DM Serif Display', 'DM Sans',
            ].map((t) => (
              <span key={t} className="px-3 py-1.5 bg-white border border-forest-200 rounded-full text-xs font-medium text-forest-700">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Demo instructions ── */}
        <section className="card border-forest-200">
          <h2 className="font-display text-xl text-forest-900 mb-4">Demo instructions for judges</h2>
          <ol className="space-y-3">
            {[
              { step: '1', text: 'Visit /demo for an overview of all features and live stats.' },
              { step: '2', text: 'Sign in at /auth/signin using the demo account: demo@iitb.ac.in (magic link).' },
              { step: '3', text: 'Dashboard → check the getting-started checklist and live metrics.' },
              { step: '4', text: 'Match → run the quiz to see AI-scored roommate results with Llama summaries.' },
              { step: '5', text: 'Splits → the "Powai Terrace" group is pre-seeded with expenses and balances.' },
              { step: '6', text: 'Lease → paste any rental agreement text to see AI red-flag analysis.' },
              { step: '7', text: 'Rentals → click "Sign up for RentIts" to test the +40 bonus points flow.' },
              { step: '8', text: 'Research → view the live survey dashboard with real student responses.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-forest-900 text-cream-100 text-xs flex items-center justify-center flex-shrink-0 font-medium mt-0.5">
                  {item.step}
                </span>
                <span className="text-sm text-forest-600 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-5 border-t border-forest-100 flex gap-3">
            <Link href="/demo" className="btn-primary text-sm">
              Open demo <ArrowRight size={13} />
            </Link>
            <Link href="/auth/signin" className="btn-secondary text-sm">
              Sign in as demo user
            </Link>
          </div>
        </section>

      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav { display: none !important; }
          body { background: white !important; }
          .card { border: 1px solid #e0ddd4 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
