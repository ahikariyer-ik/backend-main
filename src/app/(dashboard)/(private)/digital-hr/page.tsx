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
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Services
import { workersService, type Worker, type DocumentFile } from '@/services/workers.service'
import { axiosClient } from '@/libs/axios'

// Belge türleri - Türkçe etiketler
const documentTypes = [
  { value: 'criminalRecordDoc', label: 'Adli Sicil' },
  { value: 'populationRegistryDoc', label: 'Nüfus Kaydı' },
  { value: 'identityDoc', label: 'Kimlik' },
  { value: 'residenceDoc', label: 'İkametgah' },
  { value: 'militaryDoc', label: 'Askerlik' }
]

const documentTypeLabels: Record<string, string> = {
  criminalRecordDoc: 'Adli Sicil',
  populationRegistryDoc: 'Nüfus Kaydı',
  identityDoc: 'Kimlik',
  residenceDoc: 'İkametgah',
  militaryDoc: 'Askerlik'
}

const DigitalHRPage = () => {
  // States
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [viewDocumentDialog, setViewDocumentDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ file: DocumentFile | null, label: string, docType: string, workerId: string } | null>(null)

  // Effects
  useEffect(() => {
    loadWorkers()
  }, [])

  // Handlers
  const loadWorkers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await workersService.getCompanyWorkers()
      
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      setWorkers(response.data)
    } catch (error: any) {
      console.error('Çalışanlar yüklenirken hata:', error)
      setError(error.message || 'Çalışanlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenUploadDialog = (worker: Worker) => {
    setSelectedWorker(worker)
    setSelectedDocType('')
    setSelectedFile(null)
    setUploadDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false)
    setSelectedWorker(null)
    setSelectedDocType('')
    setSelectedFile(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Sadece PDF kontrolü
      if (file.type !== 'application/pdf') {
        setError('Sadece PDF dosyaları yüklenebilir')
        setSelectedFile(null)
        return
      }
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır')
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUploadDocument = async () => {
    if (!selectedWorker || !selectedDocType || !selectedFile) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // 1. Dosyayı Strapi'ye yükle
      const formData = new FormData()
      formData.append('files', selectedFile)

      const uploadResponse = await axiosClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const uploadedFile = uploadResponse.data[0]

      // 2. Worker'ı güncelle
      const updateData: any = {}
      updateData[selectedDocType] = uploadedFile.id

      await axiosClient.put(`/api/workers/${selectedWorker.id}`, {
        data: updateData
      })

      setSuccess(`${documentTypes.find(d => d.value === selectedDocType)?.label} belgesi başarıyla yüklendi`)
      
      // Liste yenile
      await loadWorkers()
      
      // 2 saniye sonra dialog'u kapat
      setTimeout(() => {
        handleCloseUploadDialog()
        setSuccess(null)
      }, 2000)

    } catch (error: any) {
      console.error('Belge yüklenirken hata:', error)
      setError(error.response?.data?.error?.message || 'Belge yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleViewDocument = (doc: DocumentFile | null, docType: string, workerId: string) => {
    if (doc) {
      setSelectedDocument({
        file: doc,
        label: documentTypeLabels[docType] || docType,
        docType: docType,
        workerId: workerId
      })
      setViewDocumentDialog(true)
    }
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return

    try {
      setDeleting(true)
      setError(null)
      
      await workersService.deleteDocument(selectedDocument.workerId, selectedDocument.docType)
      
      setSuccess(`${selectedDocument.label} belgesi başarıyla silindi`)
      setViewDocumentDialog(false)
      
      // Liste yenile
      await loadWorkers()
      
      // Success mesajını 2 saniye sonra kaldır
      setTimeout(() => {
        setSuccess(null)
      }, 2000)

    } catch (error: any) {
      console.error('Belge silinirken hata:', error)
      setError(error.response?.data?.error?.message || 'Belge silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadDocument = () => {
    if (selectedDocument?.file) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`
      const link = document.createElement('a')
      link.href = url
      link.download = selectedDocument.file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleViewDocumentInNewTab = () => {
    if (selectedDocument?.file) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`
      window.open(url, '_blank')
    }
  }

  // Belge durumu ikonu
  const DocumentStatusIcon = ({ document, docType, workerId }: { document: DocumentFile | null, docType: string, workerId: string }) => {
    const uploaded = !!document
    
    return (
      <Tooltip title={uploaded ? 'Evrakı Görüntüle' : 'Yüklenmemiş'}>
        <span>
          <IconButton
            size='small'
            onClick={() => uploaded && handleViewDocument(document, docType, workerId)}
            disabled={!uploaded}
            sx={{
              bgcolor: uploaded ? 'success.main' : 'error.main',
              color: 'white',
              width: 24,
              height: 24,
              '&:hover': {
                bgcolor: uploaded ? 'success.dark' : 'error.main',
              },
              '&.Mui-disabled': {
                bgcolor: 'error.main',
                color: 'white',
                opacity: 0.6
              }
            }}
          >
            <i className={uploaded ? 'tabler-check' : 'tabler-x'} style={{ fontSize: 14 }} />
          </IconButton>
        </span>
      </Tooltip>
    )
  }

  // Tamamlanma yüzdesi hesapla
  const calculateCompletionPercentage = (documents: Worker['documents']) => {
    const totalDocs = 5
    const uploadedDocs = Object.values(documents).filter((doc) => doc !== null).length
    return Math.round((uploadedDocs / totalDocs) * 100)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Dijital İK - Çalışan Belgeleri'
        subheader='Çalışanlarınızın belgelerini görüntüleyin ve yükleyin'
      />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ mb: 4 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {workers.length === 0 ? (
          <Alert severity='info'>
            Henüz kayıtlı çalışan bulunmamaktadır. Çalışan eklemek için "Çalışanlar" menüsünü kullanın.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Çalışan</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell align='center'>Adli Sicil</TableCell>
                  <TableCell align='center'>Nüfus Kaydı</TableCell>
                  <TableCell align='center'>Kimlik</TableCell>
                  <TableCell align='center'>İkametgah</TableCell>
                  <TableCell align='center'>Askerlik</TableCell>
                  <TableCell align='center'>Tamamlanma</TableCell>
                  <TableCell align='center'>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map(worker => {
                  const completionPercentage = calculateCompletionPercentage(worker.documents)

                  return (
                    <TableRow key={worker.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={worker.photo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${worker.photo.url}` : undefined}
                            alt={`${worker.firstName} ${worker.lastName}`}
                            sx={{ width: 40, height: 40 }}
                          >
                            {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant='subtitle2'>
                              {worker.firstName} {worker.lastName}
                            </Typography>
                            {worker.profession && (
                              <Typography variant='caption' color='textSecondary'>
                                {worker.profession}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{worker.email}</Typography>
                        {worker.phone && (
                          <Typography variant='caption' color='textSecondary'>
                            {worker.phone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {worker.department ? (
                          <Chip label={worker.department.name} size='small' variant='outlined' />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon document={worker.documents.criminalRecordDoc} docType='criminalRecordDoc' workerId={worker.id} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon document={worker.documents.populationRegistryDoc} docType='populationRegistryDoc' workerId={worker.id} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon document={worker.documents.identityDoc} docType='identityDoc' workerId={worker.id} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon document={worker.documents.residenceDoc} docType='residenceDoc' workerId={worker.id} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon document={worker.documents.militaryDoc} docType='militaryDoc' workerId={worker.id} />
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={`${completionPercentage}%`}
                          color={completionPercentage === 100 ? 'success' : completionPercentage >= 50 ? 'warning' : 'error'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Tooltip title='Evrak Yükle'>
                          <IconButton
                            color='primary'
                            size='small'
                            onClick={() => handleOpenUploadDialog(worker)}
                          >
                            <i className='tabler-upload' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Evrak Yükleme Dialog */}
        <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth='sm' fullWidth>
          <DialogTitle>
            Evrak Yükle
          </DialogTitle>
          <DialogContent>
            {selectedWorker && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Çalışan Bilgisi */}
                <Alert severity='info'>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    Çalışan: {selectedWorker.firstName} {selectedWorker.lastName}
                  </Typography>
                  {selectedWorker.profession && (
                    <Typography variant='caption' color='textSecondary'>
                      {selectedWorker.profession}
                    </Typography>
                  )}
                </Alert>

                {/* Evrak Tipi Seçimi */}
                <FormControl fullWidth required>
                  <InputLabel>Yüklenecek Evrak</InputLabel>
                  <Select
                    value={selectedDocType}
                    label='Yüklenecek Evrak'
                    onChange={(e) => setSelectedDocType(e.target.value)}
                  >
                    {documentTypes.map((docType) => {
                      const doc = selectedWorker.documents[docType.value as keyof typeof selectedWorker.documents]
                      const isUploaded = doc !== null
                      
                      return (
                        <MenuItem key={docType.value} value={docType.value}>
                          {docType.label}
                          {isUploaded && (
                            <Chip
                              label='Yüklendi'
                              size='small'
                              color='success'
                              sx={{ ml: 1 }}
                            />
                          )}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>

                {/* Dosya Seçimi */}
                <Box>
                  <Button
                    variant='outlined'
                    component='label'
                    fullWidth
                    startIcon={<i className='tabler-file-upload' />}
                    sx={{ py: 2 }}
                  >
                    {selectedFile ? selectedFile.name : 'PDF Dosyası Seç'}
                    <input
                      type='file'
                      hidden
                      accept='application/pdf'
                      onChange={handleFileSelect}
                    />
                  </Button>
                  <Typography variant='caption' color='textSecondary' sx={{ mt: 1, display: 'block' }}>
                    Sadece PDF formatında dosya yükleyebilirsiniz (Maksimum 10MB)
                  </Typography>
                </Box>

                {/* Hata/Başarı Mesajı */}
                {error && (
                  <Alert severity='error'>{error}</Alert>
                )}

                {success && (
                  <Alert severity='success'>{success}</Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog} disabled={uploading}>
              İptal
            </Button>
            <Button
              onClick={handleUploadDocument}
              variant='contained'
              disabled={!selectedDocType || !selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <i className='tabler-upload' />}
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Evrak Görüntüleme Dialog */}
        <Dialog 
          open={viewDocumentDialog} 
          onClose={() => setViewDocumentDialog(false)} 
          maxWidth='md' 
          fullWidth
        >
          <DialogTitle>
            {selectedDocument?.label}
          </DialogTitle>
          <DialogContent>
            {selectedDocument?.file && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
                {/* Dosya Bilgileri */}
                <Alert severity='info'>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                    📄 {selectedDocument.file.name}
                  </Typography>
                  <Typography variant='caption' color='textSecondary'>
                    Boyut: {(selectedDocument.file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Alert>

                {/* PDF İkonu ve Bilgi */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    py: 6,
                    bgcolor: 'action.hover',
                    borderRadius: 2
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'error.main',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  >
                    <i className='tabler-file-type-pdf' style={{ fontSize: 80, color: 'white' }} />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
                      {selectedDocument.label}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      PDF belgesini görüntülemek için aşağıdaki butonları kullanın
                    </Typography>
                  </Box>
                </Box>

                {/* Butonlar */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    startIcon={<i className='tabler-eye' />}
                    onClick={handleViewDocumentInNewTab}
                    sx={{ minWidth: 200 }}
                  >
                    Görüntüle
                  </Button>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='large'
                    startIcon={<i className='tabler-download' />}
                    onClick={handleDownloadDocument}
                    sx={{ minWidth: 200 }}
                  >
                    İndir
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='large'
                    startIcon={deleting ? <CircularProgress size={20} /> : <i className='tabler-trash' />}
                    onClick={handleDeleteDocument}
                    disabled={deleting}
                    sx={{ minWidth: 200 }}
                  >
                    {deleting ? 'Siliniyor...' : 'Sil'}
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDocumentDialog(false)} disabled={deleting}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default DigitalHRPage
