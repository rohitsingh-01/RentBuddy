'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Circle, ExternalLink, AlertTriangle,
  Rocket, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import { clsx } from 'clsx'

interface Task {
  id: string
  label: string
  detail?: string
  link?: string
  linkLabel?: string
  critical: boolean
  category: string
}

const TASKS: Task[] = [
  // Setup
  { id: 'mongodb',    critical: true,  category: 'Setup',     label: 'MongoDB Atlas cluster running',             detail: 'Free M0 tier at cloud.mongodb.com. Get the connection string for MONGODB_URI.',           link: 'https://cloud.mongodb.com', linkLabel: 'Open Atlas' },
  { id: 'env',        critical: true,  category: 'Setup',     label: '.env.local filled with real values',        detail: 'At minimum: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL.',                                  link: null },
  { id: 'seed',       critical: true,  category: 'Setup',     label: 'npm run seed executed against production DB',detail: 'Creates demo user, rent split, notifications, and 10 survey responses.',                  link: null },
  { id: 'deploy',     critical: true,  category: 'Setup',     label: 'Deployed to Netlify with production URL',   detail: 'Connect GitHub repo → set env vars → auto deploys.',                                      link: 'https://netlify.com', linkLabel: 'Open Netlify' },
  // APIs
  { id: 'together',   critical: false, category: 'APIs',      label: 'Together.ai key added (Llama 3 AI)',        detail: 'Free credits available at api.together.xyz — enables roommate summaries + lease scanning.', link: 'https://api.together.xyz', linkLabel: 'Get key' },
  { id: 'twilio',     critical: false, category: 'APIs',      label: 'Twilio credentials added (SMS reminders)',  detail: 'Account SID, Auth Token, phone number from console.twilio.com.',                          link: 'https://console.twilio.com', linkLabel: 'Get keys' },
  { id: 'mapbox',     critical: false, category: 'APIs',      label: 'Mapbox token added (housing map)',          detail: 'Free tier at mapbox.com — enables the interactive map page.',                             link: 'https://account.mapbox.com', linkLabel: 'Get token' },
  { id: 'coinbase',   critical: false, category: 'APIs',      label: 'Coinbase Commerce key added (crypto pay)',  detail: 'commerce.coinbase.com — enables the rent pay with crypto button.',                        link: 'https://commerce.coinbase.com', linkLabel: 'Get key' },
  { id: 'rentits',    critical: false, category: 'APIs',      label: 'RentIts API key added (+40 pts)',           detail: 'Contact the RentIts team directly — each signup = +40 bonus points on leaderboard.',      link: 'https://rentits.in', linkLabel: 'Contact RentIts' },
  // Research
  { id: 'survey10',   critical: true,  category: 'Research',  label: '10+ real survey responses collected',       detail: 'Share /research with classmates. More responses = stronger research receipt bonus.',         link: '/research', linkLabel: 'Open research page' },
  { id: 'quotes',     critical: false, category: 'Research',  label: 'At least 3 student quotes in survey',       detail: 'Real quotes in the "any other thoughts" field make the research section compelling.',       link: '/research', linkLabel: 'View results' },
  // RentIts bonus
  { id: 'rentits10',  critical: true,  category: 'Bonus',     label: '10+ RentIts signups (= 400 bonus pts)',     detail: 'Share /rentals page. Every verified signup adds +40 points. This is your score multiplier.', link: '/rentals', linkLabel: 'Open rentals' },
  { id: 'bonusclaim', critical: false, category: 'Bonus',     label: 'RentIts signups verified on leaderboard',   detail: 'Confirm with the RentIts team that your signups are verified and counted.',                  link: null },
  // Submission
  { id: 'ppt',        critical: true,  category: 'Submission',label: 'Devfolio submission PPT filled in',         detail: 'Download from hackrent.devfolio.co. Use /pitch for content — it has live stats.',            link: 'https://docs.google.com/presentation/d/1WN_yhAT6tNMFobqNSbrYmLoH0x4_mZ13nt_fAFuIUxg/edit', linkLabel: 'Download template' },
  { id: 'video',      critical: true,  category: 'Submission',label: '3-minute demo video recorded',              detail: 'Show: roommate match → lease scan → rent split → RentIts signup → map. Keep it live, no slides.',  link: null },
  { id: 'demodata',   critical: true,  category: 'Submission',label: 'Demo account has seeded data (not empty)',  detail: 'Run npm run seed. Judges should see a populated dashboard, not an empty state.',               link: '/dashboard', linkLabel: 'Check dashboard' },
  { id: 'devfolio',   critical: true,  category: 'Submission',label: 'Submitted on Devfolio by March 29',         detail: 'Include: live URL, GitHub repo, video, PPT, and description.',                               link: 'https://hackrent.devfolio.co', linkLabel: 'Open Devfolio' },
  // Polish
  { id: 'mobile',     critical: false, category: 'Polish',    label: 'Tested on mobile (judges use phones)',      detail: 'Check dashboard, match, and splits pages on a real phone or mobile viewport.',               link: null },
  { id: 'pitchpage',  critical: false, category: 'Polish',    label: '/pitch page looks good with live data',     detail: 'Visit /pitch — confirm real stats show. Share this URL with judges.',                       link: '/pitch', linkLabel: 'View pitch' },
  { id: 'demolog',    critical: false, category: 'Polish',    label: '/demo page live and accessible',            detail: 'No login required. Share this URL in your Devfolio description.',                          link: '/demo', linkLabel: 'View demo' },
  { id: 'errorfree',  critical: false, category: 'Polish',    label: 'No console errors on main pages',           detail: 'Check browser console on dashboard, match, splits, and lease pages.',                      link: null },
]

