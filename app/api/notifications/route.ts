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

    if (!currentUser) return NextResponse.json({ notifications: [], unreadCount: 0 })

    const { data: notifications, error: dbError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (dbError) throw dbError

    const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0

    return NextResponse.json({ notifications: notifications || [], unreadCount })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, markAllRead } = await req.json()
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (markAllRead) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser.id)
        .eq('read', false)
      if (updateError) throw updateError
    } else if (id) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', currentUser.id)
      if (updateError) throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Notifications PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
