import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useOnboardingStore } from '../store/onboardingStore'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { useSubscription } from '../hooks/useSubscription'

const PROFILE_LABELS: Record<string, string> = {
  STUDENT: 'Студент', SPORT: 'Спорт', FAMILY: 'Семья', SINGLE: 'Один', OFFICE: 'Офис',
}
const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: 'Сбросить вес', GAIN_WEIGHT: 'Набор массы', HEALTHY: 'Правильное питание', CHEAP: 'Питаться дёшево',
}
const STORE_LABELS: Record<string, string> = {
  PYATEROCHKA: 'Пятёрочка', PEREKRESTOK: 'Перекрёсток', MAGNIT: 'Магнит', VKUSVILL: 'ВкусВилл', LENTA: 'Лента',
}

export default function BudgetInputPage() {
  const navigate = useNavigate()
  const { profileType, goal, storeChain } = useOnboardingStore()
  const { budget, days, setBudget: saveToStore, setDays } = useMenuStore()
  const { impact, success } = useHaptic()
  const { data: subscription } = useSubscription()
  const isPremium = subscription?.isPremium ?? false

  const handleGenerate = () => {
    success()
    navigate('/generating')
  }

  const handleBudget = (val: number) => {
    saveToStore(val)
  }

  const handleDays = (val: 3 | 7) => {
    if (val === 7 && !isPremium) return
    impact('light')
    setDays(val)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1 className="text-2xl font-bold mt-10 mb-1" style={{ color: 'var(--color-text)' }}>
        На какую сумму составить меню?
      </h1>
      <p className="text-sm text-gray-400 mb-10">На {days} {days === 3 ? 'дня' : 'дней'}: завтрак, обед и ужин</p>

      {/* сумма */}
      <div className="text-center mb-6">
        <motion.span
          key={budget}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold"
          style={{ color: 'var(--color-primary)', display: 'inline-block' }}
        >
          {budget.toLocaleString('ru')}
        </motion.span>
        <span className="text-2xl ml-2 text-gray-400">₽</span>
      </div>

      {/* слайдер */}
      <div className="mb-6">
        <style>{`
          .budget-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 999px;
            outline: none;
            cursor: pointer;
            background: linear-gradient(
              to right,
              #4CAF50 0%,
              #4CAF50 ${Math.round(((budget - 500) / (10000 - 500)) * 100)}%,
              #e0e0e0 ${Math.round(((budget - 500) / (10000 - 500)) * 100)}%,
              #e0e0e0 100%
            );
          }
          .budget-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            border: 3px solid #4CAF50;
            box-shadow: 0 2px 8px rgba(76,175,80,0.4);
            cursor: pointer;
          }
          .budget-slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            border: 3px solid #4CAF50;
            box-shadow: 0 2px 8px rgba(76,175,80,0.4);
            cursor: pointer;
          }
        `}</style>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={budget}
          onChange={(e) => handleBudget(Number(e.target.value))}
          className="budget-slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>500 ₽</span>
          <span>10 000 ₽</span>
        </div>
      </div>

      {/* быстрые кнопки */}
      <div className="flex gap-2 mb-6">
        {[1000, 2000, 3000, 5000].map((val) => (
          <motion.button
            key={val}
            whileTap={{ scale: 0.93 }}
            onClick={() => { impact('light'); handleBudget(val) }}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: budget === val ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.72)',
              border: budget === val ? '1.5px solid #4CAF50' : '1.5px solid rgba(255,255,255,0.5)',
              color: budget === val ? '#4CAF50' : 'var(--color-text)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {val.toLocaleString('ru')}₽
          </motion.button>
        ))}
      </div>

      {/* выбор количества дней */}
      <div className="flex gap-2 mb-8">
        {([3, 7] as const).map((d) => {
          const locked = d === 7 && !isPremium
          const active = days === d
          return (
            <motion.button
              key={d}
              whileTap={{ scale: locked ? 1 : 0.95 }}
              onClick={() => handleDays(d)}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.72)',
                color: active ? 'white' : locked ? '#bbb' : 'var(--color-text)',
                backdropFilter: 'blur(10px)',
                border: active ? 'none' : '1.5px solid rgba(255,255,255,0.5)',
              }}
            >
              {d} дня
              {locked && <Star size={12} fill="#FF6B35" color="#FF6B35" />}
            </motion.button>
          )
        })}
      </div>

      {/* инфо */}
      <div
        className="rounded-2xl p-4 mb-8 flex flex-col gap-1"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255,255,255,0.5)',
        }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Профиль</span>
          <span className="font-medium">{profileType ? PROFILE_LABELS[profileType] : '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Цель</span>
          <span className="font-medium">{goal ? GOAL_LABELS[goal] : '—'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Магазин</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{storeChain ? STORE_LABELS[storeChain] : 'Без магазина'}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={storeChain
                ? { background: 'rgba(76,175,80,0.12)', color: '#4CAF50' }
                : { background: 'rgba(255,152,0,0.12)', color: '#FF9800' }
              }
            >
              {storeChain ? 'точные цены' : '±15%'}
            </span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        className="w-full py-4 rounded-2xl font-semibold text-white text-base mt-auto"
        style={{ background: 'var(--color-primary)' }}
      >
        Составить меню на {days} {days === 3 ? 'дня' : 'дней'}
      </motion.button>
    </motion.div>
  )
}
