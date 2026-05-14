import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user.role

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== 'Admin') {
    return NextResponse.redirect(new URL('/information-book', req.url))
  }

  // Profile page not available for Admin
  if (pathname.startsWith('/profile') && role === 'Admin') {
    return NextResponse.redirect(new URL('/information-book', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
