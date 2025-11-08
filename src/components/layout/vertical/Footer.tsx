'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Footer = () => {
  return (
    <Box
      component='footer'
      className='layout-footer'
      sx={{
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 6,
        borderTop: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        © {new Date().getFullYear()} Codereltech L.L.C. Tüm hakları saklıdır.
      </Typography>
    </Box>
  )
}

export default Footer
