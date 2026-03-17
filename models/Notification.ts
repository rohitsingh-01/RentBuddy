import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  type: 'match_request' | 'match_accepted' | 'payment_due' | 'payment_received' | 'lease_scanned' | 'system'
  title: string
  message: string
  read: boolean
  link?: string
  meta?: Record<string, any>
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['match_request', 'match_accepted', 'payment_due', 'payment_received', 'lease_scanned', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
)

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 })

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)
