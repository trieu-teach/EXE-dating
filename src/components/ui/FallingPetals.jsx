import { useMemo } from 'react'
import './FallingPetals.css'

const EMOJIS = ['🌸'] // hoa anh đào hồng — trùng tông màu app

/**
 * Hiệu ứng hoa/cánh hoa rơi nền — nhẹ, thuần CSS, không chặn tương tác.
 * @param {number} count số cánh hoa (mặc định 16)
 */
export default function FallingPetals({ count = 16 }) {
  const petals = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 9 + Math.random() * 9,
      delay: -Math.random() * 18,
      size: 13 + Math.random() * 16,
      drift: (Math.random() * 80 - 40).toFixed(0),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    })),
    [count],
  )

  return (
    <div className="petals" aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
