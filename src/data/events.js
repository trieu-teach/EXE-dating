export const EVENT_CATEGORIES = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'dining', label: 'Ăn uống' },
  { id: 'outdoor', label: 'Ngoài trời' },
]

export const FEATURED_EVENT_ID = 'sunset-vineyard'

export const EVENTS = [
  {
    id: 'sunset-vineyard',
    title: 'Thưởng thức rượu vang hoàng hôn',
    category: 'dining',
    premiumOnly: true,
    almostSoldOut: true,
    date: 'Thứ Bảy, 24/08',
    time: '16:00 – 20:00',
    location: 'Thung lũng rượu vang Đà Lạt',
    address: 'Đồi thông Mộng Mo, Đà Lạt, Lâm Đồng',
    attendees: 42,
    image:
      'https://images.unsplash.com/photo-1510812431401-41e2bd2724f3?w=900&q=80&auto=format&fit=crop',
    thumb:
      'https://images.unsplash.com/photo-1510812431401-41e2bd2724f3?w=200&q=80&auto=format&fit=crop',
    about:
      'Buổi chiều thưởng thức rượu vang hoàng hôn cùng những người bạn mới. Speed dating nhẹ nhàng sau phần tasting — phù hợp cặp đôi và người độc thân muốn kết nối chân thành.',
    schedule: [
      { time: '16:00', label: 'Đón khách & Welcome drink', icon: '🥂' },
      { time: '17:00', label: 'Thử rượu vang có hướng dẫn', icon: '🍷' },
      { time: '18:30', label: 'Speed dating 15 phút/vòng', icon: '💕' },
    ],
    spotsLeft: 8,
  },
  {
    id: 'abstract-art',
    title: 'Đêm tranh trừu tượng',
    category: 'workshop',
    premiumOnly: false,
    date: 'CN, 01/09',
    time: '19:00',
    location: 'Không gian nghệ thuật Quận 1, TP.HCM',
    address: 'Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    attendees: 28,
    image:
      'https://images.unsplash.com/photo-1460668261837-1dafb7a0d0b5?w=400&q=80&auto=format&fit=crop',
    thumb:
      'https://images.unsplash.com/photo-1460668261837-1dafb7a0d0b5?w=200&q=80&auto=format&fit=crop',
    soldOut: false,
  },
  {
    id: 'rooftop-jazz',
    title: 'Jazz trên sân thượng & Kết nối',
    category: 'dining',
    premiumOnly: false,
    date: 'T6, 06/09',
    time: '20:30',
    location: 'Sky Lounge, Quận 1, TP.HCM',
    address: 'Pasteur, Quận 1, TP. Hồ Chí Minh',
    attendees: 35,
    image:
      'https://images.unsplash.com/photo-1415201364774-f6f0ff38f28f?w=400&q=80&auto=format&fit=crop',
    thumb:
      'https://images.unsplash.com/photo-1415201364774-f6f0ff38f28f?w=200&q=80&auto=format&fit=crop',
    soldOut: true,
  },
]

export const HISTORY_EVENTS = [
  {
    id: 'pottery-workshop',
    title: 'Workshop gốm & Cà phê thủ công',
    date: '12/07/2024',
    location: 'Quận 3, TP.HCM',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80&auto=format&fit=crop',
    rated: true,
    canRebook: true,
  },
  {
    id: 'sunset-picnic',
    title: 'Picnic ngắm hoàng hôn bãi biển',
    date: '28/06/2024',
    location: 'Sơn Trà, Đà Nẵng',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&q=80&auto=format&fit=crop',
    rated: false,
    canRebook: false,
  },
]

export const PREMIUM_PLANS = [
  { id: 'monthly', label: 'Hàng tháng', price: '299k', per: '/tháng', badge: null },
  { id: '6months', label: '6 tháng', price: '215k', per: '/tháng', badge: 'PHỔ BIẾN NHẤT', popular: true },
  { id: 'yearly', label: '12 tháng', price: '165k', per: '/tháng', badge: 'GIÁ TỐT NHẤT' },
]

export const PREMIUM_FEATURES = [
  { icon: '✨', text: 'Ghép đôi AI ưu tiên — tăng match có ý nghĩa' },
  { icon: '👀', text: 'Xem ai đã thích bạn' },
  { icon: '♾️', text: 'Giới thiệu không giới hạn mỗi ngày' },
  { icon: '🕶️', text: 'Chế độ ẩn danh khi khám phá' },
  { icon: '🎟️', text: 'Ưu tiên đăng ký sự kiện Premium' },
]

export function getEventById(id) {
  return EVENTS.find((e) => e.id === id)
}
