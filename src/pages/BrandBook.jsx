import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Copy, Check, Send, Sparkles, Heart, Palette, Target, Award, ArrowLeft, ArrowRight, Lightbulb, Video, Layers } from 'lucide-react'

// Curated list of premium Hebrew hooks for HR/Welfare managers
const HOOKS = [
  "רוב הארגונים מתכננים אירוע. אני מתחילה מערך.",
  "יום גיבוש טוב מתחיל הרבה לפני היום עצמו.",
  "הטעות הכי גדולה בתכנון אירוע חברה?",
  "לא כל יום כיף יוצר חיבור.",
  "עובדים לא זוכרים רק את הפעילות. הם זוכרים את החיבור.",
  "לפעמים שינוי קטן יוצר את החוויה הגדולה ביותר.",
  "מה הופך אירוע חברה לבלתי נשכח באמת?",
  "לפני שבוחרים פעילות, צריך לענות על שאלה אחת.",
  "חיבור בין עובדים לא נוצר במקרה.",
  "אחרי התקופה שעברנו, המשמעות חשובה יותר מתמיד.",
  "הסוד ליום גיבוש מוצלח? אל תשאלו אותם מה בא להם לעשות.",
  "איך מחברים צוות שכבר ראה ועשה הכל?",
  "יום גיבוש הוא לא מותרות — הוא השקעה תשתיתית בארגון שלכם.",
  "אירוע מוצלח הוא לא כזה שיש בו רק אוכל טוב, אלא כזה שיש בו שיחות אמיתיות.",
  "תרבות ארגונית לא בונים במצגות. בונים אותה בחוויות משותפות.",
  "איך לגרום לעובדים להתרגש באמת מיום החברה הבא שלכם?",
  "מנהלת רווחה יקרה, את לא צריכה להפיק הכל לבד. בואי נקל עלייך.",
  "כשהעובדים מרגישים שייכות, התוצאות העסקיות מגיעות מעצמן.",
  "חוויה אמיתית משאירה חותם בלב, לא רק בגלריה של הטלפון.",
  "מתכננים את הרבעון הבא? אל תשכחו את האנשים שמאחורי המספרים."
]

const POST_TYPES = [
  { id: 'tip',       label: 'טיפ מקצועי',       emoji: '💡', desc: 'איך לבנות תקציב, בחירת לוקיישן, טעויות נפוצות' },
  { id: 'question',  label: 'שאלת מחשבה',       emoji: '❓', desc: 'שאלות מעוררות מעורבות למנהלות משאבי אנוש' },
  { id: 'casestudy', label: 'סיפור לקוח',       emoji: '🏆', desc: 'איך חברה הגיעה עם אתגר ואיך פתרנו אותו ביום שווה' },
  { id: 'behind',    label: 'מאחורי הקלעים',    emoji: '🎬', desc: 'פגישות עם ספקים, בניית קונספט, רגעים מרגשים' },
  { id: 'sale',      label: 'פוסט מכירה רך',     emoji: '📣', desc: 'הצעה לבניית חוויה מותאמת אישית לצוות' },
  { id: 'inspiration', label: 'פוסט השראה',     emoji: '✨', desc: 'ציטוט חזק, רעיון יצירתי, או מגמה חדשה בעולם ה-HR' }
]

const PALETTE = [
  { name: 'ירוק זית כהה (Dark Olive)', hex: '#4F5D44', text: '#FFFFFF', border: '#394431' },
  { name: 'ירוק סייג׳ בהיר (Light Sage)', hex: '#C8D4C5', text: '#2D3329', border: '#B4C2B0' },
  { name: 'ירוק סייג׳ עמום (Dusty Sage)', hex: '#8E9E89', text: '#FFFFFF', border: '#7A8C75' },
  { name: 'שמנת ורודה (Eggshell)', hex: '#F3E9E5', text: '#2D3329', border: '#E0D4CE' },
  { name: 'חום חימר/חול (Clay Earth)', hex: '#C19683', text: '#FFFFFF', border: '#AD7F6C' },
  { name: 'ורוד פודרה (Powder Pink)', hex: '#F0CBC7', text: '#2D3329', border: '#DDB4B0' }
]

