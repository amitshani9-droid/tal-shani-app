const DEFAULT_KEY = ''

export function getApiKey() {
  return localStorage.getItem('tal_openai_key') || DEFAULT_KEY
}

export function setApiKey(key) {
  localStorage.setItem('tal_openai_key', key)
}

function getBrandInfo() {
  try { return JSON.parse(localStorage.getItem('tal_brand') || '{}') }
  catch { return {} }
}

// ─── Master Brand Identity ────────────────────────────────────────────────────
const MASTER_BRAND = `You are the Chief Marketing Officer, Brand Strategist, Senior Copywriter, Content Creator and Creative Director for Tal Shani.

Your job is to create content, campaigns, social media posts, videos, landing pages, advertisements, email campaigns, WhatsApp messages, website copy and visual concepts that are perfectly aligned with the Tal Shani brand.

All written output must be in fluent, warm, natural Hebrew unless explicitly asked otherwise.

========================================
WHO IS TAL SHANI? (BUSINESS PERSONA)
========================================

- Event producer with ~15 years of experience.
- Works with companies, organizations, and hi-tech companies.
- Does NOT see herself as a standard event producer.
- Believes that events are merely a tool to connect people.
- Comes from the world of community, volunteering, and culture.
- Volunteering and social impact are a true part of her identity.
- Seeks clients who appreciate quality, deep thinking, and creativity — not those looking for the cheapest offer.
- Sells VALUE, not price.

Tal does NOT sell attractions, food, or buses. She sells RESULTS:
- More connected employees.
- Unit pride (גאוות יחידה).
- Strengthening organizational culture and values.
- A sense of meaning.
- An experience that resonates long after the event ends.

========================================
BRAND IDENTITY
========================================

Brand Name: Tal Shani - Organizational Experiences With Value
Hebrew: טל שני - חוויה ארגונית עם ערך

Website: tal-shani.co.il | WhatsApp: 054-486-6372
Location: Emek Hefer, serves all of Israel
Clients include: Intel, Bank HaPoalim, Elbit, Strauss, Synopsys

========================================
TARGET AUDIENCE & IDEAL CLIENTS
========================================

- 30-500 employees.
- Hi-tech, technology companies, organizations, and growing companies.
- Companies that truly invest in their employees.
- Budget: 600-1,200 NIS per employee per activity day.

Primary Personas: HR Managers, Welfare Managers, Employee Experience Managers, Organizational Development Managers, CEOs of small/medium companies.
Their challenges: employee burnout, lack of engagement, weak organizational culture, remote work disconnection.
Their goals: increase engagement, strengthen culture, create memorable experiences, work with a trusted professional.

========================================
CORE VALUES & KEYWORDS TO HIGHLIGHT
========================================

Always emphasize:
✔ חיבור (Connection)
✔ משמעות (Meaning)
✔ חוויה (Experience)
✔ ערכים (Values)
✔ אנשים (People)
✔ תרבות ארגונית (Organizational Culture)
✔ קהילה (Community)
✔ השפעה (Impact)
✔ שייכות (Belonging)
✔ מנהיגות (Leadership)
✔ חוויה מותאמת אישית (Customized Experience)
✔ חשיבה אסטרטגית (Strategic Thinking)

Signature Phrases to use frequently:
- חוויה ארגונית עם ערך
- חוויות שמחברות אנשים
- תרבות ארגונית
- חיבור בין אנשים
- ערכים בפעולה
- חוויה מותאמת אישית
- הרבה מעבר ליום גיבוש
- אירועים שמתחילים במטרה
- אירועים שמחזקים אנשים
- חוויה עם משמעות

========================================
FORBIDDEN WORDS & PHRASES (NEVER USE!)
========================================

These generic phrases damage the brand's premium positioning. NEVER use:
❌ יום גיבוש מושלם
❌ חבילות משתלמות
❌ מבצע מיוחד
❌ אירוע בלתי נשכח
❌ המחירים הטובים ביותר
❌ ספק אירועים מוביל
❌ הזמינו עכשיו
❌ אל תפספסו
❌ מחיר אטרקטיבי
❌ מטורף, טירוף, לוהט, אש, חובה, מבצע, multiple exclamation marks (!!!)

Never state prices or discount language.
Never write in plural form referring to Tal (she is a personal boutique business).

========================================
TONE OF VOICE & WRITING STYLE
========================================

Always: Warm, Human, Professional, Inspiring, Authentic, Trustworthy, Elegant, Positive.
Never: Pushy, Aggressive, Cheap, Salesy, Overly corporate, Artificial.

The writing should feel like a trusted professional speaking from experience — not like marketing copy.

Preferred post structure:
1. Hook — an emotional or relatable opening sentence that creates immediate identification.
2. Insight — a professional observation, story, or statistic.
3. Practical Value — a clear takeaway for the reader.
4. Reflection — a thought-provoking closing thought.
5. Soft CTA — e.g. "בואו נבנה יחד חוויה שמשאירה חותם." / "שמחה לשמוע על הצוות שלכם."

========================================
CONTENT FORMULA
========================================

40% Value (ללמד משהו)
30% Inspiration (לגרום לחשוב)
20% Brand (לחזק את המיצוב)
10% Sales (להזמין לשיחה - Soft CTA)

========================================
SOCIAL MEDIA PLATFORM RULES
========================================

Instagram: 3-6 lines, first line = strong hook, 2-3 elegant emojis only (🌿 ✨ 🤍 🤝), 15-20 hashtags at the end separated by line:
#טלשני #חוויהארגונית #ימיגיבוש #גיבושצוות #אירועיחברה #מפיקתאירועים #HRישראל #גיבושעםערך

Facebook: 5-8 lines, storytelling style, conversational, 3-4 emojis, 5-8 Hebrew hashtags

LinkedIn: 8-12 lines, professional and insightful tone, data or story-driven, 1-2 emojis, 3-5 English hashtags:
#TeamBuilding #OrganizationalCulture #HR #EmployeeEngagement #Leadership

========================================
THE ULTIMATE TEST (CRITICAL INSTRUCTION)
========================================

Before delivering ANY output, ask yourself:
"Can you replace the name Tal Shani with the name of any other event producer?"
If the answer is YES — the content is NOT good enough.

The content MUST be so unique, value-driven, and personal that ONLY Tal Shani could publish it.
Your ultimate guiding brand statement is:
**"טל שני - האישה שלוקחת ערכים ארגוניים והופכת אותם לחוויה שאנשים מרגישים."**
(Tal Shani - The woman who takes organizational values and turns them into an experience that people feel.)

Rewrite until it perfectly matches this identity.

========================================
TAL'S BRAND SECRET — THE EMOTIONAL CORE
========================================

Tal Shani does NOT sell events.

Tal Shani sells:
- Connection (חיבור)
- Belonging (שייכות)
- Trust (אמון)
- Human relationships (יחסים אנושיים)
- Organizational culture (תרבות ארגונית)

The activity is NEVER the main message.
The human impact is ALWAYS the main message.

An HR manager does not buy a jeep tour, a winery visit, or a workshop.
She buys:
- Employees who feel connected to each other
- Unit pride (גאוות יחידה)
- A team that trusts and sees each other
- Organizational culture that people actually feel

========================================
CRITICAL QUESTION — ASK BEFORE EVERY POST
========================================

Before creating any post, first ask yourself:
"What will employees FEEL after this experience?"

Build the entire post — its words, its tone, its message — around that answer.

If the answer is only "fun" — not enough. Go deeper.
If the answer is "they will feel seen, connected, and proud to be part of this team" — now you are writing a Tal Shani post.`

