import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', user.email)
      .single()

    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Confirm this user is part of the match
    const isParticipant = match.user_1 === currentUser.id || match.user_2 === currentUser.id
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({ status: action === 'accept' ? 'accepted' : 'declined' })
      .eq('id', matchId)
      .select()
      .single()

    if (updateError) {
      console.error('Match update error:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Notify the other person if accepted
    if (action === 'accept') {
      const otherId = match.user_1 === currentUser.id ? match.user_2 : match.user_1
      if (otherId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: otherId,
            type: 'match_accepted',
            title: 'Match accepted!',
            message: `${currentUser.name} accepted your roommate match request.`,
            link: '/match'
          })
      }
    }

    return NextResponse.json({ match: updatedMatch, success: true })
  } catch (err: any) {
    console.error('Match respond error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
