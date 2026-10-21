/**
 * OrbitingBadges — purely decorative ornament for the authentication
 * experience (AGRILINK-AUTH-UI-REVAMP-001).
 *
 * • Four small translucent badges (Farmers / Buyers / Marketplace /
 *   AI Insights) slowly travel an ellipse centred on the authentication
 *   card — "orbiting tech + agriculture" accents, not any live indicator
 *   (they carry no user or system data; they are entirely fake content
 *   and aria-hidden).
 * • Motion: CSS custom property (--orbit) interpolated from 0deg→360deg
 *   with @property, consumed as cos()/sin() inside the transform — so the
 *   only animated properties are custom-prop interpolation + transform;
 *   tokens stay upright (translate-only, no rotation) and the browser
 *   composites on the GPU.
 * • Staggered timing: one shared slow cycle (~32s) with negative phase
 *   delays so the badges never bunch up.
 * • Layering: rendered BEFORE the card (lower paint order), so even when
 *   the viewport squeezes the radius, badges glide UNDER the frosted card
 *   and can never cover inputs or buttons.
 * • Interaction: pointer-events-none on the whole layer — decorative
 *   badges never block the form.
 * • Overflow: every badge is translation-only inside an overflow-hidden
 *   clip layer — the animation cannot create scrollbars.
 * • Reduced motion: @media (prefers-reduced-motion: reduce) stops the
 *   cycle; badges keep their phase positions as a static ring.
 * • Theming: glass tokens from the app's shared theme (bg-paper/border
 *   white hairlines keep the glass aesthetic; text tokens flip with the
 *   theme) — no auth-local theme state.
 */
import { Sprout, Users, Store, BrainCircuit } from 'lucide-react'

const BADGES = [
  { label: 'Farmers', icon: Sprout },
  { label: 'Buyers', icon: Users },
  { label: 'Marketplace', icon: Store },
  { label: 'AI Insights', icon: BrainCircuit },
]

/* one shared slow cycle, evenly staggered; badges at 90° phases so the
   ring reads balanced, with 12s between neighbours (32s / 4) */
const DELAYS = ['-0s', '-8s', '-16s', '-24s']

export default function OrbitingBadges() {
  return (
    <div
      aria-hidden="true"
      className="auth-orbit pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {BADGES.map((badge, i) => (
        <span
          key={badge.label}
          className={`auth-orbit-dot ${
            /* smaller orbit footprint on phones: only even badges shown */
            i % 2 === 0 ? 'flex' : 'hidden md:flex'
          } items-center gap-1.5 rounded-full border border-white/60 bg-paper/60 px-2.5 py-1 text-[11px] font-semibold text-ink-3 shadow-[0_0_20px_rgba(46,125,50,0.28)] opacity-90 backdrop-blur-md`}
          style={{
            '--phase': `${i * 90 + 15}deg`,
            '--orbit-delay': DELAYS[i],
          }}
        >
          <badge.icon size={13} aria-hidden="true" className="text-brand" />
          {badge.label}
        </span>
      ))}
    </div>
  )
}