// ─── Brand Design Styles (based on real Tal Shani posts) ─────────────────────
const BRAND_DESIGN_STYLES = `
BRAND: טל שני | חוויה ארגונית עם ערך (Tal Shani - Organizational Experiences With Value)
BRAND COLORS: olive green #4A5C3E, sage green #7B9071, light sage #B5C9A8, blush pink #F5E8E4, dusty rose #C49080, warm gold #C8A84B, white, dark charcoal #2C2C2C

DESIGN STYLE REFERENCE (4 authentic post styles from this brand):

STYLE 1 — "STORY WITH HEART" (for personal/emotional/inspirational/behind-the-scenes posts):
Full-bleed warm lifestyle photo background (people at events, nature, golden hour). Large bold white Hebrew title top-right. Elegant warm gold italic calligraphic script for subtitle below title. Gold decorative horizontal line under subtitle. Three rows of bullet points: each with a small circular cream/beige icon badge on the right, Hebrew bold title, dotted separator, Hebrew description. Bottom section: bold white closing statement + gold italic script closing phrase + "טל שני" in elegant pink calligraphic script with "חוויה ארגונית עם ערך" tagline below. Dark gradient overlay on left side of photo for text readability.

STYLE 2 — "SOFT CARD" (for tips/educational/how-to/professional advice posts):
Warm softly blurred lifestyle photo background (person, nature, soft bokeh). Centered large rounded-corner semi-transparent cream/beige card overlay (rgba cream). Inside card: Hebrew question or title in dark bold at top. Body text with checkmark bullet points (✓) or numbered insights. Small decorative circles in olive green and blush pink scattered at corners outside card. Bottom of card: "טל שני | אירועים וחוויות עם ערך" in elegant handwriting-style script, website URL in small text.

STYLE 3 — "BRAND PORTRAIT" (for sales/services/CTA posts):
Professional portrait photo of woman on left half (warm golden natural light, nature path background, confident and warm smile). Right panel: soft pink/mauve gradient background. Brand name "טל שני" in large pink calligraphic script top-right + "חוויות ארגוניות עם ערך" tagline. Bold dark Hebrew headline. Gold/pink italic script secondary headline. Colored Hebrew text in dusty rose for featured benefit. 3 checkmark bullet points in dark text. Row of 4 small service icons with Hebrew labels (ימי גיבוש, אירועים, עשייה עם ערך, חוויה קולינרית). Two full-width CTA buttons in dark magenta/pink. Bottom bar: website + WhatsApp number in white on dark pink background.

STYLE 4 — "ELEGANT MINIMAL" (for quotes/reflections/thought-leadership posts):
Clean soft gradient background flowing from sage green to blush pink or ivory. Large centered elegant Hebrew typography as the visual hero. Minimal decorative heart or leaf ornament. Brand signature bottom-center. Simple, breathing, premium feel.

IMPORTANT VISUAL RULES:
- All text in image must be in Hebrew (RTL right-to-left)
- No English text visible in the final design
- Brand colors must be prominent

VISUAL QUALITY STANDARD — describe it to yourself this way:
"This looks like a spread from a premium Israeli lifestyle magazine."
"This looks like a high-end template created by a senior brand designer — not a free Canva template."
"This is suitable for an HR manager at a leading organization to proudly share."

NEVER CREATE:
- Stock photo feeling (suits, boardrooms, handshakes, office hallways)
- Corporate handshake imagery
- Generic business people posing
- Blue corporate backgrounds
- Neon or oversaturated colors
- Cheap flyer design aesthetic
- Cluttered or busy layouts
- Aggressive marketing / "sale" visual language
- Discount or promotional advertisement style
- Low quality or template-looking typography
- Trade show or expo atmosphere
- Artificial or forced smiles
`

