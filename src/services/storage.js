function uniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const KEYS = {
  POSTS: 'tal_posts',
  DRAFTS: 'tal_drafts',
  CALENDAR: 'tal_calendar',
  RESEARCH: 'tal_research'
}

// localStorage.setItem with quota fallback. Returns true on success.
// On quota errors, strips heavy fields (base64 images) and retries once.
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      try {
        const parsed = JSON.parse(value)
        const stripped = Array.isArray(parsed)
          ? parsed.map(item => stripHeavy(item))
          : stripHeavy(parsed)
        localStorage.setItem(key, JSON.stringify(stripped))
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

function stripHeavy(item) {
  if (!item || typeof item !== 'object') return item
  const out = { ...item }
  if (typeof out.imageUrl === 'string' && out.imageUrl.startsWith('data:')) {
    out.imageUrl = ''
    out._imageStripped = true
  }
  return out
}

export const storage = {
  getPosts() {
    try { return JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]') }
    catch { return [] }
  },
  savePost(post) {
    const posts = this.getPosts()
    const newPost = { ...post, id: uniqueId(), createdAt: new Date().toISOString() }
    posts.unshift(newPost)
    safeSet(KEYS.POSTS, JSON.stringify(posts))
    return newPost
  },
  deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id)
    safeSet(KEYS.POSTS, JSON.stringify(posts))
  },
  getDrafts() {
    try { return JSON.parse(localStorage.getItem(KEYS.DRAFTS) || '[]') }
    catch { return [] }
  },
  saveDraft(draft) {
    const drafts = this.getDrafts()
    const newDraft = { ...draft, id: uniqueId(), createdAt: new Date().toISOString() }
    drafts.unshift(newDraft)
    safeSet(KEYS.DRAFTS, JSON.stringify(drafts))
    return newDraft
  },
  deleteDraft(id) {
    const drafts = this.getDrafts().filter(d => d.id !== id)
    safeSet(KEYS.DRAFTS, JSON.stringify(drafts))
  },
  getCalendar() {
    try { return JSON.parse(localStorage.getItem(KEYS.CALENDAR) || '[]') }
    catch { return [] }
  },
  saveCalendarItem(item) {
    const cal = this.getCalendar()
    cal.push({ ...item, id: uniqueId() })
    safeSet(KEYS.CALENDAR, JSON.stringify(cal))
  },
  deleteCalendarItem(id) {
    const cal = this.getCalendar().filter(c => c.id !== id)
    safeSet(KEYS.CALENDAR, JSON.stringify(cal))
  },

  // חקר שוק — שומר את הדוח האחרון
  getResearch() {
    try { return JSON.parse(localStorage.getItem(KEYS.RESEARCH) || 'null') }
    catch { return null }
  },
  saveResearch(report) {
    const stored = { ...report, generatedAt: new Date().toISOString() }
    safeSet(KEYS.RESEARCH, JSON.stringify(stored))
    return stored
  },

  // עדכון ביצועים של פוסט שפורסם (לייקים/תגובות/פניות)
  updatePostStats(id, stats) {
    const posts = this.getPosts().map(p =>
      p.id === id ? { ...p, stats: { ...p.stats, ...stats } } : p
    )
    safeSet(KEYS.POSTS, JSON.stringify(posts))
  }
}

export const platformLabels = {
  instagram: 'אינסטגרם',
  facebook: 'פייסבוק',
  linkedin: 'לינקדאין',
  all: 'כל הפלטפורמות'
}

export const platformColors = {
  instagram: '#E8B4A8',
  facebook: '#8FAF87',
  linkedin: '#6B7F63',
  all: '#4A5C42'
}

export const contentTypeLabels = {
  tip: '💡 טיפ מקצועי',
  sale: '📣 פוסט מכירה',
  behind: '🎬 Behind the scenes',
  question: '❓ שאלה לקהל',
  casestudy: '🏆 סיפור הצלחה'
}

export function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}
