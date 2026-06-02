import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { storage, platformLabels, contentTypeLabels, formatDate } from '../services/storage'

const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

export default function CalendarPage() {
  const navigate = useNavigate()
  const [calItems, setCalItems] = useState(storage.getCalendar())
  const [today] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', platform: 'instagram', contentType: 'tip', scheduledFor: '' })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayStr = new Date().toISOString().split('T')[0]
  const activeUpcomingItems = calItems
    .filter(item => item.scheduledFor >= todayStr)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))

  function getItemsForDay(day) {
    return calItems.filter(item => {
      const d = new Date(item.scheduledFor)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function handleAdd() {
    if (!newItem.title || !newItem.scheduledFor) return
    storage.saveCalendarItem(newItem)
    setCalItems(storage.getCalendar())
    setNewItem({ title: '', platform: 'instagram', contentType: 'tip', scheduledFor: '' })
    setShowAdd(false)
  }

  function handleDelete(id) {
    storage.deleteCalendarItem(id)
    setCalItems(storage.getCalendar())
    setConfirmDeleteId(null)
  }

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
      
      {/* Header */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(143,175,135,0.12)', borderRadius: '50%' }} />
        <div className="desktop-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.4px' }}>לוח תוכן שבועי</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginTop: 4 }}>
              תכנון ופרסום פוסטים קדימה ({calItems.length} פריטים סה"כ)
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              width: 42, height: 42,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.18)'
            }}
            className="hover-lift"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="desktop-container">
        {/* Month Selector Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          padding: '12px 18px', marginBottom: 14,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
        }}>
          <button 
            onClick={() => setViewDate(new Date(year, month - 1, 1))} 
            style={{ background: 'none', color: 'var(--text-mid)', padding: 4 }}
            className="hover-lift"
          >
            <ChevronRight size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}>
            {MONTHS[month]} {year}
          </span>
          <button 
            onClick={() => setViewDate(new Date(year, month + 1, 1))} 
            style={{ background: 'none', color: 'var(--text-mid)', padding: 4 }}
            className="hover-lift"
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        {/* Calendar Grid Box */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)', marginBottom: 20
        }} className="hover-lift">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: 'center', padding: '10px 4px',
                fontSize: 12, fontWeight: 700, color: 'var(--text-dark)',
                background: 'rgba(74, 92, 66, 0.03)', borderBottom: '1px solid var(--border)'
              }}>{d}</div>
            ))}
            {cells.map((day, i) => {
              const items = day ? getItemsForDay(day) : []
              const activeDay = day && isToday(day)
              return (
                <div key={i} style={{
                  minHeight: 64, padding: 4,
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid rgba(232, 223, 216, 0.5)' : 'none',
                  borderBottom: '1px solid rgba(232, 223, 216, 0.5)',
                  background: activeDay ? 'var(--green-pale)' : 'transparent',
                  position: 'relative'
                }}>
                  {day && (
                    <>
                      <div style={{
                        fontSize: 12, fontWeight: activeDay ? 700 : 500,
                        color: activeDay ? 'var(--green-dark)' : 'var(--text-dark)',
                        marginBottom: 4, textAlign: 'center'
                      }}>{day}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.slice(0, 2).map(item => (
                          <div key={item.id} style={{
                            fontSize: 9, background: 'var(--green-dark)',
                            color: 'white', borderRadius: 4, padding: '2px 4px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            fontWeight: 500,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                          }} title={item.title}>
                            {item.title}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <div style={{ fontSize: 9, color: 'var(--green-mid)', fontWeight: 700, textAlign: 'center', marginTop: 1 }}>
                            +{items.length - 2} נוספים
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming List Section */}
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          הפוסטים הבאים בלוח
        </p>
        
        {activeUpcomingItems.slice(0, 8).map(item => (
          <div key={item.id} style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            padding: '14px 16px', marginBottom: 10,
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 14
          }} className="hover-lift">
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: 'var(--green-pale)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(74, 92, 66, 0.1)'
            }}>
              <Calendar size={18} color="var(--green-dark)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>{item.title}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 500 }}>
                {platformLabels[item.platform]} · {formatDate(item.scheduledFor)}
              </p>
            </div>
            {confirmDeleteId === item.id ? (
              <div style={{ display: 'flex', gap: 6 }} className="scale-in">
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '6px 12px', background: '#DC2626', color: 'white',
                    borderRadius: 8, fontSize: 12, fontWeight: 700
                  }}
                >מחקי ✓</button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  style={{
                    padding: '6px 10px', background: 'var(--white)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontSize: 12, color: 'var(--text-mid)'
                  }}
                >ביטול</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(item.id)}
                style={{ background: 'none', padding: 6 }}
                className="hover-lift"
              >
                <Trash2 size={16} style={{ color: '#EF4444' }} />
              </button>
            )}
          </div>
        ))}

        {activeUpcomingItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-light)' }} className="fade-in">
            <p style={{ fontSize: 14.5, color: 'var(--text-mid)', marginBottom: 12, fontWeight: 500 }}>אין עדיין פוסטים מתוזמנים בלוח</p>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: '10px 22px', borderRadius: 'var(--radius-pill)', fontSize: 13
              }}
              className="btn-primary hover-lift"
            >
              + הוסיפי פוסט ללוח
            </button>
          </div>
        )}
      </div>

      {/* Add Item Sheet Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(44, 53, 40, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
          zIndex: 100
        }} onClick={() => setShowAdd(false)} className="fade-in">
          <div
            style={{
              background: 'var(--white)', width: '100%',
              borderRadius: '24px 24px 0 0', padding: '24px 20px 42px',
              boxShadow: '0 -10px 32px rgba(74, 92, 66, 0.15)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
            className="slide-up"
          >
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-dark)' }}>הוסיפי ללוח התוכן</h3>
              <button 
                onClick={() => setShowAdd(false)}
                style={{ 
                  background: 'var(--cream)', 
                  width: 32, height: 32, 
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-mid)',
                  border: '1px solid var(--border)'
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase' }}>
              כותרת או נושא הפוסט
            </p>
            <input
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="לדוגמה: פוסט השראה על שיתוף פעולה..."
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 14, marginBottom: 16, background: 'var(--cream)'
              }}
              className="premium-input"
            />
            
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase' }}>
              פלטפורמת היעד
            </p>
            <select
              value={newItem.platform}
              onChange={e => setNewItem({ ...newItem, platform: e.target.value })}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 14, marginBottom: 16, background: 'var(--cream)', color: 'var(--text-dark)'
              }}
              className="premium-input"
            >
              <option value="instagram">אינסטגרם 📱</option>
              <option value="facebook">פייסבוק 👥</option>
              <option value="linkedin">לינקדאין 💼</option>
              <option value="all">כולם 🚀</option>
            </select>
            
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase' }}>
              תאריך פרסום מיועד
            </p>
            <input
              type="date"
              value={newItem.scheduledFor}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setNewItem({ ...newItem, scheduledFor: e.target.value })}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 14, marginBottom: 20, background: 'var(--cream)', color: 'var(--text-dark)'
              }}
              className="premium-input"
            />
            
            <button
              onClick={handleAdd}
              disabled={!newItem.title || !newItem.scheduledFor}
              style={{
                width: '100%', padding: '15px',
                fontSize: 15
              }}
              className="btn-primary hover-lift"
            >
              הוסיפי פוסט ללוח התוכן ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
