import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, SendIcon, Sparkles2Icon, HeartChatIcon, Check2Icon, LightbulbIcon, XSmallIcon, ArrowUpIcon } from '../../../components/ui/CustomIcons.jsx'
import { chatService, plantsService, connectionRemindersService, meetupService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { timeAgo } from '../../../utils/format.js'
import ChatThreadToolbar from '../../../components/User/ChatThreadToolbar/ChatThreadToolbar.jsx'
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
  const [meetups, setMeetups] = useState([])
  const [detailVenue, setDetailVenue] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [responding, setResponding] = useState(null)
  const [search, setSearch] = useState('')

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
    setMeetups([])

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
      meetupService.list(conversation.id)
        .then((list) => { if (!cancelled) setMeetups(Array.isArray(list) ? list : (list?.items ?? [])) })
        .catch(() => {})
    }

    return () => { cancelled = true }
  }, [conversation?.id, conversation?.matchId])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConv = (conv) => {
    setConversation(conv)
    navigate(`/chat/${conv.id}`, { replace: true })
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
      toast.error(err?.message || 'Gửi tin thất bại.')
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

  const handleMeetupRespond = async (meetupId, action) => {
    setResponding(meetupId)
    try {
      await meetupService.respond(meetupId, action)
      toast.success(action === 'accept' ? 'Đã đồng ý hẹn! 💕' : 'Đã từ chối.')
      setMeetups((cur) =>
        cur.map((m) => m.id === meetupId ? { ...m, status: action === 'accept' ? 'Accepted' : 'Declined' } : m),
      )
    } catch (err) {
      toast.error(err?.message || 'Không thể phản hồi.')
    } finally {
      setResponding(null)
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
              <ChatThreadToolbar conversation={conversation} onBack={() => { setConversation(null); navigate('/chat') }} />

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
                        className={`chat-msg${m.isMine ? ' is-mine' : ''}`}
                        variants={msgVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <VenueMessage
                          venue={{ id: m.venueId, name: m.venueName, imageUrl: m.venueImageUrl, address: m.venueAddress, category: m.venueCategory, distanceKm: m.distanceKm }}
                          meta={m.isMine ? 'Bạn đã chia sẻ' : `${conversation?.otherDisplayName} đã chia sẻ`}
                          onClick={() => openVenueDetail({ id: m.venueId, venueName: m.venueName })}
                        />
                        <div className="chat-msg-time">{timeAgo(m.sentAt)}</div>
                      </motion.div>
                    )
                  }
                  return (
                    <motion.div
                      key={m.id}
                      className={`chat-msg${m.isMine ? ' is-mine' : ''}`}
                      variants={msgVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <div className="chat-bubble">{m.content}</div>
                      <div className="chat-msg-time">{timeAgo(m.sentAt)}</div>
                    </motion.div>
                  )
                })}

                {meetups.filter((mu) => mu.status === 'Proposed' && !mu.isMine).map((mu) => (
                  <motion.div
                    key={mu.id}
                    className="chat-meetup-proposal"
                    variants={msgVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <div className="chat-meetup-proposal-header">💌 {conversation?.otherDisplayName} đề xuất hẹn</div>
                    <div className="chat-meetup-proposal-card">
                      <div className="chat-meetup-proposal-venue">📍 {mu.venueName || `Quán #${mu.venueId}`}</div>
                      <div className="chat-meetup-proposal-time">⏰ {formatMeetupTime(mu.proposedAt)}</div>
                      {mu.note && <div className="chat-meetup-proposal-note">{mu.note}</div>}
                      <div className="chat-meetup-proposal-actions">
                        <button className="chat-meetup-accept-btn" disabled={responding === mu.id} onClick={() => handleMeetupRespond(mu.id, 'accept')}>
                          {responding === mu.id ? <span className="spinner" /> : '💕 Đồng ý'}
                        </button>
                        <button className="chat-meetup-decline-btn" disabled={responding === mu.id} onClick={() => handleMeetupRespond(mu.id, 'decline')}>
                          Không
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {meetups.filter((mu) => mu.status === 'Accepted').map((mu) => (
                  <motion.div
                    key={mu.id}
                    className="chat-meetup-accepted"
                    variants={msgVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <div className="chat-meetup-accepted-icon"><Check2Icon size={18} /></div>
                    <div>
                      <div className="chat-meetup-accepted-title">Buổi hẹn đã chốt!</div>
                      <div className="chat-meetup-accepted-detail">{mu.venueName} · {formatMeetupTime(mu.proposedAt)}</div>
                    </div>
                  </motion.div>
                ))}

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

              {conversation?.matchId && (
                <div className="chat-ai-panel-wrapper">
                  <AISuggestionPanel matchId={conversation.matchId} onPick={(t) => setText(t)} />
                </div>
              )}

              <VenueDetailModal venue={detailVenue} open={detailOpen} onClose={() => setDetailOpen(false)} onPropose={() => toast.info('Mở mục Hẹn hò trên Cây tình yêu để đề xuất.')} />

              <form className="chat-input-bar" onSubmit={send}>
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
