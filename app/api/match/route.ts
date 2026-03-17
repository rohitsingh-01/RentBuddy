import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Compatibility scoring algorithm
function computeCompatibility(a: any, b: any): number {
  let score = 50 // base
  const la = a.profile?.lifestyle || {}
  const lb = b.profile?.lifestyle || {}

  if (la.sleepTime === lb.sleepTime) score += 15
  else if ((la.sleepTime === 'flexible') || (lb.sleepTime === 'flexible')) score += 8

  if (la.cleanliness === lb.cleanliness) score += 12
  else if (
    (la.cleanliness === 'very-clean' && lb.cleanliness === 'relaxed') ||
    (la.cleanliness === 'relaxed' && lb.cleanliness === 'very-clean')
  ) score -= 5

  if (la.noise === lb.noise) score += 10
  if (la.guests === lb.guests) score += 8
  if (la.smoking === lb.smoking) score += 5

  const aMin = a.profile?.budget?.min || 0
  const aMax = a.profile?.budget?.max || 50000
  const bMin = b.profile?.budget?.min || 0
  const bMax = b.profile?.budget?.max || 50000
  const overlapMin = Math.max(aMin, bMin)
  const overlapMax = Math.min(aMax, bMax)
  if (overlapMax > overlapMin) score += 10

  return Math.min(100, Math.max(0, score))
}

async function getAISummary(userA: any, userB: any, score: number): Promise<{ summary: string; starter: string }> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    return {
      summary: `${userB.name} appears to be a strong match based on compatible lifestyle preferences and overlapping budget ranges.`,
      starter: `Ask ${userB.name} about their move-in timeline!`,
    }
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-70b-chat-hf',
        max_tokens: 300,
        messages: [
          { role: 'system', content: 'You are a friendly roommate matching assistant. Be concise, warm, and specific. Return JSON only.' },
          {
            role: 'user',
            content: `Generate a compatibility summary and conversation starter for these two students.
Person A: ${JSON.stringify({ name: userA.name, lifestyle: userA.profile?.lifestyle, course: userA.profile?.course })}
Person B: ${JSON.stringify({ name: userB.name, lifestyle: userB.profile?.lifestyle, course: userB.profile?.course })}
Score: ${score}/100

Return JSON: { "summary": "2-3 sentence summary of why they match", "starter": "one specific conversation starter question" }`,
          },
        ],
      }),
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      summary: `${userB.name} has a ${score >= 85 ? 'highly' : 'reasonably'} compatible lifestyle with you based on sleeping patterns, cleanliness standards, and budget range.`,
      starter: `You and ${userB.name} both prioritize ${userA.profile?.lifestyle?.noise === 'quiet' ? 'a quiet home' : 'a social atmosphere'} — ask them about their ideal living setup!`,
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    let { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    if (!currentUser) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: user.id, name: user.user_metadata?.full_name || 'User', email: user.email })
        .select().single()
      currentUser = created
    }

    // Save preferences update
    const allowedFields: Record<string, any> = {}
    if (body.budget) allowedFields.budget = body.budget
    if (body.lifestyle) allowedFields.lifestyle = body.lifestyle
    if (body.location !== undefined) allowedFields.location = body.location
    if (body.course !== undefined) allowedFields.course = body.course
    if (body.year !== undefined) allowedFields.year = body.year ? parseInt(body.year) : undefined
    if (body.bio !== undefined) allowedFields.bio = body.bio

    await supabase
      .from('profiles')
      .update(allowedFields)
      .eq('id', currentUser.id)

    // Setup nested profile shape for compatibility scoring backward compatibility
    const currentWithProfile = {
      ...currentUser,
      profile: { budget: body.budget || currentUser.budget, lifestyle: body.lifestyle || currentUser.lifestyle }
    }

    // Find candidates
    const { data: candidates } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser.id)
      .limit(20)

    if (!candidates) return NextResponse.json({ matches: [] })

    // Map candidates to have nested `.profile` to reuse algoritm
    const formattedCandidates = candidates.map(c => ({
      ...c,
      profile: { budget: c.budget, lifestyle: c.lifestyle, course: c.course, year: c.year }
    }))

    // Score and sort
    const scored = formattedCandidates
      .map((candidate) => ({
        candidate,
        score: computeCompatibility(currentWithProfile, candidate),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const matches = await Promise.all(
      scored.slice(0, 3).map(async ({ candidate, score }) => {
        const aiResult = await getAISummary(currentWithProfile, candidate, score)
        
        return {
          id: candidate.id,
          name: candidate.name,
          course: candidate.course,
          year: candidate.year,
          university: candidate.university_name,
          score,
          summary: aiResult.summary,
          conversationStarter: aiResult.starter,
          tags: [
            candidate.lifestyle?.sleepTime,
            candidate.lifestyle?.cleanliness,
            candidate.lifestyle?.noise,
            candidate.budget?.max ? `₹${candidate.budget.min?.toLocaleString()}–${candidate.budget.max?.toLocaleString()}` : null
          ].filter(Boolean)
        }
      })
    )

    // Save match records
    for (const match of scored.slice(0, 3)) {
      const u1 = [currentUser.id, match.candidate.id].sort()[0]
      const u2 = [currentUser.id, match.candidate.id].sort()[1]

      await supabase
        .from('matches')
        .upsert({
          user_1: u1,
          user_2: u2,
          compatibility_score: match.score,
          ai_summary: '',
          initiated_by: currentUser.id,
          status: 'pending'
        }, { onConflict: 'user_1, user_2' })
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
