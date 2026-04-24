import type { Metadata } from 'next'
import { NOINDEX_METADATA } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Sign up for a Sage Narrative account to start writing and publishing.',
  ...NOINDEX_METADATA,
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
