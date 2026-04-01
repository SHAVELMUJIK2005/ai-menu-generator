import { useEffect, useState } from 'react'
import { authenticateDev, authenticateWithTelegram } from '../api/auth'
import { getTelegramInitData } from './useTelegram'

let authInProgress = false

export function useAuth() {
  const [isReady, setIsReady] = useState(() => !!localStorage.getItem('access_token'))
  const [authFailed, setAuthFailed] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

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
        // При ошибке авторизации всё равно показываем приложение — может токен уже есть
        setIsReady(true)
      } finally {
        authInProgress = false
      }
    }

    run()
  // retryCount заставляет эффект перезапуститься после retry()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, retryCount])

  const retry = () => {
    authInProgress = false
    setAuthFailed(false)
    setRetryCount((c) => c + 1)
  }

  return { isReady, authFailed, retry }
}
