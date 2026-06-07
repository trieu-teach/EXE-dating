import {
  LOVE_TREE_STAGE_LABELS,
  LOVE_TREE_STAGES,
  MAX_LOVE_LEVEL,
} from '../components/User/LoveTreeScene/LoveTreeScene.jsx'

const STORAGE_KEY = 'samemess_love_trees'

/** Demo — cây đã chăm với từng match */
const DEMO_TREES = {
  linh: { level: 4, attachmentPercent: 45 },
  minh: { level: 3, attachmentPercent: 72 },
  thao: { level: 2, attachmentPercent: 30 },
}

export const DATE_INVITE_MIN_LEVEL = 4
export const DATE_INVITE_MIN_ATTACHMENT = 40

const DEFAULT_CARE_ACTIONS = [
  { id: 'water', icon: '💧', label: 'Tưới nước', points: 3 },
  { id: 'sun', icon: '☀️', label: 'Gửi nắng', points: 5 },
  { id: 'love', icon: '💗', label: 'Bón yêu', points: 5 },
]

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function normalizeState(raw = {}) {
  const level = Math.min(MAX_LOVE_LEVEL, Math.max(1, Number(raw.level) || 1))
  const attachmentPercent = Math.min(100, Math.max(0, Number(raw.attachmentPercent) || 0))
  return { level, attachmentPercent }
}

export function getLoveTreeState(conversationId) {
  if (!conversationId) return { level: 1, attachmentPercent: 0 }

  const store = readAll()
  const saved = normalizeState(store[conversationId])
  const demo = DEMO_TREES[conversationId]

  if (!demo) return saved

  const demoLevel = demo.level
  const demoAttach = demo.attachmentPercent
  if (saved.level > demoLevel || (saved.level === demoLevel && saved.attachmentPercent >= demoAttach)) {
    return saved
  }
  return { level: demoLevel, attachmentPercent: demoAttach }
}

export function saveLoveTreeState(conversationId, state) {
  const store = readAll()
  store[conversationId] = normalizeState(state)
  writeAll(store)
  return store[conversationId]
}

export function loveTreeToDisplayState(tree = { level: 1, attachmentPercent: 0 }) {
  const { level, attachmentPercent } = normalizeState(tree)
  const stageKey = LOVE_TREE_STAGES[Math.min(level - 1, LOVE_TREE_STAGES.length - 1)]

  return {
    level,
    maxLevel: MAX_LOVE_LEVEL,
    attachmentPercent,
    stageKey,
    stageLabel: LOVE_TREE_STAGE_LABELS[stageKey],
  }
}

export function canSuggestDateFromTree(tree) {
  const { level, attachmentPercent } = normalizeState(tree)
  if (level > DATE_INVITE_MIN_LEVEL) return true
  return level >= DATE_INVITE_MIN_LEVEL && attachmentPercent >= DATE_INVITE_MIN_ATTACHMENT
}

/** Áp dụng hành động chăm cây — cùng logic trang Love Tree */
export function applyTreeCare(conversationId, actionId, careActions = DEFAULT_CARE_ACTIONS) {
  const current = getLoveTreeState(conversationId)
  const action = careActions.find((c) => c.id === actionId)
  const points = action?.points ?? 3

  if (
    current.level >= MAX_LOVE_LEVEL &&
    current.attachmentPercent >= 100
  ) {
    return { state: current, evolved: false, complete: true, points }
  }

  const nextAttach = current.attachmentPercent + points
  const atFinal = current.level >= MAX_LOVE_LEVEL

  if (nextAttach >= 100 && !atFinal) {
    const state = saveLoveTreeState(conversationId, {
      level: Math.min(MAX_LOVE_LEVEL, current.level + 1),
      attachmentPercent: 0,
    })
    return { state, evolved: true, complete: false, points }
  }

  if (nextAttach >= 100 && atFinal) {
    const state = saveLoveTreeState(conversationId, { level: MAX_LOVE_LEVEL, attachmentPercent: 100 })
    return { state, evolved: false, complete: true, points }
  }

  const state = saveLoveTreeState(conversationId, {
    level: current.level,
    attachmentPercent: nextAttach,
  })
  return { state, evolved: false, complete: false, points }
}

export function getDefaultCareActions() {
  return DEFAULT_CARE_ACTIONS
}