export default function BrandBook() {
  const navigate = useNavigate()
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedColor, setCopiedColor] = useState(null)

  const handleCopyHook = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyColor = (hex) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const handleSendToCreator = (hookText, typeId = 'tip') => {
    sessionStorage.setItem('tal_prefill', JSON.stringify({
      platform: 'instagram',
      contentType: typeId,
      brief: hookText
    }))
    navigate('/create')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
      
      {/* ── Header ── */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 28px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, background: 'rgba(143,175,135,0.12)', borderRadius: '50%' }} />
        <div className="desktop-header-wrap" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.18)'
            }}>
              <BookOpen size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.4px', marginBottom: 2 }}>ספר מותג דינמי</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>ה-DNA השיווקי, ההוקים וסגנון המותג של טל שני</p>
            </div>
          </div>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 860 }}>
        
        {/* ── Section 1: Brand Essence ── */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: 24, marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Target size={18} color="var(--green-dark)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>הזהות והבידול של טל שני</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ background: 'var(--green-pale)', padding: '16px 20px', borderRadius: 'var(--radius-md)', borderRight: '4px solid var(--green-dark)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-dark)', marginBottom: 4, textTransform: 'uppercase' }}>הבטחת המותג</p>
              <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: 500 }}>
                "אני יוצרת חוויות ארגוניות שמחברות אנשים ומחזקות את הערכים של הארגון. האירוע עצמו הוא רק כלי — החיבור והערך הם המטרה."
              </p>
            </div>
            
            <div style={{ background: 'var(--pink-pale)', padding: '16px 20px', borderRadius: 'var(--radius-md)', borderRight: '4px solid var(--earth)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--earth)', marginBottom: 4, textTransform: 'uppercase' }}>הבידול המרכזי</p>
              <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6 }}>
                בעוד שרוב מפיקי האירועים שואלים: <strong>"מה בא לכם לעשות?"</strong>, טל שני שואלת: <strong>"מה אתם רוצים שהעובדים ירגישו וייקחו איתם הביתה?"</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Copyable Color Themes ── */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: 24, marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Palette size={18} color="var(--earth)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>פלטת הצבעים הממותגת</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 18 }}>
            צבעים יוקרתיים, נשיים, טבעיים ואותנטיים. לחצי על קוד צבע כדי להעתיק אותו מיד.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {PALETTE.map((color) => (
              <div 
                key={color.hex}
                onClick={() => handleCopyColor(color.hex)}
                style={{
                  background: color.hex,
                  color: color.text,
                  border: `1.5px solid ${color.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
              >
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{color.name}</div>
                <div style={{ fontSize: 11.5, fontFamily: 'monospace', opacity: 0.85 }}>
                  {copiedColor === color.hex ? '✓ הועתק!' : color.hex}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Interactive Post Formats ── */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: 24, marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Layers size={18} color="var(--green-mid)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>סוגי פוסטים שבועיים</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 18 }}>
            גיוון התכנים השבועי מבטיח עניין ומעורבות. לחצי על כפתור <strong>"התחילי לכתוב"</strong> כדי לפתוח את המחולל מוגדר מראש!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="brand-book-grid-mobile">
            {POST_TYPES.map((type) => (
              <div 
                key={type.id}
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{type.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>{type.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5 }}>{type.desc}</p>
                </div>
                <button
                  onClick={() => handleSendToCreator('', type.id)}
                  style={{
                    fontSize: 11.5,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%'
                  }}
                  className="btn-secondary hover-lift"
                >
                  <Send size={12} /> התחילי לכתוב
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: 20 Winning Hooks ── */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Lightbulb size={18} color="var(--green-dark)" />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>20 הוקים מנצחים למשאבי אנוש</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 20 }}>
            משפטי פתיחה חזקים שמעוררים הזדהות מיידית ומניעים קריאה. העתיקי אותם או שלחי אותם ישירות למחולל הפוסטים.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOOKS.map((hook, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <span style={{ fontSize: 13.5, color: 'var(--text-dark)', fontWeight: 500, lineHeight: 1.6, flex: 1, textAlign: 'right' }}>
                  {hook}
                </span>
                
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyHook(hook, idx)}
                    style={{
                      width: 32, height: 32,
                      background: 'var(--white)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    className="hover-lift"
                    title="העתיקי הוק"
                  >
                    {copiedIndex === idx ? (
                      <Check size={14} color="var(--green-dark)" />
                    ) : (
                      <Copy size={14} color="var(--text-light)" />
                    )}
                  </button>

                  {/* Send to Creator Button */}
                  <button
                    onClick={() => handleSendToCreator(hook)}
                    style={{
                      width: 32, height: 32,
                      background: 'var(--green-pale)',
                      border: '1px solid var(--green-light)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    className="hover-lift"
                    title="שלחי למחולל הפוסטים"
                  >
                    <Send size={14} color="var(--green-dark)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
