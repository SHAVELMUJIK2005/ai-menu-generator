import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, ShoppingCart, User } from 'lucide-react'
import { useHaptic } from '../hooks/useTelegram'
import { useStats } from '../hooks/useProfile'

const TABS = [
  { path: '/menu', label: 'Меню', icon: UtensilsCrossed },
  { path: '/shopping', label: 'Покупки', icon: ShoppingCart },
  { path: '/profile', label: 'Профиль', icon: User },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { impact } = useHaptic()
  const { data: stats } = useStats()

  // Показываем бейдж на профиле если лимит генераций заканчивается
  const showProfileBadge =
    stats?.generationsLeft !== null &&
    stats?.generationsLeft !== undefined &&
    stats.generationsLeft <= 1

  return (
    <div
      className="fixed bottom-0 inset-x-0 flex items-center justify-around px-4 pb-safe pt-2"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        height: 64,
        zIndex: 30,
      }}
    >
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        const hasBadge = path === '/profile' && showProfileBadge

        return (
          <motion.button
            key={path}
            whileTap={{ scale: 0.88 }}
            onClick={() => { impact('light'); navigate(path) }}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 relative"
          >
            {/* активный индикатор */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute top-0 inset-x-3 h-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>

            <div className="relative">
              <Icon
                size={22}
                style={{ color: active ? 'var(--color-primary)' : '#bbb' }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {/* бейдж */}
              {hasBadge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                  style={{ background: '#FF6B35' }}
                />
              )}
            </div>

            <motion.span
              animate={{ color: active ? '#4CAF50' : '#bbb' }}
              className="text-xs font-medium"
            >
              {label}
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}
