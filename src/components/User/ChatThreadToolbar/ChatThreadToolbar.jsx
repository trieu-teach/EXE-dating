import { useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../../../utils/format.js'
import { TreeIcon } from '../../ui/CustomIcons.jsx'

export default function ChatThreadToolbar({ conversation, onBack }) {
  const navigate = useNavigate()
  const other = conversation?.otherDisplayName || conversation?.displayName || 'Đoạn chat'
  const avatar = resolveImageUrl(conversation?.otherAvatarUrl || conversation?.avatarUrl)

  return (
    <header className="chat-toolbar">
      <button type="button" className="chat-toolbar-back" onClick={onBack} aria-label="Quay lại">
        ←
      </button>
      <div
        className="chat-toolbar-avatar"
        style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
        onClick={() => conversation?.otherUserId && navigate(`/profile/${conversation.otherUserId}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' && conversation?.otherUserId) navigate(`/profile/${conversation.otherUserId}`) }}
        aria-label={`Mở hồ sơ của ${other}`}
      />
      <div className="chat-toolbar-info">
        <div className="chat-toolbar-name">{other}</div>
        {conversation?.matchId && (
          <div className="chat-toolbar-status"><TreeIcon size={12} /> Match · cây tình yêu chung</div>
        )}
      </div>
      <div className="chat-toolbar-actions">
        {conversation?.matchId && (
          <button
            type="button"
            className="chat-toolbar-action"
            onClick={() => navigate(`/love-tree?matchId=${conversation.matchId}`)}
            title="Cây tình yêu"
          >
            <TreeIcon size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
