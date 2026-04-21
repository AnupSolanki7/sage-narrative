import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IPost extends Document {
  title: string
  subtitle?: string
  excerpt?: string
  slug: string
  category: 'stories' | 'tech' | 'insights'
  tags: string[]
  coverImage?: string
  contentRaw: string
  contentHtml: string
  /** Legacy string author — kept for backward compatibility with existing posts. */
  author?: string
  /** Reference to User document — set for posts created by registered users. */
  authorId?: Types.ObjectId
  publishedAt?: Date
  featured: boolean
  seoTitle?: string
  seoDescription?: string
  status: 'draft' | 'published'
  readingTime?: number
  postType: 'story' | 'tech' | 'insight'
  /** Set to true after new-post notification emails have been sent. */
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    excerpt:  { type: String, trim: true },
    slug:     { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: String, required: true, enum: ['stories', 'tech', 'insights'] },
    tags:     [{ type: String, trim: true }],
    coverImage: { type: String, trim: true },
    contentRaw:  { type: String, required: true },
    contentHtml: { type: String, required: true },
    // Legacy string field — optional so new user posts don't need it
    author:   { type: String, trim: true },
    // Reference to registered User — optional so old admin posts still work
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt:    { type: Date },
    featured:       { type: Boolean, default: false },
    seoTitle:       { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
    readingTime: { type: Number },
    postType:    { type: String, required: true, enum: ['story', 'tech', 'insight'] },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
)

PostSchema.index({ status: 1, publishedAt: -1 })
PostSchema.index({ category: 1, status: 1 })
PostSchema.index({ featured: 1, status: 1 })
PostSchema.index({ authorId: 1, status: 1 })

// In development, clear the cached model so Next.js hot-reloads always pick up
// the latest schema (e.g. after authorId was added). In production the module
// only ever executes once so the cache is always fresh.
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>)['Post']
}

const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) ?? mongoose.model<IPost>('Post', PostSchema)

export default Post
