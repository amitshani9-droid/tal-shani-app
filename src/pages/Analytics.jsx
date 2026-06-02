import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Heart, MessageCircle, TrendingUp, Award, Edit2, Check, X } from 'lucide-react'
import { storage, platformLabels, contentTypeLabels, formatDate } from '../services/storage'

const PLATFORM_COLOR = {
  instagram: '#BE185D',
  facebook:  '#1D4ED8',
  linkedin:  '#0369A1',
  all:       '#4F5D44'
}

const RANGE_OPTIONS = [
  { id: 7,   label: '7 ימים' },
  { id: 30,  label: '30 ימים' },
  { id: 90,  label: '3 חודשים' },
  { id: 0,   label: 'הכל' },
]

function engagementScore(stats) {
  if (!stats) return 0
  return (stats.likes || 0) + (stats.comments || 0) * 3
}

export default function Analytics() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState(() => storage.getPosts())
  const [range, setRange] = useState(30)
  const [editingId, setEditingId] = useState(null)
  const [editLikes, setEditLikes] = useState(0)
  const [editComments, setEditComments] = useState(0)

  const filtered = useMemo(() => {
    if (range === 0) return posts
    const cutoff = Date.now() - range * 24 * 60 * 60 * 1000
    return posts.filter(p => new Date(p.createdAt).getTime() >= cutoff)
  }, [posts, range])

  const totals = useMemo(() => {
    let likes = 0, comments = 0, withStats = 0
    filtered.forEach(p => {
      if (p.stats) {
        likes += p.stats.likes || 0
        comments += p.stats.comments || 0
        withStats++
      }
    })
    const avg = withStats ? Math.round((likes + comments) / withStats) : 0
    return { likes, comments, withStats, total: filtered.length, avg }
  }, [filtered])

  // Group by platform
  const byPlatform = useMemo(() => {
    const groups = {}
    filtered.forEach(p => {
      const key = p.platform || 'other'
      if (!groups[key]) groups[key] = { count: 0, likes: 0, comments: 0 }
      groups[key].count++
      groups[key].likes += p.stats?.likes || 0
      groups[key].comments += p.stats?.comments || 0
    })
    return Object.entries(groups).map(([platform, data]) => ({
      platform,
      ...data,
      avgEngagement: data.count ? Math.round((data.likes + data.comments) / data.count) : 0
    })).sort((a, b) => b.avgEngagement - a.avgEngagement)
  }, [filtered])

  // Group by content type
  const byType = useMemo(() => {
    const groups = {}
    filtered.forEach(p => {
      if (!p.contentType) return
      const key = p.contentType
      if (!groups[key]) groups[key] = { count: 0, likes: 0, comments: 0 }
      groups[key].count++
      groups[key].likes += p.stats?.likes || 0
      groups[key].comments += p.stats?.comments || 0
    })
    return Object.entries(groups).map(([type, data]) => ({
      type,
      ...data,
      avgEngagement: data.count ? Math.round((data.likes + data.comments) / data.count) : 0
    })).sort((a, b) => b.avgEngagement - a.avgEngagement)
  }, [filtered])

  // Timeline: last N weeks
  const timeline = useMemo(() => {
    const weeks = range === 0 ? 12 : Math.min(12, Math.ceil(range / 7))
    const now = new Date()
    const buckets = []
    for (let i = weeks - 1; i >= 0; i--) {
      const end = new Date(now)
      end.setDate(end.getDate() - i * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      const items = filtered.filter(p => {
        const t = new Date(p.createdAt).getTime()
        return t >= start.getTime() && t < end.getTime()
      })
      const engagement = items.reduce((sum, p) => sum + engagementScore(p.stats), 0)
      buckets.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        posts: items.length,
        engagement
      })
    }
    return buckets
  }, [filtered, range])

  const maxTimeline = Math.max(1, ...timeline.map(b => b.engagement))

  const top5 = useMemo(() => {
    return [...filtered]
      .filter(p => p.stats)
      .sort((a, b) => engagementScore(b.stats) - engagementScore(a.stats))
      .slice(0, 5)
  }, [filtered])

  function startEdit(post) {
    setEditingId(post.id)
    setEditLikes(post.stats?.likes || 0)
    setEditComments(post.stats?.comments || 0)
  }

  function saveEdit(id) {
    storage.updatePostStats(id, {
      likes: Number(editLikes) || 0,
      comments: Number(editComments) || 0
    })
    setPosts(storage.getPosts())
    setEditingId(null)
  }

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
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.4px' }}>אנליטיקס</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            ביצועי הפוסטים שלך — מה עובד הכי טוב לאורך זמן
          </p>
        </div>
      </div>

      <div className="desktop-container" style={{ maxWidth: 960 }}>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {RANGE_OPTIONS.map(opt => {
            const active = range === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-pill)',
                  background: active ? 'var(--green-dark)' : 'var(--white)',
                  color: active ? 'white' : 'var(--text-mid)',
                  border: `1px solid ${active ? 'var(--green-dark)' : 'var(--border)'}`,
                  fontSize: 12.5, fontWeight: 600
                }}
              >{opt.label}</button>
            )
          })}
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 72, height: 72, background: 'var(--green-pale)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', boxShadow: 'var(--shadow-sm)'
            }}>
              <BarChart3 size={30} color="var(--green-dark)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
              אין עדיין פוסטים שפורסמו
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              ברגע שתסמני פוסט כ"פורסם" ותעדכני את הלייקים והתגובות, הוא יופיע כאן
            </p>
            <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '12px 24px' }}>
              צרי פוסט ראשון
            </button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24
            }}>
              <StatCard label="פוסטים בטווח" value={totals.total} icon={BarChart3} color="var(--green-dark)" />
              <StatCard label="סה״כ לייקים" value={totals.likes} icon={Heart} color="#BE185D" />
              <StatCard label="סה״כ תגובות" value={totals.comments} icon={MessageCircle} color="#0369A1" />
              <StatCard label="מעורבות ממוצעת" value={totals.avg} icon={TrendingUp} color="var(--earth)" subtitle={`${totals.withStats}/${totals.total} עם נתונים`} />
            </div>

            {/* Timeline chart */}
            <Section title="מעורבות שבועית" icon={TrendingUp}>
              {totals.withStats === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: 24 }}>
                  עדיין אין פוסטים עם נתוני ביצועים בטווח הזה
                </p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, padding: '20px 16px 0' }}>
                  {timeline.map((bucket, i) => {
                    const h = bucket.engagement / maxTimeline * 140
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>
                          {bucket.engagement || ''}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            height: Math.max(2, h),
                            background: bucket.engagement
                              ? 'linear-gradient(180deg, var(--green-mid), var(--green-dark))'
                              : 'var(--border)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          title={`${bucket.posts} פוסטים · ${bucket.engagement} מעורבות`}
                        />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bucket.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* By Platform */}
            <Section title="ביצועים לפי פלטפורמה" icon={Award}>
              {byPlatform.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: 24 }}>אין נתונים</p>
              ) : (
                <div style={{ padding: '8px 16px 16px' }}>
                  {byPlatform.map(p => {
                    const max = Math.max(...byPlatform.map(x => x.avgEngagement), 1)
                    const pct = (p.avgEngagement / max) * 100
                    return (
                      <div key={p.platform} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                            {platformLabels[p.platform] || p.platform}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                            ❤️ {p.likes} · 💬 {p.comments} · {p.count} פוסטים
                          </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-page)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: PLATFORM_COLOR[p.platform] || 'var(--green-dark)',
                            transition: 'width 0.4s'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* By content type */}
            <Section title="ביצועים לפי סוג תוכן" icon={Award}>
              {byType.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: 24 }}>אין נתונים</p>
              ) : (
                <div style={{ padding: '8px 16px 16px' }}>
                  {byType.map(t => {
                    const max = Math.max(...byType.map(x => x.avgEngagement), 1)
                    const pct = (t.avgEngagement / max) * 100
                    return (
                      <div key={t.type} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                            {contentTypeLabels[t.type] || t.type}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                            מעורבות ממוצעת: {t.avgEngagement} · {t.count} פוסטים
                          </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-page)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: 'var(--earth)', transition: 'width 0.4s'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* Top 5 */}
            <Section title="5 הפוסטים המובילים" icon={Award}>
              {top5.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>
                    אין עדיין פוסטים עם נתוני ביצועים
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    עדכני לייקים ותגובות לפוסטים מהארכיון כדי לראות אילו מהם עובדים הכי טוב
                  </p>
                </div>
              ) : (
                <div>
                  {top5.map((p, i) => (
                    <div key={p.id} style={{
                      padding: 14,
                      borderBottom: i < top5.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex', gap: 12, alignItems: 'flex-start'
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--green-pale)', color: 'var(--green-dark)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, flexShrink: 0
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', marginBottom: 8
                        }}><span dir="auto">{p.content}</span></p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, color: 'var(--text-light)' }}>
                          <span>{platformLabels[p.platform] || p.platform}</span>
                          <span>·</span>
                          <span>❤️ {p.stats.likes || 0}</span>
                          <span>💬 {p.stats.comments || 0}</span>
                          <span>·</span>
                          <span>{formatDate(p.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* All posts — quick edit stats */}
            <Section title="ערכי לייקים ותגובות" icon={Edit2}>
              <div style={{ padding: 14, fontSize: 12, color: 'var(--text-light)', borderBottom: '1px solid var(--border)' }}>
                לחצי על "ערכי" ליד פוסט כדי להזין את הביצועים האמיתיים שלו. ה-AI ילמד מהפוסטים שעובדים לך הכי טוב.
              </div>
              {filtered.map(p => (
                <div key={p.id} style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}><span dir="auto">{p.content}</span></p>
                      <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                        {platformLabels[p.platform] || p.platform} · {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>

                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="scale-in">
                      <input
                        type="number" min="0" value={editLikes}
                        onChange={e => setEditLikes(e.target.value)}
                        placeholder="לייקים"
                        style={{ flex: 1, padding: 8, fontSize: 13, border: '1px solid var(--border)', borderRadius: 6 }}
                      />
                      <input
                        type="number" min="0" value={editComments}
                        onChange={e => setEditComments(e.target.value)}
                        placeholder="תגובות"
                        style={{ flex: 1, padding: 8, fontSize: 13, border: '1px solid var(--border)', borderRadius: 6 }}
                      />
                      <button onClick={() => saveEdit(p.id)} className="btn-primary" style={{ padding: '8px 12px', fontSize: 12 }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>
                        ❤️ {p.stats?.likes || 0} · 💬 {p.stats?.comments || 0}
                      </span>
                      <button onClick={() => startEdit(p)} style={{
                        fontSize: 12, color: 'var(--green-dark)', fontWeight: 600,
                        padding: '6px 12px', borderRadius: 6, background: 'var(--green-pale)',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <Edit2 size={12} /> ערכי
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      padding: 16
    }} className="hover-lift">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon size={15} color={color} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{value}</p>
      {subtitle && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      marginBottom: 16, overflow: 'hidden'
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'rgba(74, 92, 66, 0.02)',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <Icon size={16} color="var(--green-dark)" />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
