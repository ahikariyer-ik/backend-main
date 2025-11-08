'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import React, { useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useColorScheme } from '@mui/material/styles'

interface RichTextEditorProps {
  value: string
  onChange: (value?: string) => void
  error?: boolean
  helperText?: string
}

const RichTextEditor = ({ value, onChange, error, helperText }: RichTextEditorProps) => {
  const { mode: muiMode } = useColorScheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', muiMode || 'light')
  }, [muiMode])

  return (
    <Box>
      <MDEditor onChange={value => onChange(value)} value={value} minHeight={300} height={300} highlightEnable={false} />
      {helperText && (
        <Typography
          variant='caption'
          color={error ? 'error' : 'textSecondary'}
          sx={{ mt: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export default RichTextEditor
