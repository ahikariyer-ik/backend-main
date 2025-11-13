'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Link from '@components/Link'

// Services
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'

// QRCode library
import QRCode from 'react-qr-code'

interface QRSession {
  id: string
  sessionToken: string
  sessionName: string
  expiresAt: string
  usageCount: number
  maxUsageCount: number | null
  branch: {
    id: string
    name: string
  } | null
  createdAt: string
  qrCodeData: string
}

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
  notes?: string
}

interface Branch {
  id: string
  documentId: string
  name: string
}

const PDKSPage = () => {
  // States
  const [qrSessions, setQrSessions] = useState<QRSession[]>([])
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<QRSession | null>(null)
  
  // Form states
  const [sessionName, setSessionName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [expirationMinutes, setExpirationMinutes] = useState(5)
  const [maxUsageCount, setMaxUsageCount] = useState('')

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadData()
  }, [])

  // Handlers
  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadQRSessions(), loadRecentRecords(), loadBranches()])
      setError(null)
    } catch (error: any) {
      console.error('Load data error:', error)
      setError(error.response?.data?.error?.message || 'Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadQRSessions = async () => {
    try {
      const response = await axiosClient.get('/api/qr-code-sessions/my-sessions')
      setQrSessions(response.data.data || [])
    } catch (error) {
      console.error('Load QR sessions error:', error)
    }
  }

  const loadRecentRecords = async () => {
    try {
      const response = await axiosClient.get('/api/pdks-attendances/company-records?limit=10')
      setRecentRecords(response.data.data || [])
    } catch (error) {
      console.error('Load recent records error:', error)
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

  const handleCreateQRCode = async () => {
    try {
      const requestData: any = {
        sessionName: sessionName || `QR ${new Date().toLocaleString('tr-TR')}`,
        expirationMinutes: parseInt(expirationMinutes.toString()),
      }

      if (branchId) {
        requestData.branch = branchId
      }

      if (maxUsageCount) {
        requestData.maxUsageCount = parseInt(maxUsageCount)
      }

      const response = await axiosClient.post('/api/qr-code-sessions/create', requestData)
      
      setCreateDialogOpen(false)
      resetForm()
      await loadQRSessions()
      
      // Show QR code
      setSelectedSession(response.data.data)
      setQrDialogOpen(true)
    } catch (error: any) {
      console.error('Create QR code error:', error)
      setError(error.response?.data?.error?.message || 'QR kod oluşturulurken hata oluştu')
    }
  }

  const handleDeactivateSession = async (sessionId: string) => {
    try {
      await axiosClient.post(`/api/qr-code-sessions/${sessionId}/deactivate`)
      await loadQRSessions()
    } catch (error: any) {
      console.error('Deactivate session error:', error)
      setError(error.response?.data?.error?.message || 'QR kod devre dışı bırakılırken hata oluştu')
    }
  }

  const resetForm = () => {
    setSessionName('')
    setBranchId('')
    setExpirationMinutes(5)
    setMaxUsageCount('')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 0) return 'Süresi dolmuş'
    if (diffMins < 60) return `${diffMins} dakika kaldı`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours} saat ${mins} dakika kaldı`
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `QR_${selectedSession?.sessionName || 'code'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">PDKS - Personel Devam Kontrol Sistemi</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              startIcon={<i className="tabler-qrcode" />}
            >
              Yeni QR Kod Oluştur
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/pdks/reports')}
              startIcon={<i className="tabler-report" />}
            >
              Raporlar
            </Button>
          </Box>
        </Box>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Active QR Sessions */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Aktif QR Kodlar" 
            subheader="Çalışanların giriş-çıkış yapabileceği aktif QR kodları"
          />
          <CardContent>
            {qrSessions.length === 0 ? (
              <Alert severity="info">
                Henüz aktif QR kod yok. Yeni bir QR kod oluşturarak başlayın.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>QR Kod</TableCell>
                      <TableCell>Oturum Adı</TableCell>
                      <TableCell>Şube</TableCell>
                      <TableCell>Kullanım</TableCell>
                      <TableCell>Kalan Süre</TableCell>
                      <TableCell>Oluşturma</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qrSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSession(session)
                              setQrDialogOpen(true)
                            }}
                          >
                            <i className="tabler-qrcode text-2xl" />
                          </IconButton>
                        </TableCell>
                        <TableCell>{session.sessionName}</TableCell>
                        <TableCell>
                          {session.branch ? (
                            <Chip label={session.branch.name} size="small" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">Tüm şubeler</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.usageCount} / {session.maxUsageCount || '∞'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getRemainingTime(session.expiresAt)} 
                            size="small"
                            color={new Date(session.expiresAt) < new Date() ? 'error' : 'success'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(session.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeactivateSession(session.id)}
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
      </Grid>

      {/* Recent Attendance Records */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Son Giriş-Çıkış Kayıtları" 
            subheader="Son 10 giriş-çıkış kaydı"
            action={
              <Button
                component={Link}
                href="/pdks/records"
                variant="text"
                endIcon={<i className="tabler-arrow-right" />}
              >
                Tümünü Gör
              </Button>
            }
          />
          <CardContent>
            {recentRecords.length === 0 ? (
              <Alert severity="info">Henüz giriş-çıkış kaydı yok.</Alert>
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.worker.firstName} {record.worker.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.checkType === 'in' ? 'Giriş' : 'Çıkış'}
                            color={record.checkType === 'in' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDateTime(record.checkTime)}</TableCell>
                        <TableCell>
                          {record.branch?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {record.isManual && (
                            <Chip label="Manuel" size="small" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Create QR Code Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni QR Kod Oluştur</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} mt={2}>
            <TextField
              label="Oturum Adı"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Örn: Ana Giriş QR Kodu"
              fullWidth
            />
            
            <TextField
              select
              label="Şube (Opsiyonel)"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Tüm Şubeler</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.documentId} value={branch.documentId}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="Geçerlilik Süresi (Dakika)"
              value={expirationMinutes}
              onChange={(e) => setExpirationMinutes(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1, max: 1440 }}
            />

            <TextField
              type="number"
              label="Maksimum Kullanım Sayısı (Opsiyonel)"
              value={maxUsageCount}
              onChange={(e) => setMaxUsageCount(e.target.value)}
              placeholder="Boş bırakın = Sınırsız"
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>İptal</Button>
          <Button onClick={handleCreateQRCode} variant="contained" color="primary">
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Kod</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={2}>
            <Typography variant="h6">{selectedSession?.sessionName}</Typography>
            
            {selectedSession && (
              <Box id="qr-code-svg">
                <QRCode
                  value={selectedSession.qrCodeData}
                  size={300}
                  level="H"
                />
              </Box>
            )}

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Geçerlilik: {selectedSession && formatDateTime(selectedSession.expiresAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSession && getRemainingTime(selectedSession.expiresAt)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadQRCode} startIcon={<i className="tabler-download" />}>
            İndir
          </Button>
          <Button onClick={() => setQrDialogOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PDKSPage


