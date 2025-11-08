import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Giriş gerektirmeyen sayfalar
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/api/public',
  '/_next',
  '/static',
  '/images',
  '/favicon.ico'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('token')?.value
  const user = request.cookies.get('user')?.value
  const userData = user ? JSON.parse(user) : null

  // Public sayfalara erişim kontrolü
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Eğer root ise rol bazlı yönlendir
  if (pathname === '/home' || pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // employee veya authenticated (company) rollere göre
    const dest = userData?.role?.type === 'employee'
      ? '/employee-dashboard'
      : userData?.role?.type === 'authenticated'
        ? '/company-dashboard'
        : '/login'

    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Token yoksa login sayfasına yönlendir
  if (!token) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('from', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // AHİ-İK sayfalarına erişim kontrolü
  const ahiIkPaths = ['/digital-hr', '/workers', '/pdks', '/leave-tracking']
  const isAhiIkPath = ahiIkPaths.some(path => pathname.startsWith(path))
  
  if (isAhiIkPath && userData) {
    const isCompany = userData?.role?.type === 'authenticated'
    const isEmployee = userData?.role?.type === 'employee'
    const isAhiIk = isCompany && userData?.ahiIkMember === true

    // Şirketler sadece AHİ-İK'ya tanımlı ise erişebilir
    // Employee her zaman erişebilir
    if (isCompany && !isAhiIk) {
      return NextResponse.redirect(new URL('/company-dashboard', request.url))
    }
    
    // Employee değilse ve AHİ-İK şirket değilse erişemez
    if (!isEmployee && !isAhiIk) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico|public).*)',
  ],
}
