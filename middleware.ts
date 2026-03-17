import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Initialize Supabase client inside middleware (Request cookie management)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. Fetch authenticated user session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 3. Define public routes that don't need auth
  const publicPrefixes = [
    '/',
    '/demo',
    '/pitch',
    '/checklist',
    '/auth',
    '/api/auth',
    '/api/research',
    '/api/stats',
    '/api/og',
    '/_next',
    '/favicon',
    '/manifest',
    '/robots',
    '/sitemap',
    '/icon',
    '/screenshot',
  ]

  const isPublic =
    pathname === '/' ||
    publicPrefixes.some((p) => pathname.startsWith(p))

  if (isPublic) {
    return response
  }

  // 4. Redirect unauthenticated users to sign-in page
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)'],
}
