import { axiosClient } from '@/libs/axios';

export interface StrapiDepartment {
  documentId: string;
  key: string;
  name: string;
  description?: string;
}

interface StrapiResponse<T> {
  data: T;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

class DepartmentsService {
  private static instance: DepartmentsService;

  private constructor() {}

  public static getInstance(): DepartmentsService {
    if (!DepartmentsService.instance) {
      DepartmentsService.instance = new DepartmentsService();
    }
    return DepartmentsService.instance;
  }

  public async getDepartments(): Promise<StrapiResponse<StrapiDepartment[]>> {
    const response = await axiosClient.get('/api/departments');
    return response.data;
  }

  public async getDepartment(documentId: string): Promise<StrapiResponse<StrapiDepartment>> {
    const response = await axiosClient.get(`/api/departments/${documentId}`);
    return response.data;
  }

  public async createDepartment(department: Omit<StrapiDepartment, 'documentId'>): Promise<StrapiResponse<StrapiDepartment>> {
    const response = await axiosClient.post('/api/departments', { data: department });
    return response.data;
  }

  public async updateDepartment(documentId: string, department: Partial<StrapiDepartment>): Promise<StrapiResponse<StrapiDepartment>> {
    const response = await axiosClient.put(`/api/departments/${documentId}`, { data: department });
    return response.data;
  }

  public async deleteDepartment(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/departments/${documentId}`);
  }
}

export const departmentsService = DepartmentsService.getInstance();
