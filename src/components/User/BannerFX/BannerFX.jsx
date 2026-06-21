import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR = '.matches-hero, .liked-hero, .dp-hero, .daily-hero, .events-hero'

/**
 * Gắn hiệu ứng tương tác cho mọi banner dùng chung:
 *  - Nghiêng 3D theo vị trí con trỏ (parallax tilt).
 *  - Đèn spotlight bám theo chuột (qua biến CSS --mx/--my).
 * Chạy lại mỗi khi đổi route để bắt banner mới render.
 */
export default function BannerFX() {
  const { pathname } = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    // Đợi banner render xong
    const raf = requestAnimationFrame(() => {
      const banners = Array.from(document.querySelectorAll(SELECTOR))

      const onMove = (e) => {
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width   // 0..1
        const y = (e.clientY - r.top) / r.height   // 0..1
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
        el.style.setProperty('--tilt-x', `${((0.5 - y) * 9).toFixed(2)}deg`)
        el.style.setProperty('--tilt-y', `${((x - 0.5) * 12).toFixed(2)}deg`)
        el.style.setProperty('--px', `${((x - 0.5) * 22).toFixed(1)}px`)
        el.style.setProperty('--py', `${((y - 0.5) * 14).toFixed(1)}px`)
        el.classList.add('is-hovering')
      }
      const onLeave = (e) => {
        const el = e.currentTarget
        el.classList.remove('is-hovering')
        el.style.removeProperty('--tilt-x')
        el.style.removeProperty('--tilt-y')
        el.style.removeProperty('--px')
        el.style.removeProperty('--py')
      }

      banners.forEach((b) => {
        b.addEventListener('mousemove', onMove)
        b.addEventListener('mouseleave', onLeave)
        b._fxCleanup = () => {
          b.removeEventListener('mousemove', onMove)
          b.removeEventListener('mouseleave', onLeave)
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf)
      document.querySelectorAll(SELECTOR).forEach((b) => b._fxCleanup?.())
    }
  }, [pathname])

  return null
}
