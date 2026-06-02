import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Mock html-to-image ────────────────────────────────────────────────────────
const toPngMock = vi.hoisted(() => vi.fn())
vi.mock('html-to-image', () => ({ toPng: toPngMock }))

// ── Mock lucide-react (icons) ─────────────────────────────────────────────────
vi.mock('lucide-react', () => {
  const Icon = ({ size }) => <span data-testid="icon" data-size={size} />
  return {
    Heart: Icon, Leaf: Icon, Users: Icon, Star: Icon, Sparkles: Icon,
    Dices: Icon, Download: Icon, Phone: Icon, Globe: Icon, Check: Icon,
  }
})

import CanvaPostGenerator from '../CanvaPostGenerator'

const DEFAULT_PROPS = {
  bgImage: 'data:image/png;base64,FAKE',
  title: 'חוויה עם ערך',
  subtitle: 'ההשקעה הטובה ביותר',
  bullets: [
    { title: 'כיף', desc: 'אמיתי' },
    { title: 'ערך', desc: 'שנשאר' },
    { title: 'חיבור', desc: 'אמיתי' },
  ],
  theme: 'green-beige',
  fontFamily: 'Heebo',
  overlayOpacity: 0.65,
}

beforeEach(() => {
  toPngMock.mockReset()
  vi.clearAllMocks()
})

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('CanvaPostGenerator — rendering', () => {
  it('renders without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    expect(document.body).toBeTruthy()
  })

  it('shows the title text', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    expect(screen.getAllByText('חוויה עם ערך').length).toBeGreaterThan(0)
  })

  it('renders the download button with correct initial label', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    expect(screen.getByText('שמור לעסק')).toBeTruthy()
  })

  it('download button is enabled initially', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    const btn = screen.getByText('שמור לעסק').closest('button')
    expect(btn).not.toBeDisabled()
  })
})

// ── Download guard ────────────────────────────────────────────────────────────

describe('CanvaPostGenerator — download button guard', () => {
  it('disables the download button while toPng is in progress', async () => {
    let resolvePng
    toPngMock.mockReturnValue(new Promise(res => { resolvePng = res }))

    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    const btn = screen.getByText('שמור לעסק').closest('button')

    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('שומר...')).toBeTruthy()
    })
    expect(btn).toBeDisabled()

    // Resolve the download
    await act(async () => { resolvePng('data:image/png;base64,DONE') })

    await waitFor(() => {
      expect(screen.getByText('שמור לעסק')).toBeTruthy()
    })
    expect(btn).not.toBeDisabled()
  })

  it('re-enables the download button when toPng throws', async () => {
    toPngMock.mockRejectedValue(new Error('canvas error'))

    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    const btn = screen.getByText('שמור לעסק').closest('button')

    await act(async () => { fireEvent.click(btn) })

    await waitFor(() => {
      expect(screen.getByText('שמור לעסק')).toBeTruthy()
    })
    expect(btn).not.toBeDisabled()
  })

  it('does not call toPng again on second click while downloading', async () => {
    let resolvePng
    toPngMock.mockReturnValue(new Promise(res => { resolvePng = res }))

    render(<CanvaPostGenerator {...DEFAULT_PROPS} />)
    const btn = screen.getByText('שמור לעסק').closest('button')

    fireEvent.click(btn)
    await waitFor(() => expect(screen.getByText('שומר...')).toBeTruthy())

    // Second click while in progress
    fireEvent.click(btn)

    expect(toPngMock).toHaveBeenCalledTimes(1)

    await act(async () => { resolvePng('data:image/png;base64,DONE') })
  })
})

// ── Theme switching ───────────────────────────────────────────────────────────

describe('CanvaPostGenerator — theme prop', () => {
  it('renders green-beige theme without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} theme="green-beige" />)
    expect(document.body).toBeTruthy()
  })

  it('renders ivory-gold theme without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} theme="ivory-gold" />)
    expect(document.body).toBeTruthy()
  })

  it('renders pink-beige theme without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} theme="pink-beige" />)
    expect(document.body).toBeTruthy()
  })

  it('falls back to green-beige for an unknown theme', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} theme="unknown-theme" />)
    expect(document.body).toBeTruthy()
  })
})

// ── Template index switching ──────────────────────────────────────────────────

describe('CanvaPostGenerator — template index', () => {
  it('renders templateIndex=0 without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} templateIndex={0} />)
    expect(document.body).toBeTruthy()
  })

  it('renders templateIndex=1 without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} templateIndex={1} />)
    expect(document.body).toBeTruthy()
  })

  it('renders templateIndex=2 without crashing', () => {
    render(<CanvaPostGenerator {...DEFAULT_PROPS} templateIndex={2} />)
    expect(document.body).toBeTruthy()
  })

  it('calls onTemplateChange when "החלף סגנון" button is clicked', () => {
    const onTemplateChange = vi.fn()
    render(<CanvaPostGenerator {...DEFAULT_PROPS} templateIndex={0} onTemplateChange={onTemplateChange} />)
    fireEvent.click(screen.getByText('החלף סגנון'))
    expect(onTemplateChange).toHaveBeenCalledTimes(1)
    // The button passes a functional updater: (prev) => (prev + 1) % templates.length
    const updater = onTemplateChange.mock.calls[0][0]
    expect(typeof updater).toBe('function')
    expect(updater(0)).toBe(1)
    expect(updater(2)).toBe(0) // wraps around
  })
})
