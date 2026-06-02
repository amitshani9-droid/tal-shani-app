import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Copy, Check, Send, FileText, Filter, Pencil } from 'lucide-react'
import { storage, platformLabels, contentTypeLabels, formatDate } from '../services/storage'

const PLATFORM_BADGE_STYLE = {
  instagram: { background: '#FDF2F8', color: '#BE185D', border: '1px solid #FBCFE8' },
  facebook:  { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' },
  linkedin:  { background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' },
}

const PLATFORM_OPTIONS = [
  { id: 'all', label: 'הכל' },
  { id: 'instagram', label: 'אינסטגרם' },
  { id: 'facebook', label: 'פייסבוק' },
  { id: 'linkedin', label: 'לינקדאין' },
]

const TYPE_OPTIONS = [
  { id: 'all', label: 'כל הסוגים' },
  { id: 'tip', label: 'טיפ' },
  { id: 'sale', label: 'מכירה' },
  { id: 'behind', label: 'מאחורי הקלעים' },
  { id: 'question', label: 'שאלה' },
  { id: 'casestudy', label: 'סיפור הצלחה' },
]

export default function History() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('published')
  const [posts, setPosts] = useState(storage.getPosts())
  const [drafts, setDrafts] = useState(storage.getDrafts())
  const [copiedId, setCopiedId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  function handleEditDraft(draft) {
    sessionStorage.setItem('tal_draft_edit', JSON.stringify(draft))
    navigate('/create')
  }

  function handleDeletePost(id) {
    storage.deletePost(id)
    setPosts(storage.getPosts())
    setConfirmDeleteId(null)
  }

  function handleDeleteDraft(id) {
    storage.deleteDraft(id)
    setDrafts(storage.getDrafts())
    setConfirmDeleteId(null)
  }

  function handlePublishDraft(draft) {
    storage.savePost({ ...draft, status: 'published' })
    storage.deleteDraft(draft.id)
    setPosts(storage.getPosts())
    setDrafts(storage.getDrafts())
  }

  async function handleCopy(item) {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Clipboard access denied — silently no-op; user can copy manually
    }
  }

  const rawItems = tab === 'published' ? posts : drafts
  const items = rawItems.filter(item => {
    const platOk = filterPlatform === 'all' || item.platform === filterPlatform
    const typeOk = filterType === 'all' || item.contentType === filterType
    return platOk && typeOk
  })

  const activeFilters = (filterPlatform !== 'all' ? 1 : 0) + (filterType !== 'all' ? 1 : 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }} className="fade-in">

      {/* Header with Integrated Tabs */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 0',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        flexShrink: 0
      }}>
        <div className="desktop-header-wrap">
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.4px', marginBottom: 20 }}>
            ארכיון פוסטים
          </h2>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'published', label: 'פורסמו', count: posts.length },
              { id: 'drafts',    label: 'טיוטות',  count: drafts.length },
            ].map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setConfirmDeleteId(null) }}
                  style={{
                    flex: 1, padding: '12px 14px',
                    background: active ? 'var(--white)' : 'transparent',
                    color: active ? 'var(--green-dark)' : 'rgba(255,255,255,0.7)',
                    borderRadius: '16px 16px 0 0',
                    fontSize: 13.5, fontWeight: active ? 700 : 500,
                    border: 'none',
                    position: 'relative',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {t.label}
                  <span style={{
                    marginRight: 6, fontSize: 11, opacity: 0.8,
                    background: active ? 'var(--green-pale)' : 'rgba(255,255,255,0.15)',
                    color: active ? 'var(--green-dark)' : 'white',
                    padding: '1px 6px', borderRadius: 8, fontWeight: 600
                  }}>
                    {t.count}
                  </span>
                  {active && <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 1, background: 'var(--white)' }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 820 }}>

        {/* Filter Bar */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius-pill)',
              background: activeFilters > 0 ? 'var(--green-pale)' : 'var(--white)',
              border: `1px solid ${activeFilters > 0 ? 'var(--green-light)' : 'var(--border)'}`,
              color: activeFilters > 0 ? 'var(--green-dark)' : 'var(--text-mid)',
              fontSize: 12, fontWeight: 600,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Filter size={13} />
            סינון
            {activeFilters > 0 && (
              <span style={{
                background: 'var(--green-dark)', color: 'white',
                width: 16, height: 16, borderRadius: '50%',
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{activeFilters}</span>
            )}
          </button>

          {showFilters && (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', padding: '14px 16px',
              marginTop: 8, boxShadow: 'var(--shadow-sm)'
            }} className="scale-in">
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>פלטפורמה</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PLATFORM_OPTIONS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setFilterPlatform(o.id)}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600,
                        background: filterPlatform === o.id ? 'var(--green-dark)' : 'var(--bg-page)',
                        color: filterPlatform === o.id ? 'white' : 'var(--text-mid)',
                        border: `1px solid ${filterPlatform === o.id ? 'var(--green-dark)' : 'var(--border)'}`
                      }}
                    >{o.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>סוג תוכן</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TYPE_OPTIONS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setFilterType(o.id)}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600,
                        background: filterType === o.id ? 'var(--earth)' : 'var(--bg-page)',
                        color: filterType === o.id ? 'white' : 'var(--text-mid)',
                        border: `1px solid ${filterType === o.id ? 'var(--earth)' : 'var(--border)'}`
                      }}
                    >{o.label}</button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setFilterPlatform('all'); setFilterType('all') }}
                  style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', background: 'none', fontWeight: 500 }}
                >
                  נקי סינון ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 0' }} className="fade-in">
            <div style={{
              width: 72, height: 72, background: 'var(--green-pale)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', boxShadow: 'var(--shadow-sm)'
            }}>
              <FileText size={30} color="var(--green-dark)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
              {activeFilters > 0 ? 'אין פריטים מתאימים לסינון' : tab === 'published' ? 'אין פוסטים שפורסמו עדיין' : 'אין טיוטות שמורות כרגע'}
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-light)' }}>
              {activeFilters > 0 ? 'נסי לשנות את הסינון' : tab === 'published' ? 'הגדרת פוסט כ"פורסם" תוסיף אותו לכאן' : 'תוכלי לשמור טיוטות ממסך מחולל הפוסטים'}
            </p>
          </div>
        )}

        {/* Items List */}
        {items.map(item => (
          <div key={item.id} style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            border: `1px solid ${confirmDeleteId === item.id ? '#FCA5A5' : 'var(--border)'}`,
            boxShadow: 'var(--shadow-sm)', marginBottom: 14, overflow: 'hidden',
            transition: 'border-color 0.2s'
          }} className="hover-lift fade-in">

            {/* Card Top Bar */}
            <div style={{
              padding: '12px 16px', background: 'rgba(74, 92, 66, 0.02)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  className="badge"
                  style={PLATFORM_BADGE_STYLE[item.platform] || { background: 'var(--green-pale)', color: 'var(--green-dark)', border: '1px solid rgba(74,92,66,0.14)' }}
                >
                  {platformLabels[item.platform] || item.platformLabel}
                </span>
                {item.contentType && (
                  <span className="badge badge-pink">{contentTypeLabels[item.contentType]}</span>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-light)', fontWeight: 500 }}>{formatDate(item.createdAt)}</span>
            </div>

            {/* Content */}
            <div style={{ padding: 16 }}>
              <p style={{
                fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-dark)',
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', marginBottom: 14
              }}>
                <span dir="auto">{item.content}</span>
              </p>

              {/* Actions */}
              {confirmDeleteId === item.id ? (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  background: '#FEF2F2', borderRadius: 10, padding: '10px 14px',
                  border: '1px solid #FECACA'
                }} className="scale-in">
                  <span style={{ flex: 1, fontSize: 12.5, color: '#DC2626', fontWeight: 600 }}>
                    למחוק לצמיתות?
                  </span>
                  <button
                    onClick={() => tab === 'published' ? handleDeletePost(item.id) : handleDeleteDraft(item.id)}
                    style={{
                      padding: '7px 14px', background: '#DC2626', color: 'white',
                      borderRadius: 8, fontSize: 12.5, fontWeight: 700
                    }}
                  >
                    מחקי ✓
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    style={{
                      padding: '7px 12px', background: 'var(--white)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      fontSize: 12.5, color: 'var(--text-mid)', fontWeight: 600
                    }}
                  >
                    ביטול
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleCopy(item)}
                    style={{
                      flex: 1, padding: '10px 12px', fontSize: 12.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                    className="btn-secondary hover-lift"
                  >
                    {copiedId === item.id ? <Check size={14} color="var(--green-dark)" /> : <Copy size={14} />}
                    {copiedId === item.id ? 'הועתק!' : 'העתיקי'}
                  </button>

                  {tab === 'drafts' && (
                    <>
                      <button
                        onClick={() => handleEditDraft(item)}
                        style={{
                          flex: 1, padding: '10px 12px', fontSize: 12.5,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                        className="btn-secondary hover-lift"
                      >
                        <Pencil size={14} />
                        ערכי
                      </button>
                      <button
                        onClick={() => handlePublishDraft(item)}
                        style={{
                          flex: 1, padding: '10px 12px', fontSize: 12.5,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                        className="btn-primary hover-lift"
                      >
                        <Send size={14} />
                        פרסמי
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    className="hover-lift"
                    title="מחיקה"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
