'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import { Card, CardContent, Grid, Typography, Box, LinearProgress } from '@mui/material'

// Component Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Hook Imports
import { formatNumber } from '@core/utils/format'

// Axios Import
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'

const CompanyDashboardPage = () => {
  // Vars
  const divider = 'var(--mui-palette-divider)'
  const disabledText = 'var(--mui-palette-text-disabled)'

  // States
  const [postingRights, setPostingRights] = useState({
    postingQuota: 0,
    postingsUsed: 0,
    activePostings: 0,
    totalApplicationCount: 0
  })

  const [applicationLogs, setApplicationLogs] = useState([])
  const [workers, setWorkers] = useState({
    total: 0,
    active: 0,
    terminated: 0,
    totalSalary: 0,
    branches: 0,
    departments: 0,
    retired: 0,
    disabled: 0,
    foreigner: 0,
    avgSalary: 0,
    avgWorkYears: 0
  })
  const [departmentStats, setDepartmentStats] = useState<any[]>([])
  const [branchStats, setBranchStats] = useState<any[]>([])
  const [positionStats, setPositionStats] = useState<any[]>([])
  const [recentHires, setRecentHires] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date()

      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      try {
        const rightsResponse = await axiosClient.get('/api/posting-rights', {
          params: {
            populate: ['company'],
            'sort[0]': 'createdAt:desc',
            'filters[createdAt][$gt]': thirtyDaysAgo.toISOString()
          }
        })

        if (rightsResponse.data.data?.[0]) {
          setPostingRights(rightsResponse.data.data[0])
        }

        const logsResponse = await axiosClient.get('/api/application-logs', {
          params: {
            populate: ['job_listing'],
            'pagination[pageSize]': 7,
            'sort[0]': 'createdAt:desc',
            'filters[createdAt][$gt]': thirtyDaysAgo.toISOString()
          }
        })

        setApplicationLogs(logsResponse.data.data)

        // Get company profile
        const companyProfile = authService.getCompanyProfile()
        console.log('🏢 Dashboard - Company Profile:', companyProfile)

        // Workers data - Backend automatically filters by company
        const workersResponse = await axiosClient.get('/api/workers', {
          params: {
            'pagination[pageSize]': 1000,
            'populate[0]': 'department',
            'populate[1]': 'branch',
            'populate[2]': 'position',
            'populate[3]': 'company'
          }
        })

        console.log('👥 Dashboard - Workers Response:', workersResponse.data)
        const workersData = workersResponse.data.data || []
        console.log('👥 Dashboard - Workers Count:', workersData.length)
        const totalWorkers = workersData.length
        const activeWorkers = workersData.filter((w: any) => w.isActive).length
        const terminatedWorkers = workersData.filter((w: any) => !w.isActive || w.terminationDate).length
        const totalSalary = workersData.reduce((sum: number, w: any) => sum + (parseFloat(w.salary) || 0), 0)
        
        const uniqueBranches = new Set(workersData.map((w: any) => w.branch?.id).filter(Boolean)).size
        const uniqueDepartments = new Set(workersData.map((w: any) => w.department?.id).filter(Boolean)).size
        
        const retiredWorkers = workersData.filter((w: any) => w.isRetired).length
        const disabledWorkers = workersData.filter((w: any) => w.isDisabled).length
        const foreignWorkers = workersData.filter((w: any) => w.isForeigner).length

        // Calculate average salary
        const avgSalary = activeWorkers > 0 ? totalSalary / activeWorkers : 0

        // Calculate average work years
        const today = new Date()
        const totalWorkYears = workersData
          .filter((w: any) => w.isActive && w.hireDate)
          .reduce((sum: number, w: any) => {
            const hireDate = new Date(w.hireDate)
            const years = (today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
            return sum + years
          }, 0)
        const avgWorkYears = activeWorkers > 0 ? totalWorkYears / activeWorkers : 0

        // Department statistics
        const deptStats: any = {}
        workersData.forEach((w: any) => {
          if (w.department && w.isActive) {
            const deptName = w.department.name || 'Tanımsız'
            if (!deptStats[deptName]) {
              deptStats[deptName] = 0
            }
            deptStats[deptName]++
          }
        })
        const departmentStatsArray = Object.entries(deptStats).map(([name, count]) => ({ name, count }))

        // Branch statistics
        const branchStatsMap: any = {}
        workersData.forEach((w: any) => {
          if (w.branch && w.isActive) {
            const branchName = w.branch.name || 'Tanımsız'
            if (!branchStatsMap[branchName]) {
              branchStatsMap[branchName] = 0
            }
            branchStatsMap[branchName]++
          }
        })
        const branchStatsArray = Object.entries(branchStatsMap).map(([name, count]) => ({ name, count }))

        // Position statistics
        const positionStatsMap: any = {}
        workersData.forEach((w: any) => {
          if (w.position && w.isActive) {
            const positionName = w.position.name || 'Tanımsız'
            if (!positionStatsMap[positionName]) {
              positionStatsMap[positionName] = 0
            }
            positionStatsMap[positionName]++
          }
        })
        const positionStatsArray = Object.entries(positionStatsMap).map(([name, count]) => ({ name, count }))

        // Recent hires (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentHiresArray = workersData
          .filter((w: any) => w.isActive && w.hireDate && new Date(w.hireDate) >= thirtyDaysAgo)
          .sort((a: any, b: any) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
          .slice(0, 5)

        setWorkers({
          total: totalWorkers,
          active: activeWorkers,
          terminated: terminatedWorkers,
          totalSalary: totalSalary,
          branches: uniqueBranches,
          departments: uniqueDepartments,
          retired: retiredWorkers,
          disabled: disabledWorkers,
          foreigner: foreignWorkers,
          avgSalary: avgSalary,
          avgWorkYears: avgWorkYears
        })

        setDepartmentStats(departmentStatsArray)
        setBranchStats(branchStatsArray)
        setPositionStats(positionStatsArray)
        setRecentHires(recentHiresArray)
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const applicationStats = {
    total: postingRights.totalApplicationCount,
    active: postingRights.activePostings,
    pending: postingRights.postingsUsed - postingRights.activePostings,
    rejected: 0 // Henüz reddedilen başvuru verisi yok
  }

  const remainingViews = postingRights.postingQuota > 0
    ? Math.round((postingRights.postingQuota - postingRights.postingsUsed) / postingRights.postingQuota * 100)
    : 0

  const applicationStatusData = [
    { name: 'Aktif', value: applicationStats.active },
    { name: 'Beklemede', value: applicationStats.pending },
    { name: 'Reddedildi', value: applicationStats.rejected }
  ]

  // Mock click trend data for empty logs
  interface DayData {
    date: Date;
    value: number;
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

      const dayIndex = days.findIndex(day =>
        day.date.toDateString() === logDate.toDateString()
      )

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

  // States
  const [applicationStatusOptions] = useState<ApexOptions>({
    chart: {
      parentHeightOffset: 0,
      type: 'donut',
      height: 300,
      toolbar: {
        show: false
      }
    },
    labels: applicationStatusData.map(item => item.name),
    colors: ['#7367F0', '#FFAB1D', '#EB3D63'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%'
        }
      }
    }
  })

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Aktif Çalışan
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(workers.active)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {workers.total} toplam çalışan
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'primary.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-users' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Departman
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(workers.departments)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {workers.branches} şube
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-building' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Toplam Maaş
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(workers.totalSalary)} ₺
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Aylık ödeme
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'warning.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-currency-lira' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Özel Durumlar
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Emekli: {workers.retired}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Engelli: {workers.disabled}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Yabancı: {workers.foreigner}
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'info.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-user-check' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Ortalama Maaş */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Ortalama Maaş
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(Math.round(workers.avgSalary))} ₺
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Kişi başı
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'secondary.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-receipt' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Ortalama Kıdem */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Ortalama Kıdem
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {workers.avgWorkYears.toFixed(1)} Yıl
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Çalışma süresi
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'error.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-calendar-stats' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* İşten Ayrılanlar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  İşten Ayrılan
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(workers.terminated)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Toplam ayrılan
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'grey.500', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-user-x' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Son Eklenen Çalışanlar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Yeni İşe Alımlar
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(recentHires.length)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Son 30 gün
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-user-plus' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Departman ve Şube İstatistikleri */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary' sx={{ mb: 3 }}>
              Departman Bazlı Çalışan Sayıları
            </Typography>
            {departmentStats.length > 0 ? (
              <Box>
                {departmentStats.map((dept: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>{dept.name}</Typography>
                      <Typography variant='body2' fontWeight='bold'>{dept.count} kişi</Typography>
                    </Box>
                    <LinearProgress 
                      variant='determinate' 
                      value={(dept.count / workers.active) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>Henüz departman verisi bulunmuyor</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary' sx={{ mb: 3 }}>
              Şube Bazlı Çalışan Sayıları
            </Typography>
            {branchStats.length > 0 ? (
              <Box>
                {branchStats.map((branch: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>{branch.name}</Typography>
                      <Typography variant='body2' fontWeight='bold'>{branch.count} kişi</Typography>
                    </Box>
                    <LinearProgress 
                      variant='determinate' 
                      value={(branch.count / workers.active) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color='success'
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>Henüz şube verisi bulunmuyor</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Pozisyon Bazlı İstatistikler */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary' sx={{ mb: 3 }}>
              Pozisyon Bazlı Çalışan Dağılımı
            </Typography>
            {positionStats.length > 0 ? (
              <Box>
                {positionStats.map((position: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>{position.name}</Typography>
                      <Typography variant='body2' fontWeight='bold'>{position.count} kişi</Typography>
                    </Box>
                    <LinearProgress 
                      variant='determinate' 
                      value={(position.count / workers.active) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color='secondary'
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>Henüz pozisyon verisi bulunmuyor</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Son Eklenen Çalışanlar */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='text.primary' sx={{ mb: 3 }}>
              Son Eklenen Çalışanlar (30 Gün)
            </Typography>
            {recentHires.length > 0 ? (
              <Box>
                {recentHires.map((worker: any, index: number) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      pb: 2,
                      borderBottom: index < recentHires.length - 1 ? '1px solid var(--mui-palette-divider)' : 'none'
                    }}
                  >
                    <Box>
                      <Typography variant='body2' fontWeight='bold'>
                        {worker.firstName} {worker.lastName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {worker.department?.name || 'Departman yok'} · {worker.position?.name || 'Pozisyon yok'}
                      </Typography>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(worker.hireDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>Son 30 günde yeni işe alım yok</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CompanyDashboardPage
