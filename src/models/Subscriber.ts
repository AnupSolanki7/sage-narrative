import mongoose, { Document, Model, Schema } from 'mongoose'

export type SubscriberStatus = 'active' | 'unsubscribed'

export type SubscriberSource =
  | 'homepage'
  | 'article-sidebar'
  | 'article-bottom'
  | 'footer'
  | 'unknown'

export interface ISubscriber extends Document {
  email: string
  status: SubscriberStatus
  source: SubscriberSource
  createdAt: Date
  updatedAt: Date
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'] satisfies SubscriberStatus[],
      default: 'active',
    },
    source: {
      type: String,
      enum: [
        'homepage',
        'article-sidebar',
        'article-bottom',
        'footer',
        'unknown',
      ] satisfies SubscriberSource[],
      default: 'unknown',
    },
  },
  { timestamps: true }
)

SubscriberSchema.index({ email: 1 }, { unique: true })
SubscriberSchema.index({ status: 1, createdAt: -1 })

// Clear cached model during hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>)['Subscriber']
}

const Subscriber: Model<ISubscriber> =
  (mongoose.models.Subscriber as Model<ISubscriber>) ??
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)

export default Subscriber
