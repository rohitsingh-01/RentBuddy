import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  universityEmail: string
  universityName?: string
  isVerified: boolean
  profile: {
    bio?: string
    budget: { min: number; max: number }
    moveInDate?: Date
    location?: string
    lifestyle: {
      sleepTime?: 'early' | 'night-owl' | 'flexible'
      cleanliness?: 'very-clean' | 'clean' | 'relaxed'
      noise?: 'quiet' | 'moderate' | 'social'
      guests?: 'rarely' | 'sometimes' | 'often'
      smoking?: boolean
      pets?: boolean
    }
    course?: string
    year?: number
  }
  rentItsSignedUp: boolean
  rentItsUserId?: string
  phoneNumber?: string
  phoneVerified: boolean
  matches: mongoose.Types.ObjectId[]
  splits: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    universityEmail: { type: String, required: true, lowercase: true },
    universityName: { type: String },
    isVerified: { type: Boolean, default: false },
    profile: {
      bio: String,
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 50000 },
      },
      moveInDate: Date,
      location: String,
      lifestyle: {
        sleepTime: { type: String, enum: ['early', 'night-owl', 'flexible'] },
        cleanliness: { type: String, enum: ['very-clean', 'clean', 'relaxed'] },
        noise: { type: String, enum: ['quiet', 'moderate', 'social'] },
        guests: { type: String, enum: ['rarely', 'sometimes', 'often'] },
        smoking: { type: Boolean, default: false },
        pets: { type: Boolean, default: false },
      },
      course: String,
      year: { type: Number, min: 1, max: 6 },
    },
    rentItsSignedUp: { type: Boolean, default: false },
    rentItsUserId: String,
    onboardingComplete: { type: Boolean, default: false },
    phoneNumber: String,
    phoneVerified: { type: Boolean, default: false },
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
    splits: [{ type: Schema.Types.ObjectId, ref: 'RentSplit' }],
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ email: 1 })
UserSchema.index({ universityEmail: 1 })
UserSchema.index({ 'profile.location': 1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
