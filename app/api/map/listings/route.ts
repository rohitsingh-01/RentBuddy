import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Listing } from '@/models/Listing'

// Demo listings for when DB is empty
const demoListings = [
  { title: '2BHK near IIT Powai', city: 'Mumbai', address: 'Hiranandani Gardens, Powai', lat: 19.1273, lng: 72.9058, rent: 28000, deposit: 56000, bedrooms: 2, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Geyser', 'Parking'], contactEmail: 'owner1@example.com' },
  { title: 'Cozy 1BHK for students', city: 'Mumbai', address: 'Andheri West, near station', lat: 19.1197, lng: 72.8464, rent: 16000, deposit: 32000, bedrooms: 1, bathrooms: 1, furnishing: 'semi-furnished', amenities: ['WiFi', 'Geyser', 'Fan'], contactEmail: 'owner2@example.com' },
  { title: 'Shared flat — 3 roommates', city: 'Mumbai', address: 'Goregaon East, SV Road', lat: 19.1663, lng: 72.8526, rent: 9000, deposit: 18000, bedrooms: 3, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Washing machine'], contactEmail: 'owner3@example.com' },
  { title: 'Studio near Koramangala', city: 'Bangalore', address: '5th Block Koramangala', lat: 12.9279, lng: 77.6271, rent: 14000, deposit: 28000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Gym'], contactEmail: 'owner4@example.com' },
  { title: 'PG with meals included', city: 'Bangalore', address: 'HSR Layout Sector 2', lat: 12.9116, lng: 77.6370, rent: 11000, deposit: 22000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'Meals', 'Laundry'], contactEmail: 'owner5@example.com' },
  { title: 'Spacious 2BHK Indiranagar', city: 'Bangalore', address: '12th Main, Indiranagar', lat: 12.9784, lng: 77.6408, rent: 35000, deposit: 70000, bedrooms: 2, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Parking', 'Power backup'], contactEmail: 'owner6@example.com' },
  { title: 'Student flat near IIT Delhi', city: 'Delhi', address: 'Hauz Khas Village', lat: 28.5494, lng: 77.2001, rent: 18000, deposit: 36000, bedrooms: 2, bathrooms: 1, furnishing: 'semi-furnished', amenities: ['WiFi', 'Geyser', 'Fan'], contactEmail: 'owner7@example.com' },
  { title: 'Budget room Lajpat Nagar', city: 'Delhi', address: 'Lajpat Nagar Part 2', lat: 28.5665, lng: 77.2432, rent: 8500, deposit: 17000, bedrooms: 1, bathrooms: 1, furnishing: 'unfurnished', amenities: ['WiFi', 'Fan'], contactEmail: 'owner8@example.com' },
  { title: '3BHK near BITS Pilani', city: 'Pilani', address: 'Vidya Vihar, Pilani', lat: 28.3687, lng: 75.5986, rent: 12000, deposit: 24000, bedrooms: 3, bathrooms: 2, furnishing: 'furnished', amenities: ['WiFi', 'Geyser', 'Study room'], contactEmail: 'owner9@example.com' },
  { title: 'Studio near IIM Ahmedabad', city: 'Ahmedabad', address: 'Vastrapur, near IIM', lat: 23.0395, lng: 72.5305, rent: 13000, deposit: 26000, bedrooms: 1, bathrooms: 1, furnishing: 'furnished', amenities: ['WiFi', 'AC', 'Power backup'], contactEmail: 'owner10@example.com' },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const furnishing = searchParams.get('furnishing')

    await connectDB()

    const query: Record<string, any> = { isActive: true }
    if (city) query.city = { $regex: city, $options: 'i' }
    if (maxRent) query.rent = { $lte: parseInt(maxRent) }
    if (bedrooms) query.bedrooms = parseInt(bedrooms)
    if (furnishing) query.furnishing = furnishing

    let listings = await Listing.find(query).limit(50).lean()

    // Seed demo data if DB is empty
    if (listings.length === 0) {
      try {
        await Listing.insertMany(demoListings)
        listings = await Listing.find(query).limit(50).lean()
      } catch {
        // Return demo data without saving
        return NextResponse.json({ listings: demoListings })
      }
    }

    return NextResponse.json({ listings })
  } catch {
    // Always return something for the map
    return NextResponse.json({ listings: demoListings })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await connectDB()
    const listing = await Listing.create(body)
    return NextResponse.json({ listing }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
