import { type ReactNode } from 'react'

interface LiquidCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
}

export default function LiquidCard({ children, className = '', onClick, selected }: LiquidCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 transition-all duration-200 ${className}`}
      style={{
        background: selected
          ? 'rgba(76, 175, 80, 0.15)'
          : 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: selected ? '2px solid #4CAF50' : '1.5px solid rgba(255,255,255,0.5)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  )
}
