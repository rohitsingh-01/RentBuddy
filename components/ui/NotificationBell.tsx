'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

const typeColors: Record<string, string> = {
  match_request: 'bg-forest-100 text-forest-700',
  match_accepted: 'bg-green-50 text-green-700',
  payment_due: 'bg-coral-400/10 text-coral-600',
  payment_received: 'bg-forest-100 text-forest-600',
  lease_scanned: 'bg-cream-100 text-cream-700',
  system: 'bg-gray-100 text-gray-600',
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  async function markAllRead() {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id: string, link?: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    if (link) {
      setOpen(false)
      router.push(link)
    }
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-forest-400 hover:text-forest-700 hover:bg-forest-50 transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-coral-500 text-white text-[9px] font-medium flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-forest-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-forest-100">
            <span className="text-sm font-medium text-forest-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 transition-colors"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={20} className="text-forest-200 mx-auto mb-2" />
                <p className="text-xs text-forest-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id, n.link)}
                  className={clsx(
                    'w-full text-left px-4 py-3 border-b border-forest-50 last:border-0 transition-colors',
                    n.read ? 'bg-white hover:bg-forest-50' : 'bg-forest-50/60 hover:bg-forest-100/60'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 flex-shrink-0" />
                    )}
                    <div className={clsx('flex-1 min-w-0', n.read && 'ml-4')}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-forest-900 leading-snug">{n.title}</p>
                        {n.link && <ExternalLink size={10} className="text-forest-300 flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-xs text-forest-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-forest-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
