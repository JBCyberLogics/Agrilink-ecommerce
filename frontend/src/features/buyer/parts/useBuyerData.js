/**
 * Shared data hooks mirroring the farmer dashboard's useFarmerListings
 * pattern: loading / ok / error states, refresh triggers, guarded against
 * state updates after unmount. All buyer data comes from the real API —
 * market feed (public), saved produce and purchase requests (buyer-only).
 */
import { useEffect, useState } from 'react'
import { marketListings, buyerSaved, buyerRequests } from '../../../api/endpoints'

export function useMarketFeed() {
  const [state, setState] = useState({ status: 'loading', listings: [], error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    marketListings()
      .then((d) => alive && setState({ status: 'ok', listings: d.listings ?? [], error: null }))
      .catch((e) => alive && setState({ status: 'error', listings: [], error: e?.error || 'Could not load the market.' }))
    return () => {
      alive = false
    }
  }, [tick])

  return { ...state, refresh: () => setTick((t) => t + 1) }
}

export function useBuyerSaved() {
  const [state, setState] = useState({ status: 'loading', saved: [], error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    buyerSaved()
      .then((d) => alive && setState({ status: 'ok', saved: d.saved ?? [], error: null }))
      .catch((e) => alive && setState({ status: 'error', saved: [], error: e?.error || 'Could not load your saved produce.' }))
    return () => {
      alive = false
    }
  }, [tick])

  return { ...state, refresh: () => setTick((t) => t + 1) }
}

export function useBuyerRequests() {
  const [state, setState] = useState({ status: 'loading', requests: [], error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    buyerRequests()
      .then((d) => alive && setState({ status: 'ok', requests: d.requests ?? [], error: null }))
      .catch((e) => alive && setState({ status: 'error', requests: [], error: e?.error || 'Could not load your purchase requests.' }))
    return () => {
      alive = false
    }
  }, [tick])

  return { ...state, refresh: () => setTick((t) => t + 1) }
}

/* tiny promise.all helper with the same state triple-then-refresh shape */
export function useBuyerData() {
  const feed = useMarketFeed()
  const saved = useBuyerSaved()
  const requests = useBuyerRequests()
  const status =
    feed.status === 'loading' || saved.status === 'loading' || requests.status === 'loading'
      ? 'loading'
      : feed.status === 'error' || saved.status === 'error' || requests.status === 'error'
        ? 'error'
        : 'ok'
  return {
    status,
    listings: feed.listings,
    saved,
    requests,
    error: feed.error || saved.error || requests.error,
    refresh: () => {
      feed.refresh()
      saved.refresh()
      requests.refresh()
    },
  }
}
