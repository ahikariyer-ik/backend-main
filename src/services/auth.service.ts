import { NextResponse } from 'next/server';

import Cookies from 'js-cookie'

import { axiosClient } from '@/libs/axios'

export interface StrapiRole {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: 'employee' | 'authenticated' | 'worker';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiSector {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiMediaFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes?: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface StrapiCompanyProfile {
  id: number;
  documentId: string;
  companyName: string;
  logo?: StrapiMedia;
  addressFull?: string;
  city?: string;
  district?: string;
  phone?: string;
  email: string;
  isFrozen?: boolean;
  locale: string | null;
  sector?: {
    id: number;
    name: string;
  };
  companyGallery?: StrapiMedia[];
  companyAbout?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  ahiIkMember?: boolean; // AHİ-İK sistemine kayıtlı mı?
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  role?: StrapiRole;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export class AuthService {
  private static instance: AuthService
  private user: StrapiUser | null = null
  private companyProfile: StrapiCompanyProfile | null = null
  private token: string | null = null

  private constructor() {
    this.initializeFromStorage()
  }

  private async initializeFromStorage(): Promise<void> {
    const cookieToken = Cookies.get('token')

    this.token = cookieToken || null

    if (this.token) {
      try {
        // Token varsa önce localStorage'dan verileri yükle
        const userStr = localStorage.getItem('user')
        const companyProfileStr = localStorage.getItem('companyProfile')

        if (userStr) {
          this.user = JSON.parse(userStr)
        }

        if (companyProfileStr) {
          this.companyProfile = JSON.parse(companyProfileStr)
        }

        // Sonra güncel verileri çek
        await this.checkAuth()
      } catch (error) {
        console.error('Initial auth check failed:', error)
        this.clearAuth()
      }
    }
  }

  private clearAuth(): void {
    this.token = null
    this.user = null
    this.companyProfile = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('companyProfile')
    Cookies.remove('token')
    Cookies.remove('user')
    delete axiosClient.defaults.headers.common['Authorization']
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }


    return AuthService.instance
  }

  public getUser(): StrapiUser | null {
    return this.user
  }

  public getCompanyProfile(): StrapiCompanyProfile | null {
    return this.companyProfile
  }

  public get isAuthenticated(): boolean {
    // blocked kontrolü kaldırıldı - AHİ-İK şirketleri (blocked=true) de giriş yapabilmeli
    // blocked sadece menü erişimini kontrol eder
    return !!this.token && !!this.user && this.user.confirmed
  }

  public isEmployee(): boolean {
    return this.user?.role?.type === 'employee'
  }

  public isCompany(): boolean {
    return this.user?.role?.type === 'authenticated'
  }

  public isWorker(): boolean {
    return this.user?.role?.type === 'worker'
  }

  public isAhiIk(): boolean {
    // Şirket ve ahiIkMember=true ise AHİ-İK'ya tanımlı
    return this.isCompany() && this.user?.ahiIkMember === true
  }

  private async fetchCompanyProfile(): Promise<void> {
    if (!this.isCompany() || !this.user) return

    try {
      const response = await axiosClient.get<{ data: StrapiCompanyProfile[] }>('/api/company-profiles')

      if (response.data.data?.[0]) {
        this.companyProfile = response.data.data[0]
        localStorage.setItem('companyProfile', JSON.stringify(this.companyProfile))
      }
    } catch (error) {
      console.error('Fetch company profile failed:', error)
    }
  }

  public async login(identifier: string, password: string): Promise<void> {
    try {
      const response = await axiosClient.post<AuthResponse>('/api/auth/local', {
        identifier,
        password
      })

      this.token = response.data.jwt
      this.user = response.data.user

      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
      Cookies.set('token', this.token, { expires: 1 })
      Cookies.set('user', JSON.stringify(this.user), { expires: 1 })

      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

      await this.checkAuth()
    } catch (error: any) {
      console.error('Login failed:', error)

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }

      throw error
    }
  }

  public async registerCompany(username: string, email: string, password: string): Promise<void> {
    try {
      const response = await axiosClient.post<AuthResponse>('/api/auth/local/register', {
        username,
        email,
        password
      })

      this.token = response.data.jwt
      this.user = response.data.user

      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
      Cookies.set('token', this.token, { expires: 1 })
      Cookies.set('user', JSON.stringify(this.user), { expires: 1 })

      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

      await this.checkAuth()
    } catch (error: any) {
      console.error('Register failed:', error)

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }

      throw error
    }
  }

  public async logout(): Promise<void> {
    try {
      this.clearAuth()
    } catch (error) {
      console.error('Logout failed:', error)
      this.clearAuth()
      throw error
    }
  }

  public async checkAuth(): Promise<void> {
    try {
      if (!this.token) {
        throw new Error('No token found')
      }

      const response = await axiosClient.get<StrapiUser>('/api/users/me', {
        params: {
          populate: ['role']
        }
      })

      this.user = response.data
      localStorage.setItem('user', JSON.stringify(this.user))
      Cookies.set('user', JSON.stringify(this.user), { expires: 1 })

      if (this.isCompany()) {
        await this.fetchCompanyProfile()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      this.clearAuth()
      throw error
    }
  }

  public get canManageJobs(): boolean {
    return this.isAuthenticated && (this.isEmployee() || this.isCompany())
  }

  public get canManageUsers(): boolean {
    return this.isEmployee()
  }

  public get canManageApplications(): boolean {
    return this.isAuthenticated && (this.isEmployee() || this.isCompany())
  }

  public get canManageProfile(): boolean {
    return this.isAuthenticated
  }

  public getDashboardUrl(): string {
    if (this.isEmployee()) {
      return '/employee-dashboard'
    } else if (this.isCompany() || this.isAhiIk()) {
      return '/statistics'
    } else if (this.isWorker()) {
      return '/worker-dashboard'
    }

    return '/'
  }
}

export const authService = AuthService.getInstance()
