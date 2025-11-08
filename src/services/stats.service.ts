import {axiosClient} from '@/libs/axios';

export interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  recentApplications: {
    id: string;
    jobTitle: string;
    applicantName: string;
    appliedAt: string;
  }[];
}

export interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  recentCompanies: {
    id: string;
    name: string;
    totalJobs: number;
    isActive: boolean;
  }[];
}

export const statsService = {
  // Authenticated kullanıcı için
  async getCompanyStats(): Promise<CompanyStats> {
    const response = await axiosClient.get<CompanyStats>('/company/stats');

    return response.data;
  },

  // Employee için
  async getAdminStats(): Promise<AdminStats> {
    const response = await axiosClient.get<AdminStats>('/admin/stats');

    return response.data;
  }
}; 