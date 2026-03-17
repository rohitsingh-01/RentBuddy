import mongoose, { Schema, Document } from 'mongoose'

export interface IMatch extends Document {
  users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId]
  compatibilityScore: number
  aiSummary: string
  conversationStarter: string
  status: 'pending' | 'accepted' | 'declined'
  initiatedBy: mongoose.Types.ObjectId
  createdAt: Date
}

const MatchSchema = new Schema<IMatch>(
  {
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
      validate: (v: any[]) => v.length === 2,
    },
    compatibilityScore: { type: Number, min: 0, max: 100, required: true },
    aiSummary: { type: String, required: true },
    conversationStarter: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

MatchSchema.index({ users: 1 })
MatchSchema.index({ status: 1 })

export const Match =
  mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema)
