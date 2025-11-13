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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlRadioButton,
  Radio,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material'

// Components
import QRScanner from '@/components/pdks/QRScanner'

// Services
import { pdksAttendanceService } from '@/services/pdks-attendance.service'
import { qrCodeSessionService } from '@/services/qr-code-session.service'
import { authService } from '@/services'

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
  const [checkType, setCheckType] = useState<'in' | 'out'>('in')
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [lastCheckType, setLastCheckType] = useState<'in' | 'out' | null>(null)

  // Konum al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        error => {
          console.error('Konum alınamadı:', error)
          setMessage({
            type: 'info',
            text: 'Konum bilgisi alınamadı. QR kod okutmaya devam edebilirsiniz.'
          })
        }
      )
    }
  }, [])

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

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(true)
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
        return
      }

      // Giriş-çıkış yap
      const checkResponse = await pdksAttendanceService.checkInOut({
        sessionToken,
        checkType,
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
        
        // Otomatik olarak bir sonraki işlem tipine geç
        setCheckType(checkType === 'in' ? 'out' : 'in')
      }
    } catch (error: any) {
      console.error('QR kod işleme hatası:', error)
      setMessage({
        type: 'error',
        text: 'QR kod işlenirken bir hata oluştu'
      })
    } finally {
      setScanning(false)
    }
  }

  const handleScanError = (error: string) => {
    setMessage({
      type: 'error',
      text: error
    })
  }

  const getCheckTypeColor = (type: 'in' | 'out') => {
    return type === 'in' ? 'success' : 'error'
  }

  const getCheckTypeLabel = (type: 'in' | 'out') => {
    return type === 'in' ? 'Giriş' : 'Çıkış'
  }

  return (
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
      {lastCheckType && (
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

      {/* QR Kod Okutma */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box className='mb-4'>
              <FormControl>
                <FormLabel>İşlem Tipi</FormLabel>
                <RadioGroup
                  row
                  value={checkType}
                  onChange={e => setCheckType(e.target.value as 'in' | 'out')}
                >
                  <FormControlLabel value='in' control={<Radio />} label='Giriş' />
                  <FormControlLabel value='out' control={<Radio />} label='Çıkış' />
                </RadioGroup>
              </FormControl>
            </Box>

            <Divider className='mb-4' />

            <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} isScanning={scanning} />

            {/* Konum Durumu */}
            <Alert severity={location ? 'success' : 'warning'} className='mt-4'>
              {location ? (
                <>
                  <Typography variant='caption' component='div'>
                    <strong>Konum:</strong> Alındı
                  </Typography>
                  <Typography variant='caption' component='div'>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Typography>
                </>
              ) : (
                'Konum bilgisi alınamadı'
              )}
            </Alert>
          </CardContent>
        </Card>
      </Grid>

      {/* Son Kayıtlar */}
      <Grid item xs={12} md={6}>
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

      {/* Kullanım Bilgileri */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-2'>
              Nasıl Kullanılır?
            </Typography>
            <Box component='ol' className='pl-4'>
              <Typography component='li' variant='body2' className='mb-2'>
                <strong>Giriş</strong> veya <strong>Çıkış</strong> seçeneğini seçin
              </Typography>
              <Typography component='li' variant='body2' className='mb-2'>
                <strong>QR Kod Okutmaya Başla</strong> butonuna tıklayın
              </Typography>
              <Typography component='li' variant='body2' className='mb-2'>
                Kamera izni verin ve QR kodu kamera önüne tutun
              </Typography>
              <Typography component='li' variant='body2' className='mb-2'>
                QR kod otomatik olarak okunacak ve işleminiz kaydedilecektir
              </Typography>
              <Typography component='li' variant='body2'>
                Giriş yaptıktan sonra çıkış, çıkış yaptıktan sonra giriş yapabilirsiniz
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

