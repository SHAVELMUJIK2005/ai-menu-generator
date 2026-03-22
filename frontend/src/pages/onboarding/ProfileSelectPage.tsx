import { motion } from 'framer-motion'
import { GraduationCap, Dumbbell, Users, User, Briefcase } from 'lucide-react'
import LiquidCard from '../../components/LiquidCard'
import { useOnboardingStore } from '../../store/onboardingStore'
import type { ProfileType } from '../../../../shared/src/types'

const profiles: { type: ProfileType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'STUDENT', label: 'Студент', icon: <GraduationCap size={28} />, desc: 'Бюджетное и быстрое питание' },
  { type: 'SPORT', label: 'Спорт', icon: <Dumbbell size={28} />, desc: 'Высокобелковый рацион' },
  { type: 'FAMILY', label: 'Семья', icon: <Users size={28} />, desc: 'Питание для всей семьи' },
  { type: 'SINGLE', label: 'Один', icon: <User size={28} />, desc: 'Порции на одного' },
  { type: 'OFFICE', label: 'Офис', icon: <Briefcase size={28} />, desc: 'Быстро и сытно' },
]

export default function ProfileSelectPage() {
  const { profileType, setProfileType, nextStep } = useOnboardingStore()

  const handleSelect = (type: ProfileType) => {
    setProfileType(type)
    setTimeout(nextStep, 300)
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
        Кто вы?
      </h1>
      <p className="text-sm text-gray-500 mb-4">Выберите ваш профиль — это поможет подобрать подходящее меню</p>

      <div className="flex flex-col gap-3">
        {profiles.map(({ type, label, icon, desc }) => (
          <motion.div
            key={type}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <LiquidCard
              onClick={() => handleSelect(type)}
              selected={profileType === type}
              className="flex items-center gap-4"
            >
              <div
                className="p-2 rounded-xl"
                style={{ color: profileType === type ? '#4CAF50' : '#666', background: profileType === type ? 'rgba(76,175,80,0.1)' : 'transparent' }}
              >
                {icon}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              {profileType === type && (
                <div className="ml-auto text-green-500 font-bold text-lg">✓</div>
              )}
            </LiquidCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
