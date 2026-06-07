import { DEFAULT_AVATAR } from '../data/imageLibrary.js'
import { getUser, saveUser } from './session.js'

export function normalizePhotoEntry(entry, index = 0) {
  if (!entry) return null
  if (typeof entry === 'string') {
    return {
      id: `photo-${index}`,
      preview: entry,
      remoteUrl: entry,
      source: 'library',
    }
  }
  return {
    id: entry.id ?? `photo-${index}`,
    preview: entry.preview ?? entry.remoteUrl ?? entry.dataUrl,
    remoteUrl: entry.remoteUrl ?? null,
    dataUrl: entry.dataUrl ?? null,
    source: entry.source ?? 'library',
  }
}

export function getProfilePhotos() {
  const user = getUser()
  const raw = user?.profilePhotos ?? []
  return raw.map(normalizePhotoEntry).filter(Boolean)
}

export function getAvatarUrl() {
  const user = getUser()
  if (user?.avatarUrl) return user.avatarUrl
  const photos = getProfilePhotos()
  return photos[0]?.preview ?? DEFAULT_AVATAR
}

export function persistProfilePhotos(photos) {
  const normalized = photos
    .filter(Boolean)
    .map((p, i) => ({
      id: p.id ?? `photo-${i}`,
      preview: p.preview,
      remoteUrl: p.remoteUrl ?? null,
      dataUrl: p.dataUrl ?? null,
      source: p.source ?? 'library',
    }))

  const avatarUrl = normalized[0]?.preview ?? null

  saveUser({
    profilePhotos: normalized,
    avatarUrl,
    photoCount: normalized.length,
    profile: {
      ...(getUser()?.profile ?? {}),
      photo: avatarUrl,
    },
  })

  return normalized
}

export function createEmptyPhotoSlots(max = 6) {
  return Array.from({ length: max }, () => null)
}

export function photosToSlotArray(photos, max = 6) {
  const slots = createEmptyPhotoSlots(max)
  photos.forEach((photo, i) => {
    if (i < max) slots[i] = photo
  })
  return slots
}
