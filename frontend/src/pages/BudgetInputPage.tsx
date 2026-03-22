import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../store/onboardingStore'

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
  const [budget, setBudget] = useState(3000)
  const navigate = useNavigate()
  const { profileType, goal, storeChain } = useOnboardingStore()

  const handleGenerate = () => {
    // сохраняем бюджет в sessionStorage для GeneratingPage
    sessionStorage.setItem('budget', String(budget))
    navigate('/generating')
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
      <p className="text-sm text-gray-400 mb-10">На 3 дня: завтрак, обед и ужин</p>

      {/* сумма */}
      <div className="text-center mb-6">
        <span className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>
          {budget.toLocaleString('ru')}
        </span>
        <span className="text-2xl ml-2 text-gray-400">₽</span>
      </div>

      {/* слайдер */}
      <div className="mb-4">
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--color-primary)' }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>500 ₽</span>
          <span>10 000 ₽</span>
        </div>
      </div>

      {/* числовое поле */}
      <div className="flex items-center gap-2 mb-10">
        <input
          type="number"
          min={500}
          max={10000}
          step={100}
          value={budget}
          onChange={(e) => setBudget(Math.min(10000, Math.max(500, Number(e.target.value))))}
          className="w-full p-3 rounded-xl text-center text-lg font-semibold outline-none"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: 'var(--color-text)',
          }}
        />
        <span className="text-gray-400 font-medium">₽</span>
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
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Магазин</span>
          <span className="font-medium">{storeChain ? STORE_LABELS[storeChain] : 'Без магазина'}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        className="w-full py-4 rounded-2xl font-semibold text-white text-base mt-auto"
        style={{ background: 'var(--color-primary)' }}
      >
        Составить меню на 3 дня
      </motion.button>
    </motion.div>
  )
}
