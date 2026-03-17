import mongoose, { Schema, Document } from 'mongoose'

export interface IExpense {
  _id: mongoose.Types.ObjectId
  title: string
  amount: number
  paidBy: mongoose.Types.ObjectId
  splitBetween: mongoose.Types.ObjectId[]
  date: Date
  category: 'rent' | 'utilities' | 'groceries' | 'other'
}

export interface ISplitMember {
  user: mongoose.Types.ObjectId
  name: string
  email: string
  balance: number // positive = owed to them, negative = they owe
}

export interface IRentSplit extends Document {
  name: string
  members: ISplitMember[]
  expenses: IExpense[]
  currency: string
  totalExpenses: number
  createdBy: mongoose.Types.ObjectId
  inviteCode: string
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new Schema<IExpense>({
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splitBetween: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['rent', 'utilities', 'groceries', 'other'],
    default: 'other',
  },
})

const SplitMemberSchema = new Schema<ISplitMember>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  balance: { type: Number, default: 0 },
})

const RentSplitSchema = new Schema<IRentSplit>(
  {
    name: { type: String, required: true },
    members: [SplitMemberSchema],
    expenses: [ExpenseSchema],
    currency: { type: String, default: 'INR' },
    totalExpenses: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteCode: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
  },
  { timestamps: true }
)

RentSplitSchema.pre('save', function (next) {
  this.totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0)
  next()
})

export const RentSplit =
  mongoose.models.RentSplit || mongoose.model<IRentSplit>('RentSplit', RentSplitSchema)
