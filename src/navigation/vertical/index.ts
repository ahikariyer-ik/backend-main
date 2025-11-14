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
  // Şirket Ana Sayfa (Statistics) - Tüm şirketler için
  {
    title: 'Ana Sayfa',
    icon: 'tabler-home',
    path: '/statistics',
    visible: () => !authService.isWorker() && (authService.isCompany() || authService.isAhiIk())
  },
  
  // Çalışan (Worker) Menüsü
  {
    title: 'Ana Sayfa',
    icon: 'tabler-home',
    path: '/worker-dashboard',
    visible: () => authService.isWorker()
  },
  {
    title: 'QR Giriş/Çıkış',
    icon: 'tabler-scan',
    path: '/worker-pdks-scan',
    visible: () => authService.isWorker()
  },
  {
    title: 'İzin Taleplerim',
    icon: 'tabler-calendar',
    path: '/worker-leave-requests',
    visible: () => authService.isWorker()
  },
  {
    title: 'Görevlerim',
    icon: 'tabler-clipboard-list',
    path: '/worker-tasks',
    visible: () => authService.isWorker()
  },
  
  // Admin/Employee Menüsü (Worker bu menüleri GÖREMEMELİ!)
  {
    title: 'Sayfalar',
    icon: 'tabler-file',
    path: '/pages',
    visible: () => !authService.isWorker() && authService.isEmployee(),
    children: [
      {
        title: 'Hakkımızda',
        icon: 'tabler-file',
        path: '/pages/about',
        visible: () => authService.isEmployee()
      },
      {
        title: 'İletişim',
        icon: 'tabler-file',
        path: '/pages/contact',
        visible: () => authService.isEmployee()
      },
      {
        title: 'Blog',
        icon: 'tabler-file',
        path: '/pages/blog',
        visible: () => authService.isEmployee()
      },
      {
        title: 'Blog Post',
        icon: 'tabler-file',
        path: '/pages/blog-post/list',
        visible: () => authService.isEmployee()
      }
    ]
  },
  {
    title: 'Özellikler',
    icon: 'tabler-list',
    path: '/datas',
    visible: () => !authService.isWorker() && authService.isEmployee(),
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
    visible: () => !authService.isWorker() && authService.isEmployee(),
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
    title: 'İnsan Kaynakları',
    icon: 'tabler-users',
    path: '/digital-hr',
    visible: () => !authService.isWorker() && (authService.isAhiIk() || authService.isEmployee()),
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
    title: 'Kurum Yönetimi',
    icon: 'tabler-building-community',
    path: '/institution-management',
    visible: () => !authService.isWorker() && authService.isAhiIk(),
    children: [
      {
        title: 'Kurumlarım',
        icon: 'tabler-building',
        path: '/institution-management/institutions',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Konutlarım',
        icon: 'tabler-home',
        path: '/institution-management/properties',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Araçlarım',
        icon: 'tabler-car',
        path: '/institution-management/vehicles',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Kararlar',
        icon: 'tabler-clipboard-text',
        path: '/institution-management/decisions',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Giden Evraklar',
        icon: 'tabler-file-export',
        path: '/institution-management/outgoing-documents',
        visible: () => authService.isAhiIk()
      },
      {
        title: 'Gelen Evraklar',
        icon: 'tabler-file-import',
        path: '/institution-management/incoming-documents',
        visible: () => authService.isAhiIk()
      }
    ]
  },
  {
    title: 'Satın Alma',
    icon: 'tabler-shopping-cart',
    path: '/institution-management/purchasings',
    visible: () => !authService.isWorker() && authService.isAhiIk()
  },
  {
    title: 'Anımsatıcılar',
    icon: 'tabler-bell',
    path: '/institution-management/reminders',
    visible: () => !authService.isWorker() && authService.isAhiIk()
  },
  {
    title: 'Kullanıcı Yönetim',
    icon: 'tabler-users',
    path: '/users',
    visible: () => !authService.isWorker() && authService.isEmployee(),
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
    visible: () => !authService.isWorker() && authService.isEmployee()
  }
]

export default getNavigation
