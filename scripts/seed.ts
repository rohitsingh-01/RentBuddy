/**
 * Seed script — populates demo data for judging
 * Usage: npx tsx scripts/seed.ts
 * Requires: Supabase Keys in .env.local
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key not found in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  console.log('Connected to Supabase. Seeding survey responses...')
  
  // 1. Clear existing seed data (source = 'external')
  await supabase.from('survey_responses').delete().eq('source', 'external')
  
  // 2. Insert survey responses
  const surveyResponses = [
    { university: 'IIT Bombay', year: 3, source: 'external', responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 12000, topFeature: 'AI roommate matching', comment: 'I wasted 3 weeks trying to find a flatmate on random WhatsApp groups.' } },
    { university: 'IIM Ahmedabad', year: 1, source: 'external', responses: { housingPain: 'Understanding my lease', splitMethod: 'Spreadsheet', leaseConfidence: 1, wouldUse: true, monthlyBudget: 18000, topFeature: 'Lease red-flag scanner', comment: 'I signed a lease without realizing I was locked in for 11 months.' } },
    { university: 'BITS Pilani', year: 2, source: 'external', responses: { housingPain: 'Splitting rent fairly', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 3, wouldUse: true, monthlyBudget: 8000, topFeature: 'Rent split calculator', comment: 'Our group chat is full of "you owe me" messages.' } },
    { university: 'Delhi University', year: 2, source: 'external', responses: { housingPain: 'Finding affordable housing near campus', splitMethod: "One person pays, others Venmo/UPI", leaseConfidence: 2, wouldUse: true, monthlyBudget: 7000, topFeature: 'Item rentals (RentIts)' } },
    { university: 'NIT Trichy', year: 4, source: 'external', responses: { housingPain: 'Splitting rent fairly', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 9000, topFeature: 'AI roommate matching' } },
    { university: 'IIT Delhi', year: 1, source: 'external', responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'Splitwise / another app', leaseConfidence: 3, wouldUse: true, monthlyBudget: 14000, topFeature: 'AI roommate matching' } },
    { university: 'Pune University', year: 3, source: 'external', responses: { housingPain: 'Understanding my lease', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 1, wouldUse: true, monthlyBudget: 8500, topFeature: 'Lease red-flag scanner', comment: 'My landlord held back my deposit citing vague "damages".' } },
    { university: 'VIT Vellore', year: 2, source: 'external', responses: { housingPain: 'Managing shared expenses', splitMethod: "We rarely track it", leaseConfidence: 3, wouldUse: false, monthlyBudget: 6000, topFeature: 'Rent split calculator' } },
    { university: 'BITS Pilani', year: 3, source: 'external', responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 10000, topFeature: 'AI roommate matching' } },
    { university: 'IIT Madras', year: 2, source: 'external', responses: { housingPain: 'Finding affordable housing near campus', splitMethod: 'Spreadsheet', leaseConfidence: 4, wouldUse: true, monthlyBudget: 11000, topFeature: 'Item rentals (RentIts)' } }
  ]

  const { error } = await supabase.from('survey_responses').insert(surveyResponses)
  if (error) {
    console.error('Error seeding surveys:', error)
  } else {
    console.log('Successfully seeded 10 survey responses.')
  }

  // 3. Optional: Create notifications for existing users
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  if (profiles && profiles.length > 0) {
      const pid = profiles[0].id
      const notifications = [
          { user_id: pid, type: 'match_accepted', title: 'Match accepted!', message: 'Priya Sharma accepted your roommate match request.', read: false, link: '/match' },
          { user_id: pid, type: 'payment_due', title: 'Rent reminder', message: 'April rent of ₹12,000 is due soon.', read: false, link: '/splits' }
      ]
      await supabase.from('notifications').insert(notifications)
      console.log('Seeded notifications for user:', pid)
  }

  console.log('Seed complete!')
}

seed().catch(console.error)
