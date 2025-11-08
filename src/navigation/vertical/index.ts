'use client'

import { authService } from '@/services/auth.service'

interface MenuItem {
  title: string
  icon: string
  path: string
  children?: MenuItem[]
  visible?: () => boolean
}

const getNavigation = (): MenuItem[] => [
  {
    title: 'Dashboard',
    icon: 'tabler-dashboard',
    path: '/company-dashboard',
    visible: () => authService.isCompany()
  },
  {
    title: 'Dashboard',
    icon: 'tabler-dashboard',
    path: '/employee-dashboard',
    visible: () => authService.isEmployee()
  },
  {
    title: 'Dashboard',
    icon: 'tabler-dashboard',
    path: '/worker-dashboard',
    visible: () => authService.isWorker()
  },
  {
    title: 'Sayfalar',
    icon: 'tabler-file',
    path: '/pages',
    visible: () => authService.isEmployee(),
    children: [
      {
        title: 'Hakkımızda',
        icon: 'tabler-file',
        path: '/pages/about'
      },
      {
        title: 'İletişim',
        icon: 'tabler-file',
        path: '/pages/contact'
      },
      {
        title: 'Blog',
        icon: 'tabler-file',
        path: '/pages/blog'
      },
      {
        title: 'Blog Post',
        icon: 'tabler-file',
        path: '/pages/blog-post/list'
      }
    ]
  },
  {
    title: 'Özellikler',
    icon: 'tabler-list',
    path: '/datas',
    visible: () => authService.isEmployee(),
    children: [
      {
        title: 'Sektörler',
        icon: 'tabler-file',
        path: '/datas/sectors/list'
      },
      {
        title: 'Meslekler',
        icon: 'tabler-file',
        path: '/datas/professions/list'
      },
      {
        title: 'Pozisyonlar',
        icon: 'tabler-file',
        path: '/datas/positions/list'
      },
      {
        title: 'Departmanlar',
        icon: 'tabler-file',
        path: '/datas/departments/list'
      },
      {
        title: 'Çalışma Türleri',
        icon: 'tabler-file',
        path: '/datas/work-modes/list'
      }
    ]
  },
  {
    title: 'Hizmetler',
    icon: 'tabler-briefcase',
    path: '/services',
    visible: () => authService.isEmployee(),
    children: [
      {
        title: 'Hizmet Listesi',
        icon: 'tabler-list',
        path: '/services/list',
        visible: () => authService.isEmployee()
      },
      {
        title: 'Yeni Hizmet',
        icon: 'tabler-plus',
        path: '/services/create',
        visible: () => authService.isEmployee()
      }
    ]
  },
  {
    title: 'AHİ-İK',
    icon: 'tabler-users',
    path: '/digital-hr',
    visible: () => authService.isAhiIk() || authService.isEmployee(),
    children: [
      {
        title: 'Dijital İK',
        icon: 'tabler-file-check',
        path: '/digital-hr',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Çalışanlarım',
        icon: 'tabler-users',
        path: '/workers/list',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'İşten Ayrılanlar',
        icon: 'tabler-user-off',
        path: '/workers/terminated',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Şirketler',
        icon: 'tabler-building',
        path: '/digital-hr/companies',
        visible: () => authService.isEmployee() // Sadece employee görsün
      },
      {
        title: 'PDKS',
        icon: 'tabler-clock',
        path: '/pdks',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'İzin Takip Sistemi',
        icon: 'tabler-calendar',
        path: '/leave-tracking',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Görev Yönetimi',
        icon: 'tabler-clipboard-list',
        path: '/tasks',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Şubelerim',
        icon: 'tabler-building-store',
        path: '/branches',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Departmanlarım',
        icon: 'tabler-briefcase',
        path: '/departments',
        visible: () => authService.isAhiIk()
      }
    ]
  },
  {
    title: 'Kullanıcı Yönetim',
    icon: 'tabler-users',
    path: '/users',
    visible: () => authService.isEmployee(),
    children: [
      {
        title: 'Kullanıcılar',
        icon: 'tabler-list',
        path: '/users/list'
      },
      {
        title: 'Yeni Kullanıcı',
        icon: 'tabler-plus',
        path: '/users/create'
      }
    ]
  },
  {
    title: 'Demo Taleplerim',
    icon: 'tabler-phone-call',
    path: '/demo-requests',
    visible: () => authService.isEmployee()
  }
]

export default getNavigation
