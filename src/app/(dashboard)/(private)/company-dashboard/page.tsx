'use client'

// Next Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CompanyDashboardPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to statistics (new home page)
    router.replace('/statistics')
  }, [router])

  return null
}

export default CompanyDashboardPage
