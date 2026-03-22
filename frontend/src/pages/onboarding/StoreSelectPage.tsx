import { motion } from 'framer-motion'
import LiquidCard from '../../components/LiquidCard'
import { useOnboardingStore } from '../../store/onboardingStore'

const stores = [
  { id: 'PYATEROCHKA', label: 'Пятёрочка', emoji: '🟡' },
  { id: 'PEREKRESTOK', label: 'Перекрёсток', emoji: '🟢' },
  { id: 'MAGNIT', label: 'Магнит', emoji: '🔴' },
  { id: 'VKUSVILL', label: 'ВкусВилл', emoji: '🟩' },
  { id: 'LENTA', label: 'Лента', emoji: '🔵' },
]

export default function StoreSelectPage() {
  const { storeChain, setStoreChain, nextStep } = useOnboardingStore()

  const handleSelect = (id: string) => {
    setStoreChain(storeChain === id ? null : id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-screen p-6 gap-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1 className="text-2xl font-bold mt-8 mb-2" style={{ color: 'var(--color-text)' }}>
        Ваш магазин?
      </h1>
      <p className="text-sm text-gray-500 mb-4">Выберите магазин для точных цен или пропустите</p>

      <div className="flex flex-col gap-3">
        {stores.map(({ id, label, emoji }) => (
          <motion.div
            key={id}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <LiquidCard
              onClick={() => handleSelect(id)}
              selected={storeChain === id}
              className="flex items-center gap-4"
            >
              <span className="text-2xl">{emoji}</span>
              <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{label}</div>
              {storeChain === id && <div className="ml-auto text-green-500 font-bold text-lg">✓</div>}
            </LiquidCard>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={nextStep}
        className="mt-auto py-4 rounded-2xl font-semibold text-base transition-all"
        style={{
          background: storeChain ? 'var(--color-primary)' : 'rgba(255,255,255,0.72)',
          color: storeChain ? 'white' : 'var(--color-text)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255,255,255,0.5)',
        }}
      >
        {storeChain ? 'Продолжить' : 'Пропустить (цены приблизительные)'}
      </motion.button>
    </motion.div>
  )
}
