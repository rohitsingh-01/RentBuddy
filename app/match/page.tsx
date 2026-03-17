'use client'

import { useState } from 'react'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { Users, Sparkles, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const steps = [
  {
    id: 'budget',
    title: "What's your budget?",
    subtitle: "Monthly rent you're comfortable with (₹)",
  },
  {
    id: 'lifestyle',
    title: 'Your lifestyle',
    subtitle: 'Honest answers lead to better matches',
  },
  {
    id: 'location',
    title: 'Where are you looking?',
    subtitle: 'City or area near your campus',
  },
]

type LifestyleKey = 'sleepTime' | 'cleanliness' | 'noise' | 'guests'

const lifestyleOptions: Record<LifestyleKey, { value: string; label: string }[]> = {
  sleepTime: [
    { value: 'early', label: 'Early bird (before 11pm)' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'night-owl', label: 'Night owl (after midnight)' },
  ],
  cleanliness: [
    { value: 'very-clean', label: 'Very clean — things have a place' },
    { value: 'clean', label: 'Generally tidy' },
    { value: 'relaxed', label: 'Relaxed — lived-in is fine' },
  ],
  noise: [
    { value: 'quiet', label: 'Quiet — I need to focus' },
    { value: 'moderate', label: 'Some background noise is OK' },
    { value: 'social', label: 'I love a lively home' },
  ],
  guests: [
    { value: 'rarely', label: 'Rarely — my home is my sanctuary' },
    { value: 'sometimes', label: 'Occasionally on weekends' },
    { value: 'often', label: 'Often — the more the merrier' },
  ],
}

interface FormData {
  budgetMin: number
  budgetMax: number
  lifestyle: Partial<Record<LifestyleKey, string>>
  smoking: boolean
  pets: boolean
  location: string
  course: string
  year: string
  bio: string
}

const defaultForm: FormData = {
  budgetMin: 5000,
  budgetMax: 15000,
  lifestyle: {},
  smoking: false,
  pets: false,
  location: '',
  course: '',
  year: '',
  bio: '',
}

// Fake matches for demo
const demoMatches = [
  {
    id: '1',
    name: 'Priya Sharma',
    course: 'B.Tech CSE',
    year: 2,
    university: 'IIT Bombay',
    score: 94,
    summary: 'Priya is a night owl who loves quiet study sessions and occasionally hosts small gatherings. Her tidy habits and similar budget range make her a near-perfect match.',
    conversationStarter: "You both enjoy late-night coding sessions — ask Priya what she's currently building!",
    tags: ['Night owl', 'Tidy', 'Non-smoker', '₹8k–14k'],
    initials: 'PS',
  },
  {
    id: '2',
    name: 'Aditya Mehta',
    course: 'MBA Finance',
    year: 1,
    university: 'IIM Ahmedabad',
    score: 87,
    summary: "Aditya keeps flexible hours and values a clean shared space. He's pet-friendly and rarely brings guests over, making for a peaceful living arrangement.",
    conversationStarter: 'Aditya moved from Delhi recently — ask him about his transition to campus life!',
    tags: ['Flexible', 'Pet-friendly', 'Quiet', '₹10k–18k'],
    initials: 'AM',
  },
  {
    id: '3',
    name: 'Kavya Reddy',
    course: 'M.Sc Biotechnology',
    year: 1,
    university: 'BITS Pilani',
    score: 81,
    summary: "Kavya is an early riser with a very clean living style. Her research schedule means she's rarely home in the evenings, giving you plenty of personal space.",
    conversationStarter: "You both have similar move-in timelines — ask Kavya if she's seen any good listings yet!",
    tags: ['Early bird', 'Very clean', 'Non-smoker', '₹6k–12k'],
    initials: 'KR',
  },
]

export default function MatchPage() {
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState(demoMatches)

  const setLifestyle = (key: LifestyleKey, value: string) => {
    setForm((f) => ({ ...f, lifestyle: { ...f.lifestyle, [key]: value } }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: { min: form.budgetMin, max: form.budgetMax },
          lifestyle: {
            sleepTime: form.lifestyle.sleepTime,
            cleanliness: form.lifestyle.cleanliness,
            noise: form.lifestyle.noise,
            guests: form.lifestyle.guests,
            smoking: form.smoking,
            pets: form.pets,
          },
          location: form.location,
          course: form.course,
          year: form.year,
          bio: form.bio,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Match failed')
      // Use real matches if returned, otherwise fall back to demo
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches)
      }
      setSubmitted(true)
      toast.success(`${data.matches?.length || 3} matches found!`)
    } catch (err: any) {
      // Fall back to demo matches on error (e.g. dev without DB)
      setSubmitted(true)
      toast.success('Matches found! (demo mode)')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (matchId: string, action: 'accept' | 'decline') => {
    if (matchId.length < 5) {
      toast.success(action === 'accept' ? 'Connection request sent! (demo mode)' : 'Skipped (demo mode)')
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
      return
    }

    try {
      const res = await fetch('/api/match/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to respond')

      toast.success(action === 'accept' ? 'Connection request sent!' : 'Skipped')
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const ScoreRing = ({ score }: { score: number }) => (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="22" fill="none" stroke="#e8f0ec" strokeWidth="4" />
        <circle
          cx="28" cy="28" r="22" fill="none"
          stroke={score >= 90 ? '#1e6850' : score >= 80 ? '#2d8265' : '#4fa082'}
          strokeWidth="4"
          strokeDasharray={`${(score / 100) * 138} 138`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-forest-800">{score}</span>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-forest-500" />
            <span className="text-sm text-forest-500">AI-powered matches</span>
          </div>
          <h1 className="font-display text-3xl text-forest-900">Your top roommate matches</h1>
        </div>

        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="card hover:-translate-y-0.5 transition-transform duration-150">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium text-sm flex-shrink-0">
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-forest-900">{m.name}</h3>
                      <p className="text-xs text-forest-400">{m.course} · Year {m.year} · {m.university}</p>
                    </div>
                    <ScoreRing score={m.score} />
                  </div>
                  <p className="text-sm text-forest-600 mt-3 leading-relaxed">{m.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {m.tags.map((tag) => (
                      <span key={tag} className="badge-green text-xs px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-cream-50 border border-cream-200">
                    <p className="text-xs text-cream-700">
                      <span className="font-medium">Conversation starter:</span> {m.conversationStarter}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleRespond(m.id, 'accept')}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => handleRespond(m.id, 'decline')}
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      Not interested
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setSubmitted(false); setStep(0); setForm(defaultForm) }}
          className="mt-6 text-sm text-forest-500 underline underline-offset-2"
        >
          Update my preferences
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
          <Users size={18} className="text-forest-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-forest-900">Roommate matching</h1>
          <p className="text-sm text-forest-400">Step {step + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-forest-700' : 'bg-forest-100'}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="card mb-6">
        <h2 className="font-display text-xl text-forest-900 mb-1">{steps[step].title}</h2>
        <p className="text-sm text-forest-400 mb-6">{steps[step].subtitle}</p>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">Minimum monthly rent</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-forest-500 w-8">₹</span>
                <input
                  type="range" min="2000" max="30000" step="500"
                  value={form.budgetMin}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMin: +e.target.value }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-forest-800 w-16 text-right">
                  {form.budgetMin.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <label className="label">Maximum monthly rent</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-forest-500 w-8">₹</span>
                <input
                  type="range" min="2000" max="50000" step="500"
                  value={form.budgetMax}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMax: +e.target.value }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-forest-800 w-16 text-right">
                  {form.budgetMax.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Your course</label>
                <input
                  className="input-field"
                  placeholder="e.g. B.Tech CSE"
                  value={form.course}
                  onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Year of study</label>
                <select
                  className="input-field"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                >
                  <option value="">Select year</option>
                  {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {(Object.keys(lifestyleOptions) as LifestyleKey[]).map((key) => (
              <div key={key}>
                <label className="label capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="grid grid-cols-1 gap-2">
                  {lifestyleOptions[key].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLifestyle(key, opt.value)}
                      className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                        form.lifestyle[key] === opt.value
                          ? 'bg-forest-900 border-forest-900 text-cream-100'
                          : 'bg-white border-forest-200 text-forest-700 hover:border-forest-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-4 pt-2">
              {[
                { key: 'smoking', label: 'Smoker-friendly' },
                { key: 'pets', label: 'Pet-friendly' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setForm((f) => ({ ...f, [item.key]: !f[item.key as keyof FormData] }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form[item.key as keyof FormData]
                      ? 'bg-forest-900 border-forest-900 text-cream-100'
                      : 'border-forest-200 text-forest-600 hover:border-forest-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="label">Preferred area / locality</label>
              <input
                className="input-field"
                placeholder="e.g. Powai, Andheri West, Viman Nagar…"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">A little about you (optional)</label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="What kind of person are you to live with? What are you looking for in a home?"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
              <p className="text-xs text-forest-400 mt-1.5">This is shown to potential matches.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < steps.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cream-300 border-t-cream-100 rounded-full animate-spin" />
                Finding matches…
              </span>
            ) : (
              <>
                <Sparkles size={14} />
                Find my matches
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
