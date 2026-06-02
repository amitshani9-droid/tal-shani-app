import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Create from './pages/Create'
import CalendarPage from './pages/CalendarPage'
import History from './pages/History'
import Research from './pages/Research'
import Settings from './pages/Settings'
import BrandBook from './pages/BrandBook'
import BrandEnginePage from './pages/BrandEnginePage'
import Analytics from './pages/Analytics'
import WhatsApp from './pages/WhatsApp'

export default function App() {
  return (
    <div className="app-layout">
      <div className="app-main-content">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/create"       element={<Create />} />
          <Route path="/research"     element={<Research />} />
          <Route path="/calendar"     element={<CalendarPage />} />
          <Route path="/history"      element={<History />} />
          <Route path="/analytics"    element={<Analytics />} />
          <Route path="/whatsapp"     element={<WhatsApp />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="/brand"        element={<BrandBook />} />
          <Route path="/brand-engine" element={<BrandEnginePage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
