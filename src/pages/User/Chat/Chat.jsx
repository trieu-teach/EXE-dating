import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { chatService, connectionRemindersService } from '../../../api/index.js'
import { formatMessageTime } from '../../../api/mocks/chat.mock.js'
import AppShell from '../../../components/User/AppShell/AppShell.jsx'
import AsyncContent from '../../../components/User/AsyncContent/AsyncContent.jsx'
import ChatAiAssistant from '../../../components/User/ChatAiAssistant/ChatAiAssistant.jsx'
import ChatThreadToolbar from '../../../components/User/ChatThreadToolbar/ChatThreadToolbar.jsx'
import ConnectionReminderList from '../../../components/User/ConnectionReminderList/ConnectionReminderList.jsx'
import LoveTreeBondBar from '../../../components/User/LoveTreeBondBar/LoveTreeBondBar.jsx'
import { buildQuickNudgeMessage } from '../../../data/connectionNudges.js'
import { useAsync } from '../../../hooks/useAsync.js'
import { useMutation } from '../../../hooks/useMutation.js'
import {
  getConversationTracking,
  markDateInviteHandled,
  markNudgeDismissed,
} from '../../../utils/connectionTracking.js'
import {
  canSuggestDateFromTree,
  getLoveTreeState,
} from '../../../utils/loveTreeState.js'
import './Chat.css'

