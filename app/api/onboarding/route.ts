import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { Notification } from '@/models/Notification'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const updateFields: Record<string, any> = {
      onboardingComplete: true,
    }

    if (body.profile) {
      const p = body.profile
      if (p.course)    updateFields['profile.course'] = p.course
      if (p.year)      updateFields['profile.year'] = parseInt(p.year)
      if (p.location)  updateFields['profile.location'] = p.location
      if (p.bio)       updateFields['profile.bio'] = p.bio
      if (p.budget)    updateFields['profile.budget'] = p.budget
      if (p.lifestyle) updateFields['profile.lifestyle'] = p.lifestyle
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateFields },
      { new: true }
    )

    // Fire welcome notification
    if (user) {
      const existing = await Notification.findOne({ user: user._id, type: 'system', title: 'Welcome to RentBuddy!' })
      if (!existing) {
        await Notification.create({
          user: user._id,
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
