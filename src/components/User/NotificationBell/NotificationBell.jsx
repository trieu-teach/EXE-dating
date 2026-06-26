import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../../hooks/useNotifications.js'
import { timeAgo, resolveImageUrl } from '../../../utils/format.js'
import { matchesService, chatService } from '../../../api'
import { Bell, CheckCheck, Heart, MessageCircle, Calendar, Star } from 'lucide-react'
import { cn } from '../../../lib/utils'
import './NotificationBell.css'

// Icon + màu theo loại thông báo (đúng giá trị backend: Match / Message / SuperLike)
const TYPE_META = {
  Match:     { Icon: Heart,         grad: 'linear-gradient(135deg, #ff7eb3, #ff2d6b)' },
  Message:   { Icon: MessageCircle, grad: 'linear-gradient(135deg, #5eead4, #3b82f6)' },
  SuperLike: { Icon: Star,          grad: 'linear-gradient(135deg, #c084fc, #9333ea)' },
  Event:     { Icon: Calendar,      grad: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  Reputation:{ Icon: Star,          grad: 'linear-gradient(135deg, #34d399, #16a34a)' },
}
const TYPE_FALLBACK = { Icon: Bell, grad: 'linear-gradient(135deg, #ff9ec4, #b14bff)' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [avatarMap, setAvatarMap] = useState({}) // id (conversation/match/user) → avatar url
  const ref = useRef(null)
  const navigate = useNavigate()
  const { items, unreadCount, markRead, loading } = useNotifications({ pollIntervalMs: 30_000 })

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Khi mở dropdown: dựng map id → avatar từ danh sách match + hội thoại
  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.all([
      matchesService.list().catch(() => []),
      chatService.conversations().catch(() => []),
    ]).then(([m, c]) => {
      if (cancelled) return
      const norm = (x) => (Array.isArray(x) ? x : (x?.items ?? []))
      const map = {}
      for (const mm of norm(m)) {
        const av = resolveImageUrl(mm.avatarUrl)
        if (!av) continue
        const mid = mm.matchId ?? mm.id
        if (mid) map[mid] = av
        if (mm.userId) map[mm.userId] = av
      }
      for (const cc of norm(c)) {
        const av = resolveImageUrl(cc.otherAvatarUrl)
        if (!av) continue
        if (cc.id) map[cc.id] = av
        if (cc.otherUserId) map[cc.otherUserId] = av
      }
      setAvatarMap(map)
    })
    return () => { cancelled = true }
  }, [open])

  const handleItemClick = async (item) => {
    try { await markRead([item.id]) } catch {}
    setOpen(false)
    // item.data là 1 chuỗi id (conversationId / matchId / fromUserId) tuỳ loại thông báo
    const ref = item.data
    if (item.type === 'Message' && ref) navigate(`/chat/${ref}`)
    else if (item.type === 'Match') navigate('/matches?tab=matches')
    else if (item.type === 'SuperLike') navigate('/matches?tab=likes')
  }

  return (
    <div ref={ref} className="notif-wrapper">
      <button
        type="button"
        className="notif-bell-btn"
        aria-label="Thông báo"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-header">
            <span className="notif-header-title">Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-read" onClick={() => markRead()}>
                <CheckCheck size={14} />
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="notif-list">
            {loading && items.length === 0 && (
              <div className="notif-loading"><span className="spinner" /> Đang tải…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="notif-empty">
                <Bell size={28} />
                <p>Chưa có thông báo nào</p>
              </div>
            )}
            {items.map((it) => {
              const meta = TYPE_META[it.type] || TYPE_FALLBACK
              const Icon = meta.Icon
              const avatar = it.data ? avatarMap[it.data] : null
              return (
                <div
                  key={it.id}
                  className={cn('notif-item', !it.isRead && 'is-unread')}
                  onClick={() => handleItemClick(it)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(it) }}
                >
                  {avatar ? (
                    <div className="notif-item-avatar-wrap">
                      <span className="notif-item-avatar" style={{ backgroundImage: `url(${avatar})` }} />
                      <span className="notif-item-badge" style={{ background: meta.grad }}>
                        <Icon size={11} />
                      </span>
                    </div>
                  ) : (
                    <div className="notif-item-icon" style={{ background: meta.grad }}>
                      <Icon size={17} />
                    </div>
                  )}
                  <div className="notif-item-content">
                    <div className="notif-item-title">{it.title || it.type}</div>
                    {it.body && <div className="notif-item-body">{it.body}</div>}
                    <div className="notif-item-time">{timeAgo(it.createdAt || it.sentAt)}</div>
                  </div>
                  {!it.isRead && <div className="notif-item-dot" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
