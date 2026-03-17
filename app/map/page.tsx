'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Users, Home, Filter, X, ExternalLink, Loader2 } from 'lucide-react'
import { useSession } from '@/components/layout/SupabaseAuthProvider'
import { toast } from 'sonner'

interface Listing {
  id: string
  type: 'housing' | 'profile'
  title: string
  subtitle: string
  price: number
  lat: number
  lng: number
  tags: string[]
  color: string
  contact?: {
    phone?: string
    email?: string
  }
}

// Demo listings around Mumbai/Bangalore
const demoListings: Listing[] = [
  { id: 'l1', type: 'housing', title: 'Furnished 2BHK', subtitle: 'Powai, Mumbai', price: 28000, lat: 19.1176, lng: 72.9060, tags: ['Furnished', '2 BHK', 'Metro nearby'], color: '#1e6850', contact: { phone: '+919876543210', email: 'owner1@example.com' } },
  { id: 'l2', type: 'housing', title: 'Studio apartment', subtitle: 'Andheri West, Mumbai', price: 15000, lat: 19.1194, lng: 72.8469, tags: ['Studio', 'Bills incl.', 'Students OK'], color: '#1e6850', contact: { phone: '+919876543211' } },
  { id: 'l3', type: 'housing', title: '1BHK near IIT', subtitle: 'Hiranandani, Powai', price: 20000, lat: 19.1154, lng: 72.9131, tags: ['1 BHK', 'IIT Bombay 5 min', 'No brokerage'], color: '#1e6850', contact: { email: 'owner2@example.com' } },
  { id: 'l4', type: 'profile', title: 'Priya Sharma', subtitle: 'IIT Bombay · CSE Y2', price: 14000, lat: 19.1330, lng: 72.9155, tags: ['Night owl', 'Clean', '₹8k–14k'], color: '#2d8265', contact: { phone: '+919876543212' } },
  { id: 'l5', type: 'profile', title: 'Aditya Mehta', subtitle: 'IIM-A · MBA Y1', price: 18000, lat: 19.1067, lng: 72.8990, tags: ['Flexible', 'Pet-friendly', '₹10k–18k'], color: '#2d8265' },
  { id: 'l6', type: 'housing', title: 'PG for students', subtitle: 'Koramangala, Bangalore', price: 9000, lat: 12.9352, lng: 77.6245, tags: ['PG', 'Meals incl.', 'Mixed'], color: '#1e6850', contact: { phone: '+919876543213' } },
  { id: 'l7', type: 'housing', title: '3BHK shared flat', subtitle: 'HSR Layout, Bangalore', price: 11000, lat: 12.9082, lng: 77.6476, tags: ['3 BHK', '1 room avail.', 'Near metro'], color: '#1e6850' },
  { id: 'l8', type: 'profile', title: 'Kavya Reddy', subtitle: 'BITS Pilani · Biotech Y1', price: 10000, lat: 12.9266, lng: 77.6366, tags: ['Early bird', 'Very clean', '₹6k–12k'], color: '#2d8265' },
]

