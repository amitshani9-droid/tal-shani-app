import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, RefreshCw, Copy, Check, BookmarkPlus, Send, ChevronRight, Loader, AlertCircle, Image as ImageIcon, Palette, Upload, Layout } from 'lucide-react'
import { generatePost, regeneratePost, generatePostImage, generateImageContent, generateSalesPostContent } from '../services/openai'
import { overlayLogo } from '../services/imageUtils'
import { storage, platformLabels, contentTypeLabels } from '../services/storage'
import CanvaPostGenerator from '../components/CanvaPostGenerator'
import SalesPostTemplate from '../components/SalesPostTemplate'

// Load all images from the gallery folder dynamically
const galleryModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true });
const LOCAL_GALLERY_IMAGES = Object.values(galleryModules).map(mod => mod.default);

const platforms = [
  { id: 'instagram', label: 'אינסטגרם', emoji: '📱' },
  { id: 'facebook',  label: 'פייסבוק',  emoji: '👥' },
  { id: 'linkedin',  label: 'לינקדאין', emoji: '💼' },
  { id: 'all',       label: 'כולם',      emoji: '🚀' },
]

const contentTypes = [
  { id: 'tip',       label: 'טיפ מקצועי',       emoji: '💡' },
  { id: 'sale',      label: 'פוסט מכירה',        emoji: '📣' },
  { id: 'behind',    label: 'Behind the scenes', emoji: '🎬' },
  { id: 'question',  label: 'שאלה לקהל',         emoji: '❓' },
  { id: 'casestudy', label: 'סיפור הצלחה',       emoji: '🏆' },
]

const formats = [
  { id: 'post', label: 'פוסט סטנדרטי', emoji: '✍️' },
  { id: 'reels', label: 'תסריט רילס / סרטון', emoji: '🎬' },
  { id: 'carousel', label: 'קרוסלת תמונות', emoji: '🖼️' },
]

const THEME_MAP_LOCAL = {
  'green-beige': { name: 'ירוק זית כהה', bg: '#E8EDE6', text: '#4F5D44', accent: '#F0CBC7' },
  'earth-gold':  { name: 'חום חימר ואדמה', bg: '#F3E9E5', text: '#C19683', accent: '#F0CBC7' },
  'ivory-gold':  { name: 'שמנת ורודה', bg: '#F3E9E5', text: '#4F5D44', accent: '#C19683' },
  'pink-beige':  { name: 'ורוד פודרה', bg: '#FDF5F4', text: '#4F5D44', accent: '#C19683' },
}

const STEPS = { FORM: 'form', LOADING: 'loading', RESULT: 'result' }

const PLATFORM_ACTIVE = {
  instagram: { background: '#BE185D', border: '1px solid #BE185D' },
  facebook:  { background: '#1D4ED8', border: '1px solid #1D4ED8' },
  linkedin:  { background: '#0369A1', border: '1px solid #0369A1' },
  all:       { background: 'var(--green-dark)', border: '1px solid var(--green-dark)' },
}

const getPlatformLabel = (id) => {
  if (id === 'instagram') return 'אינסטגרם'
  if (id === 'facebook') return 'פייסבוק'
  if (id === 'linkedin') return 'לינקדאין'
  if (id === 'all') return 'כל הפלטפורמות'
  return ''
}

const getContentTypeLabel = (id) => {
  if (id === 'tip') return '💡 טיפ מקצועי'
  if (id === 'sale') return '📣 פוסט מכירה'
  if (id === 'behind') return '🎬 Behind the scenes'
  if (id === 'question') return '❓ שאלה לקהל'
  if (id === 'casestudy') return '🏆 סיפור הצלחה'
  return ''
}

const getPlatformActiveStyle = (id) => {
  if (id === 'instagram') return { background: '#BE185D', border: '1px solid #BE185D' }
  if (id === 'facebook') return { background: '#1D4ED8', border: '1px solid #1D4ED8' }
  if (id === 'linkedin') return { background: '#0369A1', border: '1px solid #0369A1' }
  if (id === 'all') return { background: 'var(--green-dark)', border: '1px solid var(--green-dark)' }
  return { background: 'var(--green-dark)', border: '1px solid var(--green-dark)' }
}


