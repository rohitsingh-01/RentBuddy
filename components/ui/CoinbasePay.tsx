'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ExternalLink } from 'lucide-react'

interface Props {
  splitId: string
  memberId: string
  amount: number
  description?: string
  className?: string
}

export default function CoinbasePay({ splitId, memberId, amount, description, className }: Props) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitId, memberId, amount, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')

      if (data.demo) {
        toast.info('Demo mode — add COINBASE_COMMERCE_API_KEY to enable real crypto payments')
        return
      }

      // Open Coinbase Commerce hosted page
      window.open(data.charge.hosted_url, '_blank', 'noopener,noreferrer')
      toast.success('Coinbase checkout opened — pay with ETH, BTC, USDC, or DOGE')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className={className || 'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-60'}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <span className="font-mono text-xs">₿</span>
      )}
      Pay ₹{amount.toLocaleString()} with crypto
      {!loading && <ExternalLink size={10} />}
    </button>
  )
}
