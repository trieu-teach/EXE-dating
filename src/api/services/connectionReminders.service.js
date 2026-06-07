import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'
import { MEETUP_VENUES } from '../../data/connectionNudges.js'
import {
  daysSince,
  getConversationTracking,
  getMeetupProposal,
  hoursSince,
} from '../../utils/connectionTracking.js'
import {
  canSuggestDateFromTree,
  getLoveTreeState,
  loveTreeToDisplayState,
} from '../../utils/loveTreeState.js'

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

function isWeekend() {
  const d = new Date().getDay()
  return d === 0 || d === 6
}

function isMorningWindow() {
  const h = new Date().getHours()
  return h >= 6 && h < 12
}

function buildNudgesForConversation(conversation, messages = []) {
  const tracking = getConversationTracking(conversation.id)
  const dismissed = new Set(tracking.dismissedNudges ?? [])
  const partnerName = conversation.partnerName ?? 'đối phương'
  const nudges = []

  const lastUserAt = tracking.lastUserMessageAt
  const lastAnyAt = conversation.lastMessageAt
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const greetedToday = tracking.greetedToday === new Date().toISOString().slice(0, 10)
  const hasMeetup = Boolean(getMeetupProposal(conversation.id))

  if (conversation.unreadCount > 0 && !dismissed.has('reply_waiting')) {
    nudges.push({
      id: 'reply_waiting',
      priority: 5,
      icon: '💬',
      title: `${partnerName} đang chờ bạn trả lời`,
      desc: 'Một tin nhắn ngắn giúp hai bạn không bị ngắt kết nối.',
      actionLabel: 'Trả lời ngay',
      tone: 'urgent',
    })
  }

  if (isMorningWindow() && !greetedToday && !dismissed.has('morning_greeting')) {
    nudges.push({
      id: 'morning_greeting',
      priority: 3,
      icon: '☀️',
      title: `Gửi lời chào sáng cho ${partnerName}`,
      desc: 'Thói quen nhỏ mỗi sáng — giữ người kia trong tâm trí.',
      actionLabel: 'Gửi lời chào',
      tone: 'warm',
    })
  }

  const inactiveDays = daysSince(lastAnyAt)
  if (inactiveDays !== null && inactiveDays >= 2 && !dismissed.has('inactive_reminder')) {
    nudges.push({
      id: 'inactive_reminder',
      priority: 4,
      icon: '🔔',
      title: `Đã ${inactiveDays} ngày không trò chuyện`,
      desc: `Hãy nhắn ${partnerName} — kết nối thật cần được nuôi dưỡng.`,
      actionLabel: 'Nhắn tin',
      tone: 'urgent',
    })
  }

  const treeState = getLoveTreeState(conversation.id)
  const treeDisplay = loveTreeToDisplayState(treeState)
  const dateReady = canSuggestDateFromTree(treeState)

  if (dateReady && !hasMeetup && !dismissed.has('ready_to_meet')) {
    nudges.push({
      id: 'ready_to_meet',
      priority: 6,
      icon: '🤝',
      title: `Cây cấp ${treeDisplay.level} · ${treeDisplay.stageLabel} — hẹn hò thật?`,
      desc: `Cây tình yêu đủ lớn! Gợi ý địa điểm gần chỗ hai bạn cho ${partnerName}.`,
      actionLabel: 'Đề xuất hẹn',
      tone: 'meetup',
      showMeetupCard: true,
    })
  } else if (userMessageCount >= 6 && !hasMeetup && !dismissed.has('ready_to_meet')) {
    nudges.push({
      id: 'ready_to_meet',
      priority: 2,
      icon: '🤝',
      title: 'Sẵn sàng gặp mặt ngoài đời?',
      desc: 'Hãy chăm cây tình yêu (tưới nước, gửi nắng, bón yêu) để mở hẹn gặp!',
      actionLabel: 'Đề xuất hẹn',
      tone: 'meetup',
      showMeetupCard: true,
    })
  }

  if (isWeekend() && hoursSince(lastUserAt) !== null && hoursSince(lastUserAt) >= 20) {
    if (!dismissed.has('weekend_push')) {
      nudges.push({
        id: 'weekend_push',
        priority: 3,
        icon: '📅',
        title: 'Cuối tuần — cơ hội gặp mặt',
        desc: `Rủ ${partnerName} cafe hoặc đi dạo — SameMess gợi ý địa điểm an toàn.`,
        actionLabel: 'Gợi ý hẹn',
        tone: 'meetup',
        showMeetupCard: true,
      })
    }
  }

  if (
    !dismissed.has('thinking_of_you') &&
    userMessageCount >= 2 &&
    (daysSince(lastUserAt) ?? 0) >= 1
  ) {
    nudges.push({
      id: 'thinking_of_you',
      priority: 1,
      icon: '💭',
      title: `Nhắc nhở: nghĩ đến ${partnerName}`,
      desc: 'Gửi một câu hỏi mở — ví dụ: “Cuối tuần bạn thích làm gì?”',
      actionLabel: 'Gửi tin nhắn',
      tone: 'warm',
    })
  }

  return nudges.sort((a, b) => b.priority - a.priority)
}

export const connectionRemindersService = {
  async getReminders(conversations = [], messagesByConvo = {}) {
    return withMockFallback(
      () => get(API_ENDPOINTS.connection.reminders),
      async () => {
        await delay()

        const items = conversations
          .map((convo) => {
            const nudges = buildNudgesForConversation(
              convo,
              messagesByConvo[convo.id] ?? [],
            )
            const top = nudges[0]
            if (!top) return null

            return {
              conversationId: convo.id,
              partnerId: convo.partnerId,
              partnerName: convo.partnerName,
              partnerImage: convo.partnerImage,
              nudges,
              topNudge: top,
              warmthScore: Math.max(20, 100 - (daysSince(convo.lastMessageAt) ?? 0) * 12),
            }
          })
          .filter(Boolean)
          .sort((a, b) => b.topNudge.priority - a.topNudge.priority)

        return {
          reminders: items,
          total: items.length,
          headline:
            items.length > 0
              ? `${items.length} người đang chờ bạn nhớ đến họ`
              : 'Kết nối đang ổn — tiếp tục trò chuyện nhé!',
        }
      },
    )
  },

  async getConversationNudges(conversation, messages = []) {
    return withMockFallback(
      () => get(API_ENDPOINTS.connection.nudges(conversation.id)),
      async () => {
        await delay(100)
        const nudges = buildNudgesForConversation(conversation, messages)
        const venue = MEETUP_VENUES[0]
        return {
          nudges,
          suggestedVenue: venue,
          meetupReady: nudges.some((n) => n.showMeetupCard),
        }
      },
    )
  },

  async dismissNudge(conversationId, nudgeId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.connection.dismissNudge(conversationId), { nudgeId }),
      async () => ({ success: true }),
    )
  },

  async proposeMeetup(conversationId, payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.connection.proposeMeetup(conversationId), payload),
      async () => {
        await delay(300)
        return { success: true, ...payload }
      },
    )
  },
}

export { buildNudgesForConversation }
