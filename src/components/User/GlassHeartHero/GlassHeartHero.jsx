import './GlassHeartHero.css'

/**
 * Decorative-only premium 3D glass heart illustration for hero sections.
 * Main heart (with baked-in glow + orbit ring) is /assets/big-heart1.png;
 * small floating hearts around it are /assets/small-heart.png repeated at
 * different sizes/blur/opacity to fake depth.
 */
const MINI_HEARTS = [
  { s: 34, top: '2%',   left: '4%',   o: 0.55, b: 0,   dur: '6.5s', delay: '0s' },
  { s: 56, top: '10%',  right: '2%',  o: 0.8,  b: 0,   dur: '7.5s', delay: '.6s' },
  { s: 24, top: '46%',  right: '-4%', o: 0.4,  b: 2,   dur: '8s',   delay: '1.2s' },
  { s: 44, bottom: '20%', right: '10%', o: 0.7, b: 0,  dur: '6s',   delay: '.3s' },
  { s: 64, bottom: '-6%', left: '14%', o: 0.28, b: 4,  dur: '9s',   delay: '1.8s' },
  { s: 26, top: '38%',  left: '2%',   o: 0.5,  b: 1,   dur: '7s',   delay: '.9s' },
  { s: 78, top: '-10%', left: '30%',  o: 0.18, b: 6,   dur: '10s',  delay: '.2s' },
]

export default function GlassHeartHero() {
  return (
    <div className="ghh-wrap" aria-hidden="true">
      {MINI_HEARTS.map((h, i) => (
        <img
          key={i}
          className="ghh-mini"
          src="/assets/small-heart.png"
          alt=""
          style={{
            width: h.s, height: h.s,
            top: h.top, left: h.left, right: h.right, bottom: h.bottom,
            '--o': h.o, '--b': `${h.b}px`, '--dur': h.dur, '--delay': h.delay,
          }}
        />
      ))}

      <img className="ghh-image" src="/assets/big-heart1.png" alt="" />
    </div>
  )
}
