'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services'
import { Box, CircularProgress } from '@mui/material'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: ('employee' | 'authenticated' | 'worker')[]
  requireAhiIk?: boolean
}

/**
 * Role-based Access Control Component
 * Kullanıcının rolüne göre sayfa erişimini kontrol eder
 */
const RoleGuard = ({ children, allowedRoles, requireAhiIk = false }: RoleGuardProps) => {
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      const user = authService.getUser()

      // Kullanıcı yoksa login'e yönlendir
      if (!user) {
        router.push('/login')
        return
      }

      // Role kontrolü
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role?.type
        
        if (!userRole || !allowedRoles.includes(userRole as any)) {
          // Kullanıcının rolüne göre dashboard'a yönlendir
          const dashboardUrl = authService.getDashboardUrl()
          router.push(dashboardUrl)
          return
        }
      }

      // AHİ-İK kontrolü
      if (requireAhiIk && !authService.isAhiIk()) {
        router.push('/company-dashboard')
        return
      }
    }

    checkAccess()
  }, [router, allowedRoles, requireAhiIk])

  // Yükleniyor göstergesi (kısa süreliğine)
  return <>{children}</>
}

export default RoleGuard

