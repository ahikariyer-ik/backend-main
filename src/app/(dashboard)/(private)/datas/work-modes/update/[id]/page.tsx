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
import { workModesService } from '@/services/work-modes.service';
import JobEditor from '@/components/editor/JobEditor';

const UpdateWorkModePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkMode = async () => {
      try {
        const response = await workModesService.getWorkMode(id as string);
        const workMode = response.data;
        if (workMode) {
          setFormData({
            key: workMode.key,
            name: workMode.name,
            description: workMode.description || ''
          });
        } else {
          toast.error('Çalışma türü bulunamadı');
          router.push('/datas/work-modes/list');
        }
      } catch (error: any) {
        console.error('Çalışma türü yüklenirken hata oluştu:', error);
        toast.error(error.response?.data?.error?.message || 'Çalışma türü yüklenirken bir hata oluştu');
      }
    };

    if (id) {
      fetchWorkMode();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workModesService.updateWorkMode(id as string, formData);
      toast.success('Çalışma türü başarıyla güncellendi');
      router.push('/datas/work-modes/list');
    } catch (error: any) {
      console.error('Çalışma türü güncellenirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Çalışma türü güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Çalışma Türünu Güncelle
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
                placeholder="Çalışma türü açıklamasını yazın..."
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
                {loading ? 'Çalışma Türü Güncelleniyor...' : 'Çalışma Türünu Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateWorkModePage;
