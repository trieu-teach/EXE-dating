import { useMemo } from 'react'
import {
  Heart, Star, Sparkles, Trophy, Target, Gift, PartyPopper,
  Coffee, Search, ShieldCheck, Settings, Ticket, UserRound, CalendarHeart,
} from 'lucide-react'
import './SideHearts.css'

// Tim tô đặc cho lớp xa (quầng sáng nền ấm) — đồng bộ mọi trang.
const HEART_PATH =
  'M12 21s-1.45-1.32-3.4-3.04C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.6 9.46C13.45 19.68 12 21 12 21z'

/* Icon chủ đề (nét gradient) cho lớp giữa / lớp trước theo từng trang */
const THEMES = {
  love: { mid: [Heart, Sparkles], front: [Heart, Heart] },
  matches: { mid: [Heart, Sparkles], front: [Heart, Heart] },
  profile: { mid: [Sparkles, Star], front: [UserRound, Sparkles] },
  reputation: { mid: [Star, Sparkles], front: [Trophy, Star] },
  tasks: { mid: [Sparkles, Star], front: [Target, Star] },
  daily: { mid: [Sparkles, Star], front: [Gift, CalendarHeart] },
  events: { mid: [Star, Sparkles], front: [PartyPopper, Star] },
  meetup: { mid: [Heart, Sparkles], front: [Coffee, Heart] },
  search: { mid: [Sparkles, Star], front: [Search, Heart] },
  verify: { mid: [Sparkles, Star], front: [ShieldCheck, Star] },
  settings: { mid: [Sparkles, Star], front: [Settings, Sparkles] },
  celebrate: { mid: [Star, Sparkles], front: [PartyPopper, Heart] },
  datepass: { mid: [Heart, Sparkles], front: [Ticket, Gift] },
}

// Màu thương hiệu đặc (không dùng gradient tham chiếu chéo để chắc chắn lên màu)
const COLORS = { pink: '#ff4f8b', purple: '#b14bff', mix: '#d657c6' }

const LEFT = [
  { layer: 'far', top: 22, left: 40, size: 300, grad: 'pink' },
  { layer: 'far', top: 74, left: 58, size: 320, grad: 'purple' },
  { layer: 'mid', top: 11, left: 44, size: 64, grad: 'mix' },
  { layer: 'front', top: 31, left: 64, size: 104, grad: 'pink' },
  { layer: 'mid', top: 51, left: 34, size: 58, grad: 'purple' },
  { layer: 'front', top: 71, left: 60, size: 112, grad: 'mix' },
  { layer: 'mid', top: 90, left: 40, size: 66, grad: 'pink' },
]
const RIGHT = [
  { layer: 'far', top: 24, left: 58, size: 312, grad: 'purple' },
  { layer: 'far', top: 78, left: 38, size: 292, grad: 'pink' },
  { layer: 'mid', top: 12, left: 54, size: 62, grad: 'mix' },
  { layer: 'front', top: 32, left: 34, size: 108, grad: 'purple' },
  { layer: 'mid', top: 52, left: 62, size: 58, grad: 'pink' },
  { layer: 'front', top: 72, left: 36, size: 114, grad: 'mix' },
  { layer: 'mid', top: 90, left: 58, size: 64, grad: 'purple' },
]

function build(items, preset, seed) {
  let mi = 0
  let fi = 0
  return items.map((cfg, i) => {
    const r = (n) => (Math.sin(seed * 99.7 + i * 12.3 + n * 4.1) + 1) / 2
    const driftY = cfg.layer === 'far' ? 10 : cfg.layer === 'mid' ? 16 : 22
    const duration = (cfg.layer === 'far' ? 18 : cfg.layer === 'mid' ? 14 : 11) + r(4) * 4
    let Icon = null
    if (cfg.layer === 'mid') Icon = preset.mid[mi++ % preset.mid.length]
    else if (cfg.layer === 'front') Icon = preset.front[fi++ % preset.front.length]
    return { ...cfg, id: `${seed}-${i}`, Icon, driftY, duration, delay: -(r(5) * 8).toFixed(2) }
  })
}

export default function SideHearts({ theme = 'love', gutter = 360 }) {
  const preset = THEMES[theme] || THEMES.love
  const left = useMemo(() => build(LEFT, preset, 1), [preset])
  const right = useMemo(() => build(RIGHT, preset, 2), [preset])

  const renderItem = (e) => {
    const color = COLORS[e.grad] || COLORS.pink
    const style = {
      top: `${e.top}%`,
      left: `${e.left}%`,
      animationDuration: `${e.duration}s`,
      animationDelay: `${e.delay}s`,
      '--drift-y': `${e.driftY}px`,
    }
    // Lớp xa: tim tô đặc mờ (quầng sáng nền)
    if (e.layer === 'far') {
      return (
        <svg key={e.id} className="sh-shape sh-far" width={e.size} height={e.size} viewBox="0 0 24 24" style={style}>
          <path d={HEART_PATH} fill={color} />
        </svg>
      )
    }
    // Lớp giữa / trước: icon chủ đề, TÔ ĐẶC màu thương hiệu (không để rỗng ruột)
    const Icon = e.Icon
    return (
      <Icon
        key={e.id}
        className={`sh-shape sh-${e.layer}`}
        size={e.size}
        strokeWidth={1.2}
        style={{ ...style, fill: color, stroke: color, strokeLinejoin: 'round' }}
      />
    )
  }

  return (
    <div className="sh-sides" aria-hidden style={{ '--content-half': `${gutter}px` }}>
      <div className="sh-col sh-col-left">{left.map(renderItem)}</div>
      <div className="sh-col sh-col-right">{right.map(renderItem)}</div>
    </div>
  )
}
