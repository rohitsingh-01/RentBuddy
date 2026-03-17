import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Call RentIts API to create account
    const rentItsApiKey = process.env.RENTITS_API_KEY
    const rentItsUrl = process.env.RENTITS_API_URL || 'https://api.rentits.in/v1'

    let rentItsUserId: string | undefined

    if (rentItsApiKey) {
      try {
        const res = await fetch(`${rentItsUrl}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${rentItsApiKey}`,
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            source: 'rentbuddy_hackathon',
          }),
        })
        const data = await res.json()
        rentItsUserId = data.id
      } catch (err) {
        console.error('RentIts API error:', err)
      }
    }

    // Mark user as signed up (for bonus point tracking)
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        rentItsSignedUp: true,
        rentItsUserId: rentItsUserId || `sim_${Date.now()}`,
      }
    )

    return NextResponse.json({ success: true, bonusPoints: 40 })
  } catch (error) {
    console.error('RentIts signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
