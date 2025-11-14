'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardHeader, CardContent, Grid, Box, Typography, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, LinearProgress, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material'

// Services
import { leaveRequestService, LeaveRequest } from '@/services/leave-request.service'
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'

interface Worker {
  id: number
  firstName: string
  lastName: string
}

const LeaveTrackingPage = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [deleting, setDeleting] = useState(false)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorker, setSelectedWorker] = useState<string>('all')

  useEffect(() => {
    loadLeaveRequests()
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      const companyProfile = authService.getCompanyProfile()
      if (!companyProfile) return

      const response = await axiosClient.get('/api/workers', {
        params: {
          'filters[company][id]': companyProfile.id,
          'filters[isActive]': true,
          'pagination[pageSize]': 1000,
          'sort[0]': 'firstName:asc'
        }
      })
      
      setWorkers(response.data.data || [])
    } catch (error: any) {
      console.error('Çalışanlar yüklenirken hata:', error)
    }
  }

  const loadLeaveRequests = async () => {
    try {
      const response = await leaveRequestService.getLeaveRequests()
      if (response.error) {
        throw response.error
      }
      setLeaveRequests(response.data)
    } catch (error: any) {
      console.error('İzin talepleri yüklenirken hata:', error)
      setError(error.message || 'İzin talepleri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Filtrelenmiş izin talepleri
  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (selectedWorker === 'all') return true
    return request.worker.id.toString() === selectedWorker
  })

  const handleReviewClick = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setReviewAction(action)
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  const handleReviewConfirm = async () => {
    if (!selectedRequest) return

    try {
      if (reviewAction === 'approve') {
        await leaveRequestService.approveLeaveRequest(selectedRequest.documentId, reviewNote)
      } else {
        await leaveRequestService.rejectLeaveRequest(selectedRequest.documentId, reviewNote)
      }
      
      await loadLeaveRequests()
      setReviewDialogOpen(false)
      setSelectedRequest(null)
      setReviewNote('')
    } catch (error: any) {
      console.error('İzin talebi işlenirken hata:', error)
      setError(error.message || 'İzin talebi işlenirken bir hata oluştu')
    }
  }

  const handleDeleteClick = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRequest) return

    try {
      setDeleting(true)
      await leaveRequestService.deleteLeaveRequest(selectedRequest.documentId)
      
      await loadLeaveRequests()
      setDeleteDialogOpen(false)
      setSelectedRequest(null)
    } catch (error: any) {
      console.error('İzin talebi silinirken hata:', error)
      setError(error.message || 'İzin talebi silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const types: any = {
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

  // İstatistikler (filtrelenmiş verilerle)
  const stats = {
    total: filteredLeaveRequests.length,
    pending: filteredLeaveRequests.filter(r => r.status === 'pending').length,
    approved: filteredLeaveRequests.filter(r => r.status === 'approved').length,
    rejected: filteredLeaveRequests.filter(r => r.status === 'rejected').length,
    todayOnLeave: filteredLeaveRequests.filter(r => {
      const today = new Date()
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      return r.status === 'approved' && start <= today && end >= today
    }).length
  }

  if (loading) {
    return <Typography>Yükleniyor...</Typography>
  }

  return (
    <Box>
      {/* İstatistikler */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Toplam Talep</Typography>
              <Typography variant='h4'>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Bekleyen</Typography>
              <Typography variant='h4' color='warning.main'>{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Onaylanan</Typography>
              <Typography variant='h4' color='success.main'>{stats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Reddedilen</Typography>
              <Typography variant='h4' color='error.main'>{stats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Bugün İzinde</Typography>
              <Typography variant='h4' color='primary.main'>{stats.todayOnLeave}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* İzin Talepleri Tablosu */}
      <Card>
        <CardHeader title='İzin Talepleri' />
        <CardContent>
          {error && (
            <Alert severity='error' sx={{ mb: 4 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filtreleme */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id='worker-filter-label'>Çalışan Filtrele</InputLabel>
              <Select
                labelId='worker-filter-label'
                value={selectedWorker}
                label='Çalışan Filtrele'
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                <MenuItem value='all'>
                  <em>Tüm Çalışanlar</em>
                </MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id.toString()}>
                    {worker.firstName} {worker.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Çalışan</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>İzin Türü</TableCell>
                  <TableCell>Başlangıç</TableCell>
                  <TableCell>Bitiş</TableCell>
                  <TableCell>Gün</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaveRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center'>
                      <Typography color='text.secondary'>İzin talebi bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaveRequests.map((request) => (
                  <TableRow key={request.documentId}>
                    <TableCell>
                      <Typography variant='body2'>
                        {request.worker.firstName} {request.worker.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.worker.department?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {getLeaveTypeLabel(request.leaveType)}
                    </TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      {new Date(request.endDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Chip label={`${request.totalDays} gün`} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(request.status)} 
                        color={getStatusColor(request.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {request.status === 'pending' ? (
                          <>
                            <Button
                              size='small'
                              variant='contained'
                              color='success'
                              onClick={() => handleReviewClick(request, 'approve')}
                            >
                              Onayla
                            </Button>
                            <Button
                              size='small'
                              variant='outlined'
                              color='error'
                              onClick={() => handleReviewClick(request, 'reject')}
                            >
                              Reddet
                            </Button>
                          </>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            {request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString('tr-TR')}
                          </Typography>
                        )}
                        <Button
                          size='small'
                          variant='outlined'
                          color='error'
                          onClick={() => handleDeleteClick(request)}
                          startIcon={<i className='tabler-trash' />}
                        >
                          Sil
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'İzin Talebini Onayla' : 'İzin Talebini Reddet'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>{selectedRequest.worker.firstName} {selectedRequest.worker.lastName}</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {getLeaveTypeLabel(selectedRequest.leaveType)} - {selectedRequest.totalDays} gün
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Not (Opsiyonel)'
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>İptal</Button>
          <Button
            variant='contained'
            color={reviewAction === 'approve' ? 'success' : 'error'}
            onClick={handleReviewConfirm}
          >
            {reviewAction === 'approve' ? 'Onayla' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          İzin Talebini Sil
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Alert severity='warning' sx={{ mb: 2 }}>
                Bu işlem geri alınamaz!
              </Alert>
              <Box sx={{ mb: 1 }}>
                <Typography variant='body1' component='div'>
                  <strong>{selectedRequest.worker.firstName} {selectedRequest.worker.lastName}</strong> adlı çalışanın aşağıdaki izin talebini silmek istediğinizden emin misiniz?
                </Typography>
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  İzin Türü: <strong>{getLeaveTypeLabel(selectedRequest.leaveType)}</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Tarih: <strong>{new Date(selectedRequest.startDate).toLocaleDateString('tr-TR')} - {new Date(selectedRequest.endDate).toLocaleDateString('tr-TR')}</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Süre: <strong>{selectedRequest.totalDays} gün</strong>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Durum:
                  </Typography>
                  <Chip label={getStatusLabel(selectedRequest.status)} color={getStatusColor(selectedRequest.status) as any} size='small' />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            İptal
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDeleteConfirm}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <i className='tabler-trash' />}
          >
            {deleting ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LeaveTrackingPage

