import { axiosClient } from '@/libs/axios';

export interface StrapiWorkMode {
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

class WorkModesService {
  private static instance: WorkModesService;

  private constructor() {}

  public static getInstance(): WorkModesService {
    if (!WorkModesService.instance) {
      WorkModesService.instance = new WorkModesService();
    }
    return WorkModesService.instance;
  }

  public async getWorkModes(): Promise<StrapiResponse<StrapiWorkMode[]>> {
    const response = await axiosClient.get('/api/work-modes');
    return response.data;
  }

  public async getWorkMode(documentId: string): Promise<StrapiResponse<StrapiWorkMode>> {
    const response = await axiosClient.get(`/api/work-modes/${documentId}`);
    return response.data;
  }

  public async createWorkMode(workMode: Omit<StrapiWorkMode, 'documentId'>): Promise<StrapiResponse<StrapiWorkMode>> {
    const response = await axiosClient.post('/api/work-modes', { data: workMode });
    return response.data;
  }

  public async updateWorkMode(documentId: string, workMode: Partial<StrapiWorkMode>): Promise<StrapiResponse<StrapiWorkMode>> {
    const response = await axiosClient.put(`/api/work-modes/${documentId}`, { data: workMode });
    return response.data;
  }

  public async deleteWorkMode(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/work-modes/${documentId}`);
  }
}

export const workModesService = WorkModesService.getInstance();
