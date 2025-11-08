import { axiosClient } from '@/libs/axios';

export interface StrapiProfession {
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

class ProfessionsService {
  private static instance: ProfessionsService;

  private constructor() {}

  public static getInstance(): ProfessionsService {
    if (!ProfessionsService.instance) {
      ProfessionsService.instance = new ProfessionsService();
    }
    return ProfessionsService.instance;
  }

  public async getProfessions(): Promise<StrapiResponse<StrapiProfession[]>> {
    const response = await axiosClient.get('/api/professions');
    return response.data;
  }

  public async getProfession(documentId: string): Promise<StrapiResponse<StrapiProfession>> {
    const response = await axiosClient.get(`/api/professions/${documentId}`);
    return response.data;
  }

  public async createProfession(profession: Omit<StrapiProfession, 'documentId'>): Promise<StrapiResponse<StrapiProfession>> {
    const response = await axiosClient.post('/api/professions', { data: profession });
    return response.data;
  }

  public async updateProfession(documentId: string, profession: Partial<StrapiProfession>): Promise<StrapiResponse<StrapiProfession>> {
    const response = await axiosClient.put(`/api/professions/${documentId}`, { data: profession });
    return response.data;
  }

  public async deleteProfession(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/professions/${documentId}`);
  }
}

export const professionsService = ProfessionsService.getInstance();
