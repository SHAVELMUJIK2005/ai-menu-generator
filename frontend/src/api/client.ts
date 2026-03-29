import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

// добавляем Bearer token из localStorage перед каждым запросом
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// при 401 — пробуем обновить токен, иначе чистим
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      localStorage.removeItem('access_token')
      window.location.reload()
      return Promise.reject(err)
    }

    if (isRefreshing) {
      // Ставим запрос в очередь пока идёт обновление токена
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/auth/refresh`,
        { refreshToken },
      )
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)

      refreshQueue.forEach((cb) => cb(data.accessToken))
      refreshQueue = []

      original.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(original)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Токены протухли — перезагружаем чтобы Telegram выдал новый initData
      window.location.reload()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)
