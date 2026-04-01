import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import { useMenuStore } from '../store/menuStore'
import { useHaptic } from '../hooks/useTelegram'
import { getRawMenu } from '../api/menu'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { impact } = useHaptic()
  const { data: favorites, isLoading } = useFavorites()
  const { mutate: removeFav } = useRemoveFavorite()
  const setMenu = useMenuStore((s) => s.setMenu)

  const handleOpen = async (menuId: string) => {
    impact('light')
    try {
      const record = await getRawMenu(menuId)
      if (record.status === 'DONE' && record.parsedMenu) {
        setMenu(record.parsedMenu, menuId)
        navigate('/menu')
      }
    } catch {
      // меню недоступно
    }
  }

  const handleRemove = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation()
    impact('medium')
    removeFav(menuId)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-3 p-6 pt-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/menu')}
          className="p-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.5)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
        </motion.button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Избранное</h1>
      </div>

      <div className="px-6 flex flex-col gap-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.72)' }} />
          ))
        ) : !favorites?.length ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bookmark size={48} color="#ddd" />
            <p className="text-sm text-gray-400">Нет сохранённых меню</p>
            <p className="text-xs text-gray-300">Нажмите на закладку в меню, чтобы сохранить</p>
          </div>
        ) : (
          favorites.map((fav) => (
            <motion.div
              key={fav.menuId}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpen(fav.menuId)}
              className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
              }}
            >
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  Меню на {fav.menu.daysCount} {fav.menu.daysCount === 3 ? 'дня' : 'дней'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Бюджет: {fav.menu.budgetInput} ₽ ·{' '}
                  {new Date(fav.menu.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => handleRemove(e, fav.menuId)}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35' }}
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
