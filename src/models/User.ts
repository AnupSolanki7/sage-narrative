import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  username: string
  email: string
  passwordHash: string
  avatar?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    github?: string
    website?: string
    linkedin?: string
  }
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    username:     { type: String, required: true, unique: true, trim: true, lowercase: true },
    email:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar:       { type: String, trim: true },
    bio:          { type: String, trim: true },
    socialLinks: {
      twitter:  { type: String, trim: true },
      github:   { type: String, trim: true },
      website:  { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', UserSchema)

export default User
