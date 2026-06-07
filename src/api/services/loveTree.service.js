import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'
import {
  applyTreeCare,
  getDefaultCareActions,
  getLoveTreeState,
  loveTreeToDisplayState,
} from '../../utils/loveTreeState.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export const loveTreeService = {
  async getState(partnerId = 'linh') {
    return withMockFallback(
      () => get(`${API_ENDPOINTS.loveTree.state}?partnerId=${partnerId}`),
      async () => {
        await delay()
        const tree = getLoveTreeState(partnerId)
        const display = loveTreeToDisplayState(tree)
        return {
          partnerId,
          level: tree.level,
          maxLevel: display.maxLevel,
          levelLabel: display.stageLabel,
          attachmentPercent: tree.attachmentPercent,
          xpToNext: 100 - tree.attachmentPercent,
          careActions: getDefaultCareActions(),
          milestones: [
            { id: 1, title: 'Mầm non đầu tiên', date: '12/10/2023', unlocked: true },
            { id: 2, title: 'Tỏa sáng trọn vẹn', need: 'Cấp 7', unlocked: tree.level >= 7 },
          ],
        }
      },
    )
  },

  async care(actionId, partnerId = 'linh') {
    return withMockFallback(
      () => post(API_ENDPOINTS.loveTree.care, { actionId, partnerId }),
      async () => {
        const result = applyTreeCare(partnerId, actionId)
        return { success: true, ...result }
      },
    )
  },

  async getLevelUp(partnerId = 'linh') {
    return withMockFallback(
      () => get(`${API_ENDPOINTS.loveTree.levelUp}?partnerId=${partnerId}`),
      async () => {
        await delay()
        const tree = getLoveTreeState(partnerId)
        return {
          partnerId,
          level: tree.level,
          rewards: [
            { icon: '🔥', title: '+50 điểm lửa' },
            { icon: '☀️', title: 'Mở khóa "Gửi Lời Chúc Sáng Mai"' },
          ],
        }
      },
    )
  },
}
