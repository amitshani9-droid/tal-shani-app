import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getApiKey,
  setApiKey,
  generatePost,
  regeneratePost,
  generateResearch,
  generateWeeklyPlan,
  generatePostImage,
  generateImageContent,
  generateSalesPostContent,
  generateWhatsAppMessage,
  generateCampaign,
} from '../openai'

// ── helpers ──────────────────────────────────────────────
function mockGPTResponse(content) {
  return {
    ok: true,
    json: () => Promise.resolve({
      choices: [{ message: { content, refusal: null } }]
    })
  }
}

function mockGPTError(message, status = 400) {
  return {
    ok: false,
    json: () => Promise.resolve({ error: { message } })
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

// ── API Key ───────────────────────────────────────────────
describe('getApiKey / setApiKey', () => {
  it('returns empty string when no key stored', () => {
    expect(getApiKey()).toBe('')
  })

  it('stores and retrieves a key', () => {
    setApiKey('sk-test-abc')
    expect(getApiKey()).toBe('sk-test-abc')
  })
})

// ── generatePost ──────────────────────────────────────────
describe('generatePost', () => {
  it('throws when API key is missing', async () => {
    await expect(generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' }))
      .rejects.toThrow('חסר API Key')
  })

  it('returns the generated post text', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('פוסט מעולה'))
    const result = await generatePost({ brief: 'גיבוש', platform: 'instagram', contentType: 'tip' })
    expect(result).toBe('פוסט מעולה')
  })

  it('throws with the API error message on failure', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTError('Invalid API key'))
    await expect(generatePost({ brief: 'test', platform: 'facebook', contentType: 'sale' }))
      .rejects.toThrow('Invalid API key')
  })

  it('passes contentType label into the prompt', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse('ok'))
    })
    await generatePost({ brief: 'test', platform: 'linkedin', contentType: 'casestudy' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('סיפור הצלחה')
  })
})

// ── regeneratePost ───────────────────────────────────────
describe('regeneratePost', () => {
  it('throws when API key is missing', async () => {
    await expect(regeneratePost({ existingPost: 'post', instruction: 'shorter' }))
      .rejects.toThrow('חסר API Key')
  })

  it('returns rewritten post text', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('פוסט קצר'))
    const result = await regeneratePost({ existingPost: 'original', instruction: 'make shorter' })
    expect(result).toBe('פוסט קצר')
  })
})

