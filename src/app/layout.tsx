import type { Metadata } from 'next'
import { Newsreader, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Sage Narrative — Stories, Tech & Human Insights',
    template: '%s | Sage Narrative',
  },
  description:
    'A premium editorial publication at the intersection of technology, human experience, and deeper insights. Long-form essays for the thoughtful reader.',
  keywords: ['editorial', 'essays', 'technology', 'culture', 'writing', 'long-form'],
  authors: [{ name: 'Sage Narrative' }],
  creator: 'Sage Narrative',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sagenarrative.com',
    siteName: 'Sage Narrative',
    title: 'Sage Narrative — Stories, Tech & Human Insights',
    description:
      'A premium editorial publication at the intersection of technology, human experience, and deeper insights.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage Narrative',
    description: 'Premium editorial publication at the intersection of technology and human narrative.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${inter.variable}`}
    >
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Navbar />
          <main className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
