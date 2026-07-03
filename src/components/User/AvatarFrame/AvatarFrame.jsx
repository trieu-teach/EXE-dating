import { Children, cloneElement, useEffect, useRef } from 'react'
import './AvatarFrame.css'

const INTENSITY = { sm: 0.55, md: 0.8, lg: 1.1, xl: 1.4 }

/** Ngôi sao lấp lánh 4 cánh (kim cương lõm) — dùng cho băng + hoàng kim. */
const drawStar = (ctx, x, y, s, fill) => {
  ctx.beginPath()
  ctx.moveTo(x, y - s)
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x + s, y)
  ctx.quadraticCurveTo(x + s * 0.12, y + s * 0.12, x, y + s)
  ctx.quadraticCurveTo(x - s * 0.12, y + s * 0.12, x - s, y)
  ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.12, x, y - s)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

/**
 * Lửa canvas kiểu game: dàn "lưỡi lửa" liền khối liếm từ đáy ảnh lên (vẽ bezier teardrop
 * 2 lớp — vỏ cam-đỏ + lõi trắng nóng), phía trên là tàn lửa nhỏ bay lên. Additive blending
 * để các lưỡi chồng nhau tự cộng sáng thành biển lửa.
 */
function FireCanvas({ intensity = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined

    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    const tongues = [] // lưỡi lửa cố định dọc đáy, chỉ nhấp nhô — tạo thành "giường lửa" liền khối
    const sparks = []  // tàn lửa nhỏ bay lên

    const initTongues = () => {
      tongues.length = 0
      const n = Math.max(7, Math.round(w / 22))
      for (let i = 0; i <= n; i++) {
        tongues.push({
          x: (i / n) * w + (Math.random() - 0.5) * (w / n) * 0.6,
          halfW: (w / n) * (0.75 + Math.random() * 0.55),
          hMax: (h * 0.14 + Math.random() * h * 0.14) * intensity,
          phase: Math.random() * Math.PI * 2,
          speed: 2 + Math.random() * 2.6,
          violet: Math.random() < 0.1, // vài lưỡi ánh tím "ma thuật"
        })
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initTongues()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Vẽ 1 lưỡi lửa hình giọt: chân bám đáy, thân cong, chóp nhọn lắc theo gió
    const drawTongue = (x, halfW, height, sway, grad) => {
      const y0 = h + 2
      ctx.beginPath()
      ctx.moveTo(x - halfW, y0)
      ctx.bezierCurveTo(
        x - halfW * 0.9, y0 - height * 0.42,
        x + sway * 0.5 - halfW * 0.42, y0 - height * 0.78,
        x + sway, y0 - height,
      )
      ctx.bezierCurveTo(
        x + sway * 0.5 + halfW * 0.42, y0 - height * 0.78,
        x + halfW * 0.9, y0 - height * 0.42,
        x + halfW, y0,
      )
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
    }

    const tongueGrad = (height, hueBase, alpha) => {
      const g = ctx.createLinearGradient(0, h, 0, h - height)
      g.addColorStop(0, `hsla(${hueBase + 30}, 100%, 72%, ${alpha})`)        // chân: vàng chói
      g.addColorStop(0.4, `hsla(${hueBase + 10}, 100%, 55%, ${alpha * 0.85})`) // thân: cam rực
      g.addColorStop(0.8, `hsla(${hueBase - 8}, 100%, 45%, ${alpha * 0.45})`)  // gần chóp: đỏ
      g.addColorStop(1, `hsla(${hueBase - 12}, 100%, 40%, 0)`)               // chóp: tan vào không khí
      return g
    }

    const spawnSpark = (t) => {
      const src = tongues[Math.floor(Math.random() * tongues.length)]
      if (!src) return
      const violet = Math.random() < 0.08
      sparks.push({
        x: src.x + (Math.random() - 0.5) * src.halfW,
        y: h - src.hMax * (0.5 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.9 + Math.random() * 1.8),
        size: 1.2 + Math.random() * 2.2, // tàn lửa NHỎ — đốm sáng, không phải bóng bokeh
        life: 1,
        decay: 0.012 + Math.random() * 0.022,
        hue: violet ? 285 : 30 + Math.random() * 25,
        flicker: t + Math.random() * Math.PI * 2,
      })
    }

    const step = (now) => {
      const t = now / 1000
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      // Quầng than hồng sát đáy — nền cho cả giường lửa
      const bedH = h * 0.22 * intensity
      const bed = ctx.createLinearGradient(0, h, 0, h - bedH)
      bed.addColorStop(0, `rgba(255, 120, 0, ${0.5 + 0.12 * Math.sin(t * 9)})`)
      bed.addColorStop(1, 'rgba(255, 60, 0, 0)')
      ctx.fillStyle = bed
      ctx.fillRect(0, h - bedH, w, bedH)

      // Lưỡi lửa: vỏ ngoài đỏ-cam to + lõi trắng-vàng nhỏ nóng hơn ở trong
      for (const tg of tongues) {
        const flick = 0.72 + 0.28 * Math.sin(t * tg.speed + tg.phase)
        const jitter = 0.88 + 0.12 * Math.sin(t * 8.3 + tg.phase * 3.1)
        const height = tg.hMax * flick * jitter
        const sway = Math.sin(t * tg.speed * 0.7 + tg.phase) * tg.halfW * 0.55
        const hue = tg.violet ? 275 : 18
        drawTongue(tg.x, tg.halfW, height, sway, tongueGrad(height, hue, 0.7))
        drawTongue(tg.x, tg.halfW * 0.5, height * 0.62, sway * 0.8, tongueGrad(height * 0.62, hue + 18, 0.9))
      }

      // Tàn lửa bay lên
      if (sparks.length < Math.round(18 * intensity)) spawnSpark(t)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        p.x += p.vx + Math.sin(t * 6 + p.flicker) * 0.4
        p.y += p.vy
        p.life -= p.decay
        if (p.life <= 0 || p.y < 0) { sparks.splice(i, 1); continue }
        const tw = 0.55 + 0.45 * Math.sin(t * 14 + p.flicker) // nhấp nháy như tàn lửa thật
        ctx.fillStyle = `hsla(${p.hue + 20 * p.life}, 100%, ${55 + 30 * p.life}%, ${p.life * tw})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.4 + p.life * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [intensity])

  return <canvas ref={ref} className="avatar-frame-fx-canvas" />
}

/** Băng: nhũ băng nhọn hoắt rủ từ mép trên + tuyết rơi + sương lạnh dưới đáy + ánh lấp lánh. */
function makeIce(w, h, intensity) {
  const flakes = Array.from({ length: Math.round(16 * intensity) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vy: 0.35 + Math.random() * 0.75,
    sway: Math.random() * Math.PI * 2,
    size: 1 + Math.random() * 1.8,
  }))
  const layers = [
    { amp: 0.17 * h * intensity, a: 0.8, c0: '191, 219, 254', c1: '125, 211, 252', k: 0.05, seed: 0 },
    { amp: 0.11 * h * intensity, a: 0.92, c0: '240, 249, 255', c1: '186, 230, 253', k: 0.085, seed: 50 },
  ]
  return (ctx, t) => {
    // sương lạnh phảng phất dưới đáy
    const mistH = h * 0.2 * intensity
    const mist = ctx.createLinearGradient(0, h, 0, h - mistH)
    mist.addColorStop(0, `rgba(186, 230, 253, ${0.3 + 0.08 * Math.sin(t * 1.6)})`)
    mist.addColorStop(1, 'rgba(186, 230, 253, 0)')
    ctx.fillStyle = mist
    ctx.fillRect(0, h - mistH, w, mistH)

    // nhũ băng 2 lớp rủ từ mép trên — gần như tĩnh, chỉ lung linh rất chậm
    for (const L of layers) {
      const g = ctx.createLinearGradient(0, 0, 0, L.amp * 1.15)
      g.addColorStop(0, `rgba(${L.c0}, ${L.a})`)
      g.addColorStop(1, `rgba(${L.c1}, 0.06)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(-2, -2)
      for (let x = 0; x <= w; x += 3) {
        const v =
          0.55 * Math.sin(x * L.k + L.seed) +
          0.3 * Math.sin(x * L.k * 2.7 + L.seed * 2) +
          0.15 * Math.sin(x * L.k * 0.6 + t * 0.25)
        const p = (0.5 + 0.5 * v) ** 3 // mũ 3 → chóp nhũ băng nhọn, kẽ răng thưa
        ctx.lineTo(x, L.amp * (0.16 + 0.84 * p))
      }
      ctx.lineTo(w + 2, -2)
      ctx.closePath()
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'lighter'
    // tia lấp lánh loé lên trên nhũ băng
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.7 + i * 1.7) % 3
      if (ph < 1) {
        const x = (i * 227 + 61) % w
        const y = 8 + ((i * 83) % Math.max(10, h * 0.12))
        drawStar(ctx, x, y, 5 * Math.sin(ph * Math.PI) + 2, `rgba(255, 255, 255, ${0.85 * Math.sin(ph * Math.PI)})`)
      }
    }
    // tuyết rơi lững lờ
    for (const f of flakes) {
      f.y += f.vy
      f.sway += 0.02
      f.x += Math.sin(f.sway) * 0.4
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w }
      ctx.fillStyle = `rgba(224, 242, 254, ${0.5 + 0.4 * Math.sin(f.sway * 3)})`
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }
}

/** Hoàng kim: hào quang vương giả + dải sáng ánh kim quét chéo + bụi vàng và sao lấp lánh. */
function makeGold(w, h, intensity) {
  const dust = Array.from({ length: Math.round(14 * intensity) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vy: -(0.12 + Math.random() * 0.3),
    ph: Math.random() * Math.PI * 2,
    size: 0.8 + Math.random() * 1.6,
  }))
  const diag = Math.sqrt(w * w + h * h)
  return (ctx, t) => {
    // hào quang vàng phập phồng dưới đáy
    const glowH = h * 0.24 * intensity
    const glow = ctx.createLinearGradient(0, h, 0, h - glowH)
    glow.addColorStop(0, `rgba(234, 179, 8, ${0.32 + 0.1 * Math.sin(t * 1.3)})`)
    glow.addColorStop(1, 'rgba(234, 179, 8, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, h - glowH, w, glowH)

    ctx.globalCompositeOperation = 'lighter'
    // dải sáng ánh kim quét chéo qua ảnh theo chu kỳ — hiệu ứng "skin huyền thoại"
    const pos = ((t * 0.35) % 1.6) - 0.3
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(-Math.PI / 5)
    const bx = (pos - 0.5) * diag
    const band = ctx.createLinearGradient(bx - diag * 0.09, 0, bx + diag * 0.09, 0)
    band.addColorStop(0, 'rgba(255, 236, 170, 0)')
    band.addColorStop(0.5, 'rgba(255, 240, 190, 0.28)')
    band.addColorStop(1, 'rgba(255, 236, 170, 0)')
    ctx.fillStyle = band
    ctx.fillRect(-diag, -diag, diag * 2, diag * 2)
    ctx.restore()

    // bụi vàng bay lên lười biếng
    for (const d of dust) {
      d.y += d.vy
      d.ph += 0.03
      if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w }
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(d.ph * 2.2))
      ctx.fillStyle = `rgba(253, 224, 130, ${0.75 * tw})`
      ctx.beginPath()
      ctx.arc(d.x + Math.sin(d.ph) * 6, d.y, d.size, 0, Math.PI * 2)
      ctx.fill()
    }
    // sao 4 cánh loé sáng rồi tắt
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.9 + i * 0.9) % 2.4
      if (ph < 1) {
        const x = (i * 173 + 37) % w
        const y = (i * 131 + 71) % h
        drawStar(ctx, x, y, 6 * Math.sin(ph * Math.PI) + 2, `rgba(255, 246, 200, ${0.9 * Math.sin(ph * Math.PI)})`)
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  }
}