export default function MapPage() {
  const { data: session } = useSession()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [filter, setFilter] = useState<'all' | 'housing' | 'profile'>('all')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const markersRef = useRef<any[]>([])

  const filtered = demoListings.filter(
    (l) => filter === 'all' || l.type === filter
  )

  const handleContact = (listing: Listing) => {
    if (listing.contact?.phone) {
      toast.success(`Opening WhatsApp connection for ${listing.title}`)
      window.open(`https://wa.me/${listing.contact.phone.replace(/[^0-9]/g, '')}`, '_blank')
    } else if (listing.contact?.email) {
      toast.success(`Opening Mail for ${listing.title}`)
      window.location.href = `mailto:${listing.contact.email}`
    } else {
      toast.info(`Contacting landlord for ${listing.title}... (Owner will reach out)`)
    }
  }

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      setMapError(true)
      return
    }

    let map: any
    async function initMap() {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        // @ts-ignore
        await import('mapbox-gl/dist/mapbox-gl.css')

        mapboxgl.accessToken = token!
        map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [72.9060, 19.1176],
          zoom: 11,
        })

        map.addControl(new mapboxgl.NavigationControl(), 'top-right')

        map.on('load', () => {
          setMapLoaded(true)
          mapRef.current = map
          addMarkers(map, mapboxgl)
        })
      } catch {
        setMapError(true)
      }
    }
    initMap()
    return () => map?.remove()
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      addMarkers(mapRef.current, mapboxgl)
    })
  }, [filter, mapLoaded])

  function addMarkers(map: any, mapboxgl: any) {
    filtered.forEach((listing) => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer select-none'
      el.style.cssText = `
        width: 32px; height: 32px; border-radius: 50%;
        background: ${listing.color}; color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 600;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: transform 0.15s;
      `
      el.innerHTML = listing.type === 'housing' ? '🏠' : '👤'
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
      el.addEventListener('click', () => setSelected(listing))

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.lng, listing.lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }

  // Fallback static map when Mapbox token not set
  if (mapError) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
            <MapPin size={18} className="text-forest-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-forest-900">Housing map</h1>
            <p className="text-sm text-forest-400">Listings near your campus</p>
          </div>
        </div>

        <div className="card mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700 font-medium mb-1">Map not configured</p>
          <p className="text-xs text-amber-600">
            Add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{' '}
            <code className="bg-amber-100 px-1 rounded">.env.local</code> to enable the interactive map.
            Get a free token at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="underline">mapbox.com</a>.
          </p>
        </div>

        {/* Static listing cards as fallback */}
        <div className="grid sm:grid-cols-2 gap-4">
          {demoListings.filter((l) => l.type === 'housing').map((l) => (
            <div key={l.id} className="card hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-forest-900 text-sm">{l.title}</h3>
                  <p className="text-xs text-forest-400">{l.subtitle}</p>
                </div>
                <span className="font-display text-lg text-forest-900">₹{l.price.toLocaleString()}<span className="text-xs text-forest-400 font-body">/mo</span></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {l.tags.map((t) => (
                  <span key={t} className="badge-green text-xs">{t}</span>
                ))}
              </div>
              <button 
                onClick={() => handleContact(l)}
                className="btn-secondary text-xs mt-3 w-full justify-center"
              >
                Contact landlord
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col" style={{ marginLeft: 0 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-forest-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
            <MapPin size={15} className="text-forest-700" />
          </div>
          <div>
            <h1 className="font-display text-lg text-forest-900">Housing map</h1>
            <p className="text-xs text-forest-400">{filtered.length} listings shown</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {([
            { value: 'all', label: 'All', icon: Filter },
            { value: 'housing', label: 'Housing', icon: Home },
            { value: 'profile', label: 'Flatmates', icon: Users },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === value
                  ? 'bg-forest-900 text-cream-100 border-forest-900'
                  : 'border-forest-200 text-forest-600 hover:border-forest-400'
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map + panel */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Map */}
        <div ref={mapContainer} className="flex-1 h-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-50">
            <div className="flex items-center gap-2 text-forest-400 text-sm">
              <div className="w-5 h-5 border-2 border-forest-200 border-t-forest-600 rounded-full animate-spin" />
              Loading map…
            </div>
          </div>
        )}

        {/* Selected listing panel */}
        {selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl border border-forest-100 shadow-xl p-5 z-10">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 p-1 rounded-lg text-forest-400 hover:text-forest-700 hover:bg-forest-50 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${selected.type === 'housing' ? 'bg-forest-100' : 'bg-cream-100'}`}>
                {selected.type === 'housing' ? '🏠' : '👤'}
              </div>
              <div>
                <h3 className="font-medium text-forest-900 text-sm">{selected.title}</h3>
                <p className="text-xs text-forest-400">{selected.subtitle}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-display text-xl text-forest-900">₹{selected.price.toLocaleString()}</p>
                <p className="text-[10px] text-forest-400">/month</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {selected.tags.map((t) => (
                <span key={t} className={`badge text-xs ${selected.type === 'housing' ? 'badge-green' : 'badge-cream'}`}>{t}</span>
              ))}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleContact(selected)}
                className="btn-primary text-xs flex-1 justify-center"
              >
                {selected.type === 'housing' ? 'Enquire' : 'Connect'}
              </button>
              <button className="btn-secondary text-xs px-3" title="Open in maps">
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
