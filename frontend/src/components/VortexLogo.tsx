import { motion } from 'framer-motion'

interface VortexLogoProps {
  size?: number
  animate?: boolean
}

// Одно лезвие вихря: изгибается от центра наружу и обратно
const ARM =
  'M 50 50 C 53 40, 63 34, 71 39 C 79 44, 79 56, 71 61 C 63 66, 53 60, 50 50 Z'

export default function VortexLogo({ size = 80, animate = true }: VortexLogoProps) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={animate ? { rotate: [0, 360, 360] } : undefined}
      transition={
        animate
          ? {
              duration: 3.8,
              times: [0, 0.4, 1], // 40% — вращение, 60% — пауза
              ease: ['circOut', 'linear'],
              repeat: Infinity,
            }
          : undefined
      }
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Тонкое кольцо */}
        <circle cx="50" cy="50" r="44" stroke="#4CAF50" strokeWidth="1.5" opacity="0.18" />

        {/* Три лезвия вихря */}
        <path d={ARM} fill="#4CAF50" />
        <path d={ARM} fill="#4CAF50" transform="rotate(120, 50, 50)" />
        <path d={ARM} fill="#4CAF50" transform="rotate(240, 50, 50)" />

        {/* Центральная точка */}
        <circle cx="50" cy="50" r="6" fill="#2E7D32" />
      </svg>
    </motion.div>
  )
}
