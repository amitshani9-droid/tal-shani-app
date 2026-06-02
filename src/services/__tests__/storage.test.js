import { describe, it, expect, beforeEach } from 'vitest'
import { storage, formatDate, formatTime, platformLabels, contentTypeLabels } from '../storage'

beforeEach(() => {
  localStorage.clear()
})

// ── Posts ──────────────────────────────────────────────
describe('storage.getPosts', () => {
  it('returns empty array when nothing saved', () => {
    expect(storage.getPosts()).toEqual([])
  })

  it('returns empty array when localStorage has corrupt JSON', () => {
    localStorage.setItem('tal_posts', 'NOT_JSON{{{')
    expect(storage.getPosts()).toEqual([])
  })
})

describe('storage.savePost', () => {
  it('saves a post and returns it with id and createdAt', () => {
    const post = storage.savePost({ content: 'hello', platform: 'instagram' })
    expect(post.id).toBeDefined()
    expect(post.createdAt).toBeDefined()
    expect(post.content).toBe('hello')
  })

  it('prepends new posts (most recent first)', () => {
    storage.savePost({ content: 'first' })
    storage.savePost({ content: 'second' })
    const posts = storage.getPosts()
    expect(posts[0].content).toBe('second')
    expect(posts[1].content).toBe('first')
  })

  it('accumulates multiple posts', () => {
    storage.savePost({ content: 'a' })
    storage.savePost({ content: 'b' })
    storage.savePost({ content: 'c' })
    expect(storage.getPosts()).toHaveLength(3)
  })
})

describe('storage.deletePost', () => {
  it('removes only the targeted post by id', () => {
    const p1 = storage.savePost({ content: 'keep' })
    const p2 = storage.savePost({ content: 'delete me' })
    storage.deletePost(p2.id)
    const remaining = storage.getPosts()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].content).toBe('keep')
  })

  it('is a no-op when id does not exist', () => {
    storage.savePost({ content: 'stays' })
    storage.deletePost(99999)
    expect(storage.getPosts()).toHaveLength(1)
  })
})

// ── Drafts ─────────────────────────────────────────────
describe('storage.getDrafts', () => {
  it('returns empty array when nothing saved', () => {
    expect(storage.getDrafts()).toEqual([])
  })
})

describe('storage.saveDraft / deleteDraft', () => {
  it('saves and retrieves a draft', () => {
    storage.saveDraft({ content: 'draft content', platform: 'linkedin' })
    const drafts = storage.getDrafts()
    expect(drafts).toHaveLength(1)
    expect(drafts[0].platform).toBe('linkedin')
  })

  it('deletes a draft by id', () => {
    const d = storage.saveDraft({ content: 'to delete' })
    storage.deleteDraft(d.id)
    expect(storage.getDrafts()).toHaveLength(0)
  })
})

// ── Calendar ───────────────────────────────────────────
describe('storage.getCalendar / saveCalendarItem / deleteCalendarItem', () => {
  it('starts empty', () => {
    expect(storage.getCalendar()).toEqual([])
  })

  it('saves a calendar item with an id', () => {
    storage.saveCalendarItem({ platform: 'facebook', scheduledFor: '2026-07-01' })
    const cal = storage.getCalendar()
    expect(cal).toHaveLength(1)
    expect(cal[0].id).toBeDefined()
    expect(cal[0].platform).toBe('facebook')
  })

  it('deletes only the targeted calendar item', () => {
    storage.saveCalendarItem({ scheduledFor: '2026-07-01' })
    const item = storage.getCalendar()[0]
    storage.saveCalendarItem({ scheduledFor: '2026-07-02' })
    storage.deleteCalendarItem(item.id)
    expect(storage.getCalendar()).toHaveLength(1)
  })
})

// ── Research ───────────────────────────────────────────
describe('storage.getResearch / saveResearch', () => {
  it('returns null when nothing saved', () => {
    expect(storage.getResearch()).toBeNull()
  })

  it('saves and retrieves a research report with generatedAt', () => {
    const report = { summary: 'טרנדים חמים', hotTopics: [] }
    const saved = storage.saveResearch(report)
    expect(saved.generatedAt).toBeDefined()
    expect(storage.getResearch().summary).toBe('טרנדים חמים')
  })
})

// ── updatePostStats ────────────────────────────────────
describe('storage.updatePostStats', () => {
  it('merges stats into an existing post', () => {
    const post = storage.savePost({ content: 'post with stats' })
    storage.updatePostStats(post.id, { likes: 42, comments: 3 })
    const updated = storage.getPosts().find(p => p.id === post.id)
    expect(updated.stats.likes).toBe(42)
    expect(updated.stats.comments).toBe(3)
  })

  it('does not alter other posts', () => {
    const p1 = storage.savePost({ content: 'untouched' })
    const p2 = storage.savePost({ content: 'target' })
    storage.updatePostStats(p2.id, { likes: 10 })
    const untouched = storage.getPosts().find(p => p.id === p1.id)
    expect(untouched.stats).toBeUndefined()
  })
})

