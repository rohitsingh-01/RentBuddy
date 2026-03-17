import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const mongoUser = await User.findOne({ email: user.email }).lean()

    if (!mongoUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: mongoUser })
  } catch (error) {
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
    await connectDB()

    const allowedFields: Record<string, any> = {}

    if (body.name) allowedFields.name = body.name
    if (body.phoneNumber !== undefined) allowedFields.phoneNumber = body.phoneNumber
    if (body.profile) {
      const p = body.profile
      if (p.bio !== undefined) allowedFields['profile.bio'] = p.bio
      if (p.location !== undefined) allowedFields['profile.location'] = p.location
      if (p.course !== undefined) allowedFields['profile.course'] = p.course
      if (p.year !== undefined) allowedFields['profile.year'] = p.year ? parseInt(p.year) : undefined
      if (p.moveInDate !== undefined) allowedFields['profile.moveInDate'] = p.moveInDate ? new Date(p.moveInDate) : undefined
      if (p.budget) allowedFields['profile.budget'] = p.budget
      if (p.lifestyle) allowedFields['profile.lifestyle'] = p.lifestyle
    }

    const updated = await User.findOneAndUpdate(
      { email: user.email },
      { $set: allowedFields },
      { new: true, lean: true }
    )

    return NextResponse.json({ user: updated, success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
