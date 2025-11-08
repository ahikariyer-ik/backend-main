'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box
} from '@mui/material'

// Axios Import
import { axiosClient } from '@/libs/axios'

interface DemoRequest {
  id: number
  documentId: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  message?: string
  status: 'pending' | 'contacted' | 'converted' | 'rejected'
  notes?: string
  source: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

const DemoRequestsPage = () => {
  // States
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    status: 'pending',
    notes: ''
  })

  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0
  })

  // Fetch demo requests
  const fetchDemoRequests = async (page: number, pageSize: number) => {
    try {
      const response = await axiosClient.get('/api/demo-requests', {
        params: {
          'sort[0]': 'createdAt:desc',
          'pagination[page]': page + 1,
          'pagination[pageSize]': pageSize
        }
      })

      setDemoRequests(response.data.data)
      setPagination({
        ...response.data.meta.pagination,
        page: response.data.meta.pagination.page - 1
      })
    } catch (error) {
      console.error('Demo talepleri yüklenirken hata oluştu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemoRequests(pagination.page, pagination.pageSize)
  }, [])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchDemoRequests(newPage, pagination.pageSize)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10)
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 0
    }))
    fetchDemoRequests(0, newPageSize)
  }

  const handleOpenDialog = (request: DemoRequest) => {
    setSelectedRequest(request)
    setEditData({
      status: request.status,
      notes: request.notes || ''
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedRequest(null)
  }

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return

    try {
      await axiosClient.put(`/api/demo-requests/${selectedRequest.documentId}`, {
        data: {
          status: editData.status,
          notes: editData.notes
        }
      })

      // Refresh the list
      fetchDemoRequests(pagination.page, pagination.pageSize)
      handleCloseDialog()
    } catch (error) {
      console.error('Demo talebi güncellenirken hata oluştu:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'contacted':
        return 'info'
      case 'converted':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'contacted':
        return 'İletişime Geçildi'
      case 'converted':
        return 'Dönüştürüldü'
      case 'rejected':
        return 'Reddedildi'
      default:
        return status
    }
  }

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
    <>
      <Card>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h5' color='text.primary'>
                  Demo Taleplerim
                </Typography>
                <Chip
                  label={`Toplam: ${pagination.total}`}
                  color='primary'
                  variant='outlined'
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Şirket</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Talep Tarihi</TableCell>
                      <TableCell align='center'>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {demoRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align='center'>
                          <Typography variant='body2' color='text.secondary'>
                            Henüz demo talebi bulunmamaktadır.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      demoRequests.map(request => (
                        <TableRow key={request.id} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={500}>
                              {request.fullName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {request.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>
                              {request.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {request.companyName || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(request.status)}
                              color={getStatusColor(request.status)}
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {new Date(request.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleOpenDialog(request)}
                              title='Detayları Görüntüle'
                            >
                              <i className='tabler-eye' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component='div'
                  count={pagination.total}
                  rowsPerPage={pagination.pageSize}
                  page={pagination.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage='Sayfa başına satır:'
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                />
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6'>Demo Talebi Detayları</Typography>
            <IconButton size='small' onClick={handleCloseDialog}>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Ad Soyad
                </Typography>
                <Typography variant='body1' fontWeight={500}>
                  {selectedRequest.fullName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Email
                </Typography>
                <Typography variant='body1'>{selectedRequest.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Telefon
                </Typography>
                <Typography variant='body1'>{selectedRequest.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Şirket
                </Typography>
                <Typography variant='body1'>{selectedRequest.companyName || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='caption' color='text.secondary'>
                  Mesaj
                </Typography>
                <Typography variant='body1'>{selectedRequest.message || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Kaynak
                </Typography>
                <Typography variant='body1'>{selectedRequest.source}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' color='text.secondary'>
                  Talep Tarihi
                </Typography>
                <Typography variant='body1'>
                  {new Date(selectedRequest.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label='Durum'
                  value={editData.status}
                  onChange={e => setEditData({ ...editData, status: e.target.value })}
                >
                  <MenuItem value='pending'>Beklemede</MenuItem>
                  <MenuItem value='contacted'>İletişime Geçildi</MenuItem>
                  <MenuItem value='converted'>Dönüştürüldü</MenuItem>
                  <MenuItem value='rejected'>Reddedildi</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Admin Notları'
                  value={editData.notes}
                  onChange={e => setEditData({ ...editData, notes: e.target.value })}
                  placeholder='Talep hakkında notlar ekleyin...'
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            İptal
          </Button>
          <Button onClick={handleUpdateRequest} variant='contained' color='primary'>
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DemoRequestsPage

