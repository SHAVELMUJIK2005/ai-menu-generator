import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, RefreshCw, Heart, Shuffle } from 'lucide-react'
import { menuMock } from '../mocks/menuMock'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { useSubstituteMenu, useRateMenu } from '../hooks/useMenu'
import type { Meal, DayMenu } from '../../../shared/src/types'

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Завтрак',
  lunch: '☀️ Обед',
  dinner: '🌙 Ужин',
  snack: '🍎 Перекус',
}

// Нормы КБЖУ на день (среднее)
const DAILY_NORMS = { calories: 2000, protein: 75, fat: 65, carbs: 250 }

interface NutritionBarProps {
  label: string
  value: number
  max: number
  color: string
  unit: string
}

function NutritionBar({ label, value, max, color, unit }: NutritionBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }} className="font-medium">{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}22` }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

function MealCard({ meal, onClick }: { meal: Meal; onClick: () => void }) {
  const { impact } = useHaptic()
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => { impact('light'); onClick() }}
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

      {/* мини КБЖУ */}
      <div className="flex gap-2 mt-2">
        {[
          { label: 'Б', value: meal.nutrition.protein, color: '#4CAF50' },
          { label: 'Ж', value: meal.nutrition.fat, color: '#FF9800' },
          { label: 'У', value: meal.nutrition.carbs, color: '#2196F3' },
        ].map(({ label, value, color }) => (
          <span
            key={label}
            className="text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: `${color}18`, color }}
          >
            {label} {value}г
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function MealSheet({
  meal,
  menuId,
  dayNumber,
  onClose,
  onSubstituted,
}: {
  meal: Meal
  menuId: string | null
  dayNumber: number
  onClose: () => void
  onSubstituted?: (newMeal: Meal) => void
}) {
  const { likedMeals, toggleLikedMeal } = useMenuStore()
  const { impact, success } = useHaptic()
  const isLiked = likedMeals.includes(meal.name)
  const [userRating, setUserRating] = useState(0)
  const { mutate: substitute, isPending: substituting } = useSubstituteMenu()
  const { mutate: rateMenu } = useRateMenu()

  const handleSubstitute = () => {
    if (!menuId) return
    impact('medium')
    substitute(
      { id: menuId, dayNumber, mealType: meal.type },
      {
        onSuccess: (data) => {
          success()
          const newMeal = data.days.find((d: DayMenu) => d.dayNumber === dayNumber)?.meals.find((m: Meal) => m.type === meal.type)
          if (newMeal) onSubstituted?.(newMeal)
          onClose()
        },
      },
    )
  }

  const handleRate = (rating: number) => {
    if (!menuId || userRating) return
    impact('light')
    setUserRating(rating)
    rateMenu({ id: menuId, rating })
  }

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
        <div className="flex items-center gap-2">
          {menuId && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSubstitute}
              disabled={substituting}
              className="p-1.5 rounded-xl"
              style={{ background: 'rgba(76,175,80,0.1)', opacity: substituting ? 0.5 : 1 }}
              title="Заменить блюдо"
            >
              <Shuffle size={18} color="var(--color-primary)" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { impact('light'); toggleLikedMeal(meal.name) }}
            className="p-1.5 rounded-xl"
            style={{ background: isLiked ? 'rgba(255,107,53,0.12)' : 'transparent' }}
          >
            <Heart
              size={20}
              fill={isLiked ? '#FF6B35' : 'none'}
              color={isLiked ? '#FF6B35' : '#ccc'}
            />
          </motion.button>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>
      </div>

      {/* КБЖУ карточки */}
      <div className="grid grid-cols-4 gap-2 mb-4">
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

      {/* КБЖУ прогресс-бары (% от дневной нормы) */}
      <div className="rounded-2xl p-3 mb-4 flex flex-col gap-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
        <p className="text-xs text-gray-400 mb-1">% от дневной нормы</p>
        <div className="flex gap-3">
          <NutritionBar label="Калории" value={meal.nutrition.calories} max={DAILY_NORMS.calories} color="#FF6B35" unit=" ккал" />
          <NutritionBar label="Белки" value={meal.nutrition.protein} max={DAILY_NORMS.protein} color="#4CAF50" unit="г" />
        </div>
        <div className="flex gap-3">
          <NutritionBar label="Жиры" value={meal.nutrition.fat} max={DAILY_NORMS.fat} color="#FF9800" unit="г" />
          <NutritionBar label="Углеводы" value={meal.nutrition.carbs} max={DAILY_NORMS.carbs} color="#2196F3" unit="г" />
        </div>
      </div>

      {/* рецепт */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--color-text)' }}>Рецепт</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{meal.recipeShort}</p>
      </div>

      {/* ингредиенты */}
      <div className="mb-4">
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

      {/* видео рецепт */}
      {meal.videoUrl && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--color-text)' }}>
            🎬 Видео рецепт
          </h3>
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(meal.videoUrl)}`}
              title="Рецепт"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* оценка блюда */}
      {menuId && (
        <div className="flex flex-col items-center gap-2 pt-2 pb-1">
          <p className="text-xs text-gray-400">Оцените блюдо</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileTap={{ scale: 0.8 }}
                onClick={() => handleRate(star)}
                className="text-2xl"
                style={{ opacity: userRating && star > userRating ? 0.3 : 1 }}
              >
                {star <= userRating ? '⭐' : '☆'}
              </motion.button>
            ))}
          </div>
          {userRating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              Спасибо за оценку!
            </motion.p>
          )}
        </div>
      )}
    </motion.div>
  )
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match?.[1] ?? ''
}

