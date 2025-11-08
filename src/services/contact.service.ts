import { axiosClient } from '@/libs/axios';

export interface StrapiContact {
  documentId: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  mapLat?: number;
  mapLng?: number;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  weekdayHours?: string;
  weekendHours?: string;
  isWeekendOpen?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords?: string;
    metaRobots: string;
    canonicalURL?: string;
    metaImage?: {
      id: string;
      url: string;
    };
  };
}

export interface UpdateContactDTO {
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  mapLat?: number;
  mapLng?: number;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  weekdayHours?: string;
  weekendHours?: string;
  isWeekendOpen?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords?: string;
    metaRobots: string;
    canonicalURL?: string;
    metaImage?: string;
  };
}

class ContactService {
  private static instance: ContactService;

  private constructor() {}

  public static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  public async getContact(): Promise<StrapiContact> {
    const response = await axiosClient.get('/api/contact', {
      params: {
        populate: ['seo', 'seo.metaImage']
      }
    });
    return response.data.data;
  }

  public async updateContact(data: UpdateContactDTO): Promise<StrapiContact> {
    // Boş değerleri temizle
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
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

    const response = await axiosClient.put('/api/contact', {
      data: cleanData
    });
    return response.data.data;
  }
}

export const contactService = ContactService.getInstance();
