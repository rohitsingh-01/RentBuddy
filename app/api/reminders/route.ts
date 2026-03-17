import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, name, amount, groupName } = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !from) {
      // Dev mode: simulate success
      console.log(`[DEV] Would send SMS to ${to}: ${name} owes ₹${amount} for ${groupName}`)
      return NextResponse.json({ success: true, dev: true })
    }

    const twilio = require('twilio')(accountSid, authToken)

    const message = await twilio.messages.create({
      body: `Hi ${name}! 👋 Friendly reminder from RentBuddy — you owe ₹${amount?.toLocaleString()} for ${groupName}. Settle up at rentbuddy.app/splits`,
      from,
      to,
    })

    return NextResponse.json({ success: true, sid: message.sid })
  } catch (error: any) {
    console.error('Twilio error:', error)
    return NextResponse.json({ error: error.message || 'SMS failed' }, { status: 500 })
  }
}
