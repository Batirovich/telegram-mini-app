import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const COOKIE_NAME = 'dashboard_auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip: Mini App, login page, static assets
  if (
    pathname.startsWith('/miniapp') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(COOKIE_NAME)
  if (cookie?.value === ADMIN_PASSWORD) return NextResponse.next()

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
