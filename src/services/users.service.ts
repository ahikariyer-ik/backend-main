import { axiosClient } from '@/libs/axios';

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked: boolean;
  ahiIkMember?: boolean; // AHİ-İK sistemine kayıtlı mı?
  role?: {
    id: number;
    name: string;
  };
  companyProfile?: {
    id: number;
    companyName: string;
    logo?: {
      id: number;
      documentId: string;
      url: string;
    };
    sector?: {
      id: number;
      name: string;
    };
  } | null;
  postingRights?: {
    id: number;
    postingQuota: number;
    postingsUsed: number;
  } | null;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role: any;
  confirmed?: boolean;
  blocked?: boolean;
  ahiIkMember?: boolean;
}

export interface UpdateUserDTO extends Partial<Omit<CreateUserDTO, 'password'>> {
  documentId: string;
  password?: string;
  ahiIkMember?: boolean;
  companyProfile?: any;
  postingRights?: any;
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

class UsersService {
  private static instance: UsersService;

  private constructor() {}

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  public async getUsers(): Promise<StrapiResponse<StrapiUser[]>> {
    const response = await axiosClient.get('/api/users', {
      params: {
        filters: {
          role: {
            name: {
              $eq: ['Authenticated']
            }
          }
        },
        populate: ['companyProfile', 'companyProfile.logo', 'companyProfile.sector', 'postingRights']
      }
    });
    return response.data;
  }

  public async getUser(documentId: string): Promise<StrapiResponse<StrapiUser>> {
    const response = await axiosClient.get(`/api/users/${documentId}`, {
      params: {
        populate: ['companyProfile', 'companyProfile.logo', 'companyProfile.sector', 'postingRights']
      }
    });
    return response.data;
  }

  public async createUser(data: CreateUserDTO): Promise<any> {
    try {
      const response = await axiosClient.post('/api/users', data);
      return response.data;
    } catch (error: any) {
      console.error('User creation API error:');
      console.error('Status:', error.response?.status);
      console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error message:', error.response?.data?.error?.message);
      console.error('Error details:', error.response?.data?.error?.details);
      throw error;
    }
  }

  public async updateUser(data: UpdateUserDTO): Promise<StrapiResponse<StrapiUser>> {
    const { documentId, ...cleanData } = data;

    // Nested objeleri koru, diğer alanları filtrele
    const filteredData: any = {};
    
    Object.entries(cleanData).forEach(([key, value]) => {
      // companyProfile ve postingRights nested objeler olduğu için özel işleme
      if (key === 'companyProfile' || key === 'postingRights') {
        // Nested objeleri olduğu gibi gönder (undefined/null kontrolü içeride yapılır)
        if (value !== undefined && value !== null) {
          filteredData[key] = value;
        }
      } else if (value !== '' && value !== undefined && value !== null) {
        // Diğer alanlar için normal filtreleme
        filteredData[key] = value;
      }
    });

    const response = await axiosClient.put(`/api/users/${documentId}`, filteredData);
    return response.data;
  }

  public async deleteUser(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/users/${documentId}`);
  }

  public async blockUser(documentId: string): Promise<StrapiResponse<StrapiUser>> {
    // Önce güncelle
    await axiosClient.put(`/api/users/${documentId}`, {
      blocked: true
    });
    
    // Sonra güncel veriyi çek
    return this.getUser(documentId);
  }

  public async unblockUser(documentId: string): Promise<StrapiResponse<StrapiUser>> {
    // Önce güncelle
    await axiosClient.put(`/api/users/${documentId}`, {
      blocked: false
    });
    
    // Sonra güncel veriyi çek
    return this.getUser(documentId);
  }

  // AHİ-İK toggle metodları
  public async toggleAhiIk(documentId: string, ahiIkMember: boolean): Promise<StrapiResponse<StrapiUser>> {
    // Önce güncelle
    const updateResponse = await axiosClient.put(`/api/users/${documentId}`, {
      ahiIkMember
    });
    
    console.log('PUT response:', updateResponse.data);
    
    // Sonra güncel veriyi çek
    const getUserResponse = await this.getUser(documentId);
    
    console.log('getUser response:', getUserResponse.data);
    
    // Eğer ahiIkMember hala undefined ise, manuel olarak ekle
    if (getUserResponse.data && getUserResponse.data.ahiIkMember === undefined) {
      getUserResponse.data.ahiIkMember = ahiIkMember;
    }
    
    return getUserResponse;
  }
}

export const usersService = UsersService.getInstance();
