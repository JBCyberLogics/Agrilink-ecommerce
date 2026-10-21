/** @type {import('tailwindcss').Config} */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Content globs are resolved against the process CWD (not this file's
// directory), and npm scripts run from the repo root one level above this
// frontend project. Absolute config-relative paths keep the source scan
// correct from any CWD.
const base = path.dirname(fileURLToPath(import.meta.url))

/* ---------------------------------------------------------------- theme
   Light/dark support (task AGRILINK-FAQ-GLOBAL-THEME-001):
   • darkMode: 'class' — the shared ThemeProvider toggles `.dark` on <html>
     (like the FAQ/theme tests assert); no page implements its own state.
   • Every theme-sensitive color is a CSS variable (styles/index.css) fed
     through rgb-triplet tokens so alpha variants (e.g. bg-paper/75) work.
     Light values below are byte-identical to the palette this app shipped
     with — toggling to dark only swaps the variable values.
   • Button/overlay brand backgrounds (primary DEFAULT, farmer primary…)
     stay constant hexes — white-on-green works in both modes. Text-brand
     shades (brand, farmer.brand…) are variable-driven so they stay
     readable on dark surfaces. */
export default {
  darkMode: 'class',
  content: [
    path.join(base, 'index.html'),
    path.join(base, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // Brand: Nature Green
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#43A047',
          soft: 'rgb(var(--ag-brand-soft) / <alpha-value>)',
        },
        // Brand: Warm Amber
        secondary: {
          DEFAULT: '#FFA000',
          dark: '#C77800',
          soft: 'rgb(var(--ag-brand-amber-soft) / <alpha-value>)',
        },
        // theme-aware palette (maps the hardcoded light-only shades:
        // bg-white, neutral steps, red/green/blue state washes)
        paper: 'rgb(var(--ag-paper) / <alpha-value>)',
        'paper-soft': 'rgb(var(--ag-paper-soft) / <alpha-value>)',
        soft: 'rgb(var(--ag-soft) / <alpha-value>)',
        'soft-strong': 'rgb(var(--ag-soft-strong) / <alpha-value>)',
        line: 'rgb(var(--ag-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--ag-line-strong) / <alpha-value>)',
        ink: 'rgb(var(--ag-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ag-ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--ag-ink-3) / <alpha-value>)',
        'ink-4': 'rgb(var(--ag-ink-4) / <alpha-value>)',
        muted: 'rgb(var(--ag-muted) / <alpha-value>)',
        'muted-2': 'rgb(var(--ag-muted-2) / <alpha-value>)',
        faint: 'rgb(var(--ag-faint) / <alpha-value>)',
        // text-safe brand shades (dark variants are lightened greens/ambers)
        brand: 'rgb(var(--ag-brand) / <alpha-value>)',
        'brand-deep': 'rgb(var(--ag-brand-deep) / <alpha-value>)',
        'brand-amber': 'rgb(var(--ag-brand-amber) / <alpha-value>)',
        'brand-amber-deep': 'rgb(var(--ag-brand-amber-deep) / <alpha-value>)',
        // state washes (alerts, banners, error/success chips)
        danger: 'rgb(var(--ag-danger) / <alpha-value>)',
        'danger-wash': 'rgb(var(--ag-danger-wash) / <alpha-value>)',
        'danger-line': 'rgb(var(--ag-danger-line) / <alpha-value>)',
        ok: 'rgb(var(--ag-ok) / <alpha-value>)',
        'ok-strong': 'rgb(var(--ag-ok-strong) / <alpha-value>)',
        'ok-wash': 'rgb(var(--ag-ok-wash) / <alpha-value>)',
        'ok-line': 'rgb(var(--ag-ok-line) / <alpha-value>)',
        info: 'rgb(var(--ag-info) / <alpha-value>)',
        'info-wash': 'rgb(var(--ag-info-wash) / <alpha-value>)',
        // Farmer dashboard palette (AGRILINK-FE-FARMER-001 design system) —
        // scoped to the dashboards; both the farmer and buyer shells share this
        // design system (the buyer spec's tokens are these exact values), while
        // the marketplace keeps the brand tokens above.
        farmer: {
          primary: '#17633D',
          'primary-hover': '#124D30',
          /* text-facing green (headings, active nav, links) */
          brand: 'rgb(var(--ag-fbrand) / <alpha-value>)',
          surface: 'rgb(var(--ag-fsurface) / <alpha-value>)',
          page: 'rgb(var(--ag-fpage) / <alpha-value>)',
          ink: 'rgb(var(--ag-fink) / <alpha-value>)',
          muted: 'rgb(var(--ag-fmuted) / <alpha-value>)',
          line: 'rgb(var(--ag-fline) / <alpha-value>)',
          success: 'rgb(var(--ag-fsuccess) / <alpha-value>)',
          warning: 'rgb(var(--ag-fwarning) / <alpha-value>)',
          danger: 'rgb(var(--ag-fdanger) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px -4px rgb(15 40 20 / 0.08)',
        lift: '0 16px 40px -12px rgb(46 125 50 / 0.28)',
        glass: '0 8px 32px 0 rgb(31 38 135 / 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '70%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        pop: 'pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.4) both',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
