import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = session.user.role

  if (pathname.startsWith('/admin') && role !== 'Admin') {
    return NextResponse.redirect(new URL('/information-book', req.url))
  }

  if (pathname.startsWith('/profile') && role === 'Admin') {
    return NextResponse.redirect(new URL('/information-book', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
}
