import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Key, Check, Server, Heart, ExternalLink, Eye, EyeOff, Download, Upload, AlertCircle } from 'lucide-react'
import { getApiKey, setApiKey } from '../services/openai'
import { storage } from '../services/storage'

export default function Settings() {
  const navigate = useNavigate()
  const [key, setKey] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [trendsServer, setTrendsServer] = useState(localStorage.getItem('tal_trends_server') || '')
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tal_brand') || '{}').extraNotes || '' }
    catch { return '' }
  })
  const [saved, setSaved] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const importRef = useRef(null)

  // Smart Learning examples — user-curated top-performing posts that train the AI
  const [syncedPosts, setSyncedPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tal_synced_posts') || '[]') }
    catch { return [] }
  })

  const [newPostContent, setNewPostContent] = useState('')
  const [newPostLikes, setNewPostLikes] = useState(50)
  const [newPostComments, setNewPostComments] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editLikes, setEditLikes] = useState(0)
  const [editComments, setEditComments] = useState(0)

  function handleAddPost() {
    if (!newPostContent.trim()) return
    const newPost = {
      content: newPostContent.trim(),
      stats: { likes: Number(newPostLikes) || 0, comments: Number(newPostComments) || 0 }
    }
    const updated = [newPost, ...syncedPosts]
    setSyncedPosts(updated)
    localStorage.setItem('tal_synced_posts', JSON.stringify(updated))
    setNewPostContent('')
    setShowAddForm(false)
  }

  function handleDeletePost(index) {
    const updated = syncedPosts.filter((_, idx) => idx !== index)
    setSyncedPosts(updated)
    localStorage.setItem('tal_synced_posts', JSON.stringify(updated))
  }

  function handleStartEdit(index) {
    const post = syncedPosts[index]
    setEditingIndex(index)
    setEditContent(post.content)
    setEditLikes(post.stats?.likes || 0)
    setEditComments(post.stats?.comments || 0)
  }

  function handleSaveEdit(index) {
    if (!editContent.trim()) return
    const updated = [...syncedPosts]
    updated[index] = {
      content: editContent.trim(),
      stats: { likes: Number(editLikes) || 0, comments: Number(editComments) || 0 }
    }
    setSyncedPosts(updated)
    localStorage.setItem('tal_synced_posts', JSON.stringify(updated))
    setEditingIndex(null)
  }

  function handleExport() {
    const data = {
      posts: storage.getPosts(),
      drafts: storage.getDrafts(),
      calendar: storage.getCalendar(),
      research: storage.getResearch(),
      brand: localStorage.getItem('tal_brand') || '{}',
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tal-shani-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (data.posts)    localStorage.setItem('tal_posts',    JSON.stringify(data.posts))
        if (data.drafts)   localStorage.setItem('tal_drafts',   JSON.stringify(data.drafts))
        if (data.calendar) localStorage.setItem('tal_calendar', JSON.stringify(data.calendar))
        if (data.research) localStorage.setItem('tal_research', JSON.stringify(data.research))
        if (data.brand)    localStorage.setItem('tal_brand',    data.brand)
        setImportStatus('success')
        setTimeout(() => setImportStatus(''), 3000)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus(''), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleSave() {
    setApiKey(key.trim())
    localStorage.setItem('tal_trends_server', trendsServer.trim())
    const existingBrand = (() => { try { return JSON.parse(localStorage.getItem('tal_brand') || '{}') } catch { return {} } })()
    localStorage.setItem('tal_brand', JSON.stringify({ ...existingBrand, extraNotes: notes.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
      
      {/* Header */}
      <div style={{ 
        background: 'var(--gradient-header)', 
        padding: '50px 20px 24px', 
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: 'var(--shadow-md)',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        flexShrink: 0
      }}>
        <div className="desktop-header-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              color: 'white',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover-lift"
          >
            <ChevronRight size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>הגדרות ברנד וחיבורים</h2>
            <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>הגדרת סגנון וחיבורי API</p>
          </div>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 820 }}>
        {/* API Key Box */}
        <div style={{ 
          background: 'var(--white)', borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', 
          padding: 18, marginBottom: 16 
        }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Key size={16} color="var(--green-dark)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>מפתח OpenAI API Key</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 12 }}>
            המפתח האישי שלך לתקשורת עם GPT-4. הוא נשמר מאובטח ומקומי על המכשיר שלך בלבד.
          </p>
          <form onSubmit={e => e.preventDefault()} style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-..."
              dir="ltr"
              autoComplete="new-password"
              style={{ 
                width: '100%', padding: '12px 40px 12px 14px', 
                border: '1px solid var(--border)', borderRadius: 10, 
                fontSize: 13, background: 'var(--cream)', textAlign: 'left' 
              }}
              className="premium-input"
            />
            <button 
              type="button"
              onClick={() => setShowKey(!showKey)} 
              style={{ 
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', 
                background: 'none', color: 'var(--text-light)', padding: 4
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </form>
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 4, 
              fontSize: 12, color: 'var(--green-dark)', marginTop: 10, 
              textDecoration: 'none', fontWeight: 600 
            }}
            className="hover-lift"
          >
            איפה משיגים מפתח API? <ExternalLink size={12} />
          </a>
        </div>

        {/* Trends Server Box */}
        <div style={{ 
          background: 'var(--white)', borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', 
          padding: 18, marginBottom: 16 
        }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Server size={16} color="var(--green-mid)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>שרת Google Trends (אופציונלי)</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 12 }}>
            כתובת שרת Firebase לניתוח טרנדים חיים מישראל. אם ריק, המערכת תתבסס על המידע המובנה של בינה מלאכותית.
          </p>
          <input
            value={trendsServer}
            onChange={e => setTrendsServer(e.target.value)}
            placeholder="https://...cloudfunctions.net/trends"
            dir="ltr"
            style={{ 
              width: '100%', padding: '12px 14px', 
              border: '1px solid var(--border)', borderRadius: 10, 
              fontSize: 13, background: 'var(--cream)', textAlign: 'left' 
            }}
            className="premium-input"
          />
        </div>

        {/* Smart Learning — Reference posts that train the AI */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          padding: 18, marginBottom: 16
        }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>פוסטים מובילים ללמידת AI</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
            הוסיפי כאן ידנית את הפוסטים שעבדו לך הכי טוב (כתבי או הדביקי + עדכון לייקים ותגובות). ה-AI יילמד מהם בכל פעם שתבקשי לנסח פוסט חדש — וייקח את שלושת הפוסטים עם הביצועים הגבוהים ביותר כדוגמה לסגנון.
          </p>

          {syncedPosts.length > 0 && (
            <div style={{ background: 'var(--green-pale)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--green-light)', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600 }}>
                {syncedPosts.length} פוסטים מזינים את ה-AI כדוגמה לסגנון שלך
              </p>
            </div>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: '100%', padding: '12px', fontSize: 13, fontWeight: 600,
              background: 'var(--white)', color: 'var(--green-dark)',
              border: '1.5px solid var(--green-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
            className="hover-lift"
          >
            {showAddForm ? 'סגרי טופס הוספה' : '+ הוסיפי פוסט מנצח'}
          </button>

          {showAddForm && (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--border)' }} className="scale-in">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="הדביקי את תוכן הפוסט שעבד לך מעולה..."
                style={{
                  width: '100%', padding: 12, fontSize: 13, minHeight: 90,
                  border: '1px solid var(--border)', borderRadius: 8,
                  background: 'var(--white)', marginBottom: 10, lineHeight: 1.6
                }}
              />
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>לייקים</label>
                  <input
                    type="number" min="0" value={newPostLikes}
                    onChange={e => setNewPostLikes(e.target.value)}
                    style={{ width: '100%', padding: 8, fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--white)', marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>תגובות</label>
                  <input
                    type="number" min="0" value={newPostComments}
                    onChange={e => setNewPostComments(e.target.value)}
                    style={{ width: '100%', padding: 8, fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--white)', marginTop: 4 }}
                  />
                </div>
              </div>
              <button
                onClick={handleAddPost}
                disabled={!newPostContent.trim()}
                className="btn-primary"
                style={{ width: '100%', padding: 12, fontSize: 13 }}
              >
                שמרי כדוגמה ל-AI
              </button>
            </div>
          )}

          {syncedPosts.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {syncedPosts.map((post, idx) => (
                <div key={idx} style={{
                  padding: 12, background: 'var(--cream)', borderRadius: 8,
                  border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.5
                }}>
                  {editingIndex === idx ? (
                    <>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        style={{ width: '100%', padding: 10, fontSize: 12, minHeight: 70, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--white)', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input type="number" value={editLikes} onChange={e => setEditLikes(e.target.value)} style={{ flex: 1, padding: 6, fontSize: 12, border: '1px solid var(--border)', borderRadius: 6 }} placeholder="לייקים" />
                        <input type="number" value={editComments} onChange={e => setEditComments(e.target.value)} style={{ flex: 1, padding: 6, fontSize: 12, border: '1px solid var(--border)', borderRadius: 6 }} placeholder="תגובות" />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleSaveEdit(idx)} className="btn-primary" style={{ flex: 1, padding: 8, fontSize: 12 }}>שמרי</button>
                        <button onClick={() => setEditingIndex(null)} className="btn-secondary" style={{ flex: 1, padding: 8, fontSize: 12 }}>ביטול</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text-dark)', marginBottom: 6 }}>{post.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: 11 }}>❤️ {post.stats?.likes || 0} · 💬 {post.stats?.comments || 0}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleStartEdit(idx)} style={{ fontSize: 11, color: 'var(--green-dark)', background: 'none', fontWeight: 600 }}>ערכי</button>
                          <button onClick={() => handleDeletePost(idx)} style={{ fontSize: 11, color: '#DC2626', background: 'none', fontWeight: 600 }}>מחקי</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style Guidelines Box */}
        <div style={{ 
          background: 'var(--white)', borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', 
          padding: 18, marginBottom: 20 
        }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Heart size={16} color="var(--earth)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>הערות אישיות לסגנון הכתיבה</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 12 }}>
            כאן תוכלי להגדיר ל-AI כללים קבועים לסגנון שלך (למשל: תמיד לסיים בשאלה, לכתוב בגובה העיניים, להימנע ממילים מסוימות וכו').
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="לדוגמה: תמיד להוסיף אמוג'י של עלה או גיבוש, לפנות אל מנהלות משאבי אנוש בגובה העיניים..."
            style={{ 
              width: '100%', padding: '12px 14px', 
              border: '1px solid var(--border)', borderRadius: 10, 
              fontSize: 13, background: 'var(--cream)', minHeight: 100, 
              lineHeight: 1.6 
            }}
            className="premium-textarea"
          />
        </div>

        {/* Backup & Restore Box */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          padding: 18, marginBottom: 20
        }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Download size={16} color="var(--green-mid)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>גיבוי ושחזור נתונים</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
            כל הפוסטים, הטיוטות, לוח התוכן והגדרות הברנד שלך נשמרים מקומית בדפדפן. מומלץ לייצא גיבוי מדי פעם.
          </p>

          {importStatus === 'success' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'var(--green-pale)', borderRadius: 10, marginBottom: 12,
              border: '1px solid var(--green-light)'
            }} className="scale-in">
              <Check size={15} color="var(--green-dark)" />
              <span style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600 }}>הגיבוי יובא בהצלחה! רענני את האפליקציה.</span>
            </div>
          )}
          {importStatus === 'error' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: '#FEF2F2', borderRadius: 10, marginBottom: 12,
              border: '1px solid #FECACA'
            }} className="scale-in">
              <AlertCircle size={15} color="#DC2626" />
              <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>קובץ לא תקין — ודאי שזה קובץ גיבוי של האפליקציה</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleExport}
              style={{
                flex: 1, padding: '11px 14px', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7
              }}
              className="btn-primary hover-lift"
            >
              <Download size={15} /> ייצאי גיבוי
            </button>
            <button
              onClick={() => importRef.current?.click()}
              style={{
                flex: 1, padding: '11px 14px', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7
              }}
              className="btn-secondary hover-lift"
            >
              <Upload size={15} /> ייבאי גיבוי
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '16px',
            background: saved ? 'var(--green-mid)' : 'var(--green-dark)',
            color: 'white', borderRadius: 'var(--radius-md)',
            fontSize: 15, fontWeight: 600, boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="hover-lift"
        >
          {saved ? <><Check size={18} /> ההגדרות נשמרו בהצלחה!</> : 'שמרי הגדרות'}
        </button>
      </div>
    </div>
  )
}
