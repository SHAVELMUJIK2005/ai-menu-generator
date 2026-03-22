import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface ErrorScreenProps {
  type: 'network' | 'generation' | 'limit'
  onRetry?: () => void
}

const ERROR_CONFIG = {
  network: {
    emoji: '📡',
    title: 'Нет подключения',
    desc: 'Проверьте интернет и попробуйте снова',
    action: 'Повторить',
  },
  generation: {
    emoji: '🤖',
    title: 'Ошибка генерации',
    desc: 'AI не смог составить меню. Попробуйте ещё раз или измените параметры',
    action: 'Попробовать снова',
  },
  limit: {
    emoji: '⏳',
    title: 'Лимит исчерпан',
    desc: 'Вы использовали 3 бесплатные генерации сегодня. Следующие будут доступны через 5 часов',
    action: 'Понятно',
  },
}

export default function ErrorScreen({ type, onRetry }: ErrorScreenProps) {
  const navigate = useNavigate()
  const cfg = ERROR_CONFIG[type]

  const handleAction = () => {
    if (type === 'limit') navigate('/budget')
    else onRetry?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 gap-6 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="text-6xl"
      >
        {cfg.emoji}
      </motion.div>

      <div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {cfg.title}
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{cfg.desc}</p>
      </div>

      {type === 'limit' && (
        <div
          className="w-full max-w-xs rounded-2xl p-4"
          style={{
            background: 'rgba(255,107,53,0.08)',
            border: '1.5px solid rgba(255,107,53,0.2)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
            💎 Premium — безлимитные генерации
          </p>
          <p className="text-xs text-gray-400 mt-1">199 ₽/мес · Скоро</p>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAction}
        className="w-full max-w-xs py-4 rounded-2xl font-semibold text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        {cfg.action}
      </motion.button>

      {type !== 'limit' && (
        <button
          onClick={() => navigate('/budget')}
          className="text-sm text-gray-400"
        >
          Изменить параметры
        </button>
      )}
    </motion.div>
  )
}
