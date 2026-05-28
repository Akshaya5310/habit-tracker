import axios from 'axios'

// Detect if running inside Capacitor native app
const isNative = () => {
  try {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

// Android emulator uses 10.0.2.2 to reach host machine's localhost
const getBaseUrl = () => {
  if (isNative()) {
    // Check if Android or iOS
    const platform = window.Capacitor.getPlatform()
    if (platform === 'android') {
      return 'http://10.0.2.2:7070'
    }
    // iOS simulator can use localhost directly
    return 'http://localhost:7070'
  }
  return ''
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
