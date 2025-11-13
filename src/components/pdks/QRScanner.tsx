'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  isScanning?: boolean
}

export default function QRScanner({ onScanSuccess, onScanError, isScanning = false }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    // Kamera listesini al
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices)
          setHasPermission(true)
        } else {
          setError('Kamera bulunamadı')
          setHasPermission(false)
        }
      })
      .catch(err => {
        console.error('Kamera listesi alınamadı:', err)
        setError('Kamera erişimi için izin gerekli')
        setHasPermission(false)
      })

    return () => {
      // Cleanup: scanner'ı durdur
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Scanner stop error:', err))
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError('')
      setScanning(true)

      // Scanner oluştur
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }

      // Kamera ID'si - arka kamerayı tercih et
      const cameraId = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0]?.id

      if (!cameraId) {
        throw new Error('Kamera bulunamadı')
      }

      // Scanner'ı başlat
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10, // Frame per second
          qrbox: { width: 250, height: 250 }, // QR box boyutu
          aspectRatio: 1.0
        },
        (decodedText) => {
          // QR kod başarıyla okundu
          console.log('QR kod okundu:', decodedText)
          onScanSuccess(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // QR kod okunamadı (normal, her frame için tetiklenir)
          // Loglama yapma, gürültü olur
        }
      )
    } catch (err: any) {
      console.error('Scanner start error:', err)
      setError(err.message || 'QR kod okuyucu başlatılamadı')
      setScanning(false)
      if (onScanError) {
        onScanError(err.message || 'QR kod okuyucu başlatılamadı')
      }
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop()
        setScanning(false)
      }
    } catch (err) {
      console.error('Scanner stop error:', err)
      setScanning(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' className='mb-4'>
          QR Kod Okutma
        </Typography>

        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}

        {hasPermission === false && (
          <Alert severity='warning' className='mb-4'>
            Kamera erişimi için tarayıcınızdan izin vermeniz gerekiyor.
          </Alert>
        )}

        <Box className='relative'>
          <div
            id='qr-reader'
            className='w-full'
            style={{
              border: scanning ? '2px solid #4caf50' : '2px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              minHeight: scanning ? 'auto' : '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: scanning ? '#000' : '#f5f5f5'
            }}
          >
            {!scanning && (
              <Typography variant='body2' color='text.secondary'>
                QR kod okutmak için başlat butonuna tıklayın
              </Typography>
            )}
          </div>

          {isScanning && (
            <Box
              className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'
              style={{
                borderRadius: '8px',
                zIndex: 10
              }}
            >
              <CircularProgress color='primary' />
              <Typography variant='body2' className='ml-2 text-white'>
                İşlem yapılıyor...
              </Typography>
            </Box>
          )}
        </Box>

        <Box className='flex gap-2 mt-4'>
          {!scanning ? (
            <Button
              variant='contained'
              color='primary'
              onClick={startScanning}
              disabled={!hasPermission || isScanning}
              fullWidth
            >
              QR Kod Okutmaya Başla
            </Button>
          ) : (
            <Button variant='outlined' color='error' onClick={stopScanning} fullWidth disabled={isScanning}>
              Okumayı Durdur
            </Button>
          )}
        </Box>

        <Alert severity='info' className='mt-4'>
          <Typography variant='caption'>
            • QR kodu kamera önüne tutun
            <br />
            • Kamera odağı net olmalı
            <br />• QR kod otomatik olarak okunacaktır
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )
}

