import { useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', padding: 24, gap: 12 }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, textAlign: 'center' }}>Что-то пошло не так</p>
          <p style={{ color: '#888', fontSize: 12, textAlign: 'center', wordBreak: 'break-all' }}>{(this.state.error as Error).message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 12, background: '#4CAF50', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600 }}>
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
import './styles/globals.css'
import SplashPage from './pages/SplashPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import BudgetInputPage from './pages/BudgetInputPage'
import GeneratingPage from './pages/GeneratingPage'
import MenuPage from './pages/MenuPage'
import ShoppingListPage from './pages/ShoppingListPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/BottomNav'
import { useAuth } from './hooks/useAuth'
import { useTelegramReady } from './hooks/useTelegram'

const queryClient = new QueryClient()

// таббар показываем только на главных экранах
const NAV_ROUTES = ['/menu', '/profile']

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)
  const { isReady } = useAuth()
  const initTelegram = useTelegramReady()

  // Тёмная тема: 1) ручная настройка, 2) Telegram colorScheme, 3) system
  useEffect(() => {
    const applyTheme = () => {
      const manual = localStorage.getItem('dark_mode')
      if (manual !== null) {
        document.documentElement.setAttribute('data-theme', manual === 'true' ? 'dark' : 'light')
        return
      }
      const tg = (window as Window & { Telegram?: { WebApp?: { colorScheme?: string } } }).Telegram?.WebApp
      const scheme = tg?.colorScheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', scheme)
    }
    applyTheme()
    const tg = (window as Window & { Telegram?: { WebApp?: { onEvent?: (e: string, cb: () => void) => void } } }).Telegram?.WebApp
    tg?.onEvent?.('themeChanged', applyTheme)
    return () => {
      const tg2 = (window as Window & { Telegram?: { WebApp?: { offEvent?: (e: string, cb: () => void) => void } } }).Telegram?.WebApp
      tg2?.offEvent?.('themeChanged', applyTheme)
    }
  }, [])

  // Сообщаем Telegram что приложение загружено и разворачиваем на весь экран
  useEffect(() => {
    if (isReady) initTelegram()
  }, [isReady, initTelegram])

  // Ждём завершения авторизации
  if (!isReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #4CAF50', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ color: '#888', fontSize: 14 }}>Загрузка...</span>
    </div>
  )

  return (
    <>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/budget" element={<BudgetInputPage />} />
        <Route path="/generating" element={<GeneratingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/shopping" element={<ShoppingListPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
