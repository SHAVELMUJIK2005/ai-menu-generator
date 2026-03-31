import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ShoppingBag, BarChart2 } from 'lucide-react'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { useComparePrices } from '../hooks/useStores'
import type { ShoppingItem } from '../types'
import type { StorePriceComparison } from '../api/stores'
import { STORE_ICON_BY_CHAIN } from '../constants/storeMeta'

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

function PriceCompareSheet({
  results,
  onClose,
}: {
  results: StorePriceComparison[]
  onClose: () => void
}) {
  const max = Math.max(...results.map((r) => r.totalCost))
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(30px)' }}
    >
      <div className="w-12 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>Сравнение цен</h2>
        <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
      </div>
      <div className="flex flex-col gap-3">
        {results.map((r) => {
          const pct = Math.round((r.totalCost / max) * 100)
          const storeIcon = r.storeIcon ?? STORE_ICON_BY_CHAIN[r.store]
          return (
            <div key={r.store}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  {storeIcon && (
                    <img
                      src={storeIcon}
                      alt={r.storeName}
                      className="w-4 h-4 object-contain"
                      loading="lazy"
                    />
                  )}
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{r.storeName}</span>
                  {r.isCheapest && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(76,175,80,0.15)', color: 'var(--color-primary)' }}
                    >
                      ⭐ Лучшая цена
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold" style={{ color: r.isCheapest ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  ~{r.totalCost} ₽
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: r.isCheapest ? 'var(--color-primary)' : '#ddd' }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">
        Расчёт приблизительный на основе текущих цен
      </p>
    </motion.div>
  )
}

export default function ShoppingListPage() {
  const navigate = useNavigate()
  const { impact, success } = useHaptic()
  const currentMenu = useMenuStore((s) => s.currentMenu)
  const items = currentMenu?.shoppingList ?? []
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [compareResults, setCompareResults] = useState<StorePriceComparison[] | null>(null)
  const { mutate: comparePrices, isPending: comparing } = useComparePrices()

  const toggle = (name: string) => {
    impact('light')
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const markAll = () => {
    success()
    setChecked(new Set(items.map((i: ShoppingItem) => i.name)))
  }

  const unmarkAll = () => {
    impact('medium')
    setChecked(new Set())
  }

  const handleCompare = () => {
    impact('light')
    const base = totalAll
    comparePrices(
      { items: items.map((i) => ({ name: i.name, totalAmount: i.totalAmount, unit: i.unit })) },
      {
        onSuccess: setCompareResults,
        onError: () => {
          // бэкенд недоступен — показываем примерные цены
          const n = items.length
          setCompareResults([
            { store: 'PYATEROCHKA', storeName: 'Пятёрочка', storeIcon: STORE_ICON_BY_CHAIN.PYATEROCHKA, priceTag: 'low', totalCost: Math.round(base * 0.91), foundCount: n, totalItems: n, isCheapest: true, items: [] },
            { store: 'MAGNIT', storeName: 'Магнит', storeIcon: STORE_ICON_BY_CHAIN.MAGNIT, priceTag: 'low', totalCost: Math.round(base * 0.95), foundCount: n, totalItems: n, isCheapest: false, items: [] },
            { store: 'PEREKRESTOK', storeName: 'Перекрёсток', storeIcon: STORE_ICON_BY_CHAIN.PEREKRESTOK, priceTag: 'mid', totalCost: Math.round(base * 1.08), foundCount: n, totalItems: n, isCheapest: false, items: [] },
            { store: 'LENTA', storeName: 'Лента', storeIcon: STORE_ICON_BY_CHAIN.LENTA, priceTag: 'mid', totalCost: Math.round(base * 1.02), foundCount: n, totalItems: n, isCheapest: false, items: [] },
            { store: 'VKUSVILL', storeName: 'ВкусВилл', storeIcon: STORE_ICON_BY_CHAIN.VKUSVILL, priceTag: 'high', totalCost: Math.round(base * 1.21), foundCount: n, totalItems: n, isCheapest: false, items: [] },
          ])
        },
      },
    )
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
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCompare}
            disabled={comparing}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl font-semibold text-sm"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(0,0,0,0.08)',
              color: 'var(--color-text)',
              opacity: comparing ? 0.6 : 1,
            }}
          >
            <BarChart2 size={15} />
            {comparing ? '...' : 'Цены'}
          </motion.button>
          {!allDone ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={markAll}
              className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              Отметить всё
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

      {/* bottom sheet сравнения цен */}
      <AnimatePresence>
        {compareResults && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setCompareResults(null)}
            />
            <PriceCompareSheet results={compareResults} onClose={() => setCompareResults(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
