import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import type { ShoppingItem } from '../../../shared/src/types'

// Клиентская категоризация по ключевым словам
const CATEGORIES: Array<{ label: string; emoji: string; keywords: string[] }> = [
  { label: 'Мясо и рыба', emoji: '🥩', keywords: ['курин', 'говядин', 'свинин', 'рыб', 'фарш', 'грудк', 'бедр', 'филе', 'индейк'] },
  { label: 'Молочное и яйца', emoji: '🥛', keywords: ['молок', 'яйц', 'творог', 'сметан', 'кефир', 'йогурт', 'масло слив', 'сыр'] },
  { label: 'Крупы и хлеб', emoji: '🌾', keywords: ['греч', 'рис', 'овсян', 'хлеб', 'макарон', 'паст', 'пшен', 'перлов', 'булг'] },
  { label: 'Овощи', emoji: '🥦', keywords: ['картоф', 'морков', 'лук', 'капуст', 'томат', 'огурц', 'перец', 'кабачк', 'свёкл', 'чеснок', 'зелен'] },
  { label: 'Масла и соусы', emoji: '🫙', keywords: ['масло подсол', 'масло оливк', 'томатная паст', 'соус', 'уксус', 'горчиц'] },
  { label: 'Фрукты', emoji: '🍎', keywords: ['яблок', 'банан', 'апельсин', 'лимон', 'грушу', 'виноград'] },
]

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) return cat.label
  }
  return 'Другое'
}

function groupItems(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  const groups: Record<string, ShoppingItem[]> = {}
  for (const item of items) {
    const cat = getCategory(item.name)
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }
  return groups
}

function getCategoryEmoji(label: string): string {
  return CATEGORIES.find((c) => c.label === label)?.emoji ?? '🛒'
}

export default function ShoppingListPage() {
  const navigate = useNavigate()
  const { impact, success } = useHaptic()
  const currentMenu = useMenuStore((s) => s.currentMenu)
  const items = currentMenu?.shoppingList ?? []
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (name: string) => {
    impact('light')
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const markAll = () => {
    success()
    setChecked(new Set(items.map((i) => i.name)))
  }

  const unmarkAll = () => {
    impact('medium')
    setChecked(new Set())
  }

  const allDone = checked.size === items.length
  const totalUnchecked = items.filter((i) => !checked.has(i.name)).reduce((s, i) => s + i.estimatedPrice, 0)
  const totalAll = items.reduce((s, i) => s + i.estimatedPrice, 0)
  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0
  const groups = groupItems(items)

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center" style={{ background: 'var(--color-bg)' }}>
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Список пуст</h2>
        <p className="text-sm text-gray-400">Сначала составьте меню</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/budget')}
          className="px-6 py-3 rounded-2xl font-semibold text-white text-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          Составить меню
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-36" style={{ background: 'var(--color-bg)' }}>
      {/* шапка */}
      <div className="flex items-center gap-3 p-6 pt-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { impact('light'); navigate('/menu') }}
          className="p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.5)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
        </motion.button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Список покупок</h1>
      </div>

      <div className="px-6">
        {/* прогресс */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">Куплено {checked.size} из {items.length}</span>
            <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
              Осталось ~{totalUnchecked} ₽
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--color-primary)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {allDone && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center mt-1.5 font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              ✓ Всё куплено!
            </motion.p>
          )}
        </div>

        {/* группы по категориям */}
        <div className="flex flex-col gap-5">
          {Object.entries(groups).map(([category, catItems]) => {
            const catChecked = catItems.filter((i) => checked.has(i.name)).length
            const allCatDone = catChecked === catItems.length
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {getCategoryEmoji(category)} {category}
                  </span>
                  <span className="text-xs text-gray-400">{catChecked}/{catItems.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {catItems.map((item) => {
                      const done = checked.has(item.name)
                      return (
                        <motion.div
                          key={item.name}
                          layout
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggle(item.name)}
                          className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
                          style={{
                            background: done ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.72)',
                            backdropFilter: 'blur(20px)',
                            border: done ? '1.5px solid rgba(76,175,80,0.3)' : '1.5px solid rgba(255,255,255,0.5)',
                            opacity: done && allCatDone ? 0.6 : 1,
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: done ? 'var(--color-primary)' : 'transparent',
                              border: done ? 'none' : '2px solid #ddd',
                            }}
                          >
                            {done && <Check size={14} color="white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1">
                            <span
                              className="font-medium text-sm"
                              style={{
                                color: done ? '#aaa' : 'var(--color-text)',
                                textDecoration: done ? 'line-through' : 'none',
                              }}
                            >
                              {item.name}
                            </span>
                            <div className="text-xs text-gray-400">{item.totalAmount} {item.unit}</div>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: done ? '#aaa' : 'var(--color-primary)' }}>
                            ~{item.estimatedPrice} ₽
                          </span>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
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
          <span className="text-gray-400">Итого по списку</span>
          <span className="font-bold" style={{ color: 'var(--color-text)' }}>~{totalAll} ₽</span>
        </div>
        <div className="flex gap-2">
          {!allDone ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={markAll}
              className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              Отметить всё купленным
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={unmarkAll}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            >
              Сбросить
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
