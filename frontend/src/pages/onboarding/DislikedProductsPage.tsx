import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useUpdateProfile } from '../../hooks/useProfile'
import { useHaptic } from '../../hooks/useTelegram'

const ALL_PRODUCTS = [
  'Печень', 'Брокколи', 'Творог', 'Рыба', 'Лук', 'Грибы',
  'Баклажаны', 'Свёкла', 'Сельдерей', 'Морепродукты', 'Орехи', 'Молоко',
  'Капуста', 'Горох', 'Чечевица', 'Кинза', 'Оливки', 'Шпинат',
]

export default function DislikedProductsPage() {
  const { dislikedProducts, toggleDislikedProduct, profileType, goal } = useOnboardingStore()
  const navigate = useNavigate()
  const { mutate: updateProfile } = useUpdateProfile()
  const { impact, success } = useHaptic()
  const [customInput, setCustomInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (!dislikedProducts.includes(trimmed)) {
      impact('light')
      toggleDislikedProduct(trimmed)
    }
    setCustomInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addCustom()
  }

  const handleDone = () => {
    success()
    localStorage.setItem('onboarding_done', '1')
    if (profileType && goal) {
      updateProfile({ profileType, goal, dislikedProducts })
    }
    navigate('/budget')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-screen p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1 className="text-2xl font-bold mt-8 mb-2" style={{ color: 'var(--color-text)' }}>
        Что не едите?
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Выберите или добавьте продукты, которые не хотите видеть в меню
      </p>

      {/* поле ввода своего продукта */}
      <div className="flex gap-2 mb-5">
        <input
          ref={inputRef}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить свой продукт..."
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: 'var(--color-text)',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="p-2.5 rounded-2xl flex items-center justify-center"
          style={{
            background: customInput.trim() ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)',
            color: customInput.trim() ? 'white' : '#ccc',
          }}
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* теги */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_PRODUCTS.map((product) => {
          const isSelected = dislikedProducts.includes(product)
          return (
            <motion.button
              key={product}
              whileTap={{ scale: 0.93 }}
              onClick={() => { impact('light'); toggleDislikedProduct(product) }}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: isSelected ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(10px)',
                border: isSelected ? '1.5px solid #FF6B35' : '1.5px solid rgba(255,255,255,0.5)',
                color: isSelected ? '#FF6B35' : 'var(--color-text)',
                textDecoration: isSelected ? 'line-through' : 'none',
              }}
            >
              {product}
            </motion.button>
          )
        })}
        {/* пользовательские добавленные */}
        {dislikedProducts
          .filter((p) => !ALL_PRODUCTS.includes(p))
          .map((product) => (
            <motion.button
              key={product}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => { impact('light'); toggleDislikedProduct(product) }}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(255,107,53,0.15)',
                border: '1.5px solid #FF6B35',
                color: '#FF6B35',
              }}
            >
              {product}
              <X size={12} />
            </motion.button>
          ))}
      </div>

      <AnimatePresence>
        {dislikedProducts.length > 0 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-gray-400 mb-4"
          >
            Исключено {dislikedProducts.length} продукт{dislikedProducts.length === 1 ? '' : dislikedProducts.length < 5 ? 'а' : 'ов'}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleDone}
        className="mt-auto py-4 rounded-2xl font-semibold text-white text-base"
        style={{ background: 'var(--color-primary)' }}
      >
        Готово →
      </motion.button>
    </motion.div>
  )
}
