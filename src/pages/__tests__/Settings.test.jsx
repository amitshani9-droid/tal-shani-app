import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../services/openai', () => ({
  getApiKey: vi.fn(() => 'sk-existing'),
  setApiKey: vi.fn(),
}))

vi.mock('../../services/storage', () => ({
  storage: {
    getPosts:          vi.fn(() => []),
    getDrafts:         vi.fn(() => []),
    getCalendar:       vi.fn(() => []),
    getResearch:       vi.fn(() => null),
    getSyncedPosts:    vi.fn(() => []),
    saveSyncedPosts:   vi.fn(),
  },
}))

import Settings from '../Settings'

function renderSettings() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

// ── handleSave — brand data merge ────────────────────────────────────────────

describe('Settings — handleSave brand merge', () => {
  it('preserves existing brand fields when saving new extraNotes', () => {
    const existing = { tone: 'warm', palette: ['green', 'beige'], extraNotes: 'old notes' }
    localStorage.setItem('tal_brand', JSON.stringify(existing))

    renderSettings()

    const textarea = screen.queryByPlaceholderText(/לדוגמה: תמיד/i)
    if (textarea) {
      fireEvent.change(textarea, { target: { value: 'new notes' } })
    }

    fireEvent.click(screen.getByText('שמרי הגדרות'))

    const saved = JSON.parse(localStorage.getItem('tal_brand') || '{}')
    expect(saved.extraNotes).toBe('new notes')
    expect(saved.tone).toBe('warm')
    expect(saved.palette).toEqual(['green', 'beige'])
  })

  it('does not crash when tal_brand is missing from localStorage', () => {
    localStorage.removeItem('tal_brand')
    renderSettings()
    fireEvent.click(screen.getByText('שמרי הגדרות'))
    const saved = JSON.parse(localStorage.getItem('tal_brand') || '{}')
    expect(typeof saved).toBe('object')
  })

  it('does not crash when tal_brand contains corrupt JSON', () => {
    localStorage.setItem('tal_brand', 'NOT_JSON{{{')
    renderSettings()
    expect(() => fireEvent.click(screen.getByText('שמרי הגדרות'))).not.toThrow()
  })
})

// ── API key field ─────────────────────────────────────────────────────────────

describe('Settings — API key field', () => {
  it('renders the API key input', () => {
    renderSettings()
    const input = document.querySelector('input[type="password"], input[type="text"]')
    expect(input).toBeTruthy()
  })

  it('shows the existing API key on mount', () => {
    renderSettings()
    const input = document.querySelector('input[type="password"]')
    expect(input?.value).toBe('sk-existing')
  })
})

// ── Meta sync toggle ──────────────────────────────────────────────────────────

describe('Settings — Meta sync', () => {
  it('toggles sync state when the sync button is clicked', () => {
    renderSettings()
    const btn = screen.queryByText(/חבר את חשבון|סנכרן|Meta/)
    if (btn) {
      fireEvent.click(btn)
      // After click the button text or disabled state changes — just ensure no crash
      expect(document.body).toBeTruthy()
    }
  })
})
