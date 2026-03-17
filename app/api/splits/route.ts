import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { RentSplit } from '@/models/RentSplit'

// GET /api/splits - list all splits for the current user
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const mongoUser = await User.findOne({ email: user.email })
    if (!mongoUser) return NextResponse.json({ splits: [] })

    const splits = await RentSplit.find({
      $or: [
        { createdBy: mongoUser._id },
        { 'members.user': mongoUser._id },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json({ splits })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/splits - create a new split group
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const creator = await User.findOne({ email: user.email })
    if (!creator) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const split = await RentSplit.create({
      name: body.name || 'My Flat',
      createdBy: creator._id,
      currency: body.currency || 'INR',
      members: [
        {
          user: creator._id,
          name: creator.name,
          email: creator.email,
          balance: 0,
        },
        ...(body.members || []),
      ],
      expenses: [],
    })

    // Link split to user
    await User.findByIdAndUpdate(creator._id, {
      $addToSet: { splits: split._id },
    })

    return NextResponse.json({ split }, { status: 201 })
  } catch (error) {
    console.error('Split create error:', error)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
