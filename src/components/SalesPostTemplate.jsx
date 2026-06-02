import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Phone, Globe, Check, RefreshCw, Edit2, X } from 'lucide-react';

// ─── SERVICE ICON MAP ─────────────────────────────────────────────────────────
const SERVICE_ICONS = {
  'ימי גיבוש':        '🤝',
  'אירועי חברה':      '🎉',
  'נופש חברה':        '🌿',
  'כנסים':            '🎤',
  'סדנאות':           '✨',
  'סדנאות רווחה':     '💆',
  'חוויה קולינרית':  '🍽️',
  'עשייה עם ערך':     '💚',
  'התנדבות':          '🤲',
  'חוויות ממותגות':   '🏆',
  'חוויה אמיתית':    '❤️',
  'חיבור עמוק':       '🔗',
  'ערכים בפעולה':     '⚡',
  'השפעה ארוכת טווח':'🌱',
  'פעילות בטבע':      '🏞️',
  'אירועי לילה':      '🌙',
  'אירוע מותאם':      '🎯',
  'חוויה בוטיקית':    '💎',
  'קונספט ייחודי':    '🎨',
  'ליווי מלא':        '🛡️',
};

function serviceIcon(label) {
  if (!label) return '⭐';
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (label.includes(key)) return icon;
  }
  return '⭐';
}

// ─── BRAND COLORS (Style Lock) ────────────────────────────────────────────────
const BRAND = {
  bg:      '#F7DDE7',
  primary: '#C2186A',
  text:    '#202020',
  white:   '#FFFFFF',
  tagline: '#A01055',
  checkBg: 'rgba(194,24,106,0.12)',
};

// ─── FONT INJECTION ───────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const urls = [
      'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap',
    ];
    urls.forEach(url => {
      if (!document.querySelector(`link[href="${url}"]`)) {
        const el = document.createElement('link');
        el.rel = 'stylesheet'; el.href = url; el.crossOrigin = 'anonymous';
        document.head.appendChild(el);
      }
    });
  }, []);
}

