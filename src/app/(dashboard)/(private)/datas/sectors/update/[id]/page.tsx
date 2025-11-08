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
import { sectorsService } from '@/services/sectors.service';
import JobEditor from '@/components/editor/JobEditor';

const UpdateSectorPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSector = async () => {
      try {
        const response = await sectorsService.getSector(id as string);
        const sector = response.data;
        if (sector) {
          setFormData({
            key: sector.key,
            name: sector.name,
            description: sector.description || ''
          });
        } else {
          toast.error('Sektör bulunamadı');
          router.push('/datas/sectors/list');
        }
      } catch (error: any) {
        console.error('Sektör yüklenirken hata oluştu:', error);
        toast.error(error.response?.data?.error?.message || 'Sektör yüklenirken bir hata oluştu');
      }
    };

    if (id) {
      fetchSector();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sectorsService.updateSector(id as string, formData);
      toast.success('Sektör başarıyla güncellendi');
      router.push('/datas/sectors/list');
    } catch (error: any) {
      console.error('Sektör güncellenirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Sektör güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Sektörü Güncelle
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
                placeholder="Sektör açıklamasını yazın..."
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
                {loading ? 'Sektör Güncelleniyor...' : 'Sektörü Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateSectorPage;
