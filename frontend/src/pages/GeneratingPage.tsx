import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorScreen from '../components/ErrorScreen'
import { useGenerateMenu } from '../hooks/useMenu'
import { useMenuStore } from '../store/menuStore'
import { useOnboardingStore } from '../store/onboardingStore'
import { menuMock } from '../mocks/menuMock'

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
  const [error, setError] = useState<'network' | 'generation' | 'limit' | null>(null)
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  const { mutate: generateMenu } = useGenerateMenu()
  const { setMenu, budget } = useMenuStore()
  const { profileType, goal, storeChain, dislikedProducts } = useOnboardingStore()

  const clearIntervals = () => {
    intervalsRef.current.forEach(clearInterval)
    intervalsRef.current = []
  }

  const startAnimations = () => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2000)

    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setProgress(Math.min(90, (elapsed / 30) * 90))
    }, 200)

    intervalsRef.current = [msgInterval, progressInterval]
  }

  const finishAndNavigate = () => {
    clearIntervals()
    setProgress(100)
    setTimeout(() => navigate('/menu'), 400)
  }

  const run = () => {
    if (!navigator.onLine) { setError('network'); return }
    setError(null)
    setProgress(0)
    startAnimations()

    generateMenu(
      {
        budget,
        days: 3,
        storeChain: storeChain ?? undefined,
        profileType: profileType ?? 'SINGLE',
        goal: goal ?? 'HEALTHY',
        restrictions: [],
        allergies: [],
        dislikedProducts,
      },
      {
        onSuccess: (data) => {
          setMenu(data)
          finishAndNavigate()
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status
          if (status === 429) {
            clearIntervals()
            setError('limit')
            return
          }
          // бэкенд недоступен — используем мок
          setMenu(menuMock)
          finishAndNavigate()
        },
      },
    )
  }

  useEffect(() => {
    run()
    return clearIntervals
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorScreen type={error} onRetry={run} />

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-10 p-6"
      style={{ background: 'var(--color-bg)' }}
    >
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
