import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchesService, chatService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl, timeAgo } from '../../../utils/format.js'
import { HeartIcon, MessageIcon, SparkleIcon } from '../../../components/ui/CustomIcons.jsx'
import { motion } from 'framer-motion'
import './Matches.css'

export default function Matches() {
  const navigate = useNavigate()
  const toast = useToast()
  const [matches, setMatches] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([matchesService.list(), chatService.conversations()])
      .then(([m, c]) => {
        if (cancelled) return
        setMatches(Array.isArray(m) ? m : (m?.items ?? []))
        setConversations(Array.isArray(c) ? c : (c?.items ?? []))
      })
      .catch((err) => toast.error(err?.message || 'Không tải được danh sách match.'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  if (loading) return <div className="loading-block"><span className="spinner" /></div>

  return (
    <div className="matches-root">
      {/* Hero header */}
      <div className="matches-hero">
        <div className="matches-hero-content">
          <div className="matches-hero-eyebrow">
            <SparkleIcon size={12} />
            Matches
          </div>
          <h1>Danh sách Match</h1>
          <p className="matches-hero-subtitle">
            Những người đã match với bạn — kết nối và bắt đầu trò chuyện ngay hôm nay.
          </p>
          <div className="matches-hero-stats">
            <div className="matches-hero-stat">
              <span className="matches-hero-stat-value">{matches.length}</span>
              <span className="matches-hero-stat-label">Match mới</span>
            </div>
            <div className="matches-hero-stat">
              <span className="matches-hero-stat-value">{conversations.length}</span>
              <span className="matches-hero-stat-label">Hội thoại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="matches-body">
        {/* Match list */}
        <section className="matches-section">
          <div className="matches-section-label is-new">
            <HeartIcon size={14} />
            Match mới
          </div>
          {matches.length === 0 ? (
            <div className="matches-empty">
              <div className="matches-empty-icon"><HeartIcon size={40} /></div>
              <p>Bạn chưa có match nào. Hãy lướt Discovery để gặp ai đó special nhé!</p>
              <button type="button" className="matches-empty-cta" onClick={() => navigate('/discovery')}>
                <SparkleIcon size={14} />
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="matches-list">
              {matches.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="match-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  onClick={async () => {
                    try {
                      const conv = await chatService.byMatch(m.id)
                      navigate(`/chat/${conv.id || conv.conversationId}`)
                    } catch {
                      toast.error('Không mở được cuộc trò chuyện.')
                    }
                  }}
                >
                  <div
                    className="match-avatar"
                    style={{ backgroundImage: `url(${resolveImageUrl(m.otherAvatarUrl || m.photoUrl)})` }}
                  >
                    {m.isOnline && <span className="match-online" />}
                  </div>
                  <div className="match-info">
                    <div className="match-name">{m.otherDisplayName}</div>
                    <div className="match-meta">
                      <HeartIcon size={10} />
                      Match {timeAgo(m.createdAt)}
                    </div>
                  </div>
                  <div className="match-action">
                    <MessageIcon size={18} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Conversation list */}
        <section className="matches-section">
          <div className="matches-section-label is-chat">
            <MessageIcon size={14} />
            Hội thoại
          </div>
          {conversations.length === 0 ? (
            <div className="matches-empty" style={{ paddingTop: 24, paddingBottom: 40 }}>
              <p>Chưa có cuộc trò chuyện nào.</p>
            </div>
          ) : (
            <div className="matches-list">
              {conversations.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="match-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  onClick={() => navigate(`/chat/${c.id}`)}
                >
                  <div className="match-avatar" style={{ backgroundImage: c.otherAvatarUrl ? `url(${resolveImageUrl(c.otherAvatarUrl)})` : undefined }}>
                    {c.isOnline && <span className="match-online" />}
                  </div>
                  <div className="match-info">
                    <div className="match-name">{c.otherDisplayName || 'Match'}</div>
                    <div className="match-preview">{c.lastMessageText || 'Bắt đầu cuộc trò chuyện…'}</div>
                  </div>
                  <div className="match-right">
                    {c.lastMessageAt && <div className="match-time">{timeAgo(c.lastMessageAt)}</div>}
                    {c.unreadCount > 0 && <span className="match-unread">{c.unreadCount}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
