import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const updateFields: Record<string, any> = {
      onboarding_complete: true,
    }

    if (body.profile) {
      const p = body.profile
      if (p.course)    updateFields.course = p.course
      if (p.year)      updateFields.year = parseInt(p.year)
      if (p.location)  updateFields.location = p.location
      if (p.bio)       updateFields.bio = p.bio
      if (p.budget)    updateFields.budget = p.budget
      if (p.lifestyle) updateFields.lifestyle = p.lifestyle
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('email', user.email)
      .select()
      .single()

    if (error) {
       console.error('Onboarding update error:', error)
       return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Fire welcome notification
    if (updatedProfile) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', updatedProfile.id)
        .eq('type', 'system')
        .eq('title', 'Welcome to RentBuddy!')
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('notifications')
          .insert({
            user_id: updatedProfile.id,
            type: 'system',
            title: 'Welcome to RentBuddy!',
            message: 'Your profile is set up. Start by finding a roommate match or scanning your lease.',
            link: '/dashboard',
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
