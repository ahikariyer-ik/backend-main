'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'

// Components
import QRScanner from '@/components/pdks/QRScanner'

// Services
import { pdksAttendanceService } from '@/services/pdks-attendance.service'
import { qrCodeSessionService } from '@/services/qr-code-session.service'

interface AttendanceRecord {
  checkType: 'in' | 'out'
  checkTime: string
  qrCodeSession?: {
    sessionName: string
  }
  branch?: {
    name: string
  }
  isManual: boolean
}

export default function PDKSScanPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [checkType, setCheckType] = useState<'in' | 'out' | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [lastCheckType, setLastCheckType] = useState<'in' | 'out' | null>(null)
  const [requestingPermissions, setRequestingPermissions] = useState(false)

  // Son kayıtları yükle
  useEffect(() => {
    loadRecentRecords()
  }, [])

  const loadRecentRecords = async () => {
    try {
      const response = await pdksAttendanceService.getMyRecords({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Son 7 gün
        endDate: new Date().toISOString()
      })

      if (!response.error && response.data) {
        setRecentRecords(response.data.slice(0, 10))
        
        // Son kayıt tipini belirle
        if (response.data.length > 0) {
          setLastCheckType(response.data[0].checkType)
        }
      }
    } catch (error) {
      console.error('Son kayıtlar yüklenirken hata:', error)
    }
  }

  // QR Okut butonuna basıldığında
  const handleQRButtonClick = () => {
    setShowDialog(true)
    setMessage(null)
  }

  // Giriş veya Çıkış seçildiğinde
  const handleCheckTypeSelect = async (type: 'in' | 'out') => {
    setCheckType(type)
    setShowDialog(false)
    setRequestingPermissions(true)
    
    try {
      // Önce konum izni iste
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
            setMessage({
              type: 'success',
              text: 'Konum izni alındı. Kamera açılıyor...'
            })
          },
          error => {
            console.error('Konum alınamadı:', error)
            setMessage({
              type: 'info',
              text: 'Konum izni alınamadı. QR kod okutmaya devam edebilirsiniz.'
            })
          }
        )
      }
      
      // Kısa bir gecikme sonra scanner'ı aç
      setTimeout(() => {
        setRequestingPermissions(false)
        setShowScanner(true)
      }, 1000)
    } catch (error) {
      console.error('İzin hatası:', error)
      setRequestingPermissions(false)
      setMessage({
        type: 'error',
        text: 'İzinler alınırken bir hata oluştu'
      })
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(true)
    setShowScanner(false)
    setMessage(null)

    try {
      // QR kod verisini parse et
      let sessionToken: string
      
      try {
        const qrData = JSON.parse(decodedText)
        sessionToken = qrData.token
      } catch {
        // JSON değilse direkt token olarak kullan
        sessionToken = decodedText
      }

      // QR kod doğrula
      const validateResponse = await qrCodeSessionService.validateSession({
        sessionToken,
        latitude: location?.latitude,
        longitude: location?.longitude
      })

      if (!validateResponse.valid) {
        setMessage({
          type: 'error',
          text: validateResponse.error || 'QR kod geçersiz'
        })
        setScanning(false)
        setCheckType(null)
        return
      }

      // Giriş-çıkış yap
      const checkResponse = await pdksAttendanceService.checkInOut({
        sessionToken,
        checkType: checkType!,
        latitude: location?.latitude,
        longitude: location?.longitude
      })

      if (checkResponse.error) {
        setMessage({
          type: 'error',
          text: checkResponse.error.message
        })
      } else {
        setMessage({
          type: 'success',
          text: `${checkType === 'in' ? 'Giriş' : 'Çıkış'} işleminiz başarıyla kaydedildi!`
        })
        
        // Son kayıtları yenile
        await loadRecentRecords()
      }
    } catch (error: any) {
      console.error('QR kod işleme hatası:', error)
      setMessage({
        type: 'error',
        text: 'QR kod işlenirken bir hata oluştu'
      })
    } finally {
      setScanning(false)
      setCheckType(null)
    }
  }

  const handleScanError = (error: string) => {
    setMessage({
      type: 'error',
      text: error
    })
    setShowScanner(false)
    setCheckType(null)
  }

  const handleCancelScan = () => {
    setShowScanner(false)
    setCheckType(null)
    setMessage(null)
  }

  const getCheckTypeColor = (type: 'in' | 'out') => {
    return type === 'in' ? 'success' : 'error'
  }

  const getCheckTypeLabel = (type: 'in' | 'out') => {
    return type === 'in' ? 'Giriş' : 'Çıkış'
  }

  return (
    <>
      <Grid container spacing={6}>
        {/* Başlık */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h4' className='mb-2'>
                PDKS - QR Kod Okutma
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Giriş veya çıkış yapmak için QR kodu okutun
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Son İşlem Bilgisi */}
        {lastCheckType && !showScanner && !scanning && (
          <Grid item xs={12}>
            <Alert severity='info'>
              Son işleminiz: <strong>{getCheckTypeLabel(lastCheckType)}</strong>
              {lastCheckType === 'in' && ' - Şimdi çıkış yapabilirsiniz'}
              {lastCheckType === 'out' && ' - Şimdi giriş yapabilirsiniz'}
            </Alert>
          </Grid>
        )}

        {/* Mesaj */}
        {message && (
          <Grid item xs={12}>
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          </Grid>
        )}

        {/* İzin İsteme Durumu */}
        {requestingPermissions && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className='flex flex-col items-center justify-center py-8'>
                  <CircularProgress size={60} className='mb-4' />
                  <Typography variant='h6' className='mb-2'>
                    İzinler İsteniyor...
                  </Typography>
                  <Typography variant='body2' color='text.secondary' align='center'>
                    Lütfen kamera ve konum izinlerini verin
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* QR Scanner Aktif */}
        {showScanner && !scanning && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className='mb-4'>
                  <Typography variant='h6' className='mb-2'>
                    {checkType === 'in' ? 'Giriş' : 'Çıkış'} için QR Kod Okutun
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    QR kodu kamera önüne tutun
                  </Typography>
                </Box>

                <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} isScanning={scanning} />

                <Box className='mt-4 flex gap-2'>
                  <Button variant='outlined' color='error' onClick={handleCancelScan} fullWidth>
                    İptal
                  </Button>
                </Box>

                {/* Konum Durumu */}
                {location && (
                  <Alert severity='success' className='mt-4'>
                    <Typography variant='caption' component='div'>
                      <strong>Konum:</strong> Alındı
                    </Typography>
                    <Typography variant='caption' component='div'>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* İşlem Yapılıyor */}
        {scanning && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className='flex flex-col items-center justify-center py-8'>
                  <CircularProgress size={60} className='mb-4' />
                  <Typography variant='h6' className='mb-2'>
                    İşlem Yapılıyor...
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Lütfen bekleyin
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Ana QR Okut Butonu */}
        {!showScanner && !scanning && !requestingPermissions && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className='flex flex-col items-center justify-center py-12'>
                  <QrCodeScannerIcon sx={{ fontSize: 100, color: 'primary.main', mb: 4 }} />
                  <Button
                    variant='contained'
                    size='large'
                    color='primary'
                    onClick={handleQRButtonClick}
                    startIcon={<QrCodeScannerIcon />}
                    sx={{
                      fontSize: '1.25rem',
                      padding: '16px 48px',
                      borderRadius: '12px'
                    }}
                  >
                    QR Okut
                  </Button>
                  <Typography variant='body2' color='text.secondary' className='mt-4'>
                    Giriş veya çıkış yapmak için butona basın
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Son Kayıtlar */}
        {!showScanner && !scanning && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' className='mb-4'>
                  Son Kayıtlarım
                </Typography>

                {recentRecords.length > 0 ? (
                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tarih/Saat</TableCell>
                          <TableCell>İşlem</TableCell>
                          <TableCell>Konum</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentRecords.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant='body2'>
                                {new Date(record.checkTime).toLocaleDateString('tr-TR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {new Date(record.checkTime).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getCheckTypeLabel(record.checkType)}
                                color={getCheckTypeColor(record.checkType)}
                                size='small'
                              />
                              {record.isManual && (
                                <Chip label='Manuel' color='warning' size='small' className='ml-1' />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant='caption'>
                                {record.branch?.name || record.qrCodeSession?.sessionName || 'Genel'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity='info'>Henüz kayıt bulunmuyor</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Kullanım Bilgileri */}
        {!showScanner && !scanning && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' className='mb-2'>
                  Nasıl Kullanılır?
                </Typography>
                <Box component='ol' className='pl-4'>
                  <Typography component='li' variant='body2' className='mb-2'>
                    <strong>QR Okut</strong> butonuna tıklayın
                  </Typography>
                  <Typography component='li' variant='body2' className='mb-2'>
                    <strong>Giriş</strong> veya <strong>Çıkış</strong> seçeneğini seçin
                  </Typography>
                  <Typography component='li' variant='body2' className='mb-2'>
                    Kamera ve konum izni verin
                  </Typography>
                  <Typography component='li' variant='body2' className='mb-2'>
                    QR kodu kamera önüne tutun
                  </Typography>
                  <Typography component='li' variant='body2'>
                    QR kod otomatik olarak okunacak ve işleminiz kaydedilecektir
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Giriş/Çıkış Seçim Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Typography variant='h5' align='center'>
            İşlem Tipi Seçin
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-3 py-4'>
            <Button
              variant='contained'
              color='success'
              size='large'
              fullWidth
              startIcon={<LoginIcon />}
              onClick={() => handleCheckTypeSelect('in')}
              sx={{
                padding: '16px',
                fontSize: '1.1rem'
              }}
            >
              Giriş
            </Button>
            <Button
              variant='contained'
              color='error'
              size='large'
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => handleCheckTypeSelect('out')}
              sx={{
                padding: '16px',
                fontSize: '1.1rem'
              }}
            >
              Çıkış
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color='inherit'>
            İptal
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}



