'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

import { authService } from '@/services'
import type { StrapiUser, StrapiCompanyProfile } from '@/services/auth.service'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<StrapiUser | null>(null)
  const [companyProfile, setCompanyProfile] = useState<StrapiCompanyProfile | null>(null)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()

  useEffect(() => {
    setUser(authService.getUser())
    setCompanyProfile(authService.getCompanyProfile())
  }, [])

  const handleDropdownOpen = () => {
    setOpen(!open)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error)
    }
  }

  const getAvatarContent = () => {
    if (companyProfile?.logo) {
      return (
        <Avatar
          alt={companyProfile.companyName}
          src={`${process.env.NEXT_PUBLIC_API_URL}${companyProfile.logo.url}`}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      )
    }

    if (companyProfile) {
      return (
        <Avatar
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px] bg-primary'
        >
          {companyProfile.companyName.split(' ').map(word => word[0]).join('').toUpperCase()}
        </Avatar>
      )
    }

    return (
      <Avatar
        onClick={handleDropdownOpen}
        className='cursor-pointer bs-[38px] is-[38px]'
      >
        {user?.username?.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        {getAvatarContent()}
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    {getAvatarContent()}
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {companyProfile?.companyName || user?.username || 'Kullanıcı'}
                      </Typography>
                      <Typography variant='caption'>{user?.email}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {authService.isCompany() && (
                    <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/profile/company')}>
                      <i className='tabler-building' />
                      <Typography color='text.primary'>Kurum Bilgileri</Typography>
                    </MenuItem>
                  )}
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/profile/password')}>
                    <i className='tabler-lock' />
                    <Typography color='text.primary'>Şifre Değiştir</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='tabler-help-circle' />
                    <Typography color='text.primary'>Yardım</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Çıkış Yap
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