// ── generateResearch ──────────────────────────────────────
describe('generateResearch', () => {
  it('throws when API key is missing', async () => {
    await expect(generateResearch()).rejects.toThrow('חסר API Key')
  })

  it('parses and returns valid JSON response', async () => {
    setApiKey('sk-test')
    const payload = { summary: 'שוק חם', hotTopics: [], weeklyIdeas: [], facebookGroups: [], bestTimes: 'ב-10 בבוקר', hashtags: [] }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateResearch()
    expect(result.summary).toBe('שוק חם')
  })

  it('strips markdown code fences before parsing', async () => {
    setApiKey('sk-test')
    const payload = { summary: 'טרנד', hotTopics: [], weeklyIdeas: [], facebookGroups: [], bestTimes: '', hashtags: [] }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(`\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``))
    const result = await generateResearch()
    expect(result.summary).toBe('טרנד')
  })

  it('throws a friendly Hebrew error on invalid JSON', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('not json at all'))
    await expect(generateResearch()).rejects.toThrow('שגיאה בניתוח')
  })
})

// ── generateWeeklyPlan ────────────────────────────────────
describe('generateWeeklyPlan', () => {
  it('throws when API key is missing', async () => {
    await expect(generateWeeklyPlan()).rejects.toThrow('חסר API Key')
  })

  it('parses and returns the posts array', async () => {
    setApiKey('sk-test')
    const payload = { posts: [{ day: 'ראשון', title: 'טיפ', platform: 'instagram', contentType: 'tip', hook: 'hook', brief: 'brief' }] }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateWeeklyPlan()
    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].day).toBe('ראשון')
  })

  it('throws a friendly Hebrew error on invalid JSON', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('{broken'))
    await expect(generateWeeklyPlan()).rejects.toThrow('שגיאה בניתוח')
  })
})

// ── generatePostImage ─────────────────────────────────────
describe('generatePostImage', () => {
  it('throws when API key is missing', async () => {
    await expect(generatePostImage('some post text')).rejects.toThrow('חסר API Key')
  })

  it('returns a URL when the response contains url', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ url: 'https://example.com/img.png' }] })
    })
    const result = await generatePostImage('post text')
    expect(result).toBe('https://example.com/img.png')
  })

  it('returns a data URI when the response contains b64_json', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ b64_json: 'AAAA' }] })
    })
    const result = await generatePostImage('post text')
    expect(result).toBe('data:image/png;base64,AAAA')
  })

  it('throws a friendly error when no image data is returned', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{}] })
    })
    await expect(generatePostImage('post text')).rejects.toThrow('לא התקבלה תמונה')
  })

  it('throws with the API error message on HTTP failure', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'quota exceeded' } })
    })
    await expect(generatePostImage('post text')).rejects.toThrow('quota exceeded')
  })
})

// ── generateImageContent ──────────────────────────────────
describe('generateImageContent', () => {
  it('throws when API key is missing', async () => {
    await expect(generateImageContent('post')).rejects.toThrow('חסר API Key')
  })

  it('parses and returns design data', async () => {
    setApiKey('sk-test')
    const payload = {
      title: 'גיבוש עם ערך',
      subtitle: 'חוויה ארגונית שמשאירה חותם',
      bullets: [
        { title: 'חיבור אמיתי', desc: 'צוות שנשאר ביחד' },
        { title: 'משמעות', desc: 'עשייה חברתית ביחד' },
        { title: 'זיכרון', desc: 'לא שוכחים את הרגע' }
      ]
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateImageContent('טקסט פוסט לדוגמה')
    expect(result.title).toBe('גיבוש עם ערך')
    expect(result.bullets).toHaveLength(3)
  })

  it('throws a friendly Hebrew error on invalid JSON response', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('not json'))
    await expect(generateImageContent('post')).rejects.toThrow('שגיאה בניתוח')
  })
})

// ── callGPT edge cases ────────────────────────────────────
describe('callGPT — edge cases', () => {
  it('throws a friendly error when the success-path response body is malformed JSON', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token'))
    })
    await expect(generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' }))
      .rejects.toThrow('שגיאה בקריאת תגובת השרת')
  })

  it('throws with the API error message on HTTP 401', async () => {
    setApiKey('sk-bad')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTError('Incorrect API key provided', 401))
    await expect(generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' }))
      .rejects.toThrow('Incorrect API key provided')
  })

  it('throws a generic Hebrew error when API error has no message', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, json: () => Promise.resolve({}) })
    await expect(generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' }))
      .rejects.toThrow('שגיאה בקריאה ל-GPT')
  })

  it('returns empty string when GPT returns null content', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: null, refusal: null } }] })
    })
    const result = await generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' })
    expect(result).toBe('')
  })

  it('throws when GPT refuses the request', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: null, refusal: 'Content policy violation' } }] })
    })
    await expect(generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' }))
      .rejects.toThrow('OpenAI request refused')
  })
})

// ── generatePost — token budget ───────────────────────────
describe('generatePost — token budget', () => {
  it('uses maxTokens 3000 when platform is "all"', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse('ok'))
    })
    await generatePost({ brief: 'test', platform: 'all', contentType: 'tip' })
    expect(capturedBody.max_tokens).toBe(3000)
  })

  it('uses maxTokens 1500 when platform is "instagram"', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse('ok'))
    })
    await generatePost({ brief: 'test', platform: 'instagram', contentType: 'tip' })
    expect(capturedBody.max_tokens).toBe(1500)
  })
})

// ── generateResearch — JSON stripping ────────────────────
describe('generateResearch — markdown fence stripping', () => {
  it('strips ```json fences before parsing', async () => {
    setApiKey('sk-test')
    const payload = { summary: 'ok', hotTopics: [], weeklyIdeas: [], facebookGroups: [], bestTimes: 'בוקר', hashtags: [] }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('```json\n' + JSON.stringify(payload) + '\n```'))
    const result = await generateResearch()
    expect(result.summary).toBe('ok')
  })
})

// ── generatePostImage — DALL-E request ───────────────────
describe('generatePostImage — DALL-E request', () => {
  it('sends model dall-e-3 in the DALL-E request', async () => {
    setApiKey('sk-test')
    let dalleBody
    vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(mockGPTResponse('a premium outdoor team scene')))
      .mockImplementationOnce((_url, opts) => {
        dalleBody = JSON.parse(opts.body)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ url: 'https://img.example.com/1.png' }] })
        })
      })
    await generatePostImage('יום גיבוש מוצלח')
    expect(dalleBody.model).toBe('dall-e-3')
    expect(dalleBody.response_format).toBeUndefined()
  })

  it('returns a data URI when response contains b64_json', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(mockGPTResponse('scene')))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [{ b64_json: 'BASE64DATA' }] })
      }))
    const result = await generatePostImage('test')
    expect(result).toBe('data:image/png;base64,BASE64DATA')
  })

  it('still works if inner GPT scene-description call fails (uses fallback prompt)', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.reject(new Error('network error')))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [{ b64_json: 'FALLBACK' }] })
      }))
    const result = await generatePostImage('פוסט כלשהו')
    expect(result).toBe('data:image/png;base64,FALLBACK')
  })
})

