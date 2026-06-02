/**
 * Firebase Cloud Function — Google Trends לישראל
 * ================================================
 * מושך נתוני טרנדים אמיתיים מ-Google Trends (geo=IL) ומחזיר JSON.
 * האפליקציה קוראת לכתובת הזו (מוגדרת במסך ההגדרות) לפני שהיא שולחת ל-GPT.
 *
 * פריסה:
 *   1. cd functions
 *   2. npm install firebase-functions firebase-admin google-trends-api cors
 *   3. firebase deploy --only functions:trends
 *
 * עלות: חינם לחלוטין ב-Spark plan עבור הנפח של טל.
 */

const functions = require('firebase-functions')
const googleTrends = require('google-trends-api')
const cors = require('cors')({ origin: true })

// מילות מפתח רלוונטיות לתחום של טל
const KEYWORDS = [
  'ימי גיבוש',
  'גיבוש עובדים',
  'אירועי חברה',
  'הפעלות לעובדים',
  'יום כיף לעובדים'
]

exports.trends = functions
  .region('europe-west1') // שרת קרוב לישראל
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        const results = {}

        // 1. עניין לאורך זמן עבור כל מילת מפתח (3 חודשים אחרונים)
        for (const kw of KEYWORDS) {
          try {
            const raw = await googleTrends.interestOverTime({
              keyword: kw,
              geo: 'IL',
              startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            })
            const parsed = JSON.parse(raw)
            const timeline = parsed.default?.timelineData || []
            const values = timeline.map(t => t.value?.[0] || 0)
            const recent = values.slice(-4)
            const earlier = values.slice(0, 4)
            const avgRecent = avg(recent)
            const avgEarlier = avg(earlier)
            results[kw] = {
              currentInterest: values[values.length - 1] || 0,
              trend: avgRecent > avgEarlier ? 'עולה' : avgRecent < avgEarlier ? 'יורד' : 'יציב',
              peakValue: Math.max(...values, 0)
            }
          } catch (e) {
            results[kw] = { error: 'לא נמצאו נתונים' }
          }
        }

        // 2. שאילתות קשורות שעולות (למילת המפתח הראשית)
        let relatedQueries = []
        try {
          const raw = await googleTrends.relatedQueries({
            keyword: 'ימי גיבוש',
            geo: 'IL'
          })
          const parsed = JSON.parse(raw)
          const rising = parsed.default?.rankedList?.[1]?.rankedKeyword || []
          relatedQueries = rising.slice(0, 8).map(q => q.query)
        } catch (e) { /* ignore */ }

        res.set('Cache-Control', 'public, max-age=21600') // קאש ל-6 שעות
        res.json({
          source: 'Google Trends (IL)',
          fetchedAt: new Date().toISOString(),
          keywords: results,
          risingQueries: relatedQueries
        })
      } catch (err) {
        res.status(500).json({ error: err.message })
      }
    })
  })

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
