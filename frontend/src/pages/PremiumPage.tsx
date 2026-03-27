import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Brain, PlayCircle, ShoppingBag, Check } from 'lucide-react'
import { useSubscription, useBuyPremium } from '../hooks/useSubscription'
import { useHaptic } from '../hooks/useTelegram'

const BENEFITS = [
  { icon: Zap, text: 'Безлимитные генерации меню' },
  { icon: Brain, text: 'AI Claude Sonnet — умнее и точнее' },
  { icon: '📅', text: 'Меню на 7 дней вперёд' },
  { icon: PlayCircle, text: 'Видео-рецепты к каждому блюду' },
  { icon: ShoppingBag, text: 'Сравнение цен во всех магазинах' },
  { icon: '📊', text: 'Детальное КБЖУ и нутрициология' },
]

export default function PremiumPage() {
  const navigate = useNavigate()
  const { data: subscription } = useSubscription()
  const { mutate: buyPremium, isPending } = useBuyPremium()
  const { impact, success } = useHaptic()

  const isPremium = subscription?.isPremium ?? false

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)',
      }}
    >
      {/* Назад */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => { impact('light'); navigate(-1) }}
        className="fixed top-6 left-6 p-2.5 rounded-xl z-10"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
      >
        <ArrowLeft size={20} className="text-white" />
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center pt-24 pb-10 px-6 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-6xl mb-4"
        >
          ⭐
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">ЗОЖ-Рацион Premium</h1>
        <p className="text-white/60 text-sm">Всё лучшее — без ограничений</p>
      </motion.div>

      {/* Преимущества */}
      <div className="flex flex-col gap-3 px-6 mb-8">
        {BENEFITS.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(76,175,80,0.2)' }}>
              {typeof Icon === 'string' ? (
                <span className="text-lg leading-none">{Icon}</span>
              ) : (
                <Icon size={18} style={{ color: '#4CAF50' }} />
              )}
            </div>
            <span className="text-white/90 text-sm font-medium flex-1">{text}</span>
            <Check size={16} className="text-green-400 flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="px-6 pb-16 mt-auto"
      >
        {isPremium ? (
          <div
            className="p-5 rounded-2xl text-center"
            style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)' }}
          >
            <div className="text-green-400 font-bold text-lg mb-1">Premium активен ✓</div>
            {subscription?.premiumUntil && (
              <div className="text-white/60 text-sm">
                Действует до{' '}
                {new Date(subscription.premiumUntil).toLocaleDateString('ru', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Цена */}
            <div className="text-center mb-4">
              <span className="text-white/40 text-sm">всего </span>
              <span className="text-white font-bold text-2xl">199 ⭐</span>
              <span className="text-white/40 text-sm"> / месяц</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { success(); buyPremium() }}
              disabled={isPending}
              className="w-full py-4 rounded-2xl font-bold text-white text-base mb-3"
              style={{
                background: isPending
                  ? 'rgba(255,107,53,0.5)'
                  : 'linear-gradient(135deg, #FF6B35 0%, #FF9800 100%)',
              }}
            >
              {isPending ? 'Открываем оплату...' : 'Оформить Premium'}
            </motion.button>
            <p className="text-white/30 text-xs text-center">
              Оплата через Telegram Stars · Отмена в любой момент
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
