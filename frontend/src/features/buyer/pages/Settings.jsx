/**
 * Settings — intentional "not available yet" page (spec phase 2: honest
 * placeholders for unfinished routes). Reuses the farmer dashboard's
 * NotYet presentation; no fake preference toggles.
 */
import { Settings as SettingsIcon } from 'lucide-react'
import NotYet from '../../farmer/pages/NotYet'

export default function Settings() {
  return (
    <NotYet icon={SettingsIcon} title="Settings are not available yet.">
      Account and notification preferences will be available in a later
      stage — nothing is simulated here.
    </NotYet>
  )
}
