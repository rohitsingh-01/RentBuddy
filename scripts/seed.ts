/**
 * Seed script — populates demo data for judging
 * Usage: npx tsx scripts/seed.ts
 * Requires: MONGODB_URI in .env.local
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI not set')

// ─── Schemas (inline for the script) ─────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  universityEmail: String,
  universityName: String,
  isVerified: { type: Boolean, default: true },
  rentItsSignedUp: { type: Boolean, default: false },
  onboardingComplete: { type: Boolean, default: false },
  profile: {
    bio: String,
    budget: { min: Number, max: Number },
    location: String,
    course: String,
    year: Number,
    lifestyle: {
      sleepTime: String,
      cleanliness: String,
      noise: String,
      guests: String,
      smoking: Boolean,
      pets: Boolean,
    },
  },
}, { timestamps: true })

const NotificationSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  type: String,
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true })

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)

const RentSplitSchema = new mongoose.Schema({
  name: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  currency: { type: String, default: 'INR' },
  inviteCode: { type: String, default: () => Math.random().toString(36).substring(2, 10).toUpperCase() },
  members: [{
    user: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    balance: { type: Number, default: 0 },
  }],
  expenses: [{
    title: String,
    amount: Number,
    paidBy: mongoose.Schema.Types.ObjectId,
    category: { type: String, default: 'other' },
    date: { type: Date, default: Date.now },
    splitBetween: [mongoose.Schema.Types.ObjectId],
  }],
  totalExpenses: { type: Number, default: 0 },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const RentSplit = mongoose.models.RentSplit || mongoose.model('RentSplit', RentSplitSchema)

// ─── Seed data ────────────────────────────────────────────────────────────────

const seedUsers = [
  {
    name: 'Demo User',
    email: 'demo@iitb.ac.in',
    universityEmail: 'demo@iitb.ac.in',
    universityName: 'IIT Bombay',
    isVerified: true,
    rentItsSignedUp: true,
    onboardingComplete: true,
    profile: {
      bio: 'Final year CSE student. Night owl, keep things tidy. Looking for a calm, focused flatmate.',
      budget: { min: 8000, max: 18000 },
      location: 'Powai',
      course: 'B.Tech CSE',
      year: 4,
      lifestyle: { sleepTime: 'night-owl', cleanliness: 'clean', noise: 'moderate', guests: 'sometimes', smoking: false, pets: false },
    },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@iitb.ac.in',
    universityEmail: 'priya@iitb.ac.in',
    universityName: 'IIT Bombay',
    isVerified: true,
    profile: {
      bio: 'CSE second year. I like a tidy, quiet flat and occasionally have friends over on weekends.',
      budget: { min: 8000, max: 14000 },
      location: 'Powai',
      course: 'B.Tech CSE',
      year: 2,
      lifestyle: { sleepTime: 'night-owl', cleanliness: 'clean', noise: 'moderate', guests: 'sometimes', smoking: false, pets: false },
    },
  },
  {
    name: 'Aditya Mehta',
    email: 'aditya@iima.ac.in',
    universityEmail: 'aditya@iima.ac.in',
    universityName: 'IIM Ahmedabad',
    isVerified: true,
    profile: {
      bio: 'MBA Finance, Year 1. Flexible schedule, generally tidy, pet-friendly.',
      budget: { min: 10000, max: 20000 },
      location: 'Vastrapur',
      course: 'MBA Finance',
      year: 1,
      lifestyle: { sleepTime: 'flexible', cleanliness: 'clean', noise: 'moderate', guests: 'rarely', smoking: false, pets: true },
    },
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya@bits.ac.in',
    universityEmail: 'kavya@bits.ac.in',
    universityName: 'BITS Pilani',
    isVerified: true,
    profile: {
      bio: 'MSc Biotech. Early riser, very organized. Rarely home evenings — lab work.',
      budget: { min: 6000, max: 12000 },
      location: 'Pilani',
      course: 'M.Sc Biotechnology',
      year: 1,
      lifestyle: { sleepTime: 'early', cleanliness: 'very-clean', noise: 'quiet', guests: 'rarely', smoking: false, pets: false },
    },
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  // Clear existing seed data
  await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } })
  console.log('Cleared old seed users')

  // Insert users
  const users = await User.insertMany(seedUsers)
  console.log(`Inserted ${users.length} users`)

  // Find demo user and Priya for the split
  const demoUser = users.find((u: any) => u.email === 'demo@iitb.ac.in')
  const priya = users.find((u: any) => u.email === 'priya@iitb.ac.in')

  if (demoUser && priya) {
    // Clear old demo split
    await RentSplit.deleteMany({ name: 'Powai Terrace (Demo)' })

    const split = await RentSplit.create({
      name: 'Powai Terrace (Demo)',
      createdBy: demoUser._id,
      currency: 'INR',
      members: [
        { user: demoUser._id, name: demoUser.name, email: demoUser.email, balance: 0 },
        { user: priya._id, name: priya.name, email: priya.email, balance: 0 },
      ],
      expenses: [
        { title: 'March rent', amount: 24000, paidBy: demoUser._id, category: 'rent', splitBetween: [demoUser._id, priya._id] },
        { title: 'Electricity bill', amount: 1840, paidBy: priya._id, category: 'utilities', splitBetween: [demoUser._id, priya._id] },
        { title: 'WiFi', amount: 1200, paidBy: demoUser._id, category: 'utilities', splitBetween: [demoUser._id, priya._id] },
        { title: 'Weekend groceries', amount: 2600, paidBy: priya._id, category: 'groceries', splitBetween: [demoUser._id, priya._id] },
      ],
      totalExpenses: 29640,
    })
    console.log(`Created demo split: ${split.name}`)
  }

  console.log('\nSeed complete! Demo account:')
  console.log('  Email: demo@iitb.ac.in')
  console.log('  Sign in via magic link or Google')

  // Seed demo notifications for the demo user
  if (demoUser) {
    await Notification.deleteMany({ user: demoUser._id })
    await Notification.insertMany([
      {
        user: demoUser._id,
        type: 'match_accepted',
        title: 'Match accepted!',
        message: 'Priya Sharma accepted your roommate match request. Start chatting!',
        read: false,
        link: '/match',
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        user: demoUser._id,
        type: 'payment_due',
        title: 'Rent reminder',
        message: 'April rent of ₹12,000 is due in 3 days for Powai Terrace (Demo).',
        read: false,
        link: '/splits',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        user: demoUser._id,
        type: 'match_request',
        title: 'New match request',
        message: 'Kavya Reddy wants to connect as a potential flatmate. 81% compatibility.',
        read: true,
        link: '/match',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        user: demoUser._id,
        type: 'system',
        title: 'Welcome to RentBuddy!',
        message: 'Your account is set up. Complete your profile to get better matches.',
        read: true,
        link: '/profile',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ])
    console.log('Seeded 4 demo notifications')
  }

  // Seed survey responses for research page
  const SurveyResponseSchema = new mongoose.Schema({
    university: String, year: Number,
    responses: {
      housingPain: String, splitMethod: String, leaseConfidence: Number,
      wouldUse: Boolean, monthlyBudget: Number, topFeature: String, comment: String,
    },
    source: { type: String, default: 'external' },
  }, { timestamps: true })
  const SurveyModel = mongoose.models.SurveyResponse || mongoose.model('SurveyResponse', SurveyResponseSchema)
  await SurveyModel.deleteMany({ source: 'external' })
  await SurveyModel.insertMany([
    { university: 'IIT Bombay', year: 3, responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 12000, topFeature: 'AI roommate matching', comment: 'I wasted 3 weeks trying to find a flatmate on random WhatsApp groups. The process is exhausting.' }, source: 'external' },
    { university: 'IIM Ahmedabad', year: 1, responses: { housingPain: 'Understanding my lease', splitMethod: 'Spreadsheet', leaseConfidence: 1, wouldUse: true, monthlyBudget: 18000, topFeature: 'Lease red-flag scanner', comment: 'I signed a lease without realizing I was locked in for 11 months with no exit clause. Cost me a lot.' }, source: 'external' },
    { university: 'BITS Pilani', year: 2, responses: { housingPain: 'Splitting rent fairly', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 3, wouldUse: true, monthlyBudget: 8000, topFeature: 'Rent split calculator', comment: 'Our group chat is full of "you owe me" messages. It causes real friction in the house.' }, source: 'external' },
    { university: 'Delhi University', year: 2, responses: { housingPain: 'Finding affordable housing near campus', splitMethod: "One person pays, others Venmo/UPI", leaseConfidence: 2, wouldUse: true, monthlyBudget: 7000, topFeature: 'Item rentals (RentIts)', comment: 'Buying furniture just for one year of renting makes zero sense. Rental should be the default.' }, source: 'external' },
    { university: 'NIT Trichy', year: 4, responses: { housingPain: 'Splitting rent fairly', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 9000, topFeature: 'AI roommate matching' }, source: 'external' },
    { university: 'IIT Delhi', year: 1, responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'Splitwise / another app', leaseConfidence: 3, wouldUse: true, monthlyBudget: 14000, topFeature: 'AI roommate matching' }, source: 'external' },
    { university: 'Pune University', year: 3, responses: { housingPain: 'Understanding my lease', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 1, wouldUse: true, monthlyBudget: 8500, topFeature: 'Lease red-flag scanner', comment: 'My landlord held back my deposit citing vague "damages". I had no idea the lease allowed it.' }, source: 'external' },
    { university: 'VIT Vellore', year: 2, responses: { housingPain: 'Managing shared expenses', splitMethod: "We rarely track it", leaseConfidence: 3, wouldUse: false, monthlyBudget: 6000, topFeature: 'Rent split calculator' }, source: 'external' },
    { university: 'BITS Pilani', year: 3, responses: { housingPain: 'Finding trustworthy flatmates', splitMethod: 'WhatsApp / manual messages', leaseConfidence: 2, wouldUse: true, monthlyBudget: 10000, topFeature: 'AI roommate matching' }, source: 'external' },
    { university: 'IIT Madras', year: 2, responses: { housingPain: 'Finding affordable housing near campus', splitMethod: 'Spreadsheet', leaseConfidence: 4, wouldUse: true, monthlyBudget: 11000, topFeature: 'Item rentals (RentIts)' }, source: 'external' },
  ])
  console.log('Seeded 10 survey responses')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
