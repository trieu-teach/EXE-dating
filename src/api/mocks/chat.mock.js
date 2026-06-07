import { MOCK_CANDIDATES } from './discovery.mock.js'

function pick(id) {
  return MOCK_CANDIDATES.find((c) => c.id === id)
}

const minh = pick('minh')
const linh = pick('linh')
const thao = pick('thao')

export const MOCK_CONVERSATIONS = [
  {
    id: 'linh',
    partnerId: 'linh',
    partnerName: linh.name,
    partnerAvatar: '💕',
    partnerImage: linh.image,
    matchPercent: 88,
    status: 'Đang online',
    lastMessage: 'Cuối tuần này bạn rảnh đi cafe không? ☕',
    lastMessageAt: '2024-08-21T09:12:00Z',
    unreadCount: 2,
  },
  {
    id: 'minh',
    partnerId: 'minh',
    partnerName: minh.name,
    partnerAvatar: '👨',
    partnerImage: minh.image,
    matchPercent: 95,
    status: 'Đang online',
    lastMessage: 'Cuối tuần này bạn có muốn leo Ba Vì không?',
    lastMessageAt: '2024-08-20T18:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'thao',
    partnerId: 'thao',
    partnerName: thao.name,
    partnerAvatar: '💕',
    partnerImage: thao.image,
    matchPercent: 82,
    status: 'Hoạt động 2 giờ trước',
    lastMessage: 'Mình thấy bạn cũng thích chụp ảnh nè 📸',
    lastMessageAt: '2024-08-19T14:05:00Z',
    unreadCount: 0,
  },
]

export const MOCK_MESSAGES_BY_CONVERSATION = {
  linh: [
    {
      id: 'l1',
      role: 'partner',
      content: 'Chào bạn! Mình là Linh, rất vui được kết nối 💕',
      createdAt: '2024-08-21T08:50:00Z',
    },
    {
      id: 'l2',
      role: 'user',
      content: 'Chào Linh! Mình cũng thích du lịch và yoga.',
      createdAt: '2024-08-21T08:55:00Z',
    },
    {
      id: 'l3',
      role: 'partner',
      content: 'Cuối tuần này bạn rảnh đi cafe không? ☕',
      createdAt: '2024-08-21T09:12:00Z',
    },
  ],
  minh: [
    {
      id: 'm1',
      role: 'system',
      content: 'Điều phiêu lưu nhất bạn từng làm là gì?',
      createdAt: '2024-08-20T10:00:00Z',
    },
    {
      id: 'm2',
      role: 'partner',
      content:
        'Chào bạn! Mình thấy hai ta cùng thích leo núi. Tuần trước bạn có lên Ba Vì chưa?',
      createdAt: '2024-08-20T10:05:00Z',
    },
    {
      id: 'm3',
      role: 'user',
      content:
        'Có rồi! Mình đi cuối tuần rồi, view đỉnh núi đẹp lắm. Trời mát, mây tan từ sáng sớm.',
      createdAt: '2024-08-20T10:08:00Z',
    },
    {
      id: 'm4',
      role: 'partner',
      content: 'Cuối tuần này bạn có muốn leo Ba Vì không?',
      createdAt: '2024-08-20T18:30:00Z',
    },
  ],
  thao: [
    {
      id: 't1',
      role: 'partner',
      content: 'Hi! Profile bạn đẹp quá, mình là Thảo nè 😊',
      createdAt: '2024-08-19T13:40:00Z',
    },
    {
      id: 't2',
      role: 'partner',
      content: 'Mình thấy bạn cũng thích chụp ảnh nè 📸',
      createdAt: '2024-08-19T14:05:00Z',
    },
  ],
}

export const MOCK_DAILY_QUEST = {
  day: 4,
  title: 'Chia sẻ một sở thích bí mật để giữ lửa yêu thương!',
}

/** Gợi ý AI mock — đọc ngữ cảnh tin nhắn (chuẩn bị thay bằng API) */
export function buildMockAiSuggestions(messages, partnerName = 'đối phương') {
  const partnerMsgs = messages.filter((m) => m.role === 'partner')
  const lastPartner = partnerMsgs[partnerMsgs.length - 1]
  const text = (lastPartner?.content || '').toLowerCase()

  let suggestions = []
  let insight = `Gợi ý dựa trên cuộc trò chuyện với ${partnerName}.`

  if (
    text.includes('leo') ||
    text.includes('ba vì') ||
    text.includes('núi') ||
    text.includes('trek')
  ) {
    suggestions = [
      {
        id: 's1',
        text: 'Mình đi Ba Vì lần trước — hoàng hôn trên đỉnh đẹp lắm, bạn thử chưa?',
        tone: 'curious',
      },
      {
        id: 's2',
        text: 'Cuối tuần này thời tiết Hà Nội mát, hay mình hẹn leo nhẹ ở Ba Vì?',
        tone: 'date',
      },
      {
        id: 's3',
        text: 'Mình chụp được vài tấm panorama trên đỉnh — gửi bạn xem nhé 📸',
        tone: 'warm',
      },
    ]
    insight = `${partnerName} đang mở chủ đề leo núi — cơ hội tốt để gợi ý hẹn ngoài trời gần Hà Nội.`
  } else if (text.includes('cà phê') || text.includes('cafe') || text.includes('cf')) {
    suggestions = [
      {
        id: 's1',
        text: 'Mình biết quán view đẹp ở Quận 1, chiều nào rảnh không?',
        tone: 'date',
      },
      { id: 's2', text: 'Bạn thích cà phê robusta hay arabica vậy?', tone: 'curious' },
      { id: 's3', text: 'Hay mình thử workshop pha cà phê ở Quận 3 cùng nhau?', tone: 'warm' },
    ]
  } else if (text.includes('?')) {
    suggestions = [
      {
        id: 's1',
        text: 'Ừ, mình cũng thích vậy! Bạn thường đi cuối tuần phải không?',
        tone: 'friendly',
      },
      { id: 's2', text: 'Câu hỏi hay đó — để mình kể thêm một chút nhé 😊', tone: 'warm' },
      {
        id: 's3',
        text: 'Mình tò mò, bạn thích hẹn ngoài trời hay quán cà phê hơn?',
        tone: 'curious',
      },
    ]
  } else {
    suggestions = [
      {
        id: 's1',
        text: `Nghe ${partnerName} chia sẻ thú vị quá — kể thêm cho mình với!`,
        tone: 'warm',
      },
      {
        id: 's2',
        text: 'Mình thấy hợp vibe với bạn, hay đổi qua sở thích cuối tuần?',
        tone: 'curious',
      },
      {
        id: 's3',
        text: 'Nếu bạn rảnh, mình muốn mời bạn đi sự kiện SameMess tuần này 🎟️',
        tone: 'date',
      },
    ]
  }

  return {
    suggestions,
    insight,
    generatedAt: new Date().toISOString(),
  }
}

export function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export function formatMessageTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
