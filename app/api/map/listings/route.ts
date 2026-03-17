import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo listings for when DB is empty (Updated to match table schema fields)
const demoListings = [
  { title: '2BHK near IIT Powai', city: 'Mumbai', address: 'Hiranandani Gardens, Powai', lat: 19.1273, lng: 72.9058, rent: 28000, deposit: 56000, bedrooms: 2, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Geyser', 'Parking'], contact_email: 'owner1@example.com' },
  { title: 'Cozy 1BHK for students', city: 'Mumbai', address: 'Andheri West, near station', lat: 19.1197, lng: 72.8464, rent: 16000, deposit: 32000, bedrooms: 1, bathrooms: 1, furnishing: 'semi-furnished', amenities: ['WiFi', 'Geyser', 'Fan'], contact_email: 'owner2@example.com' },
  { title: 'Shared flat — 3 roommates', city: 'Mumbai', address: 'Goregaon East, SV Road', lat: 19.1663, lng: 72.8526, rent: 9000, deposit: 18000, bedrooms: 3, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Washing machine'], contact_email: 'owner3@example.com' },
  { title: 'Studio near Koramangala', city: 'Bangalore', address: '5th Block Koramangala', lat: 12.9279, lng: 77.6271, rent: 14000, deposit: 28000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Gym'], contact_email: 'owner4@example.com' },
  { title: 'PG with meals included', city: 'Bangalore', address: 'HSR Layout Sector 2', lat: 12.9116, lng: 77.6370, rent: 11000, deposit: 22000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'Meals', 'Laundry'], contact_email: 'owner5@example.com' },
  { title: 'Spacious 2BHK Indiranagar', city: 'Bangalore', address: '12th Main, Indiranagar', lat: 12.9784, lng: 77.6408, rent: 35000, deposit: 70000, bedrooms: 2, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Parking', 'Power backup'], contact_email: 'owner6@example.com' },
  { title: 'Student flat near IIT Delhi', city: 'Delhi', address: 'Hauz Khas Village', lat: 28.5494, lng: 77.2001, rent: 18000, deposit: 36000, bedrooms: 2, bathrooms: 1, furnishing: 'semi-furnished', amenities: ['WiFi', 'Geyser', 'Fan'], contact_email: 'owner7@example.com' },
  { title: 'Budget room Lajpat Nagar', city: 'Delhi', address: 'Lajpat Nagar Part 2', lat: 28.5665, lng: 77.2432, rent: 8500, deposit: 17000, bedrooms: 1, bathrooms: 1, furnishing: 'unfurnished', amenities: ['WiFi', 'Fan'], contact_email: 'owner8@example.com' },
  { title: '3BHK near BITS Pilani', city: 'Pilani', address: 'Vidya Vihar, Pilani', lat: 28.3687, lng: 75.5986, rent: 12000, deposit: 24000, bedrooms: 3, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'Geyser', 'Study room'], contact_email: 'owner9@example.com' },
  { title: 'Studio near IIM Ahmedabad', city: 'Ahmedabad', address: 'Vastrapur, near IIM', lat: 23.0395, lng: 72.5305, rent: 13000, deposit: 26000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Power backup'], contact_email: 'owner10@example.com' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const furnishing = searchParams.get('furnishing')

    const supabase = createClient()
    let query = supabase.from('listings').select('*').eq('is_active', true)

    if (city) query = query.ilike('city', `%${city}%`)
    if (maxRent) query = query.lte('rent', parseInt(maxRent))
    if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms))
    if (furnishing) query = query.eq('furnishing', furnishing)

    const { data: listings, error } = await query.limit(50)

    if (error) throw error

    // Map backward compatibility for CamelCase frontend binding
    const format = (list: any[]) => list.map(l => ({
      ...l,
      _id: l.id, // match old interface ID
      contactEmail: l.contact_email,
      contactPhone: l.contact_phone,
      postedBy: l.posted_by,
      availableFrom: l.available_from,
      isActive: l.is_active
    }))

    if (!listings || listings.length === 0) {
      try {
        await supabase.from('listings').insert(demoListings)
        const { data } = await query.limit(50)
        return NextResponse.json({ listings: format(data || []) })
      } catch {
        return NextResponse.json({ listings: demoListings })
      }
    }

    return NextResponse.json({ listings: format(listings) })
  } catch (err) {
    console.error('Listings GET error:', err)
    return NextResponse.json({ listings: demoListings })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient()

    const insertData = {
      title: body.title,
      description: body.description,
      address: body.address,
      city: body.city,
      lat: body.lat,
      lng: body.lng,
      rent: body.rent,
      deposit: body.deposit || 0,
      bedrooms: body.bedrooms || 1,
      bathrooms: body.bathrooms || 1,
      furnishing: body.furnishing || 'furnished',
      amenities: body.amenities || [],
      images: body.images || [],
      contact_email: body.contactEmail,
      contact_phone: body.contactPhone
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing }, { status: 201 })
  } catch (err: any) {
    console.error('Listings POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
