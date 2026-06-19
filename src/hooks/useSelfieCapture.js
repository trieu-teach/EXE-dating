import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Selfie capture hook.
 *
 * Wraps `navigator.mediaDevices.getUserMedia` with a managed MediaStream
 * that is automatically stopped on unmount or when `stop()` is called.
 *
 * Returns a ref to attach to a `<video>` element, a `start()` function and
 * a `capture()` function that draws the current video frame to an offscreen
 * canvas and returns a JPEG `File`.
 *
 *   const { videoRef, status, error, start, stop, capture, restart } = useSelfieCapture()
 *
 *   useEffect(() => { start(); return () => stop() }, [])
 *
 *   const onShoot = async () => {
 *     const file = await capture()
 *     if (file) setPreview(file)
 *   }
 */
export function useSelfieCapture({ facingMode = 'user' } = {}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | requesting | live | error
  const [error, setError] = useState(null)

  const stop = useCallback(() => {
    const s = streamRef.current
    if (s) {
      s.getTracks().forEach((t) => {
        try { t.stop() } catch { /* ignore */ }
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null } catch { /* ignore */ }
    }
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Trình duyệt không hỗ trợ camera.')
      setStatus('error')
      return false
    }
    setError(null)
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try { await videoRef.current.play() } catch { /* autoplay may reject; UI handles it */ }
      }
      setStatus('live')
      return true
    } catch (err) {
      const name = err?.name || ''
      let message = 'Không truy cập được camera.'
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        message = 'Bạn đã từ chối quyền truy cập camera. Hãy bật quyền trong cài đặt trình duyệt.'
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        message = 'Không tìm thấy camera trên thiết bị.'
      } else if (name === 'NotReadableError') {
        message = 'Camera đang được ứng dụng khác sử dụng.'
      } else if (err?.message) {
        message = err.message
      }
      setError(message)
      setStatus('error')
      return false
    }
  }, [facingMode])

  const capture = useCallback(async () => {
    const video = videoRef.current
    if (!video || !streamRef.current) {
      setError('Camera chưa sẵn sàng.')
      return null
    }
    const width = video.videoWidth || 720
    const height = video.videoHeight || 720
    if (width === 0 || height === 0) {
      setError('Camera chưa load xong, hãy đợi một chút.')
      return null
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Trình duyệt không hỗ trợ canvas.')
      return null
    }
    ctx.drawImage(video, 0, 0, width, height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) {
      setError('Không tạo được ảnh từ camera.')
      return null
    }
    if (blob.size > 5 * 1024 * 1024) {
      setError('Ảnh vượt quá 5MB. Hãy chụp lại ở nơi đủ sáng.')
      return null
    }
    setError(null)
    return new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
  }, [])

  const restart = useCallback(async () => {
    stop()
    return start()
  }, [start, stop])

  // Cleanup on unmount so the camera light turns off.
  useEffect(() => stop, [stop])

  return { videoRef, status, error, start, stop, capture, restart }
}
