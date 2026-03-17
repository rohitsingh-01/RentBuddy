'use client'

import { useState } from 'react'
import { Bitcoin, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CryptoPayButtonProps {
  splitId: string
  memberId: string
  amount: number
  description?: string
  className?: string
}

export function CryptoPayButton({
  splitId,
  memberId,
  amount,
  description,
  className = '',
}: CryptoPayButtonProps) {
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
        toast.info('Demo mode — add COINBASE_COMMERCE_API_KEY to enable real crypto payments', {
          duration: 5000,
        })
        return
      }

      // Open Coinbase hosted checkout in new tab
      window.open(data.charge.hosted_url, '_blank', 'noopener,noreferrer')
      toast.success('Coinbase checkout opened — complete payment there')
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      title="Pay with crypto via Coinbase"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-forest-200 text-xs font-medium text-forest-600 hover:bg-forest-50 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Bitcoin size={12} />
      )}
      Pay crypto
      <ExternalLink size={10} className="text-forest-400" />
    </button>
  )
}
