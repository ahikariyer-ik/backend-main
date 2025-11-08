import { axiosClient } from '@/libs/axios';

export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface StrapiResponse<T> {
  data: T;
  error?: {
    message: string;
  };
}

class RolesService {
  private static instance: RolesService;

  private constructor() {}

  public static getInstance(): RolesService {
    if (!RolesService.instance) {
      RolesService.instance = new RolesService();
    }
    return RolesService.instance;
  }

  public async getRoles(): Promise<StrapiResponse<StrapiRole[]>> {
    try {
      const response = await axiosClient.get('/api/users-permissions/roles');
      return { data: response.data.roles };
    } catch (error: any) {
      return {
        data: [],
        error: {
          message: error.response?.data?.message || 'Roller yüklenirken bir hata oluştu'
        }
      };
    }
  }
}

export const rolesService = RolesService.getInstance();
