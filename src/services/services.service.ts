import { axiosClient } from '@/libs/axios';

export interface StrapiSEO {
  documentId: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  metaRobots: string;
  canonicalURL?: string;
  metaImage?: {
    id: string;
    url: string;
  };
}

export interface StrapiService {
  documentId: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  image: {
    id: string;
    url: string;
  };
  icon: string;
  isActive: boolean;
  displayOrder: number;
  seo: StrapiSEO;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  title: string;
  description: string;
  content: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  seo: Omit<StrapiSEO, 'documentId'>;
  image: string;
  slug: string;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {
  documentId: string;
}

class ServicesService {
  private static instance: ServicesService;

  private constructor() {}

  public static getInstance(): ServicesService {
    if (!ServicesService.instance) {
      ServicesService.instance = new ServicesService();
    }
    return ServicesService.instance;
  }

  public async getServices(): Promise<StrapiService[]> {
    const response = await axiosClient.get('/api/services', {
      params: {
        populate: ['image', 'seo', 'seo.metaImage'],
        order: ['displayOrder:asc']
      }
    });
    return response.data.data;
  }

  public async getService(documentId: string): Promise<StrapiService> {
    const response = await axiosClient.get(`/api/services/${documentId}`, {
      params: {
        populate: ['image', 'seo', 'seo.metaImage']
      }
    });
    return response.data.data;
  }

  public async createService(data: CreateServiceDTO): Promise<StrapiService> {
    const response = await axiosClient.post('/api/services', { data });
    return response.data.data;
  }

  public async updateService(data: UpdateServiceDTO): Promise<StrapiService> {
    const { documentId, ...rest } = data;

    // Boş değerleri temizle
    const cleanData = Object.entries(rest).reduce((acc, [key, value]) => {
      // SEO objesi için özel kontrol
      if (key === 'seo' && value) {
        const cleanSeo = Object.entries(value).reduce((seoAcc, [seoKey, seoValue]) => {
          if (seoValue !== '' && seoValue !== undefined && seoValue !== null) {
            return { ...seoAcc, [seoKey]: seoValue };
          }
          return seoAcc;
        }, {});

        // SEO objesi boş değilse ekle
        if (Object.keys(cleanSeo).length > 0) {
          return { ...acc, [key]: cleanSeo };
        }
        return acc;
      }

      // Diğer alanlar için kontrol
      if (value !== '' && value !== undefined && value !== null) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});

    const response = await axiosClient.put(`/api/services/${documentId}`, {
      data: cleanData
    });
    return response.data.data;
  }

  public async deleteService(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/services/${documentId}`);
  }
}

export const servicesService = ServicesService.getInstance();
