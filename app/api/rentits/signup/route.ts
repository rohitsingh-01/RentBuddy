import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
            email: user.email,
            name: user.user_metadata?.full_name || 'User',
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
    await supabase
      .from('profiles')
      .update({
        rent_its_signed_up: true,
        rent_its_user_id: rentItsUserId || `sim_${Date.now()}`
      })
      .eq('email', user.email)

    return NextResponse.json({ success: true, bonusPoints: 40 })
  } catch (error) {
    console.error('RentIts signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