// ── Helpers ────────────────────────────────────────────
describe('formatDate', () => {
  it('formats an ISO string into a Hebrew date string', () => {
    const result = formatDate('2026-01-15T10:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('platformLabels', () => {
  it('has labels for all expected platforms', () => {
    expect(platformLabels.instagram).toBe('אינסטגרם')
    expect(platformLabels.facebook).toBe('פייסבוק')
    expect(platformLabels.linkedin).toBe('לינקדאין')
    expect(platformLabels.all).toBe('כל הפלטפורמות')
  })
})

describe('contentTypeLabels', () => {
  it('covers all content types', () => {
    const types = ['tip', 'sale', 'behind', 'question', 'casestudy']
    types.forEach(t => {
      expect(contentTypeLabels[t]).toBeDefined()
    })
  })
})

// ── formatTime ─────────────────────────────────────────
describe('formatTime', () => {
  it('returns a non-empty string for a valid ISO timestamp', () => {
    const result = formatTime('2026-06-01T14:30:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a different string for a different time', () => {
    const a = formatTime('2026-06-01T08:00:00.000Z')
    const b = formatTime('2026-06-01T20:00:00.000Z')
    expect(a).not.toBe(b)
  })
})

// ── Hebrew content roundtrip ───────────────────────────
describe('Hebrew special characters', () => {
  it('stores and retrieves Hebrew text without corruption', () => {
    const hebrew = 'שלום! ✨ חוויה ארגונית עם ערך — אין כמוה.'
    const saved = storage.savePost({ content: hebrew, platform: 'instagram' })
    const retrieved = storage.getPosts().find(p => p.id === saved.id)
    expect(retrieved.content).toBe(hebrew)
  })

  it('stores and retrieves Hebrew draft content', () => {
    const content = 'גיבוש צוות 💪 | ממה להתחיל? כך בונים יום מוצלח.'
    const draft = storage.saveDraft({ content, platform: 'linkedin' })
    const retrieved = storage.getDrafts().find(d => d.id === draft.id)
    expect(retrieved.content).toBe(content)
  })
})

// ── ID uniqueness ──────────────────────────────────────
describe('ID uniqueness', () => {
  it('generates unique IDs for multiple rapid saves', () => {
    const ids = Array.from({ length: 10 }, () =>
      storage.savePost({ content: 'rapid' }).id
    )
    const unique = new Set(ids)
    expect(unique.size).toBe(10)
  })

  it('does not confuse posts and drafts with the same id value', () => {
    // Even if IDs overlap, deleting a post must not affect drafts
    const post  = storage.savePost({ content: 'post' })
    const draft = storage.saveDraft({ content: 'draft' })
    storage.deletePost(post.id)
    expect(storage.getDrafts()).toHaveLength(1)
    expect(storage.getDrafts()[0].id).toBe(draft.id)
  })
})

// ── saveCalendarItem returns void gracefully ───────────
describe('storage.saveCalendarItem — multiple items', () => {
  it('can save multiple items for the same date', () => {
    storage.saveCalendarItem({ title: 'A', scheduledFor: '2026-07-01' })
    storage.saveCalendarItem({ title: 'B', scheduledFor: '2026-07-01' })
    const items = storage.getCalendar().filter(i => i.scheduledFor === '2026-07-01')
    expect(items).toHaveLength(2)
  })

  it('assigns unique IDs to all calendar items', () => {
    for (let i = 0; i < 5; i++) storage.saveCalendarItem({ scheduledFor: '2026-08-01' })
    const ids = storage.getCalendar().map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── updatePostStats — edge cases ───────────────────────
describe('storage.updatePostStats — edge cases', () => {
  it('is a no-op when the post id does not exist', () => {
    storage.savePost({ content: 'safe' })
    expect(() => storage.updatePostStats(99999, { likes: 5 })).not.toThrow()
    expect(storage.getPosts()[0].stats).toBeUndefined()
  })

  it('overwrites previous stats', () => {
    const p = storage.savePost({ content: 'evolving' })
    storage.updatePostStats(p.id, { likes: 10, comments: 2 })
    storage.updatePostStats(p.id, { likes: 20, comments: 5 })
    const updated = storage.getPosts().find(x => x.id === p.id)
    expect(updated.stats.likes).toBe(20)
    expect(updated.stats.comments).toBe(5)
  })
})
