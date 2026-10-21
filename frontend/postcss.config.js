import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Tailwind resolves its config relative to the process CWD, not the CSS file
// or this config's directory — pin it to the tailwind config that lives next
// to this file so the build works from any CWD (root scripts run from the
// repo root, one level above this frontend project).
const tailwindConfig = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'tailwind.config.js',
)

export default {
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
}
