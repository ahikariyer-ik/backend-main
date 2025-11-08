import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const axiosFileClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Auth endpoint'lerinde Authorization göndermeyelim
    const url = config.url || ''
    const isAuthEndpoint = /\/auth\//.test(url)

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else if (config.headers && 'Authorization' in config.headers) {
      delete (config.headers as any).Authorization
    }


    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosFileClient.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const isAuthEndpoint = /\/auth\//.test(url)

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else if (config.headers && 'Authorization' in config.headers) {
      delete (config.headers as any).Authorization
    }


    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 401 hatası durumunda login sayfasına yönlendir
    if (error.response?.status === 401) {
      // localStorage.removeItem('token')
      // localStorage.removeItem('user')
      // window.location.href = '/auth/login'
    }


    return Promise.reject(error)
  }
)

export { axiosClient, axiosFileClient }
