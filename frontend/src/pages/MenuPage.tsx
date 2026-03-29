import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, RefreshCw, Heart, Shuffle, Bookmark } from 'lucide-react'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { useSubstituteMenu, useRateMenu, useRerollMenu } from '../hooks/useMenu'
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/useFavorites'
import type { Meal, DayMenu } from '../types'

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

function MealCard({
  meal,
  menuId,
  dayNumber,
  onSubstituted,
  onClick,
}: {
  meal: Meal
  menuId: string | null
  dayNumber: number
  onSubstituted?: (newMeal: Meal) => void
  onClick: () => void
}) {
  const { impact, success } = useHaptic()
  const { mutate: substitute, isPending: substituting } = useSubstituteMenu()

  const handleSubstitute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!menuId || substituting) return
    impact('medium')
    substitute(
      { id: menuId, dayNumber, mealType: meal.type },
      {
        onSuccess: (data) => {
          success()
          const newMeal = data.days.find((d: DayMenu) => d.dayNumber === dayNumber)?.meals.find((m: Meal) => m.type === meal.type)
          if (newMeal) onSubstituted?.(newMeal)
        },
      },
    )
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => { impact('light'); onClick() }}
      className="p-4 rounded-2xl cursor-pointer"
      style={{
        background: 'var(--color-card)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1.5px solid var(--color-card-border)`,
      }}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-gray-400">{MEAL_LABELS[meal.type]}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            {meal.cost} ₽
          </span>
          {menuId && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSubstitute}
              disabled={substituting}
              className="p-1.5 rounded-xl"
              style={{ background: 'rgba(76,175,80,0.1)', opacity: substituting ? 0.4 : 1 }}
              title="Заменить блюдо"
            >
              <Shuffle size={14} color="var(--color-primary)" />
            </motion.button>
          )}
        </div>
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
      style={{ background: 'var(--color-sheet)', backdropFilter: 'blur(30px)' }}
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
      <div className="rounded-2xl p-3 mb-4 flex flex-col gap-2" style={{ background: 'var(--color-subtle-bg)' }}>
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

      {/* видео рецепт — кнопка открывает YouTube через Telegram openLink */}
      {meal.videoUrl && (
        <div className="mb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const tg = (window as Window & { Telegram?: { WebApp?: { openLink?: (url: string) => void } } }).Telegram?.WebApp
              if (tg?.openLink) tg.openLink(meal.videoUrl!)
              else window.open(meal.videoUrl, '_blank')
            }}
            className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,0,0,0.08)', color: '#c00' }}
          >
            ▶ Смотреть рецепт на YouTube
          </motion.button>
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


