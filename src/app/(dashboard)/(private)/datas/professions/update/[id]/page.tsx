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
import { professionsService } from '@/services/professions.service';
import JobEditor from '@/components/editor/JobEditor';

const UpdateProfessionPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfession = async () => {
      try {
        const response = await professionsService.getProfession(id as string);
        const profession = response.data;
        if (profession) {
          setFormData({
            key: profession.key,
            name: profession.name,
            description: profession.description || ''
          });
        } else {
          toast.error('Meslek bulunamadı');
          router.push('/datas/professions/list');
        }
      } catch (error: any) {
        console.error('Meslek yüklenirken hata oluştu:', error);
        toast.error(error.response?.data?.error?.message || 'Meslek yüklenirken bir hata oluştu');
      }
    };

    if (id) {
      fetchProfession();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await professionsService.updateProfession(id as string, formData);
      toast.success('Meslek başarıyla güncellendi');
      router.push('/datas/professions/list');
    } catch (error: any) {
      console.error('Meslek güncellenirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Meslek güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Mesleği Güncelle
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
                placeholder="Meslek açıklamasını yazın..."
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
                {loading ? 'Meslek Güncelleniyor...' : 'Mesleği Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateProfessionPage;
