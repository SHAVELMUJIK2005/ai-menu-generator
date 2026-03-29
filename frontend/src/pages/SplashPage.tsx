import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AvocadoMascot from '../components/AvocadoMascot'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Ждём чуть дольше чтобы auth успел отработать и animate выглядел хорошо
    const timer = setTimeout(() => {
      const done = localStorage.getItem('onboarding_done')
      if (!done) { navigate('/onboarding'); return }

      // если уже есть сохранённое меню — открываем его сразу
      try {
        const raw = localStorage.getItem('menu-store')
        const saved = raw ? JSON.parse(raw) : null
        if (saved?.state?.currentMenu) { navigate('/menu'); return }
      } catch { /* ignore */ }

      navigate('/budget')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

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

