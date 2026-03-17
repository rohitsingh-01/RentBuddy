import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { Notification } from '@/models/Notification'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 })

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({ notifications, unreadCount })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, markAllRead } = await req.json()
    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (markAllRead) {
      await Notification.updateMany({ user: user._id, read: false }, { $set: { read: true } })
    } else if (id) {
      await Notification.findOneAndUpdate({ _id: id, user: user._id }, { $set: { read: true } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
