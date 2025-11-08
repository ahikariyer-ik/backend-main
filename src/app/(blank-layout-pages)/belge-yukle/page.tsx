'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

// Services
import { workersService, type Worker, type WorkerDocuments } from '@/services/workers.service'

// Belge türleri - Türkçe etiketler ve açıklamalar
const documentInfo: Record<keyof WorkerDocuments, { label: string; description: string }> = {
  criminalRecordDoc: {
    label: 'Adli Sicil Kaydı',
    description: 'Adli sicil belgenizi PDF formatında yükleyin'
  },
  populationRegistryDoc: {
    label: 'Nüfus Kayıt Örneği',
    description: 'Nüfus kayıt örneği belgenizi PDF formatında yükleyin'
  },
  identityDoc: {
    label: 'Kimlik Belgesi',
    description: 'Kimlik belgenizi PDF formatında yükleyin'
  },
  residenceDoc: {
    label: 'İkametgah Belgesi',
    description: 'İkametgah belgenizi PDF formatında yükleyin'
  },
  militaryDoc: {
    label: 'Askerlik Durum Belgesi',
    description: 'Askerlik durum belgenizi PDF formatında yükleyin'
  }
}

const BelgeYuklePage = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // States
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Effects
  useEffect(() => {
    if (token) {
      loadWorkerData()
    } else {
      setError('Geçersiz erişim linki. Lütfen şirketinizden yeni bir link isteyin.')
      setLoading(false)
    }
  }, [token])

  // Handlers
  const loadWorkerData = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      const response = await workersService.getWorkerByToken(token)

      if (response.error) {
        throw new Error(response.error.message)
      }

      setWorker(response.data)
    } catch (error: any) {
      console.error('Çalışan bilgisi yüklenirken hata:', error)
      setError(error.message || 'Bilgileriniz yüklenirken bir hata oluştu. Lütfen linki kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (documentType: keyof WorkerDocuments, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    // PDF kontrolü
    if (file.type !== 'application/pdf') {
      setError('Lütfen sadece PDF formatında dosya yükleyin.')
      return
    }

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.')
      return
    }

    try {
      setUploadingDoc(documentType)
      setError(null)
      setUploadSuccess(null)

      const response = await workersService.uploadDocument(token, documentType, file)

      if (response.error) {
        throw new Error(response.error.message)
      }

      // Başarılı yükleme
      setUploadSuccess(documentInfo[documentType].label)
      
      // Worker verilerini güncelle
      if (worker) {
        setWorker({
          ...worker,
          documents: response.data.documents
        })
      }

      // Input'u temizle
      event.target.value = ''
    } catch (error: any) {
      console.error('Belge yüklenirken hata:', error)
      setError(error.message || 'Belge yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setUploadingDoc(null)
    }
  }

  // Tamamlanma yüzdesi hesapla
  const calculateCompletionPercentage = () => {
    if (!worker) return 0
    const totalDocs = 5
    const uploadedDocs = Object.values(worker.documents).filter(Boolean).length
    return Math.round((uploadedDocs / totalDocs) * 100)
  }

  const completionPercentage = calculateCompletionPercentage()
  const allDocsUploaded = completionPercentage === 100

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    )
  }

  if (error && !worker) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}>
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'error.main'
                }}
              >
                <i className='tabler-alert-circle' style={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant='h5' align='center'>
                Erişim Hatası
              </Typography>
              <Alert severity='error' sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                src={worker?.photo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${worker.photo.url}` : undefined}
                sx={{ width: 56, height: 56 }}
              >
                {worker?.firstName.charAt(0)}{worker?.lastName.charAt(0)}
              </Avatar>
            }
            title={
              <Typography variant='h5'>
                Hoş Geldiniz, {worker?.firstName} {worker?.lastName}
              </Typography>
            }
            subheader='Lütfen aşağıdaki belgelerinizi yükleyin'
          />
          
          <CardContent>
            {/* Tamamlanma Durumu */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: allDocsUploaded ? 'success.lighter' : 'grey.100' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Belge Tamamlanma Durumu
                </Typography>
                <Typography variant='h6' color={allDocsUploaded ? 'success.main' : 'text.secondary'}>
                  {completionPercentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant='determinate' 
                value={completionPercentage} 
                sx={{ height: 8, borderRadius: 4 }}
                color={allDocsUploaded ? 'success' : 'primary'}
              />
            </Paper>

            {/* Başarı Mesajı */}
            {uploadSuccess && (
              <Alert severity='success' sx={{ mb: 3 }} onClose={() => setUploadSuccess(null)}>
                <strong>{uploadSuccess}</strong> başarıyla yüklendi!
              </Alert>
            )}

            {/* Hata Mesajı */}
            {error && (
              <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Tüm Belgeler Yüklendi */}
            {allDocsUploaded && (
              <Alert severity='success' sx={{ mb: 3 }}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Tebrikler! Tüm Belgelerinizi Tamamladınız! 🎉
                </Typography>
                <Typography variant='body2'>
                  Belgeleriniz başarıyla yüklendi. İşvereniniz tarafından kontrol edilecektir.
                </Typography>
              </Alert>
            )}

            {/* Bilgilendirme */}
            <Alert severity='info' sx={{ mb: 3 }}>
              <Typography variant='body2'>
                <strong>Önemli:</strong> Sadece <strong>PDF formatında</strong> belgeler yükleyebilirsiniz. 
                Her belge maksimum 10MB olabilir.
              </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            {/* Belge Listesi */}
            <List>
              {(Object.keys(documentInfo) as Array<keyof WorkerDocuments>).map((docType, index) => {
                const isUploaded = worker?.documents[docType]
                const isUploading = uploadingDoc === docType

                return (
                  <ListItem
                    key={docType}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: isUploaded ? 'success.lighter' : 'background.paper'
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isUploaded ? 'success.main' : 'grey.300'
                        }}
                      >
                        <i 
                          className={isUploaded ? 'tabler-check' : 'tabler-upload'} 
                          style={{ fontSize: 24, color: 'white' }} 
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant='subtitle1' fontWeight='bold'>
                          {index + 1}. {documentInfo[docType].label}
                        </Typography>
                      }
                      secondary={documentInfo[docType].description}
                    />
                    <Box>
                      {isUploading ? (
                        <CircularProgress size={24} />
                      ) : isUploaded ? (
                        <Button
                          variant='outlined'
                          color='success'
                          component='label'
                          size='small'
                        >
                          Yeniden Yükle
                          <input
                            type='file'
                            hidden
                            accept='application/pdf'
                            onChange={(e) => handleFileSelect(docType, e)}
                          />
                        </Button>
                      ) : (
                        <Button
                          variant='contained'
                          component='label'
                          size='small'
                        >
                          Belge Seç
                          <input
                            type='file'
                            hidden
                            accept='application/pdf'
                            onChange={(e) => handleFileSelect(docType, e)}
                          />
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                )
              })}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Footer Bilgi */}
            <Alert severity='warning'>
              <Typography variant='body2'>
                Bu link 30 gün süreyle geçerlidir. Sorununuz varsa lütfen işvereninizle iletişime geçin.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default BelgeYuklePage

