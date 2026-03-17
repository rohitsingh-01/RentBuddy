import mongoose, { Schema, Document } from 'mongoose'

export interface IListing extends Document {
  title: string
  description: string
  address: string
  city: string
  lat: number
  lng: number
  rent: number
  deposit: number
  bedrooms: number
  bathrooms: number
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished'
  amenities: string[]
  images: string[]
  postedBy: mongoose.Types.ObjectId
  availableFrom: Date
  isActive: boolean
  contactEmail: string
  contactPhone?: string
  createdAt: Date
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    rent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    furnishing: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished'],
      default: 'furnished',
    },
    amenities: [String],
    images: [String],
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    availableFrom: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    contactEmail: { type: String, required: true },
    contactPhone: String,
  },
  { timestamps: true }
)

ListingSchema.index({ city: 1, isActive: 1 })
ListingSchema.index({ lat: 1, lng: 1 })
ListingSchema.index({ rent: 1 })

export const Listing =
  mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)
