import { motion } from 'framer-motion'

interface AvocadoMascotProps {
  size?: number
  animate?: boolean
  expression?: 'happy' | 'thinking' | 'excited'
}

export default function AvocadoMascot({ size = 80, animate = true }: AvocadoMascotProps) {
  return (
    <motion.div
      animate={animate ? { y: [0, -7, 0] } : undefined}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Тень под авокадо */}
        <ellipse cx="50" cy="112" rx="22" ry="4" fill="#000" opacity="0.08" />

        {/* Тело — основная тёмно-зелёная форма (грушевидная) */}
        <path
          d="M 50 8 C 28 8 16 28 16 52 C 16 76 30 100 50 100 C 70 100 84 76 84 52 C 84 28 72 8 50 8 Z"
          fill="#33691E"
        />
        {/* Блик на теле */}
        <path
          d="M 38 18 C 30 26 26 38 27 46"
          stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" opacity="0.5"
        />

        {/* Мякоть — светло-жёлтая внутренняя часть */}
        <path
          d="M 50 22 C 34 22 26 38 26 54 C 26 72 36 94 50 94 C 64 94 74 72 74 54 C 74 38 66 22 50 22 Z"
          fill="#C8E6A0"
        />
        {/* Мякоть — чуть желтее в центре */}
        <path
          d="M 50 28 C 37 28 30 42 30 56 C 30 71 38 90 50 90 C 62 90 70 71 70 56 C 70 42 63 28 50 28 Z"
          fill="#DCEDC8"
        />

        {/* Косточка — большая, мультяшная */}
        <ellipse cx="50" cy="66" rx="14" ry="17" fill="#8D6E63" />
        <ellipse cx="50" cy="65" rx="10" ry="13" fill="#A1887F" />
        {/* Блик на косточке */}
        <ellipse cx="45" cy="59" rx="3" ry="4" fill="#BCAAA4" opacity="0.6" />

        {/* Хвостик сверху */}
        <path
          d="M 50 8 C 50 8 46 0 42 2 C 38 4 40 10 44 10"
          fill="#33691E" stroke="#33691E" strokeWidth="1"
        />
        <path
          d="M 50 8 C 50 8 54 0 58 2 C 62 4 60 10 56 10"
          fill="#33691E" stroke="#33691E" strokeWidth="1"
        />
        {/* Основа хвостика */}
        <ellipse cx="50" cy="9" rx="5" ry="4" fill="#558B2F" />

        {/* Глаза — большие мультяшные */}
        <ellipse cx="38" cy="43" rx="7" ry="8" fill="white" />
        <ellipse cx="62" cy="43" rx="7" ry="8" fill="white" />
        {/* Зрачки */}
        <ellipse cx="39" cy="44" rx="4.5" ry="5" fill="#1A1A2E" />
        <ellipse cx="63" cy="44" rx="4.5" ry="5" fill="#1A1A2E" />
        {/* Блики в глазах */}
        <circle cx="41" cy="41" r="1.8" fill="white" />
        <circle cx="65" cy="41" r="1.8" fill="white" />
        <circle cx="38" cy="46" r="1" fill="white" opacity="0.5" />
        <circle cx="62" cy="46" r="1" fill="white" opacity="0.5" />

        {/* Брови — дугообразные, весёлые */}
        <path d="M 32 34 Q 38 30 44 34" stroke="#33691E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 56 34 Q 62 30 68 34" stroke="#33691E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Улыбка */}
        <path d="M 40 54 Q 50 62 60 54" stroke="#33691E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Румянец */}
        <ellipse cx="30" cy="50" rx="5" ry="3.5" fill="#FF8A65" opacity="0.3" />
        <ellipse cx="70" cy="50" rx="5" ry="3.5" fill="#FF8A65" opacity="0.3" />
      </svg>
    </motion.div>
  )
}
