import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'sonner'
import ChatWidget from '@/components/chat/ChatWidget'

const siteUrl = process.env.NEXTAUTH_URL || 'https://rentbuddy.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RentBuddy — Smart Housing for Students',
    template: '%s · RentBuddy',
  },
  description:
    'Find compatible roommates with AI matching, split rent fairly, scan leases for red flags, and rent everything you need for student life. Built for HackRent 2026.',
  keywords: [
    'student housing', 'roommate finder', 'rent split', 'lease scanner',
    'student rental', 'flatmate matching', 'AI roommate', 'RentIts',
    'college housing', 'university accommodation',
  ],
  authors: [{ name: 'RentBuddy', url: siteUrl }],
  creator: 'RentBuddy',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'RentBuddy',
    title: 'RentBuddy — Smart Housing for Students',
    description:
      'AI roommate matching, rent splitting, lease scanning, and item rentals — all in one place for students.',
    images: [
      {
        url: `${siteUrl}/api/og?title=RentBuddy&subtitle=Smart+housing+for+students`,
        width: 1200,
        height: 630,
        alt: 'RentBuddy — Smart Housing for Students',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentBuddy — Smart Housing for Students',
    description: 'AI roommate matching, rent splitting, and lease scanning for students.',
    images: [`${siteUrl}/api/og?title=RentBuddy&subtitle=Smart+housing+for+students`],
    creator: '@rentbuddy',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon-192.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: 'education',
}

export const viewport: Viewport = {
  themeColor: '#144336',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'RentBuddy',
              url: siteUrl,
              description: 'Smart housing platform for students — roommate matching, rent splitting, lease scanning, and item rentals.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              audience: { '@type': 'Audience', audienceType: 'Students' },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-cream-50 font-body antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#144336',
                color: '#faf7ef',
                border: '1px solid #185441',
                fontFamily: 'var(--font-body)',
              },
            }}
          />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  )
}
