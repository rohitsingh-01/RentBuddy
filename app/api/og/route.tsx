import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'RentBuddy'
  const subtitle = searchParams.get('subtitle') || 'Smart housing for students'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#fdfcf8',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: '#e1f0e8',
            transform: 'translate(150px, -150px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: '#f4edda',
            transform: 'translate(-100px, 100px)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#144336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#faf7ef', fontSize: '24px', fontWeight: 'bold' }}>R</span>
          </div>
          <span style={{ fontSize: '28px', color: '#144336', fontWeight: '600' }}>RentBuddy</span>
          <div
            style={{
              background: '#d9ede5',
              color: '#1e6850',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              marginLeft: '8px',
            }}
          >
            HackRent 2026
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '64px',
            color: '#11382d',
            lineHeight: 1.1,
            margin: '0 0 20px 0',
            maxWidth: '800px',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '28px',
            color: '#4fa082',
            margin: 0,
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
          {['AI matching', 'Rent splits', 'Lease scanner', 'RentIts'].map((f) => (
            <div
              key={f}
              style={{
                background: '#e1f0e8',
                color: '#1e6850',
                padding: '8px 20px',
                borderRadius: '24px',
                fontSize: '16px',
                fontFamily: 'sans-serif',
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
