/**
 * Shared constants for the gamification subsystem
 * (Tasks + Inventory + Love Tree).
 *
 * Material → watering bonus percent (must stay in sync with backend).
 * Levels  → special milestones that unlock bonus rewards.
 */

export const MATERIAL_META = {
  Water:      { emoji: '💧', label: 'Nước',       color: '#2563eb', bg: '#dbeafe' },
  Sun:        { emoji: '☀️', label: 'Nắng',       color: '#d97706', bg: '#fdecc4' },
  Fertilizer: { emoji: '🌿', label: 'Phân bón',   color: '#15803d', bg: '#d6f2df' },
}

export const MATERIALS = ['Water', 'Sun', 'Fertilizer']

export const MATERIAL_BONUS = {
  Water: 5,
  Sun: 12,
  Fertilizer: 25,
}

export const LEVEL_MILESTONES = [5, 10, 20, 50]

export const TASK_TYPE_META = {
  Daily:        { label: 'Hằng ngày',  emoji: '☀️',  accent: 'rgba(245, 158, 11, 0.10)' },
  Weekly:       { label: 'Hằng tuần',  emoji: '📅',  accent: 'rgba(37, 99, 235, 0.10)'  },
  Achievement:  { label: 'Thành tựu',  emoji: '🏆',  accent: 'rgba(22, 163, 74, 0.10)'  },
}

export const TASK_TYPE_ORDER = ['Daily', 'Weekly', 'Achievement']

/**
 * Map a level to the closest "tree stage" emoji. Tiers:
 *   1-2  🌱
 *   3-5  🌿
 *   6-10 🌳
 *   11-20🌸
 *   21+  💖
 */
export function treeEmojiForLevel(level) {
  if (level >= 21) return '💖'
  if (level >= 11) return '🌸'
  if (level >= 6)  return '🌳'
  if (level >= 3)  return '🌿'
  return '🌱'
}

/**
 * Map a level to a growth color for the progress ring/fill.
 */
export function growthColorForLevel(level) {
  if (level >= 21) return '#e91e63'
  if (level >= 11) return '#ec4899'
  if (level >= 6)  return '#16a34a'
  if (level >= 3)  return '#22c55e'
  return '#84cc16'
}