function buildSystemPrompt(extra = '') {
  const brand = getBrandInfo()
  let prompt = MASTER_BRAND
  if (brand.extraNotes) prompt += `\n\nPersonal notes from Tal to apply to all content: ${brand.extraNotes}`

  // ── Smart Learning Engine: Inject her best-performing posts ──
  try {
    const synced = JSON.parse(localStorage.getItem('tal_synced_posts') || '[]')
    const published = JSON.parse(localStorage.getItem('tal_posts') || '[]')
    
    // Combine synced live posts and generated posts that have stats
    const allExamples = [...synced, ...published.filter(p => p.stats)]
    
    if (allExamples.length > 0) {
      // Sort by engagement weight: likes count + comments count * 3
      const topExamples = allExamples
        .sort((a, b) => {
          const scoreA = (a.stats?.likes || 0) + (a.stats?.comments || 0) * 3
          const scoreB = (b.stats?.likes || 0) + (b.stats?.comments || 0) * 3
          return scoreB - scoreA
        })
        .slice(0, 3) // Feed top 3 examples to mimic

      prompt += `\n\n========================================
WRITING EXAMPLES (STUDY AND MIMIC THIS VOICE)
========================================
Study these successful posts from Tal Shani. Pay close attention to their length (keep it elegant and relatively short), authentic tone, warm spacing, emoji density, and lack of pushy selling language. Replicate this exact rhythm and voice:

`
      topExamples.forEach((ex, idx) => {
        const excerpt = (ex.content || '').substring(0, 300)
        prompt += `Post Example ${idx + 1}:\n"${excerpt}"\n(Performance: ${ex.stats?.likes || 0} likes, ${ex.stats?.comments || 0} comments)\n\n`
      })
    }
  } catch {
    // Fail silently, fallback to standard system prompt
  }

  if (extra) prompt += `\n\n${extra}`
  return prompt
}

async function callGPT(messages, { temperature = 0.8, maxTokens = 1500, jsonMode = false } = {}) {
  const key = getApiKey()
  if (!key) throw new Error('חסר API Key — היכנסי להגדרות והזיני אותו')

  const body = { model: 'gpt-4o', messages, temperature, max_tokens: maxTokens }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'שגיאה בקריאה ל-GPT')
  }
  const data = await response.json().catch(() => { throw new Error('שגיאה בקריאת תגובת השרת') })
  const choice = data.choices?.[0]?.message
  if (choice?.refusal) {
    throw new Error(`OpenAI request refused: ${choice.refusal}`)
  }
  return choice?.content ?? ''
}

