/**
 * Helpers for image upload UX (preview, compress, accept only images).
 */

/** Return true if the file looks like an image. */
export function isImage(file) {
  return Boolean(file && file.type && file.type.startsWith('image/'))
}

/** Convert a File into a data-URL preview. */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Read browser geolocation. Resolves with { latitude, longitude }. */
export function getCurrentPosition({ timeoutMs = 10_000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Trình duyệt không hỗ trợ định vị.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      (err) => reject(new Error(err.message || 'Không lấy được vị trí.')),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}

/** Camera capture helper. Resolves with a File. */
export async function captureFromCamera({ video = true } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Trình duyệt không hỗ trợ camera.')
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false })
  const videoEl = document.createElement('video')
  videoEl.srcObject = stream
  videoEl.muted = true
  await videoEl.play()
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth || 640
  canvas.height = videoEl.videoHeight || 480
  canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  stream.getTracks().forEach((t) => t.stop())
  return new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
}
