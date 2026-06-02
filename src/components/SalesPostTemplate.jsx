import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Phone, Globe, RefreshCw, Edit2 } from 'lucide-react';

// ─── Service icons ────────────────────────────────────────────────────────────
const SERVICE_ICONS = {
  'ימי גיבוש':'🤝','אירועי חברה':'🎉','נופש חברה':'🌿','כנסים':'🎤',
  'סדנאות':'✨','סדנאות רווחה':'💆','חוויה קולינרית':'🍽️','עשייה עם ערך':'💚',
  'התנדבות':'🤲','חוויות ממותגות':'🏆','חיבור עמוק':'🔗','ערכים בפעולה':'⚡',
  'פעילות בטבע':'🏞️','ליווי מלא':'🛡️','חוויה אמיתית':'❤️','קונספט ייחודי':'🎨',
  'חוויה בוטיקית':'💎','יצירתיות':'💡','מנהיגות':'👑','חדשנות':'🚀',
  'ערך חברתי':'🤍','שייכות':'🏡','חיבור':'🤝','משמעות':'💫',
};
function serviceIcon(label) {
  if (!label) return '⭐';
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (label.includes(key)) return icon;
  }
  return '⭐';
}

// ─── Brand themes (variation) ─────────────────────────────────────────────────
const THEMES = {
  'cream-pink': {
    bg: '#F4E6CC', dark: '#1C1C1C', olive: '#3A5430', oliveMid: '#4A5C42',
    primary: '#C2186A', footer: '#3A5430', footerText: '#FFFFFF',
    badgeBg: 'rgba(194,24,106,0.87)', ovalBg: 'rgba(255,255,255,0.93)',
    font: '"Heebo", sans-serif', cursive: '"Dancing Script", cursive',
  },
  'sage-gold': {
    bg: '#EFF3EB', dark: '#1C1C1C', olive: '#2E4A26', oliveMid: '#4A5C42',
    primary: '#B8922A', footer: '#2E4A26', footerText: '#FFFFFF',
    badgeBg: 'rgba(74,92,66,0.9)', ovalBg: 'rgba(255,255,255,0.94)',
    font: '"Varela Round", sans-serif', cursive: '"Dancing Script", cursive',
  },
  'ivory-rose': {
    bg: '#FAF0EC', dark: '#1C1C1C', olive: '#8B5E52', oliveMid: '#7A4A3E',
    primary: '#B04060', footer: '#7A4A3E', footerText: '#FFFFFF',
    badgeBg: 'rgba(176,64,96,0.88)', ovalBg: 'rgba(255,255,255,0.94)',
    font: '"Frank Ruhl Libre", serif', cursive: '"Dancing Script", cursive',
  },
  'dark-olive': {
    bg: '#2E3D28', dark: '#F5F0E8', olive: '#1A2617', oliveMid: '#A8C49A',
    primary: '#E8C86A', footer: '#1A2617', footerText: '#F5F0E8',
    badgeBg: 'rgba(232,200,106,0.92)', ovalBg: 'rgba(245,240,232,0.93)',
    font: '"Secular One", sans-serif', cursive: '"Dancing Script", cursive',
  },
};

function useFonts() {
  useEffect(() => {
    [
      'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
      'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Secular+One&display=swap',
    ].forEach(url => {
      if (!document.querySelector(`link[href="${url}"]`)) {
        const el = document.createElement('link');
        el.rel = 'stylesheet'; el.href = url; el.crossOrigin = 'anonymous';
        document.head.appendChild(el);
      }
    });
  }, []);
}

