/**
 * Lớp hiệu ứng cho banner: nhiều emoji bay + tia sáng quét.
 * Render bằng React (đặt làm con trực tiếp của banner) nên không bị xoá khi re-render.
 * Truyền `emojis` = mảng emoji theo chủ đề của banner đó.
 */
const POS = [
  { top: '12%', left: '5%',  size: '30px', delay: '0s',   dur: '6s' },
  { top: '58%', left: '10%', size: '24px', delay: '0.7s', dur: '5.2s' },
  { top: '74%', left: '20%', size: '20px', delay: '1.4s', dur: '6.6s' },
  { top: '20%', left: '24%', size: '26px', delay: '1.0s', dur: '5.6s' },
  { top: '66%', left: '34%', size: '22px', delay: '0.3s', dur: '6.2s' },
  { top: '16%', left: '46%', size: '20px', delay: '1.7s', dur: '5.8s' },
  { top: '70%', left: '56%', size: '26px', delay: '0.5s', dur: '6.8s' },
  { top: '22%', left: '66%', size: '24px', delay: '1.2s', dur: '5.4s' },
  { top: '60%', left: '76%', size: '22px', delay: '0.9s', dur: '6.4s' },
  { top: '18%', left: '84%', size: '30px', delay: '0.2s', dur: '5.9s' },
  { top: '72%', left: '90%', size: '24px', delay: '1.5s', dur: '6.1s' },
  { top: '40%', left: '95%', size: '20px', delay: '0.6s', dur: '6.7s' },
]

export default function HeroFX({ emojis = ['💕'] }) {
  return (
    <>
      <i className="hero-shine" aria-hidden="true" />
      {POS.map((p, i) => (
        <span
          key={i}
          className="hero-emoji"
          aria-hidden="true"
          style={{ top: p.top, left: p.left, fontSize: p.size, '--delay': p.delay, '--dur': p.dur }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
    </>
  )
}
