import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()

    const [u, sp, mt, sur] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('rent_splits').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
      supabase.from('survey_responses').select('*', { count: 'exact', head: true })
    ])

    const { count: users } = u
    const { count: splits } = sp
    const { count: matches } = mt
    const { count: surveys } = sur

    const { count: rentItsSignups } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('rent_its_signed_up', true)

    const { count: verifiedStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    const { data: splitExpenses } = await supabase
      .from('rent_splits')
      .select('total_expenses')

    const totalExpensesTracked = splitExpenses 
      ? splitExpenses.reduce((sum: number, row: any) => sum + (row.total_expenses || 0), 0) 
      : 0

    return NextResponse.json({
      users: users || 0,
      verifiedStudents: verifiedStudents || 0,
      splits: splits || 0,
      matches: matches || 0,
      surveys: surveys || 0,
      rentItsSignups: rentItsSignups || 0,
      totalExpensesTracked,
      bonusPoints: (rentItsSignups || 0) * 40,
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}