// ── generateImageContent — markdown fence stripping ───────
describe('generateImageContent — markdown fence stripping', () => {
  it('parses JSON wrapped in ```json fences', async () => {
    setApiKey('sk-test')
    const payload = {
      title: 'גיבוש', subtitle: 'ערך',
      bullets: [{ title: 'א', desc: 'ב' }],
      theme: 'green-beige', font: 'Heebo',
      templateIndex: '0', overlayOpacity: '0.65'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockGPTResponse('```json\n' + JSON.stringify(payload) + '\n```')
    )
    const result = await generateImageContent('פוסט לדוגמה')
    expect(result.title).toBe('גיבוש')
    expect(result.bullets).toHaveLength(1)
  })

  it('parses plain JSON without fences', async () => {
    setApiKey('sk-test')
    const payload = {
      title: 'חוויה', subtitle: 'עם ערך',
      bullets: [], theme: 'ivory-gold',
      font: 'Secular One', templateIndex: '1', overlayOpacity: '0.5'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateImageContent('פוסט אחר')
    expect(result.theme).toBe('ivory-gold')
  })

  it('throws friendly error on completely invalid JSON', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('```json\nNOT JSON\n```'))
    await expect(generateImageContent('פוסט')).rejects.toThrow('שגיאה בניתוח')
  })
})

// ── generateSalesPostContent ──────────────────────────────
describe('generateSalesPostContent', () => {
  it('throws when API key is missing', async () => {
    await expect(generateSalesPostContent({ brief: 'test' }))
      .rejects.toThrow('חסר API Key')
  })

  it('parses and returns structured content data', async () => {
    setApiKey('sk-test')
    const payload = {
      headline: 'חיבור אמיתי',
      personal_line: 'כי אנשים מחוברים עובדים טוב יותר',
      subheadline: 'בניית חוויות שמשאירות חותם',
      benefits: ['חיבור עמוק', 'תרבות ארגונית', 'זיכרון משותף'],
      services: ['ימי גיבוש', 'אירועי חברה', 'נופש חברה', 'כנסים'],
      image_description: 'Team members laughing together at golden hour in Israel'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateSalesPostContent({ brief: 'גיבוש' })
    expect(result.headline).toBe('חיבור אמיתי')
    expect(result.benefits).toHaveLength(3)
    expect(result.services).toHaveLength(4)
  })

  it('defaults to tip template when templateId is not provided', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse(JSON.stringify({ headline: '', personal_line: '', subheadline: '', benefits: [], services: [], image_description: '' })))
    })
    await generateSalesPostContent({ brief: 'test' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('טיפ מקצועי')
  })

  it('uses the correct template name for "promotion" templateId', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse(JSON.stringify({ headline: '', personal_line: '', subheadline: '', benefits: [], services: [], image_description: '' })))
    })
    await generateSalesPostContent({ brief: 'test', templateId: 'promotion' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('פוסט מכירה')
  })

  it('throws a friendly Hebrew error on invalid JSON response', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('not valid json'))
    await expect(generateSalesPostContent({ brief: 'test' })).rejects.toThrow('שגיאה בניתוח')
  })

  it('sends model gpt-4o in the request', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse(JSON.stringify({ headline: '', personal_line: '', subheadline: '', benefits: [], services: [], image_description: '' })))
    })
    await generateSalesPostContent({ brief: 'test', templateId: 'tip' })
    expect(capturedBody.model).toBe('gpt-4o')
    expect(capturedBody.response_format).toBeUndefined()
  })
})

