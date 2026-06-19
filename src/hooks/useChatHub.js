/**
 * SignalR chat hub hook (placeholder).
 *
 * The current build does not bundle `@microsoft/signalr` to keep the JS
 * payload small. The Chat page therefore falls back to REST polling via
 * `chatService.messages` plus an interval. This hook is intentionally a
 * no-op for now; if/when SignalR is wired in, set `isConnected` once
 * the connection transitions to the Connected state.
 */

import { useEffect, useState } from 'react'
import { getAccessToken } from '../api'

export function useChatHub() {
  const [isConnected] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) return undefined
    // Placeholder for future SignalR integration.
    return () => {
      // nothing to clean up yet
    }
  }, [])

  return { isConnected }
}
