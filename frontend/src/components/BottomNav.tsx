import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UtensilsCrossed, ShoppingCart, User } from 'lucide-react'

const TABS = [
  { path: '/menu', label: 'Меню', icon: UtensilsCrossed },
  { path: '/shopping', label: 'Покупки', icon: ShoppingCart },
  { path: '/profile', label: 'Профиль', icon: User },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div
      className="fixed bottom-0 inset-x-0 flex items-center justify-around px-4 pb-safe pt-2"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        height: 64,
      }}
    >
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        return (
          <motion.button
            key={path}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 flex-1 py-1"
          >
            <Icon
              size={22}
              style={{ color: active ? 'var(--color-primary)' : '#bbb' }}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className="text-xs font-medium"
              style={{ color: active ? 'var(--color-primary)' : '#bbb' }}
            >
              {label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
