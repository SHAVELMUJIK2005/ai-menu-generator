import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useBuyPremium } from '../hooks/useSubscription'

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
  const { mutate: buyPremium, isPending: buyingPremium } = useBuyPremium()

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
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
            ⭐ Premium — безлимитные генерации
          </p>
          <ul className="text-xs text-gray-500 mb-3 flex flex-col gap-0.5">
            <li>✓ Безлимитные генерации</li>
            <li>✓ Меню на 7 дней</li>
            <li>✓ Приоритетный AI</li>
          </ul>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => buyPremium()}
            disabled={buyingPremium}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-accent)', opacity: buyingPremium ? 0.7 : 1 }}
          >
            {buyingPremium ? 'Открываем оплату...' : 'Подписаться за 199 ⭐'}
          </motion.button>
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
