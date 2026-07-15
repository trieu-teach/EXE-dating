// Ảnh nền riêng theo thương hiệu — dùng chung giữa DatePass, MeetupSection và Chat
// (chọn quán / chia sẻ địa điểm) để đồng nhất hình ảnh thương hiệu trong toàn app.
const BRAND_BG = [
  { match: /cgv/i, src: '/assets/cgv.png' },
  { match: /gong\s?cha/i, src: '/assets/gong-cha.png' },
  { match: /haidilao/i, src: '/assets/hadilao.png' },
  { match: /highlands/i, src: '/assets/highland.png' },
  { match: /kfc/i, src: '/assets/kfc.png' },
  { match: /katinat/i, src: '/assets/katinat.png' },
  { match: /ph[uú]c\s?long/i, src: '/assets/phuclong.png' },
  { match: /pizza\s?4p/i, src: '/assets/pizza.png' },
  { match: /starbucks/i, src: '/assets/start.png' },
  { match: /coffee\s?house/i, src: '/assets/house.png' },
]

export function brandBg(venueName) {
  return BRAND_BG.find((b) => b.match.test(venueName || ''))?.src
}
