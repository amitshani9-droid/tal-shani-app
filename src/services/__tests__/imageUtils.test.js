import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { overlayLogo } from '../imageUtils'

// ── Canvas + Image mock helpers ───────────────────────────────────────────────

const FAKE_RESULT = 'data:image/png;base64,COMPOSITED'
const FAKE_INPUT  = 'data:image/png;base64,ORIGINAL'

function makeCtxMock() {
  return {
    drawImage:          vi.fn(),
    beginPath:          vi.fn(),
    moveTo:             vi.fn(),
    lineTo:             vi.fn(),
    quadraticCurveTo:   vi.fn(),
    closePath:          vi.fn(),
    fill:               vi.fn(),
    fillStyle:          '',
    shadowColor:        '',
    shadowBlur:         0,
    shadowOffsetY:      0,
  }
}

function setupCanvasMock({ ctxOverride, toDataUrlOverride } = {}) {
  const ctx = ctxOverride !== undefined ? ctxOverride : makeCtxMock()
  const canvasMock = {
    width: 0, height: 0,
    getContext: vi.fn(() => ctx),
    toDataURL: toDataUrlOverride ?? vi.fn(() => FAKE_RESULT),
  }
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'canvas') return canvasMock
    // Fall through for any other tag
    return Object.getPrototypeOf(document).createElement.call(document, tag)
  })
  return { ctx, canvasMock }
}

// Mock the global Image class so src assignment immediately triggers onload/onerror
function setupImageMocks({ mainFails = false, logoFails = false } = {}) {
  let callCount = 0
  const OriginalImage = global.Image

  global.Image = class {
    constructor() {
      this.onload = null
      this.onerror = null
      this.crossOrigin = null
      this._callIndex = callCount++
      this.width = 100
      this.height = 100
    }
    set src(v) {
      this._src = v
      const shouldFail = this._callIndex === 0 ? mainFails : logoFails
      Promise.resolve().then(() => shouldFail ? this.onerror?.() : this.onload?.())
    }
    get src() { return this._src }
  }

  return () => { global.Image = OriginalImage }
}

beforeEach(() => { vi.restoreAllMocks() })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('overlayLogo', () => {
  it('resolves with a composited data URI when both images load successfully', async () => {
    const restore = setupImageMocks()
    setupCanvasMock()
    const result = await overlayLogo(FAKE_INPUT)
    expect(result).toBe(FAKE_RESULT)
    restore()
  })

  it('resolves with the original URL when the logo fails to load', async () => {
    const restore = setupImageMocks({ logoFails: true })
    setupCanvasMock()
    const result = await overlayLogo(FAKE_INPUT)
    expect(result).toBe(FAKE_INPUT)
    restore()
  })

  it('rejects when the main image fails to load', async () => {
    const restore = setupImageMocks({ mainFails: true })
    setupCanvasMock()
    await expect(overlayLogo(FAKE_INPUT)).rejects.toThrow('Failed to load image')
    restore()
  })

  it('rejects when canvas 2D context is unavailable', async () => {
    const restore = setupImageMocks()
    setupCanvasMock({ ctxOverride: null })
    await expect(overlayLogo(FAKE_INPUT)).rejects.toThrow()
    restore()
  })

  it('resolves with original URL when canvas.toDataURL throws SecurityError', async () => {
    const restore = setupImageMocks()
    setupCanvasMock({
      toDataUrlOverride: vi.fn(() => { throw new DOMException('Tainted canvas', 'SecurityError') })
    })
    const result = await overlayLogo(FAKE_INPUT)
    expect(result).toBe(FAKE_INPUT)
    restore()
  })

  it('draws the main image onto the canvas', async () => {
    const restore = setupImageMocks()
    const { ctx } = setupCanvasMock()
    await overlayLogo(FAKE_INPUT)
    expect(ctx.drawImage).toHaveBeenCalledTimes(2) // once for main img, once for logo
    restore()
  })

  it('sets crossOrigin on the logo image element', async () => {
    const restore = setupImageMocks()
    setupCanvasMock()
    // Track crossOrigin assignment
    const instances = []
    const OrigImage = global.Image
    global.Image = class extends OrigImage {
      constructor() { super(); instances.push(this) }
    }
    await overlayLogo(FAKE_INPUT)
    // Second image created is the logo
    const logoImg = instances[1]
    expect(logoImg?.crossOrigin).toBe('anonymous')
    restore()
  })

  it('resolves with the original URL when logo load stalls past 8 s timeout', async () => {
    vi.useFakeTimers()
    const OriginalImage = global.Image
    let callCount = 0
    global.Image = class {
      constructor() {
        this.onload = null; this.onerror = null; this.crossOrigin = null
        this._callIndex = callCount++
        this.width = 100; this.height = 100
      }
      set src(v) {
        this._src = v
        if (this._callIndex === 0) {
          // Main image fires onload immediately
          Promise.resolve().then(() => this.onload?.())
        }
        // Logo (index 1) never fires — simulates a network stall
      }
      get src() { return this._src }
    }
    setupCanvasMock()

    const promise = overlayLogo(FAKE_INPUT)
    // Flush microtasks: main image loads, canvas is drawn, logo timeout is registered
    await Promise.resolve()
    await Promise.resolve()
    // Advance past the 8-second timeout
    vi.advanceTimersByTime(8001)
    await Promise.resolve()

    const result = await promise
    expect(result).toBe(FAKE_INPUT)

    global.Image = OriginalImage
    vi.useRealTimers()
  })
})
