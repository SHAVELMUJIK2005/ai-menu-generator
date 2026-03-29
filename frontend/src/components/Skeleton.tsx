import { type CSSProperties } from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: string
  style?: CSSProperties
}

/** Универсальный skeleton-блок с pulse-анимацией */
export function Skeleton({ width, height, className = '', rounded = 'rounded-xl', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse ${rounded} ${className}`}
      style={{
        width,
        height,
        background: 'rgba(0,0,0,0.07)',
        ...style,
      }}
    />
  )
}

/** Skeleton-карточка меню */
export function MenuCardSkeleton() {
  return (
    <div
      className="p-4 rounded-2xl animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <Skeleton width={120} height={14} className="mb-2" />
          <Skeleton width={160} height={11} />
        </div>
        <Skeleton width={56} height={22} rounded="rounded-full" />
      </div>
      <Skeleton width="100%" height={36} className="mb-2" rounded="rounded-xl" />
      <Skeleton width="80%" height={36} rounded="rounded-xl" />
    </div>
  )
}

/** Skeleton для строки статистики */
export function StatSkeleton() {
  return (
    <div
      className="rounded-2xl p-3 text-center animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid rgba(255,255,255,0.5)',
      }}
    >
      <Skeleton width={32} height={24} className="mx-auto mb-1" />
      <Skeleton width={56} height={11} className="mx-auto" />
    </div>
  )
}

/** Skeleton для блюда в меню */
export function MealSkeleton() {
  return (
    <div
      className="p-4 rounded-2xl animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex gap-3">
        <Skeleton width={48} height={48} rounded="rounded-xl" style={{ flexShrink: 0 }} />
        <div className="flex-1">
          <Skeleton width="70%" height={14} className="mb-2" />
          <Skeleton width="50%" height={11} className="mb-1" />
          <Skeleton width="60%" height={11} />
        </div>
      </div>
    </div>
  )
}
