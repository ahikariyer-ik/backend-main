'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const UpdatePositionPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await positionsService.getPosition(id as string);
        const position = response.data;
        if (position) {
          setFormData({
            key: position.key,
            name: position.name,
            description: position.description || ''
          });
        } else {
          toast.error('Pozisyon bulunamadı');
          router.push('/datas/positions/list');
        }
      } catch (error: any) {
        console.error('Pozisyon yüklenirken hata oluştu:', error);
        toast.error(error.response?.data?.error?.message || 'Pozisyon yüklenirken bir hata oluştu');
      }
    };

    if (id) {
      fetchPosition();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await positionsService.updatePosition(id as string, formData);
      toast.success('Pozisyon başarıyla güncellendi');
      router.push('/datas/positions/list');
    } catch (error: any) {
      console.error('Pozisyon güncellenirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Pozisyon güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Pozisyonu Güncelle
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
                {loading ? 'Pozisyon Güncelleniyor...' : 'Pozisyonu Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdatePositionPage;
