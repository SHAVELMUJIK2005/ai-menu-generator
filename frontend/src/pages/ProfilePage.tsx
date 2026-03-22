import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw, ChevronRight, LogOut } from 'lucide-react'
import { useOnboardingStore } from '../store/onboardingStore'

const PROFILE_LABELS: Record<string, string> = {
  STUDENT: '🎓 Студент', SPORT: '💪 Спорт', FAMILY: '👨‍👩‍👧 Семья', SINGLE: '🧑 Один', OFFICE: '💼 Офис',
}
const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: '📉 Сбросить вес', GAIN_WEIGHT: '📈 Набор массы',
  HEALTHY: '❤️ Правильное питание', CHEAP: '💰 Питаться дёшево',
}

// мок истории — 3 прошлых меню
const historyMock = [
  { id: '1', date: '20 марта', budget: 2500, days: 3, totalCost: 2340 },
  { id: '2', date: '17 марта', budget: 3000, days: 3, totalCost: 2810 },
  { id: '3', date: '14 марта', budget: 2000, days: 3, totalCost: 1950 },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profileType, goal, reset } = useOnboardingStore()

  const handleLogout = () => {
    localStorage.removeItem('onboarding_done')
    localStorage.removeItem('access_token')
    reset()
    navigate('/onboarding')
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      <div className="p-6 pt-10">
        {/* аватар */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(76,175,80,0.15)' }}
          >
            🥗
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Мой профиль</div>
            <div className="text-sm text-gray-400">
              {profileType ? PROFILE_LABELS[profileType] : '—'} · {goal ? GOAL_LABELS[goal] : '—'}
            </div>
          </div>
        </div>

        {/* статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Меню', value: historyMock.length },
            { label: 'Сэкономлено', value: '₽ 1 200' },
            { label: 'Дней', value: 9 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
              }}
            >
              <div className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* история меню */}
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>История меню</h2>
        <div className="flex flex-col gap-2 mb-6">
          {historyMock.map((item) => (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/menu')}
              className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
              }}
            >
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  Меню на {item.days} дня · {item.date}
                </div>
                <div className="text-xs text-gray-400">
                  Бюджет: {item.budget} ₽ · Потрачено: {item.totalCost} ₽
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); navigate('/generating') }}
                  className="p-2 rounded-xl"
                  style={{ background: 'rgba(76,175,80,0.1)', color: 'var(--color-primary)' }}
                >
                  <RefreshCw size={14} />
                </motion.button>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* настройки профиля */}
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Настройки</h2>
        <div className="flex flex-col gap-2 mb-6">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('onboarding_done')
              navigate('/onboarding')
            }}
            className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.5)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Изменить предпочтения</span>
            <ChevronRight size={16} className="text-gray-300" />
          </motion.div>
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.5)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Premium</span>
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(76,175,80,0.1)', color: 'var(--color-primary)' }}
            >
              Скоро
            </span>
          </div>
        </div>

        {/* выйти */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 py-2"
        >
          <LogOut size={16} />
          Сбросить профиль
        </motion.button>
      </div>
    </div>
  )
}

