'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'

// Component Imports
import Link from '@components/Link'

// Services
import { axiosClient } from '@/libs/axios'

interface DayRecord {
  date: string
  checkIn: string | null
  checkOut: string | null
  totalHours: number
}

interface WorkerReport {
  workerId: string
  workerName: string
  email: string
  days: { [date: string]: DayRecord }
}

interface MonthlyReport {
  year: number
  month: number
  startDate: string
  endDate: string
  workers: WorkerReport[]
}

interface Worker {
  id: string
  documentId: string
  firstName: string
  lastName: string
}

const PDKSReportsPage = () => {
  // States
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedWorker, setSelectedWorker] = useState('')

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadWorkers()
    loadReport()
  }, [])

  // Handlers
  const loadWorkers = async () => {
    try {
      const response = await axiosClient.get('/api/workers?filters[isActive]=true')
      setWorkers(response.data.data || [])
    } catch (error) {
      console.error('Load workers error:', error)
    }
  }

  const loadReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('year', selectedYear.toString())
      params.append('month', selectedMonth.toString())
      if (selectedWorker) params.append('workerId', selectedWorker)

      const response = await axiosClient.get(`/api/pdks-attendances/monthly-report?${params.toString()}`)
      setReport(response.data.data)
      setError(null)
    } catch (error: any) {
      console.error('Load report error:', error)
      setError(error.response?.data?.error?.message || 'Rapor yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    loadReport()
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHours = (hours: number) => {
    if (hours === 0) return '-'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}s ${m}d`
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const calculateTotalHours = (worker: WorkerReport) => {
    return Object.values(worker.days).reduce((sum, day) => sum + day.totalHours, 0)
  }

  const exportToCSV = () => {
    if (!report) return

    const daysInMonth = getDaysInMonth(report.year, report.month)
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(report.year, report.month - 1, i + 1)
      return date.toISOString().split('T')[0]
    })

    const csvContent = [
      ['Çalışan', 'Email', ...dates.map(d => `${d} Giriş`), ...dates.map(d => `${d} Çıkış`), 'Toplam Saat'],
      ...report.workers.map(worker => [
        worker.workerName,
        worker.email,
        ...dates.map(date => formatTime(worker.days[date]?.checkIn)),
        ...dates.map(date => formatTime(worker.days[date]?.checkOut)),
        formatHours(calculateTotalHours(worker))
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pdks_raporu_${report.year}_${report.month}.csv`
    link.click()
  }

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)
  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' }
  ]

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h4">PDKS Aylık Raporlar</Typography>
        <Box display="flex" gap={2}>
          {report && (
            <Button
              variant="outlined"
              onClick={exportToCSV}
              startIcon={<i className="tabler-download" />}
            >
              Dışa Aktar (CSV)
            </Button>
          )}
          <Button
            variant="contained"
            component={Link}
            href="/pdks"
            startIcon={<i className="tabler-arrow-left" />}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Rapor Parametreleri" />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Yıl"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                fullWidth
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Ay"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                fullWidth
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Çalışan"
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Tüm Çalışanlar</MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker.documentId} value={worker.documentId}>
                    {worker.firstName} {worker.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleGenerate}
                startIcon={<i className="tabler-report" />}
                disabled={loading}
              >
                {loading ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : report ? (
        <Card>
          <CardHeader 
            title={`${months.find(m => m.value === report.month)?.label} ${report.year} - Çalışma Çizelgesi`}
            subheader={`${report.workers.length} çalışan`}
          />
          <CardContent>
            {report.workers.length === 0 ? (
              <Alert severity="info">Bu ay için kayıt bulunamadı.</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>Çalışan</TableCell>
                      {Array.from({ length: getDaysInMonth(report.year, report.month) }, (_, i) => i + 1).map(day => (
                        <TableCell key={day} align="center" sx={{ minWidth: 80 }}>
                          <Typography variant="caption" fontWeight="bold">
                            {day}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                        Toplam Saat
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.workers.map((worker) => (
                      <TableRow key={worker.workerId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {worker.workerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {worker.email}
                          </Typography>
                        </TableCell>
                        {Array.from({ length: getDaysInMonth(report.year, report.month) }, (_, i) => {
                          const date = new Date(report.year, report.month - 1, i + 1).toISOString().split('T')[0]
                          const dayData = worker.days[date]
                          
                          return (
                            <TableCell key={i} align="center">
                              {dayData ? (
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption">Giriş: {formatTime(dayData.checkIn)}</Typography>
                                      <br />
                                      <Typography variant="caption">Çıkış: {formatTime(dayData.checkOut)}</Typography>
                                      <br />
                                      <Typography variant="caption">Süre: {formatHours(dayData.totalHours)}</Typography>
                                    </Box>
                                  }
                                >
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 40,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: dayData.checkIn && dayData.checkOut ? 'success.light' : 'warning.light',
                                      borderRadius: 1,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Typography variant="caption" fontSize="10px">
                                      {formatTime(dayData.checkIn)}
                                    </Typography>
                                    <Typography variant="caption" fontSize="10px">
                                      {formatTime(dayData.checkOut)}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: 40,
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1
                                  }}
                                />
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatHours(calculateTotalHours(worker))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">
          Yukarıdan parametreleri seçerek rapor oluşturun.
        </Alert>
      )}
    </Box>
  )
}

export default PDKSReportsPage


