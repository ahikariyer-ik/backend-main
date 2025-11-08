import { axiosClient } from '@/libs/axios'

export interface ReferenceData {
  id: number
  key: string
  name: string
}

export interface StrapiCompany {
  id: number
  documentId: string
  companyName: string
  addressFull: string
  city: string
  district: string
  phone: string
  email: string
  isFrozen: boolean | null
  companyAbout: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiJobListing {
  id: number
  documentId: string
  title: string
  description: string
  profession: ReferenceData
  city: string
  district: string
  requiredQualifications: string
  jobNature: string
  department: ReferenceData
  work_mode: ReferenceData
  position: ReferenceData
  employmentType: string
  disabilityFriendly: boolean
  minAge: number
  maxAge: number
  educationRequirement: string
  publicationEndDate: string
  jobStatus: 'Active' | 'Expired' | 'Pending'
  applicationCount: number
  gender: string
  contactEmail: string
  contactPhone: string
  company: StrapiCompany
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface UpdateJobListingDTO {
  title: string
  description: string
  profession: string
  city: string
  district: string
  requiredQualifications: string
  jobNature: string
  department: string
  work_mode: string
  position: string
  employmentType: string
  disabilityFriendly: boolean
  minAge: number
  maxAge: number
  educationRequirement: string
  publicationEndDate: string
  jobStatus: 'Active' | 'Expired' | 'Pending'
  gender: string
  contactEmail: string
  contactPhone: string
  company: string
}

class JobListingService {
  private static instance: JobListingService

  private constructor() {}

  public static getInstance(): JobListingService {
    if (!JobListingService.instance) {
      JobListingService.instance = new JobListingService()
    }
    return JobListingService.instance
  }

  public async getReferenceData(): Promise<{
    positions: ReferenceData[]
    departments: ReferenceData[]
    workModes: ReferenceData[]
    professions: ReferenceData[]
  }> {
    const [positionsRes, departmentsRes, workModesRes, professionsRes] = await Promise.all([
      axiosClient.get('/api/positions'),
      axiosClient.get('/api/departments'),
      axiosClient.get('/api/work-modes'),
      axiosClient.get('/api/professions'),
    ])

    return {
      positions: positionsRes.data.data,
      departments: departmentsRes.data.data,
      workModes: workModesRes.data.data,
      professions: professionsRes.data.data,
    }
  }

  public async getCompanies(): Promise<StrapiCompany[]> {
    const response = await axiosClient.get('/api/company-profiles')
    return response.data.data
  }

  public async getJobListings(): Promise<StrapiJobListing[]> {
    const response = await axiosClient.get('/api/job-listings?populate=*')
    return response.data.data
  }

  public async createJobListing(data: UpdateJobListingDTO): Promise<StrapiJobListing> {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        return { ...acc, [key]: value }
      }
      return acc
    }, {})

    const response = await axiosClient.post('/api/job-listings', {
      data: cleanData,
    })
    return response.data.data
  }

  public async updateJobStatus(jobId: number, status: 'Active' | 'Pending'): Promise<void> {
    await axiosClient.put(`/api/job-listings/${jobId}`, {
      data: {
        jobStatus: status,
      },
    })
  }
}

export const jobListingService = JobListingService.getInstance()
