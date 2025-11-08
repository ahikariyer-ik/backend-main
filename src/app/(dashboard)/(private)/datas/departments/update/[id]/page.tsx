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
import { departmentsService } from '@/services/departments.service';
import JobEditor from '@/components/editor/JobEditor';

const UpdateDepartmentPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await departmentsService.getDepartment(id as string);
        const department = response.data;
        if (department) {
          setFormData({
            key: department.key,
            name: department.name,
            description: department.description || ''
          });
        } else {
          toast.error('Departman bulunamadı');
          router.push('/datas/departments/list');
        }
      } catch (error: any) {
        console.error('Departman yüklenirken hata oluştu:', error);
        toast.error(error.response?.data?.error?.message || 'Departman yüklenirken bir hata oluştu');
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await departmentsService.updateDepartment(id as string, formData);
      toast.success('Departman başarıyla güncellendi');
      router.push('/datas/departments/list');
    } catch (error: any) {
      console.error('Departman güncellenirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Departman güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Departmanı Güncelle
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
                placeholder="Departman açıklamasını yazın..."
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
                {loading ? 'Departman Güncelleniyor...' : 'Departmanı Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateDepartmentPage;
