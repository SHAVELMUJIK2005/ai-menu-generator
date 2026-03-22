import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, RefreshCw } from 'lucide-react'
import { menuMock } from '../mocks/menuMock'
import type { Meal } from '../../../shared/src/types'

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Завтрак',
  lunch: '☀️ Обед',
  dinner: '🌙 Ужин',
  snack: '🍎 Перекус',
}

function MealCard({ meal, onClick }: { meal: Meal; onClick: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-2xl cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1.5px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-gray-400">{MEAL_LABELS[meal.type]}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          {meal.cost} ₽
        </span>
      </div>
      <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{meal.name}</div>
      <div className="text-xs text-gray-400 mt-1">{meal.nutrition.calories} ккал · {meal.cookingMin} мин</div>
    </motion.div>
  )
}

function MealSheet({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(30px)' }}
    >
      <div className="w-12 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
      <div className="flex justify-between items-start mb-4">
        <h2 className="font-bold text-lg pr-4" style={{ color: 'var(--color-text)' }}>{meal.name}</h2>
        <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
      </div>

      {/* КБЖУ */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Калории', value: meal.nutrition.calories, unit: 'ккал', color: '#FF6B35' },
          { label: 'Белки', value: meal.nutrition.protein, unit: 'г', color: '#4CAF50' },
          { label: 'Жиры', value: meal.nutrition.fat, unit: 'г', color: '#FF9800' },
          { label: 'Углеводы', value: meal.nutrition.carbs, unit: 'г', color: '#2196F3' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="text-center p-2 rounded-xl" style={{ background: `${color}15` }}>
            <div className="font-bold text-sm" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-400">{unit}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* рецепт */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--color-text)' }}>Рецепт</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{meal.recipeShort}</p>
      </div>

      {/* ингредиенты */}
      <div>
        <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--color-text)' }}>Ингредиенты</h3>
        <div className="flex flex-col gap-2">
          {meal.ingredients.map((ing) => (
            <div key={ing.name} className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--color-text)' }}>{ing.name}</span>
              <span className="text-gray-400">{ing.amount} {ing.unit} · {ing.price} ₽</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function MenuPage() {
  const [activeDay, setActiveDay] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const navigate = useNavigate()
  const menu = menuMock

  const day = menu.days[activeDay]

  return (
    <div className="flex flex-col min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Ваше меню на 3 дня
        </h1>
        <p className="text-sm text-gray-400 mb-5">
          Бюджет: {menu.totalCost} ₽ · Остаток: {menu.budgetLeft} ₽
        </p>

        {/* табы дней */}
        <div className="flex gap-2 mb-6">
          {menu.days.map((d, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDay(i)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeDay === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.72)',
                color: activeDay === i ? 'white' : 'var(--color-text)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
              }}
            >
              День {d.dayNumber}
            </motion.button>
          ))}
        </div>

        {/* карточки блюд */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            {day.meals.map((meal) => (
              <MealCard key={meal.name} meal={meal} onClick={() => setSelectedMeal(meal)} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* нижняя панель */}
      <div
        className="fixed bottom-0 inset-x-0 p-4 flex flex-col gap-3"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex justify-between text-sm px-1">
          <span className="text-gray-400">День {day.dayNumber}</span>
          <span>
            <span className="font-semibold">{day.dayTotal.cost} ₽</span>
            <span className="text-gray-400"> · {day.dayTotal.calories} ккал · {day.dayTotal.protein}г белка</span>
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/generating')}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(0,0,0,0.08)',
              color: 'var(--color-text)',
            }}
          >
            <RefreshCw size={16} />
            Перегенерировать
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/shopping')}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-semibold text-sm text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <ShoppingCart size={16} />
            Список покупок
          </motion.button>
        </div>
      </div>

      {/* bottom sheet */}
      <AnimatePresence>
        {selectedMeal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setSelectedMeal(null)}
            />
            <MealSheet meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