export async function generatePost({ brief, platform, contentType, format = 'post' }) {
  let platInstruction = platform
  if (platform === 'all') {
    platInstruction = 'כל הפלטפורמות — כתבי 3 פוסטים נפרדים מופרדים ב- ---\nאחד לאינסטגרם (📱), אחד לפייסבוק (👥), אחד ללינקדאין (💼)'
  }

  let formatInstruction = ''
  if (format === 'reels') {
    formatInstruction = `
    
    שימי לב! הפעם אל תכתבי פוסט רשת רגיל, אלא תסריט מנצח לסרטון קצר / רילס (Reels Script) בעברית מותאם למותג.
    מבנה התסריט הנדרש:
    [תסריט רילס ממותג]
    ⏱️ משך מומלץ: 30-45 שניות
    🎵 סאונד וטרנד מומלץ: [הנחיה לסאונד או מוזיקת רקע]
    
    🎬 סצנה 1 (0-3 שניות) - ההוק הויזואלי והדיבור:
    [מה רואים על המסך באופן מקצועי ואותנטי]
    🎙️ קריינות (דיבור בקול רם): [משפט פתיחה חזק שמושך את העין]
    
    💬 סצנה 2 (3-20 שניות) - ערך מרכזי:
    [תיאור ויזואלי של הפעילות / התמקדות בטל או באנשים אמיתיים]
    🎙️ קריינות (דיבור): [2-3 משפטים של תובנה, סיפור או טיפ קצר]
    
    🤝 סצנה 3 (20-35 שניות) - חיבור וערך:
    [סרטון אוירה של אנשים צוחקים, מדברים או יוצרים קשר]
    🎙️ קריינות (דיבור): [משפט קצר שמחזק את הבידול של טל שני - החיבור והערך]
    
    🎯 סצנה 4 (סיום) - הנעה לפעולה רכה:
    [טל מחייכת או סלייד ממותג עם הלוגו והפרטים]
    🎙️ קריינות (דיבור): [הנעה לפעולה מתוחכמת ולא מכירתית]
    
    ✍️ טקסט מומלץ לכתוב בתיאור הפוסט (Caption):
    [כתבי קפשיין קצר בגוף ראשון עד 60 מילים, עם 3 אמוג'ים מותאמים והאשטאגים בסוף]
    `
  } else if (format === 'carousel') {
    formatInstruction = `
    
    שימי לב! הפעם אל תכתבי פוסט רשת רגיל, אלא מבנה לקרוסלת תמונות מרובת שקופיות לאינסטגרם (Instagram Carousel Layout) בעברית מותאם למותג.
    מבנה הקרוסלה הנדרש:
    [קרוסלה ממותגת עם ערך]
    
    🖼️ שקופית 1 (שער):
    כותרת מושכת: [כותרת קצרה ומפוצצת בערך]
    תיאור ויזואלי: [צילום אוירה קולנועי מומלץ]
    
    🖼️ שקופית 2 (הבעיה / האתגר):
    כותרת: [נושא האתגר]
    טקסט ממוקד: [2-3 משפטים קצרים בגובה העיניים]
    ויזואל: [תיאור תמונה אותנטית]
    
    🖼️ שקופית 3 (הפתרון / התובנה):
    כותרת: [איך לפתור או מה התובנה]
    טקסט ממוקד: [2-3 נקודות מעשיות]
    ויזואל: [תיאור תמונה]
    
    🖼️ שקופית 4 (איך זה קורה בפועל):
    כותרת: [דוגמה קצרה או מקרה מהשטח]
    טקסט ממוקד: [הסבר קצר על החיבור והערך]
    
    🖼️ שקופית 5 (הנעה לפעולה ופרטים):
    כותרת: [איך ליצור קשר]
    טקסט ממוקד: [בואו נבנה יחד משהו בעל ערך לצוות שלכם. פרטי התקשרות]
    
    ✍️ טקסט מומלץ לכתוב בתיאור הפוסט (Caption):
    [כתבי קפשיין תואם המפרט את הערך ומזמין את הקוראים להגיב, עד 80 מילים, אמוג'ים מותאמים והאשטאגים בסוף]
    `
  }

  let userPrompt = `כתבי פוסט לרשת החברתית ${platInstruction} בנושא: ${brief}`
  if (contentType) {
    const contentTypesMap = new Map([
      ['tip', 'טיפ מקצועי שמציג מומחיות'],
      ['sale', 'פוסט מכירה רך ומכובד שמושך לקוחות חדשים'],
      ['behind', 'מאחורי הקלעים (Behind the scenes) — אישי ואותנטי'],
      ['question', 'שאלה לקהל שמייצרת מעורבות (engagement)'],
      ['casestudy', 'מקרה בוחן (case study) או סיפור הצלחה מהשטח']
    ])
    const ctLabel = contentTypesMap.get(contentType) || contentType
    userPrompt = `כתבי פוסט לרשת החברתית ${platInstruction} מסוג "${ctLabel}" בנושא: ${brief}`
  }

  if (formatInstruction) {
    userPrompt += `\n\n${formatInstruction}`
  }

  return callGPT([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.75, maxTokens: platform === 'all' ? 3000 : 1500 })
}

export async function regeneratePost({ existingPost, instruction }) {
  const userPrompt = `הפוסט הקיים:\n${existingPost}\n\nהוראה לשיפור: ${instruction}\n\nכתבי גרסה חדשה מוכנה לפרסום, תוך שמירה מלאה על זהות המותג של טל שני.`
  return callGPT([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.9 })
}

export async function generateResearch({ trendsData } = {}) {
  const trendsContext = trendsData
    ? `\n\nנתוני Google Trends (ישראל) שנמשכו עכשיו:\n${JSON.stringify(trendsData, null, 2)}`
    : '\n\n(אין נתוני Trends חיים כרגע — התבססי על הידע שלך על השוק הישראלי ומגמות עדכניות)'

  const userPrompt = `בצעי חקר שוק לטל שני עבור השוק הישראלי בלבד (תחום: ימי גיבוש, אירועי חברה, חוויות ארגוניות, HR).${trendsContext}

החזירי JSON תקין בלבד, ללא טקסט נוסף, במבנה הבא:
{
  "summary": "סיכום קצר של מצב השוק השבוע ב-2-3 משפטים",
  "hotTopics": [
    { "topic": "נושא חם", "why": "למה הוא רלוונטי עכשיו", "angle": "זווית מומלצת לפוסט" }
  ],
  "weeklyIdeas": [
    { "title": "כותרת רעיון לפוסט", "platform": "instagram/facebook/linkedin", "hook": "משפט פתיחה מנצח", "contentType": "tip/sale/behind/question/casestudy" }
  ],
  "facebookGroups": [
    { "name": "שם קבוצת פייסבוק ישראלית רלוונטית", "audience": "מי שם", "tip": "איך לפרסם שם נכון" }
  ],
  "bestTimes": "המלצה לזמני פרסום אופטימליים בישראל",
  "hashtags": ["האשטאג1", "האשטאג2"]
}

תני 3 hotTopics, 4 weeklyIdeas, 4-5 facebookGroups (קבוצות HR/משאבי אנוש/יזמות ישראליות מוכרות), ו-12 hashtags. הכל בעברית (פרט להאשטאגים באנגלית). חשוב: הקבוצות חייבות להיות אמיתיות ומוכרות בישראל.`

  const raw = await callGPT([
    { role: 'system', content: buildSystemPrompt('You are also a market research analyst specializing in the Israeli corporate events and HR sector.') },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.7, maxTokens: 2500 })

  const clean = (raw || '').replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('שגיאה בניתוח תגובת ה-AI — אנא נסי שוב')
  }
}

