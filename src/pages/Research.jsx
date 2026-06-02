import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Loader, AlertCircle, Flame, Lightbulb, Users, Clock, Hash, Sparkles, RefreshCw, ChevronDown, CalendarPlus, Check } from 'lucide-react'
import { generateResearch } from '../services/openai'
import { storage, formatDate } from '../services/storage'

const platformEmoji = { instagram: '📱', facebook: '👥', linkedin: '💼', all: '🚀' }

export default function Research() {
  const navigate = useNavigate()
  const [report, setReport] = useState(storage.getResearch())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openSection, setOpenSection] = useState('hot')
  const [addedToCalendar, setAddedToCalendar] = useState({})
  const [selectedDates, setSelectedDates] = useState({})

  const getDefaultDate = (idx) => {
    const d = new Date()
    d.setDate(d.getDate() + 1 + idx)
    return d.toISOString().split('T')[0]
  }

  function addToCalendar(idea, idx, dateVal) {
    storage.saveCalendarItem({
      title: idea.title,
      platform: idea.platform || 'instagram',
      contentType: idea.contentType || 'tip',
      scheduledFor: dateVal
    })
    setAddedToCalendar(prev => ({ ...prev, [idx]: true }))
  }

  async function runResearch() {
    setError('')
    setLoading(true)
    try {
      let trendsData = null
      const serverUrl = localStorage.getItem('tal_trends_server')
      if (serverUrl) {
        try {
          const res = await fetch(serverUrl)
          if (res.ok) trendsData = await res.json()
        } catch { /* proceed without live trends */ }
      }
      const result = await generateResearch({ trendsData })
      const saved = storage.saveResearch(result)
      setReport(saved)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function createFromIdea(idea) {
    sessionStorage.setItem('tal_prefill', JSON.stringify({
      platform: idea.platform || 'instagram',
      contentType: idea.contentType || 'tip',
      brief: `${idea.title}. ${idea.hook || ''}`
    }))
    navigate('/create')
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', gap: 24, padding: 24 }} className="fade-in">
        <div style={{
          width: 88, height: 88,
          background: 'var(--white)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)'
        }}>
          <Loader size={36} color="var(--green-dark)" className="spin" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 19, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8 }}>חוקרת את השוק...</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 400 }}>בודקת טרנדים ומגמות חמות בישראל ✨</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', animation: `pulse 1.4s ease-in-out ${i * 0.25}s infinite` }} />
          ))}
        </div>
      </div>
    )
  }

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
        <div className="desktop-header-wrap" style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.4px', marginBottom: 4 }}>חקר שוק שבועי</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>מה הכי חם עכשיו בתחום הגיבוש והחוויות בישראל</p>
          {report?.generatedAt && (
            <p style={{ fontSize: 11, color: 'var(--green-light)', marginTop: 8, fontWeight: 500 }}>עודכן לאחרונה: {formatDate(report.generatedAt)}</p>
          )}
        </div>
      </div>

      <div className="desktop-container">
        {/* Run Research Button */}
        <button
          onClick={runResearch}
          style={{
            width: '100%', padding: '16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
          className="btn-primary hover-lift"
        >
          {report ? <RefreshCw size={18} /> : <TrendingUp size={18} />}
          {report ? 'עדכני חקר שוק' : 'התחילי חקר שוק'}
        </button>

        {error && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FEF2F2', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #FECACA' }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!report && !error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-light)' }}>
            <div style={{ 
              width: 72, height: 72, 
              background: 'var(--green-pale)', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <TrendingUp size={30} color="var(--green-dark)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>עדיין אין דוח חקר שוק</p>
            <p style={{ fontSize: 13, color: 'var(--text-light)' }}>לחצי על הכפתור למעלה כדי לחולל ניתוח מגמות ורעיונות לפוסטים</p>
          </div>
        )}

        {/* Research Report Contents */}
        {report && (
          <>
            {/* Market Summary Card */}
            <div style={{ 
              background: 'var(--green-pale)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px 18px', 
              marginBottom: 20,
              border: '1px solid rgba(74, 92, 66, 0.12)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--green-dark)', fontWeight: 500 }}>
                {report.summary}
              </p>
            </div>

            {/* Hot Topics Section */}
            <Section 
              icon={Flame} 
              title="נושאים חמים השבוע בישראל" 
              color="var(--earth)" 
              open={openSection === 'hot'} 
              onToggle={() => setOpenSection(openSection === 'hot' ? '' : 'hot')}
            >
              {report.hotTopics?.map((t, i) => (
                <div key={i} style={{ 
                  padding: '16px 18px', 
                  borderBottom: i < report.hotTopics.length - 1 ? '1px solid var(--border)' : 'none' 
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
                    🔥 {t.topic}
                  </p>
                  <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 8 }}>
                    {t.why}
                  </p>
                  <div style={{ 
                    background: 'rgba(184, 137, 110, 0.05)', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)',
                    borderRight: '3px solid var(--earth)',
                    fontSize: 12,
                    color: 'var(--earth)',
                    fontWeight: 500
                  }}>
                    זווית לפרסום: {t.angle}
                  </div>
                </div>
              ))}
            </Section>

            {/* Weekly Ideas Section */}
            <Section 
              icon={Lightbulb} 
              title="רעיונות לפוסטים שבועיים" 
              color="var(--green-mid)" 
              open={openSection === 'ideas'} 
              onToggle={() => setOpenSection(openSection === 'ideas' ? '' : 'ideas')}
            >
              {report.weeklyIdeas?.map((idea, i) => (
                <div key={i} style={{ 
                  padding: '16px 18px', 
                  borderBottom: i < report.weeklyIdeas.length - 1 ? '1px solid var(--border)' : 'none' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="badge badge-green">
                      {platformEmoji[idea.platform] || '📱'} {idea.platform === 'instagram' ? 'אינסטגרם' : idea.platform === 'facebook' ? 'פייסבוק' : idea.platform === 'linkedin' ? 'לינקדאין' : 'כללי'}
                    </span>
                    <span className="badge badge-pink" style={{ fontSize: 10 }}>
                      {idea.contentType === 'tip' ? 'טיפ' : idea.contentType === 'sale' ? 'מכירה' : idea.contentType === 'behind' ? 'מאחורי הקלעים' : idea.contentType === 'question' ? 'שאלה' : 'סיפור הצלחה'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
                    {idea.title}
                  </h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic', background: 'rgba(74, 92, 66, 0.02)', padding: '6px 10px', borderRadius: 8 }}>
                    "{idea.hook}"
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => createFromIdea(idea)}
                      style={{ fontSize: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                      className="btn-primary hover-lift"
                    >
                      <Sparkles size={13} /> צרי פוסט
                    </button>
                    <button
                      onClick={() => addToCalendar(idea, i, selectedDates[i] || getDefaultDate(i))}
                      disabled={addedToCalendar[i]}
                      style={{
                        fontSize: 12, padding: '8px 14px',
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: addedToCalendar[i] ? 'var(--green-pale)' : 'var(--white)',
                        color: addedToCalendar[i] ? 'var(--green-dark)' : 'var(--text-mid)',
                        border: `1px solid ${addedToCalendar[i] ? 'var(--green-light)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)', fontWeight: 600,
                        cursor: addedToCalendar[i] ? 'default' : 'pointer'
                      }}
                    >
                      {addedToCalendar[i]
                        ? <><Check size={13} /> נוסף ללוח</>
                        : <><CalendarPlus size={13} /> הוסיפי ללוח</>
                      }
                    </button>

                    {!addedToCalendar[i] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>לתאריך:</span>
                        <input
                          type="date"
                          value={selectedDates[i] || getDefaultDate(i)}
                          onChange={e => setSelectedDates(prev => ({ ...prev, [i]: e.target.value }))}
                          style={{
                            fontSize: 12,
                            padding: '6px 10px',
                            border: '1.5px solid var(--border)',
                            borderRadius: 8,
                            background: 'var(--white)',
                            color: 'var(--text-dark)',
                            cursor: 'pointer',
                            outline: 'none',
                            fontFamily: 'Heebo'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Section>

            {/* Facebook Groups Section */}
            <Section 
              icon={Users} 
              title="קבוצות פייסבוק מומלצות לפרסום" 
              color="var(--green-dark)" 
              open={openSection === 'groups'} 
              onToggle={() => setOpenSection(openSection === 'groups' ? '' : 'groups')}
            >
              {report.facebookGroups?.map((g, i) => (
                <div key={i} style={{ 
                  padding: '16px 18px', 
                  borderBottom: i < report.facebookGroups.length - 1 ? '1px solid var(--border)' : 'none' 
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>📋 {g.name}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-light)', marginBottom: 6, fontWeight: 500 }}>קהל היעד: {g.audience}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--green-mid)', lineHeight: 1.6, fontWeight: 500 }}>✓ טיפ לפרסום: {g.tip}</p>
                </div>
              ))}
              <div style={{ padding: '12px 18px', background: 'var(--pink-pale)', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11.5, color: 'var(--earth)', lineHeight: 1.6, fontWeight: 500 }}>
                  💡 שימי לב: פרסום ידני בקבוצות נראה הכי אותנטי ומקבל חשיפה גבוהה משמעותית מאוטומציה. העתיקי את הפוסט המוגמר והעלי בעצמך.
                </p>
              </div>
            </Section>

            {/* Best Posting Times Card */}
            <div style={{ 
              background: 'var(--white)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)', 
              padding: 16, 
              marginBottom: 12 
            }} className="hover-lift">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={16} color="var(--green-mid)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>זמני פרסום מומלצים השבוע</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 500 }}>
                {report.bestTimes}
              </p>
            </div>

            {/* Recommended Hashtags Card */}
            {report.hashtags?.length > 0 && (
              <div style={{ 
                background: 'var(--white)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)', 
                padding: 16 
              }} className="hover-lift">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Hash size={16} color="var(--green-mid)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>האשטאגים פופולריים מומלצים</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {report.hashtags.map((h, i) => (
                    <span 
                      key={i} 
                      className="badge badge-green"
                      style={{ fontSize: 11, padding: '5px 12px', cursor: 'pointer' }}
                      onClick={() => {
                        navigator.clipboard.writeText('#' + h.replace(/^#/, '')).catch(() => {})
                      }}
                      title="לחצי להעתקה"
                    >
                      #{h.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, color, open, onToggle, children }) {
  return (
    <div style={{ 
      background: 'var(--white)', 
      borderRadius: 'var(--radius-md)', 
      border: '1px solid var(--border)', 
      boxShadow: 'var(--shadow-sm)', 
      marginBottom: 14, 
      overflow: 'hidden' 
    }} className="hover-lift">
      <button 
        onClick={onToggle} 
        style={{ 
          width: '100%', padding: '16px 18px', 
          background: 'none', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={18} color={color} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>{title}</span>
        </div>
        <ChevronDown 
          size={18} 
          color="var(--text-light)" 
          style={{ 
            transform: open ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
          }} 
        />
      </button>
      {open && <div style={{ borderTop: '1px solid var(--border)' }} className="fade-in">{children}</div>}
    </div>
  )
}
