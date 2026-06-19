import { useToast } from '../../../context/ToastContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import './ToastViewport.css'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warn: AlertTriangle,
  info: Info,
}

export default function ToastViewport() {
  const { items, dismiss } = useToast()
  if (!items?.length) return null
  return (
    <div className="toast-portal" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {items.map((t) => {
          const Icon = icons[t.tone] || Info
          return (
            <motion.div
              key={t.id}
              className={`toast toast-${t.tone}`}
              role="status"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => dismiss(t.id)}
            >
              <div className="toast-icon">
                <Icon size={16} />
              </div>
              <div className="toast-content">
                {t.title && <div className="toast-title">{t.title}</div>}
                {t.message && <div className="toast-message">{t.message}</div>}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
