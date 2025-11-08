import { axiosClient } from '@/libs/axios';

export interface FAQItem {
  id?: number;
  question: string;
  answer: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  metaRobots: string;
  canonicalURL?: string;
  metaImage?: {
    id: string;
    url: string;
  } | null;
}

export interface StrapiAbout {
  id: number;
  documentId: string;
  title: string;
  content: string;
  faqs: FAQItem[];
  contact_title: string;
  contact_description: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface UpdateAboutDTO {
  title?: string;
  content: string;
  faqs: FAQItem[];
  contact_title?: string;
  contact_description?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords?: string;
    metaRobots: string;
    canonicalURL?: string;
    metaImage?: string | undefined;
  };
}

class AboutService {
  private static instance: AboutService;

  private constructor() {}

  public static getInstance(): AboutService {
    if (!AboutService.instance) {
      AboutService.instance = new AboutService();
    }
    return AboutService.instance;
  }

  public async getAbout(): Promise<StrapiAbout> {
    const response = await axiosClient.get('/api/about-page', {
      params: {
        populate: ['seo', 'seo.metaImage', 'faqs'],
      },
    });
    return response.data.data;
  }

  public async updateAbout(data: UpdateAboutDTO): Promise<StrapiAbout> {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (key === 'seo' && value) {
        const cleanSeo = Object.entries(value).reduce((seoAcc, [seoKey, seoValue]) => {
          if (seoValue !== '' && seoValue !== undefined && seoValue !== null) {
            return { ...seoAcc, [seoKey]: seoValue };
          }
          return seoAcc;
        }, {});

        if (Object.keys(cleanSeo).length > 0) {
          return { ...acc, [key]: cleanSeo };
        }
        return acc;
      }

      if (key === 'faqs' && Array.isArray(value)) {
        const cleanFaqs = value
          .map(faq => {
            const { id, ...rest } = faq;
            const cleanFaq = Object.entries(rest).reduce((faqAcc, [faqKey, faqValue]) => {
              if (faqValue !== '' && faqValue !== undefined && faqValue !== null) {
                return { ...faqAcc, [faqKey]: faqValue };
              }
              return faqAcc;
            }, {});
            return Object.keys(cleanFaq).length > 0 ? cleanFaq : null;
          })
          .filter(faq => faq !== null);
      
        if (cleanFaqs.length > 0) {
          return { ...acc, [key]: cleanFaqs };
        }
        return acc;
      }

      if (value !== '' && value !== undefined && value !== null) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});

    const response = await axiosClient.put('/api/about-page', {
      data: cleanData,
    });
    return response.data.data;
  }
}

export const aboutService = AboutService.getInstance();
