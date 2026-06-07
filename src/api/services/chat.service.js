import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'
import {
  MOCK_CONVERSATIONS,
  MOCK_DAILY_QUEST,
  MOCK_MESSAGES_BY_CONVERSATION,
  buildMockAiSuggestions,
  delay,
} from '../mocks/chat.mock.js'
import { recordUserMessage } from '../../utils/connectionTracking.js'

const conversationStore = MOCK_CONVERSATIONS.map((c) => ({ ...c }))
const messageStore = { ...MOCK_MESSAGES_BY_CONVERSATION }

function sortConversations() {
  conversationStore.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )
}

function touchConversation(id, lastMessage, fromPartner = false) {
  const convo = conversationStore.find((c) => c.id === id)
  if (!convo) return
  convo.lastMessage = lastMessage
  convo.lastMessageAt = new Date().toISOString()
  if (fromPartner) convo.unreadCount = (convo.unreadCount || 0) + 1
  sortConversations()
}

export const chatService = {
  /** GET /chat/conversations */
  async getConversations() {
    return withMockFallback(
      () => get(API_ENDPOINTS.chat.conversations),
      async () => {
        await delay(300)
        sortConversations()
        return { conversations: conversationStore.map((c) => ({ ...c })) }
      },
    )
  },

  /** Tạo hoặc lấy hội thoại sau khi match */
  ensureConversation({ id, name, image, matchPercent = '—' }) {
    let convo = conversationStore.find((c) => c.id === id)
    if (!convo) {
      convo = {
        id,
        partnerId: id,
        partnerName: name,
        partnerAvatar: '💕',
        partnerImage: image,
        matchPercent,
        status: 'Vừa match',
        lastMessage: `${name} đã kết nối với bạn`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      }
      conversationStore.unshift(convo)
      messageStore[id] = [
        {
          id: `welcome-${id}`,
          role: 'partner',
          content: `Chào bạn! Mình là ${name}, rất vui được trò chuyện cùng bạn 💕`,
          createdAt: new Date().toISOString(),
        },
      ]
      sortConversations()
    }
    return { ...convo }
  },

  markAsRead(conversationId) {
    const convo = conversationStore.find((c) => c.id === conversationId)
    if (convo) convo.unreadCount = 0
  },

  /** GET /chat/conversations/:id/messages */
  async getMessages(conversationId) {
    return withMockFallback(
      () => get(API_ENDPOINTS.chat.messages(conversationId)),
      async () => {
        await delay(250)
        this.markAsRead(conversationId)
        const messages = messageStore[conversationId] ?? []
        return {
          messages,
          dailyQuest: MOCK_DAILY_QUEST,
        }
      },
    )
  },

  /** POST /chat/conversations/:id/messages */
  async sendMessage(conversationId, content) {
    return withMockFallback(
      () =>
        post(API_ENDPOINTS.chat.send(conversationId), {
          content,
        }),
      async () => {
        await delay(200)
        const msg = {
          id: `m-${Date.now()}`,
          role: 'user',
          content,
          createdAt: new Date().toISOString(),
        }
        if (!messageStore[conversationId]) messageStore[conversationId] = []
        messageStore[conversationId].push(msg)
        touchConversation(conversationId, content, false)
        recordUserMessage(conversationId)
        return { message: msg }
      },
    )
  },

  /**
   * POST /chat/conversations/:id/ai-suggestions
   */
  async getAiSuggestions(conversationId, messages, partnerName) {
    return withMockFallback(
      () =>
        post(API_ENDPOINTS.chat.aiSuggestions(conversationId), {
          messages: messages.map(({ id, role, content, createdAt }) => ({
            id,
            role,
            content,
            createdAt,
          })),
        }),
      async () => {
        await delay(600)
        return buildMockAiSuggestions(messages, partnerName)
      },
    )
  },
}
