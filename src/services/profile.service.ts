import {axiosClient} from '@/libs/axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: 'EMPLOYEE' | 'AUTHENTICATED';
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  photo?: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await axiosClient.get<UserProfile>('/profile');

    
return response.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await axiosClient.patch<UserProfile>('/profile', data);

    
return response.data;
  },

  async uploadPhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();

    formData.append('photo', file);
    
    const response = await axiosClient.post<{ url: string }>('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    
return response.data;
  }
}; 