export default function MenuPage() {
  const [activeDay, setActiveDay] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1)
  const navigate = useNavigate()
  const { impact } = useHaptic()
  const currentMenu = useMenuStore((s) => s.currentMenu)
  const currentMenuId = useMenuStore((s) => s.currentMenuId)
  const daysCount = useMenuStore((s) => s.days)
  const setMenu = useMenuStore((s) => s.setMenu)
  const menu = currentMenu ?? menuMock

  const day = menu.days[activeDay]

  const goToDay = (i: number) => {
    if (i === activeDay) return
    setSwipeDir(i > activeDay ? 1 : -1)
    impact('light')
    setActiveDay(i)
  }

  return (
    <div className="flex flex-col min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Ваше меню на {daysCount} {daysCount === 3 ? 'дня' : 'дней'}
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
              onClick={() => goToDay(i)}
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
            initial={{ opacity: 0, x: swipeDir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDir * -40 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            {day.meals.map((meal) => (
              <MealCard key={meal.name} meal={meal} onClick={() => setSelectedMeal(meal)} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* нижняя панель с КБЖУ дня */}
      <div
        className="fixed bottom-0 inset-x-0 p-4 flex flex-col gap-3"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* КБЖУ прогресс-бары дня */}
        <div className="flex gap-3 px-1">
          <NutritionBar label="Ккал" value={day.dayTotal.calories} max={DAILY_NORMS.calories} color="#FF6B35" unit="" />
          <NutritionBar label="Белки" value={day.dayTotal.protein} max={DAILY_NORMS.protein} color="#4CAF50" unit="г" />
          <NutritionBar label="Жиры" value={day.dayTotal.fat} max={DAILY_NORMS.fat} color="#FF9800" unit="г" />
          <NutritionBar label="Углев" value={day.dayTotal.carbs} max={DAILY_NORMS.carbs} color="#2196F3" unit="г" />
        </div>

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
            onClick={() => { impact('medium'); navigate('/generating') }}
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
            onClick={() => { impact('light'); navigate('/shopping') }}
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
            <MealSheet
              meal={selectedMeal}
              menuId={currentMenuId}
              dayNumber={day.dayNumber}
              onClose={() => setSelectedMeal(null)}
              onSubstituted={(newMeal) => {
                if (!currentMenu) return
                const updatedDays = currentMenu.days.map((d) =>
                  d.dayNumber === day.dayNumber
                    ? { ...d, meals: d.meals.map((m) => m.type === newMeal.type ? newMeal : m) }
                    : d
                )
                setMenu({ ...currentMenu, days: updatedDays }, currentMenuId ?? undefined)
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
