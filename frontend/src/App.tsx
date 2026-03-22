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
import BottomNav from './components/BottomNav'
import { useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

// таббар показываем только на главных экранах
const NAV_ROUTES = ['/menu', '/shopping', '/profile']

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)
  const { isReady } = useAuth()

  // Ждём завершения авторизации (токен получен или бэкенд недоступен)
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
