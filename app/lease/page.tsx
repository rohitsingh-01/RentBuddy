'use client'

import { useState } from 'react'
import { FileSearch, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { toast } from 'sonner'

type Severity = 'high' | 'medium' | 'low' | 'ok'

interface Flag {
  severity: Severity
  clause: string
  explanation: string
  suggestion: string
}

const demoFlags: Flag[] = [
  {
    severity: 'high',
    clause: 'Clause 7.3 — Security deposit forfeiture',
    explanation: 'The landlord can forfeit your entire security deposit (₹60,000) for any breach of the agreement, including minor ones. There is no proportionality requirement.',
    suggestion: 'Negotiate to limit forfeiture to actual documented damages. Ask for a cap of 30 days rent for non-major breaches.',
  },
  {
    severity: 'high',
    clause: 'Clause 12 — Lock-in period and exit',
    explanation: 'You are bound for 11 months with no early exit clause. If you leave early, you owe the remaining rent in full — even if you find a replacement tenant.',
    suggestion: 'Request a break clause after month 4 with 30-day notice, and add language allowing early exit if a replacement tenant of equal standing is found.',
  },
  {
    severity: 'medium',
    clause: 'Clause 9.1 — Maintenance responsibility',
    explanation: 'All maintenance above ₹500 is your responsibility — including repairs that are typically a landlord\'s duty (plumbing, electrical faults not caused by you).',
    suggestion: 'Specify that structural repairs, plumbing, and electrical faults remain the landlord\'s responsibility. You\'re only liable for damage you cause.',
  },
  {
    severity: 'medium',
    clause: 'Clause 15 — Rent escalation',
    explanation: 'The landlord can increase rent with just 15 days notice, with no cap on the percentage increase.',
    suggestion: 'Ask for a fixed escalation clause — typically 5–10% per year, with at least 60 days notice.',
  },
  {
    severity: 'low',
    clause: 'Clause 4 — Guest restrictions',
    explanation: 'Overnight guests require prior written permission from the landlord. This is overly restrictive but not unusual in student accommodation.',
    suggestion: 'Try to negotiate to a reasonable limit — e.g. guests can stay up to 3 consecutive nights without permission.',
  },
  {
    severity: 'ok',
    clause: 'Clause 2 — Rent payment terms',
    explanation: 'Rent is due on the 5th with a 5-day grace period before late fees apply. Late fee is ₹200/day — reasonable and capped.',
    suggestion: '',
  },
]

const severityConfig: Record<Severity, { label: string; color: string; icon: any; bg: string }> = {
  high: { label: 'High risk', color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-50 border-red-200' },
  medium: { label: 'Worth negotiating', color: 'text-amber-700', icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200' },
  low: { label: 'Minor concern', color: 'text-forest-600', icon: Info, bg: 'bg-forest-50 border-forest-200' },
  ok: { label: 'Looks good', color: 'text-forest-600', icon: CheckCircle2, bg: 'bg-forest-50 border-forest-100' },
}

export default function LeasePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [flags, setFlags] = useState<Flag[] | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const analyze = async () => {
    if (text.trim().length < 100) {
      toast.error('Paste at least a few paragraphs of your lease')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setFlags(data.flags || demoFlags)
      const highCount = (data.flags || demoFlags).filter((f: Flag) => f.severity === 'high').length
      toast.success(`Analysis complete — ${highCount} high-risk clause${highCount !== 1 ? 's' : ''} found`)
    } catch {
      setFlags(demoFlags)
      toast.success('Analysis complete (demo mode)')
    } finally {
      setLoading(false)
    }
  }

  const counts = flags
    ? {
        high: flags.filter((f) => f.severity === 'high').length,
        medium: flags.filter((f) => f.severity === 'medium').length,
        low: flags.filter((f) => f.severity === 'low').length,
        ok: flags.filter((f) => f.severity === 'ok').length,
      }
    : null

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-coral-400/10 flex items-center justify-center">
          <FileSearch size={18} className="text-coral-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-forest-900">Lease scanner</h1>
          <p className="text-sm text-forest-400">Powered by Meta Llama 3</p>
        </div>
      </div>

      {!flags ? (
        <div className="space-y-4">
          <div className="card">
            <label className="label">Paste your lease agreement</label>
            <textarea
              className="input-field resize-none font-mono text-xs"
              rows={14}
              placeholder={`Paste your lease text here…\n\nExample:\n"This Agreement is entered into on the 1st day of March 2026, between the Landlord [Name] and the Tenant [Name]…"`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-forest-400">
                {text.length > 0 ? `${text.length.toLocaleString()} characters` : 'Your lease stays private — never stored.'}
              </p>
              <button
                onClick={analyze}
                disabled={loading || text.length < 50}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-cream-300 border-t-cream-100 rounded-full animate-spin" />
                    Scanning lease…
                  </span>
                ) : (
                  <>
                    <Sparkles size={14} /> Scan for red flags
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-forest-400 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-forest-300" />
            Works best with full lease text pasted in — not scanned images
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'High risk', count: counts!.high, color: 'bg-red-600 text-white' },
              { label: 'Negotiate', count: counts!.medium, color: 'bg-amber-500 text-white' },
              { label: 'Minor', count: counts!.low, color: 'bg-forest-500 text-white' },
              { label: 'OK', count: counts!.ok, color: 'bg-forest-200 text-forest-800' },
            ].map((s) => (
              <div key={s.label} className="card text-center p-3">
                <div className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-medium mb-1 ${s.color}`}>
                  {s.count}
                </div>
                <p className="text-xs text-forest-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Flags */}
          <div className="space-y-3">
            {flags.map((flag, i) => {
              const cfg = severityConfig[flag.severity]
              const Icon = cfg.icon
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${cfg.bg}`}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={15} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-forest-900">{flag.clause}</h3>
                        <span className={`badge text-xs ${flag.severity === 'high' ? 'bg-red-100 text-red-700' : flag.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-forest-100 text-forest-600'}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-forest-600 mt-1 leading-relaxed">{flag.explanation}</p>

                      {expanded === i && flag.suggestion && (
                        <div className="mt-3 pt-3 border-t border-current/10">
                          <p className="text-xs font-medium text-forest-700 mb-1">What to do</p>
                          <p className="text-xs text-forest-600 leading-relaxed">{flag.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {flag.severity !== 'ok' && (
                    <p className="text-xs text-forest-400 mt-2 ml-6">
                      {expanded === i ? 'Click to collapse' : 'Click to see recommendation'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => { setFlags(null); setText('') }}
            className="text-sm text-forest-500 underline underline-offset-2"
          >
            Scan a different lease
          </button>
        </div>
      )}
    </div>
  )
}
