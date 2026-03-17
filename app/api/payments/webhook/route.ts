import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-cc-webhook-signature') || ''
    const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET

    const supabase = createClient()

    // Verify signature
    if (webhookSecret) {
      const hmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      if (hmac !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const { type, data } = event.event

    // Only act on confirmed payments
    if (type === 'charge:confirmed' || type === 'charge:resolved') {
      const { splitId, memberId } = data.metadata || {}
      if (splitId && memberId) {
        // Mark member balance as settled
        const { error: updateError } = await supabase
          .from('split_members')
          .update({ balance: 0 })
          .eq('split_id', splitId)
          .eq('user_id', memberId)

        if (updateError) {
           console.error('Webhook DB update error:', updateError)
        } else {
           console.log(`Payment confirmed: split=${splitId} member=${memberId}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
