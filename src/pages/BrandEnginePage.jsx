import { useState, useRef } from 'react'
import { Sparkles, Image as ImageIcon, Upload, Loader, AlertCircle, Zap, ChevronRight } from 'lucide-react'
import { generateSalesPostContent, generatePostImage, POST_TYPES } from '../services/openai'
import { overlayLogo } from '../services/imageUtils'
import SalesPostTemplate from '../components/SalesPostTemplate'

// Load gallery images
const galleryModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true })
const LOCAL_GALLERY_IMAGES = Object.values(galleryModules).map(m => m.default)

// ─── STEP CONSTANTS ──────────────────────────────────────────────────────────
const STEP = { PICK: 'pick', BRIEF: 'brief', GENERATING: 'generating', RESULT: 'result' }

// ─── TEMPLATE CARD ───────────────────────────────────────────────────────────
function TemplateCard({ template, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 14px',
        borderRadius: 16,
        background: active
          ? 'linear-gradient(135deg, #FDF0F5, #FAE8F0)'
          : 'var(--white)',
        border: active ? '2px solid #C2186A' : '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 6,
        textAlign: 'right',
        boxShadow: active ? '0 4px 16px rgba(194,24,106,0.18)' : 'var(--shadow-sm)',
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="hover-lift"
    >
      {active && (
        <div style={{
          position: 'absolute', top: 8, left: 10,
          width: 20, height: 20, borderRadius: '50%',
          background: '#C2186A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 800 }}>✓</span>
        </div>
      )}
      <span style={{ fontSize: 26 }}>{template.emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: active ? '#C2186A' : 'var(--text-dark)' }}>
        {template.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {template.desc}
      </span>
    </button>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function BrandEnginePage() {
  const [step,             setStep]             = useState(STEP.PICK)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [brief,            setBrief]            = useState('')
  const [postData,         setPostData]         = useState(null)
  const [bgImage,          setBgImage]          = useState(null)
  const [error,            setError]            = useState('')
  const [imageSource,      setImageSource]      = useState('ai') // 'ai' | 'gallery' | 'upload'
  const [selectedGallery,  setSelectedGallery]  = useState(null)
  const fileInputRef = useRef(null)

  // Generation progress substeps
  const [genPhase, setGenPhase] = useState('') // 'content' | 'image' | 'done'

  // ── Generation pipeline ────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!selectedTemplate || !brief.trim()) return
    setError('')
    setStep(STEP.GENERATING)
    setGenPhase('content')

    let content = null
    let imageUrl = null

    // 1. Generate content JSON
    try {
      content = await generateSalesPostContent({ brief, templateId: selectedTemplate.id })
    } catch (e) {
      setError(e.message)
      setStep(STEP.BRIEF)
      return
    }

    // 2. Generate / pick image
    setGenPhase('image')
    if (imageSource === 'gallery' && selectedGallery) {
      imageUrl = selectedGallery
    } else if (imageSource === 'upload' && bgImage && bgImage.startsWith('blob:')) {
      imageUrl = bgImage
    } else {
      // Auto-generate with DALL-E
      try {
        const sceneDesc = content.image_description || 'Warm authentic team building moment in nature, Israel, golden hour.'
        const raw = await generatePostImage(sceneDesc)
        imageUrl = await overlayLogo(raw)
      } catch (e) {
        // Image failure is non-fatal — use gallery fallback if available
        imageUrl = LOCAL_GALLERY_IMAGES[0] || null
      }
    }

    setGenPhase('done')
    setPostData(content)
    setBgImage(imageUrl)
    setStep(STEP.RESULT)
  }

  // ── Regenerate content only (keep image) ──────────────────────────────────
  async function handleRegenerateContent() {
    if (!selectedTemplate) return
    setError('')
    setGenPhase('content')
    try {
      const content = await generateSalesPostContent({ brief, templateId: selectedTemplate.id })
      setPostData(content)
    } catch (e) {
      setError(e.message)
    }
    setGenPhase('done')
  }

  // ── File upload handler ───────────────────────────────────────────────────
  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setBgImage(prev => { if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setImageSource('upload')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: GENERATING
  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEP.GENERATING) {
    const phases = [
      { id: 'content', label: 'מייצר תוכן ממותג...', sub: `תבנית: ${selectedTemplate?.name}` },
      { id: 'image',   label: 'מייצר תמונת רקע...', sub: 'AI בוחר סצנה אידיאלית' },
      { id: 'done',    label: 'מרכיב את הפוסט...',  sub: 'עוד שנייה ואנחנו שם!' },
    ]
    const currentIdx = phases.findIndex(p => p.id === genPhase)

    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--cream)', gap: 28, padding: 32,
      }} className="fade-in">
        {/* Animated brand pulse */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F7DDE7, #FAE8F0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(194,24,106,0.2)',
          border: '2px solid rgba(194,24,106,0.25)',
        }}>
          <Loader size={38} color="#C2186A" className="spin" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 6 }}>
            {phases[currentIdx]?.label || 'מכין את הפוסט שלך...'}
          </p>
          <p style={{ fontSize: 13, color: '#C2186A', fontWeight: 600 }}>
            {phases[currentIdx]?.sub || ''}
          </p>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 10 }}>
          {phases.map((p, i) => (
            <div key={p.id} style={{
              width: i <= currentIdx ? 28 : 8,
              height: 8, borderRadius: 4,
              background: i <= currentIdx ? '#C2186A' : '#F0CBD8',
              transition: 'all 0.4s',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>
          מנוע המותג עובד בשבילך ✨
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: RESULT
  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEP.RESULT) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1250 0%, #C2186A 100%)',
          padding: '48px 20px 22px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: 'var(--shadow-md)',
        }}>
          <button
            onClick={() => setStep(STEP.BRIEF)}
            style={{
              background: 'rgba(255,255,255,0.18)', color: 'white',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 18 }}>{selectedTemplate?.emoji}</span>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: 'white' }}>
                {selectedTemplate?.name}
              </h2>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              לחצי על כל טקסט בפוסט לעריכה מהירה
            </p>
          </div>
        </div>

        <div className="desktop-container" style={{ maxWidth: 820 }}>
          {error && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: '#FEF2F2', borderRadius: 12, padding: '12px 16px',
              marginBottom: 16, border: '1px solid #FECACA',
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Post preview */}
          {postData && (
            <SalesPostTemplate
              bgImage={bgImage}
              headline={postData.headline}
              personalLine={postData.personal_line}
              subheadline={postData.subheadline}
              benefits={postData.benefits}
              services={postData.services}
              onRegenerate={handleRegenerateContent}
              generatingContent={genPhase === 'content'}
            />
          )}

          {/* Replace image section */}
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 18, marginTop: 20,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 12 }}>
              🖼️ החלפת תמונת הרקע
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[
                { id: 'ai',      label: '✨ AI' },
                { id: 'gallery', label: '🖼️ מאגר' },
                { id: 'upload',  label: '📁 העלאה' },
              ].map(src => (
                <button
                  key={src.id}
                  onClick={() => setImageSource(src.id)}
                  style={{
                    flex: 1, padding: '10px', fontSize: 12.5,
                    fontWeight: imageSource === src.id ? 700 : 500,
                    background: imageSource === src.id ? 'linear-gradient(135deg, #FDF0F5, #FAE8F0)' : 'var(--white)',
                    color: imageSource === src.id ? '#C2186A' : 'var(--text-mid)',
                    border: imageSource === src.id ? '1.5px solid #C2186A' : '1px solid var(--border)',
                    borderRadius: 10,
                  }}
                  className="hover-lift"
                >
                  {src.label}
                </button>
              ))}
            </div>

            {imageSource === 'gallery' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {LOCAL_GALLERY_IMAGES.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => { setSelectedGallery(img); setBgImage(img); }}
                    style={{
                      width: '100%', height: 80, objectFit: 'cover', borderRadius: 8,
                      cursor: 'pointer',
                      border: bgImage === img ? '3px solid #C2186A' : '2px solid transparent',
                      opacity: bgImage && bgImage !== img ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                    className="hover-lift"
                  />
                ))}
              </div>
            )}

            {imageSource === 'upload' && (
              <>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary hover-lift"
                  style={{ width: '100%', padding: 12, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Upload size={16} /> לחצי לבחירת תמונה
                </button>
              </>
            )}

            {imageSource === 'ai' && (
              <button
                onClick={async () => {
                  setGenPhase('image')
                  try {
                    const raw = await generatePostImage(postData?.image_description || brief)
                    const url = await overlayLogo(raw)
                    setBgImage(url)
                  } catch (e) { setError(e.message) }
                  setGenPhase('done')
                }}
                disabled={genPhase === 'image'}
                className="hover-lift"
                style={{
                  width: '100%', padding: 12, fontSize: 13, fontWeight: 700,
                  background: genPhase === 'image' ? '#ddd' : 'linear-gradient(135deg, #C2186A, #8B1250)',
                  color: 'white', border: 'none', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {genPhase === 'image' ? <><Loader size={14} className="spin" />מייצר...</> : <><Sparkles size={14} />צור תמונה חדשה עם AI</>}
              </button>
            )}
          </div>

          {/* Start over */}
          <button
            onClick={() => {
              setStep(STEP.PICK)
              setPostData(null)
              setBgImage(null)
              setBrief('')
              setError('')
            }}
            className="btn-secondary hover-lift"
            style={{ width: '100%', padding: 14, fontSize: 13, marginTop: 16, marginBottom: 32 }}
          >
            ← התחלי פוסט חדש
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: PICK template
  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEP.PICK) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1250 0%, #C2186A 60%, #D4487A 100%)',
          padding: '54px 20px 28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, left: -40,
            width: 160, height: 160,
            background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', top: 10, right: -20,
            width: 100, height: 100,
            background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={20} color="white" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>
                מנוע המותג
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 400, lineHeight: 1.5 }}>
              בחרי תבנית ← כתבי על מה ← מנוע המותג יייצר פוסט מוכן
            </p>
          </div>
        </div>

        <div className="desktop-container" style={{ maxWidth: 820 }}>
          {/* Style Lock badge */}
          <div style={{
            background: 'linear-gradient(135deg, #FDF0F5, #FAE8F0)',
            border: '1px solid #F0CBD8', borderRadius: 14,
            padding: '12px 16px', marginBottom: 20,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#C2186A', marginBottom: 2 }}>Style Lock מופעל</p>
              <p style={{ fontSize: 11, color: '#8B1250', lineHeight: 1.5 }}>
                כל פוסט שומר על אותה פלטת צבעים, לוגו, כפתורים ופוטר.
                רק הכותרת, היתרונות והתמונה משתנים.
              </p>
            </div>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            בחרי את סוג הפוסט
          </p>

          {/* 7 template cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {POST_TYPES.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                active={selectedTemplate?.id === t.id}
                onClick={() => setSelectedTemplate(t)}
              />
            ))}
          </div>

          <button
            onClick={() => { if (selectedTemplate) setStep(STEP.BRIEF) }}
            disabled={!selectedTemplate}
            className="btn-primary hover-lift"
            style={{
              width: '100%', padding: 16, fontSize: 15, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: selectedTemplate
                ? 'linear-gradient(135deg, #C2186A, #8B1250)'
                : 'var(--text-muted)',
              boxShadow: selectedTemplate ? '0 6px 20px rgba(194,24,106,0.35)' : 'none',
              borderRadius: 14, marginBottom: 32,
            }}
          >
            המשיכי לשלב הבא ←
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: BRIEF
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8B1250 0%, #C2186A 100%)',
        padding: '48px 20px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => setStep(STEP.PICK)}
          style={{
            background: 'rgba(255,255,255,0.18)', color: 'white',
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{selectedTemplate?.emoji}</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
              {selectedTemplate?.name}
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            כתבי על מה הפוסט — AI מטפל בשאר
          </p>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 820 }}>
        {/* Brief */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            על מה הפוסט?
          </p>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder={`לדוגמה (תבנית "${selectedTemplate?.name}"):\n${
                selectedTemplate?.id === 'tip'             ? 'טיפ על איך לבנות לו"ז שמייצר חיבור אמיתי בין אנשים' :
                selectedTemplate?.id === 'inspiration'     ? 'סיפור על העובדת שהתרגשה מזה שחשבו עליה' :
                selectedTemplate?.id === 'value'           ? 'איך אנחנו מתרגמים את ערך החדשנות לחוויה בשטח' :
                selectedTemplate?.id === 'case_study'      ? 'חברת הייטק גדולה שחיפשה לעשות משהו שונה לגמרי' :
                'הזמנה לשריין תאריך לנופש חברה מרגש'
              }`}
              style={{
                width: '100%', padding: '16px', fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-dark)', background: 'transparent', border: 'none', minHeight: 140,
              }}
              className="premium-textarea"
            />
            <div style={{
              padding: '8px 16px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between',
              background: 'rgba(194,24,106,0.02)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{brief.length} תווים</span>
              <span style={{ fontSize: 11, color: '#C2186A', fontWeight: 600 }}>מספיק 2-3 משפטים ✓</span>
            </div>
          </div>
        </div>

        {/* Image source selector */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            תמונת הרקע
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              { id: 'ai',      label: '✨ AI (מומלץ)', desc: 'תמונה שנוצרת מהתוכן' },
              { id: 'gallery', label: '🖼️ מאגר',       desc: 'מתמונות שיש לי' },
              { id: 'upload',  label: '📁 העלאה',       desc: 'מהמחשב שלי' },
            ].map(src => (
              <button
                key={src.id}
                onClick={() => setImageSource(src.id)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12,
                  background: imageSource === src.id ? 'linear-gradient(135deg,#FDF0F5,#FAE8F0)' : 'var(--white)',
                  color: imageSource === src.id ? '#C2186A' : 'var(--text-mid)',
                  border: imageSource === src.id ? '1.5px solid #C2186A' : '1px solid var(--border)',
                  fontSize: 12, fontWeight: imageSource === src.id ? 700 : 500,
                  display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                className="hover-lift"
              >
                <span>{src.label}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{src.desc}</span>
              </button>
            ))}
          </div>

          {imageSource === 'gallery' && LOCAL_GALLERY_IMAGES.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {LOCAL_GALLERY_IMAGES.map((img, i) => (
                <img key={i} src={img} alt=""
                  onClick={() => { setSelectedGallery(img); setBgImage(img); }}
                  style={{
                    width: '100%', height: 75, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                    border: selectedGallery === img ? '3px solid #C2186A' : '2px solid transparent',
                    opacity: selectedGallery && selectedGallery !== img ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                  className="hover-lift"
                />
              ))}
            </div>
          )}

          {imageSource === 'upload' && (
            <>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()}
                className="btn-secondary hover-lift"
                style={{ width: '100%', padding: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderStyle: 'dashed' }}
              >
                <Upload size={16} /> לחצי לבחירת תמונה
              </button>
              {bgImage && imageSource === 'upload' && (
                <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={bgImage} alt="Uploaded" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            background: '#FEF2F2', borderRadius: 12, padding: '12px 16px',
            marginBottom: 16, border: '1px solid #FECACA',
          }}>
            <AlertCircle size={16} color="#DC2626" />
            <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!brief.trim()}
          className="hover-lift"
          style={{
            width: '100%', padding: '18px', fontSize: 16, fontWeight: 900,
            background: brief.trim()
              ? 'linear-gradient(135deg, #C2186A, #8B1250)'
              : 'var(--text-muted)',
            color: 'white', border: 'none', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: brief.trim() ? '0 8px 28px rgba(194,24,106,0.4)' : 'none',
            cursor: brief.trim() ? 'pointer' : 'not-allowed',
            marginBottom: 32,
            transition: 'all 0.25s',
          }}
        >
          <Sparkles size={20} />
          ✨ צרי פוסט מוכן עכשיו
        </button>
      </div>
    </div>
  )
}
