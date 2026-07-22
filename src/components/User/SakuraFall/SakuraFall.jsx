import { useMemo } from 'react'
import './SakuraFall.css'

const COUNT = 24

/**
 * Hoa anh đào rơi — overlay toàn trang (pointer-events: none, không chặn thao tác).
 * Mỗi cánh có vị trí/tốc độ/độ lắc ngẫu nhiên; delay ÂM để cánh hoa đã rải đều
 * khắp màn hình ngay khi trang mở (không phải chờ rơi từ mép trên xuống).
 */
export default function SakuraFall() {
  const petals = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      left: Math.random() * 100,             // vị trí ngang (%)
      size: 9 + Math.random() * 8,           // 9–17px
      fall: 6 + Math.random() * 5,           // thời gian rơi 6–11s (nhanh)
      delay: -(Math.random() * 11),          // âm → phân bố đều từ đầu
      sway: 2.6 + Math.random() * 2.6,       // chu kỳ lắc ngang
      swayDelay: -(Math.random() * 5),
      opacity: 0.8 + Math.random() * 0.2,
      hue: i % 3,
    })), [])

  return (
    <div className="sakura-layer" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="sakura-fall"
          style={{ left: `${p.left}%`, animationDuration: `${p.fall}s`, animationDelay: `${p.delay}s` }}
        >
          <span
            className={`sakura-petal sakura-hue-${p.hue}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size * 0.85}px`,
              opacity: p.opacity,
              animationDuration: `${p.sway}s`,
              animationDelay: `${p.swayDelay}s`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