// ── generateWhatsAppMessage ───────────────────────────────
describe('generateWhatsAppMessage', () => {
  it('throws when API key is missing', async () => {
    await expect(generateWhatsAppMessage({ type: 'intro' }))
      .rejects.toThrow('חסר API Key')
  })

  it('returns a WhatsApp message string', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('היי 🌿\n\nשמי טל שני, ואני עוסקת בחוויות ארגוניות עם ערך.\n\nשמחה להכיר!'))
    const result = await generateWhatsAppMessage({ type: 'intro' })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('uses the correct instruction for each message type', async () => {
    setApiKey('sk-test')
    const types = ['intro', 'followup', 'offer', 'thanks', 'reminder']
    for (const type of types) {
      let capturedBody
      vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
        capturedBody = JSON.parse(opts.body)
        return Promise.resolve(mockGPTResponse('הודעה'))
      })
      await generateWhatsAppMessage({ type })
      const userMsg = capturedBody.messages.find(m => m.role === 'user').content
      expect(typeof userMsg).toBe('string')
      expect(userMsg.length).toBeGreaterThan(0)
      vi.restoreAllMocks()
    }
  })

  it('includes the recipient name when provided', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse('הודעה'))
    })
    await generateWhatsAppMessage({ type: 'intro', recipientName: 'מיכל' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('מיכל')
  })

  it('includes additional context when provided', async () => {
    setApiKey('sk-test')
    let capturedBody
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse('הודעה'))
    })
    await generateWhatsAppMessage({ type: 'followup', context: 'פגשנו בכנס HR' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('פגשנו בכנס HR')
  })
})

// ── generateCampaign ──────────────────────────────────────
describe('generateCampaign', () => {
  it('throws when API key is missing', async () => {
    await expect(generateCampaign({ theme: 'גיבוש', audience: '', goal: '' }))
      .rejects.toThrow('חסר API Key')
  })

  it('parses and returns a full campaign object', async () => {
    setApiKey('sk-test')
    const payload = {
      campaignName: 'חיבור שמתחיל מהלב',
      bigIdea: 'גיבוש שמחזק את מה שכבר קיים',
      email: {
        subject: 'הצוות שלך ראוי ליותר מיום גיבוש רגיל',
        preheader: 'כי חיבור אמיתי מתחיל בהבנה',
        body: 'שלום,\n\nאני טל שני...',
        cta: 'בואי נדבר'
      },
      landingPage: {
        headline: 'חוויה ארגונית שמשאירה חותם',
        subheadline: 'לא יום גיבוש. חוויה שמחברת.',
        valuePoints: [
          { title: 'חיבור עמוק', desc: 'עובדים שמרגישים שייכים' },
          { title: 'תוצאות מדידות', desc: 'פחות תחלופה, יותר מחויבות' },
          { title: 'מותאם אישית', desc: 'כל חוויה בנויה עבורכם' }
        ],
        socialProof: 'עבדנו עם Intel, בנק הפועלים ועוד',
        primaryCta: 'בואי נדבר',
        secondaryCta: 'קראי עוד'
      },
      instagramPost: 'כשצוות מרגיש שייך...',
      whatsappTeaser: 'היי 🌿\n\nרציתי לשתף...'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse(JSON.stringify(payload)))
    const result = await generateCampaign({ theme: 'גיבוש', audience: 'HR', goal: 'פניות' })
    expect(result.campaignName).toBe('חיבור שמתחיל מהלב')
    expect(result.email.subject).toBeDefined()
    expect(result.landingPage.valuePoints).toHaveLength(3)
    expect(typeof result.instagramPost).toBe('string')
  })

  it('includes the theme in the user prompt', async () => {
    setApiKey('sk-test')
    let capturedBody
    const payload = { campaignName: '', bigIdea: '', email: { subject: '', preheader: '', body: '', cta: '' }, landingPage: { headline: '', subheadline: '', valuePoints: [], socialProof: '', primaryCta: '', secondaryCta: '' }, instagramPost: '', whatsappTeaser: '' }
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse(JSON.stringify(payload)))
    })
    await generateCampaign({ theme: 'בניית קהילה', audience: '', goal: '' })
    const userMsg = capturedBody.messages.find(m => m.role === 'user').content
    expect(userMsg).toContain('בניית קהילה')
  })

  it('throws a friendly Hebrew error on invalid JSON response', async () => {
    setApiKey('sk-test')
    vi.spyOn(global, 'fetch').mockResolvedValue(mockGPTResponse('not json'))
    await expect(generateCampaign({ theme: 'test', audience: '', goal: '' }))
      .rejects.toThrow('שגיאה בניתוח')
  })

  it('sends model gpt-4o in the request', async () => {
    setApiKey('sk-test')
    let capturedBody
    const payload = { campaignName: '', bigIdea: '', email: {}, landingPage: {}, instagramPost: '', whatsappTeaser: '' }
    vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve(mockGPTResponse(JSON.stringify(payload)))
    })
    await generateCampaign({ theme: 'test', audience: '', goal: '' })
    expect(capturedBody.model).toBe('gpt-4o')
    expect(capturedBody.response_format).toBeUndefined()
  })
})
