'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Loader2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { toast } from 'sonner'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

const typeLabels: Record<string, { label: string; color: string }> = {
  match_request:    { label: 'Match',   color: 'bg-forest-100 text-forest-700' },
  match_accepted:   { label: 'Match',   color: 'bg-green-50 text-green-700' },
  payment_due:      { label: 'Payment', color: 'bg-coral-400/10 text-coral-600' },
  payment_received: { label: 'Payment', color: 'bg-forest-100 text-forest-600' },
  lease_scanned:    { label: 'Lease',   color: 'bg-cream-100 text-cream-700' },
  system:           { label: 'System',  color: 'bg-gray-100 text-gray-600' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const router = useRouter()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {
      toast.error('Could not load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    setMarking(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All marked as read')
    } finally {
      setMarking(false)
    }
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n._id }),
      })
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      )
    }
    if (n.link) router.push(n.link)
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
            <Bell size={18} className="text-forest-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-forest-900">Notifications</h1>
            {unread > 0 && (
              <p className="text-sm text-forest-400">{unread} unread</p>
            )}
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} disabled={marking} className="btn-ghost text-sm">
            {marking ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
            Mark all read
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-forest-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-forest-100 mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-forest-100 rounded w-1/3" />
                  <div className="h-2.5 bg-forest-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={28} className="text-forest-200 mx-auto mb-3" />
            <p className="text-sm text-forest-400">No notifications yet</p>
            <p className="text-xs text-forest-300 mt-1">
              Match requests, payment alerts, and updates appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-50">
            {notifications.map((n) => {
              const meta = typeLabels[n.type] || typeLabels.system
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={clsx(
                    'w-full text-left px-5 py-4 transition-colors flex items-start gap-4 group',
                    n.read
                      ? 'bg-white hover:bg-forest-50'
                      : 'bg-forest-50/50 hover:bg-forest-100/50'
                  )}
                >
                  <div className="mt-2 flex-shrink-0">
                    <div className={clsx(
                      'w-2 h-2 rounded-full',
                      n.read ? 'bg-transparent' : 'bg-forest-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge text-xs ${meta.color}`}>{meta.label}</span>
                        <span className={clsx(
                          'text-sm font-medium',
                          n.read ? 'text-forest-600' : 'text-forest-900'
                        )}>
                          {n.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-forest-300">{timeAgo(n.createdAt)}</span>
                        {n.link && (
                          <ExternalLink
                            size={11}
                            className="text-forest-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-forest-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
