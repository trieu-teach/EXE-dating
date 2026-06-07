const MAX_EDGE = 1200
const JPEG_QUALITY = 0.82

export function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Vui lòng chọn file ảnh (JPG, PNG, WEBP…)'))
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Ảnh không được lớn hơn 12MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Không đọc được file ảnh'))
    reader.readAsDataURL(file)
  })
}

export async function compressImageDataUrl(dataUrl) {
  const img = await loadImage(dataUrl)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export async function fileToStoredPreview(file) {
  const raw = await readImageFileAsDataUrl(file)
  const dataUrl = await compressImageDataUrl(raw)
  return { preview: dataUrl, dataUrl, remoteUrl: null, source: 'device' }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Không xử lý được ảnh'))
    img.src = src
  })
}
