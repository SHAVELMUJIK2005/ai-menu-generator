import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// Используем голый axios (без apiClient) чтобы 401 от auth-эндпоинта
// не попал в refresh-перехватчик и не вызвал бесконечную перезагрузку
const authHttp = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    telegramId: string
    username?: string
    isPremium: boolean
  }
}

export async function authenticateWithTelegram(initData: string): Promise<AuthResponse> {
  const { data } = await authHttp.post<AuthResponse>('/auth/telegram', { initData })
  return data
}

// временный эндпоинт для разработки без Telegram
export async function authenticateDev(telegramId: number, username: string): Promise<AuthResponse> {
  const { data } = await authHttp.post<AuthResponse>('/auth/dev', { telegramId, username })
  return data
}
