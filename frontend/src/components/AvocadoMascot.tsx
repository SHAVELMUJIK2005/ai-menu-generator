import { motion } from 'framer-motion'

interface AvocadoMascotProps {
  size?: number
  animate?: boolean
  expression?: 'happy' | 'thinking' | 'excited'
}

export default function AvocadoMascot({ size = 80, animate = true, expression = 'happy' }: AvocadoMascotProps) {
  const eyeY = expression === 'thinking' ? 38 : 36
  const mouthPath = expression === 'excited'
    ? 'M 34 50 Q 40 56 46 50'
    : expression === 'thinking'
    ? 'M 35 50 Q 40 52 45 50'
    : 'M 34 49 Q 40 55 46 49'

  return (
    <motion.div
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size * 1.25}>
        {/* тело авокадо */}
        <ellipse cx="40" cy="58" rx="28" ry="34" fill="#4CAF50" />
        <ellipse cx="40" cy="52" rx="22" ry="26" fill="#6DBF70" />

        {/* верхняя часть (тёмно-зелёная) */}
        <path d="M 18 45 Q 20 10 40 8 Q 60 10 62 45 Q 55 30 40 28 Q 25 30 18 45 Z" fill="#388E3C" />

        {/* мякоть */}
        <ellipse cx="40" cy="60" rx="18" ry="22" fill="#FFF176" />

        {/* косточка */}
        <ellipse cx="40" cy="62" rx="8" ry="10" fill="#8D6E63" />
        <ellipse cx="40" cy="62" rx="5" ry="7" fill="#A1887F" />

        {/* глаза */}
        <ellipse cx="33" cy={eyeY} rx="3.5" ry={expression === 'thinking' ? 2.5 : 3.5} fill="#1A1A2E" />
        <ellipse cx="47" cy={eyeY} rx="3.5" ry={expression === 'thinking' ? 2.5 : 3.5} fill="#1A1A2E" />
        {/* блик в глазах */}
        <circle cx="34.5" cy={eyeY - 1} r="1" fill="white" />
        <circle cx="48.5" cy={eyeY - 1} r="1" fill="white" />

        {/* рот */}
        <path d={mouthPath} stroke="#1A1A2E" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* румянец */}
        <ellipse cx="27" cy="44" rx="5" ry="3" fill="#FF6B35" opacity="0.25" />
        <ellipse cx="53" cy="44" rx="5" ry="3" fill="#FF6B35" opacity="0.25" />
      </svg>
    </motion.div>
  )
}
