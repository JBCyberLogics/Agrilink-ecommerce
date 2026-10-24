/**
 * ThemeToggle — the shared light/dark switch used by the public navbar,
 * the mobile menu, and both authenticated dashboard headers (Farmer +
 * Buyer). One button, one state, straight from the app-level ThemeProvider.
 *
 * Accessibility: real <button>, Enter/Space native activation, visible
 * :focus-visible ring (global), accessible name that describes the ACTION
 * ("Switch to light/dark mode"), `title` tooltip, and `aria-pressed`
 * exposing the current state (true = dark mode active).
 */
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme'

export default function ThemeToggle({ className = '', size = 17 }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  const actionLabel = dark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={actionLabel}
      aria-label={actionLabel}
      aria-pressed={dark}
      className={`group grid place-items-center rounded-xl text-muted transition-colors hover:bg-soft hover:text-ink ${className}`}
    >
      {/* dark mode shows the sun (where you'd switch to); light shows the moon */}
      {dark ? (
        <Sun size={size} aria-hidden="true" className="text-brand-amber" />
      ) : (
        <Moon size={size} aria-hidden="true" />
      )}
    </button>
  )
}
