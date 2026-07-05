import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../../hooks/useNotifications.js'
import { timeAgo, resolveImageUrl } from '../../../utils/format.js'
import { matchesService, chatService } from '../../../api'
import { Bell, CheckCheck, Heart, MessageCircle, Calendar, Star, Gift } from 'lucide-react'
import { cn } from '../../../lib/utils'
import Modal from '../Modal/Modal.jsx'
import AdminBadge from '../AdminBadge/AdminBadge.jsx'
import './NotificationBell.css'

// Icon + màu theo loại thông báo — quy về 3 tông chính: hồng (match), xanh (nhắn tin), tím (quà/thành tích)
const TYPE_META = {
  Match:       { Icon: Heart,         grad: 'linear-gradient(135deg, #ff8fb5, #ff4f8b)' },
  SuperLike:   { Icon: Star,          grad: 'linear-gradient(135deg, #ff8fb5, #ff4f8b)' },
  Message:     { Icon: MessageCircle, grad: 'linear-gradient(135deg, #93c5fd, #60a5fa)' },
  Event:       { Icon: Calendar,      grad: 'linear-gradient(135deg, #d8b4fe, #a855f7)' },
  Reputation:  { Icon: Star,          grad: 'linear-gradient(135deg, #d8b4fe, #a855f7)' },
  PlanGranted: { Icon: Gift,          grad: 'linear-gradient(135deg, #d8b4fe, #a855f7)' },
}
const TYPE_FALLBACK = { Icon: Bell, grad: 'linear-gradient(135deg, #ff8fb5, #a855f7)' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [avatarMap, setAvatarMap] = useState({}) // id (conversation/match/user) → avatar url
  const [giftItem, setGiftItem] = useState(null)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { items, unreadCount, markRead, loading } = useNotifications({ pollIntervalMs: 30_000 })

  // Quà tặng premium từ admin hiện popup cảm ơn riêng, không chỉ nằm trong dropdown
  useEffect(() => {
    const gift = items.find((it) => it.type === 'PlanGranted' && !it.isRead)
    if (gift && gift.id !== giftItem?.id) setGiftItem(gift)
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  const closeGift = async () => {
    if (!giftItem) return
    try { await markRead([giftItem.id]) } catch { /* ignore */ }
    setGiftItem(null)
  }

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
        {unreadCount > 0 && <span className="notif-badge" aria-label={`${unreadCount} thông báo chưa đọc`} />}
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

      <Modal open={!!giftItem} onClose={closeGift} labelledBy="gift-modal-title">
        <div className="gift-modal">
          <div className="gift-modal-icon">🎁</div>
          <div className="gift-modal-from"><AdminBadge /></div>
          <h2 id="gift-modal-title" className="gift-modal-title">{giftItem?.title || 'Quà tặng từ SameMess'}</h2>
          <p className="gift-modal-body">{giftItem?.body}</p>
          <button type="button" className="btn btn-primary" onClick={closeGift}>Trải nghiệm ngay</button>
        </div>
      </Modal>
    </div>
  )
}
