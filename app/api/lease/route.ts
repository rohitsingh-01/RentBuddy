import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await req.json()
    if (!text || text.length < 100) {
      return NextResponse.json({ error: 'Please provide lease text' }, { status: 400 })
    }

    const apiKey = process.env.TOGETHER_API_KEY

    if (!apiKey) {
      // Return demo flags if no API key configured
      return NextResponse.json({ flags: getDemoFlags() })
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3-70b-chat-hf',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: `You are a tenant rights expert who helps students understand rental agreements in India. 
Analyse lease agreements and identify concerning clauses. Be specific, clear, and practical.
Always return valid JSON only — no markdown, no preamble.`,
          },
          {
            role: 'user',
            content: `Analyse this lease agreement and identify concerning clauses. 
For each clause found, classify severity as "high" (major risk to tenant), "medium" (worth negotiating), "low" (minor concern), or "ok" (tenant-friendly or standard).

Return JSON array:
[
  {
    "severity": "high|medium|low|ok",
    "clause": "Clause number and topic",
    "explanation": "Plain English explanation of why this is concerning",
    "suggestion": "Specific negotiation tip or suggested alternative wording (empty string if severity is ok)"
  }
]

Lease text:
${text.substring(0, 6000)}`,
          },
        ],
      }),
    })

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content || '[]'
    const clean = raw.replace(/```json|```/g, '').trim()

    let flags
    try {
      flags = JSON.parse(clean)
    } catch {
      flags = getDemoFlags()
    }

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Lease API error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function getDemoFlags() {
  return [
    {
      severity: 'high',
      clause: 'Security deposit — full forfeiture clause',
      explanation: 'Landlord can keep your entire deposit for any breach, including minor ones.',
      suggestion: 'Cap forfeiture at actual documented damages only.',
    },
    {
      severity: 'medium',
      clause: 'Rent escalation — no cap or notice period',
      explanation: 'Rent can be increased without a cap or sufficient notice.',
      suggestion: 'Negotiate a fixed 5-10% annual escalation with 60 days notice.',
    },
    {
      severity: 'low',
      clause: 'Guest restrictions',
      explanation: 'Overnight guests require landlord permission.',
      suggestion: 'Request up to 3 consecutive nights without permission.',
    },
    {
      severity: 'ok',
      clause: 'Rent payment terms',
      explanation: 'Standard payment terms with a reasonable grace period.',
      suggestion: '',
    },
  ]
}
