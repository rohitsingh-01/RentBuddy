import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatSplit(split: any) {
  if (!split) return null
  return {
    _id: split.id,
    name: split.name,
    currency: split.currency || 'INR',
    totalExpenses: split.total_expenses || 0,
    inviteCode: split.invite_code,
    members: (split.members || []).map((m: any) => ({
      user: m.user_id,
      name: m.name,
      email: m.email,
      balance: m.balance || 0
    })),
    expenses: (split.expenses || []).map((e: any) => ({
      _id: e.id,
      title: e.title,
      amount: e.amount,
      paidBy: e.paid_by,
      category: e.category,
      date: e.date
    }))
  }
}

// GET /api/splits/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: split, error: splitError } = await supabase
      .from('rent_splits')
      .select(`
        *,
        members:split_members(*),
        expenses:split_expenses(*)
      `)
      .eq('id', params.id)
      .maybeSingle()

    if (!split || splitError) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ split: formatSplit(split) })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/splits/[id] - add expense, settle up, add member
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // 1. Fetch related tables
    const { data: split } = await supabase.from('rent_splits').select('*').eq('id', params.id).single()
    const { data: members } = await supabase.from('split_members').select('*').eq('split_id', params.id)
    const { data: expenses } = await supabase.from('split_expenses').select('*').eq('split_id', params.id)

    if (!split || !members || !expenses) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Recalculate helper
    const updateBalancesAndTotal = async (currentExpenses: any[], currentMembers: any[]) => {
      const totalExpenses = currentExpenses.reduce((s: number, e: any) => s + e.amount, 0)
      const perPerson = currentMembers.length > 0 ? totalExpenses / currentMembers.length : 0

      // Update members in memory
      const updatedMembers = currentMembers.map((m: any) => {
        const paid = currentExpenses
          .filter((e: any) => e.paid_by === m.user_id)
          .reduce((s: number, e: any) => s + e.amount, 0)
        return { ...m, balance: paid - perPerson }
      })

      // Update Database
      await supabase.from('rent_splits').update({ total_expenses: totalExpenses }).eq('id', params.id)
      for (const m of updatedMembers) {
         await supabase.from('split_members').update({ balance: m.balance }).eq('id', m.id)
      }
      return { totalExpenses, updatedMembers }
    }

    // A. Add expense
    if (body.action === 'add_expense') {
      const expInsert = {
        split_id: params.id,
        title: body.title,
        amount: Number(body.amount),
        paid_by: body.paidBy,
        split_between: body.splitBetween || members.map((m: any) => m.user_id),
        date: body.date ? new Date(body.date) : new Date(),
        category: body.category || 'other',
      }
      const { data: insertedExp } = await supabase.from('split_expenses').insert(expInsert).select().single()
      const newExpenses = [...expenses, insertedExp]
      const { totalExpenses, updatedMembers } = await updateBalancesAndTotal(newExpenses, members)

      const responseSplit = formatSplit({ ...split, total_expenses: totalExpenses, members: updatedMembers, expenses: newExpenses })
      return NextResponse.json({ split: responseSplit })
    }

    // B. Remove expense
    if (body.action === 'remove_expense') {
      await supabase.from('split_expenses').delete().eq('id', body.expenseId)
      const newExpenses = expenses.filter((e: any) => e.id !== body.expenseId)
      const { totalExpenses, updatedMembers } = await updateBalancesAndTotal(newExpenses, members)

      const responseSplit = formatSplit({ ...split, total_expenses: totalExpenses, members: updatedMembers, expenses: newExpenses })
      return NextResponse.json({ split: responseSplit })
    }

    // C. Add member
    if (body.action === 'add_member') {
      const { data: memberProfile } = await supabase.from('profiles').select('id').eq('email', body.email).maybeSingle()
      
      const { data: insertedMember } = await supabase
        .from('split_members')
        .insert({
          split_id: params.id,
          user_id: memberProfile ? memberProfile.id : null, 
          name: body.name,
          email: body.email,
          balance: 0
        })
        .select()
        .single()

      const newMembers = [...members, insertedMember]
      const { totalExpenses, updatedMembers } = await updateBalancesAndTotal(expenses, newMembers)

      const responseSplit = formatSplit({ ...split, total_expenses: totalExpenses, members: updatedMembers, expenses: expenses })
      return NextResponse.json({ split: responseSplit })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Split patch error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/splits/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('rent_splits').delete().eq('id', params.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
