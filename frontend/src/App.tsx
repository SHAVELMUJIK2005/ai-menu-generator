import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/globals.css'
import SplashPage from './pages/SplashPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import BudgetInputPage from './pages/BudgetInputPage'
import GeneratingPage from './pages/GeneratingPage'
import MenuPage from './pages/MenuPage'
import ShoppingListPage from './pages/ShoppingListPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import PremiumPage from './pages/PremiumPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/BottomNav'
import { useAuth } from './hooks/useAuth'
import { useTelegramReady } from './hooks/useTelegram'

const queryClient = new QueryClient()

// таббар показываем только на главных экранах
const NAV_ROUTES = ['/menu', '/shopping', '/favorites', '/profile']

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)
  const { isReady, authFailed, retry } = useAuth()
  const initTelegram = useTelegramReady()

  // Сообщаем Telegram что приложение загружено и разворачиваем на весь экран
  useEffect(() => {
    if (isReady) initTelegram()
  }, [isReady, initTelegram])

  // Авторизация провалилась — показываем экран с кнопкой повтора
  if (authFailed) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 p-6"
        style={{ background: 'var(--color-bg)' }}
      >
        <p className="text-base text-center" style={{ color: 'var(--color-text)' }}>
          Не удалось подключиться к серверу
        </p>
        <button
          onClick={retry}
          className="px-6 py-3 rounded-2xl text-white font-semibold"
          style={{ background: 'var(--color-primary)' }}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  // Ждём завершения авторизации (токен ещё не получен)
  if (!isReady) return null

  return (
    <>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/budget" element={<BudgetInputPage />} />
        <Route path="/generating" element={<GeneratingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/shopping" element={<ShoppingListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
