import { useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusSquare, BookOpen, TrendingUp, Clock, Zap, BarChart3, MessageCircle } from 'lucide-react'

const tabs = [
  { path: '/',              icon: Home,          label: 'ראשי' },
  { path: '/brand-engine',  icon: Zap,           label: 'מנוע מותג' },
  { path: '/create',        icon: PlusSquare,    label: 'פוסט' },
  { path: '/research',      icon: TrendingUp,    label: 'מחקר' },
  { path: '/history',       icon: Clock,         label: 'ארכיון' },
  { path: '/analytics',     icon: BarChart3,     label: 'אנליטיקס' },
  { path: '/whatsapp',      icon: MessageCircle, label: 'וואצאפ' },
  { path: '/brand',         icon: BookOpen,      label: 'מותג' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={`nav-wrapper ${pathname === '/settings' ? 'hide-on-mobile' : ''}`}>

      {/* Desktop sidebar brand */}
      <div className="sidebar-brand-header">
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--green-dark)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: 16 }}>🌿</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.3px' }}>
                טל שני
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>
                חוויות ארגוניות עם ערך
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, padding: '0 4px' }}>
          ניווט
        </div>
      </div>

      <nav className="nav-container">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-item-btn ${active ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.75} className="nav-icon" />
              <span className="nav-label">{label}</span>
              {active && <span className="nav-active-indicator" />}
            </button>
          )
        })}
      </nav>

      {/* Desktop sidebar footer */}
      <div className="sidebar-brand-footer" style={{ marginTop: 'auto' }}>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: pathname === '/settings' ? 'var(--green-pale)' : 'transparent',
            color: pathname === '/settings' ? 'var(--green-dark)' : 'var(--text-light)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 12,
            border: '1px solid transparent',
            fontSize: 13, fontWeight: pathname === '/settings' ? 700 : 500
          }}
        >
          <SettingsIcon size={17} strokeWidth={pathname === '/settings' ? 2.5 : 1.75} />
          הגדרות
        </button>
      </div>
    </div>
  )
}
