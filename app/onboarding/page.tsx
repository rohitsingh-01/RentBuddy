'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Users, Calculator, FileSearch, Package } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'welcome' | 'basics' | 'lifestyle' | 'budget' | 'done'

const STEPS: Step[] = ['welcome', 'basics', 'lifestyle', 'budget', 'done']

const features = [
  { icon: Users,       label: 'AI roommate matching' },
  { icon: Calculator,  label: 'Rent split tracker' },
  { icon: FileSearch,  label: 'Lease scanner' },
  { icon: Package,     label: 'Item rentals (RentIts)' },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    course: '', year: '', location: '', bio: '',
    budgetMin: 5000, budgetMax: 15000,
    sleepTime: '', cleanliness: '', noise: '', guests: '',
    smoking: false, pets: false,
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const currentIndex = STEPS.indexOf(step)
  const progress = Math.round((currentIndex / (STEPS.length - 1)) * 100)

  async function finish() {
    setSaving(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            course: form.course,
            year: form.year,
            location: form.location,
            bio: form.bio,
            budget: { min: form.budgetMin, max: form.budgetMax },
            lifestyle: {
              sleepTime: form.sleepTime || undefined,
              cleanliness: form.cleanliness || undefined,
              noise: form.noise || undefined,
              guests: form.guests || undefined,
              smoking: form.smoking,
              pets: form.pets,
            },
          },
        }),
      })
      setStep('done')
    } catch {
      toast.error('Could not save profile — skipping to dashboard')
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-forest-800 flex items-center justify-center">
            <span className="text-cream-100 font-display font-bold text-sm">R</span>
          </div>
          <span className="font-display text-xl text-forest-900">RentBuddy</span>
        </div>

        {/* Progress bar */}
        {step !== 'done' && step !== 'welcome' && (
          <div className="mb-6">
            <div className="h-1 bg-forest-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-forest-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-forest-400 mt-1.5 text-right">
              Step {currentIndex} of {STEPS.length - 2}
            </p>
          </div>
        )}

        {/* ── Welcome ── */}
        {step === 'welcome' && (
          <div className="card text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={24} className="text-forest-700" />
            </div>
            <h1 className="font-display text-3xl text-forest-900 mb-2">
              Hey {firstName}! 👋
            </h1>
            <p className="text-forest-500 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
              Let's set up your profile in 2 minutes so we can find you the perfect flatmate and housing options.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-forest-50 text-left">
                  <div className="w-7 h-7 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0">
                    <f.icon size={14} className="text-forest-700" />
                  </div>
                  <span className="text-xs font-medium text-forest-700 leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('basics')} className="btn-primary w-full justify-center">
              Get started <ArrowRight size={14} />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs text-forest-400 mt-3 hover:text-forest-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ── Basics ── */}
        {step === 'basics' && (
          <div className="card">
            <h2 className="font-display text-2xl text-forest-900 mb-1">About you</h2>
            <p className="text-sm text-forest-400 mb-6">Help matches know who they'd be living with.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Course</label>
                  <input
                    className="input-field"
                    placeholder="e.g. B.Tech CSE"
                    value={form.course}
                    onChange={(e) => set('course', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="input-field" value={form.year} onChange={(e) => set('year', e.target.value)}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Preferred area / city</label>
                <input
                  className="input-field"
                  placeholder="e.g. Powai, Koramangala…"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </div>
              <div>
                <label className="label">One-liner about you (optional)</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="What kind of flatmate are you? What matters to you in a home?"
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('welcome')} className="btn-ghost"><ArrowLeft size={14} /> Back</button>
              <button onClick={() => setStep('lifestyle')} className="btn-primary">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* ── Lifestyle ── */}
        {step === 'lifestyle' && (
          <div className="card">
            <h2 className="font-display text-2xl text-forest-900 mb-1">Your lifestyle</h2>
            <p className="text-sm text-forest-400 mb-6">Used by our AI to find compatible flatmates.</p>
            <div className="space-y-4">
              {([
                { key: 'sleepTime', label: 'Sleep schedule', opts: [['early','Early bird'],['flexible','Flexible'],['night-owl','Night owl']] },
                { key: 'cleanliness', label: 'Cleanliness', opts: [['very-clean','Very clean'],['clean','Tidy'],['relaxed','Relaxed']] },
                { key: 'noise', label: 'Home noise level', opts: [['quiet','Quiet'],['moderate','Moderate'],['social','Social']] },
                { key: 'guests', label: 'Guests', opts: [['rarely','Rarely'],['sometimes','Sometimes'],['often','Often']] },
              ] as const).map(({ key, label, opts }) => (
                <div key={key}>
                  <p className="label">{label}</p>
                  <div className="flex gap-2">
                    {opts.map(([val, text]) => (
                      <button
                        key={val}
                        onClick={() => set(key, val)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                          (form as any)[key] === val
                            ? 'bg-forest-900 border-forest-900 text-cream-100'
                            : 'border-forest-200 text-forest-600 hover:border-forest-400'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                {[['smoking','Smoker-friendly'],['pets','Pet-friendly']].map(([key, text]) => (
                  <button
                    key={key}
                    onClick={() => set(key, !(form as any)[key])}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      (form as any)[key]
                        ? 'bg-forest-900 border-forest-900 text-cream-100'
                        : 'border-forest-200 text-forest-600 hover:border-forest-400'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('basics')} className="btn-ghost"><ArrowLeft size={14} /> Back</button>
              <button onClick={() => setStep('budget')} className="btn-primary">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* ── Budget ── */}
        {step === 'budget' && (
          <div className="card">
            <h2 className="font-display text-2xl text-forest-900 mb-1">Your budget</h2>
            <p className="text-sm text-forest-400 mb-6">Monthly rent you're comfortable with.</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Minimum (₹/month)</label>
                  <span className="text-sm font-medium text-forest-800">₹{form.budgetMin.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="1000" max="30000" step="500"
                  value={form.budgetMin}
                  onChange={(e) => set('budgetMin', +e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Maximum (₹/month)</label>
                  <span className="text-sm font-medium text-forest-800">₹{form.budgetMax.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="5000" max="60000" step="500"
                  value={form.budgetMax}
                  onChange={(e) => set('budgetMax', +e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="p-4 rounded-xl bg-forest-50 border border-forest-100">
                <p className="text-xs text-forest-600">
                  Your budget range: <span className="font-medium text-forest-800">₹{form.budgetMin.toLocaleString()} – ₹{form.budgetMax.toLocaleString()}/mo</span>
                </p>
                <p className="text-xs text-forest-400 mt-1">
                  We'll only show matches whose budget overlaps with yours.
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('lifestyle')} className="btn-ghost"><ArrowLeft size={14} /> Back</button>
              <button onClick={finish} disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-cream-300 border-t-cream-100 rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>Finish setup <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="card text-center py-10">
            <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-forest-600" />
            </div>
            <h2 className="font-display text-3xl text-forest-900 mb-2">You're all set!</h2>
            <p className="text-sm text-forest-500 leading-relaxed mb-8 max-w-xs mx-auto">
              Your profile is ready. Head to your dashboard to find roommates, track rent splits, and scan your lease.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary w-full justify-center text-base py-3.5">
              Go to dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
