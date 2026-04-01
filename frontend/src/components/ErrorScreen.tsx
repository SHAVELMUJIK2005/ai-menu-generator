import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useBuyPremium } from '../hooks/useSubscription'
import VortexLogo from './VortexLogo'

export type ErrorType = 'network' | 'server' | 'generation' | 'limit' | 'unknown'

const ERROR_CONFIG: Record<
  ErrorType,
  { emoji: string; title: string; desc: string; action: string }
> = {
  network: {
    emoji: '📶',
    title: 'Нет соединения',
    desc: 'Проверьте подключение к интернету и попробуйте снова',
    action: 'Повторить',
  },
  server: {
    emoji: '🔧',
    title: 'Сервер недоступен',
    desc: 'Мы уже всё чиним. Попробуйте через минуту',
    action: 'Повторить',
  },
  generation: {
    emoji: '🤔',
    title: 'Ошибка генерации',
    desc: 'AI не смог составить меню. Попробуйте ещё раз — обычно помогает',
    action: 'Попробовать снова',
  },
  limit: {
    emoji: '⏳',
    title: 'Лимит исчерпан',
    desc: 'Вы использовали все бесплатные генерации сегодня. Попробуйте завтра или оформите Premium',
    action: 'Понятно',
  },
  unknown: {
    emoji: '😅',
    title: 'Что-то пошло не так',
    desc: 'Попробуйте обновить страницу',
    action: 'Повторить',
  },
}


interface ErrorScreenProps {
  type?: ErrorType
  onRetry?: () => void
  message?: string
}

export default function ErrorScreen({ type = 'unknown', onRetry, message }: ErrorScreenProps) {
  const navigate = useNavigate()
  const cfg = ERROR_CONFIG[type]
  const { mutate: buyPremium, isPending: buyingPremium } = useBuyPremium()

  const handleAction = () => {
    if (type === 'limit') navigate('/budget')
    else onRetry?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <VortexLogo size={90} animate={false} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="w-full max-w-xs"
      >
        <div className="text-3xl mb-3 mt-4">{cfg.emoji}</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {cfg.title}
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">{message ?? cfg.desc}</p>

        {type === 'limit' && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'rgba(255,107,53,0.08)',
              border: '1.5px solid rgba(255,107,53,0.2)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              ⭐ Premium — безлимитные генерации
            </p>
            <p className="text-xs text-gray-400 mt-1">199 Stars/месяц</p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAction}
          className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm mb-3"
          style={{ background: 'var(--color-primary)' }}
        >
          {cfg.action}
        </motion.button>

        {type === 'limit' && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,107,53,0.08)', border: '1.5px solid rgba(255,107,53,0.2)' }}>
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

        {type !== 'limit' && (
          <button onClick={() => navigate('/budget')} className="text-sm text-gray-400">
            Изменить параметры
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
