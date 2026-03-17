import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { RentSplit } from '@/models/RentSplit'
import { Match } from '@/models/Match'
import { SurveyResponse } from '@/models/SurveyResponse'

export async function GET() {
  try {
    await connectDB()

    const [users, splits, matches, surveys] = await Promise.all([
      User.countDocuments(),
      RentSplit.countDocuments(),
      Match.countDocuments({ status: 'accepted' }),
      SurveyResponse.countDocuments(),
    ])

    const rentItsSignups = await User.countDocuments({ rentItsSignedUp: true })
    const verifiedStudents = await User.countDocuments({ isVerified: true })

    const splitAgg = await RentSplit.aggregate([
      { $group: { _id: null, total: { $sum: '$totalExpenses' } } },
    ])
    const totalExpensesTracked = splitAgg[0]?.total || 0

    return NextResponse.json({
      users,
      verifiedStudents,
      splits,
      matches,
      surveys,
      rentItsSignups,
      totalExpensesTracked,
      bonusPoints: rentItsSignups * 40,
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}
