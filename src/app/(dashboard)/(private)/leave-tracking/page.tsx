'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardHeader, CardContent, Grid, Box, Typography, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, LinearProgress } from '@mui/material'

// Services
import { leaveRequestService, LeaveRequest } from '@/services/leave-request.service'

const LeaveTrackingPage = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')

  useEffect(() => {
    loadLeaveRequests()
  }, [])

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

  // İstatistikler
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    todayOnLeave: leaveRequests.filter(r => {
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
                {leaveRequests.map((request) => (
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
                      {request.status === 'pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
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
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          {request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
    </Box>
  )
}

export default LeaveTrackingPage