/** Điện: tia sét răng cưa giật quanh 4 mép ảnh — vỏ glow màu + lõi trắng, loé lên rồi tắt. */
function makeElectric(w, h, intensity) {
  const bolts = []
  let nextAt = 0

  const genBolt = (t) => {
    const edge = Math.floor(Math.random() * 4)
    const along = Math.random()
    const segs = 5 + Math.floor(Math.random() * 5)
    const pts = []
    let x
    let y
    let dx
    let dy
    if (edge === 0) { x = along * w; y = 5; dx = 1; dy = 0 }
    else if (edge === 1) { x = w - 5; y = along * h; dx = 0; dy = 1 }
    else if (edge === 2) { x = along * w; y = h - 5; dx = -1; dy = 0 }
    else { x = 5; y = along * h; dx = 0; dy = -1 }
    pts.push([x, y])
    const step = 9 + Math.random() * 16
    for (let i = 0; i < segs; i++) {
      x += dx * step + (Math.random() - 0.5) * 8 + dy * (Math.random() - 0.5) * 26
      y += dy * step + (Math.random() - 0.5) * 8 + dx * (Math.random() - 0.5) * 26
      pts.push([x, y])
    }
    bolts.push({ pts, born: t, ttl: 0.1 + Math.random() * 0.14, hue: Math.random() < 0.55 ? 265 : 195 })
  }

  return (ctx, t) => {
    if (t >= nextAt) {
      genBolt(t)
      if (Math.random() < 0.5 * intensity) genBolt(t)
      nextAt = t + 0.1 + Math.random() * (0.5 / intensity)
    }
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]
      const a = 1 - (t - b.born) / b.ttl
      if (a <= 0) { bolts.splice(i, 1); continue }
      const trace = () => {
        ctx.beginPath()
        ctx.moveTo(b.pts[0][0], b.pts[0][1])
        for (let j = 1; j < b.pts.length; j++) ctx.lineTo(b.pts[j][0], b.pts[j][1])
        ctx.stroke()
      }
      ctx.strokeStyle = `hsla(${b.hue}, 100%, 65%, ${0.3 * a})`
      ctx.lineWidth = 5
      trace()
      ctx.strokeStyle = `hsla(${b.hue}, 100%, 75%, ${0.65 * a})`
      ctx.lineWidth = 2
      trace()
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * a})`
      ctx.lineWidth = 0.9
      trace()
      // đốm loé ở đầu tia
      const [ex, ey] = b.pts[b.pts.length - 1]
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * a})`
      ctx.beginPath()
      ctx.arc(ex, ey, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }
}