const CATEGORIES = ['Setup', 'APIs', 'Research', 'Bonus', 'Submission', 'Polish']

const DEADLINE = new Date('2026-03-29T23:59:59')

function useCountdown() {
  const [diff, setDiff] = useState(DEADLINE.getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(DEADLINE.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, past: diff < 0 }
}

export default function ChecklistPage() {
  const STORAGE_KEY = 'rentbuddy-checklist-v1'
  const [done, setDone] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const { d, h, m, s, past } = useCountdown()

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setDone(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const total = TASKS.length
  const doneCount = TASKS.filter((t) => done.has(t.id)).length
  const criticalDone = TASKS.filter((t) => t.critical && done.has(t.id)).length
  const criticalTotal = TASKS.filter((t) => t.critical).length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-forest-900 mb-1">Submission checklist</h1>
          <p className="text-sm text-forest-400">Everything needed before March 29</p>
        </div>
        <Link href="/pitch" className="btn-secondary text-xs px-3 py-2">
          <ExternalLink size={12} /> View pitch
        </Link>
      </div>

      {/* Countdown */}
      <div className={clsx(
        'rounded-2xl p-5 mb-6',
        past ? 'bg-coral-400/10 border border-coral-400/20' : 'bg-forest-900'
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className={past ? 'text-coral-600' : 'text-cream-300'} />
          <span className={clsx('text-xs font-medium', past ? 'text-coral-600' : 'text-cream-300')}>
            {past ? 'Deadline passed' : 'Time until deadline — March 29, 2026'}
          </span>
        </div>
        {!past && (
          <div className="flex gap-5">
            {[{ v: d, l: 'days' }, { v: h, l: 'hours' }, { v: m, l: 'mins' }, { v: s, l: 'secs' }].map(({ v, l }) => (
              <div key={l}>
                <p className="font-display text-3xl text-cream-100">{String(v).padStart(2, '0')}</p>
                <p className="text-xs text-forest-400">{l}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-forest-900 text-sm">{doneCount} of {total} tasks done</p>
            <p className="text-xs text-forest-400 mt-0.5">
              {criticalDone}/{criticalTotal} critical tasks complete
            </p>
          </div>
          <span className={clsx(
            'font-display text-2xl',
            pct === 100 ? 'text-forest-600' : pct >= 70 ? 'text-forest-700' : 'text-coral-600'
          )}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500',
              pct === 100 ? 'bg-forest-500' : pct >= 70 ? 'bg-forest-600' : 'bg-coral-500'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        {criticalDone < criticalTotal && (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-coral-400/5 border border-coral-400/20">
            <AlertTriangle size={13} className="text-coral-600 flex-shrink-0" />
            <p className="text-xs text-coral-700">
              {criticalTotal - criticalDone} critical task{criticalTotal - criticalDone !== 1 ? 's' : ''} still outstanding
            </p>
          </div>
        )}
        {criticalDone === criticalTotal && doneCount === total && (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-forest-50 border border-forest-200">
            <Rocket size={13} className="text-forest-600 flex-shrink-0" />
            <p className="text-xs text-forest-700 font-medium">
              All tasks done — you're ready to submit!
            </p>
          </div>
        )}
      </div>

      {/* Task list by category */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catTasks = TASKS.filter((t) => t.category === cat)
          const catDone = catTasks.filter((t) => done.has(t.id)).length
          const isCollapsed = collapsed.has(cat)

          return (
            <div key={cat} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-forest-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-forest-900 text-sm">{cat}</span>
                  <span className="text-xs text-forest-400">{catDone}/{catTasks.length}</span>
                  {catDone === catTasks.length && (
                    <CheckCircle2 size={13} className="text-forest-500" />
                  )}
                </div>
                {isCollapsed
                  ? <ChevronDown size={14} className="text-forest-400" />
                  : <ChevronUp size={14} className="text-forest-400" />
                }
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-forest-50">
                  {catTasks.map((task) => {
                    const isDone = done.has(task.id)
                    return (
                      <div
                        key={task.id}
                        className={clsx(
                          'flex items-start gap-3 px-5 py-3.5 transition-colors',
                          isDone ? 'bg-forest-50/50' : 'bg-white'
                        )}
                      >
                        <button
                          onClick={() => toggle(task.id)}
                          className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                        >
                          {isDone
                            ? <CheckCircle2 size={18} className="text-forest-600" />
                            : <Circle size={18} className="text-forest-200 hover:text-forest-400" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx(
                              'text-sm font-medium',
                              isDone ? 'text-forest-400 line-through' : 'text-forest-900'
                            )}>
                              {task.label}
                            </span>
                            {task.critical && !isDone && (
                              <span className="badge text-[10px] bg-coral-400/10 text-coral-600">required</span>
                            )}
                          </div>
                          {task.detail && (
                            <p className="text-xs text-forest-400 mt-0.5 leading-relaxed">{task.detail}</p>
                          )}
                          {task.link && (
                            <a
                              href={task.link}
                              target={task.link.startsWith('http') ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-forest-600 hover:text-forest-900 underline underline-offset-2 mt-1"
                            >
                              {task.linkLabel || 'Open'} <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-forest-300 mt-6 text-center">
        Progress saves automatically in your browser.
      </p>
    </div>
  )
}
