import { useState } from 'react'
import { resolveImageUrl } from '../../../utils/format.js'
import { MoreIcon } from '../../ui/CustomIcons.jsx'

export default function ChatThreadToolbar({ conversation, onBack, onAvatarClick, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false)
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
        onClick={() => onAvatarClick?.()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onAvatarClick?.() }}
        aria-label={`Mở hồ sơ của ${other}`}
      />
      <div className="chat-toolbar-info">
        <div className="chat-toolbar-name">{other}</div>
      </div>
      <div className="chat-toolbar-actions">
        {conversation?.otherUserId && (
          <div className="chat-toolbar-menu">
            <button
              type="button"
              className="chat-toolbar-action"
              onClick={() => setMenuOpen((o) => !o)}
              title="Tùy chọn"
              aria-label="Tùy chọn"
              aria-expanded={menuOpen}
            >
              <MoreIcon size={18} />
            </button>
            {menuOpen && (
              <>
                <div className="chat-toolbar-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="chat-toolbar-menu-pop" role="menu">
                  <button
                    type="button"
                    className="chat-toolbar-menu-item is-danger"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); onBlock?.() }}
                  >
                    Chặn người này
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
