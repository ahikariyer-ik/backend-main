'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'

// Libs Imports
import { authService } from '@/services'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [tabValue, setTabValue] = useState(0)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'info' | 'success' } | null>(null)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const [loading, setLoading] = useState(false);

  // Vars for Images
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setError(null)
    setIdentifier('')
    setPassword('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (tabValue === 0) {
        // İşveren girişi
        await authService.login(identifier, password)
        if (!authService.isCompany() && !authService.isEmployee()) {
          setError({
            message: 'Bu hesap işveren hesabı değil. Lütfen çalışanlar sekmesinden giriş yapın.',
            type: 'error'
          })
          setLoading(false)
          return
        }
        router.push(authService.getDashboardUrl())
      } else {
        // Çalışan girişi
        await authService.login(identifier, password)
        if (!authService.isWorker()) {
          setError({
            message: 'Bu hesap çalışan hesabı değil. Lütfen işveren girişi sekmesinden giriş yapın.',
            type: 'error'
          })
          setLoading(false)
          return
        }
        router.push(authService.getDashboardUrl())
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        const errorData = err.response.data.error

        let errorMessage = 'Giriş yapılırken bir hata oluştu'

        if (errorData.message === 'Invalid identifier or password') {
          errorMessage = 'Geçersiz email veya şifre'
        } else if (errorData.message === 'Email is not confirmed') {
          errorMessage = 'Email adresiniz henüz onaylanmamış'
        } else if (errorData.message === 'Too many requests') {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin'
        }

        setError({
          message: errorMessage,
          type: 'error'
        })
      } else {
        setError({
          message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin',
          type: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Kurum360'a Hoş geldin!`}</Typography>
            <Typography>Lütfen devam etmek için giriş yap</Typography>
          </div>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label='giriş sekmeleri'>
              <Tab label='İşveren Girişi' />
              <Tab label='Çalışanlar' />
            </Tabs>
          </Box>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='email@hotmail.com'
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              disabled={loading}
              error={!!error}
            />
            <CustomTextField
              fullWidth
              label='Şifre'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              error={!!error}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            {error && (
              <Alert severity={error.type} sx={{ mt: 2 }}>
                {error.message}
              </Alert>
            )}
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox disabled={loading} />} label='Beni hatırla' />
              <Typography className='text-end' color='primary.main' component={Link}>
                Şifremi unuttum?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Platformda yeni misin?</Typography>
              <Typography component={Link} href='/register' color='primary.main'>
                Hesap oluştur
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
