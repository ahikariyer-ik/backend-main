'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'

// Types
import type { StrapiService } from '@/services/services.service'

// Services
import { servicesService } from '@/services/services.service'

const ServicesListPage = () => {
  // States
  const [services, setServices] = useState<StrapiService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Effects
  useEffect(() => {
    loadServices()
  }, [])

  // Handlers
  const loadServices = async () => {
    try {
      const data = await servicesService.getServices()
      setServices(data)
    } catch (error) {
      console.error('Hizmetler yüklenirken hata oluştu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (documentId: string, isActive: boolean) => {
    try {
      await servicesService.updateService({ documentId, isActive })
      setServices(prev => prev.map(service => (service.documentId === documentId ? { ...service, isActive } : service)))
    } catch (error) {
      console.error('Hizmet durumu güncellenirken hata oluştu:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return

    try {
      await servicesService.deleteService(documentId)
      setServices(prev => prev.filter(service => service.documentId !== documentId))
    } catch (error) {
      console.error('Hizmet silinirken hata oluştu:', error)
    }
  }

  // Filtered services
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(search.toLowerCase()) ||
    service.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader
        title='Hizmetler'
        action={
          <Button component={Link} href='/services/create' variant='contained' startIcon={<i className='tabler-plus' />}>
            Yeni Hizmet
          </Button>
        }
      />
      <Box sx={{ p: 5, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
          <CustomTextField
            placeholder='Ara...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <i className='tabler-search' style={{ marginRight: '10px' }} />
            }}
          />
        </Box>

        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : filteredServices.length === 0 ? (
          <Typography>Hizmet bulunamadı.</Typography>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {filteredServices.map(service => (
              <Card key={service.documentId} sx={{ position: 'relative' }}>
                {service.image && (
                  <img
                    src={process.env.NEXT_PUBLIC_STRAPI_API_URL + service.image.url}
                    alt={service.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Box sx={{ p: 3 }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>{service.title}</Typography>
                  <Typography noWrap sx={{ mb: 2 }}>{service.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Switch
                      checked={service.isActive}
                      onChange={e => handleStatusChange(service.documentId, e.target.checked)}
                    />
                    <Box>
                      <Tooltip title='Düzenle'>
                        <IconButton component={Link} href={`/services/update/${service.documentId}`}>
                          <i className='tabler-edit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Sil'>
                        <IconButton color='error' onClick={() => handleDelete(service.documentId)}>
                          <i className='tabler-trash' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </div>
        )}
      </Box>
    </Card>
  )
}

export default ServicesListPage
