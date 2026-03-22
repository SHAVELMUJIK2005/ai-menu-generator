import { useCallback } from 'react'

// Безопасный доступ к Telegram WebApp API
const tg = () =>
  (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp

interface TelegramWebApp {
  initData?: string
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  BackButton?: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
  expand?: () => void
  ready?: () => void
  close?: () => void
}

/** Запустить приложение в полноэкранном режиме и сообщить TG о готовности */
export function useTelegramReady() {
  const init = useCallback(() => {
    const app = tg()
    app?.expand?.()
    app?.ready?.()
  }, [])
  return init
}

/** Тактильная обратная связь */
export function useHaptic() {
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    tg()?.HapticFeedback?.impactOccurred(style)
  }, [])

  const success = useCallback(() => {
    tg()?.HapticFeedback?.notificationOccurred('success')
  }, [])

  const error = useCallback(() => {
    tg()?.HapticFeedback?.notificationOccurred('error')
  }, [])

  const selection = useCallback(() => {
    tg()?.HapticFeedback?.selectionChanged()
  }, [])

  return { impact, success, error, selection }
}

/** initData для авторизации через Telegram */
export function getTelegramInitData(): string | undefined {
  return tg()?.initData
}
