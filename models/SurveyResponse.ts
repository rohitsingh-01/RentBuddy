import mongoose, { Schema, Document } from 'mongoose'

export interface ISurveyResponse extends Document {
  respondentEmail?: string
  university?: string
  year?: number
  responses: {
    housingPain: string        // biggest housing problem
    splitMethod: string        // how they currently split rent
    leaseConfidence: number    // 1–5 how confident reading leases
    wouldUse: boolean          // would use RentBuddy
    monthlyBudget: number
    currentSolution: string
    topFeature: string
    comment?: string
  }
  source: 'in_app' | 'external'
  createdAt: Date
}

const SurveyResponseSchema = new Schema<ISurveyResponse>(
  {
    respondentEmail: String,
    university: String,
    year: Number,
    responses: {
      housingPain: String,
      splitMethod: String,
      leaseConfidence: { type: Number, min: 1, max: 5 },
      wouldUse: Boolean,
      monthlyBudget: Number,
      currentSolution: String,
      topFeature: String,
      comment: String,
    },
    source: { type: String, enum: ['in_app', 'external'], default: 'in_app' },
  },
  { timestamps: true }
)

export const SurveyResponse =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>('SurveyResponse', SurveyResponseSchema)
