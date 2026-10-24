/**
 * Global theme controller — the ONE theme state for the whole app
 * (task AGRILINK-FAQ-GLOBAL-THEME-001).
 *
 * Architecture:
 * • mounted by <App /> at the application root, so the theme survives every
 *   route change, dashboard switch and modal ("no duplicate theme systems"
 *   in individual pages).
 * • 'light' | 'dark' maps to Tailwind's `darkMode: 'class'` — the provider
 *   toggles `.dark` on <html> and stamps `style.colorScheme` so native
 *   inputs, dropdowns and scrollbars follow the theme.
 * • preference persists in localStorage (`agrilink_theme`, non-sensitive).
 *   When nothing is saved the OS color-scheme preference stays in charge
 *   and live-changes follow it; an explicit user choice always wins.
 * • browser/index storage failures degrade to session-only state.
 * • frontend/index.html runs a tiny pre-paint boot script with the same
 *   key, so a saved dark preference is applied before the first paint (no
 *   flash of the wrong theme).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const THEME_STORAGE_KEY = 'agrilink_theme'
const SCHEME_QUERY = '(prefers-color-scheme: dark)'

const readStoredTheme = () => {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    /* storage unavailable / blocked — session-only fallback */
    return null
  }
}

const systemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  try {
    return window.matchMedia(SCHEME_QUERY).matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/* Idempotent DOM write — safe to call from the boot script, the provider
   and before/after route changes. Also mirrors the theme into the mobile
   browser chrome color when the meta tag exists. */
const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  try {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#121814' : '#2E7D32')
  } catch {
    /* non-DOM environments (older jsdom) — cosmetic only */
  }
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  /* Initial value: the saved preference, else the OS preference. Applied
     synchronously so SSR-less mounts never paint an unstyled frame. */
  const [theme, setTheme] = useState(() => {
    const initial = readStoredTheme() ?? systemTheme()
    applyTheme(initial)
    return initial
  })

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    /* persist the EXPLICIT user choice only — the derived system default is
       deliberately not stored, so the app keeps following the OS until the
       user actually picks a side ("keep my explicit selection" semantics) */
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, [theme])

  /* Apply on every change (toggle, OS-follow). Single DOM write path. */
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  /* While the user has NOT made an explicit choice, follow the OS live. */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    let mq
    try {
      mq = window.matchMedia(SCHEME_QUERY)
    } catch {
      return undefined
    }
    if (!mq?.addEventListener) return undefined
    const onChange = (e) => {
      if (!readStoredTheme()) setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider> (mounted at the App root).')
  return ctx
}
