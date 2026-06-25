import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, SendIcon, Sparkles2Icon, HeartChatIcon, Check2Icon, LightbulbIcon, XSmallIcon, ArrowUpIcon } from '../../../components/ui/CustomIcons.jsx'
import { chatService, plantsService, connectionRemindersService, meetupService, venuesService, profileService, blocksService, matchesService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { timeAgo, resolveImageUrl, formatDistance } from '../../../utils/format.js'
import ChatThreadToolbar from '../../../components/User/ChatThreadToolbar/ChatThreadToolbar.jsx'
import ProfilePreviewModal from '../../../components/User/ProfilePreviewModal/ProfilePreviewModal.jsx'
import AISuggestionPanel from '../../../components/User/AISuggestionPanel/AISuggestionPanel.jsx'
import LoveTreeBondBar from '../../../components/User/LoveTreeBondBar/LoveTreeBondBar.jsx'
import VenueMessage from '../../../components/User/VenueMessage/VenueMessage.jsx'
import VenueDetailModal from '../../../components/User/VenueDetailModal/VenueDetailModal.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import './Chat.css'

function formatMeetupTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      weekday: 'short', day: '2-digit', month: '2-digit',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function isOwn(msg, currentUserId) {
  if (!msg) return false
  if (currentUserId && msg.senderId != null) return String(msg.senderId) === String(currentUserId)
  return !!msg.isMine
}

const convListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const convItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

const msgVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
}

const threadVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const messagesEnd = useRef(null)

  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(true)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [plant, setPlant] = useState(null)
  const [watering, setWatering] = useState(false)
  const [nudges, setNudges] = useState([])
  const [detailVenue, setDetailVenue] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Đề xuất hẹn ngay từ chat (sau khi chia sẻ/ xem 1 quán)
  const [proposeVenue, setProposeVenue] = useState(null)
  const [proposeAt, setProposeAt] = useState('')
  const [proposeNote, setProposeNote] = useState('')
  const [proposing, setProposing] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [profileUser, setProfileUser] = useState(null)
  // Chia sẻ quán vào chat
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerVenues, setPickerVenues] = useState([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [sharingId, setSharingId] = useState(null)

  // Load conversation list
  useEffect(() => {
    chatService.conversations()
      .then((list) => setConversations(Array.isArray(list) ? list : (list?.items ?? [])))
      .catch(() => setConversations([]))
      .finally(() => setConvLoading(false))
  }, [])

  // Resolve active conversation from URL
  useEffect(() => {
    if (!conversationId) return
    const found = conversations.find((c) => c.id === conversationId)
    if (found) {
      setConversation(found)
    } else {
      setConversation({ id: conversationId })
    }
  }, [conversationId, conversations])

  // Load thread messages & related data
  useEffect(() => {
    if (!conversation?.id) return
    let cancelled = false
    setThreadLoading(true)
    setMessages([])
    setPlant(null)
    setNudges([])

    chatService.messages(conversation.id, { limit: 50 })
      .then((list) => { if (!cancelled) setMessages(Array.isArray(list) ? list : (list?.items ?? [])) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setThreadLoading(false) })

    chatService.markRead(conversation.id).catch(() => {})

    if (conversation?.matchId) {
      plantsService.get(conversation.matchId)
        .then((p) => { if (!cancelled) setPlant(p) })
        .catch(() => {})
      connectionRemindersService.nudges(conversation.id)
        .then((n) => { if (!cancelled) setNudges(Array.isArray(n?.items) ? n.items : (Array.isArray(n) ? n : [])) })
        .catch(() => {})
    }

    return () => { cancelled = true }
  }, [conversation?.id, conversation?.matchId])

  // Realtime (polling): tự lấy tin nhắn mới mỗi 3.5s → không cần reload
  useEffect(() => {
    if (!conversation?.id) return undefined
    const convId = conversation.id
    const id = setInterval(async () => {
      try {
        const list = await chatService.messages(convId, { limit: 50 })
        const arr = Array.isArray(list) ? list : (list?.items ?? [])
        setMessages((cur) => {
          const changed = arr.length !== cur.length
            || arr[arr.length - 1]?.id !== cur[cur.length - 1]?.id
          if (!changed) return cur
          chatService.markRead(convId).catch(() => {}) // có tin mới → đánh dấu đã đọc
          return arr
        })
      } catch { /* bỏ qua lỗi tạm thời */ }
    }, 3500)
    return () => clearInterval(id)
  }, [conversation?.id])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConv = (conv) => {
    setConversation(conv)
    navigate(`/chat/${conv.id}`, { replace: true })
  }

  const confirmBlock = async () => {
    if (!conversation?.otherUserId) return
    setBlocking(true)
    try {
      await blocksService.block(conversation.otherUserId)
      // Chặn đồng thời gỡ match → xóa cây tình yêu chung
      if (conversation.matchId) {
        try { await matchesService.unmatch(conversation.matchId) } catch { /* cây có thể đã gỡ */ }
      }
      toast.success('Đã chặn và xóa cây tình yêu chung.')
      setConversations((cur) => cur.filter((c) => c.id !== conversation.id))
      setBlockOpen(false)
      setConversation(null)
      navigate('/chat')
    } catch (err) {
      toast.error(err?.message || 'Chặn thất bại.')
    } finally {
      setBlocking(false)
    }
  }

  const send = async (e) => {
    e?.preventDefault?.()
    if (!text.trim() || !conversation?.id || sending) return
    setSending(true)
    try {
      const msg = await chatService.send(conversation.id, text.trim())
      setMessages((cur) => [...cur, msg])
      setText('')
    } catch (err) {
      const msg = err?.message || ''
      // Tin nhắn bị AI kiểm duyệt chặn → đã bị trừ uy tín
      if (err?.status === 400 && /tiêu chuẩn cộng đồng|vi phạm|bị chặn/i.test(msg)) {
        setFlagged(true)
      } else {
        toast.error(msg || 'Gửi tin thất bại.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleWater = async () => {
    if (!conversation?.matchId) return
    setWatering(true)
    try {
      const updated = await plantsService.water(conversation.matchId)
      setPlant(updated)
      toast.success('Đã tưới cây 💧')
    } catch (err) {
      toast.error(err?.message || 'Không tưới được cây.')
    } finally {
      setWatering(false)
    }
  }

  // Mở form đặt lịch cho 1 quán (từ thẻ quán đã chia sẻ trong chat)
  const openPropose = (venue) => {
    setDetailOpen(false)
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    d.setMinutes(0, 0, 0)
    const off = d.getTimezoneOffset()
    setProposeAt(new Date(d.getTime() - off * 60000).toISOString().slice(0, 16))
    setProposeNote('')
    setProposeVenue(venue || detailVenue)
  }

  const submitPropose = async (e) => {
    e?.preventDefault?.()
    if (!conversation?.id || !proposeVenue) return
    if (new Date(proposeAt).getTime() <= Date.now()) {
      toast.warn('Vui lòng chọn thời gian trong tương lai.')
      return
    }
    setProposing(true)
    try {
      await meetupService.propose(conversation.id, {
        venueId: proposeVenue.id || proposeVenue.venueId,
        proposedAt: new Date(proposeAt).toISOString(),
        note: proposeNote.trim() || undefined,
      })
      toast.success('Đã gửi lời mời hẹn! 💕 Xem & phản hồi ở tab Hẹn hò trên Cây tình yêu.')
      setProposeVenue(null)
    } catch (err) {
      if (err?.status === 403) toast.error('Chăm cây đạt Level 4 để mở khóa hẹn hò.')
      else toast.error(err?.message || 'Gửi đề xuất thất bại.')
    } finally {
      setProposing(false)
    }
  }

  const handleDismissNudge = async (nudgeId) => {
    try {
      await connectionRemindersService.dismissNudge(conversation.id, nudgeId)
      setNudges((cur) => cur.filter((n) => (n.id || n.code) !== nudgeId))
    } catch {}
  }

  const openVenueDetail = (venue) => {
    setDetailVenue(venue)
    setDetailOpen(true)
  }

  // Mở picker chọn quán để chia sẻ vào chat
  const openVenuePicker = () => {
    if (!conversation?.matchId) {
      toast.info('Chưa thể tải địa điểm cho cuộc trò chuyện này.')
      return
    }
    setPickerOpen(true)
    setPickerLoading(true)
    setPickerVenues([])
    venuesService.nearby(conversation.matchId, { radiusKm: 15 })
      .then((list) => setPickerVenues(Array.isArray(list) ? list : (list?.items ?? [])))
      .catch((err) => {
        if (err?.status === 403) toast.error('Chăm cây đạt Level 4 để mở khóa địa điểm hẹn hò.')
        else toast.error('Không tải được danh sách quán.')
        setPickerOpen(false)
      })
      .finally(() => setPickerLoading(false))
  }

  const shareVenue = async (v) => {
    if (!conversation?.id) return
    setSharingId(v.id)
    try {
      const msg = await meetupService.shareVenue(conversation.id, v.id)
      setMessages((cur) => [...cur, msg])
      setPickerOpen(false)
      toast.success('Đã chia sẻ địa điểm vào trò chuyện! 📍')
    } catch (err) {
      toast.error(err?.message || 'Chia sẻ thất bại.')
    } finally {
      setSharingId(null)
    }
  }

  const filtered = conversations.filter((c) =>
    !search || (c.otherDisplayName || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className={`chat-root${conversationId ? ' chat-thread-open' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">Tin nhắn</span>
        </div>
        <div className="chat-sidebar-search">
          <span className="chat-sidebar-search-icon">
            <SearchIcon size={15} />
          </span>
          <input
            placeholder="Tìm cuộc trò chuyện…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {convLoading ? (
          <div className="chat-loading-state">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="chat-empty-list">Không có cuộc trò chuyện nào</div>
        ) : (
          <motion.div
            className="chat-conv-list"
            variants={convListVariants}
            initial="hidden"
            animate="show"
          >
            {filtered.map((c) => (
              <motion.div
                key={c.id}
                variants={convItemVariants}
                className={`chat-conv-item${conversation?.id === c.id ? ' is-active' : ''}`}
                onClick={() => openConv(c)}
              >
                <div className="chat-conv-avatar-wrap">
                  <div
                    className="chat-conv-avatar"
                    style={c.otherAvatarUrl ? { backgroundImage: `url(${c.otherAvatarUrl})` } : undefined}
                  />
                  {c.isOnline && <div className="chat-conv-avatar-dot" />}
                </div>
                <div className="chat-conv-body">
                  <div className="chat-conv-name">{c.otherDisplayName || 'Match'}</div>
                  <div className={`chat-conv-preview${c.unreadCount > 0 ? ' is-unread' : ''}`}>
                    {c.lastMessageText || 'Bắt đầu cuộc trò chuyện…'}
                  </div>
                </div>
                <div className="chat-conv-meta">
                  {c.lastMessageAt && <div className="chat-conv-time">{timeAgo(c.lastMessageAt)}</div>}
                  {c.unreadCount > 0 && <span className="chat-conv-unread">{c.unreadCount}</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </aside>

      {/* ── Thread ── */}
      <main className="chat-main">
        <AnimatePresence mode="wait">
          {conversation ? (
            <motion.div
              key={conversation.id}
              variants={threadVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="chat-thread-wrapper"
            >
              <ChatThreadToolbar conversation={conversation} onBack={() => { setConversation(null); navigate('/chat') }}
                onBlock={() => setBlockOpen(true)}
                onAvatarClick={async () => {
                  if (!conversation?.otherUserId) return
                  try { setProfileUser(await profileService.byId(conversation.otherUserId)) }
                  catch (err) { toast.error(err?.message || 'Không tải được hồ sơ.') }
                }} />

              {plant && (
                <div className="chat-bond-bar-wrapper">
                  <LoveTreeBondBar plant={plant} matchId={conversation?.matchId} onWater={handleWater} loading={watering} />
                </div>
              )}

              <div className="chat-messages">
                {threadLoading ? (
                  <div className="chat-loading-state">Đang tải tin nhắn…</div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-thread">
                    <div className="chat-empty-thread-icon"><HeartChatIcon size={40} /></div>
                    <h3>Chưa có tin nhắn</h3>
                    <p>Hãy bắt đầu bằng lời chào</p>
                  </div>
                ) : messages.map((m) => {
                  if (m.type === 'venue') {
                    return (
                      <motion.div
                        key={m.id}
                        className={`chat-msg${isOwn(m, user?.id) ? ' is-mine' : ''}`}
                        variants={msgVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <VenueMessage
                          venue={{ id: m.venueId, name: m.venueName, imageUrl: m.venueImageUrl, address: m.venueAddress, category: m.venueCategory, distanceKm: m.distanceKm }}
                          meta={isOwn(m, user?.id) ? 'Bạn đã chia sẻ' : `${conversation?.otherDisplayName} đã chia sẻ`}
                          onClick={() => openVenueDetail({ id: m.venueId, venueName: m.venueName })}
                        />
                        <div className="chat-msg-time">{timeAgo(m.sentAt)}</div>
                      </motion.div>
                    )
                  }
                  return (
                    <motion.div
                      key={m.id}
                      className={`chat-msg${isOwn(m, user?.id) ? ' is-mine' : ''}`}
                      variants={msgVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <div className="chat-bubble">{m.content}</div>
                      <div className="chat-msg-time">{timeAgo(m.sentAt)}</div>
                    </motion.div>
                  )
                })}

                <div ref={messagesEnd} />
              </div>

              {nudges.length > 0 && (
                <div className="chat-nudge-bar">
                  {nudges.slice(0, 2).map((n) => (
                    <div key={n.id || n.code} className="chat-nudge">
                      <span><LightbulbIcon size={14} /> {n.title || n.body || n.code}</span>
                      <button type="button" className="chat-nudge-dismiss" onClick={() => handleDismissNudge(n.id || n.code)} aria-label="Bỏ qua">
                        <XSmallIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {conversation?.matchId && !threadLoading && messages.length === 0 && (
                <div className="chat-ai-panel-wrapper">
                  <AISuggestionPanel matchId={conversation.matchId} onPick={(t) => setText(t)} />
                </div>
              )}

              <VenueDetailModal venue={detailVenue} open={detailOpen} onClose={() => setDetailOpen(false)} onPropose={(v) => openPropose(v)} />

              {/* Modal đặt lịch hẹn cho quán đã chia sẻ */}
              <AnimatePresence>
                {proposeVenue && (
                  <motion.div className="chat-propose-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setProposeVenue(null)}>
                    <motion.form className="chat-propose-modal" onSubmit={submitPropose}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                      <div className="chat-propose-title">💕 Lên kế hoạch hẹn hò</div>
                      <div className="chat-propose-venue">📍 <strong>{proposeVenue.name || proposeVenue.venueName || 'Quán đã chọn'}</strong></div>
                      <div className="field">
                        <label className="field-label">Thời gian</label>
                        <input type="datetime-local" value={proposeAt}
                          onChange={(e) => setProposeAt(e.target.value)} required />
                      </div>
                      <div className="field">
                        <label className="field-label">Lời nhắn (tuỳ chọn)</label>
                        <textarea rows={2} value={proposeNote} maxLength={300}
                          onChange={(e) => setProposeNote(e.target.value)}
                          placeholder="Mình hẹn nhau ở đây nhé ☕" />
                      </div>
                      <div className="chat-propose-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={proposing}>
                          {proposing ? <span className="spinner" /> : 'Gửi lời mời'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProposeVenue(null)}>Hủy</button>
                      </div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Picker chọn quán để chia sẻ vào chat */}
              <AnimatePresence>
                {pickerOpen && (
                  <motion.div className="chat-propose-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setPickerOpen(false)}>
                    <motion.div className="chat-venue-picker"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                      <div className="chat-propose-title">📍 Chia sẻ địa điểm</div>
                      {pickerLoading ? (
                        <div className="loading-block" style={{ padding: 20 }}><span className="spinner" /></div>
                      ) : pickerVenues.length === 0 ? (
                        <p className="empty" style={{ padding: 16 }}>Không tìm thấy quán nào gần đây.</p>
                      ) : (
                        <div className="chat-venue-picker-list">
                          {pickerVenues.map((v) => (
                            <button key={v.id} type="button" className="chat-venue-pick-item"
                              disabled={sharingId === v.id} onClick={() => shareVenue(v)}>
                              <div className="chat-venue-pick-img"
                                style={v.imageUrl ? { backgroundImage: `url(${resolveImageUrl(v.imageUrl)})` } : undefined} />
                              <div className="chat-venue-pick-info">
                                <div className="chat-venue-pick-name">{v.name}</div>
                                <div className="chat-venue-pick-meta">
                                  {v.category}{v.distanceKm != null ? ` · ${formatDistance(v.distanceKm)}` : ''}
                                </div>
                              </div>
                              {sharingId === v.id ? <span className="spinner" /> : <span className="chat-venue-pick-share">Chia sẻ</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPickerOpen(false)}>Đóng</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popup: tin nhắn bị chặn + trừ uy tín */}
              <AnimatePresence>
                {flagged && (
                  <motion.div className="chat-propose-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setFlagged(false)}>
                    <motion.div className="chat-flag-modal"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                      <div className="chat-flag-icon">⚠️</div>
                      <div className="chat-flag-title">Tin nhắn đã bị chặn</div>
                      <p className="chat-flag-text">
                        Tin nhắn của bạn vi phạm tiêu chuẩn cộng đồng nên đã bị chặn và
                        {' '}<strong>trừ 8 điểm uy tín</strong>.
                      </p>
                      <div className="chat-flag-warn">
                        <strong>Uy tín thấp ảnh hưởng gì?</strong>
                        <ul>
                          <li>Hồ sơ ít được hiển thị trong Khám phá → khó match hơn</li>
                          <li>Mất nhãn tin cậy, người khác dè dặt hơn</li>
                          <li>Vi phạm nặng/nhiều lần có thể bị hạn chế tài khoản</li>
                        </ul>
                      </div>
                      <div className="chat-flag-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFlagged(false)}>Đã hiểu</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setFlagged(false); navigate('/reputation') }}>Xem điểm uy tín</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popup xác nhận chặn */}
              <AnimatePresence>
                {blockOpen && (
                  <motion.div className="chat-propose-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => !blocking && setBlockOpen(false)}>
                    <motion.div className="chat-flag-modal"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                      <div className="chat-flag-icon">🚫</div>
                      <div className="chat-flag-title">Chặn {conversation?.otherDisplayName || 'người này'}?</div>
                      <p className="chat-flag-text">
                        Hai bạn sẽ không còn thấy nhau, không nhắn tin được nữa và
                        {' '}<strong>cây tình yêu chung sẽ bị xóa</strong>. Hành động này không thể hoàn tác.
                      </p>
                      <div className="chat-flag-actions">
                        <button type="button" className="btn btn-ghost btn-sm" disabled={blocking}
                          onClick={() => setBlockOpen(false)}>Hủy</button>
                        <button type="button" className="btn btn-primary btn-sm" disabled={blocking}
                          onClick={confirmBlock}>{blocking ? <span className="spinner" /> : 'Chặn'}</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hồ sơ đầy đủ đối phương (bấm avatar header) */}
              <ProfilePreviewModal profile={profileUser} open={!!profileUser} onClose={() => setProfileUser(null)} ownerView={false} />

              <form className="chat-input-bar" onSubmit={send}>
                <button type="button" className="chat-venue-btn" onClick={openVenuePicker}
                  title="Chia sẻ địa điểm" aria-label="Chia sẻ địa điểm">📍</button>
                <textarea
                  className="chat-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tin nhắn…"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                  }}
                />
                <button type="submit" className="chat-send-btn" disabled={sending || !text.trim()} aria-label="Gửi">
                  {sending ? (
                    <span className="spinner" />
                  ) : (
                <ArrowUpIcon size={18} />
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="chat-empty-thread"
              variants={threadVariants}
              initial="hidden"
              animate="show"
            >
              <div className="chat-empty-thread-icon"><Sparkles2Icon size={40} /></div>
              <h3>Chọn cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