function Editable({ value, onChange, style, multiline = false, placeholder = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    const base = {
      width: '100%', padding: '4px 8px', fontSize: 'inherit',
      fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit',
      background: 'rgba(255,255,255,0.85)', border: '2px solid #C2186A',
      borderRadius: 6, resize: 'none', direction: 'rtl', textAlign: 'center',
      lineHeight: style?.lineHeight || 1.3,
    };
    if (multiline) {
      return (
        <textarea autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onChange(draft); setEditing(false); }}
          style={{ ...base, minHeight: 60 }} />
      );
    }
    return (
      <input autoFocus value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onChange(draft); setEditing(false); } }}
        style={base} placeholder={placeholder} />
    );
  }

  return (
    <span onClick={() => setEditing(true)} title="לחצי לעריכה"
      style={{ ...style, cursor: 'text', position: 'relative', display: 'inline-block', borderRadius: 4 }}
      className="editable-field">
      {value || placeholder}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SalesPostTemplate({
  bgImage,
  headline, personalLine, subheadline, benefits, services,
  theme            = 'cream-pink',
  website          = 'tal-shani.co.il',
  phone            = '054-4866372',
  onRegenerate,
  generatingContent = false,
  onFieldChange,
}) {
  useFonts();
  const printRef  = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const [localHeadline,    setLocalHeadline]    = useState(headline     || 'אירוע טוב לא מתחיל באטרקציה.');
  const [localPersonal,    setLocalPersonal]     = useState(personalLine || 'הוא מתחיל במטרה.');
  const [localSubheadline, setLocalSubheadline]  = useState(subheadline  || 'חוויות שמחברות אנשים לערכים של הארגון.');
  const [localBenefits,    setLocalBenefits]     = useState(benefits     || ['חיבור', 'שייכות', 'משמעות']);
  const [localServices,    setLocalServices]     = useState(services     || ['ימי גיבוש', 'אירועי חברה', 'סדנאות', 'עשייה עם ערך', 'נופש חברה']);

  useEffect(() => { if (headline)         setLocalHeadline(headline); },       [headline]);
  useEffect(() => { if (personalLine)     setLocalPersonal(personalLine); },   [personalLine]);
  useEffect(() => { if (subheadline)      setLocalSubheadline(subheadline); }, [subheadline]);
  useEffect(() => { if (benefits?.length) setLocalBenefits(benefits); },       [benefits]);
  useEffect(() => { if (services?.length) setLocalServices(services); },       [services]);

  const notify = (field, val) => onFieldChange?.({ field, value: val });

  const T = THEMES[theme] || THEMES['cream-pink'];

  const POST_W = 1080, POST_H = 1080, SCALE = 0.38;

  const handleDownload = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        quality: 1.0, pixelRatio: 2.0, width: POST_W, height: POST_H,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const a = document.createElement('a');
      a.download = 'tal-shani-post.png'; a.href = dataUrl; a.click();
    } catch (err) { console.error('Download error:', err); }
    finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Edit hint */}
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

      {/* Post canvas */}
      <div ref={printRef} style={{
        position: 'relative', width: POST_W, height: POST_H,
        overflow: 'hidden', fontFamily: T.font, direction: 'rtl',
        transform: `scale(${SCALE})`, transformOrigin: 'top center',
        marginBottom: -(POST_H * (1 - SCALE)) + 20,
        borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'row',
        background: T.bg,
      }}>

        {/* ── PHOTO (first child = visual RIGHT in RTL) ─── */}
        <div style={{ width: '44%', height: '100%', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={bgImage || '/placeholder-bg.jpg'}
            alt="" crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Fade into text panel */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to right, ${T.bg} 0%, ${T.bg}88 20%, transparent 50%)`,
          }} />

          {/* Badge */}
          <div style={{
            position: 'absolute', top: 48, right: 40,
            width: 132, height: 132, borderRadius: '50%',
            background: T.badgeBg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 26px rgba(0,0,0,0.22)',
            textAlign: 'center', padding: 14,
          }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.3, fontFamily: T.font }}>
              {localPersonal.substring(0, 24)}
            </span>
          </div>

          {/* Values oval */}
          <div style={{
            position: 'absolute', bottom: 68, left: '50%',
            transform: 'translateX(-50%)',
            background: T.ovalBg,
            borderRadius: '45%',
            width: 196, height: 156,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 5, boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
          }}>
            <div style={{ fontSize: 17, color: T.primary, marginBottom: 2 }}>♡</div>
            {localBenefits.slice(0, 3).map((b, i) => (
              <span key={i} style={{ fontSize: 22, fontWeight: 800, color: T.dark, textAlign: 'center', fontFamily: T.font }}>
                {b.split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
          </div>
        </div>

        {/* ── TEXT (second child = visual LEFT in RTL) ─── */}
        <div style={{
          width: '56%', height: '100%', background: T.bg,
          display: 'flex', flexDirection: 'column',
          padding: '40px 44px 30px 28px', boxSizing: 'border-box',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <img src="/logo.png" alt="טל שני"
              style={{ height: 58, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            <div style={{ fontSize: 19, fontFamily: T.cursive, color: T.oliveMid, marginTop: 5, lineHeight: 1.2 }}>
              חוויה ארגונית עם ערך
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ height: 1.5, width: 50, background: T.primary, opacity: 0.45 }} />
            <span style={{ fontSize: 14, color: T.primary }}>♡</span>
            <div style={{ height: 1.5, width: 50, background: T.primary, opacity: 0.45 }} />
          </div>

          {/* Headline */}
          <div style={{ fontSize: 50, fontWeight: 900, color: T.dark, lineHeight: 1.1, textAlign: 'center', marginBottom: 10 }}>
            <Editable
              value={localHeadline}
              onChange={v => { setLocalHeadline(v); notify('headline', v); }}
              style={{ fontSize: 50, fontWeight: 900, color: T.dark, lineHeight: 1.1 }}
              multiline />
          </div>

          {/* Italic personal line */}
          <div style={{ fontFamily: T.cursive, fontSize: 29, color: T.primary, textAlign: 'center', marginBottom: 14, lineHeight: 1.3 }}>
            <Editable
              value={localPersonal}
              onChange={v => { setLocalPersonal(v); notify('personal_line', v); }}
              style={{ fontFamily: T.cursive, fontSize: 29, color: T.primary }} />
          </div>

          {/* Short divider */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ width: 54, height: 2, background: T.primary, borderRadius: 1, opacity: 0.5 }} />
          </div>

          {/* Service icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
            {localServices.slice(0, 5).map((svc, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 28 }}>{serviceIcon(svc)}</span>
                <Editable
                  value={svc}
                  onChange={v => {
                    const u = [...localServices]; u[i] = v;
                    setLocalServices(u); notify('services', u);
                  }}
                  style={{ fontSize: 14, fontWeight: 700, color: T.dark }}
                  placeholder={`שירות ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 18, fontWeight: 500, color: T.oliveMid, textAlign: 'center', lineHeight: 1.55, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Editable
              value={localSubheadline}
              onChange={v => { setLocalSubheadline(v); notify('subheadline', v); }}
              style={{ fontSize: 18, fontWeight: 500, color: T.oliveMid }}
              multiline />
          </div>

          {/* Footer */}
          <div style={{
            background: T.footer, borderRadius: 14, padding: '11px 22px', marginTop: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ color: T.footerText, fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} />{website}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)' }}>|</div>
            <div style={{ color: T.footerText, fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} />{phone}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420, marginTop: 16 }}>
        {onRegenerate && (
          <button onClick={onRegenerate} disabled={generatingContent}
            className="btn-secondary hover-lift"
            style={{ flex: 1, padding: '13px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: generatingContent ? 0.6 : 1 }}>
            <RefreshCw size={16} className={generatingContent ? 'spin' : ''} />
            {generatingContent ? 'מייצר...' : 'תוכן חדש'}
          </button>
        )}
        <button onClick={handleDownload} disabled={downloading}
          className="btn-primary hover-lift"
          style={{ flex: 2, padding: '13px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #C2186A, #8B1250)', opacity: downloading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(194,24,106,0.3)' }}>
          <Download size={16} />
          {downloading ? 'שומר...' : '📥 הורד פוסט מוכן'}
        </button>
      </div>
    </div>
  );
}
