import { useState } from 'react'
import { MessageCircle, Sparkles, Loader, Copy, Check, Send, AlertCircle, RefreshCw } from 'lucide-react'
import { generateWhatsAppMessage } from '../services/openai'

const MESSAGE_TYPES = [
  { id: 'intro',    label: 'פתיחה חמה',          emoji: '👋', desc: 'הודעת היכרות ראשונה למנהלת HR שלא מכירה אותך' },
  { id: 'followup', label: 'מעקב אחרי שיחה',     emoji: '💬', desc: 'הודעה חמה אחרי פגישה או שיחת היכרות' },
  { id: 'offer',    label: 'הצעה רכה',           emoji: '🌿', desc: 'הצעה לבניית חוויה — בלי לחץ, מתמקדת בערך' },
  { id: 'thanks',   label: 'תודה אחרי אירוע',     emoji: '❤️', desc: 'הודעת תודה כנה — מחזקת את הקשר אחרי שעבר אירוע' },
  { id: 'reminder', label: 'תזכורת עדינה',       emoji: '✨', desc: 'הודעה ללקוחה פוטנציאלית שלא חזרה — חמה ולא מציקה' },
]

export default function WhatsApp() {
  const [type, setType] = useState('intro')
  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [context, setContext] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setError('')
    setLoading(true)
    setMessage('')
    try {
      const result = await generateWhatsAppMessage({ type, context, recipientName })
      setMessage(result.trim())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('לא הצלחנו להעתיק — אנא העתיקי ידנית')
    }
  }

  function openInWhatsApp() {
    const cleaned = phone.replace(/[^\d]/g, '')
    let normalized = cleaned
    if (cleaned.startsWith('0')) normalized = '972' + cleaned.slice(1)
    else if (!cleaned.startsWith('972')) normalized = '972' + cleaned

    const encoded = encodeURIComponent(message)
    const url = phone
      ? `https://wa.me/${normalized}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const activeType = MESSAGE_TYPES.find(t => t.id === type)

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }} className="fade-in">

      {/* Header */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 24px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(143,175,135,0.12)', borderRadius: '50%' }} />
        <div className="desktop-header-wrap" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.18)'
            }}>
              <MessageCircle size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.4px' }}>
                הודעות וואצאפ ממותגות
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                מחולל הודעות אישיות לפניות, מעקב והצעות
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 820 }}>

        {/* Message type selector */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          סוג ההודעה
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
          {MESSAGE_TYPES.map(t => {
            const active = type === t.id
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                style={{
                  padding: 14, borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--green-pale)' : 'var(--white)',
                  border: `1.5px solid ${active ? 'var(--green-light)' : 'var(--border)'}`,
                  color: active ? 'var(--green-dark)' : 'var(--text-dark)',
                  textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6
                }}
                className="hover-lift"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{t.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 600 }}>{t.label}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-light)', lineHeight: 1.4, fontWeight: 400 }}>
                  {t.desc}
                </span>
              </button>
            )
          })}
        </div>

        {/* Recipient + context */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          padding: 18, marginBottom: 16
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="brand-book-grid-mobile">
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                שם הנמענת (אופציונלי)
              </label>
              <input
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="למשל: דנה כהן"
                style={{ width: '100%', padding: 10, fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                טלפון לוואצאפ (אופציונלי)
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="054-1234567"
                dir="ltr"
                style={{ width: '100%', padding: 10, fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)', textAlign: 'left' }}
              />
            </div>
          </div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
            הקשר נוסף (אופציונלי)
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="פרטים נוספים שיעזרו ל-AI להתאים את ההודעה — למשל: דיברנו על יום גיבוש לצוות פיתוח של 80 איש, היא הזכירה שיש בעיות חיבור אחרי תקופת הקורונה..."
            style={{ width: '100%', padding: 10, fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)', minHeight: 80, lineHeight: 1.6 }}
          />
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: '#FEF2F2', borderRadius: 12, padding: '12px 16px',
            marginBottom: 16, border: '1px solid #FECACA'
          }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%', padding: 16, fontSize: 15, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
          className="btn-primary hover-lift"
        >
          {loading ? <Loader size={18} className="spin" /> : <Sparkles size={18} />}
          {loading ? 'כותבת הודעה...' : (message ? 'צרי גרסה חדשה' : `נסחי הודעת ${activeType?.label}`)}
        </button>

        {/* Result */}
        {message && !loading && (
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            marginBottom: 16, overflow: 'hidden'
          }} className="scale-in">
            <div style={{
              padding: '12px 16px', background: '#25D366', color: 'white',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <MessageCircle size={16} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>תצוגה מקדימה — בועת וואצאפ</span>
            </div>

            <div style={{ padding: 18, background: '#E5DDD5' }}>
              <div style={{
                background: '#DCF8C6',
                borderRadius: '14px 14px 14px 4px',
                padding: '12px 14px',
                maxWidth: '85%',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                marginRight: 'auto'
              }}>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    width: '100%', minHeight: 120,
                    fontSize: 14, lineHeight: 1.6, color: '#111',
                    background: 'transparent', border: 'none', padding: 0,
                    fontFamily: 'inherit'
                  }}
                  dir="auto"
                />
              </div>
            </div>

            <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={handleCopy} className="btn-secondary" style={{ flex: 1, padding: 12, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 140 }}>
                {copied ? <Check size={15} color="var(--green-dark)" /> : <Copy size={15} />}
                {copied ? 'הועתק!' : 'העתיקי טקסט'}
              </button>
              <button onClick={handleGenerate} className="btn-secondary" style={{ padding: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={15} />
                נסחי שוב
              </button>
              <button
                onClick={openInWhatsApp}
                style={{
                  flex: 1, padding: 12, fontSize: 14, fontWeight: 700,
                  background: '#25D366', color: 'white',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)', minWidth: 140
                }}
                className="hover-lift"
              >
                <Send size={15} />
                פתחי בוואצאפ
              </button>
            </div>
          </div>
        )}

        {!message && !loading && (
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)', padding: 30, textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
              ההודעה תופיע כאן ברגע שתלחצי על הכפתור למעלה
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
