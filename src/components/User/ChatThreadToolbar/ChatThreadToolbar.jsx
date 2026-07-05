import { useState } from 'react'
import { resolveImageUrl } from '../../../utils/format.js'
import { MoreIcon } from '../../ui/CustomIcons.jsx'
import AdminBadge from '../AdminBadge/AdminBadge.jsx'
import AvatarFrame from '../AvatarFrame/AvatarFrame.jsx'

export default function ChatThreadToolbar({ conversation, onBack, onAvatarClick, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const other = conversation?.otherDisplayName || conversation?.displayName || 'Đoạn chat'
  const avatar = resolveImageUrl(conversation?.otherAvatarUrl || conversation?.avatarUrl)
  const online = Boolean(conversation?.isOnline)

  return (
    <header className="chat-toolbar">
      <button type="button" className="chat-toolbar-back" onClick={onBack} aria-label="Quay lại">
        ←
      </button>
      <AvatarFrame frame={conversation?.otherAvatarFrame} size="md">
        <div
          className="chat-toolbar-avatar"
          style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
          onClick={() => onAvatarClick?.()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onAvatarClick?.() }}
          aria-label={`Mở hồ sơ của ${other}`}
        />
      </AvatarFrame>
      <div className="chat-toolbar-info">
        <div className="chat-toolbar-name">
          {other}
          {conversation?.otherIsAdmin && <AdminBadge size="sm" />}
        </div>
        <div className="chat-toolbar-status">
          {online ? (
            <><span className="chat-toolbar-dot" /> Đang hoạt động</>
          ) : (
            <span className="chat-toolbar-status-muted">Bấm để xem hồ sơ</span>
          )}
        </div>
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
                    className="chat-toolbar-menu-item"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); onAvatarClick?.() }}
                  >
                    Xem hồ sơ
                  </button>
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
