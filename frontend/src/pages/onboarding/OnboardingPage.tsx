import { AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '../../store/onboardingStore'
import AgreementPage from './AgreementPage'
import ProfileSelectPage from './ProfileSelectPage'
import GoalSelectPage from './GoalSelectPage'
import StoreSelectPage from './StoreSelectPage'
import DislikedProductsPage from './DislikedProductsPage'

const STEPS = [
  AgreementPage,
  ProfileSelectPage,
  GoalSelectPage,
  StoreSelectPage,
  DislikedProductsPage,
]

export default function OnboardingPage() {
  const { step } = useOnboardingStore()
  const StepComponent = STEPS[step] ?? STEPS[0]

  return (
    <div className="relative overflow-hidden">
      {/* прогресс-бар */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--color-primary)' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <StepComponent key={step} />
      </AnimatePresence>
    </div>
  )
}

