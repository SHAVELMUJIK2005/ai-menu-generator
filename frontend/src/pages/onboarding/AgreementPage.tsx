import { motion } from 'framer-motion'
import { useState } from 'react'
import LiquidCard from '../../components/LiquidCard'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useHaptic } from '../../hooks/useTelegram'

export default function AgreementPage() {
  const [checked, setChecked] = useState(false)
  const { nextStep, setAgreementAccepted } = useOnboardingStore()
  const { impact, success } = useHaptic()

  const handleNext = () => {
    if (!checked) return
    success()
    setAgreementAccepted(true)
    nextStep()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 gap-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="text-4xl">🥗</div>
      <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
        AI Menu Generator
      </h1>

      <LiquidCard className="w-full max-w-sm">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          Сервис <strong>не является медицинской рекомендацией</strong>. Меню создаётся автоматически
          на основе ваших предпочтений. При наличии заболеваний проконсультируйтесь с врачом перед
          изменением рациона.
        </p>
        <div className="flex gap-4 mt-3">
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Условия использования
          </a>
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Политика конфиденциальности
          </a>
        </div>
      </LiquidCard>

      <label
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => impact('light')}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-5 h-5 accent-green-500 rounded"
        />
        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
          Принимаю условия использования
        </span>
      </label>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        disabled={!checked}
        className="w-full max-w-sm py-4 rounded-2xl font-semibold text-white text-base transition-all"
        style={{
          background: checked ? 'var(--color-primary)' : '#ccc',
          cursor: checked ? 'pointer' : 'not-allowed',
        }}
      >
        Далее
      </motion.button>
    </motion.div>
  )
}
