import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'AI анализирует ваш профиль...',
  'Подбираем продукты...',
  'Считаем бюджет...',
  'Составляем рацион...',
  'Финальная проверка...',
]

export default function GeneratingPage() {
  const navigate = useNavigate()
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // меняем текст каждые 2 секунды
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2000)

    // фейковый прогресс 30 сек до 90%
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const fakeProgress = Math.min(90, (elapsed / 30) * 90)
      setProgress(fakeProgress)
    }, 200)

    // через 4 сек — переходим (мок, без реального API)
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => navigate('/menu'), 400)
    }, 4000)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [navigate])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-10 p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* пульсирующий круг */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full"
          style={{ background: 'rgba(76, 175, 80, 0.2)' }}
        />
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          className="absolute w-20 h-20 rounded-full"
          style={{ background: 'rgba(76, 175, 80, 0.4)' }}
        />
        <div
          className="absolute w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'var(--color-primary)' }}
        >
          🤖
        </div>
      </div>

      {/* сменяемый текст */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-base font-medium text-center"
          style={{ color: 'var(--color-text)' }}
        >
          {MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>

      {/* прогресс-бар */}
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-primary)', width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
