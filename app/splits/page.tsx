'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import {
  Calculator, Plus, Trash2, Bell, CheckCircle2,
  Users, Loader2, ArrowRight, Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { apiGet, apiPost, apiPatch } from '@/hooks/useApi'
import { CryptoPayButton } from '@/components/ui/CryptoPayButton'

type Category = 'rent' | 'utilities' | 'groceries' | 'other'

interface Member { user: string; name: string; email: string; balance: number }
interface Expense {
  _id: string; title: string; amount: number
  paidBy: string; category: Category; date: string
}
interface Split {
  _id: string; name: string; members: Member[]
  expenses: Expense[]; totalExpenses: number
  currency: string; inviteCode: string
}

const catColors: Record<Category, string> = {
  rent: 'bg-forest-100 text-forest-700',
  utilities: 'bg-cream-100 text-cream-800',
  groceries: 'bg-green-50 text-green-700',
  other: 'bg-gray-100 text-gray-600',
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ minHeight: '400px', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="fixed inset-0 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        {children}
      </div>
    </div>
  )
}

export default function SplitsPage() {
  const { data: session } = useSession()
  const [splits, setSplits] = useState<Split[]>([])
  const [activeSplit, setActiveSplit] = useState<Split | null>(null)
  const [loadingSplits, setLoadingSplits] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newSplitName, setNewSplitName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newExpense, setNewExpense] = useState<{ title: string; amount: string; paidBy: string; category: Category }>({ title: '', amount: '', paidBy: '', category: 'other' })
  const [addingExpense, setAddingExpense] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '' })
  const [addingMember, setAddingMember] = useState(false)
  const [sendingSMS, setSendingSMS] = useState<string | null>(null)

  const loadSplits = useCallback(async () => {
    setLoadingSplits(true)
    try {
      const { splits: data } = await apiGet<{ splits: Split[] }>('/api/splits')
      setSplits(data)
      if (data.length > 0) setActiveSplit(data[0])
    } catch {
      toast.error('Could not load splits')
    } finally {
      setLoadingSplits(false)
    }
  }, [])

  useEffect(() => { loadSplits() }, [])

  const refreshActive = async (id: string) => {
    try {
      const { split } = await apiGet<{ split: Split }>(`/api/splits/${id}`)
      setActiveSplit(split)
      setSplits((prev) => prev.map((s) => (s._id === id ? split : s)))
    } catch { toast.error('Refresh failed') }
  }

  const createGroup = async () => {
    if (!newSplitName.trim()) return
    setCreatingGroup(true)
    try {
      const { split } = await apiPost<{ split: Split }>('/api/splits', { name: newSplitName })
      setSplits((prev) => [split, ...prev])
      setActiveSplit(split)
      setShowCreate(false)
      setNewSplitName('')
      toast.success('Group created!')
    } catch (err: any) { toast.error(err.message) }
    finally { setCreatingGroup(false) }
  }

  const addExpense = async () => {
    if (!activeSplit || !newExpense.title || !newExpense.amount) {
      toast.error('Fill in title and amount'); return
    }
    setAddingExpense(true)
    try {
      await apiPatch(`/api/splits/${activeSplit._id}`, {
        action: 'add_expense',
        title: newExpense.title,
        amount: Number(newExpense.amount),
        paidBy: newExpense.paidBy || activeSplit.members[0]?.user,
        category: newExpense.category,
        splitBetween: activeSplit.members.map((m) => m.user),
      })
      await refreshActive(activeSplit._id)
      setNewExpense({ title: '', amount: '', paidBy: '', category: 'other' })
      setShowAddExpense(false)
      toast.success('Expense added')
    } catch (err: any) { toast.error(err.message) }
    finally { setAddingExpense(false) }
  }

  const removeExpense = async (expenseId: string) => {
    if (!activeSplit) return
    try {
      await apiPatch(`/api/splits/${activeSplit._id}`, { action: 'remove_expense', expenseId })
      await refreshActive(activeSplit._id)
    } catch { toast.error('Remove failed') }
  }

  const addMember = async () => {
    if (!activeSplit || !newMember.name || !newMember.email) {
      toast.error('Fill in name and email'); return
    }
    setAddingMember(true)
    try {
      await apiPatch(`/api/splits/${activeSplit._id}`, { action: 'add_member', ...newMember })
      await refreshActive(activeSplit._id)
      setNewMember({ name: '', email: '' })
      setShowAddMember(false)
      toast.success(`${newMember.name} added`)
    } catch (err: any) { toast.error(err.message) }
    finally { setAddingMember(false) }
  }

  const sendReminder = async (member: Member) => {
    if (!activeSplit) return
    setSendingSMS(member.user)
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: member.email, name: member.name, amount: Math.round(Math.abs(member.balance)), groupName: activeSplit.name }),
      })
      const data = await res.json()
      toast.success(data.dev ? `Reminder logged (configure Twilio to send SMS)` : `SMS sent to ${member.name}!`)
    } catch { toast.error('Reminder failed') }
    finally { setSendingSMS(null) }
  }

  const perPerson = activeSplit ? activeSplit.totalExpenses / (activeSplit.members.length || 1) : 0

  if (loadingSplits) {
    return (
      <div className="p-8 flex items-center gap-2 text-forest-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    )
  }

  if (splits.length === 0) {
    return (
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
            <Calculator size={18} className="text-cream-800" />
          </div>
          <h1 className="font-display text-2xl text-forest-900">Rent splits</h1>
        </div>
        <div className="card text-center py-12">
          <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-cream-700" />
          </div>
          <h2 className="font-display text-xl text-forest-900 mb-2">No groups yet</h2>
          <p className="text-sm text-forest-400 mb-6 max-w-xs mx-auto">
            Create a group for your flat, add flatmates, and start tracking shared expenses.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            <Plus size={14} /> Create your first group
          </button>
        </div>
        {showCreate && (
          <Modal onClose={() => setShowCreate(false)}>
            <h3 className="font-display text-xl text-forest-900 mb-5">Create a group</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Group name</label>
                <input className="input-field" placeholder="e.g. Powai Terrace…" value={newSplitName} onChange={(e) => setNewSplitName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createGroup()} autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={createGroup} disabled={creatingGroup || !newSplitName.trim()} className="btn-primary flex-1 justify-center">
                  {creatingGroup ? <Loader2 size={14} className="animate-spin" /> : <>Create <ArrowRight size={14} /></>}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
            <Calculator size={18} className="text-cream-800" />
          </div>
          <h1 className="font-display text-2xl text-forest-900">Rent splits</h1>
        </div>
        <button onClick={() => setShowAddExpense(true)} className="btn-primary" disabled={!activeSplit}>
          <Plus size={14} /> Add expense
        </button>
      </div>

      {/* Group tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {splits.map((s) => (
          <button key={s._id} onClick={() => setActiveSplit(s)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeSplit?._id === s._id ? 'bg-forest-900 text-cream-100 border-forest-900' : 'border-forest-200 text-forest-600 hover:border-forest-400'}`}>
            {s.name}
          </button>
        ))}
        <button onClick={() => setShowCreate(true)} className="btn-ghost text-xs px-3 py-1.5">
          <Plus size={12} /> New group
        </button>
      </div>

      {activeSplit && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-forest-400">{activeSplit.members.length} members</span>
            <button onClick={() => { navigator.clipboard.writeText(activeSplit.inviteCode); toast.success('Invite code copied!') }} className="flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 ml-auto transition-colors">
              <Copy size={11} /> {activeSplit.inviteCode}
            </button>
            <button onClick={() => setShowAddMember(true)} className="btn-ghost text-xs py-1.5 px-3">
              <Users size={12} /> Add flatmate
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-forest-900 text-cream-100 rounded-2xl p-4">
              <p className="text-xs text-forest-300 mb-1">Total expenses</p>
              <p className="font-display text-2xl">₹{activeSplit.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-xs text-forest-400 mb-1">Per person</p>
              <p className="font-display text-2xl text-forest-900">₹{Math.round(perPerson).toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-xs text-forest-400 mb-1">Expenses</p>
              <p className="font-display text-2xl text-forest-900">{activeSplit.expenses.length}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-display text-lg text-forest-900 mb-4">Who owes what</h2>
              <div className="space-y-3">
                {activeSplit.members.map((m) => (
                  <div key={m.user} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-xs font-medium flex-shrink-0">
                      {m.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-forest-800 truncate">{m.name}</span>
                        <span className={`text-sm font-medium ${m.balance < 0 ? 'text-coral-600' : 'text-forest-600'}`}>
                          {m.balance < 0 ? `owes ₹${Math.round(Math.abs(m.balance)).toLocaleString()}` : `gets back ₹${Math.round(m.balance).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-forest-400 truncate">{m.email}</span>
                        {m.balance < 0 && m.email !== session?.user?.email ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => sendReminder(m)} disabled={sendingSMS === m.user} className="flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 disabled:opacity-50 transition-colors">
                              {sendingSMS === m.user ? <Loader2 size={10} className="animate-spin" /> : <Bell size={10} />}
                              Remind
                            </button>
                            <CryptoPayButton
                              splitId={activeSplit._id}
                              memberId={m.user}
                              amount={Math.round(Math.abs(m.balance))}
                              description={`Rent — ${activeSplit.name}`}
                            />
                          </div>
                        ) : <CheckCircle2 size={12} className="text-forest-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-display text-lg text-forest-900 mb-4">Expenses</h2>
              {activeSplit.expenses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-forest-400 mb-3">No expenses yet</p>
                  <button onClick={() => setShowAddExpense(true)} className="btn-secondary text-xs"><Plus size={12} /> Add first expense</button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeSplit.expenses.map((e) => {
                    const payer = activeSplit.members.find((m) => m.user === e.paidBy)
                    return (
                      <div key={e._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-forest-50 group transition-colors">
                        <span className={`badge text-xs flex-shrink-0 ${catColors[e.category]}`}>{e.category}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-forest-800 truncate">{e.title}</p>
                          <p className="text-xs text-forest-400">{payer?.name || '—'} · {e.date?.split('T')[0]}</p>
                        </div>
                        <span className="text-sm font-medium text-forest-900">₹{Number(e.amount).toLocaleString()}</span>
                        <button onClick={() => removeExpense(e._id)} className="p-1 text-forest-300 hover:text-coral-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h3 className="font-display text-xl text-forest-900 mb-5">Create a group</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Group name</label>
              <input className="input-field" placeholder="e.g. Koramangala Flat…" value={newSplitName} onChange={(e) => setNewSplitName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createGroup()} autoFocus />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={createGroup} disabled={creatingGroup || !newSplitName.trim()} className="btn-primary flex-1 justify-center">
                {creatingGroup ? <Loader2 size={14} className="animate-spin" /> : <>Create <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddExpense && activeSplit && (
        <Modal onClose={() => setShowAddExpense(false)}>
          <h3 className="font-display text-xl text-forest-900 mb-5">New expense</h3>
          <div className="space-y-4">
            <div>
              <label className="label">What was it for?</label>
              <input className="input-field" placeholder="e.g. April rent" value={newExpense.title} onChange={(e) => setNewExpense((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input-field" type="number" placeholder="0" value={newExpense.amount} onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Paid by</label>
                <select className="input-field" value={newExpense.paidBy} onChange={(e) => setNewExpense((p) => ({ ...p, paidBy: e.target.value }))}>
                  <option value="">Select…</option>
                  {activeSplit.members.map((m) => <option key={m.user} value={m.user}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={newExpense.category} onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value as Category }))}>
                  {(['rent', 'utilities', 'groceries', 'other'] as Category[]).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddExpense(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addExpense} disabled={addingExpense} className="btn-primary flex-1 justify-center">
                {addingExpense ? <Loader2 size={14} className="animate-spin" /> : 'Add expense'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddMember && (
        <Modal onClose={() => setShowAddMember(false)}>
          <h3 className="font-display text-xl text-forest-900 mb-5">Add flatmate</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input-field" placeholder="Their name" value={newMember.name} onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" placeholder="their@email.com" value={newMember.email} onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAddMember(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={addMember} disabled={addingMember} className="btn-primary flex-1 justify-center">
                {addingMember ? <Loader2 size={14} className="animate-spin" /> : 'Add flatmate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
