import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import { Match } from '@/models/Match'
import { User } from '@/models/User'
import { Notification } from '@/models/Notification'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId, action } = await req.json()
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await connectDB()
    const currentUser = await User.findOne({ email: user.email })
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const match = await Match.findById(matchId)
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Confirm this user is part of the match
    const isParticipant = match.users.some(
      (u: any) => u.toString() === currentUser._id.toString()
    )
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    match.status = action === 'accept' ? 'accepted' : 'declined'
    await match.save()

    // Notify the other person if accepted
    if (action === 'accept') {
      const otherId = match.users.find(
        (u: any) => u.toString() !== currentUser._id.toString()
      )
      if (otherId) {
        await Notification.create({
          user: otherId,
          type: 'match_accepted',
          title: 'Match accepted!',
          message: `${currentUser.name} accepted your roommate match request.`,
          link: '/match',
        })
      }
    }

    return NextResponse.json({ match, success: true })
  } catch (err: any) {
    console.error('Match respond error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
