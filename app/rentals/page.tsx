'use client'

import { useState } from 'react'
import { Package, Search, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type ItemCategory = 'all' | 'electronics' | 'furniture' | 'appliances' | 'books'

interface RentalItem {
  id: string
  name: string
  category: Exclude<ItemCategory, 'all'>
  pricePerMonth: number
  pricePerWeek: number
  deposit: number
  available: boolean
  description: string
  tags: string[]
}

const items: RentalItem[] = [
  { id: 'r1', name: 'MacBook Pro 14" M3', category: 'electronics', pricePerMonth: 3500, pricePerWeek: 1000, deposit: 5000, available: true, description: 'Perfect for coding, design, and heavy workloads. Comes with charger.', tags: ['8-core CPU', '18GB RAM', '512GB SSD'] },
  { id: 'r2', name: 'Dell Monitor 24" FHD', category: 'electronics', pricePerMonth: 800, pricePerWeek: 250, deposit: 1000, available: true, description: 'IPS panel, 75Hz, perfect for study setup.', tags: ['1080p', 'IPS', 'HDMI + VGA'] },
  { id: 'r3', name: 'Study desk with shelves', category: 'furniture', pricePerMonth: 600, pricePerWeek: 180, deposit: 800, available: true, description: 'Solid wood, 120cm wide. Fits two monitors.', tags: ['120cm', 'Solid wood', 'Shelves'] },
  { id: 'r4', name: 'Single bed + mattress', category: 'furniture', pricePerMonth: 1200, pricePerWeek: 350, deposit: 2000, available: true, description: 'Memory foam mattress, wooden frame. Delivery included.', tags: ['Single', 'Memory foam', 'Free delivery'] },
  { id: 'r5', name: 'Mini refrigerator 80L', category: 'appliances', pricePerMonth: 700, pricePerWeek: 200, deposit: 1000, available: false, description: 'Perfect for a hostel room. Energy efficient.', tags: ['80L', 'Energy A+', 'Quiet'] },
  { id: 'r6', name: 'Washing machine 6kg', category: 'appliances', pricePerMonth: 900, pricePerWeek: 280, deposit: 1500, available: true, description: 'Fully automatic front-load. Delivery and setup included.', tags: ['6kg', 'Front-load', 'Auto'] },
  { id: 'r7', name: 'GATE/GRE Prep bundle', category: 'books', pricePerMonth: 300, pricePerWeek: 100, deposit: 200, available: true, description: '12 curated prep books. Previous 10 years papers included.', tags: ['12 books', '10yr papers', 'All subjects'] },
  { id: 'r8', name: 'HP LaserJet Printer', category: 'electronics', pricePerMonth: 600, pricePerWeek: 180, deposit: 800, available: true, description: 'Fast mono laser, wireless, ideal for assignments.', tags: ['Wireless', 'Mono laser', '25ppm'] },
]

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'all', label: 'All items' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'books', label: 'Books & prep' },
]

export default function RentalsPage() {
  const [category, setCategory] = useState<ItemCategory>('all')
  const [search, setSearch] = useState('')
  const [rentItsSignedUp, setRentItsSignedUp] = useState(false)
  const [signingUp, setSigningUp] = useState(false)
  const [rentingItem, setRentingItem] = useState<string | null>(null)

  const filtered = items.filter((item) => {
    const matchCat = category === 'all' || item.category === category
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSignUp = async () => {
    setSigningUp(true)
    try {
      const res = await fetch('/api/rentits/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      setRentItsSignedUp(true)
      toast.success(`RentIts account created! +${data.bonusPoints} bonus points earned 🎉`)
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setSigningUp(false)
    }
  }

  const handleRent = async (item: RentalItem) => {
    setRentingItem(item.id)
    await new Promise((r) => setTimeout(r, 1000))
    setRentingItem(null)
    toast.success(`Rental request sent for ${item.name}`)
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
            <Package size={18} className="text-forest-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-forest-900">Item rentals</h1>
            <p className="text-sm text-forest-400">Powered by RentIts</p>
          </div>
        </div>
      </div>

      {/* RentIts CTA banner */}
      {!rentItsSignedUp ? (
        <div className="bg-forest-900 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-cream-300" />
              <span className="text-xs font-medium text-cream-300 uppercase tracking-wide">Exclusive offer</span>
            </div>
            <h3 className="font-display text-lg text-cream-100 mb-1">Sign up for RentIts and earn +40 bonus points</h3>
            <p className="text-sm text-forest-300">Access 500+ rental items across India. Cancel anytime.</p>
          </div>
          <button
            onClick={handleSignUp}
            disabled={signingUp}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-cream-100 text-forest-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors disabled:opacity-70"
          >
            {signingUp ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-forest-300 border-t-forest-800 rounded-full animate-spin" />
                Joining…
              </span>
            ) : (
              <>Sign up free <ExternalLink size={12} /></>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-forest-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-forest-800">You're a RentIts member — +40 bonus points earned!</p>
            <p className="text-xs text-forest-500 mt-0.5">All items below are available to rent through your RentIts account.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
          <input
            className="input-field pl-9"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                category === c.value
                  ? 'bg-forest-900 text-cream-100 border-forest-900'
                  : 'border-forest-200 text-forest-600 hover:border-forest-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className={`card flex flex-col transition-all duration-150 ${!item.available ? 'opacity-60' : 'hover:-translate-y-0.5'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-medium text-forest-900 text-sm leading-snug">{item.name}</h3>
                <p className="text-xs text-forest-400 mt-0.5">{item.category}</p>
              </div>
              {!item.available && (
                <span className="badge bg-gray-100 text-gray-500 text-xs flex-shrink-0">Unavailable</span>
              )}
            </div>
            <p className="text-xs text-forest-500 leading-relaxed mb-3 flex-1">{item.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.tags.map((tag) => (
                <span key={tag} className="badge-green text-xs">{tag}</span>
              ))}
            </div>
            <div className="border-t border-forest-100 pt-3 mt-auto">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-lg font-display text-forest-900">₹{item.pricePerMonth.toLocaleString()}<span className="text-xs text-forest-400 font-body">/mo</span></p>
                  <p className="text-xs text-forest-400">₹{item.pricePerWeek.toLocaleString()}/wk · ₹{item.deposit.toLocaleString()} deposit</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRent(item)}
                  disabled={!item.available || rentingItem === item.id}
                  className="btn-primary text-xs px-3 py-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rentingItem === item.id ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border border-cream-300 border-t-cream-100 rounded-full animate-spin" />
                      Requesting…
                    </span>
                  ) : 'Rent this'}
                </button>
                <button
                  onClick={() => toast.info('Crypto payment via Coinbase — coming in Phase 3!')}
                  className="btn-secondary text-xs px-3 py-2"
                  title="Pay with crypto"
                >
                  ₿
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package size={32} className="text-forest-200 mx-auto mb-3" />
          <p className="text-forest-400 text-sm">No items match your search</p>
        </div>
      )}
    </div>
  )
}
