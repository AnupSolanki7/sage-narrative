import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import {
  SITE_NAME,
  getDefaultSeo,
  buildBreadcrumbJsonLd,
} from '@/lib/seo'

export const metadata: Metadata = getDefaultSeo({
  title: `All Writing — ${SITE_NAME}`,
  description:
    'Every essay, story, and reflection published on Sage Narrative — long-form writing across stories, tech, and insights.',
  path: '/blog',
  type: 'website',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home',        path: '/' },
          { name: 'All Writing', path: '/blog' },
        ])}
      />
      {children}
    </>
  )
}
