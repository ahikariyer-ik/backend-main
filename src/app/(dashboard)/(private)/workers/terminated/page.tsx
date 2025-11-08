'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

// Services
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'

interface TerminatedWorker {
  id: number
  documentId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  photo?: {
    url: string
  }
  hireDate: string
  terminationDate: string
  terminationReason: string
  profession?: string
  branch?: string
  department?: {
    name: string
  }
}

const TerminatedWorkersPage = () => {
  // States
  const [workers, setWorkers] = useState<TerminatedWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<TerminatedWorker | null>(null)

  // Effects
  useEffect(() => {
    loadTerminatedWorkers()
  }, [])

  // Handlers
  const loadTerminatedWorkers = async () => {
    try {
      const companyProfile = authService.getCompanyProfile()
      if (!companyProfile) {
        setError('Şirket profili bulunamadı')
        setLoading(false)
        return
      }

      const response = await axiosClient.get('/api/workers', {
        params: {
          'filters[company][id]': companyProfile.id,
          'filters[isActive]': false,
          populate: ['photo', 'department'],
          'sort[0]': 'terminationDate:desc'
        }
      })

      setWorkers(response.data.data || [])
    } catch (error: any) {
      console.error('İşten ayrılanlar yüklenirken hata:', error)
      setError(error.message || 'İşten ayrılanlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (worker: TerminatedWorker) => {
    setSelectedWorker(worker)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedWorker) return

    try {
      await axiosClient.delete(`/api/workers/${selectedWorker.documentId}`)
      setWorkers(workers.filter(w => w.documentId !== selectedWorker.documentId))
      setDeleteDialogOpen(false)
      setSelectedWorker(null)
    } catch (error: any) {
      console.error('Çalışan silinirken hata:', error)
      setError(error.response?.data?.error?.message || 'Çalışan silinirken bir hata oluştu')
    }
  }

  const handleReactivateClick = (worker: TerminatedWorker) => {
    setSelectedWorker(worker)
    setReactivateDialogOpen(true)
  }

  const handleReactivateConfirm = async () => {
    if (!selectedWorker) return

    try {
      await axiosClient.put(`/api/workers/${selectedWorker.documentId}`, {
        data: {
          isActive: true,
          terminationDate: null,
          terminationReason: null
        }
      })

      // Listeden kaldır (artık aktif çalışanlar listesinde görünecek)
      setWorkers(workers.filter(w => w.documentId !== selectedWorker.documentId))
      setReactivateDialogOpen(false)
      setSelectedWorker(null)
    } catch (error: any) {
      console.error('Çalışan aktif edilirken hata:', error)
      setError(error.response?.data?.error?.message || 'Çalışan aktif edilirken bir hata oluştu')
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
    <Card>
      <CardHeader
        title='İşten Ayrılanlar'
        subheader='Pasif çalışanlar ve işten ayrılanlar listesi'
      />
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
                <TableCell>Fotoğraf</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Meslek</TableCell>
                <TableCell>Şube</TableCell>
                <TableCell>İşe Giriş Tarihi</TableCell>
                <TableCell>İşten Ayrılış Tarihi</TableCell>
                <TableCell>İşten Ayrılış Nedeni</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center'>
                    <Typography color='text.secondary'>Henüz işten ayrılan çalışan bulunmamaktadır</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workers.map(worker => (
                  <TableRow key={worker.documentId}>
                    <TableCell>
                      <Avatar
                        src={worker.photo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${worker.photo.url}` : undefined}
                        sx={{ width: 40, height: 40 }}
                      >
                        {worker.firstName.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2'>
                        {worker.firstName} {worker.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.phone || '-'}</TableCell>
                    <TableCell>{worker.profession || '-'}</TableCell>
                    <TableCell>{worker.branch || '-'}</TableCell>
                    <TableCell>
                      {worker.hireDate ? new Date(worker.hireDate).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell>
                      {worker.terminationDate ? (
                        <Chip
                          label={new Date(worker.terminationDate).toLocaleDateString('tr-TR')}
                          color='error'
                          size='small'
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={worker.terminationReason}
                      >
                        {worker.terminationReason || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleReactivateClick(worker)}
                        color='success'
                        size='small'
                        title='Tekrar Aktif Yap'
                      >
                        <i className='tabler-user-check text-textSecondary' />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(worker)}
                        color='error'
                        size='small'
                        title='Kalıcı Olarak Sil'
                      >
                        <i className='tabler-trash text-textSecondary' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Tekrar Aktif Yap Dialog */}
        <Dialog
          open={reactivateDialogOpen}
          onClose={() => setReactivateDialogOpen(false)}
        >
          <DialogTitle>Çalışanı Tekrar Aktif Yap</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>{selectedWorker?.firstName} {selectedWorker?.lastName}</strong> çalışanını tekrar aktif yapmak istediğinizden emin misiniz?
              <br />
              <br />
              Bu işlemden sonra çalışan "Çalışanlarım" listesinde görünecek ve işten ayrılış bilgileri silinecektir.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReactivateDialogOpen(false)} color='primary'>
              İptal
            </Button>
            <Button onClick={handleReactivateConfirm} color='success' variant='contained'>
              Aktif Yap
            </Button>
          </DialogActions>
        </Dialog>

        {/* Silme Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Çalışanı Kalıcı Olarak Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>{selectedWorker?.firstName} {selectedWorker?.lastName}</strong> çalışanını kalıcı olarak silmek istediğinizden emin misiniz?
              <br />
              <br />
              <strong>UYARI:</strong> Bu işlem geri alınamaz! Tüm çalışan verileri kalıcı olarak silinecektir.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color='primary'>
              İptal
            </Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
              Kalıcı Olarak Sil
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default TerminatedWorkersPage

