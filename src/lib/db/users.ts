import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import User, { IUser } from '@/models/User'
import type { DbUser, UserProfile } from '@/types'

// ── Serialisation helpers ────────────────────────────────────────────────────

function toDbUser(doc: IUser): DbUser {
  const obj = doc.toObject({ versionKey: false })
  return {
    _id:         obj._id.toString(),
    name:        obj.name,
    username:    obj.username,
    email:       obj.email,
    avatar:      obj.avatar,
    bio:         obj.bio,
    socialLinks: obj.socialLinks,
    role:        obj.role,
    createdAt:   obj.createdAt.toISOString(),
    updatedAt:   obj.updatedAt.toISOString(),
  }
}

function toUserProfile(doc: IUser): UserProfile {
  const { email: _e, ...profile } = toDbUser(doc)
  return profile
}

// ── Auth operations ──────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string
  username: string
  email: string
  password: string
}): Promise<DbUser> {
  await connectDB()

  const passwordHash = await bcrypt.hash(data.password, 10)
  const doc = await User.create({
    name:         data.name,
    username:     data.username.toLowerCase(),
    email:        data.email.toLowerCase(),
    passwordHash,
  })
  return toDbUser(doc)
}

export async function verifyUser(
  email: string,
  password: string
): Promise<DbUser | null> {
  await connectDB()

  const doc = await User.findOne({ email: email.toLowerCase() })
  if (!doc) return null

  const match = await bcrypt.compare(password, doc.passwordHash)
  if (!match) return null

  return toDbUser(doc)
}

// ── Query operations ─────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<DbUser | null> {
  await connectDB()
  const doc = await User.findById(id)
  if (!doc) return null
  return toDbUser(doc)
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  await connectDB()
  const doc = await User.findOne({ username: username.toLowerCase() })
  if (!doc) return null
  return toUserProfile(doc)
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  await connectDB()
  const doc = await User.findOne({ email: email.toLowerCase() })
  if (!doc) return null
  return toDbUser(doc)
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  await connectDB()
  const existing = await User.findOne({ username: username.toLowerCase() })
  return !existing
}

// ── Update operations ────────────────────────────────────────────────────────

export async function updateUserProfile(
  id: string,
  data: {
    name?: string
    username?: string
    bio?: string
    avatar?: string
    socialLinks?: {
      twitter?: string
      github?: string
      website?: string
      linkedin?: string
    }
  }
): Promise<DbUser | null> {
  await connectDB()

  if (data.username) {
    data.username = data.username.toLowerCase()
  }

  const doc = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!doc) return null
  return toDbUser(doc)
}
