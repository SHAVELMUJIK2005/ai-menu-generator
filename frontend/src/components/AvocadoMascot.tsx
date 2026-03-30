import { motion } from 'framer-motion'

interface AvocadoMascotProps {
  size?: number
  animate?: boolean
  expression?: 'happy' | 'thinking' | 'excited'
}

export default function AvocadoMascot({ size = 80, animate = true }: AvocadoMascotProps) {
  return (
    <motion.div
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="appLogoGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EC97A" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="appLogoGradInner" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Фон — скруглённый квадрат */}
        <rect width="80" height="80" rx="20" fill="url(#appLogoGrad)" />

        {/* Глянцевый блик сверху */}
        <rect width="80" height="36" rx="20" fill="url(#appLogoGradInner)" />

        {/* Чаша — нижняя дуга */}
        <path
          d="M 15 51 Q 40 70 65 51"
          stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"
        />
        {/* Чаша — верхний край */}
        <line x1="15" y1="51" x2="65" y2="51" stroke="white" strokeWidth="3" strokeLinecap="round" />

        {/* Пар — три волнистые линии */}
        <path d="M 27 45 C 23 38 31 31 27 24"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />
        <path d="M 40 43 C 36 34 44 27 40 18"
          stroke="white" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 53 45 C 57 38 49 31 53 24"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />

        {/* AI-искра — 4-лучевая звезда (нижний правый угол) */}
        <g transform="translate(63, 63)" opacity="0.8">
          <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  )
}
