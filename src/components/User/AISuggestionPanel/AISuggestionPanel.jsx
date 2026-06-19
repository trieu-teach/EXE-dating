import { useState } from 'react'
import { useAISuggestions } from '../../../hooks/useAISuggestions.js'
import AicConsentModal from '../AicConsentModal/AicConsentModal.jsx'

const STORAGE_KEY = 'samemess_aic_consent'

function readConsent() {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export default function AISuggestionPanel({ matchId, onPick }) {
  const [consent, setConsent] = useState(readConsent())
  const [showConsent, setShowConsent] = useState(false)
  const { suggestions, loading, refetch } = useAISuggestions(consent ? matchId : null)

  const handleAccept = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setConsent(true)
    setShowConsent(false)
  }

  if (!consent) {
    return (
      <>
        <button
          type="button"
          className="btn btn-soft btn-sm"
          onClick={() => setShowConsent(true)}
        >
          ✨ Gợi ý mở lời (AI)
        </button>
        <AicConsentModal
          open={showConsent}
          onAccept={handleAccept}
          onClose={() => setShowConsent(false)}
        />
      </>
    )
  }

  return (
    <div className="chat-ai-panel">
      <div className="chat-ai-panel-title">
        ✨ Gợi ý mở lời
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: 'auto', padding: '2px 8px' }}
          onClick={() => refetch()}
        >
          ↻
        </button>
      </div>
      {loading && <div className="loading-block"><span className="spinner" /></div>}
      {!loading && suggestions.length === 0 && (
        <div style={{ padding: 12, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
          Chưa có gợi ý. Bấm ↻ để thử lại.
        </div>
      )}
      {!loading && suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          className="chat-ai-suggestion"
          onClick={() => onPick?.(s)}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
