import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveImageUrl } from '../../../utils/format.js'
import { MoreIcon } from '../../ui/CustomIcons.jsx'

export default function ChatThreadToolbar({ conversation, plant, onBack, onAvatarClick, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const other = conversation?.otherDisplayName || conversation?.displayName || 'Đoạn chat'
  const avatar = resolveImageUrl(conversation?.otherAvatarUrl || conversation?.avatarUrl)
  const online = Boolean(conversation?.isOnline)
  const matchId = conversation?.matchId
  const level = plant ? Math.min(7, Math.max(1, Number(plant.level) || 1)) : null
  const streak = Number(plant?.streakCount ?? 0)

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
        <div className="chat-toolbar-status">
          {online ? (
            <><span className="chat-toolbar-dot" /> Đang hoạt động</>
          ) : (
            <span className="chat-toolbar-status-muted">Bấm để xem hồ sơ</span>
          )}
        </div>
      </div>

      <div className="chat-toolbar-actions">
        {/* Chip Cây tình yêu gọn — kiểu streak Snapchat */}
        {level != null && matchId && (
          <Link
            to={`/love-tree?matchId=${matchId}`}
            className="chat-toolbar-tree"
            title="Xem Cây tình yêu"
          >
            <span className="chat-toolbar-tree-emoji">🌳</span>
            <span className="chat-toolbar-tree-lv">Cấp {level}</span>
            {streak > 0 && <span className="chat-toolbar-tree-streak">🔥{streak}</span>}
          </Link>
        )}

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
                  {matchId && (
                    <Link
                      to={`/love-tree?matchId=${matchId}`}
                      className="chat-toolbar-menu-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      Cây tình yêu
                    </Link>
                  )}
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
