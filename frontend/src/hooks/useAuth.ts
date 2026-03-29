import { useEffect, useState } from 'react'
import { authenticateDev, authenticateWithTelegram } from '../api/auth'
import { getTelegramInitData } from './useTelegram'

let authInProgress = false

export function useAuth() {
  const [isReady, setIsReady] = useState(() => !!localStorage.getItem('access_token'))
  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    if (isReady || authInProgress) return

    authInProgress = true

    const run = async () => {
      try {
        let res

        const initData = getTelegramInitData()

        if (initData) {
          res = await authenticateWithTelegram(initData)
        } else {
          // Локальная разработка: dev-auth по VITE_DEV_TELEGRAM_ID
          const devId = Number(import.meta.env.VITE_DEV_TELEGRAM_ID ?? 123456789)
          const devName = (import.meta.env.VITE_DEV_USERNAME as string | undefined) ?? 'dev_user'
          res = await authenticateDev(devId, devName)
        }

        localStorage.setItem('access_token', res.accessToken)
        localStorage.setItem('refresh_token', res.refreshToken)
        setAuthFailed(false)
        setIsReady(true)
      } catch {
        setAuthFailed(true)
        // НЕ выставляем isReady=true — приложение не рендерится без токена
      } finally {
        authInProgress = false
      }
    }

    run()
  }, [isReady])

  const retry = () => {
    setAuthFailed(false)
    setIsReady(false)
  }

  return { isReady, authFailed, retry }
}
