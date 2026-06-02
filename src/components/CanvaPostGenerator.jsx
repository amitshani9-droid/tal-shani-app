import React, { useRef, useState, useEffect } from 'react';
import { Heart, Leaf, Users, Star, Sparkles, Dices, Download, Phone, Globe, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

const getIcon = (index, color) => {
  const icons = [
    <Heart size={40} color={color} />,
    <Leaf size={40} color={color} />,
    <Users size={40} color={color} />,
    <Star size={40} color={color} />,
    <Sparkles size={40} color={color} />
  ];
  return icons[index % icons.length];
};

const THEME_MAP = {
  'green-beige': {
    name: 'ירוק זית כהה',
    bg: '#4F5D44',
    text: '#FFFFFF',
    textMuted: '#C8D4C5',
    accent: '#F0CBC7', // Powder Pink accent
    logoFilter: 'brightness(0) invert(1)',
    rgb: '79, 93, 68'
  },
  'earth-gold': {
    name: 'חום חימר ואדמה',
    bg: '#C19683',
    text: '#FFFFFF',
    textMuted: '#F3E9E5',
    accent: '#F0CBC7',
    logoFilter: 'brightness(0) invert(1)',
    rgb: '193, 150, 131'
  },
  'ivory-gold': {
    name: 'שמנת ורודה',
    bg: '#F3E9E5',
    text: '#4F5D44',
    textMuted: '#8E9E89',
    accent: '#C19683', // Clay Earth accent
    logoFilter: 'none',
    rgb: '243, 233, 229'
  },
  'pink-beige': {
    name: 'ורוד פודרה',
    bg: '#F0CBC7',
    text: '#4F5D44',
    textMuted: '#4F5D44',
    accent: '#C19683',
    logoFilter: 'none',
    rgb: '240, 203, 199'
  }
};

export default function CanvaPostGenerator({ 
  bgImage, 
  title = "חוויה עם ערך",
  subtitle = "ההשקעה הטובה ביותר בצוות שלכם.",
  bullets = [
    { title: "כיף אמיתי", desc: "שמחבר בין אנשים." },
    { title: "ערך שנשאר", desc: "השראה, חיבור ומשמעות." },
    { title: "חוויית שמשדרגת", desc: "גם הרבה אחרי שהיום נגמר." }
  ],
  theme = 'green-beige',
  fontFamily = 'Heebo',
  overlayOpacity = 0.65,
  templateIndex: controlledTemplateIndex,
  onTemplateChange
}) {
  const printRef = useRef(null);
  const [internalTemplateIndex, setInternalTemplateIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const templateIndex = controlledTemplateIndex !== undefined ? controlledTemplateIndex : internalTemplateIndex;
  const setTemplateIndex = onTemplateChange || setInternalTemplateIndex;

  // Pick active theme properties
  const styles = THEME_MAP[theme] || THEME_MAP['green-beige'];
  
  // Custom font loader
  const fontStyle = { fontFamily: `"${fontFamily}", "Heebo", sans-serif` };
  
  // Script cursive font style (for natural handwritten effect)
  const cursiveStyle = { 
    fontFamily: '"Playfair Display", "Frank Ruhl Libre", serif', 
    fontStyle: 'italic', 
    letterSpacing: '0.5px' 
  };

  const isLight = theme === 'ivory-gold' || theme === 'pink-beige';

  const handleDownload = async () => {
    if (printRef.current === null || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        quality: 1.0,
        pixelRatio: 2.0,
        width: 1080,
        height: 1080,
        styleSheetsFilter: (sheet) => {
          try {
            if (sheet.cssRules) return true;
          } catch (err) {
            return false;
          }
          return true;
        },
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `tal-shani-${theme}-post.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('שגיאה בהורדת התמונה:', err);
    } finally {
      setDownloading(false);
    }
  };

  // ─── TEMPLATE 1: "חוויה עם ערך" (Square Classic - based on Design 3) ───
  const renderClassic = () => (
    <>
      <img src={bgImage || "/placeholder-bg.jpg"} alt="Bg" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, right: 0 }} crossOrigin="anonymous" />
      
      {/* Right Gradient Overlay */}
      <div style={{ 
        position: 'absolute', top: 0, right: 0, width: '80%', height: '100%', 
        background: `linear-gradient(to left, rgba(${styles.rgb}, ${overlayOpacity * 1.35}) 0%, rgba(${styles.rgb}, ${overlayOpacity}) 60%, transparent 100%)` 
      }}></div>
      
      {/* Main Content Area */}
      <div style={{ position: 'absolute', top: '90px', right: '80px', color: styles.text, maxWidth: '650px', display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'center', ...fontStyle }}>
        
        {/* Title */}
        <h1 style={{ fontSize: '74px', fontWeight: '800', margin: 0, lineHeight: '1.15', display: 'flex', alignItems: 'center', gap: 14 }}>
          {title}
          <span style={{ color: styles.accent, fontSize: '50px' }}>❤️</span>
        </h1>
        
        {/* Cursive Subtitle */}
        <h2 style={{ fontSize: '36px', fontWeight: '400', color: styles.accent, marginTop: '12px', ...cursiveStyle }}>
          {subtitle}
        </h2>
        
        {/* Elegant Gold Divider */}
        <div style={{ width: '120px', height: '4px', backgroundColor: styles.accent, margin: '35px 0', borderRadius: '2px' }}></div>
        
        {/* Bullets inside rounded circles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {bullets.slice(0, 3).map((bullet, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <div style={{ 
                backgroundColor: isLight ? 'rgba(79, 93, 68, 0.15)' : 'rgba(253, 251, 247, 0.15)', 
                padding: '16px', borderRadius: '50%', display: 'flex',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                {getIcon(index, isLight ? '#4F5D44' : '#F0CBC7')}
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '700', lineHeight: '1.2' }}>{bullet.title}</div>
                <div style={{ fontSize: '23px', opacity: 0.9, marginTop: '4px', color: styles.textMuted }}>{bullet.desc}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cursive Signature text at bottom */}
        <div style={{ marginTop: '55px', fontSize: '34px', fontWeight: '600', ...cursiveStyle, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
          זה לא עוד יום גיבוש, זו חוויה שנשארת.
          <span style={{ color: styles.accent, fontSize: '26px' }}>❤️</span>
        </div>
      </div>
      
      {/* Brand logo at the bottom corner */}
      <div style={{ position: 'absolute', bottom: '50px', right: '80px', background: styles.bg, border: `1.5px solid ${styles.accent}`, padding: '15px 25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <img src="/logo.png" alt="Logo" style={{ width: '180px', display: 'block', filter: styles.logoFilter }} />
      </div>
    </>
  );

  // ─── TEMPLATE 2: "סיפור סיפון" (Blurred Card with scattered bubbles - based on Design 2) ───
  const renderCentered = () => (
    <>
      {/* Blurred Background Image */}
      <img 
        src={bgImage || "/placeholder-bg.jpg"} 
        alt="Bg" 
        style={{ 
          width: '108%', height: '108%', objectFit: 'cover', 
          position: 'absolute', top: '-4%', right: '-4%',
          filter: 'blur(5px) brightness(0.85)' 
        }} 
        crossOrigin="anonymous" 
      />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.25)' }}></div>
      
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
        
        {/* Floating Card container */}
        <div style={{ 
          position: 'relative',
          width: '100%', 
          maxWidth: '760px',
          background: styles.bg, 
          borderRadius: '32px',
          padding: '60px 50px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
          color: styles.text,
          border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
          ...fontStyle,
          textAlign: 'center'
        }}>
          
          {/* Scattered signature brand bubble dots in corners of card! (Just like Design 2) */}
          {/* Top-Right Bubble Dots */}
          <div style={{ position: 'absolute', top: '-18px', right: '40px', width: '38px', height: '38px', borderRadius: '50%', background: '#4F5D44', opacity: 0.85 }}></div>
          <div style={{ position: 'absolute', top: '-5px', right: '74px', width: '22px', height: '22px', borderRadius: '50%', background: '#C8D4C5', opacity: 0.8 }}></div>
          
          {/* Bottom-Left Bubble Dots */}
          <div style={{ position: 'absolute', bottom: '-15px', left: '50px', width: '30px', height: '30px', borderRadius: '50%', background: '#C19683', opacity: 0.85 }}></div>
          <div style={{ position: 'absolute', bottom: '15px', left: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: '#F0CBC7', opacity: 0.9 }}></div>
          
          {/* Card content */}
          <h2 style={{ fontSize: '34px', fontWeight: '500', color: isLight ? '#C19683' : styles.accent, marginBottom: '16px', ...cursiveStyle }}>
            {subtitle}
          </h2>
          
          <h1 style={{ fontSize: '64px', fontWeight: '900', margin: '0 0 35px 0', lineHeight: '1.2', color: styles.text }}>
            {title}
          </h1>
          
          {/* Bullets with soft green/pink checkmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'right', padding: '0 30px', marginBottom: '35px' }}>
            {bullets.slice(0, 3).map((bullet, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: isLight ? 'rgba(79,93,68,0.1)' : 'rgba(255,255,255,0.2)', 
                  padding: '6px', borderRadius: '50%', display: 'flex', marginTop: '6px',
                  color: isLight ? '#4F5D44' : '#F0CBC7'
                }}>
                  <Check size={18} strokeWidth={3} />
                </div>
                <div>
                  <span style={{ fontSize: '28px', fontWeight: '800' }}>{bullet.title} — </span>
                  <span style={{ fontSize: '24px', opacity: 0.95 }}>{bullet.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ width: '80px', height: '2px', backgroundColor: isLight ? '#C19683' : styles.accent, margin: '0 auto 25px' }}></div>

          {/* Signature cursive text at bottom of card */}
          <p style={{ fontSize: '26px', fontWeight: '600', color: styles.text, ...cursiveStyle, margin: 0 }}>
            טל שני | אירועים וחוויות עם ערך
          </p>
          <p style={{ fontSize: '20px', color: styles.textMuted, marginTop: '4px', fontWeight: 500 }}>
            לפרטים נוספים: tal-shani.co.il
          </p>
          
        </div>
      </div>
    </>
  );

  // ─── TEMPLATE 3: "מיני פלייר ממותג" (Promotional Flyer - based on Design 1) ───
  const renderSplit = () => (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FDFBF7' }}>
        
        {/* Top Split Area: Photo left, Brand identity right */}
        <div style={{ display: 'flex', width: '100%', height: '76%', overflow: 'hidden' }}>
          
          {/* Left photo (50% split) */}
          <div style={{ width: '48%', height: '100%', position: 'relative' }}>
            <img src={bgImage || "/placeholder-bg.jpg"} alt="Bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 100%)' }}></div>
          </div>
          
          {/* Right Brand info content (52% split) */}
          <div style={{ width: '52%', height: '100%', padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', ...fontStyle, color: '#4F5D44' }}>
            
            {/* Elegant Signature Header Logo layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '190px', filter: 'none', marginBottom: '2px' }} />
              <div style={{ fontSize: '15px', color: '#F0CBC7', fontWeight: 700, letterSpacing: '0.8px', ...cursiveStyle }}>
                חוויות ארגוניות עם ערך
              </div>
              <div style={{ color: '#F0CBC7', fontSize: '18px', marginTop: '6px' }}>❤️</div>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '50px', fontWeight: '900', margin: 0, color: '#4F5D44', lineHeight: '1.2' }}>
              {title}
            </h1>
            
            {/* Cursive handwritten-like subtitle */}
            <h2 style={{ fontSize: '28px', fontWeight: '400', color: '#C19683', marginTop: '8px', ...cursiveStyle }}>
              {subtitle}
            </h2>
            
            <div style={{ width: '50px', height: '2px', backgroundColor: '#C19683', margin: '22px 0' }}></div>
            
            {/* Bullets with checkmarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bullets.slice(0, 3).map((bullet, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#F0CBC7', fontSize: '20px' }}>✓</span>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#4F5D44' }}>
                    {bullet.title} <span style={{ fontWeight: 400, opacity: 0.95 }}>— {bullet.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '23px', color: '#C19683', ...cursiveStyle, marginTop: '35px', textAlign: 'center' }}>
              ואני בונה עבורכם אירוע שהוא כולו חוויה ❤️
            </div>
          </div>
          
        </div>

        {/* Bottom CTA Action Area (WhatsApp & Web buttons - just like Design 1) */}
        <div style={{ 
          height: '24%', width: '100%', 
          background: '#F5E8E0', 
          borderTop: '2px solid #EBE7E4',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '16px 40px', gap: '12px'
        }}>
          
          <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '640px', justifyContent: 'center' }}>
            {/* WhatsApp CTA Button */}
            <button style={{
              flex: 1,
              background: '#C19683',
              color: 'white',
              borderRadius: '24px',
              padding: '12px 28px',
              fontSize: '22px',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: '0 4px 12px rgba(193, 150, 131, 0.25)',
              ...fontStyle
            }}>
              <Phone size={22} fill="white" />
              דברו איתי בוואצאפ!
            </button>

            {/* Web CTA Button */}
            <button style={{
              flex: 1,
              background: '#4F5D44',
              color: 'white',
              borderRadius: '24px',
              padding: '12px 28px',
              fontSize: '22px',
              fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: '0 4px 12px rgba(79, 93, 68, 0.25)',
              ...fontStyle
            }}>
              <Globe size={22} />
              בקרו באתר לרעיונות
            </button>
          </div>

          {/* Footer Contacts Strip */}
          <div style={{ 
            display: 'flex', gap: '30px', 
            fontSize: '16px', fontWeight: 600, color: '#4F5D44', 
            marginTop: '4px', ...fontStyle 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} />
              tal-shani.co.il/events
            </div>
            <div style={{ fontSize: '14px', opacity: 0.5 }}>|</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} />
              054-4866372
            </div>
          </div>

        </div>
      </div>
    </>
  );

  const templates = [renderClassic, renderCentered, renderSplit];

  const fontUrlMap = {
    'Heebo': 'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap',
    'Secular One': 'https://fonts.googleapis.com/css2?family=Secular+One&display=swap',
    'Varela Round': 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
    'Frank Ruhl Libre': 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&display=swap'
  };

  // Inject font link into <head> once per unique URL — avoids accumulating <link> tags on font change
  useEffect(() => {
    const url = fontUrlMap[fontFamily] || fontUrlMap['Heebo']
    if (document.querySelector(`link[href="${url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = 'anonymous' // Enable CORS so html-to-image can read its cssRules without a SecurityError
    document.head.appendChild(link)
  }, [fontFamily])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
      
      <div 
        ref={printRef}
        style={{
          position: 'relative', width: '1080px', height: '1080px', overflow: 'hidden',
          fontFamily: '"Heebo", sans-serif', direction: 'rtl',
          transform: 'scale(0.35)', transformOrigin: 'top center', marginBottom: '-700px',
          borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.1)'
        }}
      >
        {templates[templateIndex]()}
      </div>

      <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '380px' }}>
        <button 
          onClick={() => setTemplateIndex((prev) => (prev + 1) % templates.length)}
          className="btn-secondary hover-lift"
          style={{ flex: 1, padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Dices size={18} />
          החלף סגנון
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary hover-lift"
          style={{ flex: 1, padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: downloading ? 0.6 : 1 }}
        >
          <Download size={18} />
          {downloading ? 'שומר...' : 'שמור לעסק'}
        </button>
      </div>

    </div>
  );
}
