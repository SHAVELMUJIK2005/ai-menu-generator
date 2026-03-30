import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Moon, ChevronRight, Info } from 'lucide-react'
import { useHaptic } from '../hooks/useTelegram'
import { useOnboardingStore } from '../store/onboardingStore'

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <motion.button
      onClick={() => !disabled && onChange(!checked)}
      className="relative w-12 h-6 rounded-full flex-shrink-0"
      style={{
        background: checked && !disabled ? 'var(--color-primary)' : '#ddd',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
}

function SettingsRow({
  icon,
  label,
  desc,
  right,
  onClick,
  border = true,
}: {
  icon: React.ReactNode
  label: string
  desc?: string
  right: React.ReactNode
  onClick?: () => void
  border?: boolean
}) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 ${border ? 'border-t border-white/20' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(76,175,80,0.1)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</div>
        {desc && <div className="text-xs text-gray-400">{desc}</div>}
      </div>
      {right}
    </motion.div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { impact } = useHaptic()
  const { setStep } = useOnboardingStore()

  const [notifications, setNotifications] = useState(
    () => localStorage.getItem('notif_enabled') !== 'false',
  )
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    impact('light')
    setter(value)
    localStorage.setItem(key, String(value))
    if (key === 'dark_mode') {
      document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
    }
  }

  const card = {
    background: 'var(--color-card)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1.5px solid var(--color-card-border)',
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Шапка */}
      <div className="flex items-center gap-3 p-6 pt-12">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { impact('light'); navigate(-1) }}
          className="p-2.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
        </motion.button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Настройки</h1>
      </div>

      <div className="px-6 flex flex-col gap-5">
        {/* Уведомления */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Уведомления
          </p>
          <div className="rounded-2xl overflow-hidden" style={card}>
            <SettingsRow
              border={false}
              icon={<Bell size={16} style={{ color: 'var(--color-primary)' }} />}
              label="Напоминания о меню"
              desc="Ежедневно в 8:00"
              right={
                <Toggle
                  checked={notifications}
                  onChange={(v) => handleToggle('notif_enabled', v, setNotifications)}
                />
              }
            />
          </div>
        </section>

        {/* Интерфейс */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Интерфейс
          </p>
          <div className="rounded-2xl overflow-hidden" style={card}>
            <SettingsRow
              border={false}
              icon={<Moon size={16} style={{ color: 'var(--color-primary)' }} />}
              label="Тёмная тема"
              right={
                <Toggle
                  checked={darkMode}
                  onChange={(v) => handleToggle('dark_mode', v, setDarkMode)}
                />
              }
            />
          </div>
        </section>

        {/* Предпочтения */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Предпочтения
          </p>
          <div className="rounded-2xl overflow-hidden" style={card}>
            <SettingsRow
              border={false}
              icon={<span className="text-sm">🚫</span>}
              label="Нелюбимые продукты"
              desc="Изменить список исключений"
              right={<ChevronRight size={16} className="text-gray-300" />}
              onClick={() => {
                impact('light')
                setStep(4)
                navigate('/onboarding')
              }}
            />
            <SettingsRow
              icon={<span className="text-sm">⚠️</span>}
              label="Аллергены"
              desc="Продукты, которых стоит избегать"
              right={<ChevronRight size={16} className="text-gray-300" />}
              onClick={() => {
                impact('light')
                setStep(4)
                navigate('/onboarding')
              }}
            />
          </div>
        </section>

        {/* О приложении */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            О приложении
          </p>
          <div className="rounded-2xl overflow-hidden" style={card}>
            <SettingsRow
              border={false}
              icon={<Info size={16} style={{ color: '#999' }} />}
              label="ЗОЖ-Рацион с ИИ"
              desc="Версия 1.0 · greenmenuai.ru"
              right={<span className="text-xs text-gray-300">v1.0</span>}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
