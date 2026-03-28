import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AvocadoMascot from '../components/AvocadoMascot'
import { useMenuStore } from '../store/menuStore'
import { getMenuHistory } from '../api/menu'

export default function SplashPage() {
  const navigate = useNavigate()
  const { currentMenuId, setMenu } = useMenuStore()
  const splashDone = useRef(false)
  const restoreDone = useRef(false)

  const tryNavigate = useRef(() => {})
  tryNavigate.current = () => {
    if (!splashDone.current || !restoreDone.current) return
    const done = localStorage.getItem('onboarding_done')
    const { currentMenuId: id } = useMenuStore.getState()
    if (!done) navigate('/onboarding')
    else if (id) navigate('/menu')
    else navigate('/budget')
  }

  // Восстанавливаем последнее меню с сервера если в store пусто
  useEffect(() => {
    if (currentMenuId) {
      restoreDone.current = true
      tryNavigate.current()
      return
    }
    getMenuHistory(1, 1)
      .then((data) => {
        const latest = data?.items?.[0]
        if (latest?.parsedMenu) setMenu(latest.parsedMenu, latest.id)
      })
      .catch(() => {})
      .finally(() => {
        restoreDone.current = true
        tryNavigate.current()
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Минимальное время splash-экрана
  useEffect(() => {
    const timer = setTimeout(() => {
      splashDone.current = true
      tryNavigate.current()
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <AvocadoMascot size={100} animate expression="happy" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold"
        style={{ color: 'var(--color-text)' }}
      >
        AI Menu Generator
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-gray-400"
      >
        Персональное меню за 30 секунд
      </motion.p>

      {/* индикатор загрузки */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex gap-1.5 mt-4"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-primary)' }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