function StarRating({ menuId }: { menuId: string | null }) {
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { mutate: rateMenu, isPending } = useRateMenu()
  const { impact } = useHaptic()

  if (!menuId || submitted) return null

  const submit = (stars: number) => {
    impact('medium')
    setSelected(stars)
    rateMenu({ id: menuId, stars }, { onSuccess: () => setSubmitted(true) })
  }

  return (
    <div className="flex items-center gap-1 justify-center py-2">
      <span className="text-xs text-gray-400 mr-1">Оценить меню:</span>
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          key={s}
          whileTap={{ scale: 0.85 }}
          onClick={() => submit(s)}
          disabled={isPending}
        >
          <Star
            size={20}
            fill={s <= selected ? '#FFB800' : 'none'}
            stroke={s <= selected ? '#FFB800' : '#ddd'}
            strokeWidth={1.5}
          />
        </motion.button>
      ))}
    </div>
  )
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

  if (!currentMenu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center" style={{ background: 'var(--color-bg)' }}>
        <span className="text-5xl">🥗</span>
        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Меню ещё не создано</h2>
        <p className="text-sm text-gray-400">Укажите бюджет и мы подберём рацион</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/budget')}
          className="px-6 py-3 rounded-2xl font-semibold text-white text-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          Создать меню
        </motion.button>
      </div>
    )
  }

  const menu = currentMenu
  const day = menu.days[activeDay]

  const { mutate: reroll, isPending: rerolling } = useRerollMenu()
  const { data: favorites } = useFavorites()
  const { mutate: addFav } = useAddFavorite()
  const { mutate: removeFav } = useRemoveFavorite()
  const isFavorited = favorites?.some((f) => f.menuId === currentMenuId) ?? false

  const toggleFavorite = () => {
    if (!currentMenuId) return
    impact('light')
    if (isFavorited) removeFav(currentMenuId)
    else addFav(currentMenuId)
  }

  const handleReroll = () => {
    if (!currentMenuId) { navigate('/generating'); return }
    impact('medium')
    reroll(currentMenuId, {
      onSuccess: (newMenu) => {
        setMenu(newMenu, currentMenuId)
      },
    })
  }

  const goToDay = (i: number) => {
    if (i === activeDay) return
    setSwipeDir(i > activeDay ? 1 : -1)
    impact('light')
    setActiveDay(i)
  }

  return (
    <div className="flex flex-col min-h-screen pb-52" style={{ background: 'var(--color-bg)' }}>
      <div className="p-6 pt-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Ваше меню на {daysCount} {daysCount === 3 ? 'дня' : 'дней'}
          </h1>
          {currentMenuId && (
            <motion.button whileTap={{ scale: 0.85 }} onClick={toggleFavorite} className="p-2 rounded-xl" style={{ background: isFavorited ? 'rgba(255,107,53,0.12)' : 'var(--color-card)' }}>
              <Bookmark size={20} fill={isFavorited ? '#FF6B35' : 'none'} color={isFavorited ? '#FF6B35' : '#bbb'} />
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-sm text-gray-400">
            Бюджет: {menu.totalCost} ₽ · Остаток: {menu.budgetLeft} ₽
          </span>
          {menu.confidence && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background:
                  menu.confidence === 'high' ? 'rgba(76,175,80,0.12)' :
                  menu.confidence === 'medium' ? 'rgba(255,152,0,0.12)' :
                  'rgba(255,107,53,0.12)',
                color:
                  menu.confidence === 'high' ? '#4CAF50' :
                  menu.confidence === 'medium' ? '#FF9800' :
                  '#FF6B35',
              }}
            >
              {menu.confidence === 'high' ? '✓ Точные цены' :
               menu.confidence === 'medium' ? '~ Цены приблизительные' :
               '⚠ Цены ориентировочные'}
            </span>
          )}
        </div>

        {/* табы дней */}
        <div className="flex gap-2 mb-6">
          {currentMenu.days.map((d, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToDay(i)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeDay === i ? 'var(--color-primary)' : 'var(--color-card)',
                color: activeDay === i ? 'white' : 'var(--color-text)',
                backdropFilter: 'blur(10px)',
                border: `1.5px solid var(--color-card-border)`,
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
              <MealCard
                key={meal.name}
                meal={meal}
                menuId={currentMenuId}
                dayNumber={day.dayNumber}
                onSubstituted={(newMeal) => {
                  const updatedMenu = {
                    ...menu,
                    days: menu.days.map((d: DayMenu) =>
                      d.dayNumber === day.dayNumber
                        ? { ...d, meals: d.meals.map((m: Meal) => (m.type === newMeal.type ? newMeal : m)) }
                        : d,
                    ),
                  }
                  setMenu(updatedMenu)
                }}
                onClick={() => setSelectedMeal(meal)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* итоги за все дни */}
        {menu.days.length > 1 && (() => {
          const total = menu.days.reduce(
            (acc, d) => ({
              calories: acc.calories + d.dayTotal.calories,
              protein: acc.protein + d.dayTotal.protein,
              fat: acc.fat + d.dayTotal.fat,
              carbs: acc.carbs + d.dayTotal.carbs,
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 },
          )
          return (
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{ background: 'var(--color-card)', backdropFilter: 'blur(20px)', border: `1.5px solid var(--color-card-border)` }}
            >
              <p className="text-xs font-semibold text-gray-400 mb-3">Итого за {menu.days.length} дня</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Ккал', value: total.calories, color: '#FF6B35' },
                  { label: 'Белки', value: `${total.protein}г`, color: '#4CAF50' },
                  { label: 'Жиры', value: `${total.fat}г`, color: '#FF9800' },
                  { label: 'Углев', value: `${total.carbs}г`, color: '#2196F3' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div className="font-bold text-sm" style={{ color }}>{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* нижняя панель с КБЖУ дня */}
      <div
        className="fixed bottom-16 inset-x-0 p-4 flex flex-col gap-3"
        style={{
          background: 'var(--color-sheet)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid var(--color-border-line)`,
          zIndex: 20,
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
        <StarRating menuId={currentMenuId} />

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReroll}
            disabled={rerolling}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{
              background: 'var(--color-card)',
              backdropFilter: 'blur(10px)',
              border: `1.5px solid var(--color-card-border)`,
              color: 'var(--color-text)',
              opacity: rerolling ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} className={rerolling ? 'animate-spin' : ''} />
            {rerolling ? 'Обновляем...' : 'Перегенерировать'}
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
