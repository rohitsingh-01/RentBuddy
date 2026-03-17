import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient()

    const { data: response, error } = await supabase
      .from('survey_responses')
      .insert({
        respondent_email: body.email,
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
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: response.id }, { status: 201 })
  } catch (err: any) {
    console.error('Survey submit error:', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('*')

    if (error) throw error

    const total = responses ? responses.length : 0

    if (total === 0) {
      return NextResponse.json({ total: 0, stats: null })
    }

    // Aggregate stats (identical logic to previous memory loop)
    const wouldUseCount = responses.filter((r: any) => r.responses?.wouldUse).length

    const painCounts: Record<string, number> = {}
    const featureCounts: Record<string, number> = {}
    const splitCounts: Record<string, number> = {}
    let totalConfidence = 0
    let totalBudget = 0

    responses.forEach((r: any) => {
      const pain = r.responses?.housingPain
      const feature = r.responses?.topFeature
      const split = r.responses?.splitMethod

      if (pain) painCounts[pain] = (painCounts[pain] || 0) + 1
      if (feature) featureCounts[feature] = (featureCounts[feature] || 0) + 1
      if (split) splitCounts[split] = (splitCounts[split] || 0) + 1
      totalConfidence += r.responses?.leaseConfidence || 0
      totalBudget += r.responses?.monthlyBudget || 0
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
        topPains: topPain.slice(0, 3).map(([label, count]: any) => ({ label, count, pct: Math.round((count / total) * 100) })),
        topFeatures: topFeature.slice(0, 4).map(([label, count]: any) => ({ label, count, pct: Math.round((count / total) * 100) })),
        splitMethods: topSplit.slice(0, 4).map(([label, count]: any) => ({ label, count, pct: Math.round((count / total) * 100) })),
        quotes: responses
          .filter((r: any) => r.responses?.comment && r.responses.comment.length > 20)
          .slice(0, 3)
          .map((r: any) => ({ text: r.responses.comment!, university: r.university, year: r.year })),
      },
    })
  } catch (err) {
    console.error('Research GET error:', err)
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}
