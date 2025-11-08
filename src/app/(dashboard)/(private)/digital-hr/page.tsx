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
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// Services
import { workersService, type Worker } from '@/services/workers.service'

// Belge türleri - Türkçe etiketler
const documentLabels = {
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
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string>('')
  const [whatsappLink, setWhatsAppLink] = useState<string>('')
  const [generatingToken, setGeneratingToken] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

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

  const handleGenerateLink = async (worker: Worker) => {
    try {
      setGeneratingToken(true)
      setSelectedWorker(worker)
      setError(null)
      
      const response = await workersService.generateUploadToken(worker.id)
      
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      setGeneratedLink(response.data.uploadUrl)
      
      // WhatsApp linki oluştur
      if (worker.phone) {
        const waLink = workersService.generateWhatsAppLink(
          worker.phone,
          response.data.uploadUrl,
          `${worker.firstName} ${worker.lastName}`
        )
        setWhatsAppLink(waLink)
      }
      
      setLinkDialogOpen(true)
      setCopiedLink(false)
      
      // Listeyi yenile
      loadWorkers()
    } catch (error: any) {
      console.error('Link oluşturulurken hata:', error)
      setError(error.message || 'Link oluşturulurken bir hata oluştu')
    } finally {
      setGeneratingToken(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSendWhatsApp = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank')
    }
  }

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false)
    setGeneratedLink('')
    setWhatsAppLink('')
    setSelectedWorker(null)
  }

  // Belge durumu ikonu
  const DocumentStatusIcon = ({ uploaded }: { uploaded: boolean }) => {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: uploaded ? 'success.main' : 'error.main'
        }}
      >
        <i className={uploaded ? 'tabler-check' : 'tabler-x'} style={{ fontSize: 16, color: 'white' }} />
      </Box>
    )
  }

  // Tamamlanma yüzdesi hesapla
  const calculateCompletionPercentage = (documents: Worker['documents']) => {
    const totalDocs = 5
    const uploadedDocs = Object.values(documents).filter(Boolean).length
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
        subheader='Çalışanlarınızın belge durumlarını görüntüleyin ve belge yükleme linki gönderin'
      />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
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
                  const hasToken = !!worker.uploadToken
                  const tokenExpired = worker.tokenExpiresAt 
                    ? new Date(worker.tokenExpiresAt) < new Date()
                    : false

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
                        <DocumentStatusIcon uploaded={worker.documents.criminalRecordDoc} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon uploaded={worker.documents.populationRegistryDoc} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon uploaded={worker.documents.identityDoc} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon uploaded={worker.documents.residenceDoc} />
                      </TableCell>
                      <TableCell align='center'>
                        <DocumentStatusIcon uploaded={worker.documents.militaryDoc} />
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={`${completionPercentage}%`}
                          color={completionPercentage === 100 ? 'success' : completionPercentage >= 50 ? 'warning' : 'error'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Tooltip 
                          title={
                            hasToken && !tokenExpired 
                              ? 'Yeni link oluştur (mevcut link geçersiz olacak)' 
                              : 'WhatsApp ile belge yükleme linki gönder'
                          }
                        >
                          <IconButton
                            color='primary'
                            size='small'
                            onClick={() => handleGenerateLink(worker)}
                            disabled={generatingToken}
                          >
                            {generatingToken && selectedWorker?.id === worker.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <i className='tabler-brand-whatsapp' />
                            )}
                          </IconButton>
                        </Tooltip>
                        {hasToken && !tokenExpired && (
                          <Tooltip title='Aktif link mevcut'>
                            <IconButton size='small' color='success'>
                              <i className='tabler-link' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Link Oluşturma Dialog */}
        <Dialog open={linkDialogOpen} onClose={handleCloseLinkDialog} maxWidth='sm' fullWidth>
          <DialogTitle>
            Belge Yükleme Linki Oluşturuldu
          </DialogTitle>
          <DialogContent>
            {selectedWorker && (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  <strong>{selectedWorker.firstName} {selectedWorker.lastName}</strong> için belge yükleme linki oluşturuldu.
                  Bu linki WhatsApp üzerinden gönderebilir veya kopyalayabilirsiniz.
                </DialogContentText>

                <Alert severity='info' sx={{ mb: 2 }}>
                  Link 30 gün süreyle geçerli olacaktır.
                </Alert>

                <TextField
                  fullWidth
                  label='Belge Yükleme Linki'
                  value={generatedLink}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                  multiline
                  rows={2}
                />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant='outlined'
                    onClick={handleCopyLink}
                    startIcon={copiedLink ? <i className='tabler-check' /> : <i className='tabler-copy' />}
                  >
                    {copiedLink ? 'Kopyalandı!' : 'Linki Kopyala'}
                  </Button>

                  {selectedWorker.phone && (
                    <Button
                      variant='contained'
                      color='success'
                      onClick={handleSendWhatsApp}
                      startIcon={<i className='tabler-brand-whatsapp' />}
                    >
                      WhatsApp ile Gönder
                    </Button>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLinkDialog}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default DigitalHRPage

