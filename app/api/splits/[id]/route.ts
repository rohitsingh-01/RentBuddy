import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import { RentSplit } from '@/models/RentSplit'
import { User } from '@/models/User'
import mongoose from 'mongoose'

// GET /api/splits/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const split = await RentSplit.findById(params.id).lean()
    if (!split) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ split })
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
    await connectDB()

    const split = await RentSplit.findById(params.id)
    if (!split) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Add expense
    if (body.action === 'add_expense') {
      const exp = {
        _id: new mongoose.Types.ObjectId(),
        title: body.title,
        amount: Number(body.amount),
        paidBy: body.paidBy,
        splitBetween: body.splitBetween || split.members.map((m: any) => m.user),
        date: new Date(body.date || Date.now()),
        category: body.category || 'other',
      }
      split.expenses.push(exp as any)

      // Recalculate balances
      recalculateBalances(split)
      split.totalExpenses = split.expenses.reduce((s: number, e: any) => s + e.amount, 0)
      await split.save()
      return NextResponse.json({ split })
    }

    // Remove expense
    if (body.action === 'remove_expense') {
      split.expenses = split.expenses.filter((e: any) => e._id.toString() !== body.expenseId)
      recalculateBalances(split)
      split.totalExpenses = split.expenses.reduce((s: number, e: any) => s + e.amount, 0)
      await split.save()
      return NextResponse.json({ split })
    }

    // Add member
    if (body.action === 'add_member') {
      const memberUser = await User.findOne({ email: body.email })
      split.members.push({
        user: memberUser?._id || new mongoose.Types.ObjectId(),
        name: body.name,
        email: body.email,
        balance: 0,
      })
      recalculateBalances(split)
      await split.save()
      return NextResponse.json({ split })
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

    await connectDB()
    await RentSplit.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

function recalculateBalances(split: any) {
  const perPerson = split.totalExpenses / split.members.length

  split.members = split.members.map((m: any) => {
    const paid = split.expenses
      .filter((e: any) => e.paidBy?.toString() === m.user?.toString())
      .reduce((s: number, e: any) => s + e.amount, 0)
    return { ...m.toObject(), balance: paid - perPerson }
  })
}
