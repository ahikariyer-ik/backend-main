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
    // Role göre yönlendirme
    const dest = userData?.role?.type === 'employee'
      ? '/employee-dashboard'
      : userData?.role?.type === 'authenticated'
        ? '/statistics'
        : userData?.role?.type === 'worker'
          ? '/worker-dashboard'
          : '/login'

    return NextResponse.redirect(new URL(dest, request.url))
  }
  
  // WORKER KORUMASI: Worker sadece kendi sayfalarına erişebilir
  if (userData?.role?.type === 'worker') {
    const workerAllowedPaths = [
      '/worker-dashboard',
      '/worker-tasks', 
      '/worker-leave-requests'
    ]
    
    const isWorkerPath = workerAllowedPaths.some(path => pathname.startsWith(path))
    
    // Worker izinli path'de değilse, dashboard'a yönlendir
    if (!isWorkerPath) {
      return NextResponse.redirect(new URL('/worker-dashboard', request.url))
    }
  }

  // Token yoksa login sayfasına yönlendir
  if (!token) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('from', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // ŞIRKET/ADMIN SAYFALARI KORUMASI: Worker bu sayfalara erişemez
  const companyPaths = [
    '/digital-hr', 
    '/workers', 
    '/pdks', 
    '/leave-tracking',
    '/tasks',
    '/branches',
    '/departments',
    '/statistics',
    '/services',
    '/pages',
    '/datas',
    '/users',
    '/demo-requests',
    '/applications',
    '/jobs',
    '/company-dashboard',
    '/employee-dashboard',
    '/statistics',
    '/profile/company'
  ]
  
  const isCompanyPath = companyPaths.some(path => pathname.startsWith(path))
  
  if (isCompanyPath && userData) {
    const isWorker = userData?.role?.type === 'worker'
    
    // Worker bu sayfalara erişemez!
    if (isWorker) {
      return NextResponse.redirect(new URL('/worker-dashboard', request.url))
    }
    
    // AHİ-İK kontrolü (sadece şirketler için)
    const ahiIkPaths = ['/digital-hr', '/workers', '/pdks', '/leave-tracking', '/tasks', '/branches', '/departments']
    const isAhiIkPath = ahiIkPaths.some(path => pathname.startsWith(path))
    
    if (isAhiIkPath) {
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
  }

  return NextResponse.next()
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico|public).*)',
  ],
}
