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

// Component Imports
import Link from '@components/Link'

// Types
import type { StrapiUser } from '@/services/users.service'

// Services
import { usersService } from '@/services/users.service'

const UsersListPage = () => {
  // States
  const [users, setUsers] = useState<StrapiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<StrapiUser | null>(null)

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadUsers()
  }, [])

  // Handlers
  const loadUsers = async () => {
    try {
      const response = await usersService.getUsers()
      if (response.error) {
        throw response.error
      }
      setUsers(response.data)
    } catch (error: any) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      setError(error.message || 'Kullanıcılar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user: StrapiUser) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      await usersService.deleteUser(selectedUser.documentId)
      setUsers(users.filter(u => u.documentId !== selectedUser.documentId))
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error: any) {
      console.error('Kullanıcı silinirken hata:', error)
      setError(error.response?.data?.error?.message || 'Kullanıcı silinirken bir hata oluştu')
    }
  }

  const handleBlockToggle = async (user: StrapiUser) => {
    try {
      const response = user.blocked
        ? await usersService.unblockUser(user.documentId)
        : await usersService.blockUser(user.documentId)

      if (response.error) {
        throw response.error
      }

      setUsers(users.map(u => u.documentId === response.data.documentId ? response.data : u))
    } catch (error: any) {
      console.error('Kullanıcı durumu güncellenirken hata:', error)
      setError(error.message || 'Kullanıcı durumu güncellenirken bir hata oluştu')
    }
  }

  const handleAhiIkToggle = async (user: StrapiUser) => {
    console.log('AHİ-İK Toggle clicked for user:', user.username, 'Current status:', user.ahiIkMember)
    try {
      setError(null) // Önceki hataları temizle
      const newAhiIkStatus = !user.ahiIkMember
      console.log('Yeni AHİ-İK durumu:', newAhiIkStatus)
      const response = await usersService.toggleAhiIk(user.documentId, newAhiIkStatus)

      if (response.error) {
        throw response.error
      }

      console.log('Toggle başarılı, response:', response.data)
      console.log('Response data ahiIkMember:', response.data.ahiIkMember)
      console.log('Response data companyProfile:', response.data.companyProfile)
      
      // State'i güncelle
      const updatedUsers = users.map(u => {
        if (u.documentId === response.data.documentId) {
          console.log('Kullanıcı bulundu, güncelleniyor:', u.username)
          return response.data
        }
        return u
      })
      console.log('Updated users:', updatedUsers)
      setUsers(updatedUsers)
    } catch (error: any) {
      console.error('AHİ-İK durumu güncellenirken hata:', error)
      setError(error.message || 'AHİ-İK durumu güncellenirken bir hata oluştu')
    }
  }

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <Card>
      <CardHeader
        title='Kullanıcı Yönetimi'
        action={
          <Button component={Link} href='/users/create' variant='contained' startIcon={<i className='tabler:plus' />}>
            Yeni Kullanıcı
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>AHİ-İK</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.documentId}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {user.companyProfile?.logo ? (

                        <Avatar
                          src={process.env.NEXT_PUBLIC_IMAGE_BASE_URL + user.companyProfile.logo.url}
                          alt={user.companyProfile.companyName}
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant='subtitle2'>{user.username}</Typography>
                        {user.companyProfile?.sector && (
                          <Typography variant='caption' color='textSecondary'>
                            {user.companyProfile.sector.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.companyProfile ? (
                      <Chip
                        label={user.companyProfile.companyName}
                        color='primary'
                        variant='outlined'
                        size='small'
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {user.blocked ? (
                      <Chip
                        label='Engelli'
                        color='error'
                        size='small'
                      />
                    ) : (
                      <Chip
                        label='Aktif'
                        color='success'
                        size='small'
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.companyProfile ? (
                      <Switch
                        checked={user.ahiIkMember || false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          console.log('Switch onChange triggered')
                          e.stopPropagation()
                          handleAhiIkToggle(user)
                        }}
                        onClick={(e: React.MouseEvent) => {
                          console.log('Switch onClick triggered')
                          e.stopPropagation()
                        }}
                        color='primary'
                        disabled={loading}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      component={Link}
                      href={`/users/update/${user.documentId}`}
                      color='primary'
                      size='small'
                    >
                      <i className='tabler-edit text-textSecondary' />
                    </IconButton>
                    <IconButton
                      onClick={() => handleBlockToggle(user)}
                      color={user.blocked ? 'success' : 'warning'}
                      size='small'
                    >
                      <i className={user.blocked ? 'tabler-lock-open text-textSecondary' : 'tabler-lock text-textSecondary'} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(user)}
                      color='error'
                      size='small'
                    >
                      <i className='tabler-trash text-textSecondary' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Kullanıcıyı Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedUser?.companyProfile ? (
                <>
                  <strong>{selectedUser.companyProfile.companyName}</strong> şirketine ait{' '}
                  <strong>{selectedUser.username}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                  Bu işlem geri alınamaz ve şirket profilini de etkileyebilir.
                </>
              ) : (
                <>
                  <strong>{selectedUser?.username}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                  Bu işlem geri alınamaz.
                </>
              )}
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
      </CardContent>
    </Card>
  )
}

export default UsersListPage
