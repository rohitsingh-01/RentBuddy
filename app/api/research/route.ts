import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { SurveyResponse } from '@/models/SurveyResponse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await connectDB()

    const response = await SurveyResponse.create({
      respondentEmail: body.email,
      university: body.university,
      year: body.year ? parseInt(body.year) : undefined,
      responses: {
        housingPain: body.housingPain,
        splitMethod: body.splitMethod,
        leaseConfidence: body.leaseConfidence ? parseInt(body.leaseConfidence) : 3,
        wouldUse: body.wouldUse === true || body.wouldUse === 'true',
        monthlyBudget: body.monthlyBudget ? parseInt(body.monthlyBudget) : 0,
        currentSolution: body.currentSolution,
        topFeature: body.topFeature,
        comment: body.comment,
      },
      source: body.source || 'in_app',
    })

    return NextResponse.json({ success: true, id: response._id }, { status: 201 })
  } catch (err: any) {
    console.error('Survey submit error:', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const responses = await SurveyResponse.find().lean()
    const total = responses.length

    if (total === 0) {
      return NextResponse.json({ total: 0, stats: null })
    }

    // Aggregate stats
    const wouldUseCount = responses.filter((r) => r.responses.wouldUse).length

    const painCounts: Record<string, number> = {}
    const featureCounts: Record<string, number> = {}
    const splitCounts: Record<string, number> = {}
    let totalConfidence = 0
    let totalBudget = 0

    responses.forEach((r) => {
      const pain = r.responses.housingPain
      const feature = r.responses.topFeature
      const split = r.responses.splitMethod

      if (pain) painCounts[pain] = (painCounts[pain] || 0) + 1
      if (feature) featureCounts[feature] = (featureCounts[feature] || 0) + 1
      if (split) splitCounts[split] = (splitCounts[split] || 0) + 1
      totalConfidence += r.responses.leaseConfidence || 0
      totalBudget += r.responses.monthlyBudget || 0
    })

    const topPain = Object.entries(painCounts).sort((a, b) => b[1] - a[1])
    const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])
    const topSplit = Object.entries(splitCounts).sort((a, b) => b[1] - a[1])

    return NextResponse.json({
      total,
      stats: {
        wouldUsePct: Math.round((wouldUseCount / total) * 100),
        avgLeaseConfidence: parseFloat((totalConfidence / total).toFixed(1)),
        avgBudget: Math.round(totalBudget / total),
        topPains: topPain.slice(0, 3).map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) })),
        topFeatures: topFeature.slice(0, 4).map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) })),
        splitMethods: topSplit.slice(0, 4).map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) })),
        quotes: responses
          .filter((r) => r.responses.comment && r.responses.comment.length > 20)
          .slice(0, 3)
          .map((r) => ({ text: r.responses.comment!, university: r.university, year: r.year })),
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}
