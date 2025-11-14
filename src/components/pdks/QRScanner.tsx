'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  isScanning?: boolean
}

export default function QRScanner({ onScanSuccess, onScanError, isScanning = false }: QRScannerProps) {
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    startScanning()

    return () => {
      // Cleanup: scanner'ı durdur
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    if (initialized) return

    try {
      setError('')
      setInitialized(true)

      // Scanner oluştur
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
      }

      // Kamera listesini al
      const cameras = await Html5Qrcode.getCameras()
      
      if (!cameras || cameras.length === 0) {
        throw new Error('Kamera bulunamadı. Lütfen kamera bağlantısını kontrol edin.')
      }

      // Kamera ID'si - arka kamerayı tercih et (mobilde), yoksa ilk kamerayı kullan
      const cameraId = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id

      // Scanner'ı başlat
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10, // Frame per second
          qrbox: { width: 250, height: 250 }, // QR box boyutu
          aspectRatio: 1.0,
          disableFlip: false // Kamerayı çevirmeye izin ver
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
      const errorMsg = err.message || 'QR kod okuyucu başlatılamadı'
      setError(errorMsg)
      if (onScanError) {
        onScanError(errorMsg)
      }
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        const isScanning = scannerRef.current.getState() === 2 // SCANNING state
        if (isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch (err) {
      console.error('Scanner stop error:', err)
    }
    setInitialized(false)
  }

  return (
    <Box>
      {error && (
        <Alert severity='error' className='mb-4'>
          {error}
          <Typography variant='caption' component='div' className='mt-2'>
            Lütfen tarayıcınızın kamera iznini kontrol edin.
          </Typography>
        </Alert>
      )}

      <Box className='relative'>
        <div
          id='qr-reader'
          style={{
            border: '3px solid #2196f3',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000'
          }}
        />

        {isScanning && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              zIndex: 10
            }}
          >
            <Box className='text-center'>
              <Typography variant='h6' className='text-white'>
                İşlem yapılıyor...
              </Typography>
              <Typography variant='body2' className='text-white mt-2'>
                Lütfen bekleyin
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Alert severity='info' className='mt-4'>
        <Typography variant='body2'>
          <strong>İpuçları:</strong>
        </Typography>
        <Typography variant='caption' component='div'>
          • QR kodu kamera önüne net bir şekilde tutun
        </Typography>
        <Typography variant='caption' component='div'>
          • İyi aydınlatma altında okutun
        </Typography>
        <Typography variant='caption' component='div'>
          • QR kod otomatik olarak okunacaktır
        </Typography>
      </Alert>
    </Box>
  )
}



