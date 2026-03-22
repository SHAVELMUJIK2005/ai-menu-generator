import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Heart, Wallet } from 'lucide-react'
import LiquidCard from '../../components/LiquidCard'
import { useOnboardingStore } from '../../store/onboardingStore'
import type { Goal } from '../../../../shared/src/types'

const goals: { type: Goal; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'LOSE_WEIGHT', label: 'Сбросить вес', icon: <TrendingDown size={28} />, desc: 'Дефицит калорий, лёгкие блюда' },
  { type: 'GAIN_WEIGHT', label: 'Набор массы', icon: <TrendingUp size={28} />, desc: 'Калорийно и питательно' },
  { type: 'HEALTHY', label: 'Правильное питание', icon: <Heart size={28} />, desc: 'Баланс БЖУ и витаминов' },
  { type: 'CHEAP', label: 'Питаться дёшево', icon: <Wallet size={28} />, desc: 'Максимум пользы за минимум денег' },
]

export default function GoalSelectPage() {
  const { goal, setGoal, nextStep } = useOnboardingStore()

  const handleSelect = (type: Goal) => {
    setGoal(type)
    setTimeout(nextStep, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-screen p-6 gap-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1 className="text-2xl font-bold mt-8 mb-2" style={{ color: 'var(--color-text)' }}>
        Ваша цель?
      </h1>
      <p className="text-sm text-gray-500 mb-4">Меню будет адаптировано под вашу цель</p>

      <div className="flex flex-col gap-3">
        {goals.map(({ type, label, icon, desc }) => (
          <motion.div
            key={type}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <LiquidCard
              onClick={() => handleSelect(type)}
              selected={goal === type}
              className="flex items-center gap-4"
            >
              <div
                className="p-2 rounded-xl"
                style={{ color: goal === type ? '#4CAF50' : '#666', background: goal === type ? 'rgba(76,175,80,0.1)' : 'transparent' }}
              >
                {icon}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              {goal === type && (
                <div className="ml-auto text-green-500 font-bold text-lg">✓</div>
              )}
            </LiquidCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
