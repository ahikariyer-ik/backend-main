'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button
} from '@mui/material';
import { toast } from 'react-toastify';
import { positionsService } from '@/services/positions.service';
import JobEditor from '@/components/editor/JobEditor';

const CreatePositionPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await positionsService.createPosition(formData);
      toast.success('Pozisyon başarıyla oluşturuldu');
      router.push('/datas/positions/list');
    } catch (error: any) {
      console.error('Pozisyon oluşturulurken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Pozisyon oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Yeni Pozisyon Ekle
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Anahtar'
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='İsim'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Açıklama</Typography>
              <JobEditor
                content={formData.description}
                placeholder="Pozisyon açıklamasını yazın..."
                onChange={html => setFormData({ ...formData, description: html })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                fullWidth
                disabled={loading}
              >
                {loading ? 'Pozisyon Oluşturuluyor...' : 'Pozisyonu Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePositionPage;