// ─── INLINE EDITABLE FIELD ────────────────────────────────────────────────────
function Editable({ value, onChange, style, multiline = false, placeholder = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    const sharedStyle = {
      width: '100%', padding: '4px 8px', fontSize: 'inherit',
      fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit',
      background: 'rgba(255,255,255,0.85)', border: '2px solid #C2186A',
      borderRadius: 6, resize: 'none', direction: 'rtl', textAlign: 'center',
      lineHeight: style?.lineHeight || 1.3,
    };
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onChange(draft); setEditing(false); }}
          style={{ ...sharedStyle, minHeight: 60 }}
        />
      );
    }
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onChange(draft); setEditing(false); } }}
        style={sharedStyle}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="לחצי לעריכה"
      style={{
        ...style,
        cursor: 'text',
        position: 'relative',
        display: 'inline-block',
        borderRadius: 4,
        transition: 'background 0.15s',
      }}
      className="editable-field"
    >
      {value || placeholder}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SalesPostTemplate({
  bgImage,
  headline,
  personalLine,
  subheadline,
  benefits,
  services,
  cta1        = 'דברו איתי בווצאפ',
  cta2        = 'בקרו באתר לרעיונות',
  website     = 'tal-shani.co.il',
  phone       = '054-4866372',
  onRegenerate,
  generatingContent = false,
  // Allow parent to receive field edits
  onFieldChange,
}) {
  useFonts();
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Local editable state (mirrors props, updates via onFieldChange)
  const [localHeadline,    setLocalHeadline]    = useState(headline    || 'חוויות שמחברות אנשים');
  const [localPersonal,    setLocalPersonal]     = useState(personalLine|| 'כי כל צוות ראוי לחוות משהו אמיתי');
  const [localSubheadline, setLocalSubheadline]  = useState(subheadline || 'בניית חוויות ארגוניות מותאמות שמשאירות חותם');
  const [localBenefits,    setLocalBenefits]     = useState(benefits    || ['חיבור עמוק בין עובדים', 'חוויה שנשארת הרבה אחרי היום', 'תוכנית מותאמת אישית']);
  const [localServices,    setLocalServices]     = useState(services    || ['ימי גיבוש', 'אירועי חברה', 'נופש חברה', 'כנסים']);

  // Sync when props change (new generation)
  useEffect(() => { if (headline)     setLocalHeadline(headline); },    [headline]);
  useEffect(() => { if (personalLine) setLocalPersonal(personalLine); }, [personalLine]);
  useEffect(() => { if (subheadline)  setLocalSubheadline(subheadline); },[subheadline]);
  useEffect(() => { if (benefits?.length)  setLocalBenefits(benefits); },  [benefits]);
  useEffect(() => { if (services?.length)  setLocalServices(services); },  [services]);

  const notify = (field, val) => onFieldChange?.({ field, value: val });

  const POST_W = 1080;
  const POST_H = 1080;
  const SCALE  = 0.38;

  const handleDownload = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        quality: 1.0, pixelRatio: 2.0,
        width: POST_W, height: POST_H,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const a = document.createElement('a');
      a.download = 'tal-shani-brand-post.png'; a.href = dataUrl; a.click();
    } catch (err) { console.error('Download error:', err); }
    finally { setDownloading(false); }
  };

  const font    = '"Heebo", sans-serif';
  const cursive = '"Dancing Script", cursive';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%' }}>

      {/* ── Edit hint ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        padding: '6px 14px', background: 'rgba(194,24,106,0.08)',
        borderRadius: 20, border: '1px solid rgba(194,24,106,0.2)',
      }}>
        <Edit2 size={12} color="#C2186A" />
        <span style={{ fontSize: 11, color: '#C2186A', fontWeight: 600 }}>
          לחצי על כל טקסט בפוסט כדי לערוך אותו
        </span>
      </div>

      {/* ── Post canvas ────────────────────────────────────────────────── */}
      <div
        ref={printRef}
        style={{
          position: 'relative',
          width: POST_W, height: POST_H,
          overflow: 'hidden',
          fontFamily: font, direction: 'rtl',
          transform: `scale(${SCALE})`,
          transformOrigin: 'top center',
          marginBottom: -(POST_H * (1 - SCALE)) + 20,
          borderRadius: 28,
          boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'row',
          background: BRAND.bg,
        }}
      >
        {/* ── LEFT: Photo 45% ──────────────────────────────────────────── */}
        <div style={{ width: '45%', height: '100%', position: 'relative', flexShrink: 0 }}>
          <img
            src={bgImage || '/placeholder-bg.jpg'}
            alt="Tal Shani"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to left, rgba(247,221,231,0.6) 0%, transparent 55%)',
          }} />
        </div>

        {/* ── RIGHT: Content 55% ───────────────────────────────────────── */}
        <div style={{
          width: '55%', height: '100%', background: BRAND.bg,
          display: 'flex', flexDirection: 'column',
          padding: '44px 48px 36px 36px', boxSizing: 'border-box',
        }}>

          {/* Brand header */}
          <div style={{ marginBottom: 18, textAlign: 'center' }}>
            <img src="/logo.png" alt="טל שני"
              style={{ height: 52, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
            />
            <div style={{ fontSize: 21, fontFamily: cursive, color: BRAND.tagline, lineHeight: 1.2 }}>
              חוויות ארגוניות עם ערך
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 55, height: 3, borderRadius: 2, background: BRAND.primary, margin: '0 auto 18px' }} />

          {/* Headline — editable */}
          <div style={{ fontSize: 60, fontWeight: 900, color: BRAND.text, lineHeight: 1.15, textAlign: 'center', marginBottom: 8 }}>
            <Editable
              value={localHeadline}
              onChange={v => { setLocalHeadline(v); notify('headline', v); }}
              style={{ fontSize: 60, fontWeight: 900, color: BRAND.text, lineHeight: 1.15 }}
            />
          </div>

          {/* Personal line — editable cursive */}
          <div style={{ fontFamily: cursive, fontSize: 29, color: BRAND.primary, textAlign: 'center', marginBottom: 16, lineHeight: 1.3 }}>
            <Editable
              value={localPersonal}
              onChange={v => { setLocalPersonal(v); notify('personal_line', v); }}
              style={{ fontFamily: cursive, fontSize: 29, color: BRAND.primary }}
            />
          </div>

          {/* Subheadline — editable */}
          <div style={{ fontSize: 23, fontWeight: 500, color: BRAND.text, textAlign: 'center', marginBottom: 20, lineHeight: 1.4, opacity: 0.87 }}>
            <Editable
              value={localSubheadline}
              onChange={v => { setLocalSubheadline(v); notify('subheadline', v); }}
              style={{ fontSize: 23, fontWeight: 500, color: BRAND.text }}
              multiline
            />
          </div>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {localBenefits.slice(0, 3).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: BRAND.checkBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Check size={18} color={BRAND.primary} strokeWidth={3} />
                </div>
                <span style={{ fontSize: 25, fontWeight: 600, color: BRAND.text, lineHeight: 1.3 }}>
                  <Editable
                    value={b}
                    onChange={v => {
                      const updated = [...localBenefits];
                      updated[i] = v;
                      setLocalBenefits(updated);
                      notify('benefits', updated);
                    }}
                    style={{ fontSize: 25, fontWeight: 600, color: BRAND.text }}
                    placeholder={`יתרון ${i + 1}`}
                  />
                </span>
              </div>
            ))}
          </div>

          {/* Services row */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            {localServices.slice(0, 4).map((svc, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'rgba(194,24,106,0.08)',
                borderRadius: 13, padding: '9px 14px', minWidth: 86,
              }}>
                <span style={{ fontSize: 28 }}>{serviceIcon(svc)}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.text }}>
                  <Editable
                    value={svc}
                    onChange={v => {
                      const updated = [...localServices];
                      updated[i] = v;
                      setLocalServices(updated);
                      notify('services', updated);
                    }}
                    style={{ fontSize: 16, fontWeight: 700, color: BRAND.text }}
                    placeholder={`שירות ${i + 1}`}
                  />
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons (fixed — Style Lock) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
            <div style={{
              width: '100%', padding: '15px',
              fontSize: 25, fontWeight: 800,
              background: BRAND.primary, color: BRAND.white,
              borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: font, boxShadow: '0 6px 20px rgba(194,24,106,0.35)',
            }}>
              <Phone size={22} fill="white" />
              {cta1}
            </div>
            <div style={{
              width: '100%', padding: '13px',
              fontSize: 23, fontWeight: 700,
              background: 'transparent', color: BRAND.primary,
              border: `2.5px solid ${BRAND.primary}`, borderRadius: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: font,
            }}>
              <Globe size={20} />
              {cta2}
            </div>
          </div>

          {/* Footer strip (fixed — Style Lock) */}
          <div style={{
            background: BRAND.primary, borderRadius: 12,
            padding: '9px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: BRAND.white, fontSize: 19, fontWeight: 600 }}>
              <Globe size={16} />{website}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>|</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: BRAND.white, fontSize: 19, fontWeight: 600 }}>
              <Phone size={16} />{phone}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420, marginTop: 16 }}>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={generatingContent}
            className="btn-secondary hover-lift"
            style={{
              flex: 1, padding: '13px', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: generatingContent ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} className={generatingContent ? 'spin' : ''} />
            {generatingContent ? 'מייצר...' : 'תוכן חדש'}
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary hover-lift"
          style={{
            flex: 2, padding: '13px', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'linear-gradient(135deg, #C2186A, #8B1250)',
            opacity: downloading ? 0.6 : 1,
            boxShadow: '0 4px 14px rgba(194,24,106,0.3)',
          }}
        >
          <Download size={16} />
          {downloading ? 'שומר...' : '📥 הורד פוסט מוכן'}
        </button>
      </div>
    </div>
  );
}
