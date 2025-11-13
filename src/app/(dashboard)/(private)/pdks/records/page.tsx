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
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'

// Component Imports
import Link from '@components/Link'

// Services
import { axiosClient } from '@/libs/axios'

interface AttendanceRecord {
  id: string
  worker: {
    id: string
    firstName: string
    lastName: string
  }
  checkType: 'in' | 'out'
  checkTime: string
  branch: {
    id: string
    name: string
  } | null
  isManual: boolean
  manualEntryBy?: {
    id: string
    username: string
  }
  notes?: string
  locationLatitude?: number
  locationLongitude?: number
}

interface Worker {
  id: string
  documentId: string
  firstName: string
  lastName: string
}

interface Branch {
  id: string
  documentId: string
  name: string
}

const PDKSRecordsPage = () => {
  // States
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadInitialData()
  }, [])

  // Handlers
  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadRecords(), loadWorkers(), loadBranches()])
      setError(null)
    } catch (error: any) {
      console.error('Load initial data error:', error)
      setError(error.response?.data?.error?.message || 'Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadRecords = async () => {
    try {
      const params = new URLSearchParams()
      params.append('limit', '500')
      
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (selectedWorker) params.append('workerId', selectedWorker)
      if (selectedBranch) params.append('branchId', selectedBranch)

      const response = await axiosClient.get(`/api/pdks-attendances/company-records?${params.toString()}`)
      setRecords(response.data.data || [])
    } catch (error: any) {
      console.error('Load records error:', error)
      throw error
    }
  }

  const loadWorkers = async () => {
    try {
      const response = await axiosClient.get('/api/workers?filters[isActive]=true')
      setWorkers(response.data.data || [])
    } catch (error) {
      console.error('Load workers error:', error)
    }
  }

  const loadBranches = async () => {
    try {
      const response = await axiosClient.get('/api/branches')
      setBranches(response.data.data || [])
    } catch (error) {
      console.error('Load branches error:', error)
    }
  }

  const handleFilter = async () => {
    setLoading(true)
    try {
      await loadRecords()
      setError(null)
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Kayıtlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setSelectedWorker('')
    setSelectedBranch('')
    loadInitialData()
  }

  const handleDelete = async (recordId: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return

    try {
      await axiosClient.delete(`/api/pdks-attendances/${recordId}`)
      await loadRecords()
    } catch (error: any) {
      console.error('Delete record error:', error)
      setError(error.response?.data?.error?.message || 'Kayıt silinirken hata oluştu')
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Çalışan', 'Tip', 'Tarih & Saat', 'Şube', 'Durum', 'Not'],
      ...records.map(record => [
        `${record.worker.firstName} ${record.worker.lastName}`,
        record.checkType === 'in' ? 'Giriş' : 'Çıkış',
        formatDateTime(record.checkTime),
        record.branch?.name || '-',
        record.isManual ? 'Manuel' : 'QR Kod',
        record.notes || '-'
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pdks_kayitlari_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading && records.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h4">PDKS Kayıtları</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={exportToCSV}
            startIcon={<i className="tabler-download" />}
            disabled={records.length === 0}
          >
            Dışa Aktar (CSV)
          </Button>
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
        <CardHeader title="Filtrele" />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Başlangıç Tarihi"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Bitiş Tarihi"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Şube"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Tüm Şubeler</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.documentId} value={branch.documentId}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleFilter}
                  startIcon={<i className="tabler-filter" />}
                >
                  Filtrele
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<i className="tabler-refresh" />}
                >
                  Sıfırla
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader 
          title={`Toplam ${records.length} Kayıt`}
          subheader="Çalışanların giriş-çıkış kayıtları"
        />
        <CardContent>
          {records.length === 0 ? (
            <Alert severity="info">Kayıt bulunamadı.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Çalışan</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell>Tarih & Saat</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Konum</TableCell>
                    <TableCell>Not</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {record.worker.firstName} {record.worker.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.checkType === 'in' ? 'Giriş' : 'Çıkış'}
                          color={record.checkType === 'in' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(record.checkTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {record.branch?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {record.isManual ? (
                          <Chip 
                            label={`Manuel (${record.manualEntryBy?.username})`}
                            size="small" 
                            variant="outlined" 
                          />
                        ) : (
                          <Chip label="QR Kod" size="small" color="primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        {record.locationLatitude && record.locationLongitude ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps?q=${record.locationLatitude},${record.locationLongitude}`,
                                '_blank'
                              )
                            }}
                          >
                            <i className="tabler-map-pin text-lg" />
                          </IconButton>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.notes ? (
                          <Typography variant="body2" color="text.secondary">
                            {record.notes}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(record.id)}
                        >
                          <i className="tabler-trash" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PDKSRecordsPage


