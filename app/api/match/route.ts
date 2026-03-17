import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'
import { Match } from '@/models/Match'

// Compatibility scoring algorithm
function computeCompatibility(a: any, b: any): number {
  let score = 50 // base
  const la = a.profile?.lifestyle || {}
  const lb = b.profile?.lifestyle || {}

  // Sleep schedule match (+15 if same, +8 if adjacent)
  if (la.sleepTime === lb.sleepTime) score += 15
  else if (
    (la.sleepTime === 'flexible') ||
    (lb.sleepTime === 'flexible')
  ) score += 8

  // Cleanliness (+12 exact, -5 if very different)
  if (la.cleanliness === lb.cleanliness) score += 12
  else if (
    (la.cleanliness === 'very-clean' && lb.cleanliness === 'relaxed') ||
    (la.cleanliness === 'relaxed' && lb.cleanliness === 'very-clean')
  ) score -= 5

  // Noise level (+10 if same)
  if (la.noise === lb.noise) score += 10

  // Guest frequency (+8 if same)
  if (la.guests === lb.guests) score += 8

  // Smoking compatibility
  if (la.smoking === lb.smoking) score += 5

  // Budget overlap
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-70b-chat-hf',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are a friendly roommate matching assistant. Be concise, warm, and specific. Return JSON only.',
          },
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
    await connectDB()

    const currentUser = await User.findOne({ email: user.email })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Save preferences
    await User.findByIdAndUpdate(currentUser._id, {
      'profile.budget': body.budget || currentUser.profile?.budget,
      'profile.lifestyle': body.lifestyle || {},
      'profile.location': body.location,
      'profile.course': body.course,
      'profile.year': body.year ? parseInt(body.year) : undefined,
      'profile.bio': body.bio,
    })

    // Find potential matches (exclude self, limit to 20 candidates)
    const candidates = await User.find({
      _id: { $ne: currentUser._id },
      isVerified: true,
    }).limit(20)

    // Score and sort
    const scored = candidates
      .map((candidate) => ({
        candidate,
        score: computeCompatibility(currentUser, candidate),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Generate AI summaries for top 3
    const matches = await Promise.all(
      scored.slice(0, 3).map(async ({ candidate, score }) => {
        const aiResult = await getAISummary(currentUser, candidate, score)
        return {
          id: candidate._id,
          name: candidate.name,
          course: candidate.profile?.course,
          year: candidate.profile?.year,
          university: candidate.universityName,
          score,
          summary: aiResult.summary,
          conversationStarter: aiResult.starter,
          tags: [
            candidate.profile?.lifestyle?.sleepTime,
            candidate.profile?.lifestyle?.cleanliness,
            candidate.profile?.lifestyle?.noise,
            candidate.profile?.budget?.max
              ? `₹${candidate.profile.budget.min?.toLocaleString()}–${candidate.profile.budget.max?.toLocaleString()}`
              : null,
          ].filter(Boolean),
        }
      })
    )

    // Save match records
    for (const match of scored.slice(0, 3)) {
      const exists = await Match.findOne({
        users: { $all: [currentUser._id, match.candidate._id] },
      })
      if (!exists) {
        await Match.create({
          users: [currentUser._id, match.candidate._id],
          compatibilityScore: match.score,
          aiSummary: '',
          initiatedBy: currentUser._id,
        })
      }
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
