/**
 * Toast queue context — used to surface server errors, success messages
 * and the "session expired" event.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

let nextId = 1

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setItems((cur) => cur.filter((t) => t.id !== id))
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback((toast) => {
    const id = nextId++
    const item = {
      id,
      tone: toast.tone ?? 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration ?? 3500,
    }
    setItems((cur) => [...cur, item])
    if (item.duration > 0) {
      const handle = setTimeout(() => dismiss(id), item.duration)
      timers.current.set(id, handle)
    }
    return id
  }, [dismiss])

  useEffect(() => {
    const onSessionExpired = () => push({
      tone: 'warn',
      title: 'Phiên đăng nhập đã hết hạn',
      message: 'Vui lòng đăng nhập lại để tiếp tục.',
      duration: 6000,
    })
    const onProfileIncomplete = () => push({
      tone: 'info',
      title: 'Hoàn thiện hồ sơ',
      message: 'Bạn cần bổ sung ảnh, giới tính, ngày sinh và vị trí để dùng tính năng này.',
    })
    window.addEventListener('samemess:session-expired', onSessionExpired)
    window.addEventListener('samemess:profile-incomplete', onProfileIncomplete)
    return () => {
      window.removeEventListener('samemess:session-expired', onSessionExpired)
      window.removeEventListener('samemess:profile-incomplete', onProfileIncomplete)
    }
  }, [push])

  const api = useMemo(() => ({
    items,
    push,
    dismiss,
    success: (msg, opts) => push({ ...opts, tone: 'success', message: msg }),
    error: (msg, opts) => push({ ...opts, tone: 'error', message: msg, duration: 5000 }),
    info: (msg, opts) => push({ ...opts, tone: 'info', message: msg }),
    warn: (msg, opts) => push({ ...opts, tone: 'warn', message: msg }),
  }), [items, push, dismiss])

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
