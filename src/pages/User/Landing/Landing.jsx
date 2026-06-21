import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparkleIcon, TreeIcon, HeartIcon, XIcon, CheckIcon,
} from '../../../components/ui/CustomIcons.jsx'
import './Landing.css'

const NAV = [
  { label: 'Cách hoạt động', href: '#how' },
  { label: 'Cây tình yêu', href: '#lovetree' },
  { label: 'Ưu đãi', href: '#datepass' },
  { label: 'An toàn', href: '#safety' },
]

/* Ảnh người thật cho mockup swipe */
const SWIPE_PROFILES = [
  { name: 'Mai', age: 24, img: 'https://i.pravatar.cc/600?img=45' },
  { name: 'Linh', age: 23, img: 'https://i.pravatar.cc/600?img=47' },
  { name: 'Hà', age: 25, img: 'https://i.pravatar.cc/600?img=49' },
  { name: 'Nam', age: 27, img: 'https://i.pravatar.cc/600?img=12' },
  { name: 'Khoa', age: 28, img: 'https://i.pravatar.cc/600?img=33' },
]

const STEPS = [
  { n: '1', title: 'Tạo hồ sơ', desc: 'Đăng ảnh & xác minh khuôn mặt — hồ sơ thật, an tâm kết nối.' },
  { n: '2', title: 'Vuốt & Match', desc: 'Thích người bạn ưng. Hợp nhau là match ngay tức thì.' },
  { n: '3', title: 'Hẹn hò thật', desc: 'Chăm Cây tình yêu, đặt combo ưu đãi và gặp nhau ngoài đời.' },
]

/* Ảnh cây thật trong app + mốc cấp độ */
const TREE_STAGES = [
  { lv: 1, img: '/assets/love-tree/tree-stage-seedling.png', name: 'Mầm xanh' },
  { lv: 4, img: '/assets/love-tree/tree-stage-sparse.png', name: 'Mở khóa Hẹn hò', unlock: true },
  { lv: 11, img: '/assets/love-tree/tree-stage-blooming.png', name: 'Đơm hoa' },
  { lv: 21, img: '/assets/love-tree/cherry-tree-premium.png', name: 'Vĩnh cửu' },
]

/* Logo thương hiệu thật từ Clearbit Logo API (free, không cần key) */
const BRANDS = [
  { name: 'Starbucks', domain: 'starbucks.com' },
  { name: 'Highlands Coffee', domain: 'highlandscoffee.com.vn' },
  { name: 'The Coffee House', domain: 'thecoffeehouse.com' },
  { name: "Pizza 4P's", domain: 'pizza4ps.com' },
  { name: 'KFC', domain: 'kfc.com' },
  { name: 'CGV Cinemas', domain: 'cgv.vn' },
  { name: 'Phúc Long', domain: 'phuclong.com.vn' },
  { name: 'Lotteria', domain: 'lotteria.vn' },
]

function BrandLogo({ domain, name }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="lp-brand">
      <div className="lp-brand-logo">
        {ok ? (
          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} alt={name} loading="lazy"
            onError={() => setOk(false)} />
        ) : (
          <span className="lp-brand-fallback">{name.charAt(0)}</span>
        )}
      </div>
      <span className="lp-brand-name">{name}</span>
    </div>
  )
}

