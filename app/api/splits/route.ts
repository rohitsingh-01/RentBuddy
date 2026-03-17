import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (!currentUser) return NextResponse.json({ splits: [] })

    // Fetch splits where user is a member
    const { data: userSplits } = await supabase
      .from('split_members')
      .select('split_id')
      .eq('user_id', currentUser.id)

    if (!userSplits || userSplits.length === 0) {
      return NextResponse.json({ splits: [] })
    }

    const splitIds = userSplits.map((s: any) => s.split_id)

    // Fetch full split details including members and expenses
    const { data: splits, error } = await supabase
      .from('rent_splits')
      .select(`
        *,
        members:split_members(*),
        expenses:split_expenses(*)
      `)
      .in('id', splitIds)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ splits: splits || [] })
  } catch (error) {
    console.error('Splits GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
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

    const { data: creator } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', user.email)
      .maybeSingle()

    if (!creator) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // 1. Create Split
    const { data: split, error: splitError } = await supabase
      .from('rent_splits')
      .insert({
        name: body.name || 'My Flat',
        currency: body.currency || 'INR',
        total_expenses: 0,
        created_by: creator.id,
        invite_code: inviteCode
      })
      .select()
      .single()

    if (splitError) throw splitError

    // 2. Add members to members table
    const membersToInsert = [
      {
        split_id: split.id,
        user_id: creator.id,
        name: creator.name,
        email: creator.email,
        balance: 0
      },
      ...(body.members || []).map((m: any) => ({
        split_id: split.id,
        user_id: m.user_id || m.user,  // support dynamic binds
        name: m.name,
        email: m.email,
        balance: 0
      }))
    ]

    const { error: membersError } = await supabase
      .from('split_members')
      .insert(membersToInsert)

    if (membersError) throw membersError

    // Wrap for compatibility
    const responseSplit = {
      ...split,
      members: membersToInsert,
      expenses: []
    }

    return NextResponse.json({ split: responseSplit }, { status: 201 })
  } catch (error) {
    console.error('Split create error:', error)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
