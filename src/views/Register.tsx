'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import classnames from 'classnames'

import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

import themeConfig from '@configs/themeConfig'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import { authService } from '@/services'

const Illustration = styled('img')(({ theme }) => ({
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

import type { SystemMode } from '@core/types'

const Register = ({ mode }: { mode: SystemMode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'info' | 'success' } | null>(null)

  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration, borderedLightIllustration, borderedDarkIllustration)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await authService.registerCompany(username, email, password)
      const dest = authService.getDashboardUrl() || '/company-dashboard'
      router.push(dest)
    } catch (err: any) {
      let errorMessage = 'Kayıt sırasında bir hata oluştu'
      const apiMsg = err?.response?.data?.error?.message || err?.message
      if (apiMsg) errorMessage = apiMsg
      setError({ message: errorMessage, type: 'error' })
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
        <Illustration src={characterIllustration} alt='character-illustration' />
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
            <Typography variant='h4'>{`${themeConfig.templateName}'a Hoş geldin!`}</Typography>
            <Typography>Devam etmek için firma hesabı oluştur</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Firma Adı / Kullanıcı Adı'
              placeholder='ör. Akme Teknoloji'
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              error={!!error}
            />
            <CustomTextField
              fullWidth
              type='email'
              label='E-posta'
              placeholder='email@firma.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              error={!!error}
            />
            <CustomTextField
              fullWidth
              label='Şifre'
              placeholder='············'
              id='register-password'
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
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Hesap Oluştur'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Zaten hesabın var mı?</Typography>
              <Typography component={Link} href='/login' color='primary.main'>
                Giriş yap
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register