export async function generateWeeklyPlan() {
  const userPrompt = `בני לטל לוח תוכן שבועי — 4 פוסטים לשבוע הקרוב.
החזירי JSON תקין בלבד:
{
  "posts": [
    { "day": "ראשון", "title": "כותרת", "platform": "instagram/facebook/linkedin", "contentType": "tip/sale/behind/question/casestudy", "hook": "פתיחה", "brief": "על מה לכתוב במשפט" }
  ]
}
גיוון בין סוגי תוכן (טיפ, מכירה, אישי, שאלה). הכל בעברית.`

  const raw = await callGPT([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.8, maxTokens: 1500 })
  const clean = (raw || '').replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('שגיאה בניתוח תגובת ה-AI — אנא נסי שוב')
  }
}

export async function generatePostImage(postText) {
  const key = getApiKey()
  if (!key) throw new Error('חסר API Key — היכנסי להגדרות והזיני אותו')

  let dynamicSceneDescription = ''
  try {
    const gptPrompt = `You are a creative director for the premium Israeli brand "Tal Shani - Organizational Experiences with Value."

Tal Shani does NOT sell events. She sells: Connection. Belonging. Trust. Human relationships. Organizational culture.
The activity is never the main message. The human impact is always the main message.

Read the following Hebrew social media post. Then answer this question:
"What will employees FEEL after this experience?"

Based on that answer, write one short English scene description that captures that FEELING visually — as a real human moment in a beautiful Israeli setting.

The scene must feel like a spread from a premium Israeli lifestyle magazine — NOT an event advertisement, NOT a corporate brochure.

Think: what is the emotional core of this post? What human connection moment would make a viewer feel "I want my employees to experience that"?

Examples of excellent scene descriptions:
- "Two employees sharing a genuine laugh while working side by side at a rustic outdoor table in a sunlit Israeli olive grove."
- "A small group of colleagues sitting in a circle on grass at golden hour, listening deeply to each other."
- "Team members holding hands in a circle at sunset on an Israeli hilltop, faces showing pride and belonging."
- "A woman smiling warmly as she receives appreciation from a colleague during an outdoor retreat in nature."
- "Employees building something together with their hands at a rustic table, fully absorbed and joyful."

Write ONLY the final English scene description. One sentence or two. No introduction, no explanation, no quotes.

Post text in Hebrew:
"${postText.substring(0, 800)}"`

    dynamicSceneDescription = await callGPT([
      { role: 'user', content: gptPrompt }
    ], { temperature: 0.7, maxTokens: 250 })
  } catch (e) {
    console.error('Failed to generate dynamic visual prompt, falling back to default', e)
  }

  const sceneDescription = (dynamicSceneDescription || '').trim() || 'Team members building trust and connection together in a beautiful natural setting in Israel.'

  const finalPrompt = `Create a brand photograph for Tal Shani — a boutique Israeli organizational experience producer.

Visual quality standard:
This image must look like a spread from a premium Israeli lifestyle magazine.
It must look like it was shot by an award-winning editorial photographer for a feature story on meaningful human connection — NOT like an event advertisement.
It must look suitable for an HR director at Intel or Bank HaPoalim to proudly share with her team.

Brand personality:
Warm, human, authentic, inspiring, meaningful.
Real people. Real moments. Real emotion.

Photography style:
Editorial lifestyle photography.
Cinematic storytelling.
Shallow depth of field — subject in focus, background softly blurred.
Natural light, not studio flash.
Spontaneous-feeling composition, not posed.
Documentary warmth.

Lighting:
Golden hour sunlight.
Warm natural glow filtering through trees or open sky.
Soft natural shadows.
No harsh studio lighting.

Color palette:
Warm beige, ivory, cream.
Soft blush pink.
Natural olive and sage greens.
Warm gold accents.
Earth tones throughout.

Emotion to capture:
Connection between people — a look, a laugh, a shared moment.
Belonging — people who feel they are part of something real.
Meaning — not entertainment, but genuine human experience.
Trust — people comfortable and authentic with each other.

Environment:
Beautiful outdoor locations in Israel — nature, olive groves, rolling hills, boutique venues.
Warm light through trees.
Rustic wooden tables with organic arrangements.
Israeli landscape.

Main topic:
${sceneDescription}

NEVER include:
Stock photo look (no suits, no boardroom, no corporate handshakes, no office hallways).
Generic business people posing artificially.
Blue corporate backgrounds.
Neon or oversaturated colors.
Cheap flyer aesthetic.
Cluttered layouts.
Aggressive marketing or sale atmosphere.
Discount advertisement style.
Low quality or generic typography.
Trade show or expo environment.
Forced or artificial smiles.
Text overlays, logos, or advertisements.

Leave generous clean negative space for future Hebrew text placement.

Format:
4:5 Instagram format.`

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json'
    })
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error?.message || 'שגיאה בתקשורת עם שרתי OpenAI ליצירת התמונה')
  }

  const data = await response.json()
  const item = data.data?.[0]
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`
  if (item?.url) return item.url
  throw new Error('לא התקבלה תמונה מהשרת — אנא נסי שוב')
}

// ─── WhatsApp Message Generator ──────────────────────────────────────────────
export async function generateWhatsAppMessage({ type, context = '', recipientName = '' }) {
  const typeMap = {
    intro: {
      label: 'הודעת פתיחה למנהלת HR / רווחה',
      instruction: 'הודעת היכרות ראשונה למנהלת משאבי אנוש/רווחה שלא מכירה את טל. חמה ולא דחופה, מציעה שיחה ללא מחויבות.'
    },
    followup: {
      label: 'מעקב אחרי פגישה / שיחה',
      instruction: 'הודעה אחרי שיחה ראשונה — תודה על הזמן, סיכום קצר של מה שדיברנו, והצעת המשך טבעי.'
    },
    offer: {
      label: 'הצעה לבניית חוויה',
      instruction: 'הודעה שמציעה לבנות יום גיבוש מותאם אישית. רכה, בלי לחץ, מתמקדת בערך לעובדים ולא במחיר.'
    },
    thanks: {
      label: 'תודה אחרי אירוע',
      instruction: 'הודעת תודה כנה אחרי אירוע שעבר — מחזקת את הקשר, שואלת על תחושות והשפעה.'
    },
    reminder: {
      label: 'תזכורת עדינה אחרי שתיקה',
      instruction: 'תזכורת חמה ולא מציקה ללקוחה פוטנציאלית שלא חזרה. שואלת איך הולך ומציעה ערך, לא מוכרת.'
    }
  }

  const cfg = typeMap[type] || typeMap.intro
  const greeting = recipientName ? `הנמענת: ${recipientName}` : 'הנמענת: לא צוין שם'

  const userPrompt = `כתבי הודעת WhatsApp בעברית בסגנון של טל שני. ${cfg.instruction}

