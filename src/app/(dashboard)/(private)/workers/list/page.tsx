'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
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
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'

// Component Imports
import Link from '@components/Link'

// Services
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'
import { branchService, type Branch } from '@/services/branch.service'

interface Worker {
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
  profession?: string
  branch?: {
    documentId: string
    name: string
    key?: string
  }
  isActive: boolean
  isRetired: boolean
  isDisabled: boolean
  salary?: number
  department?: {
    name: string
  }
}

const WorkersListPage = () => {
  // States
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [terminationReason, setTerminationReason] = useState('')
  const [deactivationReason, setDeactivationReason] = useState('')
  const [severancePay, setSeverancePay] = useState(0)
  const [noticePay, setNoticePay] = useState(0)
  const [severancePaid, setSeverancePaid] = useState(false)
  const [noticePaid, setNoticePaid] = useState(false)
  
  // Filter States
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [nameSearch, setNameSearch] = useState<string>('')

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadWorkers()
    loadBranches()
  }, [])

  // Handlers
  const loadBranches = async () => {
    try {
      const companyProfile = authService.getCompanyProfile()
      if (!companyProfile) return

      const response = await axiosClient.get('/api/branches', {
        params: {
          'filters[company][id]': companyProfile.id,
          'sort[0]': 'name:asc'
        }
      })

      setBranches(response.data.data || [])
    } catch (error: any) {
      console.error('Şubeler yüklenirken hata:', error)
    }
  }

  const loadWorkers = async () => {
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
          'filters[isActive]': true, // Sadece aktif çalışanları göster
          populate: ['photo', 'department', 'branch', 'user'],
          'sort[0]': 'createdAt:desc'
        }
      })

      setWorkers(response.data.data || [])
    } catch (error: any) {
      console.error('Çalışanlar yüklenirken hata:', error)
      setError(error.message || 'Çalışanlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (worker: Worker) => {
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

  const calculateSeverance = (worker: Worker) => {
    if (!worker.salary || !worker.hireDate) {
      return { severance: 0, notice: 0 }
    }

    const netSalary = worker.salary
    const grossSalary = netSalary * 1.175

    // Çalışma süresi hesaplama
    const hireDate = new Date(worker.hireDate)
    const today = new Date()
    const yearsOfService = (today.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    const fullYears = Math.floor(yearsOfService)

    // Kıdem tazminatı hesaplama
    const grossSeverance = grossSalary * fullYears
    const netSeverance = grossSeverance * 0.99241 // %0.759 damga vergisi

    // İhbar tazminatı hesaplama (8 hafta varsayıyoruz, gerçekte kıdeme göre değişir)
    let noticeWeeks = 2
    if (yearsOfService >= 0.5 && yearsOfService < 1.5) noticeWeeks = 2
    else if (yearsOfService >= 1.5 && yearsOfService < 3) noticeWeeks = 4
    else if (yearsOfService >= 3) noticeWeeks = 8

    const noticeDays = noticeWeeks * 7
    const grossNoticePay = (grossSalary / 30) * noticeDays
    const netNoticePay = grossNoticePay * 0.99241 // %0.759 damga vergisi

    return {
      severance: Math.round(netSeverance),
      notice: Math.round(netNoticePay)
    }
  }

  const handleTerminateClick = (worker: Worker) => {
    setSelectedWorker(worker)
    setTerminationReason('')
    
    // Tazminat hesapla
    const { severance, notice } = calculateSeverance(worker)
    setSeverancePay(severance)
    setNoticePay(notice)
    setSeverancePaid(false)
    setNoticePaid(false)
    
    setTerminateDialogOpen(true)
  }

  const handleTerminateConfirm = async () => {
    if (!selectedWorker) return

    try {
      await axiosClient.put(`/api/workers/${selectedWorker.documentId}`, {
        data: {
          isActive: false,
          terminationDate: new Date().toISOString(),
          terminationReason: terminationReason,
          severancePay: severancePay,
          noticePay: noticePay,
          severancePaid: severancePaid,
          noticePaid: noticePaid
        }
      })

      await loadWorkers()
      setTerminateDialogOpen(false)
      setSelectedWorker(null)
      setTerminationReason('')
      setSeverancePay(0)
      setNoticePay(0)
      setSeverancePaid(false)
      setNoticePaid(false)
    } catch (error: any) {
      console.error('Çalışan işten ayrıldı olarak işaretlenirken hata:', error)
      setError(error.response?.data?.error?.message || 'İşlem sırasında bir hata oluştu')
    }
  }

  const handleActiveToggle = (worker: Worker) => {
    if (worker.isActive) {
      // Pasife almak için işten ayrılış nedeni sor
      setSelectedWorker(worker)
      setDeactivationReason('')
      setDeactivateDialogOpen(true)
    } else {
      // Aktife almak için direkt işlem yap
      handleActivateWorker(worker)
    }
  }

  const handleActivateWorker = async (worker: Worker) => {
    try {
      await axiosClient.put(`/api/workers/${worker.documentId}`, {
        data: {
          isActive: true,
          terminationDate: null,
          terminationReason: null
        }
      })

      await loadWorkers()
    } catch (error: any) {
      console.error('Çalışan aktif edilirken hata:', error)
      setError(error.message || 'Çalışan aktif edilirken bir hata oluştu')
    }
  }

  const handleDeactivateConfirm = async () => {
    if (!selectedWorker || !deactivationReason.trim()) return

    try {
      await axiosClient.put(`/api/workers/${selectedWorker.documentId}`, {
        data: {
          isActive: false,
          terminationDate: new Date().toISOString(),
          terminationReason: deactivationReason
        }
      })

      await loadWorkers()
      setDeactivateDialogOpen(false)
      setSelectedWorker(null)
      setDeactivationReason('')
    } catch (error: any) {
      console.error('Çalışan pasife alınırken hata:', error)
      setError(error.response?.data?.error?.message || 'İşlem sırasında bir hata oluştu')
    }
  }

  // Filter workers based on search and branch selection
  const filteredWorkers = workers.filter(worker => {
    // Branch filter
    const branchMatch = selectedBranch === 'all' || worker.branch?.documentId === selectedBranch
    
    // Name search filter
    const nameMatch = nameSearch.trim() === '' || 
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(nameSearch.toLowerCase())
    
    return branchMatch && nameMatch
  })

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <Card>
      <CardHeader
        title='Çalışanlar'
        action={
          <Button component={Link} href='/workers/create' variant='contained' startIcon={<i className='tabler:plus' />}>
            Yeni Çalışan Ekle
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label='İsim Ara'
              placeholder='Çalışan adı veya soyadı...'
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              InputProps={{
                startAdornment: <i className='tabler-search' style={{ marginRight: 8 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id='branch-filter-label'>Şube Filtrele</InputLabel>
              <Select
                labelId='branch-filter-label'
                value={selectedBranch}
                label='Şube Filtrele'
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <MenuItem value='all'>
                  <em>Tüm Şubeler</em>
                </MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.documentId} value={branch.documentId}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip 
                label={`${filteredWorkers.length} çalışan gösteriliyor`}
                color='primary'
                variant='outlined'
              />
            </Box>
          </Grid>
        </Grid>

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
                <TableCell>Maaş</TableCell>
                <TableCell>İşe Giriş</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center'>
                    <Typography color='text.secondary'>
                      {workers.length === 0 ? 'Henüz çalışan eklenmemiş' : 'Filtreye uygun çalışan bulunamadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkers.map(worker => (
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
                    <TableCell>{worker.branch?.name || '-'}</TableCell>
                    <TableCell>
                      {worker.salary ? (
                        <Typography variant='body2' fontWeight={600} color='success.main'>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(worker.salary)}
                        </Typography>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {worker.hireDate ? new Date(worker.hireDate).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={worker.isActive}
                            onChange={() => handleActiveToggle(worker)}
                            size='small'
                          />
                        }
                        label={
                          <Chip
                            label={worker.isActive ? 'Aktif' : 'Pasif'}
                            color={worker.isActive ? 'success' : 'error'}
                            size='small'
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        href={`/workers/update/${worker.documentId}`}
                        color='primary'
                        size='small'
                      >
                        <i className='tabler-edit text-textSecondary' />
                      </IconButton>
                      {worker.isActive && (
                        <IconButton
                          onClick={() => handleTerminateClick(worker)}
                          color='warning'
                          size='small'
                          title='İşten Ayrıldı'
                        >
                          <i className='tabler-user-off text-textSecondary' />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => handleDeleteClick(worker)}
                        color='error'
                        size='small'
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

        {/* Silme Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Çalışanı Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>{selectedWorker?.firstName} {selectedWorker?.lastName}</strong> çalışanını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color='primary'>
              İptal
            </Button>
            <Button onClick={handleDeleteConfirm} color='error'>
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* İşten Ayrıldı Dialog */}
        <Dialog
          open={terminateDialogOpen}
          onClose={() => setTerminateDialogOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>İşten Ayrılış Onayı</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              <strong>{selectedWorker?.firstName} {selectedWorker?.lastName}</strong> çalışanını işten ayrıldı olarak işaretlemek istediğinizden emin misiniz?
            </DialogContentText>

            {/* Tazminat Hesaplamaları */}
            <Alert severity='info' sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                Hesaplanan Tazminatlar:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Kıdem Tazminatı: ${severancePay.toLocaleString('tr-TR')} ₺`}
                  color='primary'
                  variant='outlined'
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`İhbar Tazminatı: ${noticePay.toLocaleString('tr-TR')} ₺`}
                  color='secondary'
                  variant='outlined'
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`Toplam: ${(severancePay + noticePay).toLocaleString('tr-TR')} ₺`}
                  color='success'
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Alert>

            <Divider sx={{ my: 2 }} />

            {/* Tazminat Ödeme Durumu */}
            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
              Ödeme Durumu:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={severancePaid}
                    onChange={(e) => setSeverancePaid(e.target.checked)}
                    color='primary'
                  />
                }
                label='Kıdem tazminatı ödendi'
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={noticePaid}
                    onChange={(e) => setNoticePaid(e.target.checked)}
                    color='primary'
                  />
                }
                label='İhbar tazminatı ödendi'
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* İşten Ayrılış Nedeni */}
            <TextField
              fullWidth
              label='İşten Ayrılış Nedeni *'
              multiline
              rows={4}
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value)}
              required
              helperText='İşten ayrılış nedenini belirtiniz'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setTerminateDialogOpen(false)
              setTerminationReason('')
              setSeverancePay(0)
              setNoticePay(0)
              setSeverancePaid(false)
              setNoticePaid(false)
            }} color='secondary'>
              İptal
            </Button>
            <Button
              onClick={handleTerminateConfirm}
              variant='contained'
              color='warning'
              disabled={!terminationReason.trim()}
            >
              İşten Ayrılışı Onayla
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pasife Alma Dialog */}
        <Dialog
          open={deactivateDialogOpen}
          onClose={() => {
            setDeactivateDialogOpen(false)
            setDeactivationReason('')
          }}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Çalışanı Pasife Al</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              <strong>{selectedWorker?.firstName} {selectedWorker?.lastName}</strong> çalışanını pasife almak istediğinizden emin misiniz?
              <br />
              <br />
              Pasife alınan çalışanlar "İşten Ayrılanlar" sekmesinde görünecektir.
            </DialogContentText>
            <TextField
              fullWidth
              label='İşten Ayrılış Nedeni'
              multiline
              rows={4}
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              required
              sx={{ mt: 2 }}
              helperText='Pasife alma nedenini belirtin'
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeactivateDialogOpen(false)
                setDeactivationReason('')
              }}
              color='primary'
            >
              İptal
            </Button>
            <Button
              onClick={handleDeactivateConfirm}
              color='warning'
              disabled={!deactivationReason.trim()}
              variant='contained'
            >
              Pasife Al
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default WorkersListPage

