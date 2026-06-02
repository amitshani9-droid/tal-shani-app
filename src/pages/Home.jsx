import { useNavigate } from 'react-router-dom'
import { PlusCircle, Calendar, TrendingUp, Settings as SettingsIcon, BarChart2, Briefcase, Smartphone } from 'lucide-react'
import { storage, formatDate } from '../services/storage'

const PLATFORM_STYLE = {
  instagram: { bg: '#FDF2F8', color: '#BE185D' },
  facebook:  { bg: '#EFF6FF', color: '#1D4ED8' },
  linkedin:  { bg: '#F0F9FF', color: '#0369A1' },
}

export default function Home() {
  const navigate = useNavigate()
  const posts    = storage.getPosts()
  const drafts   = storage.getDrafts()
  const calendar = storage.getCalendar()

  const today        = new Date()
  const dateStr      = today.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
  const todayStr     = today.toISOString().split('T')[0]
  const upcoming     = calendar.filter(c => c.scheduledFor >= todayStr).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }} className="fade-in">

      {/* ── Gradient Header ── */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 28px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(143,175,135,0.12)', borderRadius: '50%' }} />
        <div className="desktop-header-wrap" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {dateStr}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.2 }}>שלום טל.</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginTop: 4 }}>סקירת פעילות ומדדים</div>
            </div>
            <button
              onClick={() => navigate('/settings')}
              style={{
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.18)'
              }}
              className="hover-lift hide-on-desktop"
              aria-label="הגדרות"
            >
              <SettingsIcon size={18} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="desktop-header-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
            {[
              { label: 'סה״כ פוסטים',     value: posts.length  },
              { label: 'טיוטות ממתינות', value: drafts.length },
              { label: 'מתוזמנים',        value: upcoming      },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                padding: '16px',
                borderRight: i < 2 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="desktop-container home-grid">

        {/* Quick Actions */}
        <div className="home-actions-section">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
            פעולות מרכזיות
          </div>

          <button onClick={() => navigate('/create')} style={{
            width: '100%',
            background: 'var(--green-dark)',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            marginBottom: 24,
            color: '#fff',
            border: 'none',
            textAlign: 'right',
            boxShadow: 'var(--shadow-glow)'
          }} className="hover-lift">
            <div style={{
              width: 48, height: 48,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16
            }}>
              <PlusCircle size={24} color="#fff" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>יצירת פוסט חדש</div>
            <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 400 }}>מחולל תוכן אוטומטי מבוסס בינה מלאכותית</div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button onClick={() => navigate('/calendar')} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
            }} className="hover-lift">
              <div style={{
                width: 32, height: 32, borderRadius: '6px',
                background: 'var(--green-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <Calendar size={18} color="var(--green-dark)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>לוח תוכן</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{upcoming} מתוזמנים</div>
            </button>

            <button onClick={() => navigate('/research')} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
            }} className="hover-lift">
              <div style={{
                width: 32, height: 32, borderRadius: '6px',
                background: 'var(--earth-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <TrendingUp size={18} color="var(--earth)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>חקר שוק</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>טרנדים שבועיים</div>
            </button>

            <button onClick={() => navigate('/history')} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: 16,
              gridColumn: 'span 2'
            }} className="hover-lift">
              <div style={{
                width: 32, height: 32, borderRadius: '6px',
                background: '#EFF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <BarChart2 size={18} color="#1D4ED8" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>ארכיון ופעילות</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{posts.length} פורסמו · {drafts.length} טיוטות</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="home-posts-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              היסטוריית פעילות
            </div>
            <button onClick={() => navigate('/history')} style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, background: 'none' }} className="hover-lift">
              לכל הפעילות
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px',
              textAlign: 'center', padding: '48px 20px'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BarChart2 size={20} color="var(--text-muted)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>אין נתונים להצגה</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>הפוסטים שתפרסמי יופיעו כאן</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.slice(0, 5).map(post => {
                const pc = PLATFORM_STYLE[post.platform] || { bg: 'var(--green-pale)', color: 'var(--green-dark)' }
                return (
                  <div key={post.id} style={{
                    background: 'var(--white)', border: '1px solid var(--border)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                    gap: 16, padding: '16px', cursor: 'pointer'
                  }} className="hover-lift" onClick={() => navigate('/history')}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '6px', flexShrink: 0,
                      background: pc.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {post.platform === 'linkedin'
                        ? <Briefcase size={18} color={pc.color} />
                        : <Smartphone size={18} color={pc.color} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', marginBottom: 4
                      }}>
                        <span dir="auto">{post.content}</span>
                      </p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {formatDate(post.createdAt)}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: '4px',
                          background: pc.bg, color: pc.color, fontWeight: 600
                        }}>
                          {post.platformLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
