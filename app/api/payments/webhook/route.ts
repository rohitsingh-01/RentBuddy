import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import { RentSplit } from '@/models/RentSplit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-cc-webhook-signature') || ''
    const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET

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
        await connectDB()
        // Mark member balance as settled
        await RentSplit.findOneAndUpdate(
          { _id: splitId, 'members.user': memberId },
          { $set: { 'members.$.balance': 0 } }
        )
        console.log(`Payment confirmed: split=${splitId} member=${memberId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
