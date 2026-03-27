import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

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

// SVG авокадо-маскот с грустным лицом и анимацией
function AvocadoMascot() {
  return (
    <svg width="110" height="140" viewBox="0 0 110 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* хвостик */}
      <rect x="50" y="10" width="10" height="20" rx="5" fill="#795548" />
      <ellipse cx="55" cy="10" rx="7" ry="8" fill="#4CAF50" />
      {/* тело */}
      <ellipse cx="55" cy="95" rx="42" ry="52" fill="#558B2F" />
      {/* мякоть внешняя */}
      <ellipse cx="55" cy="100" rx="29" ry="36" fill="#AED581" />
      {/* мякоть внутренняя */}
      <ellipse cx="55" cy="102" rx="24" ry="29" fill="#DCEDC8" />
      {/* косточка */}
      <ellipse cx="55" cy="104" rx="13" ry="16" fill="#6D4C41" />
      <ellipse cx="55" cy="102" rx="9" ry="12" fill="#795548" />
      {/* белки глаз */}
      <circle cx="44" cy="78" r="6" fill="white" />
      <circle cx="66" cy="78" r="6" fill="white" />
      {/* зрачки */}
      <circle cx="44.5" cy="79" r="3.5" fill="#1A1A2E" />
      <circle cx="66.5" cy="79" r="3.5" fill="#1A1A2E" />
      {/* блики */}
      <circle cx="46" cy="77.5" r="1.2" fill="white" />
      <circle cx="68" cy="77.5" r="1.2" fill="white" />
      {/* брови грустные */}
      <path d="M 38 70 Q 44 67 50 70" stroke="#33691E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 60 70 Q 66 67 72 70" stroke="#33691E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* рот грустный */}
      <path d="M 46 92 Q 55 86 64 92" stroke="#33691E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* слезинки */}
      <path d="M 43 85 Q 42 90 40 94" stroke="#64B5F6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M 67 85 Q 68 90 70 94" stroke="#64B5F6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

interface ErrorScreenProps {
  type?: ErrorType
  onRetry?: () => void
  message?: string
}

export default function ErrorScreen({ type = 'unknown', onRetry, message }: ErrorScreenProps) {
  const navigate = useNavigate()
  const cfg = ERROR_CONFIG[type]

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
      {/* Авокадо с покачиванием */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <AvocadoMascot />
        </motion.div>
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

        {type !== 'limit' && (
          <button
            onClick={() => navigate('/budget')}
            className="text-sm text-gray-400"
          >
            Изменить параметры
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
