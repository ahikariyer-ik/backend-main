import { axiosClient } from '@/libs/axios';

export interface Department {
  id: number;
  documentId: string;
  key: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    documentId: string;
  };
}

export interface CreateDepartmentDTO {
  key: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentDTO {
  key?: string;
  name?: string;
  description?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: any;
  error?: any;
}

class DepartmentService {
  private static instance: DepartmentService;

  public static getInstance(): DepartmentService {
    if (!DepartmentService.instance) {
      DepartmentService.instance = new DepartmentService();
    }
    return DepartmentService.instance;
  }

  public async getDepartments(): Promise<StrapiResponse<Department[]>> {
    try {
      const response = await axiosClient.get('/api/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  public async getDepartment(documentId: string): Promise<StrapiResponse<Department>> {
    try {
      const response = await axiosClient.get(`/api/departments/${documentId}`, {
        params: {
          populate: '*'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  }

  public async createDepartment(data: CreateDepartmentDTO): Promise<StrapiResponse<Department>> {
    try {
      const response = await axiosClient.post('/api/departments', {
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  public async updateDepartment(documentId: string, data: UpdateDepartmentDTO): Promise<StrapiResponse<Department>> {
    try {
      const response = await axiosClient.put(`/api/departments/${documentId}`, {
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  public async deleteDepartment(documentId: string): Promise<void> {
    try {
      await axiosClient.delete(`/api/departments/${documentId}`);
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
}

export const departmentService = DepartmentService.getInstance();

