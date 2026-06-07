/** Nhóm sở thích preset — "Khác" dùng cho tag tùy chỉnh của user */
export const INTEREST_GROUPS = {
  'Nghệ thuật': ['Hội họa', 'Âm nhạc', 'Nhiếp ảnh', 'Điện ảnh', 'Bảo tàng'],
  'Thể thao': ['Yoga', 'Chạy bộ', 'Bơi lội', 'Tennis', 'Golf'],
  'Ẩm thực': ['Cà phê', 'Nấu ăn', 'Rượu vang', 'Làm bánh'],
  'Du lịch': ['Biển', 'Leo núi', 'Khám phá'],
  'Công nghệ': ['AI', 'Lập trình', 'Game'],
}

export const OTHER_INTERESTS_GROUP = 'Khác'

export const GROUP_ICONS = {
  'Nghệ thuật': '🎭',
  'Thể thao': '🏃',
  'Ẩm thực': '🍽️',
  'Du lịch': '✈️',
  'Công nghệ': '💻',
  [OTHER_INTERESTS_GROUP]: '✨',
}

export const TAG_ICONS = {
  'Hội họa': '🎨',
  'Âm nhạc': '🎵',
  'Nhiếp ảnh': '📷',
  'Điện ảnh': '🎬',
  'Bảo tàng': '🏛️',
  Yoga: '🧘',
  'Chạy bộ': '👟',
  'Bơi lội': '🏊',
  Tennis: '🎾',
  Golf: '⛳',
  'Cà phê': '☕',
  'Nấu ăn': '🍳',
  'Rượu vang': '🍷',
  'Làm bánh': '🧁',
  Biển: '🏖️',
  'Leo núi': '⛰️',
  'Khám phá': '🧭',
  AI: '🤖',
  'Lập trình': '⌨️',
  Game: '🎮',
}

/** Tag nhanh trên Search (map sang label lọc API) */
export const SEARCH_PRESET_TAGS = [
  { id: 'music', label: 'Âm nhạc', icon: '🎵' },
  { id: 'art', label: 'Nghệ thuật', icon: '🎨' },
  { id: 'hiking', label: 'Leo núi', icon: '⛰️' },
]

export const DEFAULT_SELECTED_INTERESTS = ['Hội họa', 'Chạy bộ', 'Cà phê', 'Leo núi']

export function interestTagId(label) {
  return `interest-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
}

export function iconForTag(label) {
  return TAG_ICONS[label] ?? '✨'
}

export function getAllPresetTags() {
  return Object.values(INTEREST_GROUPS).flat()
}

export function isOtherInterest(label, customInterests = []) {
  if (customInterests.includes(label)) return true
  return !getAllPresetTags().includes(label)
}
