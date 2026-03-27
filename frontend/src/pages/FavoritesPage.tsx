import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, UtensilsCrossed } from 'lucide-react'
import { useMenuHistory } from '../hooks/useMenu'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import type { MenuRecord } from '../api/menu'

function MenuHistoryCard({ record, onLoad }: { record: MenuRecord; onLoad: () => void }) {
  const { impact } = useHaptic()
  const date = new Date(record.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
  const statusColor = record.status === 'DONE' ? '#4CAF50' : record.status === 'FAILED' ? '#f44336' : '#FF9800'
  const statusLabel = record.status === 'DONE' ? 'Готово' : record.status === 'FAILED' ? 'Ошибка' : 'Генерируется'

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="p-4 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Меню на {record.daysCount} {record.daysCount === 1 ? 'день' : record.daysCount < 5 ? 'дня' : 'дней'}
          </div>
          <div className="text-xs text-gray-400">{date} · бюджет {record.budgetInput} ₽</div>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${statusColor}18`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {record.parsedMenu && (
        <div className="text-xs text-gray-400 mb-3 line-clamp-1">
          {record.parsedMenu.days[0]?.meals.slice(0, 2).map((m) => m.name).join(', ')}...
        </div>
      )}

      {record.status === 'DONE' && record.parsedMenu && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { impact('light'); onLoad() }}
          className="w-full py-2.5 rounded-xl font-semibold text-sm"
          style={{ background: 'rgba(76,175,80,0.1)', color: 'var(--color-primary)' }}
        >
          Загрузить это меню
        </motion.button>
      )}
    </motion.div>
  )
}

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { impact } = useHaptic()
  const { setMenu } = useMenuStore()
  const { data, isLoading, refetch } = useMenuHistory(1)

  const { isPulling, pullProgress, isRefreshing } = usePullToRefresh({
    onRefresh: async () => { await refetch() },
  })

  const records: MenuRecord[] = (data?.items ?? []).map((item: Omit<MenuRecord, 'userId' | 'status' | 'shoppingList'>) => ({
    ...item,
    userId: '',
    status: 'DONE' as const,
    shoppingList: null,
  }))

  const handleLoad = (record: MenuRecord) => {
    if (record.parsedMenu) {
      setMenu(record.parsedMenu, record.id)
      navigate('/menu')
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Pull-to-refresh индикатор */}
      {(isPulling || isRefreshing) && (
        <div className="flex justify-center pt-4">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ repeat: isRefreshing ? Infinity : 0, duration: 0.7, ease: 'linear' }}
            style={{ opacity: isRefreshing ? 1 : pullProgress, color: 'var(--color-primary)' }}
          >
            ↻
          </motion.div>
        </div>
      )}
      <div className="p-6 pt-10">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          История меню
        </h1>
        <p className="text-sm text-gray-400 mb-6">Ваши сгенерированные меню</p>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
            ))}
          </div>
        )}

        {!isLoading && records.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Heart size={56} className="text-gray-200" />
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Пока пусто</h2>
            <p className="text-sm text-gray-400">Составьте первое меню</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { impact('light'); navigate('/budget') }}
              className="px-6 py-3 rounded-2xl font-semibold text-white text-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              <UtensilsCrossed size={16} className="inline mr-2" />
              Составить меню
            </motion.button>
          </div>
        )}

        {!isLoading && records.length > 0 && (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <MenuHistoryCard key={record.id} record={record} onLoad={() => handleLoad(record)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