export default function Create() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState(STEPS.FORM)
  const [platform, setPlatform] = useState('instagram')
  const [contentType, setContentType] = useState('tip')
  const [format, setFormat] = useState('post')
  const [brief, setBrief] = useState('')
  const [result, setResult] = useState('')
  const [editedResult, setEditedResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [rewritePrompt, setRewritePrompt] = useState('')
  const [showRewrite, setShowRewrite] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showAiImage, setShowAiImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const [showQuickCard, setShowQuickCard] = useState(false)
  const [generatingDesign, setGeneratingDesign] = useState(false)
  const [designData, setDesignData] = useState(null)
  const [designError, setDesignError] = useState('')
  const [activeImageTab, setActiveImageTab] = useState('gallery')
  const [editingDraftId, setEditingDraftId] = useState(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const fileInputRef = useRef(null)

  // Sales Post Template state
  const [showSalesPost, setShowSalesPost] = useState(false)
  const [salesPostData, setSalesPostData] = useState(null)
  const [generatingSalesPost, setGeneratingSalesPost] = useState(false)
  const [salesPostError, setSalesPostError] = useState('')

  // Revoke blob URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      setImageUrl(prev => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
        return prev
      })
    }
  }, [])

  // Canva visual design state
  const [canvasTitle, setCanvasTitle] = useState('חוויה עם ערך')
  const [canvasSubtitle, setCanvasSubtitle] = useState('ההשקעה הטובה ביותר בצוות שלכם.')
  const [canvasBullets, setCanvasBullets] = useState([
    { title: "כיף אמיתי", desc: "שמחבר בין אנשים." },
    { title: "ערך שנשאר", desc: "השראה, חיבור ומשמעות." },
    { title: "חוויית שמשדרגת", desc: "גם הרבה אחרי שהיום נגמר." }
  ])
  const [canvasTheme, setCanvasTheme] = useState('green-beige')
  const [canvasFont, setCanvasFont] = useState('Heebo')
  const [canvasOverlayOpacity, setCanvasOverlayOpacity] = useState(0.65)
  const [templateIndex, setTemplateIndex] = useState(0)

  useEffect(() => {
    let didPrefillOrEdit = false

    // Draft editing — restores full result state
    const draftEdit = sessionStorage.getItem('tal_draft_edit')
    if (draftEdit) {
      try {
        const d = JSON.parse(draftEdit)
        if (d.platform)     setPlatform(d.platform)
        if (d.contentType)  setContentType(d.contentType)
        if (d.brief)        setBrief(d.brief)
        if (d.content)      { setResult(d.content); setEditedResult(d.content) }
        if (d.imageUrl)     setImageUrl(d.imageUrl)
        if (d.designData)   {
          setDesignData(d.designData)
          setCanvasTitle(d.designData.title)
          setCanvasSubtitle(d.designData.subtitle)
          setCanvasBullets(d.designData.bullets)
        }
        if (d.canvasTheme)  setCanvasTheme(d.canvasTheme)
        if (d.canvasFont)   setCanvasFont(d.canvasFont)
        if (d.canvasOverlayOpacity) setCanvasOverlayOpacity(d.canvasOverlayOpacity)
        if (d.templateIndex !== undefined) setTemplateIndex(d.templateIndex)
        if (d.format)       setFormat(d.format)
        setEditingDraftId(d.id)
        setStep(STEPS.RESULT)
        didPrefillOrEdit = true
      } catch { /* ignore */ }
      sessionStorage.removeItem('tal_draft_edit')
    } else {
      // New post prefill from research or brand book
      const prefill = sessionStorage.getItem('tal_prefill')
      if (prefill) {
        try {
          const { platform: pf, contentType: ct, brief: br, format: fmt } = JSON.parse(prefill)
          if (pf) setPlatform(pf)
          if (ct) setContentType(ct)
          if (br) setBrief(br)
          if (fmt) setFormat(fmt)
          didPrefillOrEdit = true
        } catch { /* ignore */ }
        sessionStorage.removeItem('tal_prefill')
      }
    }

    // Load from autosaved post state if we didn't do an explicit prefill or draft edit
    if (!didPrefillOrEdit) {
      const autosaved = localStorage.getItem('tal_autosaved_post_state')
      if (autosaved) {
        try {
          const d = JSON.parse(autosaved)
          if (d.step)          setStep(d.step)
          if (d.platform)      setPlatform(d.platform)
          if (d.contentType)   setContentType(d.contentType)
          if (d.format)        setFormat(d.format)
          if (d.brief)         setBrief(d.brief)
          if (d.result)        setResult(d.result)
          if (d.editedResult)  setEditedResult(d.editedResult)
          if (d.imageUrl)      setImageUrl(d.imageUrl)
          if (d.showAiImage !== undefined) setShowAiImage(d.showAiImage)
          if (d.designData) {
            setDesignData(d.designData)
            setCanvasTitle(d.designData.title || d.canvasTitle || 'חוויה עם ערך')
            setCanvasSubtitle(d.designData.subtitle || d.canvasSubtitle || 'ההשקעה הטובה ביותר בצוות שלכם.')
            setCanvasBullets(d.designData.bullets || d.canvasBullets || [])
          } else {
            if (d.canvasTitle) setCanvasTitle(d.canvasTitle)
            if (d.canvasSubtitle) setCanvasSubtitle(d.canvasSubtitle)
            if (d.canvasBullets) setCanvasBullets(d.canvasBullets)
          }
          if (d.showQuickCard !== undefined) setShowQuickCard(d.showQuickCard)
          if (d.canvasTheme)   setCanvasTheme(d.canvasTheme)
          if (d.canvasFont)    setCanvasFont(d.canvasFont)
          if (d.canvasOverlayOpacity) setCanvasOverlayOpacity(d.canvasOverlayOpacity)
          if (d.templateIndex !== undefined) setTemplateIndex(d.templateIndex)
          if (d.editingDraftId) setEditingDraftId(d.editingDraftId)
        } catch { /* ignore */ }
      }
    }

    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return

    const handle = setTimeout(() => {
      const stateToSave = {
        step,
        platform,
        contentType,
        format,
        brief,
        result,
        editedResult,
        // Don't autosave large base64 images — they bloat localStorage and risk quota errors
        imageUrl: imageUrl?.startsWith('data:') ? '' : imageUrl,
        showAiImage,
        designData,
        showQuickCard,
        canvasTitle,
        canvasSubtitle,
        canvasBullets,
        canvasTheme,
        canvasFont,
        canvasOverlayOpacity,
        templateIndex,
        editingDraftId
      }
      try {
        localStorage.setItem('tal_autosaved_post_state', JSON.stringify(stateToSave))
      } catch { /* quota — ignore, will retry on next change */ }
    }, 500)

    return () => clearTimeout(handle)
  }, [
    loaded, step, platform, contentType, format, brief, result, editedResult, imageUrl,
    showAiImage, designData, showQuickCard, canvasTitle, canvasSubtitle,
    canvasBullets, canvasTheme, canvasFont, canvasOverlayOpacity, templateIndex, editingDraftId
  ])

  async function handleGenerate() {
    if (!brief.trim()) return
    setError('')
    setStep(STEPS.LOADING)
    try {
      const post = await generatePost({ platform, contentType, brief, format })
      setResult(post)
      setEditedResult(post)
      setStep(STEPS.RESULT)
    } catch (e) {
      setError(e.message)
      setStep(STEPS.FORM)
    }
  }

  async function handleRegenerate() {
    if (!rewritePrompt.trim()) return
    setRegenerating(true)
    try {
      const post = await regeneratePost({ existingPost: editedResult, instruction: rewritePrompt })
      setResult(post)
      setEditedResult(post)
      setRewritePrompt('')
      setShowRewrite(false)
    } catch (e) {
      setError(e.message)
    }
    setRegenerating(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editedResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('לא הצלחנו להעתיק — אנא העתיקי ידנית')
    }
  }

  async function handleGenerateImage() {
    setGeneratingImage(true)
    setImageError('')
    try {
      const raw = await generatePostImage(editedResult)
      const url = await overlayLogo(raw)
      setImageUrl(url)
      setShowAiImage(true)
      setDesignData(null)
      setShowQuickCard(false)
    } catch (e) {
      setImageError(e.message)
    } finally {
      setGeneratingImage(false)
    }
  }

  // ─── Sales Post Template handler ─────────────────────────────────────────
  async function handleGenerateSalesPost(briefText) {
    setGeneratingSalesPost(true)
    setSalesPostError('')
    setShowSalesPost(true)
    try {
      const data = await generateSalesPostContent({ brief: briefText || brief })
      setSalesPostData(data)
    } catch (e) {
      setSalesPostError(e.message)
      setShowSalesPost(false)
    } finally {
      setGeneratingSalesPost(false)
    }
  }

  const autoDesignRunning = useRef(false)

  // One-click: generate matching AI background + canvas text together
  async function handleFullAutoDesign() {
    if (autoDesignRunning.current) return
    autoDesignRunning.current = true
    setGeneratingImage(true)
    setGeneratingDesign(false)
    setImageError('')
    setDesignError('')
    setShowQuickCard(false)
    setDesignData(null)
    let bgUrl = imageUrl
    try {
      // Step 1: generate a relevant background image from the post text
      const raw = await generatePostImage(editedResult)
      bgUrl = await overlayLogo(raw)
      setImageUrl(bgUrl)
      setShowAiImage(true)
    } catch (e) {
      setImageError(e.message)
      setGeneratingImage(false)
      autoDesignRunning.current = false
      return
    }
    setGeneratingImage(false)
    // Step 2: generate the canvas text overlay
    setGeneratingDesign(true)
    setShowQuickCard(true)
    try {
      const data = await generateImageContent(editedResult)
      setDesignData(data)
      setCanvasTitle(data.title || 'חוויה עם ערך')
      setCanvasSubtitle(data.subtitle || 'ההשקעה הטובה ביותר בצוות שלכם.')
      setCanvasBullets(data.bullets || [])
      if (data.theme) setCanvasTheme(data.theme)
      if (data.font) setCanvasFont(data.font)
      if (data.overlayOpacity) setCanvasOverlayOpacity(parseFloat(data.overlayOpacity))
      if (data.templateIndex !== undefined) setTemplateIndex(parseInt(data.templateIndex))
    } catch (e) {
      setDesignError(e.message)
      setShowQuickCard(false)
    } finally {
      setGeneratingDesign(false)
      autoDesignRunning.current = false
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageUrl(prev => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setShowAiImage(false)
    setDesignData(null)
    setShowQuickCard(false)
  }

  async function handleGenerateDesignData() {
    if (designData) {
      setShowQuickCard(!showQuickCard)
      return
    }
    setGeneratingDesign(true)
    setDesignError('')
    setShowQuickCard(true)
    try {
      const data = await generateImageContent(editedResult)
      setDesignData(data)
      setCanvasTitle(data.title || 'חוויה עם ערך')
      setCanvasSubtitle(data.subtitle || 'ההשקעה הטובה ביותר בצוות שלכם.')
      setCanvasBullets(data.bullets || [])
      if (data.theme) setCanvasTheme(data.theme)
      if (data.font) setCanvasFont(data.font)
      if (data.overlayOpacity) setCanvasOverlayOpacity(parseFloat(data.overlayOpacity))
      if (data.templateIndex !== undefined) setTemplateIndex(parseInt(data.templateIndex))
    } catch (e) {
      setDesignError(e.message)
      setShowQuickCard(false)
    } finally {
      setGeneratingDesign(false)
    }
  }

  function handleSaveDraft() {
    if (editingDraftId) storage.deleteDraft(editingDraftId)
    storage.saveDraft({
      content: editedResult,
      platform,
      platformLabel: getPlatformLabel(platform),
      contentType,
      contentTypeLabel: getContentTypeLabel(contentType),
      brief,
      imageUrl,
      designData: {
        title: canvasTitle,
        subtitle: canvasSubtitle,
        bullets: canvasBullets
      },
      canvasTheme,
      canvasFont,
      canvasOverlayOpacity,
      templateIndex,
      format
    })
    localStorage.removeItem('tal_autosaved_post_state')
    navigate('/history')
  }

  function handlePublish() {
    storage.savePost({
      content: editedResult,
      platform,
      platformLabel: getPlatformLabel(platform),
      contentType,
      contentTypeLabel: getContentTypeLabel(contentType),
      brief,
      status: 'published',
      imageUrl,
      designData: {
        title: canvasTitle,
        subtitle: canvasSubtitle,
        bullets: canvasBullets
      },
      canvasTheme,
      canvasFont,
      canvasOverlayOpacity,
      templateIndex,
      format
    })
    localStorage.removeItem('tal_autosaved_post_state')
    navigate('/')
  }

  function reset() {
    localStorage.removeItem('tal_autosaved_post_state')
    setStep(STEPS.FORM)
    setBrief('')
    setResult('')
    setEditedResult('')
    setError('')
    setShowRewrite(false)
    setImageUrl('')
    setShowAiImage(false)
    setDesignData(null)
    setShowQuickCard(false)
    setEditingDraftId(null)
    setConfirmingReset(false)
    setActiveImageTab('gallery')
    setFormat('post')
    setShowSalesPost(false)
    setSalesPostData(null)
    setSalesPostError('')
  }

  if (step === STEPS.LOADING) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--cream)', gap: 24, padding: 24
      }} className="fade-in">
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
          <p style={{ fontSize: 19, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8 }}>
            כותבת את הפוסט...
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 400 }}>
            האינטליגנציה המלאכותית מנסחת את הסגנון הייחודי שלך ✨
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--green-light)',
              animation: `pulse 1.4s ease-in-out ${i * 0.25}s infinite`
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (step === STEPS.RESULT) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
        
        {/* Header */}
        <div style={{
          background: 'var(--gradient-header)',
          padding: '50px 20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: 'var(--shadow-md)',
          borderBottom: '1px solid rgba(232, 223, 216, 0.15)'
        }}>
          <div className="desktop-header-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
            <button
              onClick={() => editedResult !== result ? setConfirmingReset(true) : reset()}
              style={{
                background: 'rgba(255, 255, 255, 0.15)', color: 'white',
                width: 38, height: 38, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              className="hover-lift"
            >
              <ChevronRight size={22} />
            </button>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                {editingDraftId ? 'עריכת טיוטה ✏️' : 'התוצר מוכן! 🎉'}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.75)' }}>עברי על הטקסט, ערכי ופרסמי</p>
            </div>
          </div>
        </div>

        {confirmingReset && (
          <div style={{
            background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12
          }} className="slide-up">
            <span style={{ flex: 1, fontSize: 13, color: '#92400E', fontWeight: 600 }}>
              יש שינויים שלא נשמרו — לחזור לטופס?
            </span>
            <button
              onClick={reset}
              style={{
                padding: '7px 14px', background: '#92400E', color: 'white',
                borderRadius: 8, fontSize: 12, fontWeight: 700
              }}
            >חזרי ✓</button>
            <button
              onClick={() => setConfirmingReset(false)}
              style={{
                padding: '7px 12px', background: 'white',
                border: '1px solid #FDE68A', borderRadius: 8,
                fontSize: 12, color: '#92400E', fontWeight: 600
              }}
            >המשיכי לערוך</button>
          </div>
        )}

        <div className="desktop-container" style={{ maxWidth: 820 }}>
          {/* Platform and Content Type badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: 12 }}>
              {platforms.find(p => p.id === platform)?.emoji} {getPlatformLabel(platform)}
            </span>
            <span className="badge badge-pink" style={{ padding: '6px 14px', fontSize: 12 }}>
              {getContentTypeLabel(contentType)}
            </span>
            <span className="badge badge-cream" style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--white)' }}>
              {formats.find(f => f.id === format)?.emoji} {formats.find(f => f.id === format)?.label}
            </span>
          </div>

          {/* Editable Post Card */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 16,
            overflow: 'hidden'
          }} className="hover-lift">
            <div style={{
              padding: '12px 16px',
              background: 'var(--green-pale)',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid var(--border)'
            }}>
              <Sparkles size={15} color="var(--green-dark)" />
              <span style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600 }}>טיוטת הפוסט — ניתן לערוך בחופשיות</span>
            </div>
            <textarea
              value={editedResult}
              dir="auto"
              onChange={e => setEditedResult(e.target.value)}
              style={{
                width: '100%', padding: '16px',
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-dark)',
                background: 'transparent',
                border: 'none',
                minHeight: 250
              }}
              className="premium-textarea"
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: '#FEF2F2', borderRadius: 12, padding: '12px 16px',
              marginBottom: 16, border: '1px solid #FECACA'
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Rewrite Instructions Section */}
          {showRewrite && (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', padding: 16, marginBottom: 16,
              boxShadow: 'var(--shadow-sm)'
            }} className="scale-in">
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 10 }}>
                מה תרצי לשפר או לשנות בתוצר?
              </p>
              <textarea
                value={rewritePrompt}
                onChange={e => setRewritePrompt(e.target.value)}
                placeholder="לדוגמה: תעשי את זה יותר קצר ופיוטי, או הוסיפי קריאה חזקה לפעולה (CTA)..."
                style={{
                  width: '100%', fontSize: 13, lineHeight: 1.6,
                  color: 'var(--text-dark)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 12, background: 'var(--cream)',
                  minHeight: 80
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || !rewritePrompt.trim()}
                  style={{
                    flex: 1, padding: '12px',
                    fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                  className="btn-primary"
                >
                  {regenerating ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                  {regenerating ? 'מנסח מחדש...' : 'שפר תוצר'}
                </button>
                <button
                  onClick={() => { setShowRewrite(false); setRewritePrompt('') }}
                  style={{
                    padding: '12px 18px',
                    fontSize: 13
                  }}
                  className="btn-secondary"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* Core Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, padding: '13px',
                fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
              className="btn-secondary hover-lift"
            >
              {copied ? <Check size={16} color="var(--green-dark)" /> : <Copy size={16} />}
              {copied ? 'הטקסט הועתק!' : 'העתיקי טקסט'}
            </button>
            
            <button
              onClick={() => setShowRewrite(!showRewrite)}
              style={{
                flex: 1, padding: '13px',
                fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
              className="btn-secondary hover-lift"
            >
              <RefreshCw size={16} />
              שנה / שפר תוצר
            </button>
          </div>

          {/* Image & Design Section */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 20
          }} className="fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12, textAlign: 'center' }}>
              בחרי תמונת רקע לעיצוב
            </h3>

            {/* Full auto: one click → matching background + canvas text */}
            <button
              onClick={handleFullAutoDesign}
              disabled={generatingImage || generatingDesign}
              className="btn-accent hover-lift"
              style={{
                width: '100%', padding: '13px', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 16,
                background: (generatingImage || generatingDesign) ? 'var(--text-light)' : 'linear-gradient(135deg, var(--green-dark), var(--green-mid))',
                color: 'white', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {(generatingImage || generatingDesign)
                ? <><Loader size={16} className="spin" />{generatingImage ? 'מייצר תמונת רקע מהפוסט...' : 'מעצב טקסט ממותג...'}</>
                : <><Sparkles size={16} />✨ צרי עיצוב מלא מהפוסט (אוטומטי)</>
              }
            </button>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-light)', marginBottom: 14 }}>
              — או בחרי תמונת רקע ידנית —
            </div>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => setActiveImageTab('gallery')}
                style={{
                  flex: 1, padding: '12px', fontSize: 13, fontWeight: activeImageTab === 'gallery' ? 700 : 500,
                  background: activeImageTab === 'gallery' ? 'var(--green-pale)' : 'transparent',
                  color: activeImageTab === 'gallery' ? 'var(--green-dark)' : 'var(--text-mid)',
                  border: activeImageTab === 'gallery' ? '1px solid var(--green-light)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s'
                }}
              >
                🖼️ מאגר
              </button>
              <button
                onClick={() => setActiveImageTab('upload')}
                style={{
                  flex: 1, padding: '12px', fontSize: 13, fontWeight: activeImageTab === 'upload' ? 700 : 500,
                  background: activeImageTab === 'upload' ? 'var(--earth-pale)' : 'transparent',
                  color: activeImageTab === 'upload' ? 'var(--earth)' : 'var(--text-mid)',
                  border: activeImageTab === 'upload' ? '1px solid #DDBEAA' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s'
                }}
              >
                📁 מהמחשב
              </button>
              <button
                onClick={() => setActiveImageTab('ai')}
                style={{
                  flex: 1, padding: '12px', fontSize: 13, fontWeight: activeImageTab === 'ai' ? 700 : 500,
                  background: activeImageTab === 'ai' ? 'var(--cream)' : 'transparent',
                  color: activeImageTab === 'ai' ? '#4A5C42' : 'var(--text-mid)',
                  border: activeImageTab === 'ai' ? '1px solid #C4D4A8' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s'
                }}
              >
                ✨ AI
              </button>
            </div>

            {/* Tabs Content */}
            {activeImageTab === 'gallery' ? (
              <div style={{ marginBottom: 16 }}>
                {LOCAL_GALLERY_IMAGES.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', padding: '40px 20px', 
                    background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', 
                    border: '1px dashed var(--border)' 
                  }}>
                    <ImageIcon size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>אין תמונות בגלריה</p>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
                      כדי להוסיף תמונות לכאן, זרקי תמונות שלך (JPG/PNG) לתיקייה 
                      <br/> <code>src/assets/gallery</code>
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, 
                    maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' 
                  }} className="custom-scrollbar">
                    {LOCAL_GALLERY_IMAGES.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Gallery option ${idx}`}
                        onClick={() => {
                          setImageUrl(prev => {
                            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
                            return img
                          })
                          setShowAiImage(false)
                          setDesignData(null)
                          setShowQuickCard(false)
                        }}
                        style={{
                          width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                          border: imageUrl === img ? '3px solid var(--green-dark)' : '1px solid transparent',
                          opacity: imageUrl && imageUrl !== img ? 0.6 : 1,
                          transition: 'all 0.2s'
                        }}
                        className="hover-lift"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeImageTab === 'upload' ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>
                  בחרי תמונה מהמחשב שלך והיא תעלה מיד לעיצוב הפוסט.
                </p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary hover-lift"
                  style={{
                    width: '100%', padding: '14px', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    border: '2px dashed var(--border)',
                    background: 'var(--bg-page)',
                    color: 'var(--text-dark)'
                  }}
                >
                  <Upload size={18} />
                  לחצי לבחירת תמונה מהמחשב
                </button>
                
                {imageUrl && !imageUrl.includes('openai') && !LOCAL_GALLERY_IMAGES.includes(imageUrl) && (
                  <div style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={imageUrl} alt="Uploaded" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>
                  הבינה המלאכותית תנתח את הטקסט ותייצר עבורך צילום אווירה מקצועי ואלגנטי, מותאם בדיוק למסר.
                </p>
                {imageError && (
                  <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{imageError}</p>
                )}
                {generatingImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                    <Loader size={28} color="var(--green-dark)" className="spin" />
                    <span style={{ fontSize: 12, marginTop: 8 }}>מייצר צילום אווירה...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateImage}
                    className="btn-accent hover-lift"
                    style={{
                      width: '100%', padding: '12px', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    <Sparkles size={16} />
                    {showAiImage ? 'צרי תמונה חדשה' : 'חוללי צילום אווירה מהטקסט'}
                  </button>
                )}
                
                {showAiImage && imageUrl && !generatingImage && (
                  <div style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={imageUrl} alt="AI Generated" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
              </div>
            )}

            {/* Design Generation Action */}
            {imageUrl && (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {designError && (
                  <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>שגיאה: {designError}</p>
                )}
                <button
                  onClick={handleGenerateDesignData}
                  className="btn-primary hover-lift"
                  disabled={generatingDesign}
                  style={{
                    width: '100%', padding: '14px', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: generatingDesign ? 'var(--text-light)' : 'var(--green-dark)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {generatingDesign ? <Loader size={16} className="spin" /> : <Palette size={16} />}
                  {generatingDesign ? 'מייצר עיצוב חכם...' : (showQuickCard && designData ? 'הסתירי עיצוב תמונה' : 'הלבישי טקסט ממותג ולוגו מעל התמונה 🎨')}
                </button>
              </div>
            )}

            {/* Render Designed Canva Output with Customizer */}
            {showQuickCard && designData && imageUrl && (
              <div className="scale-in" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CanvaPostGenerator
                  bgImage={imageUrl}
                  title={canvasTitle}
                  subtitle={canvasSubtitle}
                  bullets={canvasBullets}
                  theme={canvasTheme}
                  fontFamily={canvasFont}
                  overlayOpacity={canvasOverlayOpacity}
                />

                {/* Visual Live Editor Panel */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'right'
                }} className="fade-in">
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    🎨 לוח בקרה ויזואלי לעיצוב
                  </h4>

                  {/* Curated Color Themes Grid */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8 }}>
                      ערכת צבעים ממותגת:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {Object.entries(THEME_MAP_LOCAL).map(([key, item]) => {
                        const active = canvasTheme === key
                        return (
                          <button
                            key={key}
                            onClick={() => setCanvasTheme(key)}
                            style={{
                              padding: '10px 8px',
                              fontSize: 12, fontWeight: active ? 700 : 500,
                              borderRadius: 8,
                              background: active ? 'var(--green-pale)' : 'var(--white)',
                              color: active ? 'var(--green-dark)' : 'var(--text-dark)',
                              border: `1.5px solid ${active ? 'var(--green-light)' : 'var(--border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                            className="hover-lift"
                          >
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.accent }}></span>
                            {item.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Font and Opacity Selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }} className="brand-book-grid-mobile">
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6 }}>
                        פונט (Google Font):
                      </label>
                      <select
                        value={canvasFont}
                        onChange={e => setCanvasFont(e.target.value)}
                        style={{
                          width: '100%', padding: '10px', fontSize: 12.5,
                          border: '1.5px solid var(--border)', borderRadius: 8,
                          background: 'var(--cream)', color: 'var(--text-dark)'
                        }}
                      >
                        <option value="Heebo">Heebo (סנס סריף נקי)</option>
                        <option value="Secular One">Secular One (דומיננטי)</option>
                        <option value="Varela Round">Varela Round (מעוגל ורך)</option>
                        <option value="Frank Ruhl Libre">Frank Ruhl (סריפי קלאסי)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6 }}>
                        כהות רקע ({Math.round(canvasOverlayOpacity * 100)}%):
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38 }}>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.05"
                          value={canvasOverlayOpacity}
                          onChange={e => setCanvasOverlayOpacity(parseFloat(e.target.value))}
                          style={{ flex: 1, accentColor: 'var(--green-dark)', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Text Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 4 }}>
                        כותרת ראשית:
                      </label>
                      <input
                        type="text"
                        value={canvasTitle}
                        onChange={e => setCanvasTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 4 }}>
                        כותרת משנה:
                      </label>
                      <input
                        type="text"
                        value={canvasSubtitle}
                        onChange={e => setCanvasSubtitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}
                      />
                    </div>

                    {/* Bullets Edit */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6 }}>
                        שלוש נקודות הערך במותג:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {canvasBullets.map((bullet, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text"
                              value={bullet.title}
                              placeholder={`נקודה ${idx + 1} - כותרת`}
                              onChange={e => {
                                const updated = canvasBullets.map((b, i) => 
                                  i === idx ? { ...b, title: e.target.value } : b
                                )
                                setCanvasBullets(updated)
                              }}
                              style={{ flex: 1, padding: '8px 10px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}
                            />
                            <input
                              type="text"
                              value={bullet.desc}
                              placeholder="תיאור קצר"
                              onChange={e => {
                                const updated = canvasBullets.map((b, i) => 
                                  i === idx ? { ...b, desc: e.target.value } : b
                                )
                                setCanvasBullets(updated)
                              }}
                              style={{ flex: 1.5, padding: '8px 10px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ── Sales Post Template Section ────────────────────────────────── */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid #F0CBD8',
            padding: 20,
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Layout size={18} color="#C2186A" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#C2186A', margin: 0 }}>
                פוסט מכירה ממותג (Canva Style)
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
              תבנית עיצוב קבועה — AI מייצר את התוכן, התבנית שומרת על סגנון מקצועי אחיד בכל פוסט.
              תמונה + כותרת + משפט אישי + 3 יתרונות + שירותים + כפתורי פעולה.
            </p>

            {salesPostError && (
              <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 10 }}>שגיאה: {salesPostError}</p>
            )}

            <button
              onClick={() => handleGenerateSalesPost(editedResult || brief)}
              disabled={generatingSalesPost}
              className="btn-accent hover-lift"
              style={{
                width: '100%', padding: '13px', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: generatingSalesPost ? 'var(--text-light)' : 'linear-gradient(135deg, #C2186A, #8B1250)',
                color: 'white', borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(194,24,106,0.3)',
                marginBottom: showSalesPost && salesPostData ? 16 : 0,
              }}
            >
              {generatingSalesPost
                ? <><Loader size={16} className="spin" />מייצר פוסט מכירה...</>
                : <><Layout size={16} />{showSalesPost && salesPostData ? 'צור גרסה חדשה' : '✨ צור פוסט מכירה ממותג'}</>
              }
            </button>

            {showSalesPost && salesPostData && (
              <div className="scale-in" style={{ marginTop: 8 }}>
                <SalesPostTemplate
                  bgImage={imageUrl || undefined}
                  headline={salesPostData.headline}
                  personalLine={salesPostData.personal_line}
                  subheadline={salesPostData.subheadline}
                  benefits={salesPostData.benefits}
                  services={salesPostData.services}
                  onRegenerate={() => handleGenerateSalesPost(editedResult || brief)}
                  generatingContent={generatingSalesPost}
                />
              </div>
            )}
          </div>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            style={{
              width: '100%', padding: '14px',
              fontSize: 14, fontWeight: 500,
              marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
            className="btn-secondary hover-lift"
          >
            <BookmarkPlus size={18} />
            שמרי כטיוטה
          </button>

          {/* Mark as Published */}
          <button
            onClick={handlePublish}
            style={{
              width: '100%', padding: '16px',
              fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
            className="btn-primary hover-lift"
          >
            <Send size={18} />
            סמני כפורסם בארכיון ✓
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: 14, fontWeight: 500 }}>
            העתיקי את התוצר ופרסמי ידנית ברשתות החברתיות המועדפות עלייך.
          </p>
        </div>
      </div>
    )
  }

  // FORM step
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--cream)' }} className="fade-in">
      
      {/* Header */}
      <div style={{
        background: 'var(--gradient-header)',
        padding: '54px 20px 28px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(232, 223, 216, 0.15)',
        boxShadow: 'var(--shadow-md)',
        flexShrink: 0
      }}>
        <div style={{
          position: 'absolute', top: -30, left: -30,
          width: 140, height: 140,
          background: 'rgba(143, 175, 135, 0.12)',
          borderRadius: '50%'
        }} />
        <div className="desktop-header-wrap" style={{ position: 'relative' }}>
          <h2 style={{
            fontSize: 26, fontWeight: 800,
            color: 'white', letterSpacing: '-0.4px', marginBottom: 4
          }}>
            מחולל פוסטים ותסריטים
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
            AI ינסח פוסט אישי, תסריט רילס או קרוסלה אותנטית בדיוק בסגנון שלך
          </p>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 820 }}>
        {/* Platform Selection */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            פלטפורמת הפרסום
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {platforms.map(p => {
              const active = platform === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? (getPlatformActiveStyle(p.id).background) : 'var(--white)',
                    color: active ? 'white' : 'var(--text-dark)',
                    border: active ? (getPlatformActiveStyle(p.id).border) : '1px solid var(--border)',
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                  className="hover-lift"
                >
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Format Selection */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            פורמט התוכן הרצוי
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }} className="brand-book-grid-mobile">
            {formats.map(f => {
              const active = format === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--green-dark)' : 'var(--white)',
                    color: active ? 'white' : 'var(--text-dark)',
                    border: active ? '1px solid var(--green-dark)' : '1.5px solid var(--border)',
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}
                  className="hover-lift"
                >
                  <span style={{ fontSize: 18 }}>{f.emoji}</span>
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Type Selection */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            סוג התוכן והפוסט
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {contentTypes.map(c => {
              const active = contentType === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setContentType(c.id)}
                  style={{
                    padding: '9px 15px',
                    borderRadius: 'var(--radius-pill)',
                    background: active ? 'var(--earth)' : 'var(--white)',
                    color: active ? 'white' : 'var(--text-dark)',
                    border: active ? '1px solid var(--earth)' : '1px solid var(--border)',
                    fontSize: 12, fontWeight: active ? 600 : 500,
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                  className="hover-lift"
                >
                  {c.emoji} {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Brief Area */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            על מה נכתוב היום?
          </p>
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="לדוגמה: רוצה לכתוב טיפ על למה יום גיבוש בטבע ובחוץ עדיף בהרבה על ישיבה במשרד ממוזג..."
              style={{
                width: '100%', padding: '16px',
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-dark)',
                background: 'transparent',
                border: 'none',
                minHeight: 130
              }}
              className="premium-textarea"
            />
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(74, 92, 66, 0.02)'
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 500 }}>
                {brief.length} תווים
              </span>
              <span style={{ fontSize: 11, color: 'var(--green-mid)', fontWeight: 600 }}>
                מספיק לכתוב כמה מילים ונקודות ✓
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: '#FEF2F2', borderRadius: 12, padding: '12px 16px',
            marginBottom: 20, border: '1px solid #FECACA'
          }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>שגיאה בחיבור</p>
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>{error}</p>
              <p style={{ fontSize: 11, color: '#F87171', marginTop: 6, fontWeight: 500 }}>
                אנא ודאי שמפתח ה-API של OpenAI מוגדר בהצלחה במסך ההגדרות (גלגל השיניים ⚙️ בדף הבית).
              </p>
            </div>
          </div>
        )}

        {/* ── Sales Post shortcut in FORM step ────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FDF0F5, #FAE8F0)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid #F0CBD8',
          padding: '16px 20px',
          marginBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layout size={16} color="#C2186A" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C2186A' }}>פוסט מכירה ממותג (Canva Style)</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-mid)', lineHeight: 1.5, margin: 0 }}>
            תבנית קבועה עם תמונה + כותרת + 3 יתרונות + שירותים + כפתורי פעולה — AI מייצר רק את התוכן.
          </p>
          <button
            onClick={() => {
              handleGenerateSalesPost(brief)
              setStep(STEPS.RESULT)
              setResult(' ')
              setEditedResult(' ')
            }}
            disabled={!brief.trim() || generatingSalesPost}
            className="hover-lift"
            style={{
              padding: '12px', fontSize: 13, fontWeight: 700,
              background: !brief.trim() ? '#ddd' : 'linear-gradient(135deg, #C2186A, #8B1250)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: brief.trim() ? '0 4px 14px rgba(194,24,106,0.3)' : 'none',
              cursor: brief.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Layout size={15} />
            {generatingSalesPost ? 'מייצר...' : '✨ צור פוסט מכירה ממותג'}
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!brief.trim() || step !== STEPS.FORM}
          style={{
            width: '100%', padding: '16px',
            fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
          className="btn-primary hover-lift"
        >
          <Sparkles size={18} />
          צרי לי תוכן מהמם ✨
        </button>
      </div>
    </div>
  )
}
