import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    if (!profile) {
      // Auto-provision profile from auth user to avoid bugs
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.full_name || 'User',
          email: user.email,
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Provisioning error:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      profile = created
    }

    // Wrap into old schema format to prevent breaking frontend
    const responseUser = {
      ...profile,
      profile: {
        bio: profile.bio,
        location: profile.location,
        course: profile.course,
        year: profile.year,
        moveInDate: profile.move_in_date,
        budget: profile.budget,
        lifestyle: profile.lifestyle
      }
    }

    return NextResponse.json({ user: responseUser })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const allowedFields: Record<string, any> = {}

    if (body.name) allowedFields.name = body.name
    if (body.phoneNumber !== undefined) allowedFields.phone_number = body.phoneNumber
    if (body.profile) {
      const p = body.profile
      if (p.bio !== undefined) allowedFields.bio = p.bio
      if (p.location !== undefined) allowedFields.location = p.location
      if (p.course !== undefined) allowedFields.course = p.course
      if (p.year !== undefined) allowedFields.year = p.year ? parseInt(p.year) : undefined
      if (p.moveInDate !== undefined) allowedFields.move_in_date = p.moveInDate ? new Date(p.moveInDate) : undefined
      if (p.budget) allowedFields.budget = p.budget
      if (p.lifestyle) allowedFields.lifestyle = p.lifestyle
    }

    const { data: updated, error: patchError } = await supabase
      .from('profiles')
      .update(allowedFields)
      .eq('email', user.email)
      .select()
      .single()

    if (patchError) {
      console.error('Profile update patch error:', patchError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    const responseUser = {
      ...updated,
      profile: {
        bio: updated.bio,
        location: updated.location,
        course: updated.course,
        year: updated.year,
        moveInDate: updated.move_in_date,
        budget: updated.budget,
        lifestyle: updated.lifestyle
      }
    }

    return NextResponse.json({ user: responseUser, success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
