import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { RentSplit } from '@/models/RentSplit'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { splitId, memberId, amount, description } = await req.json()

    const apiKey = process.env.COINBASE_COMMERCE_API_KEY

    // Dev/demo mode — return a simulated charge
    if (!apiKey) {
      return NextResponse.json({
        charge: {
          id: `demo_${Date.now()}`,
          code: 'DEMO1234',
          hosted_url: `https://commerce.coinbase.com/charges/DEMO1234`,
          pricing: {
            local: { amount: String(amount), currency: 'INR' },
          },
          timeline: [{ status: 'NEW' }],
        },
        demo: true,
      })
    }

    await connectDB()
    const split = await RentSplit.findById(splitId)
    if (!split) return NextResponse.json({ error: 'Split not found' }, { status: 404 })

    // Create Coinbase Commerce charge
    const res = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: `Rent payment — ${split.name}`,
        description: description || `Rent split payment for ${split.name}`,
        local_price: {
          amount: String(amount),
          currency: 'INR',
        },
        pricing_type: 'fixed_price',
        metadata: {
          splitId,
          memberId,
          payerEmail: session.user.email,
        },
        redirect_url: `${process.env.NEXTAUTH_URL}/splits?paid=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/splits`,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Coinbase error')

    return NextResponse.json({ charge: data.data })
  } catch (err: any) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
