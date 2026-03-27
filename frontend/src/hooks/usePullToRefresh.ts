import { useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number // px чтобы сработало
}

/**
 * Pull-to-refresh: потянуть вниз для обновления.
 * Возвращает { isPulling, pullProgress (0-1), isRefreshing }
 */
export function usePullToRefresh({ onRefresh, threshold = 72 }: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0) // 0..1
  const [isRefreshing, setIsRefreshing] = useState(false)

  const startY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = containerRef.current ?? document.documentElement

    const handleTouchStart = (e: TouchEvent) => {
      // Срабатываем только если в самом верху страницы
      if ((containerRef.current?.scrollTop ?? window.scrollY) > 0) return
      startY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null || isRefreshing) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) {
        setIsPulling(false)
        setPullProgress(0)
        return
      }
      setIsPulling(true)
      setPullProgress(Math.min(dy / threshold, 1))
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return
      if (pullProgress >= 1) {
        setIsRefreshing(true)
        setIsPulling(false)
        setPullProgress(0)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      } else {
        setIsPulling(false)
        setPullProgress(0)
      }
      startY.current = null
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullProgress, isRefreshing, onRefresh, threshold])

  return { containerRef, isPulling, pullProgress, isRefreshing }
}