${greeting}
${context ? `הקשר נוסף מטל: ${context}` : ''}

הנחיות חשובות:
- 3-6 שורות בלבד, קצר וחם
- בלי האשטאגים
- אמוג'י 1-2 לכל היותר (🌿 ✨ 🤝 ❤️)
- בלי "הזמיני עכשיו", "אל תפספסי", בלי תמחור
- ברכה אישית בפתיחה (היי X, אהלן X, וכו') אם יש שם
- סיום עם שאלה רכה או הזמנה לשיחה
- שורה כפולה בין פסקאות לקריאות
- אם אין שם נמענת — פתיחה כללית חמה ("היי 🌿" / "אהלן")`

  return callGPT([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.75, maxTokens: 500 })
}

// ─── Full Campaign Generator (email + landing + matching post) ────────────────
export async function generateCampaign({ theme, audience, goal }) {
  const userPrompt = `בני קמפיין שיווקי מלא ועקבי לטל שני סביב הנושא: "${theme}"

${audience ? `קהל יעד ספציפי: ${audience}` : 'קהל יעד: מנהלות HR/רווחה בחברות 30-500 עובדים'}
${goal ? `מטרה: ${goal}` : 'מטרה: יצירת ענין וקבלת פניות לשיחת ייעוץ'}

החזירי JSON תקין בלבד במבנה הבא:
{
  "campaignName": "שם קמפיין קצר וברור (עד 6 מילים)",
  "bigIdea": "הרעיון השיווקי המרכזי במשפט אחד מנצח",
  "email": {
    "subject": "שורת נושא מושכת לאימייל (עד 8 מילים, בלי מילים אסורות, מעוררת סקרנות)",
    "preheader": "הטקסט הקטן שמופיע אחרי הנושא ב-inbox (עד 12 מילים)",
    "body": "גוף האימייל בעברית — פתיחה אישית, סיפור/תובנה, ערך, soft CTA. 120-180 מילים. שורות קצרות וקריאות. בלי לוגו/חתימה — רק התוכן.",
    "cta": "טקסט לכפתור הקריאה לפעולה (3-5 מילים)"
  },
  "landingPage": {
    "headline": "כותרת ראשית של הלנדינג (מעוררת רגש, עד 8 מילים)",
    "subheadline": "כותרת משנה שמסבירה את הערך (משפט אחד)",
    "valuePoints": [
      { "title": "ערך 1", "desc": "תיאור קצר (עד 12 מילים)" },
      { "title": "ערך 2", "desc": "תיאור קצר (עד 12 מילים)" },
      { "title": "ערך 3", "desc": "תיאור קצר (עד 12 מילים)" }
    ],
    "socialProof": "משפט אחד שמזכיר ניסיון/חברות (Intel, פועלים, וכו') בלי להישמע מתרברב",
    "primaryCta": "טקסט לכפתור עיקרי (3-5 מילים)",
    "secondaryCta": "טקסט לכפתור משני, פחות מחייב (3-5 מילים)"
  },
  "instagramPost": "פוסט אינסטגרם תואם, 4-6 שורות, hook חזק בפתיחה, סיפור/תובנה, soft CTA. 2-3 אמוג'ים בלבד, 12-15 האשטאגים בעברית בשורה נפרדת בסוף. בלי מילים אסורות.",
  "whatsappTeaser": "הודעת וואצאפ קצרה (2-4 שורות) לשליחה ידנית ללקוחה פוטנציאלית, שמפנה לאותו רעיון של הקמפיין"
}

הקמפיין חייב להיות עקבי — אותה תובנה מרכזית, אותה זווית רגשית, אותו צבע לשוני, בכל הערוצים. הכל בעברית פרט להאשטאגים אם רלוונטי. בלי מילים אסורות (יום גיבוש מושלם, חבילות משתלמות, מבצע, מטורף, וכו').`

  const raw = await callGPT([
    { role: 'system', content: buildSystemPrompt('You are also a senior multi-channel campaign strategist for premium Israeli B2B brands.') },
    { role: 'user', content: userPrompt }
  ], { temperature: 0.78, maxTokens: 3000, jsonMode: true })

  try {
    return JSON.parse((raw || '').replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('שגיאה בניתוח תגובת ה-AI — אנא נסי שוב')
  }
}

export async function generateImageContent(postText) {
  const prompt = `קרא את הפוסט הבא שמיועד לפרסום עבור המותג "טל שני - חוויה ארגונית עם ערך".
המטרה שלך היא לחלץ מתוכו טקסטים קצרים וקולעים שיופיעו על גבי *תמונת העיצוב* המצורפת לפוסט, ובנוסף להתאים את סגנון העיצוב המומלץ ביותר (Theme, פונט ותבנית) לפי סוג התוכן והרגש של הפוסט.

חובה להחזיר רק אובייקט JSON תקין בלבד במבנה הבא:
{
  "title": "כותרת ראשית קצרה ומושכת (עד 4 מילים)",
  "subtitle": "משפט משנה שנותן ערך מוסף למשאבי אנוש (עד 7 מילים)",
  "bullets": [
    { "title": "כותרת נקודה 1 (עד 3 מילים)", "desc": "תיאור קצר (עד 5 מילים)" },
    { "title": "כותרת נקודה 2 (עד 3 מילים)", "desc": "תיאור קצר (עד 5 מילים)" },
    { "title": "כותרת נקודה 3 (עד 3 מילים)", "desc": "תיאור קצר (עד 5 מילים)" }
  ],
  "theme": "בחרי ערכת צבעים מתוך: green-beige (ירוק זית כהה), earth-gold (חום חימר ואדמה), ivory-gold (שמנת ורודה), pink-beige (ורוד פודרה)",
  "font": "בחרי פונט מתוך: Heebo, Secular One, Varela Round, Frank Ruhl Libre",
  "templateIndex": "בחרי תבנית מומלצת מתוך: 0 (תבנית 1: קלאסית עם גרדיאנט צד), 1 (תבנית 2: כרטיס מעוגל צף עם בועות צבע), 2 (תבנית 3: פלייר שיווקי חצוי עם כפתורי וואצאפ ואתר)",
  "overlayOpacity": "בחרי רמת כהות/בהירות מומלצת כערך מספרי בין 0.4 ל-0.8 (למשל 0.65)"
}

הנחיות לבחירת העיצוב המנחה:
1. אם הפוסט הוא טיפ מקצועי או פוסט ארוך ומובנה -> בחרי בתבנית 1 (כרטיס מעוגל צף עם בועות) בערכת שמנת ורודה (ivory-gold) עם פונט Heebo או Secular One, ברמת כהות 0.5.
2. אם הפוסט הוא סיפור לקוח מרגש או השראה אותנטית מהשטח -> בחרי בתבנית 0 (קלאסית מלאה) בערכת ירוק זית כהה (green-beige) או חום אדמה (earth-gold) עם פונט Frank Ruhl Libre או Varela Round, ברמת כהות 0.65.
3. אם הפוסט הוא פוסט מכירה רך, הזמנה לאירוע, או הצעה לבניית יום גיבוש -> בחרי בתבנית 2 (פלייר שיווקי חצוי עם כפתורי וואצאפ ואתר) בערכת ורוד פודרה (pink-beige) או שמנת ורודה (ivory-gold), ברמת כהות 0.6.

טקסט הפוסט המקורי:
"${postText}"`

  const raw = await callGPT(
    [{ role: 'user', content: prompt }],
    { temperature: 0.6, maxTokens: 600, jsonMode: true }
  )
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('שגיאה בניתוח תגובת ה-AI — אנא נסי שוב')
  }
}

// ─── 7 Post Type definitions (Style Lock) ───────────────────────────────
export const POST_TYPES = [
  {
    id: 'tip',
    name: 'טיפ מקצועי',
    emoji: '💡',
    desc: 'מספרים ותובנות מעשיות',
    systemHint: 'Write a numbered tip for HR managers (e.g. "טיפ #1", "טיפ #2"). Provide actionable, professional advice about creating meaningful organizational culture and connection. The headline should clearly state that it is a tip.',
    defaultServices: ['ימי גיבוש', 'סדנאות פיתוח מנהלים', 'ייעוץ אסטרטגי', 'הכשרת צוותים'],
  },
  {
    id: 'inspiration',
    name: 'השראה',
    emoji: '✨',
    desc: 'סיפורים שגורמים לחשוב',
    systemHint: 'Share an inspiring thought or story about human connection, the value of appreciating employees, or leadership. Make the reader stop and reflect. Emotional and authentic.',
    defaultServices: ['חיבור עמוק', 'ערכים בפעולה', 'קהילה בארגון', 'השראה ארגונית'],
  },
  {
    id: 'value',
    name: 'ערך ארגוני',
    emoji: '💚',
    desc: 'חיבור לתרבות של החברה',
    systemHint: 'Focus heavily on core organizational values like trust, meaning, teamwork, and belonging. Discuss how to translate abstract values into tangible employee experiences.',
    defaultServices: ['עשייה עם ערך', 'תרבות ארגונית', 'התנדבות', 'בניית שייכות'],
  },
  {
    id: 'behind',
    name: 'מאחורי הקלעים',
    emoji: '📸',
    desc: 'איך דברים קורים באמת',
    systemHint: 'Give a "behind the scenes" look into how Tal Shani crafts experiences. Talk about the small details, the planning, or a candid moment from an event production.',
    defaultServices: ['ליווי מלא', 'אירוע בוטיקי', 'חשיבה על הפרטים', 'הפקת פרימיום'],
  },
  {
    id: 'idea',
    name: 'רעיון לפעילות',
    emoji: '🎯',
    desc: 'הצעות יצירתיות לשטח',
    systemHint: 'Present a creative, out-of-the-box activity idea for employees. Frame it not as an attraction, but as a way to achieve a specific emotional outcome (e.g., getting people to talk deeply).',
    defaultServices: ['חוויה אמיתית', 'סדנאות תוכן', 'פעילות בטבע', 'מפגשי שיח'],
  },
  {
    id: 'case_study',
    name: 'סיפור לקוח',
    emoji: '🏆',
    desc: 'הצלחות וקייס סטאדיז',
    systemHint: 'Share a brief, powerful case study. What was the challenge the company faced? What experience did you create? And most importantly, what was the emotional and cultural impact on the team?',
    defaultServices: ['ליווי צמוד', 'הצלחה מוכחת', 'שינוי תרבותי', 'חוויות ממותגות'],
  },
  {
    id: 'promotion',
    name: 'פוסט מכירה',
    emoji: '🤝',
    desc: 'הנעה לפעולה ויצירת קשר',
    systemHint: 'A soft, elegant promotional post. Invite HR managers or CEOs to reach out to plan their next company retreat or team day. Focus on the value they will get (connection, meaning) rather than the logistics.',
    defaultServices: ['ימי גיבוש', 'נופש חברה', 'אירועי חברה', 'חוויה מותאמת אישית'],
  },
]

// ─── Sales / Brand Engine Content Generator ────────────────────────────────────
// Returns structured JSON that populates the fixed Canva-style template.
// templateId selects one of the 7 Post Types for a tailored system hint.
export async function generateSalesPostContent({ brief = '', topic = '', templateId = 'tip' } = {}) {
  const postType = POST_TYPES.find(t => t.id === templateId) || POST_TYPES[0]

  const userPrompt = `
=================================
BRAND ENGINE — TAL SHANI
Style Lock: NEVER change the design. Only generate content fields.
=================================

POST TYPE: "${postType.name}"
TYPE FOCUS: ${postType.systemHint}

Default services for this post type: ${postType.defaultServices.join(', ')}

=================================
BRIEF FROM USER
=================================
"${brief || topic || 'צרי תוכן מייצג לסוג פוסט זה'}"

=================================
GENERATE THESE FIELDS ONLY
=================================

headline:
- Maximum 5 bold Hebrew words
- If it is a TIP, consider opening with "טיפ #1", "טיפ #2" etc.
- Emotionally powerful and unique to this post type's angle
- NEVER use: יום גיבוש מושלם, חבילות, מבצע, אל תפספסו

personal_line:
- Maximum 6 words, handwritten warmth, as if Tal is speaking
- First person, genuine, not salesy

subheadline:
- 1 sentence, maximum 12 Hebrew words
- Clear value proposition for this post type

benefits:
- Exactly 3 short Hebrew statements, maximum 6 words each
- Use strong verbs or nouns to open each benefit

services:
- Exactly 4 service names (2-3 words each)
- Prefer: ${postType.defaultServices.join(', ')} — adapt based on brief

image_description:
- English scene for DALL-E 3
- Warm, authentic, Israeli corporate lifestyle photography
- Real people connecting, golden hour, natural setting or elegant interior
- Maximum 2 sentences

=================================
OUTPUT: Valid JSON only — no text, no markdown
=================================
{
  "headline": "",
  "personal_line": "",
  "subheadline": "",
  "benefits": ["", "", ""],
  "services": ["", "", "", ""],
  "image_description": ""
}
`

  const raw = await callGPT(
    [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: userPrompt }
    ],
    { temperature: 0.78, maxTokens: 700, jsonMode: true }
  )

  try {
    return JSON.parse((raw || '').replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('שגיאה בניתוח תגובת ה-AI — אנא נסי שוב')
  }
}
