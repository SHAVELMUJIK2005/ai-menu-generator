import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorScreen from '../components/ErrorScreen'
import AvocadoMascot from '../components/AvocadoMascot'
import { useMenuJob } from '../hooks/useMenu'
import { useMenuStore } from '../store/menuStore'
import { useOnboardingStore } from '../store/onboardingStore'

const MESSAGES = [
  'AI анализирует ваш профиль...',
  'Подбираем продукты...',
  'Считаем бюджет...',
  'Составляем рацион...',
  'Финальная проверка...',
]

const REROLL_MESSAGES = [
  'Анализируем предыдущее меню...',
  'Ищем новые рецепты...',
  'Считаем бюджет...',
  'Составляем новый рацион...',
  'Финальная проверка...',
]

export default function GeneratingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { mode?: string; menuId?: string } | null
  const isRerollMode = state?.mode === 'reroll'
  const rerollMenuId = state?.menuId ?? ''

  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<'network' | 'generation' | 'limit' | null>(null)
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const navigatedRef = useRef(false)

  const { startGenerate, startReroll, menuData, menuStatus, error: jobError } = useMenuJob()
  const { setMenu, budget } = useMenuStore()
  const { profileType, goal, storeChain, dislikedProducts } = useOnboardingStore()

  const messages = isRerollMode ? REROLL_MESSAGES : MESSAGES

  const clearIntervals = () => {
    intervalsRef.current.forEach(clearInterval)
    intervalsRef.current = []
  }

  const startAnimations = () => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 2000)

    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setProgress(Math.min(90, (elapsed / 30) * 90))
    }, 200)

    intervalsRef.current = [msgInterval, progressInterval]
  }

  const finishAndNavigate = () => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    clearIntervals()
    setProgress(100)
    setDone(true)
    setTimeout(() => navigate('/menu'), 900)
  }

  useEffect(() => {
    if (menuStatus === 'DONE' && menuData?.parsedMenu) {
      setMenu(menuData.parsedMenu, menuData.id)
      finishAndNavigate()
    } else if (menuStatus === 'DONE' || menuStatus === 'FAILED') {
      clearIntervals()
      setError('generation')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuStatus, menuData])

  useEffect(() => {
    if (jobError) {
      clearIntervals()
      setError('generation')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobError])

  const run = () => {
    if (!navigator.onLine) { setError('network'); return }
    setError(null)
    setProgress(0)
    navigatedRef.current = false
    startAnimations()

    if (isRerollMode && rerollMenuId) {
      startReroll(rerollMenuId)
    } else {
      startGenerate(
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
      )
    }
  }

  useEffect(() => {
    run()
    return clearIntervals
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorScreen type={error} onRetry={run} />

  const showLoading = !done && !error

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-10 p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-36 h-36 rounded-full"
          style={{ background: 'rgba(76, 175, 80, 0.15)' }}
        />
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          className="absolute w-24 h-24 rounded-full"
          style={{ background: 'rgba(76, 175, 80, 0.25)' }}
        />
        <motion.div
          className="absolute"
          animate={done ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AvocadoMascot size={72} animate expression={done ? 'excited' : 'thinking'} />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-base font-semibold text-center"
            style={{ color: 'var(--color-primary)' }}
          >
            ✓ {isRerollMode ? 'Новое меню готово!' : 'Меню готово!'}
          </motion.p>
        ) : showLoading ? (
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium text-center"
            style={{ color: 'var(--color-text)' }}
          >
            {messages[msgIndex]}
          </motion.p>
        ) : null}
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
