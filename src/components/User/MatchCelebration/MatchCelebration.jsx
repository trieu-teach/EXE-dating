import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chatService } from '../../../api'
import { useToast } from '../../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../../utils/format.js'
import { HeartIcon } from '../../ui/CustomIcons.jsx'
import './MatchCelebration.css'

const firstPhoto = (p) => {
  const list = Array.isArray(p?.photos) ? [...p.photos] : []
  list.sort((a, b) => (b.isPrimary === true) - (a.isPrimary === true))
  const url = list[0]?.url || p?.avatarUrl
  return url ? resolveImageUrl(url) : null
}

/**
 * Popup "Đã ghép đôi!" dùng chung cho mọi nơi có thể match (Discovery, Lượt thích, Match...).
 * match: { other: hồ sơ người kia, matchId } | null — null thì không hiện gì.
 */
export default function MatchCelebration({ match, onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [opening, setOpening] = useState(false)

  const openChat = async () => {
    if (!match?.matchId || opening) return
    setOpening(true)
    try {
      const conv = await chatService.byMatch(match.matchId)
      onClose?.()
      navigate(`/chat/${conv.id || conv.conversationId}`)
    } catch (err) {
      toast.error(err?.message || 'Không mở được cuộc trò chuyện.')
    } finally {
      setOpening(false)
    }
  }

  return (
    <AnimatePresence>
      {match && (
        <motion.div className="match-fs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div className="match-pop"
            initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}>
            {/* Hạt bay: tim hồng + chấm kim tuyến vàng, lặp vô hạn */}
            <div className="mfs-float-layer" aria-hidden="true">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className={`mfs-float${i % 3 === 0 ? ' is-dot' : ''}`}
                  style={{
                    left: `${(i * 137 + 29) % 100}%`,
                    fontSize: `${26 + ((i * 53) % 38)}px`,
                    animationDelay: `${((i * 0.37) % 2.5).toFixed(2)}s`,
                    animationDuration: `${(2.4 + (i % 4) * 0.7).toFixed(1)}s`,
                    '--sway': `${((i % 7) - 3) * 22}px`,
                  }}
                >
                  {i % 3 === 0 ? '●' : '♥'}
                </span>
              ))}
            </div>

            <motion.div
              className="mfs-content"
              initial={{ opacity: 0, y: 44, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.08 }}
            >
              <motion.div className="mfs-avatar-wrap" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 15, delay: 0.22 }}>
                <div className="mfs-avatar" style={firstPhoto(match.other) ? { backgroundImage: `url(${firstPhoto(match.other)})` } : undefined}>
                  {!firstPhoto(match.other) && <span>{(match.other?.displayName || '?').charAt(0).toUpperCase()}</span>}
                </div>
                <span className="mfs-avatar-heart"><HeartIcon size={18} /></span>
              </motion.div>

              <h1 className="mfs-title">Bạn và {match.other?.displayName} đã ghép đôi!</h1>
              <p className="mfs-sub">Cả hai đã thích nhau. Đừng ngại, hãy chào hỏi trước nhé!</p>

              <div className="mfs-actions">
                <button type="button" className="mfs-btn mfs-btn-primary" onClick={openChat} disabled={opening}>
                  {opening ? <span className="spinner" /> : 'Nhắn tin ngay'}
                </button>
                <button type="button" className="mfs-btn mfs-btn-ghost" onClick={onClose}>
                  Tiếp tục khám phá
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
