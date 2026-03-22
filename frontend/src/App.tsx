import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/globals.css'
import SplashPage from './pages/SplashPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import BudgetInputPage from './pages/BudgetInputPage'
import GeneratingPage from './pages/GeneratingPage'
import MenuPage from './pages/MenuPage'
import ProfilePage from './pages/ProfilePage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/budget" element={<BudgetInputPage />} />
          <Route path="/generating" element={<GeneratingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
