import { motion } from 'framer-motion'
import LiquidCard from '../../components/LiquidCard'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useHaptic } from '../../hooks/useTelegram'

const stores = [
  { id: 'PYATEROCHKA', label: 'Пятёрочка', emoji: '🟡', priceTag: '₽', desc: 'Бюджетно · точные цены' },
  { id: 'MAGNIT',      label: 'Магнит',     emoji: '🔴', priceTag: '₽', desc: 'Бюджетно · точные цены' },
  { id: 'PEREKRESTOK', label: 'Перекрёсток', emoji: '🟢', priceTag: '₽₽', desc: 'Средний ценовой сегмент' },
  { id: 'LENTA',       label: 'Лента',      emoji: '🔵', priceTag: '₽₽', desc: 'Гипермаркет · широкий выбор' },
  { id: 'VKUSVILL',    label: 'ВкусВилл',   emoji: '🟩', priceTag: '₽₽₽', desc: 'Эко-продукты · органика' },
]

export default function StoreSelectPage() {
  const { storeChain, setStoreChain, nextStep } = useOnboardingStore()
  const { selection, impact } = useHaptic()

  const handleSelect = (id: string) => {
    selection()
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
      <p className="text-sm text-gray-500 mb-2">Выберите магазин — получите точные цены на продукты</p>

      {/* подсказка */}
      <div
        className="rounded-xl px-3 py-2 mb-2 text-xs"
        style={{ background: 'rgba(76,175,80,0.08)', color: 'var(--color-primary)' }}
      >
        💡 Без магазина цены будут приблизительными (±15%)
      </div>

      <div className="flex flex-col gap-3">
        {stores.map(({ id, label, emoji, priceTag, desc }) => (
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
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{
                  background: storeChain === id ? 'rgba(76,175,80,0.15)' : 'var(--color-subtle-bg)',
                  color: storeChain === id ? 'var(--color-primary)' : '#999',
                }}
              >
                {priceTag}
              </span>
              {storeChain === id && <div className="text-green-500 font-bold">✓</div>}
            </LiquidCard>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => { impact('light'); nextStep() }}
        className="mt-auto py-4 rounded-2xl font-semibold text-base transition-all"
        style={{
          background: storeChain ? 'var(--color-primary)' : 'var(--color-card)',
          color: storeChain ? 'white' : 'var(--color-text)',
          backdropFilter: 'blur(20px)',
          border: `1.5px solid var(--color-card-border)`,
        }}
      >
        {storeChain ? 'Продолжить' : 'Пропустить'}
      </motion.button>
    </motion.div>
  )
}
