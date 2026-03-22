import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { menuMock } from '../mocks/menuMock'

export default function ShoppingListPage() {
  const navigate = useNavigate()
  const items = menuMock.shoppingList
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const totalUnchecked = items
    .filter((i) => !checked.has(i.name))
    .reduce((sum, i) => sum + i.estimatedPrice, 0)

  const totalAll = items.reduce((sum, i) => sum + i.estimatedPrice, 0)

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      {/* шапка */}
      <div className="flex items-center gap-3 p-6 pt-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/menu')}
          className="p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.5)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
        </motion.button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Список покупок</h1>
      </div>

      <div className="px-6">
        {/* прогресс */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Куплено {checked.size} из {items.length}</span>
            <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
              Осталось ~{totalUnchecked} ₽
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--color-primary)', width: `${(checked.size / items.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* список */}
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const done = checked.has(item.name)
            return (
              <motion.div
                key={item.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(item.name)}
                className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: done ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(20px)',
                  border: done ? '1.5px solid rgba(76,175,80,0.3)' : '1.5px solid rgba(255,255,255,0.5)',
                }}
              >
                {/* чекбокс */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: done ? 'var(--color-primary)' : 'transparent',
                    border: done ? 'none' : '2px solid #ddd',
                  }}
                >
                  {done && <Check size={14} color="white" strokeWidth={3} />}
                </div>

                {/* название */}
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
                  <div className="text-xs text-gray-400">
                    {item.totalAmount} {item.unit}
                  </div>
                </div>

                {/* цена */}
                <span
                  className="text-sm font-semibold"
                  style={{ color: done ? '#aaa' : 'var(--color-primary)' }}
                >
                  ~{item.estimatedPrice} ₽
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* нижняя панель */}
      <div
        className="fixed bottom-0 inset-x-0 p-4"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex justify-between text-sm mb-3 px-1">
          <span className="text-gray-400">Итого по списку</span>
          <span className="font-bold" style={{ color: 'var(--color-text)' }}>~{totalAll} ₽</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setChecked(new Set(items.map((i) => i.name)))}
          className="w-full py-3 rounded-2xl font-semibold text-white text-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          Отметить всё купленным
        </motion.button>
      </div>
    </div>
  )
}
