'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { User, CheckCircle2, AlertCircle, Phone, BookOpen, MapPin, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiGet, apiPatch } from '@/hooks/useApi'

interface ProfileForm {
  name: string
  phoneNumber: string
  course: string
  year: string
  location: string
  bio: string
  moveInDate: string
  budgetMin: number
  budgetMax: number
  sleepTime: string
  cleanliness: string
  noise: string
  guests: string
  smoking: boolean
  pets: boolean
}

const defaultForm: ProfileForm = {
  name: '',
  phoneNumber: '',
  course: '',
  year: '',
  location: '',
  bio: '',
  moveInDate: '',
  budgetMin: 5000,
  budgetMax: 15000,
  sleepTime: '',
  cleanliness: '',
  noise: '',
  guests: '',
  smoking: false,
  pets: false,
}

const selectOpts: Record<string, { value: string; label: string }[]> = {
  sleepTime: [
    { value: 'early', label: 'Early bird (before 11 pm)' },
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
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Occasionally on weekends' },
    { value: 'often', label: 'Often' },
  ],
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [form, setForm] = useState<ProfileForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { user } = await apiGet('/api/profile')
        setForm({
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
          course: user.profile?.course || '',
          year: user.profile?.year?.toString() || '',
          location: user.profile?.location || '',
          bio: user.profile?.bio || '',
          moveInDate: user.profile?.moveInDate
            ? new Date(user.profile.moveInDate).toISOString().split('T')[0]
            : '',
          budgetMin: user.profile?.budget?.min ?? 5000,
          budgetMax: user.profile?.budget?.max ?? 15000,
          sleepTime: user.profile?.lifestyle?.sleepTime || '',
          cleanliness: user.profile?.lifestyle?.cleanliness || '',
          noise: user.profile?.lifestyle?.noise || '',
          guests: user.profile?.lifestyle?.guests || '',
          smoking: user.profile?.lifestyle?.smoking ?? false,
          pets: user.profile?.lifestyle?.pets ?? false,
        })
      } catch {
        toast.error('Could not load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const set = (field: keyof ProfileForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPatch('/api/profile', {
        name: form.name,
        phoneNumber: form.phoneNumber,
        profile: {
          course: form.course,
          year: form.year,
          location: form.location,
          bio: form.bio,
          moveInDate: form.moveInDate || undefined,
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
      })
      toast.success('Profile saved!')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-forest-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    )
  }

  const completionFields = [
    form.name,
    form.course,
    form.year,
    form.location,
    form.sleepTime,
    form.cleanliness,
    form.budgetMin,
  ]
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  )

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium">
            {form.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'ST'}
          </div>
          <div>
            <h1 className="font-display text-2xl text-forest-900">Your profile</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {(session?.user as any)?.isVerified ? (
                <span className="flex items-center gap-1 text-xs text-forest-600">
                  <CheckCircle2 size={11} /> Verified student
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle size={11} /> Use a .edu email to verify
                </span>
              )}
              <span className="text-forest-200">·</span>
              <span className="text-xs text-forest-400">{completionPct}% complete</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Saving…
            </span>
          ) : (
            <><Save size={14} /> Save changes</>
          )}
        </button>
      </div>

      {/* Completion bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-forest-400 mb-1.5">
          <span>Profile completeness</span>
          <span>{completionPct}%</span>
        </div>
        <div className="h-1.5 bg-forest-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        {completionPct < 100 && (
          <p className="text-xs text-forest-400 mt-1.5">
            A complete profile gets 3× more roommate match visibility.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <User size={15} className="text-forest-500" />
            <h2 className="font-medium text-forest-800 text-sm">Basic info</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="label">Course / programme</label>
              <input
                className="input-field"
                value={form.course}
                onChange={(e) => set('course', e.target.value)}
                placeholder="e.g. B.Tech CSE"
              />
            </div>
            <div>
              <label className="label">Year of study</label>
              <select
                className="input-field"
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
              >
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">About you</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="What are you like to live with? What do you value in a home?"
              />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <Phone size={15} className="text-forest-500" />
            <h2 className="font-medium text-forest-800 text-sm">Contact</h2>
          </div>
          <div>
            <label className="label">Phone number</label>
            <input
              className="input-field"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              placeholder="+91 98765 43210"
              type="tel"
            />
            <p className="text-xs text-forest-400 mt-1.5">
              Used for Twilio SMS rent reminders. Never shared publicly.
            </p>
          </div>
        </section>

        {/* Housing preferences */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={15} className="text-forest-500" />
            <h2 className="font-medium text-forest-800 text-sm">Housing preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Preferred area / locality</label>
              <input
                className="input-field"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Powai, Koramangala, Viman Nagar…"
              />
            </div>
            <div>
              <label className="label">Ideal move-in date</label>
              <input
                className="input-field"
                type="date"
                value={form.moveInDate}
                onChange={(e) => set('moveInDate', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Budget range (₹/month)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="1000" max="30000" step="500"
                      value={form.budgetMin}
                      onChange={(e) => set('budgetMin', +e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-forest-800 w-16 text-right">
                      ₹{form.budgetMin.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-forest-400 mt-1">Minimum</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="5000" max="60000" step="500"
                      value={form.budgetMax}
                      onChange={(e) => set('budgetMax', +e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-forest-800 w-16 text-right">
                      ₹{form.budgetMax.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-forest-400 mt-1">Maximum</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lifestyle */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={15} className="text-forest-500" />
            <h2 className="font-medium text-forest-800 text-sm">Lifestyle — shown to matches</h2>
          </div>
          <div className="space-y-4">
            {(Object.keys(selectOpts) as (keyof typeof selectOpts)[]).map((key) => (
              <div key={key}>
                <label className="label capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  className="input-field"
                  value={(form as any)[key] || ''}
                  onChange={(e) => set(key as keyof ProfileForm, e.target.value)}
                >
                  <option value="">Select…</option>
                  {selectOpts[key].map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              {[
                { key: 'smoking', label: 'Smoker-friendly' },
                { key: 'pets', label: 'Pet-friendly' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => set(item.key as keyof ProfileForm, !(form as any)[item.key])}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    (form as any)[item.key]
                      ? 'bg-forest-900 border-forest-900 text-cream-100'
                      : 'border-forest-200 text-forest-600 hover:border-forest-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Saving…
            </span>
          ) : (
            <><Save size={14} /> Save all changes</>
          )}
        </button>
      </div>
    </div>
  )
}