function Chat() {
  const { conversationId: paramId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const matchState = location.state
  const hasThread = Boolean(paramId)
  const chatBodyRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [dailyQuest, setDailyQuest] = useState(null)
  const [draft, setDraft] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiData, setAiData] = useState({ suggestions: [], insight: '' })
  const [aiLoading, setAiLoading] = useState(false)
  const [activeNudges, setActiveNudges] = useState([])
  const [treeState, setTreeState] = useState({ level: 1, attachmentPercent: 0 })

  const {
    data: convData,
    loading: convLoading,
    error: convError,
    refetch: refetchConversations,
  } = useAsync(() => chatService.getConversations(), [])

  const {
    data: msgData,
    loading: msgLoading,
    error: msgError,
    refetch: refetchMessages,
  } = useAsync(
    () => (paramId ? chatService.getMessages(paramId) : Promise.resolve(null)),
    [paramId],
  )

  const conversations = convData?.conversations ?? []

  const messagesByConvo = paramId ? { [paramId]: messages } : {}

  const { data: reminderData, refetch: refetchReminders } = useAsync(
    () =>
      conversations.length
        ? connectionRemindersService.getReminders(conversations, messagesByConvo)
        : Promise.resolve({ reminders: [], total: 0, headline: '' }),
    [conversations, messages],
  )

  const reminders = reminderData?.reminders ?? []

  useEffect(() => {
    if (!paramId || !matchState?.partnerName) return
    chatService.ensureConversation({
      id: paramId,
      name: matchState.partnerName,
      image: matchState.partnerImage,
      matchPercent: matchState.matchPercent,
    })
    refetchConversations()
  }, [paramId, matchState, refetchConversations])

  useEffect(() => {
    if (!paramId || !matchState?.showMeetup) return
    navigate(`/meet-up/${paramId}`, { replace: true })
  }, [paramId, matchState?.showMeetup, navigate])

  const activeConvo = paramId
    ? conversations.find((c) => c.id === paramId) ??
      (matchState?.partnerName
        ? {
            id: paramId,
            partnerId: paramId,
            partnerName: matchState.partnerName,
            partnerAvatar: '💕',
            partnerImage: matchState.partnerImage,
            matchPercent: matchState.matchPercent ?? '—',
            status: 'Vừa match',
            lastMessage: '',
            unreadCount: 0,
          }
        : null)
    : null

  const loadConversationNudges = useCallback(async () => {
    if (!activeConvo) {
      setActiveNudges([])
      return
    }
    const result = await connectionRemindersService.getConversationNudges(activeConvo, messages)
    setActiveNudges(result.nudges ?? [])
  }, [activeConvo, messages])

  useEffect(() => {
    if (msgData?.messages) {
      setMessages(msgData.messages)
      if (paramId) setTreeState(getLoveTreeState(paramId))
    }
    if (msgData?.dailyQuest) setDailyQuest(msgData.dailyQuest)
    if (msgData) refetchConversations()
  }, [msgData, refetchConversations, paramId])

  useEffect(() => {
    if (!msgLoading && activeConvo) loadConversationNudges()
  }, [msgLoading, activeConvo, loadConversationNudges])

  const loadAiSuggestions = useCallback(async () => {
    if (!paramId) return
    const chatMessages = messages.filter((m) => m.role !== 'system')
    if (!chatMessages.length) {
      setAiData({ suggestions: [], insight: 'Bắt đầu trò chuyện để AI gợi ý phản hồi.' })
      return
    }
    setAiLoading(true)
    try {
      const result = await chatService.getAiSuggestions(
        paramId,
        chatMessages,
        activeConvo?.partnerName,
      )
      setAiData({
        suggestions: result.suggestions ?? [],
        insight: result.insight ?? '',
      })
    } finally {
      setAiLoading(false)
    }
  }, [messages, paramId, activeConvo?.partnerName])

  useEffect(() => {
    if (!aiOpen || msgLoading || !paramId) return undefined
    const timer = setTimeout(loadAiSuggestions, 500)
    return () => clearTimeout(timer)
  }, [messages, aiOpen, msgLoading, loadAiSuggestions, paramId])

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const { mutate: sendMessage, loading: sending } = useMutation((content) =>
    chatService.sendMessage(paramId, content),
  )

  async function handleSend(e, textOverride) {
    e?.preventDefault()
    const text = (textOverride ?? draft).trim()
    if (!text || sending || !paramId) return
    if (!textOverride) setDraft('')
    try {
      const { message } = await sendMessage(text)
      setMessages((prev) => [...prev, message])
      refetchConversations()
      refetchReminders()
      loadConversationNudges()
    } catch {
      if (!textOverride) setDraft(text)
    }
  }

  function handleSelectSuggestion(text) {
    setDraft(text)
  }

  function handleNudgeAction(nudge) {
    if (!activeConvo) return
    if (nudge.id === 'ready_to_meet' || nudge.id === 'weekend_push') {
      navigate(`/meet-up/${paramId}`)
      return
    }
    const text = buildQuickNudgeMessage(nudge.id, activeConvo.partnerName)
    setDraft(text)
    if (nudge.tone === 'urgent') {
      handleSend(null, text)
    }
  }

  async function handleDismissNudge(nudge) {
    if (!paramId) return
    markNudgeDismissed(paramId, nudge.id)
    if (nudge.id === 'intimacy_date_invite') {
      markDateInviteHandled(paramId, false)
    }
    await connectionRemindersService.dismissNudge(paramId, nudge.id)
    loadConversationNudges()
    refetchReminders()
  }

  function openConversation(id, state = {}) {
    navigate(`/chat/${id}`, { state })
  }

  function handleBackToList() {
    navigate('/chat')
  }

  const partnerId = activeConvo?.partnerId ?? paramId
  const currentTree = paramId ? getLoveTreeState(paramId) : treeState
  const tracking = paramId ? getConversationTracking(paramId) : {}
  const dismissed = new Set(tracking.dismissedNudges ?? [])
  const topNudge = activeNudges.find(
    (n) =>
      !dismissed.has(n.id) &&
      !(n.id === 'intimacy_date_invite' && tracking.dateInviteAccepted),
  )

  return (
    <AppShell activeNav="chat">
      <div className={`chat-page${hasThread ? ' chat-page--thread-open' : ''}`}>
        <aside className="chat-sidebar" aria-label="Danh sách tin nhắn">
          <header className="chat-sidebar__head">
            <h2>Tin nhắn</h2>
            <span className="chat-sidebar__count">{conversations.length} cuộc trò chuyện</span>
          </header>

          <ConnectionReminderList
            reminders={reminders}
            onOpenChat={(id) => openConversation(id)}
            onMeetUp={(id) => navigate(`/meet-up/${id}`)}
          />

          <AsyncContent
            loading={convLoading}
            error={convError}
            onRetry={refetchConversations}
            loadingLabel="Đang tải hội thoại..."
          >
            <ul className="chat-sidebar__list">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`chat-sidebar__item${c.id === paramId ? ' chat-sidebar__item--active' : ''}${c.unreadCount ? ' chat-sidebar__item--unread' : ''}`}
                    onClick={() => openConversation(c.id)}
                  >
                    <span className="chat-sidebar__avatar">
                      {c.partnerImage ? (
                        <img src={c.partnerImage} alt="" />
                      ) : (
                        c.partnerAvatar
                      )}
                      {c.status?.includes('online') && (
                        <span className="chat-sidebar__online" aria-label="Đang online" />
                      )}
                    </span>
                    <span className="chat-sidebar__body">
                      <span className="chat-sidebar__row">
                        <strong>{c.partnerName}</strong>
                        <time dateTime={c.lastMessageAt}>
                          {formatMessageTime(c.lastMessageAt)}
                        </time>
                      </span>
                      <span className="chat-sidebar__preview">{c.lastMessage}</span>
                      <LoveTreeBondBar
                        treeState={getLoveTreeState(c.id)}
                        partnerId={c.partnerId ?? c.id}
                        compact
                      />
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="chat-sidebar__badge" aria-label={`${c.unreadCount} tin chưa đọc`}>
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </AsyncContent>

          <Link to="/daily-connection" className="chat-sidebar__link">
            🔥 Nhiệm vụ ngày
          </Link>
        </aside>

        <section className="chat-main" aria-label="Nội dung trò chuyện">
          {!hasThread && (
            <div className="chat-empty">
              <div className="chat-empty__icon">💬</div>
              <h3>Chọn cuộc trò chuyện</h3>
              <p>
                {reminders.length > 0
                  ? `${reminders.length} người đang chờ bạn nhắn — bấm tên bên trái nhé.`
                  : 'Bấm vào tên bên trái để xem tin nhắn — giống Messenger.'}
              </p>
              {reminders.length > 0 && (
                <button
                  type="button"
                  className="chat-empty__cta"
                  onClick={() => openConversation(reminders[0].conversationId)}
                >
                  Nhắn {reminders[0].partnerName} ngay
                </button>
              )}
            </div>
          )}

          {hasThread && (
            <AsyncContent
              loading={msgLoading}
              error={msgError}
              onRetry={refetchMessages}
              loadingLabel="Đang tải tin nhắn..."
            >
              {activeConvo && (
                <>
                  <header className="chat-header">
                    <button
                      type="button"
                      className="chat-header__back"
                      onClick={handleBackToList}
                      aria-label="Quay lại danh sách"
                    >
                      ←
                    </button>
                    <span className="chat-header__avatar">
                      {activeConvo.partnerImage ? (
                        <img src={activeConvo.partnerImage} alt="" className="chat-header__avatar-img" />
                      ) : (
                        activeConvo.partnerAvatar
                      )}
                    </span>
                    <div className="chat-header__info">
                      <strong>{activeConvo.partnerName}</strong>
                      <span className="chat-header__status">{activeConvo.status}</span>
                    </div>
                    {canSuggestDateFromTree(currentTree) && (
                      <Link to={`/meet-up/${partnerId}`} className="chat-header__meet-link">
                        📅 Hẹn gặp
                      </Link>
                    )}
                    <button
                      type="button"
                      className={`chat-header__ai-toggle${aiOpen ? ' chat-header__ai-toggle--on' : ''}`}
                      onClick={() => setAiOpen((v) => !v)}
                      aria-pressed={aiOpen}
                    >
                      ✨ AI
                    </button>
                  </header>

                  <ChatThreadToolbar
                    partnerId={partnerId}
                    partnerName={activeConvo.partnerName}
                    treeState={currentTree}
                    topNudge={topNudge}
                    onNudgeAction={handleNudgeAction}
                    onDismissNudge={handleDismissNudge}
                  />

                  {dailyQuest && (
                    <div className="chat-banner chat-banner--compact">
                      Ngày {dailyQuest.day} · {dailyQuest.title}
                    </div>
                  )}

                  <div className="chat-body" ref={chatBodyRef}>
                    {messages.length === 0 && (
                      <p className="chat-body__hint">Chưa có tin nhắn — hãy gửi lời chào đầu tiên!</p>
                    )}
                    {messages.map((m) =>
                      m.role === 'system' ? (
                        <div key={m.id} className="chat-icebreaker">
                          <p>{m.content}</p>
                        </div>
                      ) : m.role === 'partner' ? (
                        <div key={m.id} className="chat-row chat-row--in">
                          <span className="chat-row__avatar">
                            {activeConvo.partnerImage ? (
                              <img src={activeConvo.partnerImage} alt="" />
                            ) : (
                              activeConvo.partnerAvatar
                            )}
                          </span>
                          <div className="chat-bubble chat-bubble--in">{m.content}</div>
                        </div>
                      ) : (
                        <div key={m.id} className="chat-row chat-row--out">
                          <div className="chat-bubble chat-bubble--out">{m.content}</div>
                        </div>
                      ),
                    )}
                  </div>

                  {aiOpen && (
                    <ChatAiAssistant
                      insight={aiData.insight}
                      suggestions={aiData.suggestions}
                      loading={aiLoading}
                      onSelect={handleSelectSuggestion}
                      onRefresh={loadAiSuggestions}
                      disabled={sending}
                    />
                  )}

                  <form className="chat-input-bar" onSubmit={handleSend}>
                    {canSuggestDateFromTree(currentTree) ? (
                      <Link
                        to={`/meet-up/${partnerId}`}
                        className="chat-input-bar__icon chat-input-bar__icon--link"
                        aria-label="Gợi ý hẹn gặp"
                        title="Gợi ý hẹn gặp"
                      >
                        📅
                      </Link>
                    ) : (
                      <span
                        className="chat-input-bar__icon chat-input-bar__icon--disabled"
                        title="Chăm cây đến cấp 4 để hẹn gặp"
                      >
                        🔒
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="chat-input-bar__send"
                      disabled={!draft.trim() || sending}
                    >
                      Gửi
                    </button>
                  </form>
                </>
              )}
            </AsyncContent>
          )}
        </section>
      </div>
    </AppShell>
  )
}

export default Chat
