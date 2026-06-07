import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export const dailyService = {
  async getConnection() {
    return withMockFallback(
      () => get(API_ENDPOINTS.daily.connection),
      async () => {
        await delay()
        return {
          streakDay: 4,
          streakTotal: 7,
          rewardProgress: 57,
          quests: [
            {
              id: 'think-of-them',
              icon: '💭',
              title: 'Nhắc nhở nhớ đến nhau',
              desc: 'Gửi 1 tin nhắn cho người bạn đang match — giữ lửa trước khi hẹn gặp',
              type: 'solo',
              cta: '/chat',
            },
            {
              id: 'lunch',
              icon: '🍽️',
              title: 'Chia sẻ bữa trưa',
              desc: 'Gửi ảnh bữa trưa hôm nay cho đối phương',
              type: 'solo',
            },
            {
              id: 'meetup-plan',
              icon: '🤝',
              title: 'Lên kế hoạch gặp mặt',
              desc: 'Chọn quán cafe hoặc công viên — đặt lịch hẹn thật trong tuần này',
              type: 'joint',
              cta: '/chat',
            },
            {
              id: 'dream',
              icon: '✈️',
              title: 'Điểm đến mơ ước',
              desc: 'Phú Quốc, Đà Lạt hay Sa Pa — hai bạn muốn đi đâu cùng nhau?',
              type: 'joint',
            },
          ],
        }
      },
    )
  },

  async completeTogether(questIds) {
    return withMockFallback(
      () => post(API_ENDPOINTS.daily.complete, { questIds }),
      async () => ({ success: true }),
    )
  },
}
