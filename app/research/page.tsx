'use client'

import { useEffect, useState } from 'react'
import { BarChart2, Users, TrendingUp, MessageSquare, ChevronRight, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface Stats {
  total: number
  stats: {
    wouldUsePct: number
    avgLeaseConfidence: number
    avgBudget: number
    topPains: { label: string; count: number; pct: number }[]
    topFeatures: { label: string; count: number; pct: number }[]
    splitMethods: { label: string; count: number; pct: number }[]
    quotes: { text: string; university?: string; year?: number }[]
  } | null
}

const PAIN_OPTIONS = [
  'Finding trustworthy flatmates',
  'Splitting rent fairly',
  'Understanding my lease',
  'Finding affordable housing near campus',
  'Managing shared expenses',
  'Dealing with landlord disputes',
]

const FEATURE_OPTIONS = [
  'AI roommate matching',
  'Rent split calculator',
  'Lease red-flag scanner',
  'Item rentals (RentIts)',
  'Housing map',
  'SMS payment reminders',
]

const SPLIT_OPTIONS = [
  'WhatsApp / manual messages',
  'Spreadsheet',
  'Splitwise / another app',
  'One person pays, others Venmo/UPI',
  'We rarely track it',
]

type FormStep = 'intro' | 'survey' | 'done'

const emptyForm = {
  email: '', university: '', year: '',
  housingPain: '', splitMethod: '', leaseConfidence: '3',
  wouldUse: 'true', monthlyBudget: '', currentSolution: '',
  topFeature: '', comment: '',
}

function BarRow({ label, pct, count }: { label: string; pct: number; count: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-forest-700">{label}</span>
        <span className="text-forest-500 text-xs font-medium">{pct}% · {count}</span>
      </div>
      <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-forest-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-forest-900 text-cream-100 rounded-2xl p-5">
      <p className="text-xs text-forest-300 mb-1">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      {sub && <p className="text-xs text-forest-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function ResearchPage() {
  const [step, setStep] = useState<FormStep>('intro')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [surveyStep, setSurveyStep] = useState(0)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/research')
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error('Could not load research data')
    } finally {
      setLoadingStats(false)
    }
  }

  const set = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function submit() {
    if (!form.housingPain || !form.topFeature || !form.splitMethod) {
      toast.error('Please answer all required questions')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStep('done')
      await loadStats()
      toast.success('Response recorded — thank you!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const surveyPages = [
    // Page 0 — housing pain
    <div key="p0" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-800 mb-3">
          What's your biggest housing challenge as a student? <span className="text-coral-500">*</span>
        </p>
        <div className="space-y-2">
          {PAIN_OPTIONS.map((o) => (
            <button
              key={o}
              onClick={() => set('housingPain', o)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                form.housingPain === o
                  ? 'bg-forest-900 border-forest-900 text-cream-100'
                  : 'bg-white border-forest-200 text-forest-700 hover:border-forest-400'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Page 1 — rent splitting
    <div key="p1" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-800 mb-3">
          How do you currently split rent with flatmates? <span className="text-coral-500">*</span>
        </p>
        <div className="space-y-2">
          {SPLIT_OPTIONS.map((o) => (
            <button
              key={o}
              onClick={() => set('splitMethod', o)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                form.splitMethod === o
                  ? 'bg-forest-900 border-forest-900 text-cream-100'
                  : 'bg-white border-forest-200 text-forest-700 hover:border-forest-400'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Page 2 — lease confidence
    <div key="p2" className="space-y-5">
      <div>
        <p className="text-sm font-medium text-forest-800 mb-1">
          How confident are you reading a rental lease agreement?
        </p>
        <p className="text-xs text-forest-400 mb-4">1 = very uncertain, 5 = very confident</p>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => set('leaseConfidence', String(n))}
              className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                form.leaseConfidence === String(n)
                  ? 'bg-forest-900 border-forest-900 text-cream-100'
                  : 'border-forest-200 text-forest-600 hover:border-forest-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-forest-800 mb-3">Monthly rent budget (₹)</p>
        <input
          className="input-field"
          type="number"
          placeholder="e.g. 12000"
          value={form.monthlyBudget}
          onChange={(e) => set('monthlyBudget', e.target.value)}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-forest-800 mb-2">Would you use RentBuddy?</p>
        <div className="flex gap-3">
          {['true', 'false'].map((v) => (
            <button
              key={v}
              onClick={() => set('wouldUse', v)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.wouldUse === v
                  ? 'bg-forest-900 border-forest-900 text-cream-100'
                  : 'border-forest-200 text-forest-600 hover:border-forest-400'
              }`}
            >
              {v === 'true' ? 'Yes, definitely' : 'Probably not'}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Page 3 — top feature + comment
    <div key="p3" className="space-y-5">
      <div>
        <p className="text-sm font-medium text-forest-800 mb-3">
          Which feature would help you most? <span className="text-coral-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FEATURE_OPTIONS.map((o) => (
            <button
              key={o}
              onClick={() => set('topFeature', o)}
              className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                form.topFeature === o
                  ? 'bg-forest-900 border-forest-900 text-cream-100'
                  : 'bg-white border-forest-200 text-forest-700 hover:border-forest-400'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">University (optional)</label>
        <input className="input-field" placeholder="e.g. IIT Bombay" value={form.university} onChange={(e) => set('university', e.target.value)} />
      </div>
      <div>
        <label className="label">Any other thoughts? (optional)</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="What housing problem frustrates you most? What's missing from existing tools?"
          value={form.comment}
          onChange={(e) => set('comment', e.target.value)}
        />
      </div>
    </div>,
  ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
          <BarChart2 size={18} className="text-cream-800" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-forest-900">Research receipts</h1>
          <p className="text-sm text-forest-400">Student housing pain-points · HackRent 2026</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Survey panel */}
        <div className="lg:col-span-2">
          {step === 'intro' && (
            <div className="card">
              <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center mb-4">
                <MessageSquare size={18} className="text-forest-700" />
              </div>
              <h2 className="font-display text-xl text-forest-900 mb-2">Take the survey</h2>
              <p className="text-sm text-forest-500 leading-relaxed mb-5">
                Help us understand real student housing pain-points. Takes 2 minutes. 
                Your response directly improves RentBuddy.
              </p>
              <ul className="space-y-2 mb-6">
                {['Anonymous — no personal data stored', '4 short questions', 'Results visible to all students'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-forest-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-forest-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setStep('survey')} className="btn-primary w-full justify-center">
                Start survey <ArrowRight size={14} />
              </button>
            </div>
          )}

          {step === 'survey' && (
            <div className="card">
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {surveyPages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= surveyStep ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-forest-400 mb-5">
                Question {surveyStep + 1} of {surveyPages.length}
              </p>

              {surveyPages[surveyStep]}

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-forest-100">
                <button
                  onClick={() => surveyStep === 0 ? setStep('intro') : setSurveyStep((s) => s - 1)}
                  className="btn-ghost text-sm"
                >
                  Back
                </button>
                {surveyStep < surveyPages.length - 1 ? (
                  <button
                    onClick={() => setSurveyStep((s) => s + 1)}
                    className="btn-primary"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Submitting…
                      </span>
                    ) : (
                      <>Submit response <ChevronRight size={14} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="card text-center py-8">
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={22} className="text-forest-600" />
              </div>
              <h2 className="font-display text-xl text-forest-900 mb-2">Thank you!</h2>
              <p className="text-sm text-forest-500 mb-5">
                Your response has been recorded. Check the live results on the right.
              </p>
              <button
                onClick={() => { setStep('intro'); setForm(emptyForm); setSurveyStep(0) }}
                className="btn-secondary mx-auto"
              >
                Take again
              </button>
            </div>
          )}
        </div>

        {/* Live results panel */}
        <div className="lg:col-span-3 space-y-5">
          {loadingStats ? (
            <div className="card flex items-center gap-2 text-forest-400 text-sm py-12 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading results…
            </div>
          ) : !stats?.stats ? (
            <div className="card text-center py-12">
              <Users size={28} className="text-forest-200 mx-auto mb-3" />
              <p className="text-sm text-forest-400">No responses yet — be the first!</p>
            </div>
          ) : (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Responses"
                  value={String(stats.total)}
                  sub="students surveyed"
                />
                <StatCard
                  label="Would use"
                  value={`${stats.stats.wouldUsePct}%`}
                  sub="say yes"
                />
                <StatCard
                  label="Avg budget"
                  value={`₹${stats.stats.avgBudget.toLocaleString()}`}
                  sub="per month"
                />
              </div>

              {/* Pain points */}
              <div className="card">
                <h3 className="font-display text-lg text-forest-900 mb-4">Top pain-points</h3>
                <div className="space-y-3">
                  {stats.stats.topPains.map((p) => (
                    <BarRow key={p.label} label={p.label} pct={p.pct} count={p.count} />
                  ))}
                </div>
              </div>

              {/* Feature demand */}
              <div className="card">
                <h3 className="font-display text-lg text-forest-900 mb-4">Most wanted features</h3>
                <div className="space-y-3">
                  {stats.stats.topFeatures.map((f) => (
                    <BarRow key={f.label} label={f.label} pct={f.pct} count={f.count} />
                  ))}
                </div>
              </div>

              {/* Split methods */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display text-lg text-forest-900">How students currently split rent</h3>
                  <div className="badge-coral text-xs ml-2 flex-shrink-0">the gap we fill</div>
                </div>
                <div className="space-y-3">
                  {stats.stats.splitMethods.map((s) => (
                    <BarRow key={s.label} label={s.label} pct={s.pct} count={s.count} />
                  ))}
                </div>
              </div>

              {/* Lease confidence */}
              <div className="card">
                <h3 className="font-display text-lg text-forest-900 mb-1">Lease confidence score</h3>
                <p className="text-xs text-forest-400 mb-4">Average self-reported confidence (1–5 scale)</p>
                <div className="flex items-center gap-4">
                  <p className="font-display text-5xl text-forest-900">{stats.stats.avgLeaseConfidence}</p>
                  <div>
                    <p className="text-sm font-medium text-forest-700">
                      {stats.stats.avgLeaseConfidence <= 2.5
                        ? 'Most students feel lost'
                        : stats.stats.avgLeaseConfidence <= 3.5
                        ? 'Majority feel uncertain'
                        : 'Moderate confidence'}
                    </p>
                    <p className="text-xs text-forest-400 mt-0.5">out of 5.0 · {stats.total} respondents</p>
                  </div>
                </div>
              </div>

              {/* Quotes */}
              {stats.stats.quotes.length > 0 && (
                <div className="card">
                  <h3 className="font-display text-lg text-forest-900 mb-4">In their own words</h3>
                  <div className="space-y-4">
                    {stats.stats.quotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="border-l-2 border-forest-300 pl-4"
                      >
                        <p className="text-sm text-forest-700 italic leading-relaxed">"{q.text}"</p>
                        {(q.university || q.year) && (
                          <p className="text-xs text-forest-400 mt-1.5">
                            — {q.university}{q.year ? `, Year ${q.year}` : ''}
                          </p>
                        )}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
