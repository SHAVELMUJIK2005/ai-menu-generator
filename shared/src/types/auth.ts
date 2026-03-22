export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  userId: string
  telegramId: string
  username?: string
  displayName?: string
}
