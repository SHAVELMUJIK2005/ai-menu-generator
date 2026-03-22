import { apiClient } from './client'

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
  const { data } = await apiClient.post<AuthResponse>('/auth/telegram', { initData })
  return data
}

// временный эндпоинт для разработки без Telegram
export async function authenticateDev(telegramId: number, username: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/dev', { telegramId, username })
  return data
}
