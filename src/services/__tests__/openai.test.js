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

// ── generatePostImage — b64_json response format ──────────
describe('generatePostImage — b64_json request', () => {
  it('sends response_format: b64_json in the DALL-E request', async () => {
    setApiKey('sk-test')
    let dalleBody
    vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(mockGPTResponse('a premium outdoor team scene')))
      .mockImplementationOnce((_url, opts) => {
        dalleBody = JSON.parse(opts.body)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ b64_json: 'AAAA' }] })
        })
      })
    await generatePostImage('יום גיבוש מוצלח')
    expect(dalleBody.response_format).toBe('b64_json')
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
