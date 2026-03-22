import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useUpdateProfile } from '../../hooks/useProfile'

const ALL_PRODUCTS = [
  'Печень', 'Брокколи', 'Творог', 'Рыба', 'Лук', 'Грибы',
  'Баклажаны', 'Свёкла', 'Сельдерей', 'Морепродукты', 'Орехи', 'Молоко',
  'Капуста', 'Горох', 'Чечевица', 'Кинза', 'Оливки', 'Шпинат',
]

export default function DislikedProductsPage() {
  const { dislikedProducts, toggleDislikedProduct, profileType, goal } = useOnboardingStore()
  const navigate = useNavigate()
  const { mutate: updateProfile } = useUpdateProfile()

  const handleDone = () => {
    localStorage.setItem('onboarding_done', '1')
    // Синхронизируем профиль с бэкендом (молча — не ждём ответа)
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
        Выберите продукты, которые не хотите видеть в меню
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_PRODUCTS.map((product) => {
          const isSelected = dislikedProducts.includes(product)
          return (
            <motion.button
              key={product}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleDislikedProduct(product)}
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
      </div>

      {dislikedProducts.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          Исключено: {dislikedProducts.join(', ')}
        </p>
      )}

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
