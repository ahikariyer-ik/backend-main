'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Grid, 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

// Services
import { leaveRequestService, LeaveRequest, CreateLeaveRequestDTO } from '@/services/leave-request.service'
import { authService } from '@/services'
import { axiosClient } from '@/libs/axios'

// Date fns
import { differenceInDays, parseISO } from 'date-fns'

const WorkerLeaveRequestsPage = () => {
  // States
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [remainingLeave, setRemainingLeave] = useState<any>(null)
  const [workerData, setWorkerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const user = authService.getUser()
      if (!user) {
        throw new Error('Kullanıcı bilgisi bulunamadı')
      }

      // İzin taleplerini çek (backend'de otomatik worker bulunacak)
      const leaveResponse = await leaveRequestService.getMyRequests()
      if (leaveResponse.error) {
        throw leaveResponse.error
      }
      setLeaveRequests(leaveResponse.data)

      // Worker bilgisini ilk izin talebinden al veya boş bırak
      if (leaveResponse.data.length > 0) {
        setWorkerData(leaveResponse.data[0].worker)
      } else {
        // Hiç izin talebi yoksa worker bilgisi için dummy data
        setWorkerData({ documentId: 'current-worker' } as any)
      }

      // Kalan izin günlerini çek (backend'de otomatik worker bulunacak)
      const remainingResponse = await leaveRequestService.getMyRemainingDays()
      if (remainingResponse.error) {
        throw remainingResponse.error
      }
      setRemainingLeave(remainingResponse.data)

    } catch (error: any) {
      console.error('Veri yüklenirken hata:', error)
      setError(error.message || 'Veri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDialogOpen = () => {
    setFormData({
      leaveType: 'annual',
      startDate: '',
      endDate: '',
      reason: ''
    })
    setCreateDialogOpen(true)
    setError(null)
  }

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false)
    setFormData({
      leaveType: 'annual',
      startDate: '',
      endDate: '',
      reason: ''
    })
  }

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    try {
      const start = parseISO(formData.startDate)
      const end = parseISO(formData.endDate)
      const days = differenceInDays(end, start) + 1
      return days > 0 ? days : 0
    } catch {
      return 0
    }
  }

  const handleSubmitLeaveRequest = async () => {
    try {
      setSubmitting(true)
      setError(null)

      if (!formData.startDate || !formData.endDate) {
        setError('Lütfen başlangıç ve bitiş tarihlerini seçin')
        return
      }

      const totalDays = calculateDays()
      if (totalDays <= 0) {
        setError('Geçersiz tarih aralığı')
        return
      }

      const requestData: any = {
        worker: 'auto', // Backend'de otomatik bulunacak
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: totalDays,
        reason: formData.reason || undefined
      }

      const response = await leaveRequestService.createLeaveRequest(requestData)
      if (response.error) {
        throw response.error
      }

      setSuccess('İzin talebiniz başarıyla oluşturuldu')
      setCreateDialogOpen(false)
      await loadData()

      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error: any) {
      console.error('İzin talebi oluşturulurken hata:', error)
      setError(error.message || 'İzin talebi oluşturulurken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: 'Yıllık İzin',
      sick: 'İstirahat Raporu',
      maternity: 'Doğum',
      paternity: 'Babalık',
      funeral: 'Cenaze',
      wedding: 'Düğün',
      moving: 'Taşınma',
      unpaid: 'Ücretsiz İzin',
      other: 'Diğer'
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor'
      case 'approved': return 'Onaylandı'
      case 'rejected': return 'Reddedildi'
      default: return status
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h4' sx={{ mb: 1 }}>
              İzin Taleplerim
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              İzin taleplerini oluşturun ve takip edin
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={handleCreateDialogOpen}
          >
            Yeni İzin Talebi
          </Button>
        </Box>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {success && (
        <Grid item xs={12}>
          <Alert severity='success' onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* İstatistikler */}
      {remainingLeave && (
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant='h6' color='text.secondary'>Kalan İzin</Typography>
                      <Typography variant='h3'>{remainingLeave.remainingDays || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        gün
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-calendar-check' style={{ fontSize: 28, color: 'white' }} />
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
                      <Typography variant='h6' color='text.secondary'>Toplam Hak</Typography>
                      <Typography variant='h3'>{remainingLeave.totalEntitledDays || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        gün
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'primary.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-calendar' style={{ fontSize: 28, color: 'white' }} />
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
                      <Typography variant='h6' color='text.secondary'>Kullanılan İzin</Typography>
                      <Typography variant='h3'>{remainingLeave.usedDays || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        gün
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'warning.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-calendar-time' style={{ fontSize: 28, color: 'white' }} />
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
                      <Typography variant='h6' color='text.secondary'>Bekleyen Talepler</Typography>
                      <Typography variant='h3'>{leaveRequests.filter(r => r.status === 'pending').length}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        talep
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'info.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-clock-hour-4' style={{ fontSize: 28, color: 'white' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* İzin Talepleri Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='İzin Taleplerim' />
          <CardContent>
            {leaveRequests.length > 0 ? (
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>İzin Türü</TableCell>
                      <TableCell>Başlangıç</TableCell>
                      <TableCell>Bitiş</TableCell>
                      <TableCell align='center'>Gün Sayısı</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Değerlendirme Notu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests.map((request) => (
                      <TableRow key={request.documentId}>
                        <TableCell>
                          <Chip 
                            label={getLeaveTypeLabel(request.leaveType)}
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>{new Date(request.startDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{new Date(request.endDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {request.totalDays}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status) as any}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {request.reason || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {request.reviewNote || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body1' color='text.secondary'>
                  Henüz izin talebiniz bulunmuyor
                </Typography>
                <Button
                  variant='outlined'
                  sx={{ mt: 2 }}
                  onClick={handleCreateDialogOpen}
                >
                  İlk İzin Talebini Oluştur
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Yeni İzin Talebi Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCreateDialogClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Yeni İzin Talebi Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>İzin Türü</InputLabel>
              <Select
                value={formData.leaveType}
                label='İzin Türü'
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              >
                <MenuItem value='annual'>Yıllık İzin</MenuItem>
                <MenuItem value='sick'>İstirahat Raporu</MenuItem>
                <MenuItem value='maternity'>Doğum</MenuItem>
                <MenuItem value='paternity'>Babalık</MenuItem>
                <MenuItem value='funeral'>Cenaze</MenuItem>
                <MenuItem value='wedding'>Düğün</MenuItem>
                <MenuItem value='moving'>Taşınma</MenuItem>
                <MenuItem value='unpaid'>Ücretsiz İzin</MenuItem>
                <MenuItem value='other'>Diğer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type='date'
              label='Başlangıç Tarihi'
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <TextField
              fullWidth
              type='date'
              label='Bitiş Tarihi'
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />

            {formData.startDate && formData.endDate && (
              <Alert severity='info'>
                Toplam {calculateDays()} gün izin talep ediyorsunuz
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label='Açıklama (İsteğe Bağlı)'
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder='İzin talebiniz hakkında açıklama...'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} disabled={submitting}>
            İptal
          </Button>
          <Button 
            variant='contained' 
            onClick={handleSubmitLeaveRequest}
            disabled={submitting || !formData.startDate || !formData.endDate}
          >
            {submitting ? 'Oluşturuluyor...' : 'Talep Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default WorkerLeaveRequestsPage

