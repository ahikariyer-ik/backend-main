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
import { authService, propertyService, vehicleService, reminderService, purchasingService, decisionService } from '@/services'

const StatisticsPage = () => {
  // States
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
  const [institutionStats, setInstitutionStats] = useState({
    properties: 0,
    vehicles: 0,
    reminders: 0,
    pendingReminders: 0,
    purchasings: 0,
    totalPurchaseAmount: 0,
    decisions: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get company profile
        const companyProfile = authService.getCompanyProfile()
        console.log('📊 Statistics - Company Profile:', companyProfile)

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

        console.log('👥 Statistics - Workers Response:', workersResponse.data)
        const workersData = workersResponse.data.data || []
        console.log('👥 Statistics - Workers Count:', workersData.length)
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

        // Fetch institution management statistics
        try {
          console.log('🏢 Fetching institution management statistics...')
          
          // Get properties
          const propertiesData = await propertyService.getAll()
          console.log('🏠 Properties:', propertiesData.length)
          
          // Get vehicles
          const vehiclesData = await vehicleService.getAll()
          console.log('🚗 Vehicles:', vehiclesData.length)
          
          // Get reminders
          const remindersData = await reminderService.getAll()
          const pendingRemindersCount = remindersData.filter((r: any) => r.status === 'pending').length
          console.log('🔔 Reminders:', remindersData.length, 'Pending:', pendingRemindersCount)
          
          // Get purchasings
          const purchasingsData = await purchasingService.getAll()
          const totalPurchaseAmount = purchasingsData.reduce((sum: number, p: any) => {
            return sum + (parseFloat(p.totalPrice as any) || 0)
          }, 0)
          console.log('🛒 Purchasings:', purchasingsData.length, 'Total:', totalPurchaseAmount)
          
          // Get decisions
          const decisionsData = await decisionService.getAll()
          console.log('📄 Decisions:', decisionsData.length)

          setInstitutionStats({
            properties: propertiesData.length,
            vehicles: vehiclesData.length,
            reminders: remindersData.length,
            pendingReminders: pendingRemindersCount,
            purchasings: purchasingsData.length,
            totalPurchaseAmount: totalPurchaseAmount,
            decisions: decisionsData.length
          })
          
          console.log('✅ Institution stats loaded successfully')
        } catch (error) {
          console.error('❌ Kurum yönetimi verileri yüklenirken hata:', error)
        }
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

      {/* Kurum Yönetimi İstatistikleri */}
      <Grid item xs={12}>
        <Typography variant='h5' sx={{ mb: 2, mt: 2 }}>
          Kurum Yönetimi
        </Typography>
      </Grid>

      {/* Konutlar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Konutlar
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(institutionStats.properties)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Toplam konut
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'info.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-home' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Araçlar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Araçlar
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(institutionStats.vehicles)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Toplam araç
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'primary.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-car' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Anımsatıcılar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Anımsatıcılar
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(institutionStats.reminders)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {institutionStats.pendingReminders} beklemede
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'warning.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-bell' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Satın Alma */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Satın Alma
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(institutionStats.purchasings)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {formatNumber(institutionStats.totalPurchaseAmount)} ₺
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-shopping-cart' style={{ fontSize: 24, color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Kararlar */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='h6' color='text.primary'>
                  Kararlar
                </Typography>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {formatNumber(institutionStats.decisions)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Toplam karar
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'error.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='tabler-file-text' style={{ fontSize: 24, color: 'white' }} />
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

export default StatisticsPage
