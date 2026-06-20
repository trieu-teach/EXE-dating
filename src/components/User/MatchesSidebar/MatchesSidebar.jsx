import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatService, matchesService } from '../../../api'
import { useAuth } from '../../../context/AuthContext.jsx'
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import { SparkleIcon } from '../../ui/CustomIcons.jsx'
import './MatchesSidebar.css'

/**
 * Cột trái kiểu Tinder: hồ sơ + match mới + danh sách tin nhắn.
 * Chỉ hiện trên desktop (CSS ẩn ở mobile).
 */
export default function MatchesSidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [convos, setConvos] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      chatService.conversations().catch(() => []),
      matchesService.list().catch(() => []),
    ]).then(([c, m]) => {
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      setConvos(norm(c)); setMatches(norm(m))
    }).finally(() => setLoading(false))
  }, [])

  const withMsg = convos.filter((c) => c.lastMessageText)
  const msgMatchIds = new Set(convos.map((c) => c.matchId))
  // Match mới = chưa có tin nhắn (chưa có conversation, hoặc conversation rỗng)
  const newMatches = [
    ...convos.filter((c) => !c.lastMessageText).map((c) => ({
      matchId: c.matchId, convId: c.id, name: c.otherDisplayName, avatar: c.otherAvatarUrl,
    })),
    ...matches.filter((m) => !msgMatchIds.has(m.matchId ?? m.id)).map((m) => ({
      matchId: m.matchId ?? m.id, convId: null, name: m.displayName, avatar: m.avatarUrl,
    })),
  ]

  const openConv = (id) => navigate(`/chat/${id}`)
  const openMatch = async (mt) => {
    if (mt.convId) return openConv(mt.convId)
    try {
      const conv = await chatService.byMatch(mt.matchId)
      navigate(`/chat/${conv.id || conv.conversationId}`)
    } catch { navigate('/chat') }
  }

  const myAvatar = resolveImageUrl(user?.avatarUrl || user?.avatar)
  const initial = (user?.displayName || 'B').charAt(0).toUpperCase()

  return (
    <aside className="ms-sidebar">
      {/* Header hồ sơ */}
      <div className="ms-header">
        <div className="ms-header-avatar" style={myAvatar ? { backgroundImage: `url(${myAvatar})` } : undefined}>
          {!myAvatar && initial}
        </div>
        <span className="ms-header-name">{user?.displayName || 'Hồ sơ của tôi'}</span>
      </div>

      {/* CTA khám phá */}
      <button className="ms-discover" onClick={() => navigate('/discovery')}>
        <div className="ms-discover-icon"><SparkleIcon size={20} /></div>
        <div>
          <div className="ms-discover-title">Tìm người mới</div>
          <div className="ms-discover-sub">Quẹt để kết nối ngay hôm nay</div>
        </div>
      </button>

      {loading ? (
        <div className="ms-loading"><span className="spinner" /></div>
      ) : (
        <div className="ms-scroll">
          {/* Match mới */}
          {newMatches.length > 0 && (
            <div className="ms-section">
              <div className="ms-section-label">Match mới</div>
              <div className="ms-new-row">
                {newMatches.map((mt) => (
                  <button key={mt.matchId} className="ms-new-item" onClick={() => openMatch(mt)} title={mt.name}>
                    <div className="ms-new-avatar" style={mt.avatar ? { backgroundImage: `url(${resolveImageUrl(mt.avatar)})` } : undefined}>
                      {!mt.avatar && (mt.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="ms-new-name">{mt.name || 'Match'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tin nhắn */}
          <div className="ms-section">
            <div className="ms-section-label">Tin nhắn</div>
            {withMsg.length === 0 ? (
              <div className="ms-empty">Chưa có cuộc trò chuyện. Hãy chào một match mới! 👋</div>
            ) : (
              withMsg.map((c) => (
                <button key={c.id} className="ms-convo" onClick={() => openConv(c.id)}>
                  <div className="ms-convo-avatar" style={c.otherAvatarUrl ? { backgroundImage: `url(${resolveImageUrl(c.otherAvatarUrl)})` } : undefined}>
                    {!c.otherAvatarUrl && (c.otherDisplayName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="ms-convo-info">
                    <div className="ms-convo-top">
                      <span className="ms-convo-name">{c.otherDisplayName || 'Người dùng'}</span>
                      <span className="ms-convo-time">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <div className="ms-convo-preview">{c.lastMessageText}</div>
                  </div>
                  {c.unreadCount > 0 && <span className="ms-convo-badge">{c.unreadCount}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