export default function Landing() {
  // Mockup swipe: ảnh người tự đổi liên tục
  const [si, setSi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSi((i) => (i + 1) % SWIPE_PROFILES.length), 2600)
    return () => clearInterval(t)
  }, [])
  const sp = SWIPE_PROFILES[si]

  return (
    <div className="lp-root">
      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <Link to="/" className="lp-logo">SameMess</Link>
          <nav className="lp-nav">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="lp-nav-link">{n.label}</a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <Link to="/login" className="lp-signin-ghost">Đăng nhập</Link>
            <Link to="/register" className="lp-signin">Tạo tài khoản</Link>
          </div>
        </div>
      </header>

      {/* ── Hero: wordmark khổng lồ lấp toàn màn ── */}
      <section className="lp-hero">
        <motion.h1 className="lp-hero-wordmark"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          SameMess
        </motion.h1>
      </section>

      {/* ── Cách hoạt động: mockup swipe ── */}
      <section className="lp-how" id="how">
        <div className="lp-how-text">
          <span className="lp-brands-eyebrow"><SparkleIcon size={13} /> Cách hoạt động</span>
          <h2>Tìm nửa kia chỉ trong vài bước</h2>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <div className="lp-step" key={s.n}>
                <span className="lp-step-num">{s.n}</span>
                <div>
                  <div className="lp-step-title">{s.title}</div>
                  <p className="lp-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/register" className="lp-btn lp-btn-dark">Bắt đầu ngay</Link>
        </div>

        <motion.div
          className="lp-screen"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="lp-screen-bar">
            <span className="lp-screen-dots">
              <span className="lp-screen-dot" style={{ background: '#ff5f57' }} />
              <span className="lp-screen-dot" style={{ background: '#febc2e' }} />
              <span className="lp-screen-dot" style={{ background: '#28c840' }} />
            </span>
            <span className="lp-screen-url">samemess.app/discovery</span>
          </div>
          <div className="lp-screen-body">
            <div className="lp-screen-card-wrap">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={sp.img}
                  className="lp-screen-card"
                  style={{ backgroundImage: `url(${sp.img})` }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <span className="lp-screen-name">{sp.name}, {sp.age}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="lp-screen-actions">
              <span className="lp-screen-btn lp-screen-pass"><XIcon size={20} /></span>
              <span className="lp-screen-btn lp-screen-like"><HeartIcon size={22} /></span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Cây tình yêu ── */}
      <section className="lp-mission" id="lovetree">
        <div className="lp-mission-text">
          <span className="lp-brands-eyebrow"><TreeIcon size={13} /> Tính năng độc đáo</span>
          <h2>Cùng nhau chăm sóc Cây tình yêu 🌳</h2>
          <p>Mỗi cặp đôi sau khi match sẽ có chung một cái cây. Tưới nước mỗi ngày để cây lớn lên, lên cấp và mở khóa đặc quyền hẹn hò.</p>
          <Link to="/register" className="lp-btn lp-btn-dark">Trồng cây ngay</Link>
        </div>
        <div className="lp-tree-grid">
          {TREE_STAGES.map((t, i) => (
            <motion.div
              key={t.lv}
              className={`lp-tree-card${t.unlock ? ' is-unlock' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="lp-tree-img"><img src={t.img} alt={t.name} loading="lazy" /></div>
              <span className="lp-tree-lv">Cấp {t.lv}</span>
              <span className="lp-tree-name">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Safety ── */}
      <section className="lp-safety" id="safety">
        <span className="lp-brands-eyebrow"><CheckIcon size={13} /> An toàn</span>
        <div className="lp-safety-card">
          <div className="lp-safety-photo" style={{ backgroundImage: 'url(https://i.pravatar.cc/600?img=32)' }}>
            <span className="lp-safety-badge"><CheckIcon size={12} /> Đã xác minh</span>
          </div>
        </div>
        <h2>An toàn là ưu tiên hàng đầu</h2>
        <p>Xác minh khuôn mặt, kiểm duyệt tin nhắn bằng AI và hệ thống uy tín giúp cộng đồng SameMess luôn lành mạnh, đáng tin.</p>
      </section>

      {/* ── Voucher thương hiệu lớn ── */}
      <section className="lp-brands-section" id="datepass">
        <div className="lp-brands-head">
          <span className="lp-brands-eyebrow"><SparkleIcon size={13} /> Ưu đãi hẹn hò</span>
          <h2>Combo ưu đãi tại các thương hiệu lớn</h2>
          <p>Sau khi match, đặt combo tại quán đối tác — Starbucks, Highlands, Pizza 4P's và nhiều hơn nữa. Nhận voucher qua email, ra quán chỉ cần đưa mã QR cho cả hai.</p>
        </div>
        <div className="lp-brands-marquee">
          <div className="lp-brands-track">
            {[...BRANDS, ...BRANDS].map((b, i) => <BrandLogo key={i} {...b} />)}
          </div>
        </div>
        <div className="lp-brands-cta">
          <Link to="/register" className="lp-btn lp-btn-dark">Khám phá ưu đãi</Link>
        </div>
      </section>

    </div>
  )
}
