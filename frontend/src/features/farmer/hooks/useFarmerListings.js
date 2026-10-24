/**
 * Shared data hook for the farmer's listings (real /api/farmer/listings).
 * Exposes loading / success / error states plus a refresh trigger, and
 * guards against state updates after unmount.
 */
import { useEffect, useState } from 'react'
import { farmerListings } from '../services/farmerService'

export default function useFarmerListings() {
  const [state, setState] = useState({ status: 'loading', listings: [], error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    farmerListings()
      .then((d) => {
        if (alive) setState({ status: 'ok', listings: d.listings ?? [], error: null })
      })
      .catch((e) => {
        if (alive)
          setState({ status: 'error', listings: [], error: e?.error || 'Could not load your listings.' })
      })
    return () => {
      alive = false
    }
  }, [tick])

  return { ...state, refresh: () => setTick((t) => t + 1) }
}
