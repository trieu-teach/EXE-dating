import { Link } from 'react-router-dom'
import { canSuggestDateFromTree, loveTreeToDisplayState } from '../../../utils/loveTreeState.js'
import './ChatThreadToolbar.css'

const STAGE_EMOJI = {
  sprout: '🌱',
  sparse: '🌿',
  seedling: '🪴',
  budding: '🌸',
  young: '🌺',
  blooming: '🌳',
  radiant: '✨',
}

function ChatThreadToolbar({ partnerId, partnerName, treeState, topNudge, onNudgeAction, onDismissNudge }) {
  const display = loveTreeToDisplayState(treeState)
  const emoji = STAGE_EMOJI[display.stageKey] ?? '🌱'
  const dateReady = canSuggestDateFromTree(treeState)
  const showNudge = topNudge && topNudge.id !== 'ready_to_meet' && !topNudge.showMeetupCard

  return (
    <div className="chat-toolbar">
      <Link
        to={`/love-tree?partner=${partnerId}`}
        className="chat-toolbar__chip chat-toolbar__chip--tree"
        title="Chăm cây tình yêu"
      >
        <span>{emoji}</span>
        <span>
          Cấp {display.level} · {display.attachmentPercent}%
        </span>
      </Link>

      {dateReady ? (
        <Link to={`/meet-up/${partnerId}`} className="chat-toolbar__chip chat-toolbar__chip--meet">
          📅 Gợi ý hẹn gặp
        </Link>
      ) : (
        <span className="chat-toolbar__chip chat-toolbar__chip--muted" title="Chăm cây đến cấp 4">
          🔒 Hẹn gặp sau
        </span>
      )}

      {showNudge && (
        <button
          type="button"
          className="chat-toolbar__nudge"
          onClick={() => onNudgeAction?.(topNudge)}
        >
          {topNudge.icon} {topNudge.actionLabel}
        </button>
      )}

      {showNudge && (
        <button
          type="button"
          className="chat-toolbar__dismiss"
          onClick={() => onDismissNudge?.(topNudge)}
          aria-label="Bỏ qua nhắc nhở"
        >
          ✕
        </button>
      )}

      {!showNudge && dateReady && (
        <span className="chat-toolbar__hint">Sẵn sàng hẹn {partnerName} ngoài đời</span>
      )}
    </div>
  )
}

export default ChatThreadToolbar
