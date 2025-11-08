'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'

// Axios Import
import { axiosClient } from '@/libs/axios'

interface ImageUploadProps {
  onChange: (documentId: string) => void
  value?: string
  error?: boolean
  helperText?: string
  required?: boolean
  currentImageUrl?: string
}

const ImageUpload = ({ onChange, value, error, helperText, required, currentImageUrl }: ImageUploadProps) => {
  // States
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Effects
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(process.env.NEXT_PUBLIC_STRAPI_API_URL + currentImageUrl)
    }
  }, [currentImageUrl])

  // Hooks
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 2000000, // 2MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) {
        toast.error('Lütfen bir resim dosyası seçin')
        return
      }

      setLoading(true)
      setFile(file)

      try {
        // Dosya önizleme
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Form data oluştur
        const formData = new FormData()
        formData.append('files', file)

        // Dosya boyutu kontrolü
        if (file.size === 0) {
          throw new Error('Dosya boş')
        }

        // Strapi'ye yükle
        const response = await axiosClient.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (!response.data || !response.data[0]) {
          throw new Error('Yükleme başarısız')
        }

        const uploadedFile = response.data[0]
        onChange(uploadedFile.id)
        toast.success('Resim başarıyla yüklendi')
      } catch (error: any) {
        console.error('Resim yüklenirken hata oluştu:', error)
        setPreview(null)
        setFile(null)
        onChange('')

        if (error.response?.data?.message === 'Files are empty') {
          toast.error('Lütfen geçerli bir resim dosyası seçin')
        } else {
          toast.error('Resim yüklenirken bir hata oluştu')
        }
      } finally {
        setLoading(false)
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors[0].code === 'file-too-large') {
        toast.error('Dosya boyutu çok büyük (maksimum 2MB)')
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        toast.error('Geçersiz dosya formatı')
      } else {
        toast.error('Dosya yüklenemedi')
      }
    }
  })

  const handleRemove = () => {
    setPreview(null)
    setFile(null)
    onChange('')
  }

  const renderFilePreview = () => {
    if (preview) {
      return (
        <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            src={preview}
            alt='Preview'
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <IconButton
            onClick={handleRemove}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
            size='small'
          >
            <i className='tabler-x' />
          </IconButton>
        </Box>
      )
    }

    return null
  }

  return (
    <Box>
      <div
        {...getRootProps({
          className: 'dropzone',
          style: {
            border: `2px dashed ${error ? '#f44336' : '#e0e0e0'}`,
            borderRadius: '8px',
            padding: '20px',
            cursor: 'pointer',
            minHeight: preview ? 'auto' : '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }
        })}
      >
        <input {...getInputProps()} />
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            {renderFilePreview()}
            {!preview && (
              <div className='flex items-center flex-col'>
                <Avatar variant='rounded' sx={{ width: 48, height: 48, mb: 2 }}>
                  <i className='tabler-upload text-2xl' />
                </Avatar>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  Resim yüklemek için tıklayın veya sürükleyin{required ? ' *' : ''}
                </Typography>
                <Typography color='textSecondary'>İzin verilen formatlar: *.jpeg, *.jpg, *.png, *.gif</Typography>
                <Typography color='textSecondary'>Maksimum dosya boyutu: 2MB</Typography>
              </div>
            )}
          </>
        )}
      </div>
      {helperText && (
        <Typography color={error ? 'error' : 'textSecondary'} variant='caption' sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export default ImageUpload