const MAKERS = { ice: makeIce, gold: makeGold, electric: makeElectric }

/** Canvas chung cho băng/hoàng kim/điện — renderer được dựng lại mỗi lần resize. */
function EffectCanvas({ theme, intensity = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined

    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    let draw = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw = MAKERS[theme]?.(w, h, intensity)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const step = (now) => {
      ctx.clearRect(0, 0, w, h)
      draw?.(ctx, now / 1000)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [theme, intensity])

  return <canvas ref={ref} className="avatar-frame-fx-canvas" />
}

/**
 * Phủ hiệu ứng động (lửa/băng/vàng/điện) NGAY BÊN TRONG phần tử avatar/ảnh được bọc.
 * Dùng cloneElement để chèn overlay làm con của chính phần tử đó — luôn khớp khít
 * kích thước, bo góc và bị cắt theo overflow của phần tử gốc, không bao giờ lệch ra ngoài.
 * frame: 'Fire' | 'Ice' | 'Gold' | 'Electric' | null (không khung — trả thẳng children).
 */
export default function AvatarFrame({ frame, size = 'md', children }) {
  if (!frame) return children

  const child = Children.only(children)
  const theme = frame.toLowerCase()
  const intensity = INTENSITY[size] || 0.8

  const fx = (
    <span key="avatar-frame-fx" className={`avatar-frame-fx avatar-frame-fx-${theme} avatar-frame-fx-${size}`} aria-hidden="true">
      {theme === 'fire'
        ? <FireCanvas intensity={intensity} />
        : <EffectCanvas theme={theme} intensity={intensity} />}
    </span>
  )

  return cloneElement(child, {
    className: `${child.props.className || ''} avatar-frame-host avatar-frame-host-${theme}`.trim(),
    children: (
      <>
        {child.props.children}
        {fx}
      </>
    ),
  })
}
