import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../../hooks/useNotifications.js'
import { timeAgo } from '../../../utils/format.js'
import { Bell, CheckCheck, Heart, MessageCircle, Calendar, Star } from 'lucide-react'
import { cn } from '../../../lib/utils'
import './NotificationBell.css'

const typeIcons = {
  match: Heart,
  message: MessageCircle,
  event: Calendar,
  reputation: Star,
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { items, unreadCount, markRead, loading } = useNotifications({ pollIntervalMs: 30_000 })

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const handleItemClick = async (item) => {
    try { await markRead([item.id]) } catch {}
    setOpen(false)
    if (item.data?.url) navigate(item.data.url)
    else if (item.data?.conversationId) navigate(`/chat/${item.data.conversationId}`)
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
              const Icon = typeIcons[it.type] || Bell
              return (
                <div
                  key={it.id}
                  className={cn('notif-item', !it.isRead && 'is-unread')}
                  onClick={() => handleItemClick(it)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(it) }}
                >
                  <div className="notif-item-icon">
                    <Icon size={16} />
                  </div>
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
