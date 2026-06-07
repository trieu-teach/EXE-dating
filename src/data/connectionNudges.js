/** Mẫu địa điểm hẹn gặp — gợi ý theo ngữ cảnh */
export const MEETUP_VENUES = [
  {
    id: 'cafe-q1',
    name: 'The Note Coffee — Quận 1',
    type: 'cafe',
    icon: '☕',
    desc: 'Không gian ấm, phù hợp buổi hẹn đầu tiên',
    duration: '45–60 phút',
  },
  {
    id: 'park-walk',
    name: 'Công viên 23/9 — đi dạo',
    type: 'outdoor',
    icon: '🌳',
    desc: 'Thoải mái, ít áp lực, dễ trò chuyện',
    duration: '60–90 phút',
  },
  {
    id: 'workshop',
    name: 'Workshop gốm mini — Quận 3',
    type: 'activity',
    icon: '🎨',
    desc: 'Làm việc cùng nhau — tạo kỷ niệm thật',
    duration: '2 giờ',
  },
]

export const MEETUP_TIME_SLOTS = [
  { id: 'today_pm', label: 'Chiều nay', sub: '16:00 – 17:30' },
  { id: 'sat_am', label: 'Thứ 7 sáng', sub: '09:30 – 11:00' },
  { id: 'sun_noon', label: 'Chủ nhật trưa', sub: '11:30 – 13:00' },
]

export function buildMeetupInviteMessage({ partnerName, venue, timeSlot }) {
  return `Mình muốn hẹn ${partnerName} gặp mặt thật nhé! 📍 ${venue.name} — ${timeSlot.label} (${timeSlot.sub}). Bạn thấy sao?`
}

export function buildQuickNudgeMessage(nudgeId, partnerName) {
  const templates = {
    morning_greeting: `Chào buổi sáng ${partnerName}! ☀️ Hôm nay bạn thế nào?`,
    inactive_reminder: `${partnerName} ơi, mình nghĩ đến bạn — cuối tuần này rảnh trò chuyện không?`,
    reply_waiting: `Xin lỗi để bạn chờ — mình vừa rảnh, kể mình nghe thêm nhé ${partnerName} 😊`,
    weekend_push: `Cuối tuần rồi ${partnerName}! Hay mình gặp nhau uống cà phê cho thật? ☕`,
    thinking_of_you: `Nay bận quá nhưng cứ nghĩ đến ${partnerName} — tối nay bạn rảnh không?`,
  }
  return templates[nudgeId] ?? `Chào ${partnerName}! Hôm nay bạn thế nào?`
}
