'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import { Card, CardContent, Grid, Typography, Box } from '@mui/material'

// Component Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Hook Imports
import { formatNumber } from '@core/utils/format'

// Axios Import
import { axiosClient } from '@/libs/axios'

const EmployeeDashboardPage = () => {
  // Vars
  const divider = 'var(--mui-palette-divider)'
  const disabledText = 'var(--mui-palette-text-disabled)'

  // States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalServices: 0
  })

  const [applicationLogs, setApplicationLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      try {
        // Fetch user stats
        const usersResponse = await axiosClient.get('/api/users', {
          params: {
            'pagination[pageSize]': 1 // Just need the count
          }
        })

        // Fetch application stats
        const applicationsResponse = await axiosClient.get('/api/applications', {
          params: {
            'sort[0]': 'createdAt:desc',
            'filters[createdAt][$gt]': thirtyDaysAgo.toISOString()
          }
        })

        // Fetch services stats
        const servicesResponse = await axiosClient.get('/api/services', {
          params: {
            'pagination[pageSize]': 1 // Just need the count
          }
        })

        // Fetch application logs for trend
        const logsResponse = await axiosClient.get('/api/application-logs', {
          params: {
            populate: ['job_listing'],
            'pagination[pageSize]': 7,
            'sort[0]': 'createdAt:desc',
            'filters[createdAt][$gt]': thirtyDaysAgo.toISOString()
          }
        })

        setStats({
          totalUsers: usersResponse.data.meta?.pagination?.total || 0,
          totalApplications: applicationsResponse.data.meta?.pagination?.total || 0,
          pendingApplications: applicationsResponse.data.data?.filter((app: any) => app.status === 'pending').length || 0,
          totalServices: servicesResponse.data.meta?.pagination?.total || 0
        })

        setApplicationLogs(logsResponse.data.data)
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Mock click trend data for application logs
  interface DayData {
    date: Date
    value: number
  }

  const getLast30DaysData = (): { name: string; value: number }[] => {
    const days: DayData[] = []
    const today = new Date()

    // Son 10 günü oluştur
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date: date,
        value: 0
      })
    }

    // Loglardan gelen verileri işle
    applicationLogs.forEach((log: any) => {
      const logDate = new Date(log.createdAt)
      const dayIndex = days.findIndex(day => day.date.toDateString() === logDate.toDateString())

      if (dayIndex !== -1) {
        days[dayIndex].value += 1
      }
    })

    return days.map(day => ({
      name: day.date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      value: day.value
    }))
  }

  const clickTrendData = getLast30DaysData()

  // Chart options
  const [clickTrendOptions] = useState<ApexOptions>({
    chart: {
      parentHeightOffset: 0,
      type: 'line',
      height: 300,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ['#7367F0'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: divider,
      xaxis: {
        lines: { show: false }
      },
      padding: {
        top: -10
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: divider },
      categories: clickTrendData.map(item => item.name),
      labels: {
        style: { colors: disabledText, fontSize: '13px' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: disabledText, fontSize: '13px' },
        formatter: (value: number) => formatNumber(value)
      }
    }
  })

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Yükleniyor...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* İstatistik Kartları */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary'>
              Toplam Kullanıcı
            </Typography>
            <Typography variant='h4' sx={{ mb: 1 }}>
              {formatNumber(stats.totalUsers)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Sistemdeki tüm kullanıcılar
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary'>
              Toplam Başvuru
            </Typography>
            <Typography variant='h4' sx={{ mb: 1 }}>
              {formatNumber(stats.totalApplications)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Son 30 günde
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary'>
              Bekleyen Başvuru
            </Typography>
            <Typography variant='h4' sx={{ mb: 1 }}>
              {formatNumber(stats.pendingApplications)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              İnceleme bekliyor
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary'>
              Toplam Hizmet
            </Typography>
            <Typography variant='h4' sx={{ mb: 1 }}>
              {formatNumber(stats.totalServices)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Sistemdeki tüm hizmetler
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Grafik */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
              Başvuru Tıklama Trendi
            </Typography>
            <AppReactApexCharts
              type='line'
              height={300}
              options={clickTrendOptions}
              series={[{ name: 'Tıklama', data: clickTrendData.map(item => item.value) }]}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EmployeeDashboardPage